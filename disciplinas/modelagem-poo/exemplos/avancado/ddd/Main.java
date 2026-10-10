import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * DDD tático: agregado com raiz, entidade, objeto de valor e evento de domínio.
 * Regra de ouro: o estado do agregado só muda pela raiz, e a raiz garante os invariantes.
 */
public class Main {

    /** Objeto de valor: sem identidade, imutável, igual por valor, sempre válido. */
    record Dinheiro(long centavos) {
        Dinheiro {
            if (centavos < 0) throw new IllegalArgumentException("valor negativo");
        }
        Dinheiro menos(Dinheiro outro) { return new Dinheiro(centavos - outro.centavos); }
        boolean maiorOuIgual(Dinheiro outro) { return centavos >= outro.centavos; }
        @Override public String toString() { return String.format("R$ %d,%02d", centavos / 100, centavos % 100); }
    }

    /** Evento de domínio: fato que aconteceu no passado, nomeado no passado. */
    sealed interface EventoDeDominio permits SaldoDebitado, DebitoRecusado {}
    record SaldoDebitado(String contaId, Dinheiro valor) implements EventoDeDominio {}
    record DebitoRecusado(String contaId, Dinheiro valor) implements EventoDeDominio {}

    /** Agregado: Conta é a raiz. Lançamento é entidade interna, acessível só por dentro. */
    static final class Conta {
        private final String id;                 // identidade
        private Dinheiro saldo;
        private final List<Lancamento> lancamentos = new ArrayList<>();
        private final List<EventoDeDominio> eventos = new ArrayList<>();

        Conta(String id, Dinheiro saldoInicial) { this.id = id; this.saldo = saldoInicial; }

        /** Comando: a raiz decide. O invariante "saldo nunca negativo" mora aqui. */
        void debitar(Dinheiro valor, String descricao) {
            if (!saldo.maiorOuIgual(valor)) {
                eventos.add(new DebitoRecusado(id, valor));
                throw new IllegalStateException("saldo insuficiente na conta " + id);
            }
            saldo = saldo.menos(valor);
            lancamentos.add(new Lancamento(descricao, valor));   // entidade interna
            eventos.add(new SaldoDebitado(id, valor));
        }

        List<EventoDeDominio> pullEventos() {                     // consumidos pela infraestrutura
            List<EventoDeDominio> copia = List.copyOf(eventos);
            eventos.clear();
            return copia;
        }

        String id() { return id; }
        Dinheiro saldo() { return saldo; }
        List<Lancamento> lancamentos() { return List.copyOf(lancamentos); }

        /** Entidade interna: tem identidade local, mas só existe dentro do agregado. */
        record Lancamento(String descricao, Dinheiro valor) {}
    }

    /** Repositório: opera sobre agregados inteiros, nunca sobre partes. */
    interface RepositorioDeContas {
        Optional<Conta> porId(String id);
        void salvar(Conta conta);
    }

    static final class RepositorioEmMemoria implements RepositorioDeContas {
        private final java.util.Map<String, Conta> dados = new java.util.HashMap<>();
        public Optional<Conta> porId(String id) { return Optional.ofNullable(dados.get(id)); }
        public void salvar(Conta conta) { dados.put(conta.id(), conta); }
    }

    public static void main(String[] args) {
        RepositorioDeContas repo = new RepositorioEmMemoria();
        repo.salvar(new Conta("CC-1", new Dinheiro(3010)));          // R$ 30,10

        // Caso de uso: cobrar a assinatura (R$ 19,90) pelo agregado
        Conta conta = repo.porId("CC-1").orElseThrow();
        conta.debitar(new Dinheiro(1990), "Assinatura Premium");
        System.out.println("saldo após cobrança: " + conta.saldo());
        System.out.println("eventos: " + conta.pullEventos());
        repo.salvar(conta);

        // Segunda cobrança: a raiz recusa e registra o evento de recusa
        Conta outra = repo.porId("CC-1").orElseThrow();
        try {
            outra.debitar(new Dinheiro(1990), "Assinatura Premium");
        } catch (IllegalStateException e) {
            System.out.println("recusado: " + e.getMessage());
        }
        System.out.println("eventos: " + outra.pullEventos());
        System.out.println("lançamentos: " + repo.porId("CC-1").orElseThrow().lancamentos());

        // Objeto de valor: a validação acontece na criação; nunca existe Dinheiro inválido
        try {
            new Dinheiro(-1);
        } catch (IllegalArgumentException e) {
            System.out.println("objeto de valor inválido não existe: " + e.getMessage());
        }
    }
}
