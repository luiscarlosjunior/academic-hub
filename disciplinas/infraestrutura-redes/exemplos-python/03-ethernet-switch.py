"""Switch Ethernet com aprendizado de endereços MAC e VLANs.

O switch olha o MAC de origem de cada quadro e grava em qual porta ele está
(aprendizado). Para o MAC de destino:
  - se está na tabela, encaminha só pela porta conhecida (unicast);
  - se não está, ou se é broadcast, inunda por todas as portas, exceto a de entrada.
Com VLANs, o flood fica restrito à VLAN do quadro.
"""

BROADCAST = "ff:ff:ff:ff:ff:ff"


class Switch:
    def __init__(self, portas, vlan_por_porta=None):
        self.portas = list(portas)
        # Cada porta pertence a uma VLAN; sem configuração, tudo fica na VLAN 1.
        self.vlan_por_porta = vlan_por_porta or {p: 1 for p in self.portas}
        self.tabela = {}  # (vlan, mac) -> porta

    def recebe(self, porta_entrada, origem, destino):
        vlan = self.vlan_por_porta[porta_entrada]
        self.tabela[(vlan, origem)] = porta_entrada  # aprendizado
        if destino != BROADCAST and (vlan, destino) in self.tabela:
            destino_porta = self.tabela[(vlan, destino)]
            if destino_porta == porta_entrada:
                return "descarta (destino está na mesma porta)"
            return f"unicast para porta {destino_porta}"
        saida = [p for p in self.portas
                 if p != porta_entrada and self.vlan_por_porta[p] == vlan]
        motivo = "broadcast" if destino == BROADCAST else "destino desconhecido"
        return f"flood ({motivo}) para portas {saida}"


if __name__ == "__main__":
    print("Parte 1: aprendizado e flood")
    sw = Switch(portas=[1, 2, 3, 4])
    h1, h2, h3 = "aa:00:00:00:00:01", "aa:00:00:00:00:02", "aa:00:00:00:00:03"
    estacoes = {h1: 1, h2: 2, h3: 3}
    passos = [
        (h1, h2),  # H1 -> H2: switch ainda não conhece H2
        (h2, h1),  # H2 -> H1: switch aprende H2 e já conhece H1
        (h1, h2),  # H1 -> H2: agora é unicast
        (h3, BROADCAST),  # H3 envia ARP em broadcast
    ]
    for origem, destino in passos:
        porta = estacoes[origem]
        nome = {h1: "H1", h2: "H2", h3: "H3"}
        dst = {h1: "H1", h2: "H2", h3: "H3", BROADCAST: "broadcast"}[destino]
        print(f"  {nome[origem]} (porta {porta}) -> {dst}: {sw.recebe(porta, origem, destino)}")
    print(f"  tabela de MAC: {len(sw.tabela)} entradas")
    for (vlan, mac), porta in sorted(sw.tabela.items(), key=lambda x: x[1]):
        print(f"    VLAN {vlan}  {mac}  porta {porta}")

    print("\nParte 2: VLANs isolam o flood")
    sw2 = Switch(portas=[1, 2, 3, 4], vlan_por_porta={1: 10, 2: 10, 3: 20, 4: 20})
    print(f"  H1 (porta 1, VLAN 10) broadcast: {sw2.recebe(1, h1, BROADCAST)}")
    print(f"  H3 (porta 3, VLAN 20) broadcast: {sw2.recebe(3, h3, BROADCAST)}")
