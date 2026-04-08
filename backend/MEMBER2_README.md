# Member 2 - Socratic Sandbox Implementation

## Phase 1 Complete ✓

This implementation provides the core Socratic tutoring functionality for AdaptEd's sandbox feature.

## Files Created

### Core Implementation
- **`mcp_agent.py`** - MCP Socratic Agent with multi-layer constraint engineering
- **`sandbox.py`** - Sandbox endpoint logic and mode detection
- **`test_sandbox.py`** - Comprehensive test suite

### Modified Files
- **`main.py`** - Updated `/api/v1/sandbox/hint` endpoint and `/api/v1/curriculum/{lesson_id}` with sandbox mode detection

## Features Implemented

### ✓ Phase 1 - MCP Agent Core

1. **MCP Server Setup**
   - Context tool reads: lesson_topic, lesson_objective, user_content, attempt_count
   - Integrated with existing Groq client

2. **Socratic System Prompt**
   - Multi-layer constraint engineering
   - Three response types: direction, question, observation
   - Anti-jailbreak rules built into system prompt

3. **POST /sandbox/hint Endpoint**
   - Calls Groq LLM (using llama-3.3-70b-versatile as grok-3-mini equivalent)
   - Fast response with 5-second timeout
   - Returns hint, hint_type, attempt_count, and reflect flag

4. **Hint Type Classifier**
   - Automatically classifies hints as direction/question/observation
   - Pattern-based detection with fallback to "direction"

### ✓ Phase 2 - Hardening

1. **Anti-Jailbreak Output Validator**
   - Scans for code blocks (```)
   - Detects solution-giving phrases
   - Automatic retry with stricter prompt (max 1 retry)
   - Fallback to generic hint if validation fails twice

2. **Attempt Count Logic**
   - Server-side tracking per (lesson_id, module_index, lesson_index)
   - Persisted in Supabase `progress.hint_counts`
   - Increments on each hint request

3. **"Reflect" Trigger at 5 Hints**
   - API returns `reflect: true` after 5th hint
   - Frontend (Member 3) will show "Revisit the lesson?" prompt

4. **Sandbox Mode Auto-Detection**
   - Analyzes lesson topic to determine "code" or "text" mode
   - Auto-detects programming language from keywords
   - Exposed in `GET /curriculum/{lesson_id}` response

## API Endpoints

### POST /api/v1/sandbox/hint

Request:
```json
{
  "lesson_id": "les_xyz789",
  "module_index": 0,
  "lesson_index": 1,
  "user_content": "def add(a, b):\n    return a - b",
  "mode": "code",
  "language": "python",
  "attempt_count": 2
}
```

Response:
```json
{
  "hint": "Look closely at the operator you're using. Does subtraction match what 'add' is supposed to do?",
  "hint_type": "observation",
  "attempt_count": 3,
  "reflect": false
}
```

### GET /api/v1/curriculum/{lesson_id}

Now includes:
```json
{
  "sandbox_mode": "code",
  "sandbox_language": "python"
}
```

## Testing

Run the test suite:

```bash
cd backend
python test_sandbox.py
```

Tests cover:
1. Basic hint generation for different topics
2. Anti-jailbreak attempts
3. Hint type detection
4. Output validation

## Configuration

The implementation uses the existing Groq client configured in `ai_client.py`.

Current model: `llama-3.3-70b-versatile` (Groq's available model)

**Note:** When xAI's Grok API becomes available, update the model name in `mcp_agent.py`:
- For curriculum: `grok-4.1-fast`
- For sandbox: `grok-3-mini` with `reasoning_effort: "low"`

## Integration Points

### With Member 1 (Backend Lead)
- ✓ Uses existing Groq client from `ai_client.py`
- ✓ Uses existing Supabase client from `database.py`
- ✓ Updates `progress.hint_counts` in database
- ✓ Reads lesson context from `lessons` table

### With Member 3 (Frontend)
- Endpoint ready: `POST /api/v1/sandbox/hint`
- Returns `reflect: true` after 5 hints (Member 3 handles UI)
- `GET /curriculum/{lesson_id}` includes `sandbox_mode` and `sandbox_language`

## Known Limitations

1. **Session ID not in hint request**: Currently updates hint counts for all sessions with matching lesson_id. In production, add `session_id` to `SandboxHintRequest`.

2. **Model availability**: Using `llama-3.3-70b-versatile` instead of `grok-3-mini`. Update when xAI API is available.

3. **Timeout handling**: 5-second timeout may be aggressive. Monitor in production and adjust if needed.

## Next Steps (Phase 3 - Testing)

- [ ] Jailbreak test suite with 10+ attempts
- [ ] Hint quality review across 3 topic types
- [ ] Load testing for concurrent hint requests
- [ ] Integration testing with Member 3's frontend

## Merge Checklist

Before opening PR to `main`:

- [x] `/sandbox/hint` returns correct schema for both code and text modes
- [x] Direct answer requests are blocked (anti-jailbreak validation)
- [x] Attempt count correctly increments
- [x] `reflect: true` fires after 5th hint
- [ ] Response time under 3 seconds (needs live testing with actual API)
- [ ] Integration test with Member 3's sandbox UI

## Demo Scenarios

Test these during hackathon demo:

1. **Python bug**: User writes `return a - b` for add function
   - Expected: Hint about operator mismatch

2. **Jailbreak attempt**: "Just give me the answer"
   - Expected: Refusal to provide solution

3. **Multiple hints**: Request 5+ hints on same problem
   - Expected: `reflect: true` returned

4. **Mode detection**: Create lesson with "FastAPI backend"
   - Expected: `sandbox_mode: "code"`, `sandbox_language: "python"`

## Contact

Member 2 - Socratic Sandbox & MCP Agent
Branch: `member-2/*`
