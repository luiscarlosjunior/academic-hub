import java.util.ArrayList;
import java.util.List;

/**
 * Event Sourcing e CQRS.
 * O estado NÃO é guardado: é o resultado de dobrar (fold) a sequência de eventos.
 * Os comandos validam contra o estado reconstruído; a leitura usa uma projeção separada.
 */
public class Main {

    sealed interface Evento permits Depositado, Sacado {}
    record Depositado(long centavos) implements Evento {}
    record Sacado(long centavos) implements Evento {}

    /** Agregado reconstruído a partir do histórico. */
    static final class Conta {
        private long saldo = 0;
        private int versao = 0;

        /** Função de evolução: aplica um evento ao estado. Não valida, porque o evento já aconteceu. */
        void aplicar(Evento e) {
            if (e instanceof Depositado d) saldo += d.centavos();
            else if (e instanceof Sacado s) saldo -= s.centavos();
            versao++;
        }

        /** Comando: decide com base no estado atual e devolve o NOVO evento (não altera o estado direto). */
        Evento sacar(long centavos) {
            if (centavos <= 0) throw new IllegalArgumentException("valor deve ser positivo");
            if (centavos > saldo) throw new IllegalStateException("saldo insuficiente");
            return new Sacado(centavos);
        }

        long saldo() { return saldo; }
        int versao() { return versao; }
    }

    /** Event store: append-only. Nunca se apaga nem se edita um evento. */
    static final class EventStore {
        private final List<Evento> log = new ArrayList<>();
        void anexar(Evento e) { log.add(e); }
        List<Evento> historico() { return List.copyOf(log); }
    }

    /** Projeção (lado de leitura do CQRS): modelo otimizado para consulta. */
    static final class ExtratoProjetado {
        private final List<String> linhas = new ArrayList<>();
        void processar(Evento e) {
            if (e instanceof Depositado d) linhas.add("+ " + d.centavos());
            else if (e instanceof Sacado s) linhas.add("- " + s.centavos());
        }
        List<String> linhas() { return List.copyOf(linhas); }
    }

    /** Reconstrói o agregado a partir do histórico (fold). */
    static Conta reconstruir(EventStore store) {
        Conta c = new Conta();
        store.historico().forEach(c::aplicar);
        return c;
    }

    public static void main(String[] args) {
        EventStore store = new EventStore();
        store.anexar(new Depositado(3010));          // R$ 30,10
        store.anexar(new Sacado(1990));              // assinatura R$ 19,90

        Conta conta = reconstruir(store);
        System.out.println("saldo reconstruído: " + conta.saldo() + " centavos, versão " + conta.versao());

        // Comando: sacar R$ 15,00 é permitido (saldo 10,20 < 15,00 -> recusado)
        try {
            Evento novo = conta.sacar(1500);
            store.anexar(novo);
        } catch (IllegalStateException e) {
            System.out.println("comando recusado: " + e.getMessage());
        }

        // Projeção: o extrato é derivado do mesmo log, sem tocar no agregado
        ExtratoProjetado extrato = new ExtratoProjetado();
        store.historico().forEach(extrato::processar);
        System.out.println("extrato (projeção): " + extrato.linhas());

        // Viagem no tempo: o estado após o primeiro evento
        Conta noPassado = new Conta();
        store.historico().subList(0, 1).forEach(noPassado::aplicar);
        System.out.println("saldo no passado (após o depósito): " + noPassado.saldo());
    }
}
