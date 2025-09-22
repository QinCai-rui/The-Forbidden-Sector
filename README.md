# The Forbidden Sector

A mysterious web server for Scene 65: The Forbidden Sector. This application has been modernized with FastAPI and includes auto-reload functionality and Docker support.

## Features

- **Auto-reload functionality** using uvicorn for development
- **FastAPI-based server** for modern API endpoints
- **Docker containerization** for easy deployment
- **Interactive challenges** and authentication system
- **Static file serving** for HTML, CSS, and JavaScript

## Running the Server

### Method 1: Direct Python Execution

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python server.py
```

The server will start with auto-reload enabled on `http://localhost:9082`

### Method 2: Using uvicorn directly

```bash
uvicorn server:app --host 0.0.0.0 --port 9082 --reload
```

### Method 3: Using Docker

1. Build the Docker image:
```bash
docker build -t forbidden-sector .
```

2. Run the container:
```bash
docker run -p 9082:9082 forbidden-sector
```

### Method 4: Using Docker Compose (Recommended)

```bash
docker compose up
```

This will build and run the container with volume mounting for development.

## Development

The server includes auto-reload functionality that watches for changes in:
- Python files (server.py)
- HTML files (index.html, info.html)
- CSS files (style.css)
- JavaScript files (script.js)

Any changes to these files will automatically restart the server.

## API Endpoints

- `GET /` - Main index page
- `GET /info.html` - Information page with challenges
- `POST /authenticate` - Authentication endpoint
- `POST /check_answer` - Challenge answer verification
- `GET /style.css` - CSS stylesheet
- `GET /script.js` - JavaScript file

## Authentication

Default credentials:
- Username: `github`
- Password: `1550`

## Docker Environment

The Dockerfile creates a lightweight Python environment with:
- FastAPI and uvicorn installed
- Auto-reload enabled for development
- Port 9082 exposed
- Volume mounting support for live development