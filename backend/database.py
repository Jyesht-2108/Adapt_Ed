"""Supabase database client and dependencies."""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from supabase import AsyncClient, acreate_client

from config import settings


# Global Supabase client
supabase_client: AsyncClient | None = None


async def init_supabase() -> AsyncClient:
    """Initialize Supabase async client."""
    global supabase_client
    supabase_client = await acreate_client(
        supabase_url=settings.supabase_url,
        supabase_key=settings.supabase_service_key
    )
    return supabase_client


async def close_supabase():
    """Close Supabase client connection."""
    global supabase_client
    if supabase_client:
        # Supabase AsyncClient doesn't have a close method
        # Just set to None for cleanup
        supabase_client = None


async def get_supabase() -> AsyncGenerator[AsyncClient, None]:
    """Dependency to get Supabase client in route handlers."""
    if supabase_client is None:
        raise RuntimeError("Supabase client not initialized")
    yield supabase_client
