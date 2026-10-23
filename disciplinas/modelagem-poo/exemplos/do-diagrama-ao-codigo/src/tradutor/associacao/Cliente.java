package tradutor.associacao;

import java.util.*;

/** UML: Cliente "1" ──> "*" Pedido  (navegável só do Cliente para o Pedido) */
public class Cliente {
    private String nome;
    private List<Pedido> pedidos = new ArrayList<>();

    // construtor acrescentado para o exemplo rodar
    public Cliente(String nome) { this.nome = nome; }

    public void adicionar(Pedido p) {
        pedidos.add(p);
    }
    public List<Pedido> getPedidos() {
        return Collections.unmodifiableList(pedidos);
    }
}
