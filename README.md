# The Forbidden Sector

A mysterious web server for Scene 65: The Forbidden Sector.

## Features

- **Auto-reload functionality** using uvicorn for development
- **FastAPI-based server** for modern API endpoints
- **Redis-based session management** to prevent memory leaks
- **Docker containerisation** with Redis for easy deployment
- **Interactive challenges** and authentication system
- **Dynamic file serving** for HTML, CSS, and JavaScript
- **Robust error handling** and logging
- **Session expiration** (24 hours) for security

## Recent Improvements

### 🚀 Fixed Authentication Issues
- **Resolved "undefined" error**: Improved JavaScript authentication flow with better error handling
- **Enhanced session validation**: Better error messages for missing or invalid session IDs
- **Added comprehensive logging**: Console logs for debugging authentication flow

### 🔄 Memory Leak Prevention
- **Replaced in-memory dictionaries with Redis**: Prevents memory leaks from session accumulation
- **Automatic session expiration**: 24-hour TTL on all sessions
- **Graceful fallback**: Falls back to in-memory storage if Redis is unavailable
- **Connection resilience**: Redis connection retry and error handling

### 🐳 Enhanced Docker Setup
- **Redis integration**: Added Redis container with persistent volume
- **Docker Compose**: Complete stack with Redis and application
- **Environment configuration**: Redis connection via environment variables
- **Data persistence**: Redis data survives container restarts

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

### Redis Backend (Production)
- **Persistent storage**: Sessions survive application restarts
- **Memory efficient**: No memory leaks from session accumulation
- **Automatic expiration**: 24-hour TTL prevents stale sessions
- **Scalable**: Multiple application instances can share session data

### In-Memory Fallback (Development)
- **Automatic fallback**: Used when Redis is unavailable
- **Development mode**: Suitable for local testing
- **Warning logged**: Clear indication when fallback is active

## API Endpoints

- `GET /` - Main index page
- `GET /info.html` - Information page with challenges
- `POST /authenticate` - Authentication endpoint
- `POST /create_session` - Create challenge tracking session
- `GET /content/authenticated` - Protected content (requires session_id)
- `GET /content/help` - Help content with challenges
- `POST /check_answer` - Challenge answer verification
- `GET /style.css` - CSS stylesheet
- `GET /script.js` - JavaScript file

## Authentication

Default credentials:

- Username: `github`
- Password: `1550`

### Authentication Flow
1. User clicks "ATTEMPT AUTHENTICATION"
2. Enters credentials in modal dialog
3. JavaScript sends POST to `/authenticate`
4. Server validates credentials and creates Redis session
5. Session ID returned to client
6. Client uses session ID to access protected content

## Error Handling

### Improved Error Messages
- **400 Bad Request**: "Missing session_id parameter" or "Invalid session_id format"
- **401 Unauthorized**: "Authentication required"
- **Detailed logging**: Server logs authentication attempts and errors
- **User-friendly alerts**: JavaScript shows clear error messages

## Development

The server includes auto-reload functionality that watches for changes in:

- Python files (server.py)
- HTML files (index.html, info.html)
- CSS files (style.css)
- JavaScript files (script.js)

## Testing

Run the session management test to verify Redis integration:

```bash
python test_session_management.py
```

This test:
- Creates 100 authentication sessions
- Measures memory usage (should be minimal with Redis)
- Verifies session access
- Demonstrates memory leak prevention

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
- **Port 6379** exposed for debugging
