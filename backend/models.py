"""Pydantic models for request/response validation."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# Request models
class CurriculumGenerateRequest(BaseModel):
    """Request to generate a new curriculum."""
    goal: str = Field(..., min_length=10, max_length=300)
    session_id: str


class SandboxHintRequest(BaseModel):
    """Request for a Socratic hint in the sandbox."""
    lesson_id: str
    module_index: int
    lesson_index: int
    user_content: str
    mode: Literal["code", "text"]
    language: str | None = None
    attempt_count: int = 0


class ProgressUpdateRequest(BaseModel):
    """Request to update lesson progress."""
    lesson_id: str
    module_index: int
    lesson_index: int
    viewed: bool


# Response models
class CurriculumGenerateResponse(BaseModel):
    """Response from curriculum generation initiation."""
    generation_id: str
    cached: bool


class SandboxHintResponse(BaseModel):
    """Response containing a Socratic hint."""
    hint: str
    hint_type: Literal["direction", "question", "observation"]
    attempt_count: int
    reflect: bool = False


class LessonSource(BaseModel):
    """A source citation for a lesson."""
    title: str
    url: str


class Lesson(BaseModel):
    """A single lesson within a module."""
    title: str
    content: str
    sources: list[LessonSource] = []


class Module(BaseModel):
    """A module containing multiple lessons."""
    title: str
    lessons: list[Lesson]


class CurriculumContent(BaseModel):
    """Full curriculum content structure."""
    goal: str
    modules: list[Module]
    key_takeaways: list[str] = []


class LessonResponse(BaseModel):
    """Response for a full lesson."""
    id: str
    goal_raw: str
    content: CurriculumContent
    notes: str | None = None
    sources: list[LessonSource] = []
    created_at: datetime
    sandbox_mode: Literal["code", "text"] | None = None
    sandbox_language: str | None = None


class NotesResponse(BaseModel):
    """Response for lesson notes."""
    markdown: str


class ProgressEntry(BaseModel):
    """A curriculum progress entry."""
    lesson_id: str
    goal: str
    completion_pct: float
    last_accessed: datetime


class ProgressResponse(BaseModel):
    """Response for session progress."""
    curriculums: list[ProgressEntry]
