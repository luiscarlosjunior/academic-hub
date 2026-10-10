import java.util.*;

/**
 * CENÁRIO: cobrança de assinatura com retentativas.
 * Uma requisição pode dar timeout DEPOIS de o gateway já ter cobrado. Sem chave de idempotência,
 * a retentativa cobra de novo: o cliente paga duas vezes. Este checker encontra o caminho
 * que leva a essa situação, e verifica a versão com idempotência.
 */
public class Main {

    enum Status { NOVO, PROCESSANDO, APROVADO, RECUSADO, TIMEOUT }

    /** cobrancas = quantas cobranças reais o gateway registrou (limitado a 2 para tornar o espaço finito). */
    record Estado(Status status, int cobrancas) {}
    record Passo(String acao, Estado para) {}

    static List<Passo> sucessores(Estado e, boolean comIdempotencia) {
        List<Passo> out = new ArrayList<>();
        // Enviar: novo envio ou retentativa após timeout/recusa
        if (e.status() == Status.NOVO || e.status() == Status.TIMEOUT || e.status() == Status.RECUSADO) {
            int cob = comIdempotencia ? Math.max(1, e.cobrancas()) : Math.min(e.cobrancas() + 1, 2);
            out.add(new Passo("enviar", new Estado(Status.PROCESSANDO, cob)));
        }
        if (e.status() == Status.PROCESSANDO) {
            out.add(new Passo("aprovar", new Estado(Status.APROVADO, e.cobrancas())));
            out.add(new Passo("recusar", new Estado(Status.RECUSADO, e.cobrancas())));
            out.add(new Passo("timeout", new Estado(Status.TIMEOUT, e.cobrancas())));
        }
        return out;
    }

    /** Verifica um invariante em todo estado alcançável (BFS). Devolve o caminho até a violação. */
    static Optional<List<String>> verificar(boolean comIdempotencia, java.util.function.Predicate<Estado> inv) {
        Estado inicio = new Estado(Status.NOVO, 0);
        Set<Estado> visitados = new HashSet<>(Set.of(inicio));
        ArrayDeque<Map.Entry<Estado, List<String>>> fila = new ArrayDeque<>();
        fila.add(Map.entry(inicio, List.of()));
        while (!fila.isEmpty()) {
            var item = fila.poll();
            if (!inv.test(item.getKey())) return Optional.of(item.getValue());
            for (Passo p : sucessores(item.getKey(), comIdempotencia)) {
                if (visitados.add(p.para())) {
                    List<String> caminho = new ArrayList<>(item.getValue());
                    caminho.add(p.acao());
                    fila.add(Map.entry(p.para(), caminho));
                }
            }
        }
        System.out.println("  estados alcançáveis: " + visitados.size());
        return Optional.empty();
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);   // saída reprodutível em qualquer máquina
        // Propriedade de segurança: nunca cobrar o cliente duas vezes pelo mesmo pedido
        java.util.function.Predicate<Estado> cobradoUmaVez = e -> e.cobrancas() <= 1;

        System.out.println("=== Sem chave de idempotência ===");
        verificar(false, cobradoUmaVez).ifPresentOrElse(
                caminho -> System.out.println("VIOLADO. Caminho mínimo: " + caminho),
                () -> System.out.println("OK"));

        System.out.println("\n=== Com chave de idempotência (retentativas reutilizam a mesma cobrança) ===");
        verificar(true, cobradoUmaVez).ifPresentOrElse(
                caminho -> System.out.println("VIOLADO: " + caminho),
                () -> System.out.println("OK: nenhuma cobrança duplicada em todo o espaço de estados"));
    }
}
