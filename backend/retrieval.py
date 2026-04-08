"""Retrieval layer for AdaptEd - Phase 2 implementation."""
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime

import httpx
from bs4 import BeautifulSoup
from duckduckgo_search import AsyncDDGS
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

from config import settings


class RetrievalError(Exception):
    """Base exception for retrieval errors."""
    pass


class SearchResult:
    """Represents a search result from any source."""
    
    def __init__(
        self,
        title: str,
        url: str,
        snippet: str,
        source_type: str = "web",
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.title = title
        self.url = url
        self.snippet = snippet
        self.source_type = source_type
        self.metadata = metadata or {}
        self.timestamp = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format."""
        return {
            "title": self.title,
            "url": self.url,
            "snippet": self.snippet,
            "source_type": self.source_type,
            "metadata": self.metadata,
            "timestamp": self.timestamp
        }


class DuckDuckGoRetriever:
    """DuckDuckGo search integration for web search only."""
    
    def __init__(self, max_results: int = 5, retry_delay: float = 2.0):
        self.max_results = max_results
        self.retry_delay = retry_delay
    
    async def search(self, query: str, max_retries: int = 3) -> List[SearchResult]:
        """
        Search DuckDuckGo and return top results.
        
        Args:
            query: Search query string
            max_retries: Maximum number of retry attempts
            
        Returns:
            List of SearchResult objects
        """
        for attempt in range(max_retries):
            try:
                # Add delay between attempts to avoid rate limiting
                if attempt > 0:
                    await asyncio.sleep(self.retry_delay * attempt)
                
                async with AsyncDDGS() as ddgs:
                    results = []
                    async for result in ddgs.text(
                        query,
                        max_results=self.max_results
                    ):
                        results.append(SearchResult(
                            title=result.get("title", ""),
                            url=result.get("href", ""),
                            snippet=result.get("body", ""),
                            source_type="web",
                            metadata={"engine": "duckduckgo"}
                        ))
                    
                    if results:  # Success
                        return results
                    
            except Exception as e:
                error_msg = str(e)
                if "Ratelimit" in error_msg and attempt < max_retries - 1:
                    print(f"Rate limited, retrying in {self.retry_delay * (attempt + 1)}s...")
                    continue
                else:
                    print(f"DuckDuckGo search error: {e}")
                    break
        
        return []


class YouTubeRetriever:
    """YouTube Data API v3 integration for video search and transcripts."""
    
    def __init__(self, max_videos: int = 2):
        self.max_videos = max_videos
        self.api_key = settings.youtube_api_key
        self.base_url = "https://www.googleapis.com/youtube/v3"
    
    async def search_and_fetch_transcripts(self, query: str) -> List[SearchResult]:
        """
        Search YouTube using official API and fetch transcripts for top videos.
        
        Args:
            query: Search query string
            
        Returns:
            List of SearchResult objects with transcript snippets
        """
        if not self.api_key:
            print("YouTube API key not configured, skipping YouTube search")
            return []
        
        try:
            # Search for videos using YouTube Data API v3
            video_results = await self._search_videos(query)
            
            if not video_results:
                return []
            
            # Fetch transcripts for found videos
            transcripts = []
            for video in video_results[:self.max_videos * 2]:
                if len(transcripts) >= self.max_videos:
                    break
                
                video_id = video["id"]
                transcript_text = await self._fetch_transcript(video_id)
                
                if transcript_text:
                    transcripts.append(SearchResult(
                        title=video["title"],
                        url=f"https://www.youtube.com/watch?v={video_id}",
                        snippet=transcript_text[:500],  # First 500 chars
                        source_type="youtube",
                        metadata={
                            "video_id": video_id,
                            "channel": video.get("channel", ""),
                            "views": video.get("views", 0),
                            "likes": video.get("likes", 0),
                            "full_transcript_length": len(transcript_text)
                        }
                    ))
            
            return transcripts
            
        except Exception as e:
            print(f"YouTube search error: {e}")
            return []
    
    async def _search_videos(self, query: str) -> List[Dict[str, str]]:
        """Search for videos using YouTube Data API v3, sorted by view count."""
        try:
            async with httpx.AsyncClient() as client:
                # Search for videos sorted by view count (relevance + popularity)
                search_response = await client.get(
                    f"{self.base_url}/search",
                    params={
                        "part": "snippet",
                        "q": query,
                        "type": "video",
                        "maxResults": self.max_videos * 3,  # Get more to filter
                        "key": self.api_key,
                        "videoCaption": "closedCaption",  # Prefer videos with captions
                        "order": "viewCount",  # Sort by view count
                        "relevanceLanguage": "en"
                    },
                    timeout=10.0
                )
                
                if search_response.status_code != 200:
                    print(f"YouTube API error: {search_response.status_code} - {search_response.text}")
                    return []
                
                search_data = search_response.json()
                video_ids = [item["id"]["videoId"] for item in search_data.get("items", [])]
                
                if not video_ids:
                    return []
                
                # Get video statistics (views, likes) for ranking
                stats_response = await client.get(
                    f"{self.base_url}/videos",
                    params={
                        "part": "snippet,statistics",
                        "id": ",".join(video_ids),
                        "key": self.api_key
                    },
                    timeout=10.0
                )
                
                if stats_response.status_code != 200:
                    print(f"YouTube stats API error: {stats_response.status_code}")
                    # Fallback to search results without stats
                    return [{
                        "id": item["id"]["videoId"],
                        "title": item["snippet"]["title"],
                        "channel": item["snippet"]["channelTitle"],
                        "description": item["snippet"]["description"],
                        "views": 0,
                        "likes": 0
                    } for item in search_data.get("items", [])]
                
                stats_data = stats_response.json()
                
                # Build video list with statistics
                videos = []
                for item in stats_data.get("items", []):
                    stats = item.get("statistics", {})
                    videos.append({
                        "id": item["id"],
                        "title": item["snippet"]["title"],
                        "channel": item["snippet"]["channelTitle"],
                        "description": item["snippet"]["description"],
                        "views": int(stats.get("viewCount", 0)),
                        "likes": int(stats.get("likeCount", 0))
                    })
                
                # Sort by views (already sorted by API, but ensure it)
                videos.sort(key=lambda v: v["views"], reverse=True)
                
                return videos
                
        except Exception as e:
            print(f"YouTube API search error: {e}")
            return []
    
    async def _fetch_transcript(self, video_id: str) -> Optional[str]:
        """Fetch transcript for a video ID."""
        try:
            # Run in executor since YouTubeTranscriptApi is synchronous
            loop = asyncio.get_event_loop()
            transcript_list = await loop.run_in_executor(
                None,
                YouTubeTranscriptApi.get_transcript,
                video_id
            )
            
            # Combine transcript segments
            full_text = " ".join([segment["text"] for segment in transcript_list])
            return full_text
        except (TranscriptsDisabled, NoTranscriptFound):
            return None
        except Exception as e:
            print(f"Transcript fetch error for {video_id}: {e}")
            return None


class WebPageRetriever:
    """BeautifulSoup-based web page content fetcher."""
    
    def __init__(self, timeout: float = 5.0):
        self.timeout = timeout
    
    async def fetch_content(self, url: str) -> Optional[str]:
        """
        Fetch and extract text content from a URL.
        
        Args:
            url: URL to fetch
            
        Returns:
            Extracted text content or None on failure
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, follow_redirects=True)
                response.raise_for_status()
                
                # Parse HTML
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Remove script and style elements
                for script in soup(["script", "style", "nav", "footer", "header"]):
                    script.decompose()
                
                # Get text
                text = soup.get_text(separator=" ", strip=True)
                
                # Clean up whitespace
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = " ".join(chunk for chunk in chunks if chunk)
                
                return text[:2000]  # Return first 2000 chars
        except httpx.TimeoutException:
            print(f"Timeout fetching {url}")
            return None
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None


class RetrievalPipeline:
    """Main retrieval pipeline coordinating all sources."""
    
    def __init__(self):
        self.ddg = DuckDuckGoRetriever(max_results=5)
        self.youtube = YouTubeRetriever(max_videos=2)
        self.web = WebPageRetriever(timeout=5.0)
    
    async def retrieve(self, query: str, include_youtube: bool = True) -> Dict[str, Any]:
        """
        Execute full retrieval pipeline.
        
        Args:
            query: Search query
            include_youtube: Whether to include YouTube results
            
        Returns:
            Dictionary with all retrieval results
        """
        # Run searches in parallel
        tasks = [
            self.ddg.search(query)
        ]
        
        if include_youtube:
            tasks.append(self.youtube.search_and_fetch_transcripts(query))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        ddg_results = results[0] if not isinstance(results[0], Exception) else []
        youtube_results = results[1] if len(results) > 1 and not isinstance(results[1], Exception) else []
        
        # Fetch full content for top 3 web results
        web_content_tasks = []
        for result in ddg_results[:3]:
            web_content_tasks.append(self._enrich_with_content(result))
        
        enriched_results = await asyncio.gather(*web_content_tasks, return_exceptions=True)
        enriched_results = [r for r in enriched_results if not isinstance(r, Exception)]
        
        # Combine all results
        all_results = enriched_results + ddg_results[3:] + youtube_results
        
        return {
            "query": query,
            "total_results": len(all_results),
            "web_results": len([r for r in all_results if r.source_type == "web"]),
            "youtube_results": len([r for r in all_results if r.source_type == "youtube"]),
            "results": [r.to_dict() for r in all_results],
            "retrieved_at": datetime.utcnow().isoformat()
        }
    
    async def _enrich_with_content(self, result: SearchResult) -> SearchResult:
        """Enrich a search result with full page content."""
        content = await self.web.fetch_content(result.url)
        if content:
            result.snippet = content
            result.metadata["enriched"] = True
        return result


# Global retrieval pipeline instance
retrieval_pipeline = RetrievalPipeline()


async def search_for_topic(topic: str, include_youtube: bool = True) -> Dict[str, Any]:
    """
    Convenience function to search for a topic.
    
    Args:
        topic: Topic to search for
        include_youtube: Whether to include YouTube results
        
    Returns:
        Retrieval results dictionary
    """
    return await retrieval_pipeline.retrieve(topic, include_youtube=include_youtube)
