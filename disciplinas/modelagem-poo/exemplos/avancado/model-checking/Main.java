import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Verificação de modelos por exploração explícita de estados (model checking, BFS).
 * Modelamos a assinatura como um sistema de transições e verificamos invariantes em TODOS
 * os estados alcançáveis. Se uma propriedade falha, o checker devolve um contraexemplo.
 */
public class Main {

    enum Status { ATIVA, SUSPENSA, CANCELADA }

    /** Estado abstrato: status + saldo em "unidades de cobrança" (0..2). */
    record Estado(Status status, int saldo) {}

    /** Um passo do sistema: nome da ação e o estado resultante. */
    record Passo(String acao, Estado para) {}

    /** Transições. O parâmetro 'bugReativacao' liga um defeito deliberado para o checker encontrar. */
    static List<Passo> sucessores(Estado e, boolean bugReativacao) {
        List<Passo> out = new ArrayList<>();
        // cobrança mensal: se houver saldo, cobra; se não, suspende (R3)
        if (e.status() != Status.CANCELADA) {
            if (e.saldo() >= 1) out.add(new Passo("cobrar", new Estado(Status.ATIVA, e.saldo() - 1)));
            else                out.add(new Passo("cobrar", new Estado(Status.SUSPENSA, e.saldo())));
        }
        // depósito: até 2 unidades
        if (e.saldo() < 2) out.add(new Passo("depositar", new Estado(e.status(), e.saldo() + 1)));
        // regularizar pagamento: suspensa volta a ativa (com saldo)
        if (e.status() == Status.SUSPENSA && e.saldo() >= 1)
            out.add(new Passo("regularizar", new Estado(Status.ATIVA, e.saldo())));
        // cancelar: a partir de ATIVA ou SUSPENSA
        if (e.status() != Status.CANCELADA)
            out.add(new Passo("cancelar", new Estado(Status.CANCELADA, e.saldo())));
        // BUG deliberado: reativar uma cancelada (R4 violada)
        if (bugReativacao && e.status() == Status.CANCELADA && e.saldo() >= 1)
            out.add(new Passo("reativar(bug)", new Estado(Status.ATIVA, e.saldo())));
        return out;
    }

    /** Resultado: invariante violado com o caminho até ele, ou vazio se vale em todo o espaço. */
    record Violacao(Estado estado, List<String> caminho) {}

    interface Invariante { boolean vale(Estado e); }

    static Optional<Violacao> verificar(Estado inicial, boolean bug, Invariante inv, String nome) {
        Set<Estado> visitados = new HashSet<>();
        // a fila guarda (estado, caminho até ele): BFS garante o contraexemplo mais curto
        ArrayDeque<Object[]> fila = new ArrayDeque<>();
        fila.add(new Object[]{inicial, new ArrayList<String>()});
        visitados.add(inicial);
        while (!fila.isEmpty()) {
            Object[] item = fila.poll();
            Estado atual = (Estado) item[0];
            @SuppressWarnings("unchecked") List<String> caminho = (List<String>) item[1];
            if (!inv.vale(atual)) return Optional.of(new Violacao(atual, caminho));
            for (Passo p : sucessores(atual, bug)) {
                if (visitados.add(p.para())) {
                    List<String> novo = new ArrayList<>(caminho);
                    novo.add(p.acao());
                    fila.add(new Object[]{p.para(), novo});
                }
            }
        }
        System.out.println("  [" + nome + "] estados alcançáveis: " + visitados.size());
        return Optional.empty();
    }

    public static void main(String[] args) {
        Estado inicio = new Estado(Status.ATIVA, 0);

        Invariante saldoNaoNegativo = e -> e.saldo() >= 0 && e.saldo() <= 2;
        Invariante canceladaEhFinal = e -> e.status() != Status.CANCELADA || sucessores(e, false).stream()
                .allMatch(p -> p.para().status() == Status.CANCELADA);   // nada sai de CANCELADA

        System.out.println("=== Modelo correto ===");
        System.out.println(verificar(inicio, false, saldoNaoNegativo, "saldo entre 0 e 2")
                .map(v -> "VIOLADO " + v).orElse("OK: saldo entre 0 e 2 em todo estado"));
        System.out.println(verificar(inicio, false, canceladaEhFinal, "cancelada é final")
                .map(v -> "VIOLADO " + v).orElse("OK: cancelada é final em todo estado"));

        System.out.println("\n=== Modelo com defeito (reativação de cancelada) ===");
        // Para o defeito, a propriedade é checada sobre os sucessores do modelo buggy
        Invariante canceladaEhFinalBug = e -> e.status() != Status.CANCELADA
                || sucessores(e, true).stream().allMatch(p -> p.para().status() == Status.CANCELADA);
        System.out.println(verificar(inicio, true, canceladaEhFinalBug, "cancelada é final")
                .map(v -> "VIOLADO em " + v.estado() + " após " + v.caminho())
                .orElse("OK"));
    }
}
