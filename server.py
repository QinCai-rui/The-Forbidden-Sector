# HTTP Auth server for The Forbidden Sector

from http.server import HTTPServer, BaseHTTPRequestHandler
 
import base64
import binascii

USERNAME = "github"
PASSWORD = "1550"

INFO_PAGE = "info.html"
INDEX_PAGE = "index.html"
EASTER_EGG = "<div class='easter-egg'>Congratulations, explorer! You have discovered the hidden sector. <a href='https://github.com/hackclub/som-grand-survey-expedition' target='_blank'>Join the expedition</a>!</div>"

class ForbiddenSectorHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/info.html":
            self.serve_file(INFO_PAGE)
            return
        if self.path == "/style.css":
            self.serve_file("style.css", content_type="text/css")
            return
        if self.path == "/script.js":
            self.serve_file("script.js", content_type="application/javascript")
            return
        if self.path == "/authenticate":
            # Special endpoint for authentication check
            auth_header = self.headers.get('Authorization')
            if not auth_header:
                self.require_auth()
                return
            
            if ' ' not in auth_header:
                self.require_auth()
                return
            auth_type, encoded = auth_header.split(' ', 1)
            if auth_type != 'Basic':
                self.require_auth()
                return
            try:
                decoded = base64.b64decode(encoded).decode('utf-8')
                username, password = decoded.split(':', 1)
            except (binascii.Error, UnicodeDecodeError, ValueError):
                self.require_auth()
                return
            if username == USERNAME and password == PASSWORD:
                # Return success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"authenticated": true}')
            else:
                # Wrong credentials - redirect to info page
                self.redirect_to_info()
            return
        # For index.html, always serve the main page first
        if self.path == "/" or self.path == "/index.html":
            self.serve_file(INDEX_PAGE)
            return
        # Fallback
        self.send_response(404)
        self.end_headers()
        self.wfile.write(b"404 Not Found")

    def require_auth(self):
        self.send_response(401)
        self.send_header('WWW-Authenticate', 'Basic realm="Forbidden Sector 65"')
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"<h1>401 Unauthorized</h1><p>Access to this sector is restricted.</p>")

    def redirect_to_info(self):
        self.send_response(302)
        self.send_header('Location', '/info.html')
        self.end_headers()

    def serve_file(self, filename, content_type="text/html"):
        try:
            with open(filename, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-type', content_type)
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")
        except OSError:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b"500 Internal Server Error")

    def serve_index_with_easter_egg(self):
        try:
            with open(INDEX_PAGE, 'r', encoding='utf-8') as f:
                html = f.read()
            # Insert easter egg before </body>
            if '</body>' in html:
                html = html.replace('</body>', f'{EASTER_EGG}</body>')
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(html.encode('utf-8'))
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")
        except OSError:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b"500 Internal Server Error")

if __name__ == "__main__":
    print("Serving Forbidden Sector on http://localhost:9082 ...")
    httpd = HTTPServer(('0.0.0.0', 9082), ForbiddenSectorHandler)
    httpd.serve_forever()
