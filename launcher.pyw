import os
import sys
import time
import urllib.request
import subprocess
import webbrowser

PORT = 8000
project_dir = os.path.dirname(os.path.abspath(__file__))

def is_server_running():
    try:
        r = urllib.request.urlopen(f"http://localhost:{PORT}/api/info", timeout=1.5)
        return r.status == 200
    except Exception:
        return False

# Se o servidor não estiver rodando, sobe em segundo plano
if not is_server_running():
    server_py = os.path.join(project_dir, "server.py")
    subprocess.Popen([sys.executable.replace("pythonw.exe", "python.exe"), server_py],
                     cwd=project_dir,
                     creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    # Espera até 3 segundos para o servidor subir
    for _ in range(15):
        if is_server_running():
            break
        time.sleep(0.2)

# Abre o navegador padrão na página inicial
webbrowser.open(f"http://localhost:{PORT}")
