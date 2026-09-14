import os

desktop = os.path.expanduser('~\\Desktop')

url_content = """[InternetShortcut]
URL=http://localhost:8000
"""

bat_content = """@echo off
title Alex Construcoes - Sistema Operacional
chcp 65001 > nul
cd /d "C:\\Users\\Luis Brun\\.gemini\\antigravity\\scratch\\alex_construcoes"
start "" http://localhost:8000
python server.py
pause
"""

with open(os.path.join(desktop, 'Alex Construcoes.url'), 'w', encoding='utf-8') as f:
    f.write(url_content)

with open(os.path.join(desktop, 'Iniciar Alex Construcoes.bat'), 'w', encoding='utf-8') as f:
    f.write(bat_content)

print("Atalhos na Área de Trabalho criados com sucesso!")
