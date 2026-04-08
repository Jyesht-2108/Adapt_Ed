"""AdaptEd FastAPI backend - Member 1 Phase 1 implementation."""
import hashlib
import json
import uuid
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from supabase import AsyncClient

from config import settings
from database import init_supabase, close_supabase, get_supabase
from ai_client import init_groq_client, get_groq_client
from retrieval import search_for_topic
from langgraph_agent import generate_curriculum_with_langgraph, stream_curriculum_generation
from models import (
    CurriculumGenerateRequest,
    CurriculumGenerateResponse,
    SandboxHintRequest,
    SandboxHintResponse,
    ProgressUpdateRequest,
    ProgressResponse,
    LessonResponse,
    NotesResponse,
    CurriculumContent,
    Module,
    Lesson,
    LessonSource,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    await init_supabase()
    init_groq_client()
    yield
    # Shutdown
    await close_supabase()


app = FastAPI(
    title="AdaptEd API",
    description="AI-driven personalized learning platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Utility functions
def normalize_goal(goal: str) -> str:
    """Normalize a goal string for hashing."""
    return goal.lower().strip()


def hash_goal(goal: str) -> str:
    """Generate SHA-256 hash of normalized goal."""
    normalized = normalize_goal(goal)
    return hashlib.sha256(normalized.encode()).hexdigest()


# Root endpoint
@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "AdaptEd API",
        "version": "1.0.0",
        "status": "healthy"
    }


# Phase 3: POST /curriculum/generate (with LangGraph)
@app.post("/api/v1/curriculum/generate", response_model=CurriculumGenerateResponse)
async def generate_curriculum(
    request: CurriculumGenerateRequest,
    db: AsyncClient = Depends(get_supabase)
):
    """
    Initiate curriculum generation with LangGraph agent.
    
    Checks cache first, then triggers LangGraph pipeline if needed.
    """
    # Check cache first
    goal_hash_value = hash_goal(request.goal)
    
    try:
        result = await db.table("lessons").select("id, hit_count").eq("goal_hash", goal_hash_value).execute()
        
        if result.data and len(result.data) > 0:
            # Cache hit - increment hit counter
            lesson_id = result.data[0]["id"]
            await db.table("lessons").update({
                "hit_count": result.data[0].get("hit_count", 0) + 1
            }).eq("id", lesson_id).execute()
            
            return CurriculumGenerateResponse(
                generation_id=lesson_id,
                cached=True
            )
    except Exception as e:
        print(f"Cache lookup error: {e}")
    
    # Cache miss - generate new lesson ID and trigger generation
    lesson_id = f"les_{uuid.uuid4().hex[:12]}"
    
    # Store generation request in background
    # The actual generation will happen via the stream endpoint
    
    return CurriculumGenerateResponse(
        generation_id=lesson_id,
        cached=False
    )


# Phase 3: SSE streaming endpoint (with LangGraph)
@app.get("/api/v1/curriculum/stream/{generation_id}")
async def stream_curriculum(
    generation_id: str,
    goal: str,
    session_id: str,
    db: AsyncClient = Depends(get_supabase)
):
    """
    SSE stream for curriculum generation progress using LangGraph.
    
    Executes the full 4-node LangGraph pipeline and streams progress.
    """
    async def event_generator():
        """Generate SSE events."""
        try:
            # Check if this is a cached lesson
            if generation_id.startswith("les_"):
                # Try to fetch from cache
                result = await db.table("lessons").select("*").eq("id", generation_id).execute()
                if result.data and len(result.data) > 0:
                    yield {
                        "event": "complete",
                        "data": json.dumps({"lesson_id": generation_id, "cached": True})
                    }
                    return
            
            # Not cached - run LangGraph generation
            goal_hash_value = hash_goal(goal)
            final_state = None
            
            # Execute LangGraph with streaming
            async for event_type, data in stream_curriculum_generation(
                goal=goal,
                goal_hash=goal_hash_value,
                session_id=session_id
            ):
                if event_type == "state":
                    # Final state - don't send as event, store it
                    final_state = data
                else:
                    # Send progress events
                    yield {
                        "event": event_type,
                        "data": json.dumps(data)
                    }
            
            if final_state is None:
                raise Exception("Generation completed but no final state received")
            
            # Store in database
            lesson_data = {
                "id": generation_id,
                "goal_hash": goal_hash_value,
                "goal_raw": goal,
                "content": final_state["formatted_curriculum"],
                "notes": final_state["notes"],
                "sources": final_state["sources"],
                "hit_count": 0
            }
            
            await db.table("lessons").insert(lesson_data).execute()
            
            # Send completion event
            yield {
                "event": "complete",
                "data": json.dumps({
                    "lesson_id": generation_id,
                    "cached": False,
                    "sources_count": len(final_state["sources"]),
                    "modules_count": len(final_state["formatted_curriculum"].get("modules", []))
                })
            }
            
        except Exception as e:
            print(f"Stream error: {e}")
            import traceback
            traceback.print_exc()
            yield {
                "event": "error",
                "data": json.dumps({"message": f"Generation failed: {str(e)}", "fatal": True})
            }
    
    return EventSourceResponse(event_generator())


# GET /curriculum/{lesson_id}
@app.get("/api/v1/curriculum/{lesson_id}", response_model=LessonResponse)
async def get_curriculum(
    lesson_id: str,
    db: AsyncClient = Depends(get_supabase)
):
    """Fetch a fully generated lesson from cache."""
    from sandbox import detect_sandbox_mode
    
    try:
        result = await db.table("lessons").select("*").eq("id", lesson_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        lesson_data = result.data[0]
        
        # Member 2: Auto-detect sandbox mode and language
        sandbox_mode, sandbox_language = detect_sandbox_mode(lesson_data["goal_raw"])
        
        return LessonResponse(
            id=lesson_data["id"],
            goal_raw=lesson_data["goal_raw"],
            content=lesson_data["content"],
            notes=lesson_data.get("notes"),
            sources=lesson_data.get("sources", []),
            created_at=lesson_data["created_at"],
            sandbox_mode=sandbox_mode,
            sandbox_language=sandbox_language
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# GET /curriculum/{lesson_id}/notes
@app.get("/api/v1/curriculum/{lesson_id}/notes", response_model=NotesResponse)
async def get_lesson_notes(
    lesson_id: str,
    db: AsyncClient = Depends(get_supabase)
):
    """Get auto-generated study notes for a lesson."""
    try:
        result = await db.table("lessons").select("notes").eq("id", lesson_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        notes = result.data[0].get("notes", "")
        
        return NotesResponse(markdown=notes or "")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Phase 1 Task 6: Session endpoints
@app.get("/api/v1/session/{session_id}/progress", response_model=ProgressResponse)
async def get_session_progress(
    session_id: str,
    db: AsyncClient = Depends(get_supabase)
):
    """Get all curriculums and completion state for a session."""
    try:
        # Ensure session exists
        session_result = await db.table("sessions").select("id").eq("id", session_id).execute()
        
        if not session_result.data or len(session_result.data) == 0:
            # Create session if it doesn't exist
            await db.table("sessions").insert({"id": session_id}).execute()
        
        # Get progress entries
        progress_result = await db.table("progress").select(
            "lesson_id, viewed_nodes, updated_at"
        ).eq("session_id", session_id).execute()
        
        curriculums = []
        
        for entry in progress_result.data:
            # Fetch lesson details
            lesson_result = await db.table("lessons").select(
                "goal_raw, content"
            ).eq("id", entry["lesson_id"]).execute()
            
            if lesson_result.data and len(lesson_result.data) > 0:
                lesson = lesson_result.data[0]
                content = lesson.get("content", {})
                
                # Calculate completion percentage
                total_lessons = sum(
                    len(module.get("lessons", [])) 
                    for module in content.get("modules", [])
                )
                viewed_count = len(entry.get("viewed_nodes", []))
                completion_pct = (viewed_count / total_lessons * 100) if total_lessons > 0 else 0
                
                curriculums.append({
                    "lesson_id": entry["lesson_id"],
                    "goal": lesson["goal_raw"],
                    "completion_pct": completion_pct,
                    "last_accessed": entry["updated_at"]
                })
        
        return ProgressResponse(curriculums=curriculums)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/api/v1/session/{session_id}/progress")
async def update_session_progress(
    session_id: str,
    request: ProgressUpdateRequest,
    db: AsyncClient = Depends(get_supabase)
):
    """Update lesson completion state."""
    try:
        # Ensure session exists
        session_result = await db.table("sessions").select("id").eq("id", session_id).execute()
        
        if not session_result.data or len(session_result.data) == 0:
            await db.table("sessions").insert({"id": session_id}).execute()
        
        # Get or create progress entry
        progress_result = await db.table("progress").select("*").eq(
            "session_id", session_id
        ).eq("lesson_id", request.lesson_id).execute()
        
        node_id = f"{request.module_index}-{request.lesson_index}"
        
        if progress_result.data and len(progress_result.data) > 0:
            # Update existing
            progress = progress_result.data[0]
            viewed_nodes = progress.get("viewed_nodes", [])
            
            if request.viewed and node_id not in viewed_nodes:
                viewed_nodes.append(node_id)
            
            await db.table("progress").update({
                "viewed_nodes": viewed_nodes,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", progress["id"]).execute()
        else:
            # Create new
            await db.table("progress").insert({
                "session_id": session_id,
                "lesson_id": request.lesson_id,
                "viewed_nodes": [node_id] if request.viewed else [],
                "hint_counts": {}
            }).execute()
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Member 2: Sandbox endpoint with Socratic agent
@app.post("/api/v1/sandbox/hint", response_model=SandboxHintResponse)
async def get_sandbox_hint(
    request: SandboxHintRequest,
    db: AsyncClient = Depends(get_supabase)
):
    """
    Get a Socratic hint from the MCP agent.
    
    Member 2 Phase 1: Full implementation with anti-jailbreak guards.
    """
    from sandbox import handle_sandbox_hint
    
    try:
        return await handle_sandbox_hint(request, db)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating hint: {str(e)}"
        )


# Phase 2: Retrieval test endpoint
@app.get("/api/v1/retrieval/test")
async def test_retrieval(query: str, include_youtube: bool = True):
    """
    Test endpoint for retrieval system.
    
    Query params:
        query: Search query
        include_youtube: Whether to include YouTube results (default: true)
    """
    try:
        results = await search_for_topic(query, include_youtube=include_youtube)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
