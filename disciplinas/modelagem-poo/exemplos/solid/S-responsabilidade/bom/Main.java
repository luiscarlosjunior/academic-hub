import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * S bom: cada classe tem um motivo para mudar.
 * Validação, cálculo, persistência e notificação ficam separados; o orquestrador só chama as partes.
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

    // Motivo para mudar: regras de validação
    static final class ValidadorPedido {
        void validar(Pedido pedido) {
            if (pedido.itens.isEmpty()) {
                throw new IllegalArgumentException("pedido vazio: " + pedido.id);
            }
        }
    }

    // Motivo para mudar: regras de preço e desconto
    static final class CalculadoraTotal {
        double calcular(Pedido pedido) {
            double total = 0;
            for (Item item : pedido.itens) {
                total += item.preco() * item.quantidade();
            }
            return total > 500 ? total * 0.95 : total;
        }
    }

    // Motivo para mudar: formato ou local de gravação
    static final class RepositorioPedidos {
        void salvar(Pedido pedido, double total) {
            System.out.println("gravando em pedidos.csv: " + pedido.id + ";" + String.format("%.2f", total));
        }
    }

    // Motivo para mudar: canal de notificação
    static final class Notificador {
        void confirmar(Pedido pedido, double total) {
            System.out.println("enviando e-mail para " + pedido.emailCliente
                    + ": pedido " + pedido.id + " confirmado, total R$ " + String.format("%.2f", total));
        }
    }

    // Orquestrador: só coordena, não decide regra alguma
    static final class ProcessadorPedido {
        private final ValidadorPedido validador = new ValidadorPedido();
        private final CalculadoraTotal calculadora = new CalculadoraTotal();
        private final RepositorioPedidos repositorio = new RepositorioPedidos();
        private final Notificador notificador = new Notificador();

        double processar(Pedido pedido) {
            validador.validar(pedido);
            double total = calculadora.calcular(pedido);
            repositorio.salvar(pedido, total);
            notificador.confirmar(pedido, total);
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
