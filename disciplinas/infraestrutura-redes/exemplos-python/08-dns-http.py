"""DNS iterativo com cache por TTL, e a requisição HTTP/1.1.

Parte 1: resolvedor que consulta raiz, depois o servidor do TLD e depois o autoritativo,
  guardando a resposta no cache pelo tempo de vida (TTL) do registro.
Parte 2: uma requisição HTTP/1.1 e o que o servidor faz com ela. HTTP/1.1 exige o
  cabeçalho Host, porque um servidor pode hospedar vários sites no mesmo IP.
Não há rede: as zonas são dicionários, para que a saída seja sempre igual.
"""

# Zonas simuladas: cada servidor responde por um pedaço da árvore de nomes.
RAIZ = {"com.": "ns.tld-com"}
TLD_COM = {"exemplo.com.": "ns1.exemplo.com."}
AUTORITATIVO = {"exemplo.com.": ("93.184.216.34", 3600)}  # (IP, TTL em segundos)


class Resolvedor:
    def __init__(self):
        self.cache = {}  # nome -> (ip, expira_em)

    def resolve(self, nome, agora):
        if nome in self.cache and self.cache[nome][1] > agora:
            ip, expira = self.cache[nome]
            return ip, [f"cache: {nome} -> {ip} (expira em t={expira})"]

        # Iterativo: o resolvedor pergunta a cada nível, e cada um devolve o próximo servidor
        passos = [f"raiz: quem atende o domínio com.? -> {RAIZ['com.']}",
                  f"tld: quem atende {nome}? -> {TLD_COM[nome]}"]
        ip, ttl = AUTORITATIVO[nome]
        passos.append(f"autoritativo: A de {nome}? -> {ip} (TTL {ttl})")
        self.cache[nome] = (ip, agora + ttl)
        return ip, passos


def analisa_requisicao(bruta: str):
    """Separa a linha de requisição e os cabeçalhos, e aplica a regra do Host do HTTP/1.1."""
    linhas = bruta.split("\r\n")
    metodo, caminho, versao = linhas[0].split(" ")
    cabecalhos = {}
    for linha in linhas[1:]:
        if not linha:
            break
        nome, valor = linha.split(":", 1)
        cabecalhos[nome.strip().lower()] = valor.strip()
    if versao == "HTTP/1.1" and "host" not in cabecalhos:
        return metodo, caminho, versao, 400, "falta o cabeçalho Host"
    site = cabecalhos.get("host", "(site padrão do IP)")
    return metodo, caminho, versao, 200, f"serve {caminho} para o site {site}"


if __name__ == "__main__":
    print("Parte 1: resolução iterativa e cache")
    r = Resolvedor()
    for agora in (0, 100, 3600, 3601):
        ip, passos = r.resolve("exemplo.com.", agora)
        print(f"  t={agora:>4}: exemplo.com. -> {ip}")
        for p in passos:
            print(f"           {p}")

    print("\nParte 2: requisição HTTP/1.1")
    bruta = "GET /index.html HTTP/1.1\r\nHost: exemplo.com\r\nAccept: text/html\r\n\r\n"
    metodo, caminho, versao, codigo, motivo = analisa_requisicao(bruta)[:5]
    print(f"  {metodo} {caminho} {versao} -> {codigo}: {motivo}")
    sem_host = "GET /index.html HTTP/1.1\r\nAccept: text/html\r\n\r\n"
    *_, codigo2, motivo2 = analisa_requisicao(sem_host)
    print(f"  sem Host: -> {codigo2}: {motivo2}")
    versao_10 = "GET /index.html HTTP/1.0\r\n\r\n"
    *_, codigo3, motivo3 = analisa_requisicao(versao_10)
    print(f"  HTTP/1.0 sem Host: -> {codigo3}: {motivo3}")
