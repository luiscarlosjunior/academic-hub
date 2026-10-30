import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * D ruim: ServicoPedido cria o banco e o e-mail por conta própria (new).
 * Não dá para testar sem banco real e sem enviar e-mail de verdade.
 */
public class Main {

    static final class BancoMySql {
        private final List<String> tabela = new ArrayList<>();
        void inserir(String pedido) {
            tabela.add(pedido);
            System.out.println("INSERT INTO pedidos (dados) VALUES ('" + pedido + "') -- servidor MySQL");
        }
    }

    static final class ServidorSmtp {
        void enviar(String para, String texto) {
            System.out.println("SMTP -> " + para + ": " + texto);
        }
    }

    static final class ServicoPedido {
        // dependências concretas, criadas aqui dentro
        private final BancoMySql banco = new BancoMySql();
        private final ServidorSmtp smtp = new ServidorSmtp();

        void finalizar(String id, String email) {
            banco.inserir(id);
            smtp.enviar(email, "pedido " + id + " confirmado");
        }
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        new ServicoPedido().finalizar("P-1001", "ana@exemplo.com");
    }
}
