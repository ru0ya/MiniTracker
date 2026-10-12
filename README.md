# MiniTracker

A small ticketing app with a Django REST Framework backend and a Next.js frontend.

- `backend/MiniTracker/` — Django REST API for tickets
- `frontend/` — Next.js 16 App Router UI (Server Components + Server Actions)

## Backend setup and run

```bash
cd backend/MiniTracker
python -m venv .venv          # optional but recommended
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver    # http://localhost:8000
```

Interactive API docs (Swagger UI) are served at `http://localhost:8000/api/docs/`.

Main endpoints:

| Method | Path                    | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| GET    | `/tickets/`             | List tickets (paginated, limit/offset) |
| POST   | `/tickets/`             | Create a ticket                    |
| GET    | `/tickets/{id}/`        | Fetch one ticket                   |
| PATCH  | `/tickets/{id}/`        | Update a ticket (e.g. `status`)    |
| DELETE | `/tickets/{id}/`        | Delete a ticket                    |
| GET    | `/tickets/stats/`       | Ticket counts grouped by status    |

List filters: `?status=` `?priority=` `?created_after=` `?created_before=`, plus `search`/`ordering`. Ticket fields: `title` (max 20 chars), `description` (max 80), `status` (`open` / `in_progress` / `closed`), `priority` (`low` / `medium` / `high`).

## API examples (curl)

All examples assume the backend on `http://localhost:8000`. Indented JSON after a request shows the (abridged) response.

**List tickets (paginated)**

```bash
curl http://localhost:8000/tickets/
# {
#   "count": 3,
#   "next": "http://localhost:8000/tickets/?limit=10&offset=10",
#   "previous": null,
#   "results": [
#     {
#       "id": "3f50e41e-...",
#       "title": "Fix login",
#       "description": "Session cookie expires too early",
#       "status": "open",
#       "priority": "high",
#       "created_at": "2026-10-12T08:00:00Z"
#     }
#   ]
# }
```

Pagination uses `limit`/`offset`:

```bash
curl "http://localhost:8000/tickets/?limit=5&offset=10"
```

**Filter, search, and order**

```bash
curl "http://localhost:8000/tickets/?status=open"
curl "http://localhost:8000/tickets/?priority=high&status=in_progress"
curl "http://localhost:8000/tickets/?created_after=2026-10-01&created_before=2026-10-30"
curl "http://localhost:8000/tickets/?search=open"            # matches status or priority
curl "http://localhost:8000/tickets/?ordering=-created_at"   # newest first
```

**Get one ticket**

```bash
curl http://localhost:8000/tickets/3f50e41e-1234-5678-9abc-def012345678/
# { "id": "3f50e41e-...", "title": "Fix login", "status": "open", ... }
```

**Create a ticket**

```bash
curl -X POST http://localhost:8000/tickets/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix login",
    "description": "Session cookie expires too early",
    "status": "open",
    "priority": "high"
  }'
# 201 Created
# { "id": "3f50e41e-...", "title": "Fix login", "status": "open", "priority": "high", "created_at": "..." }
```

**Update a ticket (partial — e.g. change only the status)**

```bash
curl -X PATCH http://localhost:8000/tickets/3f50e41e-1234-5678-9abc-def012345678/ \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
# { "id": "3f50e41e-...", "title": "Fix login", "status": "in_progress", "priority": "high", ... }
```

**Delete a ticket**

```bash
curl -X DELETE http://localhost:8000/tickets/3f50e41e-1234-5678-9abc-def012345678/
# 204 No Content
```

**Stats (ticket counts by status)**

```bash
curl http://localhost:8000/tickets/stats/
# [ { "status": "open", "count": 1 }, { "status": "in_progress", "count": 1 }, { "status": "closed", "count": 1 } ]
```

## Frontend setup and run

```bash
cd frontend
npm install
npm run dev                  # http://localhost:3000
```

Start the backend first. The frontend talks to Django server-to-server; point it elsewhere with the `BACKEND_URL` environment variable (default `http://localhost:8000`), e.g. `BACKEND_URL=http://localhost:8000 npm run dev`.

The UI provides a ticket list (with status/priority badges and pagination), a form to create tickets, and an inline control to change a ticket's status. Lint and typecheck with `npm run lint` and `npx tsc --noEmit`; production build via `npm run build`.

## Integration / API tests

`frontend/scripts/smoke-api.mjs` is a zero-dependency Node script that exercises the real API end-to-end against a running backend. It verifies:

1. Creating a ticket (`POST /tickets/`) returns a well-formed ticket.
2. The created ticket appears in the list (`GET /tickets/`).
3. Changing its status (`PATCH /tickets/{id}/`) persists.
4. `GET /tickets/stats/` returns valid status counts that total the list count.
5. The test ticket is deleted afterwards as cleanup.

Run it (with the backend running):

```bash
node frontend/scripts/smoke-api.mjs
# or to target a different host:
BACKEND_URL=http://localhost:8000 node frontend/scripts/smoke-api.mjs
```

Each test prints `PASS` or `FAIL`; the script exits non-zero if any test fails.

## Decisions & Tradeoffs

The frontend reaches Django through Server Components and Server Actions instead of a browser-side API client, so no CORS configuration or proxy is needed on the backend. I built the Django backend myself but coworked with an AI coding assistant for most of the Next.js work, reviewing the generated code. Ticket data is fetched uncached on every request (`cache: "no-store"`), which is simple and always fresh, but skips the client-side caching and revalidation a library like SWR or TanStack Query would provide. Pagination uses URL query params and a full server round-trip per page; a client cache or infinite scroll would feel snappier. The backend's filters (status, priority, dates) and search/ordering are not exposed in the UI, and the `stats` endpoint is covered by tests but not displayed. Form validation is minimal and defers to the backend's required fields and length limits rather than a schema validator. With more time I would add browser-level tests (e.g. Playwright), a stats dashboard, a ticket-detail/edit view, toasts and an error boundary.
