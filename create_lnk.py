import os
import subprocess

desktop = os.path.expanduser('~\\Desktop')
target_bat = os.path.join(desktop, 'Iniciar Alex Construcoes.bat')
work_dir = r"C:\Users\Luis Brun\.gemini\antigravity\scratch\alex_construcoes"

vbs_content = f'''
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "{desktop}\\Alex Construcoes - Sistema.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "{target_bat}"
oLink.WorkingDirectory = "{work_dir}"
oLink.Description = "Sistema Operacional Alex Construcoes"
oLink.IconLocation = "shell32.dll,44"
oLink.Save
'''

vbs_path = os.path.join(work_dir, "make_shortcut.vbs")
with open(vbs_path, "w", encoding="utf-8") as f:
    f.write(vbs_content)

res = subprocess.run(["cscript", "//nologo", vbs_path], capture_output=True, text=True)
print("VBS result:", res.returncode, res.stdout, res.stderr)
if os.path.exists(vbs_path):
    os.remove(vbs_path)
print("Atalho .lnk criado com sucesso!")
