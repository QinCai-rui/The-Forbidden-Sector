# The Forbidden Sector

A mysterious web server for Scene 65: The Forbidden Sector.

## Features

- Auto-reload (uvicorn) for development
- FastAPI server
- Redis-backed sessions with in-memory fallback
- Docker Compose stack for app + Redis
- Interactive client-side challenges and auth
- Static + dynamic content serving (HTML/CSS/JS)

## Running the Server

### Method 1: Docker Compose (Recommended)

The complete stack includes Redis for session management:

```bash
docker compose up --build -d
```

This starts:

- Redis server for session storage
- FastAPI application server
- Automatic volume mounting for development

### Method 2: Direct Python Execution

1. Start Redis server (optional - will fallback to in-memory if not available):

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7.2-alpine

# Or install Redis locally and run: redis-server
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
python server.py
```

### Method 3: Using Docker (Application Only)

```bash
docker build -t forbidden-sector .
docker run -p 9082:9082 forbidden-sector
```

The server will start on `http://localhost:9082`

## Session Management

### Redis Backend (Prod)

- **Persistent storage**: Sessions survive application restarts
- **Memory efficient**: No memory leaks from session accumulation
- **Automatic expiration**: 24-hour TTL prevents stale sessions
- **Scalable**: Multiple application instances can share session data

### In-Memory Fallback

- **Automatic fallback**: Used when Redis is unavailable
- **Development mode**: Suitable for local testing
- **Warning logged**: Clear indication when fallback is active

## API Endpoints

- `GET /` - Main index page
- `GET /info.html` - (redirects to `/` by design)
- `GET /content/help` - Challenge HTML (loaded dynamically)
- `POST /create_session` - returns `{ "session_id": "..." }`
- `POST /check_answer` - submit answers
- `POST /authenticate` - JSON username/password auth
- `GET /style.css`, `GET /script.js` - static assets

## Redirect command (YAY YOU FOUND IT!!)

Type **`help`** (keyboard sequence) on the landing page to load the interactive challenge UI. Direct `GET /info.html` is redirected to `/` intentionally.

Want the username and password? It's here somewhere... hmm...

## Development

The server includes auto-reload functionality that watches for changes in:

- Python files (server.py)
- HTML files (index.html, info.html)
- CSS files (style.css)
- JavaScript files (script.js)

## Environment Variables

- `REDIS_HOST`: Redis server hostname (default: "redis")
- `REDIS_PORT`: Redis server port (default: "6379")

## Docker Environment

The Docker setup includes:

### Application Container

- **Base**: Python 3.12 slim
- **FastAPI and uvicorn** with auto-reload
- **Redis client** for session management
- **Port 9082** exposed
- **Volume mounting** for development

### Redis Container

- **Base**: Redis 7.2 Alpine
- **Persistent volume** for data storage
- **Optimized configuration** with AOF persistence