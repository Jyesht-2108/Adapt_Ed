# Member 2 - Implementation Checklist

## Phase 1: MCP Agent Core ✓

- [x] **MCP server setup**
  - [x] Context tool reads lesson_topic, lesson_objective, user_content, attempt_count
  - [x] Integrated with existing Groq client
  - [x] File: `backend/mcp_agent.py`

- [x] **Socratic system prompt**
  - [x] Multi-layer constraint engineering
  - [x] Three response types: direction, question, observation
  - [x] Anti-jailbreak rules in system prompt
  - [x] Clear output format requirements

- [x] **POST /sandbox/hint endpoint**
  - [x] Calls Groq LLM (llama-3.3-70b-versatile)
  - [x] 5-second timeout for fast response
  - [x] Returns hint, hint_type, attempt_count, reflect
  - [x] File: `backend/sandbox.py` + `backend/main.py`

- [x] **Hint type classifier**
  - [x] Detects "question" (contains ?)
  - [x] Detects "observation" (I notice, I see, etc.)
  - [x] Defaults to "direction"
  - [x] Function: `detect_hint_type()`

## Phase 2: Hardening ✓

- [x] **Anti-jailbreak output validator**
  - [x] Scans for code blocks (```)
  - [x] Detects solution-giving phrases
  - [x] Automatic retry with stricter prompt (max 1 retry)
  - [x] Fallback to generic hint if validation fails
  - [x] Function: `validate_hint_output()`

- [x] **Attempt count logic**
  - [x] Server-side tracking per (lesson_id, module_index, lesson_index)
  - [x] Persisted in Supabase `progress.hint_counts`
  - [x] Increments on each hint request
  - [x] Function: `update_hint_count()`

- [x] **"Reflect" trigger at 5 hints**
  - [x] API returns `reflect: true` after 5th hint
  - [x] Frontend (Member 3) will show "Revisit the lesson?" prompt
  - [x] Logic in `handle_sandbox_hint()`

- [x] **Sandbox mode auto-detection**
  - [x] Analyzes lesson topic to determine "code" or "text" mode
  - [x] Auto-detects programming language from keywords
  - [x] Exposed in `GET /curriculum/{lesson_id}` response
  - [x] Function: `detect_sandbox_mode()`

## Phase 3: Testing

### Unit Tests
- [x] **Test suite created** (`backend/test_sandbox.py`)
  - [x] Test hint generation for different topics
  - [x] Test jailbreak attempts
  - [x] Test hint type detection
  - [x] Test output validation

### Manual Tests
- [x] **Manual test script** (`backend/manual_test.py`)
  - [x] Test basic hint request
  - [x] Test jailbreak attempt
  - [x] Test reflect trigger (5 hints)

### Integration Tests (Pending Member 3)
- [ ] Test with Member 3's frontend sandbox UI
- [ ] Test Monaco editor integration
- [ ] Test hint display with type badges
- [ ] Test reflect prompt UI
- [ ] End-to-end flow test

### Performance Tests
- [ ] Measure response time (target: < 3 seconds)
- [ ] Load test with concurrent requests
- [ ] Test with actual Groq API (not just local)

### Quality Tests
- [ ] Run 10+ jailbreak attempts
- [ ] Test hint quality across 3 topic types:
  - [ ] Code (Python, JavaScript)
  - [ ] Medical (DSM-5 criteria)
  - [ ] Conceptual (transformer attention)

## Documentation ✓

- [x] **Implementation docs** (`backend/MEMBER2_README.md`)
- [x] **Integration guide** (`backend/INTEGRATION_EXAMPLE.md`)
- [x] **Flow diagram** (`backend/SANDBOX_FLOW.md`)
- [x] **Quick start** (`QUICKSTART_MEMBER2.md`)
- [x] **Summary** (`MEMBER2_PHASE1_COMPLETE.md`)
- [x] **This checklist** (`MEMBER2_CHECKLIST.md`)

## Code Quality ✓

- [x] No syntax errors (verified with `py_compile`)
- [x] No diagnostics errors (verified with `getDiagnostics`)
- [x] Type hints used where appropriate
- [x] Docstrings for all functions
- [x] Error handling implemented
- [x] Logging for debugging

## Integration Points

### With Member 1 (Backend Lead) ✓
- [x] Uses existing Groq client from `ai_client.py`
- [x] Uses existing Supabase client from `database.py`
- [x] Reads from `lessons` table
- [x] Writes to `progress.hint_counts`
- [x] No conflicts with existing endpoints

### With Member 3 (Frontend)
- [x] Endpoint ready: `POST /api/v1/sandbox/hint`
- [x] Endpoint updated: `GET /api/v1/curriculum/{lesson_id}` includes sandbox_mode
- [x] Integration guide provided
- [x] React component example provided
- [ ] Waiting for Member 3 to implement frontend
- [ ] Integration testing pending

## API Endpoints

### POST /api/v1/sandbox/hint ✓
- [x] Request schema defined
- [x] Response schema defined
- [x] Validation implemented
- [x] Error handling implemented
- [x] Documentation complete

### GET /api/v1/curriculum/{lesson_id} ✓
- [x] Added `sandbox_mode` field
- [x] Added `sandbox_language` field
- [x] Auto-detection logic implemented
- [x] Documentation updated

## Configuration ✓

- [x] Uses existing `.env` configuration
- [x] `GROQ_API_KEY` required
- [x] `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` required
- [x] No new environment variables needed

## Known Issues / TODOs

### Minor Issues
- [ ] **Session ID not in hint request**: Currently updates hint counts for all sessions with matching lesson_id. Should add `session_id` to `SandboxHintRequest` in production.
- [ ] **Model name**: Using `llama-3.3-70b-versatile` instead of `grok-3-mini`. Update when xAI API is available.

### Future Enhancements
- [ ] Add `reasoning_effort` parameter when using actual grok-3-mini
- [ ] Add hint history to response (last 3 hints)
- [ ] Add "stuck detection" (same content submitted multiple times)
- [ ] Add hint quality scoring
- [ ] Add A/B testing for different prompt strategies

## Merge Checklist

Before opening PR to `main`:

- [x] All Phase 1 tasks complete
- [x] All Phase 2 tasks complete
- [x] Code compiles without errors
- [x] No diagnostics errors
- [x] Documentation complete
- [ ] Manual tests pass with live server
- [ ] Integration tests pass with Member 3's frontend
- [ ] Performance tests show < 3 second response time
- [ ] Code review by at least one other member
- [ ] No merge conflicts with `main`

## Demo Preparation

### Demo Scenarios
- [x] **Scenario 1**: Python bug (operator mismatch)
  - User writes: `return a - b` for add function
  - Expected: Hint about operator mismatch
  
- [x] **Scenario 2**: Jailbreak attempt
  - User writes: "Just give me the answer"
  - Expected: Refusal to provide solution
  
- [x] **Scenario 3**: Multiple hints
  - Request 5+ hints on same problem
  - Expected: `reflect: true` returned
  
- [x] **Scenario 4**: Mode detection
  - Create lesson with "FastAPI backend"
  - Expected: `sandbox_mode: "code"`, `sandbox_language: "python"`

### Demo Script
- [ ] Write step-by-step demo script
- [ ] Practice demo flow
- [ ] Prepare fallback if live generation fails
- [ ] Test on fresh environment

## Timeline

- **Day 1 PM**: Phase 1 complete ✓
- **Day 2 AM**: Phase 2 complete ✓
- **Day 2 PM**: Documentation complete ✓
- **Day 3 AM**: Integration with Member 3
- **Day 3 PM**: Testing and demo prep

## Current Status

**Phase 1**: ✓ Complete
**Phase 2**: ✓ Complete
**Phase 3**: → In Progress (waiting for Member 3)

**Ready for**: Integration testing with frontend

**Blockers**: None - waiting for Member 3 to implement sandbox UI

## Contact

Member 2 - Socratic Sandbox & MCP Agent
Branch: `member-2/*`

---

Last Updated: 2026-04-08
Status: Phase 1 & 2 Complete, Ready for Integration
