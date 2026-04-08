"""Sandbox endpoint logic - Member 2 Phase 1."""
from fastapi import Depends, HTTPException
from supabase import AsyncClient

from database import get_supabase
from models import SandboxHintRequest, SandboxHintResponse
from mcp_agent import generate_socratic_hint, get_lesson_context


async def handle_sandbox_hint(
    request: SandboxHintRequest,
    db: AsyncClient
) -> SandboxHintResponse:
    """
    Handle sandbox hint request with Socratic agent.
    
    Args:
        request: The hint request
        db: Supabase client
        
    Returns:
        SandboxHintResponse with hint, type, and attempt count
    """
    # Fetch lesson context
    lesson_topic, lesson_objective = await get_lesson_context(
        request.lesson_id,
        request.module_index,
        request.lesson_index,
        db
    )
    
    # Generate Socratic hint
    hint_text, hint_type = await generate_socratic_hint(
        lesson_topic=lesson_topic,
        lesson_objective=lesson_objective,
        user_content=request.user_content,
        mode=request.mode,
        language=request.language,
        attempt_count=request.attempt_count
    )
    
    # Increment attempt count
    new_attempt_count = request.attempt_count + 1
    
    # Update hint count in database
    try:
        await update_hint_count(
            db,
            request.lesson_id,
            request.module_index,
            request.lesson_index,
            new_attempt_count
        )
    except Exception as e:
        print(f"Error updating hint count: {e}")
        # Don't fail the request if hint count update fails
    
    # Check if reflect prompt should be triggered (5+ hints)
    reflect = new_attempt_count >= 5
    
    return SandboxHintResponse(
        hint=hint_text,
        hint_type=hint_type,
        attempt_count=new_attempt_count,
        reflect=reflect
    )


async def update_hint_count(
    db: AsyncClient,
    lesson_id: str,
    module_index: int,
    lesson_index: int,
    count: int
):
    """
    Update hint count in progress table.
    
    Args:
        db: Supabase client
        lesson_id: Lesson ID
        module_index: Module index
        lesson_index: Lesson index
        count: New hint count
    """
    node_id = f"{module_index}-{lesson_index}"
    
    # Find progress entry (we need session_id, but it's not in the request)
    # For now, we'll update all matching lesson_id entries
    # In production, session_id should be passed in the request
    
    result = await db.table("progress").select("*").eq("lesson_id", lesson_id).execute()
    
    if result.data and len(result.data) > 0:
        for progress in result.data:
            hint_counts = progress.get("hint_counts", {})
            hint_counts[node_id] = count
            
            await db.table("progress").update({
                "hint_counts": hint_counts
            }).eq("id", progress["id"]).execute()


def detect_sandbox_mode(lesson_topic: str) -> tuple[str, str | None]:
    """
    Auto-detect sandbox mode and language from lesson topic.
    
    Args:
        lesson_topic: The lesson topic/goal
        
    Returns:
        Tuple of (mode, language)
    """
    topic_lower = lesson_topic.lower()
    
    # Programming language keywords
    code_keywords = {
        "python": "python",
        "javascript": "javascript",
        "typescript": "typescript",
        "java": "java",
        "c++": "cpp",
        "c#": "csharp",
        "ruby": "ruby",
        "go": "go",
        "rust": "rust",
        "sql": "sql",
        "html": "html",
        "css": "css",
        "php": "php",
        "swift": "swift",
        "kotlin": "kotlin",
        "fastapi": "python",
        "react": "javascript",
        "node": "javascript",
        "django": "python",
        "flask": "python",
        "api": "python",  # Default to Python for API topics
        "backend": "python",
        "frontend": "javascript",
    }
    
    # Check for code-related keywords
    for keyword, language in code_keywords.items():
        if keyword in topic_lower:
            return "code", language
    
    # Check for explicit programming terms
    programming_terms = [
        "code", "coding", "program", "function", "algorithm",
        "data structure", "loop", "variable", "class", "object"
    ]
    
    for term in programming_terms:
        if term in topic_lower:
            return "code", "python"  # Default to Python
    
    # Default to text mode for conceptual topics
    return "text", None
