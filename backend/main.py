"""AdaptEd FastAPI backend - Member 1 Phase 1 implementation."""
import hashlib
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


# Phase 1 Task 4: POST /curriculum/generate (stub)
@app.post("/api/v1/curriculum/generate", response_model=CurriculumGenerateResponse)
async def generate_curriculum(
    request: CurriculumGenerateRequest,
    db: AsyncClient = Depends(get_supabase)
):
    """
    Initiate curriculum generation.
    
    Phase 1: Returns stub response with generation_id.
    Phase 3: Will integrate LangGraph agent.
    """
    # Check cache first
    goal_hash_value = hash_goal(request.goal)
    
    try:
        result = await db.table("lessons").select("id").eq("goal_hash", goal_hash_value).execute()
        
        if result.data and len(result.data) > 0:
            # Cache hit
            return CurriculumGenerateResponse(
                generation_id=result.data[0]["id"],
                cached=True
            )
    except Exception as e:
        print(f"Cache lookup error: {e}")
    
    # Cache miss - generate new ID
    generation_id = f"gen_{uuid.uuid4().hex[:12]}"
    
    return CurriculumGenerateResponse(
        generation_id=generation_id,
        cached=False
    )


# Phase 1 Task 5: SSE streaming endpoint
@app.get("/api/v1/curriculum/stream/{generation_id}")
async def stream_curriculum(generation_id: str):
    """
    SSE stream for curriculum generation progress.
    
    Phase 1: Emits stub events.
    Phase 3: Will stream real LangGraph progress.
    """
    async def event_generator():
        """Generate SSE events."""
        # Stub implementation - emit sample events
        yield {
            "event": "status",
            "data": '{"message": "Planning your learning path...", "step": 1, "total_steps": 4}'
        }
        
        yield {
            "event": "status",
            "data": '{"message": "Searching for resources...", "step": 2, "total_steps": 4}'
        }
        
        yield {
            "event": "status",
            "data": '{"message": "Synthesizing curriculum...", "step": 3, "total_steps": 4}'
        }
        
        yield {
            "event": "chunk",
            "data": '{"content": "## Module 1: Introduction\\n\\n", "module_index": 0}'
        }
        
        yield {
            "event": "complete",
            "data": f'{{"lesson_id": "{generation_id}", "cached": false}}'
        }
    
    return EventSourceResponse(event_generator())


# GET /curriculum/{lesson_id}
@app.get("/api/v1/curriculum/{lesson_id}", response_model=LessonResponse)
async def get_curriculum(
    lesson_id: str,
    db: AsyncClient = Depends(get_supabase)
):
    """Fetch a fully generated lesson from cache."""
    try:
        result = await db.table("lessons").select("*").eq("id", lesson_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        lesson_data = result.data[0]
        
        return LessonResponse(
            id=lesson_data["id"],
            goal_raw=lesson_data["goal_raw"],
            content=lesson_data["content"],
            notes=lesson_data.get("notes"),
            sources=lesson_data.get("sources", []),
            created_at=lesson_data["created_at"],
            sandbox_mode=None,  # Will be set by Member 2
            sandbox_language=None
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


# Placeholder for Member 2's sandbox endpoint
@app.post("/api/v1/sandbox/hint", response_model=SandboxHintResponse)
async def get_sandbox_hint(request: SandboxHintRequest):
    """
    Placeholder for Member 2's Socratic hint endpoint.
    
    Member 2 will implement the full MCP agent logic here.
    """
    return SandboxHintResponse(
        hint="This endpoint will be implemented by Member 2",
        hint_type="direction",
        attempt_count=request.attempt_count + 1,
        reflect=False
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
