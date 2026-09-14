import os
import subprocess
import urllib.request
import time

desktop = os.path.expanduser('~\\Desktop')
project_dir = r"C:\Users\Luis Brun\.gemini\antigravity\scratch\alex_construcoes"

# 1. Cria o launcher inteligente em python (silencioso e infalível)
launcher_py = os.path.join(project_dir, "launcher.pyw")
with open(launcher_py, "w", encoding="utf-8") as f:
    f.write('''import os
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
''')

# 2. Cria o script VBScript para gerar o atalho .lnk limpo e com ícone na Área de Trabalho
vbs_script = os.path.join(project_dir, "create_single_shortcut.vbs")
lnk_path = os.path.join(desktop, "Alex Construcoes.lnk")

vbs_code = f'''
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "{lnk_path}"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "pythonw.exe"
oLink.Arguments = """{launcher_py}"""
oLink.WorkingDirectory = "{project_dir}"
oLink.Description = "Sistema Operacional Alex Construcoes"
oLink.IconLocation = "shell32.dll,44"
oLink.Save
'''

with open(vbs_script, "w", encoding="utf-8") as f:
    f.write(vbs_code)

subprocess.run(["cscript", "//nologo", vbs_script], check=True)
if os.path.exists(vbs_script):
    os.remove(vbs_script)

# 3. Remove os outros 4 ícones duplicados ou antigos da Área de Trabalho
removed = []
for item in os.listdir(desktop):
    full_path = os.path.join(desktop, item)
    # Não deleta o nosso novo "Alex Construcoes.lnk"
    if item == "Alex Construcoes.lnk":
        continue
    if "Alex" in item or "alex" in item:
        try:
            os.remove(full_path)
            removed.append(item)
        except Exception as e:
            print(f"Erro ao remover {item}: {e}")

print(f"Atalhos removidos da Área de Trabalho: {removed}")
print(f"Atalho único mantido: Alex Construcoes.lnk")
