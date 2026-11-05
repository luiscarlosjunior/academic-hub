"""Reprodutibilidade de artefatos: por que promover o MESMO arquivo importa.

Empacota o mesmo código duas vezes em arquivos zip. Com o carimbo de tempo
atual, o conteúdo muda e o hash também. Com carimbo fixo, o hash é estável.
Usa apenas biblioteca padrão e diretório temporário.
"""
import hashlib
import io
import os
import tempfile
import time
import zipfile

CODIGO = b"def saudacao():\n    return 'ola'\n"

def empacota(data_hora):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        info = zipfile.ZipInfo("app.py", date_time=data_hora)
        info.compress_type = zipfile.ZIP_DEFLATED
        z.writestr(info, CODIGO)
    return buf.getvalue()

def sha(b):
    return hashlib.sha256(b).hexdigest()[:16]

agora1 = time.localtime(time.time())[:6]
time.sleep(1.1)
agora2 = time.localtime(time.time())[:6]
a, b = empacota(agora1), empacota(agora2)
print("mesmo código, duas construções com relógio diferente:")
print("  hash 1:", sha(a))
print("  hash 2:", sha(b))
print("  idênticos?", sha(a) == sha(b))

fixo = (2026, 10, 1, 12, 0, 0)
c, d = empacota(fixo), empacota(fixo)
print("com carimbo fixo, construções idênticas?", sha(c) == sha(d))

with tempfile.TemporaryDirectory() as tmp:
    caminho = os.path.join(tmp, "app.zip")
    with open(caminho, "wb") as f:
        f.write(c)
    with open(caminho, "rb") as f:
        promovido = f.read()
    print("artefato promovido é o mesmo testado?", sha(promovido) == sha(c))
