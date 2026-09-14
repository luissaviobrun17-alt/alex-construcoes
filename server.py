import http.server
import socketserver
import json
import os
import socket
import webbrowser
import sys
import traceback
import time

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(DIRECTORY, "database.json")

def get_local_ip():
    """Detecta o IP real da interface de rede local (Wi-Fi/Ethernet)"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        pass
    try:
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith("127.") and not ip.startswith("169.254."):
                return ip
    except Exception:
        pass
    return "192.168.2.122"

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        # Ignora desconexões normais de navegador sem crashar o processo
        ex_type, ex_val, _ = sys.exc_info()
        if ex_type in (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            return
        print(f"[Aviso de Rede] Cliente {client_address}: {ex_val}")

class AlexHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Log simplificado
        pass

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        try:
            if self.path == '/api/info':
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                info = {
                    "local_ip": get_local_ip(),
                    "port": PORT,
                    "mobile_url": f"http://{get_local_ip()}:{PORT}"
                }
                self.wfile.write(json.dumps(info).encode('utf-8'))
                return

            if self.path == '/api/data':
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                if os.path.exists(DB_FILE):
                    with open(DB_FILE, 'r', encoding='utf-8') as f:
                        data = f.read()
                else:
                    data = "{}"
                self.wfile.write(data.encode('utf-8'))
                return

            super().do_GET()
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            pass

    def do_POST(self):
        try:
            if self.path == '/api/data':
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                try:
                    parsed = json.loads(post_data.decode('utf-8'))
                    parsed['lastModified'] = int(time.time() * 1000)
                    with open(DB_FILE, 'w', encoding='utf-8') as f:
                        json.dump(parsed, f, indent=2, ensure_ascii=False)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "status": "success",
                        "message": "Dados salvos e sincronizados com sucesso",
                        "lastModified": parsed['lastModified']
                    }).encode('utf-8'))
                except Exception as e:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
                return

            self.send_response(404)
            self.end_headers()
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            pass

def main():
    local_ip = get_local_ip()
    print("=" * 70)
    print("  SISTEMA OPERACIONAL ALEX CONSTRUÇÕES - SERVIDOR MULTI-THREAD ATIVO")
    print("=" * 70)
    print(f" -> Computador Local:       http://localhost:{PORT}")
    print(f" -> Celular (Rede Wi-Fi):   http://{local_ip}:{PORT}")
    print("=" * 70)
    print(" Sincronização em tempo real ativa e blindada contra desconexões.")
    print("=" * 70)

    if "--open" in sys.argv:
        try:
            webbrowser.open(f"http://localhost:{PORT}")
        except Exception:
            pass

    while True:
        try:
            server = ThreadingHTTPServer(("0.0.0.0", PORT), AlexHandler)
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado pelo usuário.")
            break
        except Exception as e:
            print(f"[Aviso do Servidor] Reiniciando após exceção: {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()
