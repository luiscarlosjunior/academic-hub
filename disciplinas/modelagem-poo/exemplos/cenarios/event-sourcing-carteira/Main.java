import java.util.*;

/**
 * CENÁRIO: carteira digital com extrato auditável.
 * Em 2026 o evento Debitado passou a exigir categoria. Eventos antigos NÃO são reescritos:
 * um upcaster converte o formato antigo na leitura. Snapshots evitam reler o histórico inteiro.
 * Uma projeção de saldo por categoria atende o app. Reconciliação compara a projeção com o log.
 */
public class Main {

    sealed interface Evento permits Creditado, DebitadoV1, DebitadoV2 {}
    record Creditado(long centavos) implements Evento {}
    record DebitadoV1(long centavos) implements Evento {}              // formato de 2024
    record DebitadoV2(long centavos, String categoria) implements Evento {}  // formato de 2026

    /** Upcaster: converte o formato antigo para o atual, sem mexer no log. */
    static Evento atualizar(Evento e) {
        if (e instanceof DebitadoV1 v1) return new DebitadoV2(v1.centavos(), "NAO_CLASSIFICADO");
        return e;
    }

    record Snapshot(long saldo, int versao) {}

    static final class Carteira {
        private long saldo;
        private int versao;

        void aplicar(Evento e) {
            Evento atual = atualizar(e);
            if (atual instanceof Creditado c) saldo += c.centavos();
            else if (atual instanceof DebitadoV2 d) saldo -= d.centavos();
            versao++;
        }
        Snapshot snapshot() { return new Snapshot(saldo, versao); }
        long saldo() { return saldo; }
        int versao() { return versao; }
    }

    /** Reconstrói a partir do último snapshot e aplica só o que veio depois. */
    static Carteira reconstruir(List<Evento> log, Snapshot s) {
        Carteira c = new Carteira();
        if (s != null) { c.saldo = s.saldo(); c.versao = s.versao(); }
        log.subList(s == null ? 0 : s.versao(), log.size()).forEach(c::aplicar);
        return c;
    }

    /** Projeção de leitura: saldo gasto por categoria, para o app. */
    static Map<String, Long> gastoPorCategoria(List<Evento> log) {
        Map<String, Long> gasto = new TreeMap<>();
        for (Evento e : log) {
            Evento atual = atualizar(e);
            if (atual instanceof DebitadoV2 d) gasto.merge(d.categoria(), d.centavos(), Long::sum);
        }
        return gasto;
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);   // saída reprodutível em qualquer máquina
        List<Evento> log = new ArrayList<>(List.of(
                new Creditado(50_000),           // R$ 500,00
                new DebitadoV1(12_000),          // histórico de 2024, sem categoria
                new Creditado(3_000)));
        // Novos eventos de 2026 já com categoria
        log.add(new DebitadoV2(4_500, "ALIMENTACAO"));
        log.add(new DebitadoV2(9_900, "TRANSPORTE"));

        Carteira completa = reconstruir(log, null);
        System.out.printf("saldo (fold completo): R$ %.2f, versão %d%n", completa.saldo() / 100.0, completa.versao());

        Carteira ate = new Carteira();
        log.subList(0, 3).forEach(ate::aplicar);
        Snapshot tomado = ate.snapshot();
        Carteira viaSnapshot = reconstruir(log, tomado);
        System.out.printf("saldo (snapshot + 2 eventos): R$ %.2f%n", viaSnapshot.saldo() / 100.0);
        System.out.println("snapshots são equivalentes ao fold: " + (viaSnapshot.saldo() == completa.saldo()));

        System.out.println("gasto por categoria (projeção): " + gastoPorCategoria(log));

        // Reconciliação: o saldo derivado do log (créditos - débitos) deve bater com o fold.
        long creditos = 0;
        for (Evento e : log) if (e instanceof Creditado c) creditos += c.centavos();
        long projetado = creditos - gastoPorCategoria(log).values().stream().mapToLong(Long::longValue).sum();
        System.out.println("reconciliação: " + (projetado == completa.saldo() ? "OK" : "DIVERGÊNCIA"));
    }
}
