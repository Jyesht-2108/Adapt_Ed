# AdaptEd Backend - Member 1 Implementation

## Phase 1 Complete ✅

This backend foundation unblocks Member 2 and Member 3.

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
- `XAI_API_KEY` - Your xAI API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key

### 3. Setup Supabase Database

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase_schema.sql`
4. Run the SQL to create tables

### 4. Run the Server

```bash
uvicorn main:app --reload --port 8000
```

Server will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Implemented Endpoints

### Phase 1 - Backend Foundation

✅ **POST** `/api/v1/curriculum/generate`
- Initiates curriculum generation
- Returns `generation_id` and `cached` flag
- Checks Supabase cache by goal hash

✅ **GET** `/api/v1/curriculum/stream/{generation_id}`
- SSE stream for real-time progress
- Emits: `status`, `chunk`, `complete`, `error` events
- Currently returns stub events (Phase 3 will integrate LangGraph)

✅ **GET** `/api/v1/curriculum/{lesson_id}`
- Fetch cached lesson by ID
- Returns full curriculum content

✅ **GET** `/api/v1/curriculum/{lesson_id}/notes`
- Get auto-generated study notes
- Returns markdown format

✅ **GET** `/api/v1/session/{session_id}/progress`
- Get all curriculums for a session
- Returns completion percentages

✅ **POST** `/api/v1/session/{session_id}/progress`
- Update lesson completion state
- Tracks viewed nodes

✅ **POST** `/api/v1/sandbox/hint` (Placeholder)
- Placeholder for Member 2's implementation
- Returns stub response

## Testing

### Test Health Check
```bash
curl http://localhost:8000/
```

### Test Curriculum Generation
```bash
curl -X POST http://localhost:8000/api/v1/curriculum/generate \
  -H "Content-Type: application/json" \
  -d '{"goal": "Learn FastAPI basics", "session_id": "test-session-123"}'
```

### Test SSE Stream
```bash
curl -N http://localhost:8000/api/v1/curriculum/stream/gen_test123
```

## Database Schema

Tables created in Supabase:
- `lessons` - Curriculum cache with goal hash lookup
- `sessions` - User session tracking
- `progress` - Lesson completion and hint counts

See `supabase_schema.sql` for full schema.

## What's Next

### Phase 2 - Retrieval Layer
- DuckDuckGo search integration
- YouTube transcript API
- BeautifulSoup web scraping
- Cache lookup optimization

### Phase 3 - LangGraph Agent
- 4-node curriculum generation graph
- Real-time streaming integration
- Auto-notes extraction
- End-to-end testing

## For Member 2

Backend scaffold is ready! You can now:
1. Add your MCP agent logic
2. Implement `/api/v1/sandbox/hint` endpoint
3. Use `progress.hint_counts` in Supabase for attempt tracking

The `hint_counts` column is a JSONB field that stores:
```json
{
  "0-0": 3,
  "0-1": 1,
  "1-0": 5
}
```
Where keys are `"{module_index}-{lesson_index}"` and values are hint counts.

## For Member 3

Backend stub is ready! You can now:
1. Integrate SSE client with `/curriculum/stream/{id}`
2. Build curriculum viewer using `/curriculum/{id}`
3. Implement progress tracking with session endpoints

The stub endpoints return valid response shapes, so you can build the UI without waiting for Phase 3.
