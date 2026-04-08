"""Groq API client setup."""
from openai import AsyncOpenAI

from config import settings


# Global Groq client
groq_client: AsyncOpenAI | None = None


def init_groq_client() -> AsyncOpenAI:
    """Initialize Groq client using OpenAI SDK."""
    global groq_client
    groq_client = AsyncOpenAI(
        api_key=settings.groq_api_key,
        base_url=settings.groq_base_url
    )
    return groq_client


def get_groq_client() -> AsyncOpenAI:
    """Get the Groq client instance."""
    if groq_client is None:
        raise RuntimeError("Groq client not initialized")
    return groq_client
