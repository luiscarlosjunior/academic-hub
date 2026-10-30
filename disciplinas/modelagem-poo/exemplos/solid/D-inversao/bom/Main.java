import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * D bom: ServicoPedido depende de abstrações (RepositorioPedidos, Notificador).
 * Quem monta o objeto decide a implementação: produção usa MySQL e SMTP; o teste usa versões falsas.
 */
public class Main {

    // abstrações de alto nível
    interface RepositorioPedidos { void salvar(String id); }
    interface Notificador { void notificar(String destino, String mensagem); }

    // detalhes de baixo nível: produção
    static final class RepositorioMySql implements RepositorioPedidos {
        public void salvar(String id) { System.out.println("MySQL: pedido " + id + " gravado"); }
    }

    static final class NotificadorSmtp implements Notificador {
        public void notificar(String destino, String mensagem) {
            System.out.println("SMTP -> " + destino + ": " + mensagem);
        }
    }

    // detalhe para teste: não toca em rede nem em disco
    static final class RepositorioEmMemoria implements RepositorioPedidos {
        final List<String> gravados = new ArrayList<>();
        public void salvar(String id) { gravados.add(id); }
    }

    static final class NotificadorFalso implements Notificador {
        public void notificar(String destino, String mensagem) {
            System.out.println("(teste) notificação para " + destino + ": " + mensagem);
        }
    }

    static final class ServicoPedido {
        private final RepositorioPedidos repositorio;
        private final Notificador notificador;

        // dependências chegam pelo construtor (injeção de dependência)
        ServicoPedido(RepositorioPedidos repositorio, Notificador notificador) {
            this.repositorio = repositorio;
            this.notificador = notificador;
        }

        void finalizar(String id, String email) {
            repositorio.salvar(id);
            notificador.notificar(email, "pedido " + id + " confirmado");
        }
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        System.out.println("== produção");
        new ServicoPedido(new RepositorioMySql(), new NotificadorSmtp()).finalizar("P-1001", "ana@exemplo.com");

        System.out.println("== teste");
        RepositorioEmMemoria memoria = new RepositorioEmMemoria();
        new ServicoPedido(memoria, new NotificadorFalso()).finalizar("P-T1", "teste@exemplo.com");
        System.out.println("gravados em memória: " + memoria.gravados);
    }
}
