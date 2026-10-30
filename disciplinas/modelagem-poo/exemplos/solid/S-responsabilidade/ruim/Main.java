import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * S ruim: ProcessadorPedido valida, calcula, grava em arquivo e envia e-mail.
 * Qualquer mudança em uma dessas regras obriga a abrir e testar a mesma classe.
 */
public class Main {

    record Item(String nome, double preco, int quantidade) {}

    static final class Pedido {
        final String id;
        final String emailCliente;
        final List<Item> itens = new ArrayList<>();

        Pedido(String id, String emailCliente) {
            this.id = id;
            this.emailCliente = emailCliente;
        }
    }

    static final class ProcessadorPedido {
        double processar(Pedido pedido) {
            // validação
            if (pedido.itens.isEmpty()) {
                throw new IllegalArgumentException("pedido vazio: " + pedido.id);
            }
            // cálculo do total e regra de desconto
            double total = 0;
            for (Item item : pedido.itens) {
                total += item.preco() * item.quantidade();
            }
            if (total > 500) {
                total *= 0.95;
            }
            // formatação e persistência (arquivo)
            String linha = pedido.id + ";" + String.format("%.2f", total);
            System.out.println("gravando em pedidos.csv: " + linha);
            // notificação por e-mail
            System.out.println("enviando e-mail para " + pedido.emailCliente
                    + ": pedido " + pedido.id + " confirmado, total R$ " + String.format("%.2f", total));
            return total;
        }
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        Pedido pedido = new Pedido("P-1001", "ana@exemplo.com");
        pedido.itens.add(new Item("teclado", 150.00, 2));
        pedido.itens.add(new Item("mouse", 80.00, 3));
        new ProcessadorPedido().processar(pedido);
    }
}
