"""Codificação: o mesmo texto em UTF-8 lido como Latin-1 (e o caminho inverso).

Acentos são bytes diferentes conforme a codificação. Ler bytes com a
codificação errada gera texto corrompido; decodificar bytes que não são
UTF-8 gera UnicodeDecodeError.
"""
texto = "São Paulo, café"
dados_utf8 = texto.encode("utf-8")
print("bytes em UTF-8:", dados_utf8)
print("lido como latin-1:", dados_utf8.decode("latin-1"))
print("decodificado corretamente:", dados_utf8.decode("utf-8"))

dados_latin1 = texto.encode("latin-1")
try:
    dados_latin1.decode("utf-8")
except UnicodeDecodeError as e:
    print("UnicodeDecodeError:", e)
print("decodificado com a codificação certa:", dados_latin1.decode("latin-1"))
