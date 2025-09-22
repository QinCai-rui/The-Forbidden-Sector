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

app = FastAPI(title="The Forbidden Sector", description="Scene 65: Classified Access")

USERNAME = "github"
PASSWORD = "1550"

# Server-side session storage for authentication and challenge tracking
authenticated_sessions: Dict[str, bool] = {}
challenge_progress: Dict[str, int] = {}

INDEX_PAGE = "index.html"

# Dynamic content templates
INFO_PAGE_CONTENT = """
<div class="stars"></div>
<div class="container">
    <div class="terminal-window">
        <div class="terminal-header">
            <div class="terminal-controls">
                <span class="control close"></span>
                <span class="control minimize"></span>
                <span class="control maximize"></span>
            </div>
            <div class="terminal-title">EXPEDITION_ARCHIVES.dat</div>
        </div>
        <div class="terminal-body">
            <div class="info-header">
                <h1>🗺️ EXPEDITION MEMBER ACCESS GUIDE</h1>
                <p class="subtitle">Recovered data from the SoM Grand Survey Archive</p>
            </div>

            <div class="challenge-section">
                <h2>📋 MISSION BRIEFING</h2>
                <p>Greetings, potential expedition member! You've stumbled upon classified archives from the legendary <strong>Hack Club Summer of Making Grand Survey Expedition</strong>.</p>
                <p>To prove your worthiness and gain access to the Forbidden Sector, you must solve these challenges left behind by previous explorers.</p>
            </div>

            <div class="challenge-container">
                <div class="challenge-box">
                    <h3>🌊 Challenge 1: The Sea of Glub Navigation</h3>
                    <p>A waterlogged notebook from Scene 36 contains this cryptic message:</p>
                    <div class="cipher-text">
                        "Nine tools drift in the digital ocean. Match them to their purposes:<br>
                        <span class="highlight">Git</span> tracks changes, <span class="highlight">Docker</span> contains worlds,<br>
                        <span class="highlight">Kubernetes</span> orchestrates, <span class="highlight">Rust</span> runs fast..."
                    </div>
                    <p>The expedition leader's identity is hidden in the tool that:</p>
                    <div class="riddle-text">
                        "Manages code versions and is loved by all hackers worldwide.<br>
                        Take the name of this tool, add 'hub', and you'll find the secret door."
                    </div>
                    <p class="hint">💡 <strong>Hint:</strong> This tool + hub = a famous code hosting platform</p>
                    <form class="answer-form" data-type="username">
                        <input type="text" placeholder="Enter the tool + hub" class="answer-input" required>
                        <button type="submit" class="reveal-btn">Submit</button>
                        <div class="solution" style="display:none;"></div>
                    </form>
                </div>

                <div class="challenge-box">
                    <h3>🎭 Challenge 2: The Scene Count Mystery</h3>
                    <p>From the exploration logs, we know various scene numbers from the expedition:</p>
                    <div class="cipher-text">
                        Scene 1: Splorgon 5 (Peninsula of Dragons)<br>
                        Scene 17: Toetree Forest<br>
                        Scene 33: The Far Northeast Extremity<br>
                        Scene 65: <span class="highlight">The Forbidden Sector</span> (YOU ARE HERE)<br>
                        Scene 99: The Silly Silly Hilly Silly Hills
                    </div>
                    <p>The expedition archived clues about the access code:</p>
                    <div class="riddle-text">
                        "Count the forbidden scene number, then subtract the peninsula dragons.<br>
                        Add the extreme, multiply by the trees of toes.<br>
                        Finally subtract the silly hills. This number holds the key!"
                    </div>
                    <p class="hint">💡 <strong>Math:</strong> (65 - 1 + 33) × 17 - 99 = ?</p>
                    <form class="answer-form" data-type="password">
                        <input type="text" placeholder="Enter the password" class="answer-input" required>
                        <button type="submit" class="reveal-btn">Submit</button>
                        <div class="solution" style="display:none;"></div>
                    </form>
                </div>

                <div class="challenge-box">
                    <h3>‍☠️ Challenge 3: The Crime Scene Investigation</h3>
                    <p>From Scene 93 "The Scene of the Crime", decrypt this transmission:</p>
                    <div class="cipher-text glitch" id="glitchText">
                        >SCANNING_PRESENCE...<br>
                        >SUBJECT_DETECTED.<br>
                        >AURARIDDLE THOUGHT HE WAS BUILDING A PROJECT<br>
                        >BUT <span class="highlight">HE</span> WAS THE PROJECT.<br>
                        >WELCOME TO THE REAL SUMMER OF MAKING.
                    </div>
                    <p>The ghost in the machine asks:</p>
                    <div class="riddle-text">
                        "I haunt the Eastern Upside-Down Island (Scene 37),<br>
                        Where gravity defies and trees hang from the sky.<br>
                        My domain spans many scenes, from Bigloo Island (21) to the Forbidden Sector.<br>
                        What am I that connects all these digital realms?"
                    </div>
                    <p class="hint">💡 Think about what enables all these web scenes to exist...</p>
                    <form class="answer-form" data-type="riddle">
                        <input type="text" placeholder="What connects all scenes?" class="answer-input" required>
                        <button type="submit" class="reveal-btn">Submit</button>
                        <div class="solution" style="display:none;"></div>
                    </form>
                </div>

                <div class="challenge-box">
                    <h3>🔬 Challenge 4: The Raving Crabs Protocol</h3>
                    <p>Scene 16 documented the <em>Rhythmus brachyurus</em> (Raving Crabs). Their dance contains a secret:</p>
                    <div class="cipher-text">
                        🦀💃🕺🦀💃🕺🦀<br>
                        "The crabs dance in patterns of <span class="highlight">4-1-1-2-2-4</span><br>
                        Each number represents letters in expedition words:<br>
                        <strong>SUMM</strong>-<strong>E</strong>-<strong>R</strong>-<strong>OF</strong>-<strong>MA</strong>-<strong>KING</strong>"
                    </div>
                    <p>Arrange these expedition fragments to unlock the sequence:</p>
                    <div class="riddle-text">
                        "When the crabs rave, they spell out the expedition's motto.<br>
                        Combine all fragments in dancing order for the final key."
                    </div>
                    <form class="answer-form" data-type="crab">
                        <input type="text" placeholder="Enter the final key" class="answer-input" required>
                        <button type="submit" class="reveal-btn">Submit</button>
                        <div class="solution" style="display:none;"></div>
                    </form>
                </div>

                <div class="challenge-box danger">
                    <h3>💀 FINAL CHALLENGE: The Composite Key</h3>
                    <p>All previous challenges have led to this moment. The true access requires combining discoveries:</p>
                    <div class="cipher-text terminal-style">
                        EXPEDITION_PROTOCOL_ENGAGED<br>
                        USERNAME: [Challenge 1 Result]<br>
                        PASSWORD: [Challenge 2 Result]<br>
                        VERIFICATION: [Challenges 3 & 4 prove worthiness]<br>
                        <span class="highlight">AUTHORISATION LEVEL: SECTOR65</span>
                    </div>
                    <form class="answer-form" data-type="final">
                        <input type="text" placeholder="Username" class="answer-input" required>
                        <input type="text" placeholder="Password" class="answer-input" required>
                        <button type="submit" class="reveal-btn danger-btn">INITIATE FINAL PROTOCOL</button>
                        <div class="solution" style="display:none;"></div>
                    </form>
                </div>
            </div>

            <div class="credentials-summary" id="credentialsSummary" style="display: none;">
                <h2>🚀 EXPEDITION CREDENTIALS DISCOVERED!</h2>
                <div class="credentials-box">
                    <p><strong>Username:</strong> <code>github</code></p>
                    <p><strong>Password:</strong> <code>1550</code></p>
                </div>
                <p>Use these credentials to access the forbidden sector and uncover the hidden expedition archive!</p>
                <button class="return-btn" onclick="window.location.href='/'">🔙 Return to Forbidden Sector</button>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text">
                Challenges Completed: <span id="challengeCount">0</span>/5
            </div>

            <div class="expedition-lore">
                <h3>📚 Expedition Lore</h3>
                <p>The Summer of Making Grand Survey Expedition was a legendary journey through the realms of creativity and innovation. Participants from around the world joined forces to map uncharted territories of possibility, building projects that pushed the boundaries of what teenagers could create.</p>
                <p>Each expedition member was given special access codes to navigate the various sectors of the digital cosmos. Only those who proved their dedication to the mission of making could access the most classified areas.</p>
                <p>(This lore is purely AI-generated and makes no sense, and that is the point here)</p>
                <p>Are you ready to join their ranks?</p>
            </div>
        </div>
    </div>
</div>
"""

EASTER_EGG_CONTENT = """
<div class="hidden-container">
    <div class="hidden-content">
        <header class="secret-header">
            <h1 class="glitch" data-text="SCENE 65 UNLOCKED">SCENE 65 UNLOCKED</h1>
            <p class="access-granted">Access Granted - Welcome to the Forbidden Archive</p>
        </header>

        <div class="expedition-details">
            <h2>THE GRAND SURVEY EXPEDITION</h2>
            <p>Congratulations! You've successfully infiltrated the forbidden sector and discovered the hidden archive of the <strong>Hack Club Summer of Making Grand Survey Expedition</strong>.</p>
            
            <h3>🚀 Mission Briefing:</h3>
            <p>The Grand Survey was a legendary expedition across the digital cosmos, mapping uncharted territories of creativity and innovation during the Summer of Making.</p>
            
            <h3>📡 Discovered Artifacts:</h3>
            <ul>
                <li><strong>Project Constellation:</strong> A mapping of maker projects across space-time</li>
                <li><strong>The Creativity Engine:</strong> Quantum algorithms for inspiration generation</li>
                <li><strong>Community Nexus:</strong> Interdimensional communication protocols</li>
                <li><strong>Innovation Protocols:</strong> Guidelines for reality-bending projects</li>
            </ul>
            
            <h3>🔬 Secret Research Data:</h3>
            <div class="data-block">
                <code>
                EXPEDITION_STATUS: ONGOING<br>
                DIMENSIONS_MAPPED: ∞<br>
                MAKERS_INSPIRED: 47,892<br>
                PROJECTS_CREATED: COUNTLESS<br>
                IMPOSSIBLE_MADE_POSSIBLE: TRUE
                </code>
            </div>
            
            <h3>🌟 Your Mission, Should You Choose to Accept:</h3>
            <p>Join the ongoing expedition! Create something impossible, map new territories of learning, and add your discoveries to the Grand Survey archive.</p>
            
            <div class="expedition-links">
                <a href="https://isle.a.hackclub.dev/scenes/27" target="_blank" class="expedition-link">
                    🗺️ Access the Discouraged Sector (Scene 27)
                </a>
                <a href="
                <div class="hidden-message">
                    <strong>Classified Note:</strong> The true treasure was the friends and projects made along the way. 
                    Keep exploring, keep creating, and remember: in the world of making, there are no forbidden sectors—only undiscovered possibilities.
                </div>
            </div>
        </div>

        <footer class="secret-footer">
            <p>🔒 Scene 65 Classified Archive | Clearance Level: ULTRA</p>
        </footer>
    </div>
</div>
"""

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
    return session_id in authenticated_sessions and authenticated_sessions[session_id]

def get_challenge_count(session_id: str) -> int:
    """Get challenge completion count for a session."""
    return challenge_progress.get(session_id, 0)

def increment_challenge_count(session_id: str) -> int:
    """Increment challenge completion count for a session."""
    current_count = challenge_progress.get(session_id, 0)
    challenge_progress[session_id] = current_count + 1
    return challenge_progress[session_id]

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
    return JSONResponse(content={"html": INFO_PAGE_CONTENT}, status_code=200)

@app.post("/create_session")
async def create_session():
    """Create a new session for challenge tracking."""
    session_id = create_session_id()
    challenge_progress[session_id] = 0
    return JSONResponse(content={"session_id": session_id}, status_code=200)

@app.get("/content/authenticated")
async def get_authenticated_content(session_id: str = None):
    """Serve easter egg content for authenticated users."""
    # Validate session_id is a valid UUID
    try:
        if not session_id:
            raise ValueError
        uuid.UUID(session_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid session_id format")
    if not is_authenticated(session_id):
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return JSONResponse(content={"html": EASTER_EGG_CONTENT}, status_code=200)

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
    """Handle authentication requests."""
    try:
        username = auth_data.username.strip()
        password = auth_data.password.strip()
        
        if username == USERNAME and password == PASSWORD:
            # Create new session
            session_id = create_session_id()
            authenticated_sessions[session_id] = True
            
            return JSONResponse(
                content={"authenticated": True, "session_id": session_id},
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
