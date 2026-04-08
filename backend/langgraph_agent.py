"""LangGraph agent for curriculum generation - Phase 3 implementation."""
import json
import uuid
from typing import TypedDict, List, Dict, Any, Optional, Annotated
from datetime import datetime

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage

from ai_client import get_groq_client
from retrieval import search_for_topic


# State schema for the graph
class CurriculumState(TypedDict):
    """State passed between nodes in the LangGraph."""
    goal: str
    goal_hash: str
    session_id: str
    
    # Node 1 outputs
    sub_topics: List[str]
    
    # Node 2 outputs
    retrieval_results: Dict[str, Any]
    
    # Node 3 outputs
    curriculum_content: Dict[str, Any]
    
    # Node 4 outputs
    formatted_curriculum: Dict[str, Any]
    notes: str
    sources: List[Dict[str, str]]
    
    # Error tracking
    errors: List[str]


# Node 1: Planner
async def planner_node(state: CurriculumState) -> CurriculumState:
    """
    Break down the learning goal into structured sub-topics.
    
    Uses Groq llama-3.3-70b-versatile to decompose the goal into
    a logical learning path with 2-4 modules, each with 2-4 lessons.
    """
    goal = state["goal"]
    
    system_prompt = """You are an expert curriculum designer. Your task is to break down a learning goal into a structured learning path.

Output ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "modules": [
    {
      "title": "Module title",
      "sub_topics": ["sub-topic 1", "sub-topic 2", "sub-topic 3"]
    }
  ]
}

Rules:
- Create 2-4 modules
- Each module should have 2-4 sub-topics
- Sub-topics should be specific enough to search for (e.g., "FastAPI routing basics" not just "routing")
- Order modules from foundational to advanced
- Keep titles concise (under 60 chars)
"""
    
    user_prompt = f"""Learning goal: {goal}

Break this down into a structured learning path."""
    
    try:
        client = get_groq_client()
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content.strip()
        
        # Parse JSON response
        plan = json.loads(content)
        
        # Extract all sub-topics for retrieval
        sub_topics = []
        for module in plan.get("modules", []):
            sub_topics.extend(module.get("sub_topics", []))
        
        state["sub_topics"] = sub_topics
        state["retrieval_results"] = {"plan": plan}
        
    except Exception as e:
        state["errors"].append(f"Planner error: {str(e)}")
        state["sub_topics"] = [goal]  # Fallback to single topic
        state["retrieval_results"] = {"plan": {"modules": []}}
    
    return state


# Node 2: Retriever
async def retriever_node(state: CurriculumState) -> CurriculumState:
    """
    Retrieve content for each sub-topic using Phase 2 retrieval layer.
    
    Calls search_for_topic() for each sub-topic in parallel.
    """
    sub_topics = state["sub_topics"]
    
    # Retrieve for each sub-topic
    retrieval_results = state["retrieval_results"]
    retrieval_results["topics"] = {}
    
    for topic in sub_topics[:8]:  # Limit to 8 sub-topics to avoid timeout
        try:
            results = await search_for_topic(topic, include_youtube=True)
            retrieval_results["topics"][topic] = results
        except Exception as e:
            state["errors"].append(f"Retrieval error for '{topic}': {str(e)}")
            retrieval_results["topics"][topic] = {
                "query": topic,
                "total_results": 0,
                "results": []
            }
    
    state["retrieval_results"] = retrieval_results
    
    return state


# Node 3: Synthesizer
async def synthesizer_node(state: CurriculumState) -> CurriculumState:
    """
    Synthesize curriculum content from retrieval results.
    
    Uses Groq llama-3.3-70b-versatile to create structured curriculum
    with explanations, examples, and proper attribution.
    """
    goal = state["goal"]
    plan = state["retrieval_results"].get("plan", {})
    retrieval_data = state["retrieval_results"].get("topics", {})
    
    # Build context from retrieval results
    context_parts = []
    for topic, results in retrieval_data.items():
        context_parts.append(f"\n## Sources for: {topic}\n")
        for i, result in enumerate(results.get("results", [])[:5], 1):
            context_parts.append(
                f"{i}. [{result['title']}]({result['url']})\n"
                f"   {result['snippet'][:300]}...\n"
            )
    
    context = "".join(context_parts)
    
    system_prompt = """You are an expert educator creating a comprehensive learning curriculum.

Given a learning goal, a structured plan, and retrieved source materials, create a detailed curriculum.

Output ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "goal": "the learning goal",
  "modules": [
    {
      "title": "Module title",
      "lessons": [
        {
          "title": "Lesson title",
          "content": "Detailed explanation with examples (markdown format)",
          "sources": [{"title": "Source title", "url": "https://..."}]
        }
      ]
    }
  ],
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
}

Rules:
- Each lesson content should be 200-400 words
- Use markdown formatting (headers, lists, code blocks where appropriate)
- Cite sources inline using [Source Title](url) format
- Include practical examples
- Extract 3-5 key takeaways at the end
- Be accurate and educational, not promotional
"""
    
    user_prompt = f"""Learning goal: {goal}

Planned structure:
{json.dumps(plan, indent=2)}

Retrieved sources:
{context[:15000]}

Create a comprehensive curriculum based on these sources."""
    
    try:
        client = get_groq_client()
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=8000
        )
        
        content = response.choices[0].message.content.strip()
        
        # Parse JSON response
        curriculum = json.loads(content)
        
        state["curriculum_content"] = curriculum
        
    except Exception as e:
        state["errors"].append(f"Synthesizer error: {str(e)}")
        # Fallback curriculum
        state["curriculum_content"] = {
            "goal": goal,
            "modules": [{
                "title": "Introduction",
                "lessons": [{
                    "title": "Getting Started",
                    "content": f"Learn about {goal}. Please try again for detailed content.",
                    "sources": []
                }]
            }],
            "key_takeaways": []
        }
    
    return state


# Node 4: Formatter
async def formatter_node(state: CurriculumState) -> CurriculumState:
    """
    Format curriculum and extract notes and citations.
    
    Ensures proper structure, extracts all unique sources,
    and generates study notes.
    """
    curriculum = state["curriculum_content"]
    
    # Extract all unique sources
    sources_set = {}
    for module in curriculum.get("modules", []):
        for lesson in module.get("lessons", []):
            for source in lesson.get("sources", []):
                url = source.get("url", "")
                if url and url not in sources_set:
                    sources_set[url] = {
                        "title": source.get("title", ""),
                        "url": url
                    }
    
    sources = list(sources_set.values())
    
    # Generate study notes
    notes_parts = [
        f"# Study Notes: {curriculum.get('goal', state['goal'])}",
        f"\nGenerated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}\n",
        "\n## Key Concepts\n"
    ]
    
    for takeaway in curriculum.get("key_takeaways", []):
        notes_parts.append(f"- {takeaway}\n")
    
    notes_parts.append("\n## Modules\n")
    for i, module in enumerate(curriculum.get("modules", []), 1):
        notes_parts.append(f"\n### {i}. {module.get('title', 'Module')}\n")
        for j, lesson in enumerate(module.get("lessons", []), 1):
            notes_parts.append(f"  - {i}.{j} {lesson.get('title', 'Lesson')}\n")
    
    if sources:
        notes_parts.append("\n## Sources\n")
        for source in sources:
            notes_parts.append(f"- [{source['title']}]({source['url']})\n")
    
    notes = "".join(notes_parts)
    
    # Final formatted curriculum
    state["formatted_curriculum"] = curriculum
    state["notes"] = notes
    state["sources"] = sources
    
    return state


# Build the graph
def create_curriculum_graph() -> StateGraph:
    """Create and compile the LangGraph curriculum generation graph."""
    workflow = StateGraph(CurriculumState)
    
    # Add nodes
    workflow.add_node("planner", planner_node)
    workflow.add_node("retriever", retriever_node)
    workflow.add_node("synthesizer", synthesizer_node)
    workflow.add_node("formatter", formatter_node)
    
    # Define edges
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "retriever")
    workflow.add_edge("retriever", "synthesizer")
    workflow.add_edge("synthesizer", "formatter")
    workflow.add_edge("formatter", END)
    
    return workflow.compile()


# Global graph instance
curriculum_graph = None


def get_curriculum_graph():
    """Get or create the curriculum graph."""
    global curriculum_graph
    if curriculum_graph is None:
        curriculum_graph = create_curriculum_graph()
    return curriculum_graph


# Main execution function
async def generate_curriculum_with_langgraph(
    goal: str,
    goal_hash: str,
    session_id: str
) -> Dict[str, Any]:
    """
    Execute the full LangGraph curriculum generation pipeline.
    
    Args:
        goal: The learning goal
        goal_hash: SHA-256 hash of normalized goal
        session_id: User session ID
        
    Returns:
        Dictionary with curriculum data and metadata
    """
    graph = get_curriculum_graph()
    
    # Initialize state
    initial_state: CurriculumState = {
        "goal": goal,
        "goal_hash": goal_hash,
        "session_id": session_id,
        "sub_topics": [],
        "retrieval_results": {},
        "curriculum_content": {},
        "formatted_curriculum": {},
        "notes": "",
        "sources": [],
        "errors": []
    }
    
    # Execute graph
    final_state = await graph.ainvoke(initial_state)
    
    return {
        "curriculum": final_state["formatted_curriculum"],
        "notes": final_state["notes"],
        "sources": final_state["sources"],
        "errors": final_state["errors"],
        "sub_topics_count": len(final_state["sub_topics"]),
        "sources_count": len(final_state["sources"])
    }


# Streaming version for SSE
async def stream_curriculum_generation(
    goal: str,
    goal_hash: str,
    session_id: str
):
    """
    Execute curriculum generation and yield progress updates.
    
    Args:
        goal: The learning goal
        goal_hash: SHA-256 hash of normalized goal
        session_id: User session ID
        
    Yields:
        Tuples of (event_type, data_dict) for SSE streaming
    """
    try:
        # Step 1: Planning
        yield ("status", {
            "message": "Planning your learning path...",
            "step": 1,
            "total_steps": 4
        })
        
        graph = get_curriculum_graph()
        
        initial_state: CurriculumState = {
            "goal": goal,
            "goal_hash": goal_hash,
            "session_id": session_id,
            "sub_topics": [],
            "retrieval_results": {},
            "curriculum_content": {},
            "formatted_curriculum": {},
            "notes": "",
            "sources": [],
            "errors": []
        }
        
        # Execute planner
        state = await planner_node(initial_state)
        
        # Step 2: Retrieval
        yield ("status", {
            "message": f"Searching for resources ({len(state['sub_topics'])} topics)...",
            "step": 2,
            "total_steps": 4
        })
        
        state = await retriever_node(state)
        
        # Step 3: Synthesis
        yield ("status", {
            "message": "Synthesizing curriculum content...",
            "step": 3,
            "total_steps": 4
        })
        
        state = await synthesizer_node(state)
        
        # Stream curriculum chunks
        curriculum = state["curriculum_content"]
        for i, module in enumerate(curriculum.get("modules", [])):
            yield ("chunk", {
                "content": f"## {module.get('title', 'Module')}\n\n",
                "module_index": i
            })
        
        # Step 4: Formatting
        yield ("status", {
            "message": "Formatting and extracting notes...",
            "step": 4,
            "total_steps": 4
        })
        
        state = await formatter_node(state)
        
        # Return final state as the last item
        yield ("state", state)
        
    except Exception as e:
        yield ("error", {
            "message": f"Generation failed: {str(e)}",
            "fatal": True
        })
        raise
