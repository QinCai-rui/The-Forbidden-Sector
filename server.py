# FastAPI server for The Forbidden Sector

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import base64
import binascii
import os
from pathlib import Path

app = FastAPI(title="The Forbidden Sector", description="Scene 65: Classified Access")

USERNAME = "github"
PASSWORD = "1550"

INFO_PAGE = "info.html"
INDEX_PAGE = "index.html"
EASTER_EGG = "<div class='easter-egg'>Congratulations, explorer! You have discovered the hidden sector. <a href='https://github.com/hackclub/som-grand-survey-expedition' target='_blank'>Join the expedition</a>!</div>"

# Pydantic models for request bodies
class AuthRequest(BaseModel):
    username: str
    password: str

class AnswerRequest(BaseModel):
    type: str
    value: str = ""
    username: str = ""
    password: str = ""

# Helper functions
def file_exists(filename: str) -> bool:
    """Check if a file exists in the current directory."""
    return os.path.isfile(filename)

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

@app.get("/info.html", response_class=HTMLResponse)
async def serve_info():
    """Serve the info page."""
    return serve_file_content(INFO_PAGE)

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
    """Handle authentication requests."""
    try:
        username = auth_data.username.strip()
        password = auth_data.password.strip()
        
        if username == USERNAME and password == PASSWORD:
            return JSONResponse(
                content={"authenticated": True},
                status_code=200
            )
        else:
            return JSONResponse(
                content={"authenticated": False, "error": "Invalid credentials"},
                status_code=401
            )
    except Exception as e:
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
    
    if username == USERNAME and password == PASSWORD:
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
        
        correct = False
        
        if challenge_type == 'username':
            correct = (user_value == 'github')
        elif challenge_type == 'password':
            correct = (user_value == '1550')
        elif challenge_type == 'riddle':
            correct = user_value in ['internet', 'web', 'the internet', 'the web']
        elif challenge_type == 'crab':
            correct = (user_value == 'summerofmaking')
        elif challenge_type == 'final':
            # Handle final challenge with username and password
            username = answer_data.username.strip().lower()
            password = answer_data.password.strip()
            correct = (username == 'github' and password == '1550')
        
        return JSONResponse(content={"correct": correct}, status_code=200)
        
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
