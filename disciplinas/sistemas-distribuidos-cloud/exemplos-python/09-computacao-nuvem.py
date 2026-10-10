"""
Tópico 9 · Elasticidade, custo e disponibilidade na nuvem.
Execute com: python3 09-computacao-nuvem.py
"""
import math

DEMANDA = [20, 35, 60, 90, 120, 110, 70, 40, 25, 15, 30, 80]   # requisições por intervalo
CAPACIDADE = 30                                                   # requisições por instância
PRECO_INSTANCIA = 0.10                                            # custo por instância e intervalo (ilustrativo)


def simula(politica, demanda=DEMANDA):
    """Devolve (requisições perdidas, instâncias-intervalo pagas).

    Política 'fixa:N' mantém N instâncias; 'auto' ajusta com 1 intervalo de atraso,
    pois só vê a demanda do intervalo anterior.
    """
    perdidas = 0
    pagas = 0
    for t, d in enumerate(demanda):
        if politica == "auto":
            anterior = demanda[t - 1] if t > 0 else demanda[0]
            n = max(1, math.ceil(anterior / CAPACIDADE))
        else:
            n = int(politica.split(":")[1])
        pagas += n
        perdidas += max(0, d - n * CAPACIDADE)
    return perdidas, pagas


def disponibilidade_zonas(a, k):
    """Disponibilidade de um serviço replicado em k zonas independentes, cada uma com disponibilidade a."""
    return 1 - (1 - a) ** k


if __name__ == "__main__":
    print("Demanda em 12 intervalos, instância = 30 requisições, preço ilustrativo de 0,10 por instância-intervalo")
    print(f"  {'política':<12} {'perdidas':>9} {'instâncias-intervalo':>21} {'custo':>8}")
    for politica in ("fixa:2", "fixa:4", "auto"):
        perdidas, pagas = simula(politica)
        custo = pagas * PRECO_INSTANCIA
        print(f"  {politica:<12} {perdidas:>9} {pagas:>21} {custo:>8.2f}")

    print("\nDisponibilidade de um serviço com réplica por zona (cada zona com 99%):")
    for k in (1, 2, 3):
        print(f"  {k} zona(s): {disponibilidade_zonas(0.99, k) * 100:.4f}%")
    print("  Supõe falhas independentes. Zonas compartilham energia e rede, então na prática o ganho é menor.")
