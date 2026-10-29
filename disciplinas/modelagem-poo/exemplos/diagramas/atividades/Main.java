import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Diagrama de atividades em Java: o fluxo de reembolso de um pedido.
 * Decisão = if. Fork/join = duas tarefas em paralelo e um join. Raias = quem registra cada ação.
 */
public class Main {

    enum Raia { CLIENTE, SISTEMA, FINANCEIRO, ESTOQUE }

    record Pedido(String id, int diasDesdeCompra, double valor, boolean itemDevolvido) {}

    /** A trilha é preenchida só pela thread principal: a ordem da saída é sempre a mesma. */
    static final class Trilha {
        private final List<String> linhas = new ArrayList<>();
        void registrar(Raia raia, String acao) {
            linhas.add(String.format("%-10s | %s", raia, acao));
        }
        List<String> linhas() { return linhas; }
    }

    static String processar(Pedido p, Trilha t) {
        t.registrar(Raia.CLIENTE, "solicita reembolso do pedido " + p.id());
        t.registrar(Raia.SISTEMA, "verifica prazo: " + p.diasDesdeCompra() + " dias desde a compra");

        // Decisão: guarda [prazo <= 7 dias]. Caminho falso leva a um fim de fluxo.
        if (p.diasDesdeCompra() > 7) {
            t.registrar(Raia.SISTEMA, "recusa com justificativa (prazo expirado)");
            return "RECUSADO";
        }

        t.registrar(Raia.SISTEMA, "registra pedido de estorno");

        // Fork: duas ações independentes em paralelo (o estorno e a devolução não dependem uma da outra).
        CompletableFuture<String> estorno = CompletableFuture.supplyAsync(
                () -> String.format("estorno de R$ %.2f no cartão", p.valor()));
        CompletableFuture<String> devolucao = CompletableFuture.supplyAsync(
                () -> p.itemDevolvido() ? "item recebido e devolvido ao estoque" : "sem devolução física");

        // Join: só segue quando as duas terminarem.
        CompletableFuture.allOf(estorno, devolucao).join();

        t.registrar(Raia.FINANCEIRO, estorno.join());
        t.registrar(Raia.ESTOQUE, devolucao.join());
        t.registrar(Raia.SISTEMA, "sincroniza os resultados e avisa o cliente");
        t.registrar(Raia.CLIENTE, "recebe a confirmação do reembolso");
        return "CONCLUIDO";
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);   // saída igual em qualquer máquina
        List<Pedido> pedidos = List.of(
                new Pedido("P-1001", 3, 149.80, true),
                new Pedido("P-1002", 12, 59.90, false));

        for (Pedido p : pedidos) {
            System.out.println("=== fluxo do pedido " + p.id());
            Trilha trilha = new Trilha();
            String resultado = processar(p, trilha);
            trilha.linhas().forEach(System.out::println);
            System.out.println("situação final: " + resultado + "\n");
        }
    }
}
