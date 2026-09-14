import os
import subprocess
import ctypes
import ctypes.wintypes
import urllib.request
import urllib.error
import json

def get_github_token():
    advapi32 = ctypes.windll.advapi32
    class CREDENTIAL(ctypes.Structure):
        _fields_ = [
            ('Flags', ctypes.wintypes.DWORD),
            ('Type', ctypes.wintypes.DWORD),
            ('TargetName', ctypes.wintypes.LPWSTR),
            ('Comment', ctypes.wintypes.LPWSTR),
            ('LastWritten', ctypes.wintypes.FILETIME),
            ('CredentialBlobSize', ctypes.wintypes.DWORD),
            ('CredentialBlob', ctypes.POINTER(ctypes.c_char)),
            ('Persist', ctypes.wintypes.DWORD),
            ('AttributeCount', ctypes.wintypes.DWORD),
            ('Attributes', ctypes.c_void_p),
            ('TargetAlias', ctypes.wintypes.LPWSTR),
            ('UserName', ctypes.wintypes.LPWSTR),
        ]
    cred_ptr = ctypes.POINTER(CREDENTIAL)()
    target = 'GitHub - https://api.github.com/luissaviobrun17-alt'
    if advapi32.CredReadW(target, 1, 0, ctypes.byref(cred_ptr)):
        cred = cred_ptr.contents
        raw = ctypes.string_at(cred.CredentialBlob, cred.CredentialBlobSize)
        token = raw.decode('utf-16-le', errors='ignore') if b'\x00' in raw else raw.decode('utf-8', errors='ignore')
        return token.strip()
    return None

def create_github_repo(token, repo_name):
    url = "https://api.github.com/user/repos"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Python-Git-Sync"
    }
    payload = {
        "name": repo_name,
        "description": "Sistema Operacional Alex Construções - Mobile-First & Desktop para Obras e Engenharia",
        "private": False,
        "auto_init": False
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            print(f"Repositório criado no GitHub: {data.get('html_url')}")
            return data.get('html_url')
    except urllib.error.HTTPError as e:
        if e.code == 422:
            print("Repositório já existe no GitHub. Continuando...")
            return f"https://github.com/luissaviobrun17-alt/{repo_name}"
        else:
            raise e

def main():
    repo_dir = r"C:\Users\Luis Brun\.gemini\antigravity\scratch\alex_construcoes"
    os.chdir(repo_dir)

    token = get_github_token()
    if not token:
        print("Erro: Token do GitHub não encontrado nas credenciais do Windows.")
        return

    repo_url = create_github_repo(token, "alex-construcoes")

    # Git init
    subprocess.run(["git", "init", "-b", "main"], check=True)
    subprocess.run(["git", "config", "user.name", "luissaviobrun17-alt"], check=True)
    subprocess.run(["git", "config", "user.email", "luissaviobrun17@gmail.com"], check=True)

    # Git add
    subprocess.run(["git", "add", "."], check=True)

    # Git commit
    commit_res = subprocess.run(["git", "commit", "-m", "feat: Sistema Operacional Alex Construções v1.0"], capture_output=True, text=True)
    print("Commit output:", commit_res.stdout)

    # Remote URL with token
    auth_remote = f"https://{token}@github.com/luissaviobrun17-alt/alex-construcoes.git"
    public_remote = "https://github.com/luissaviobrun17-alt/alex-construcoes.git"

    subprocess.run(["git", "remote", "remove", "origin"], capture_output=True)
    subprocess.run(["git", "remote", "add", "origin", auth_remote], check=True)

    # Push
    print("Enviando código para o GitHub...")
    push_res = subprocess.run(["git", "push", "-u", "origin", "main", "--force"], capture_output=True, text=True)
    print("Push output:", push_res.stdout)
    if push_res.stderr:
        print("Push info/stderr:", push_res.stderr)

    # Reverte remote origin para URL pública limpa (sem token embutido)
    subprocess.run(["git", "remote", "set-url", "origin", public_remote], check=True)

    print("=" * 60)
    print("Sucesso! Projeto publicado no GitHub em:")
    print(" -> https://github.com/luissaviobrun17-alt/alex-construcoes")
    print("=" * 60)

if __name__ == "__main__":
    main()
