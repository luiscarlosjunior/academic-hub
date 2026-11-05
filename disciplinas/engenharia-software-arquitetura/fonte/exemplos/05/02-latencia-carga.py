"""Trade-off entre custo e latência: modelo de fila M/M/1.

Um serviço com taxa de atendimento mu (req/s) recebendo taxa de chegada
lambda (req/s) tem utilização rho = lambda/mu e tempo médio de resposta
W = 1/(mu - lambda) para rho < 1 (Kleinrock, 1975). A resposta cresce sem
limite perto da saturação, por isso dobrar a carga não dobra a latência.
"""

MU = 100.0   # req/s que uma instância atende (valor ilustrativo)

print(f"{'carga (rho)':>12} {'lambda':>8} {'latência média (ms)':>22}")
for rho in [0.50, 0.75, 0.90, 0.95, 0.99]:
    lam = rho * MU
    w_ms = 1000.0 / (MU - lam)
    print(f"{rho:>12.2f} {lam:>8.1f} {w_ms:>22.1f}")

print()
# Quantas instâncias para manter a latência abaixo de 50 ms com lambda = 300 req/s?
lam = 300.0
for n in range(1, 8):
    mu_total = n * MU
    if mu_total <= lam:
        continue
    w_ms = 1000.0 / (mu_total - lam)
    if w_ms <= 50:
        print(f"instâncias necessárias para W <= 50 ms: {n} (W = {w_ms:.1f} ms)")
        break
