# FastAPI server for The Forbidden Sector

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import base64
import binascii
import os
from pathlib import Path
import uuid
from typing import Dict
import redis
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="The Forbidden Sector", description="Scene 65: Classified Access")

############################
USERNAME = "github"        #
PASSWORD = "1550"          #
############################

# Redis connection for session storage to avoid memory leaks
try:
    redis_client = redis.Redis(
        host=os.getenv("REDIS_HOST", "redis"),
        port=int(os.getenv("REDIS_PORT", "6379")),
        db=0,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
        retry_on_timeout=True
    )
    # Test connection
    redis_client.ping()
    logger.info("Connected to Redis successfully")
except (redis.ConnectionError, redis.TimeoutError, Exception) as e:
    logger.warning(f"Redis connection failed: {e}. Falling back to in-memory storage.")
    redis_client = None

# Fallback in-memory storage if Redis is not available
authenticated_sessions: Dict[str, bool] = {}
challenge_progress: Dict[str, int] = {}

INDEX_PAGE = "index.html"

# Dynamic content templates
TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"


def load_template(name: str) -> str:
    """Load a template file from the templates directory and return its string contents.

    Raises HTTPException(500) if the file can't be read.
    """
    template_path = TEMPLATES_DIR / name
    try:
        if not template_path.exists():
            logger.error(f"Template not found: {template_path}")
            raise HTTPException(status_code=500, detail="Template not found")
        return template_path.read_text(encoding="utf-8")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading template {name}: {e}")
        raise HTTPException(status_code=500, detail="Error reading template")

# Pydantic models for request bodies
class AuthRequest(BaseModel):
    username: str
    password: str

class AnswerRequest(BaseModel):
    type: str
    value: str = ""
    username: str = ""
    password: str = ""
    session_id: str = ""

# Helper functions
def file_exists(filename: str) -> bool:
    """Check if a file exists in the current directory."""
    return os.path.isfile(filename)

def create_session_id() -> str:
    """Create a unique session ID."""
    return str(uuid.uuid4())

def is_authenticated(session_id: str) -> bool:
    """Check if a session is authenticated."""
    if redis_client:
        try:
            result = redis_client.get(f"auth:{session_id}")
            return result == "true"
        except Exception as e:
            logger.error(f"Redis error checking authentication: {e}")
            return False
    else:
        return session_id in authenticated_sessions and authenticated_sessions[session_id]

def set_authenticated(session_id: str, authenticated: bool = True) -> None:
    """Set authentication status for a session."""
    if redis_client:
        try:
            if authenticated:
                # Set with expiration (24 hours)
                redis_client.setex(f"auth:{session_id}", 86400, "true")
            else:
                redis_client.delete(f"auth:{session_id}")
        except Exception as e:
            logger.error(f"Redis error setting authentication: {e}")
    else:
        authenticated_sessions[session_id] = authenticated

def get_challenge_count(session_id: str) -> int:
    """Get challenge completion count for a session."""
    if redis_client:
        try:
            result = redis_client.get(f"challenge:{session_id}")
            return int(result) if result else 0
        except Exception as e:
            logger.error(f"Redis error getting challenge count: {e}")
            return 0
    else:
        return challenge_progress.get(session_id, 0)

def increment_challenge_count(session_id: str) -> int:
    """Increment challenge completion count for a session."""
    if redis_client:
        try:
            result = redis_client.incr(f"challenge:{session_id}")
            # Set expiration on first increment
            if result == 1:
                redis_client.expire(f"challenge:{session_id}", 86400)
            return result
        except Exception as e:
            logger.error(f"Redis error incrementing challenge count: {e}")
            return 0
    else:
        current_count = challenge_progress.get(session_id, 0)
        challenge_progress[session_id] = current_count + 1
        return challenge_progress[session_id]

def set_challenge_count(session_id: str, count: int) -> None:
    """Set challenge completion count for a session."""
    if redis_client:
        try:
            redis_client.setex(f"challenge:{session_id}", 86400, str(count))
        except Exception as e:
            logger.error(f"Redis error setting challenge count: {e}")
    else:
        challenge_progress[session_id] = count

def serve_file_content(filename: str, content_type: str = "text/html") -> Response:
    """Serve file content with proper error handling."""
    try:
        if not file_exists(filename):
            raise HTTPException(status_code=404, detail="File not found")
        
        with open(filename, 'rb') as f:
            content = f.read()
        
        return Response(content=content, media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# Routes
@app.get("/", response_class=HTMLResponse)
@app.get("/index.html", response_class=HTMLResponse)
async def serve_index():
    """Serve the main index page."""
    return serve_file_content(INDEX_PAGE)

@app.get("/content/help")
async def get_help_content():
    """Serve help/info page content dynamically."""
    html = load_template("info.html")
    return JSONResponse(content={"html": html}, status_code=200)

@app.post("/create_session")
async def create_session():
    """Create a new session for challenge tracking."""
    session_id = create_session_id()
    set_challenge_count(session_id, 0)
    return JSONResponse(content={"session_id": session_id}, status_code=200)

@app.post("/content/authenticated")
async def get_authenticated_content_post(auth_data: AuthRequest):
    """Serve easter egg content for authenticated users via direct credential verification."""
    try:
        username = auth_data.username.strip().lower()
        password = auth_data.password.strip()
        
        if username == USERNAME.lower() and password == PASSWORD:
            logger.info(f"Direct authentication successful for user: {username}")
            html = load_template("easter_egg.html")
            return JSONResponse(content={"html": html}, status_code=200)
        else:
            logger.warning(f"Invalid credentials attempt: {username}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=400, detail="Invalid request format")

@app.get("/content/authenticated")
async def get_authenticated_content(session_id: str = None):
    """Serve easter egg content for authenticated users (legacy UUID-based auth)."""
    # Validate session_id is provided
    if not session_id:
        logger.warning("Authentication attempt without session_id")
        raise HTTPException(status_code=400, detail="Missing session_id parameter")
    
    # Validate session_id is a valid UUID
    try:
        uuid.UUID(session_id)
    except (ValueError, TypeError) as e:
        logger.warning(f"Invalid session_id format: {session_id}")
        raise HTTPException(status_code=400, detail="Invalid session_id format")
    
    # Check if session is authenticated
    if not is_authenticated(session_id):
        logger.warning(f"Unauthenticated access attempt with session_id: {session_id}")
        raise HTTPException(status_code=401, detail="Authentication required")
    
    logger.info(f"Serving authenticated content for session: {session_id}")
    html = load_template("easter_egg.html")
    return JSONResponse(content={"html": html}, status_code=200)

@app.get("/info.html")
async def block_info_access():
    """Block direct access to info page - redirect to main page."""
    return Response(
        status_code=302,
        headers={"Location": "/"}
    )

@app.get("/style.css")
async def serve_css():
    """Serve the CSS file."""
    return serve_file_content("style.css", "text/css")

@app.get("/script.js")
async def serve_js():
    """Serve the JavaScript file."""
    return serve_file_content("script.js", "application/javascript")

@app.post("/authenticate")
async def authenticate(auth_data: AuthRequest):
    """Handle authentication requests - simplified without session management."""
    try:
        username = auth_data.username.strip().lower()
        password = auth_data.password.strip()
        
        if username == USERNAME.lower() and password == PASSWORD:
            logger.info(f"Authentication successful for user: {username}")
            return JSONResponse(
                content={"authenticated": True},
                status_code=200
            )
        else:
            logger.warning(f"Invalid credentials attempt: {username}")
            return JSONResponse(
                content={"authenticated": False, "error": "Invalid credentials"},
                status_code=401
            )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return JSONResponse(
            content={"authenticated": False, "error": "Invalid JSON"},
            status_code=400
        )

@app.get("/authenticate")
async def authenticate_get(request: Request):
    """Handle GET authentication with Basic Auth."""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return Response(
            content="<h1>401 Unauthorized</h1><p>Access to this sector is restricted.</p>",
            status_code=401,
            headers={"WWW-Authenticate": 'Basic realm="Forbidden Sector 65"'},
            media_type="text/html"
        )
    
    if ' ' not in auth_header:
        return Response(
            content="<h1>401 Unauthorized</h1><p>Access to this sector is restricted.</p>",
            status_code=401,
            headers={"WWW-Authenticate": 'Basic realm="Forbidden Sector 65"'},
            media_type="text/html"
        )
    
    auth_type, encoded = auth_header.split(' ', 1)
    if auth_type != 'Basic':
        return Response(
            content="<h1>401 Unauthorized</h1><p>Access to this sector is restricted.</p>",
            status_code=401,
            headers={"WWW-Authenticate": 'Basic realm="Forbidden Sector 65"'},
            media_type="text/html"
        )
    
    try:
        decoded = base64.b64decode(encoded).decode('utf-8')
        username, password = decoded.split(':', 1)
    except (binascii.Error, UnicodeDecodeError, ValueError):
        return Response(
            content="<h1>401 Unauthorized</h1><p>Access to this sector is restricted.</p>",
            status_code=401,
            headers={"WWW-Authenticate": 'Basic realm="Forbidden Sector 65"'},
            media_type="text/html"
        )
    
    if username.lower() == USERNAME.lower() and password == PASSWORD:
        return JSONResponse(content={"authenticated": True}, status_code=200)
    else:
        return Response(
            status_code=302,
            headers={"Location": "/info.html"}
        )

@app.post("/check_answer")
async def check_answer(answer_data: AnswerRequest):
    """Handle challenge answer checking."""
    try:
        challenge_type = answer_data.type.strip()
        user_value = answer_data.value.strip().lower()
        session_id = answer_data.session_id.strip() if answer_data.session_id else ""
        
        correct = False
        
        if challenge_type == 'username':
            correct = (user_value == 'github')
        elif challenge_type == 'password':
            correct = (user_value == '1550')
        elif challenge_type == 'riddle':
            correct = user_value in ['internet', 'web', 'the internet', 'the web']
        elif challenge_type == 'crab':
            correct = user_value in ['summerofmaking', 'som', 'summer of making']
        elif challenge_type == 'final':
            # Handle final challenge with username and password
            username = answer_data.username.strip().lower()
            password = answer_data.password.strip()
            correct = (username == 'github' and password == '1550')
        
        # Track challenge completion server-side
        challenge_count = get_challenge_count(session_id)
        if correct and session_id:
            challenge_count = increment_challenge_count(session_id)
        
        return JSONResponse(content={
            "correct": correct, 
            "challenge_count": challenge_count
        }, status_code=200)
        
    except Exception as e:
        return JSONResponse(
            content={"correct": False, "error": "Invalid JSON"},
            status_code=400
        )

# 404 handler
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return Response(content="404 Not Found", status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=9082,
        reload=True,
        reload_dirs=["."],
        log_level="info"
    )
