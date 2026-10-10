import java.util.*;

/**
 * CENÁRIO: checkout de um e-commerce.
 * Pedido é um agregado (itens e total só mudam pela raiz). Estoque é OUTRO agregado.
 * A confirmação publica um evento; o estoque reage em outra transação. Se o estoque
 * não tiver saldo, uma ação compensatória cancela o pedido (padrão saga).
 */
public class Main {

    record Dinheiro(long centavos) {
        Dinheiro {
            if (centavos < 0) throw new IllegalArgumentException("valor negativo");
        }
        Dinheiro somar(Dinheiro outro) { return new Dinheiro(centavos + outro.centavos); }
        Dinheiro vezes(int quantidade) { return new Dinheiro(centavos * quantidade); }
        @Override public String toString() { return String.format("R$ %.2f", centavos / 100.0); }
    }

    record ItemPedido(String sku, int quantidade, Dinheiro precoUnitario) {
        ItemPedido {
            if (quantidade <= 0) throw new IllegalArgumentException("quantidade deve ser positiva");
        }
        Dinheiro subtotal() { return precoUnitario.vezes(quantidade); }
    }

    enum StatusPedido { ABERTO, CONFIRMADO, CANCELADO }

    sealed interface Evento permits PedidoConfirmado, PedidoCancelado {}
    record PedidoConfirmado(String pedidoId, List<ItemPedido> itens) implements Evento {}
    record PedidoCancelado(String pedidoId, String motivo) implements Evento {}

    /** Agregado raiz: os invariantes do pedido vivem aqui. */
    static final class Pedido {
        private final String id;
        private final List<ItemPedido> itens = new ArrayList<>();
        private StatusPedido status = StatusPedido.ABERTO;

        Pedido(String id) { this.id = id; }

        void adicionar(ItemPedido item) {
            if (status != StatusPedido.ABERTO) throw new IllegalStateException("pedido não está aberto");
            itens.add(item);
        }

        /** Invariante: total = soma dos itens, sempre calculado, nunca guardado. */
        Dinheiro total() {
            return itens.stream().map(ItemPedido::subtotal).reduce(new Dinheiro(0), Dinheiro::somar);
        }

        /** Comando: confirmar exige ao menos um item e muda o estado uma única vez. */
        Evento confirmar() {
            if (itens.isEmpty()) throw new IllegalStateException("pedido vazio não pode ser confirmado");
            if (status != StatusPedido.ABERTO) throw new IllegalStateException("status " + status);
            status = StatusPedido.CONFIRMADO;
            return new PedidoConfirmado(id, List.copyOf(itens));
        }

        Evento cancelarPorFalhaDeEstoque(String motivo) {
            if (status != StatusPedido.CONFIRMADO) throw new IllegalStateException("só pedido confirmado é compensado");
            status = StatusPedido.CANCELADO;
            return new PedidoCancelado(id, motivo);
        }

        String id() { return id; }
        StatusPedido status() { return status; }
    }

    /** Outro agregado: o estoque protege a própria invariante (quantidade nunca negativa). */
    static final class Estoque {
        private final Map<String, Integer> saldo = new HashMap<>();
        void repor(String sku, int quantidade) { saldo.merge(sku, quantidade, Integer::sum); }
        boolean reservar(List<ItemPedido> itens) {
            for (ItemPedido i : itens) {
                if (saldo.getOrDefault(i.sku(), 0) < i.quantidade()) return false;
            }
            itens.forEach(i -> saldo.merge(i.sku(), -i.quantidade(), Integer::sum));
            return true;
        }
        int disponivel(String sku) { return saldo.getOrDefault(sku, 0); }
    }

    /** Reação ao evento: roda em transação própria, separada do pedido. */
    static final class ReservaDeEstoque {
        private final Estoque estoque;
        private final Pedidos pedidos;
        ReservaDeEstoque(Estoque estoque, Pedidos pedidos) { this.estoque = estoque; this.pedidos = pedidos; }

        void tratar(PedidoConfirmado evento) {
            if (estoque.reservar(evento.itens())) {
                System.out.println("  estoque: reservado para " + evento.pedidoId());
            } else {
                System.out.println("  estoque: sem saldo para " + evento.pedidoId() + ", compensando");
                pedidos.compensar(evento.pedidoId(), "estoque insuficiente");
            }
        }
    }

    /** Repositório com ações compensatórias (saga). */
    static final class Pedidos {
        private final Map<String, Pedido> dados = new HashMap<>();
        void salvar(Pedido p) { dados.put(p.id(), p); }
        Pedido porId(String id) { return dados.get(id); }
        void compensar(String id, String motivo) {
            Evento e = dados.get(id).cancelarPorFalhaDeEstoque(motivo);
            System.out.println("  evento publicado: " + e);
        }
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);   // saída reprodutível em qualquer máquina
        Estoque estoque = new Estoque();
        estoque.repor("CAMISA-P", 2);
        Pedidos pedidos = new Pedidos();
        ReservaDeEstoque reserva = new ReservaDeEstoque(estoque, pedidos);

        System.out.println("=== Pedido 1: dentro do estoque ===");
        Pedido p1 = new Pedido("PED-1");
        p1.adicionar(new ItemPedido("CAMISA-P", 2, new Dinheiro(4990)));
        System.out.println("total: " + p1.total());
        pedidos.salvar(p1);
        PedidoConfirmado e1 = (PedidoConfirmado) p1.confirmar();
        reserva.tratar(e1);
        System.out.println("status: " + p1.status() + ", estoque disponível: " + estoque.disponivel("CAMISA-P"));

        System.out.println("\n=== Pedido 2: estoque esgotado, saga compensa ===");
        Pedido p2 = new Pedido("PED-2");
        p2.adicionar(new ItemPedido("CAMISA-P", 1, new Dinheiro(4990)));
        pedidos.salvar(p2);
        reserva.tratar((PedidoConfirmado) p2.confirmar());
        System.out.println("status final: " + pedidos.porId("PED-2").status());

        System.out.println("\n=== Invariantes da raiz ===");
        try {
            new Pedido("PED-3").confirmar();
        } catch (IllegalStateException e) {
            System.out.println("pedido vazio: " + e.getMessage());
        }
        try {
            p1.adicionar(new ItemPedido("CAMISA-P", 1, new Dinheiro(4990)));
        } catch (IllegalStateException e) {
            System.out.println("pedido confirmado não muda: " + e.getMessage());
        }
    }
}
