"""Viva Voce examination agent using Groq LLM for technical interviews."""
import json
from typing import Optional

from ai_client import get_groq_client


async def generate_opening_question(
    module_topic: str,
    target_role: str = "Senior Technical Interviewer"
) -> str:
    """
    Generate the first question for a viva session.
    
    Args:
        module_topic: Topic to examine on
        target_role: Interviewer persona
        
    Returns:
        The opening question text
    """
    client = get_groq_client()
    
    prompt = f"""You are a {target_role} conducting a technical interview on {module_topic}.

Generate a clear, focused opening question for this topic. The question should:
- Be open-ended but specific enough to evaluate understanding
- Test conceptual knowledge, not just memorization
- Be answerable in 2-3 sentences

Output ONLY the question text, nothing else."""

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional technical interviewer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200,
            timeout=10.0
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating opening question: {e}")
        return f"Can you explain the key concepts of {module_topic} and why they are important?"


async def get_interviewer_response(
    module_topic: str,
    user_answer: str,
    conversation_history: list,
    question_count: int,
    target_role: str = "Senior Technical Interviewer"
) -> tuple[str, int, str, bool, Optional[str]]:
    """
    Get interviewer's response to user's answer.
    
    Args:
        module_topic: Topic being examined
        user_answer: User's answer text
        conversation_history: Previous Q&A pairs
        question_count: Current question number
        target_role: Interviewer persona
        
    Returns:
        Tuple of (reply, score, next_question, is_complete, final_feedback)
    """
    client = get_groq_client()
    
    is_final = question_count >= 5
    
    # Build conversation context
    history_text = ""
    for msg in conversation_history[-6:]:  # Last 6 messages for context
        role = "Interviewer" if msg.get("role") == "interviewer" else "Candidate"
        history_text += f"{role}: {msg.get('content', '')}\n"
    
    prompt = f"""You are a {target_role} conducting a technical interview on {module_topic}.

This is question {question_count} of 5.

Previous conversation:
{history_text}

The candidate just answered: "{user_answer}"

Evaluate the answer and respond. Output ONLY a JSON object with this exact structure:
{{
    "reply": "Brief evaluation of the answer (1-2 sentences). Be encouraging but honest.",
    "score": <integer 0-100 rating the quality of this specific answer>,
    "next_question": "{'Generate a brief final closing statement since this is the last question.' if is_final else 'Your next follow-up question (1-2 sentences).'}",
    "is_complete": {str(is_final).lower()}
}}

Scoring guide:
- 80-100: Excellent, demonstrates deep understanding
- 60-79: Good, shows solid understanding with minor gaps
- 40-59: Fair, has some understanding but missing key points
- 0-39: Poor, significant gaps in understanding

Do NOT be overly generous. Evaluate rigorously."""

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a technical interviewer. Respond ONLY with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
            timeout=10.0
        )
        
        content = response.choices[0].message.content.strip()
        result = json.loads(content)
        
        reply = result.get("reply", "Thank you for your answer.")
        score = int(result.get("score", 50))
        next_question = result.get("next_question", "")
        is_complete = result.get("is_complete", is_final)
        
        # Generate final feedback if complete
        final_feedback = None
        if is_complete:
            final_feedback = await generate_closing_feedback(
                module_topic, conversation_history, user_answer, score
            )
        
        return reply, score, next_question, is_complete, final_feedback
        
    except Exception as e:
        print(f"Error in get_interviewer_response: {e}")
        return (
            "Thank you for your answer. Let me consider that.",
            50,
            f"Can you elaborate more on your understanding of {module_topic}?" if not is_final else "",
            is_final,
            "Thank you for completing the examination." if is_final else None
        )


async def generate_closing_feedback(
    module_topic: str,
    conversation_history: list,
    last_answer: str,
    last_score: int
) -> str:
    """
    Generate final assessment feedback.
    
    Args:
        module_topic: Topic examined
        conversation_history: Full conversation
        last_answer: The final answer
        last_score: Score for the last answer
        
    Returns:
        Final feedback text
    """
    client = get_groq_client()
    
    prompt = f"""You are concluding a technical interview on {module_topic}.

Based on the conversation, provide a brief final assessment (3-4 sentences).
Include:
- Overall strengths demonstrated
- Key areas for improvement
- Specific topics to study further

Be constructive and encouraging."""

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional technical interviewer giving final feedback."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300,
            timeout=10.0
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating closing feedback: {e}")
        return "Thank you for completing the examination. Continue studying the fundamentals and practice applying concepts to real-world scenarios."
