import java.util.*;

/**
 * CENÁRIO: motor de descontos de um e-commerce.
 * As regras são configuradas pelo time de marketing e guardadas como dados.
 * Cada nova operação (calcular, explicar, validar, auditar) é um novo visitante;
 * o modelo de regras não muda.
 */
public class Main {

    sealed interface Regra permits Percentual, ValorFixo, Cumulativa {
        <R> R aceitar(Visitor<R> v);
    }
    record Percentual(int pct) implements Regra {
        public <R> R aceitar(Visitor<R> v) { return v.percentual(this); }
    }
    record ValorFixo(long centavos) implements Regra {
        public <R> R aceitar(Visitor<R> v) { return v.valorFixo(this); }
    }
    /** Aplica a primeira regra e depois a segunda sobre o que sobrou. */
    record Cumulativa(Regra primeira, Regra segunda) implements Regra {
        public <R> R aceitar(Visitor<R> v) { return v.cumulativa(this); }
    }

    interface Visitor<R> {
        R percentual(Percentual p);
        R valorFixo(ValorFixo v);
        R cumulativa(Cumulativa c);
    }

    /** Operação 1: quanto a regra desconta, dado um subtotal. */
    static final class Calculadora implements Visitor<Long> {
        private final long subtotal;
        Calculadora(long subtotal) { this.subtotal = subtotal; }
        public Long percentual(Percentual p) { return subtotal * p.pct() / 100; }
        public Long valorFixo(ValorFixo v) { return Math.min(v.centavos(), subtotal); }
        public Long cumulativa(Cumulativa c) {
            long d1 = c.primeira().aceitar(new Calculadora(subtotal));
            long d2 = c.segunda().aceitar(new Calculadora(subtotal - d1));  // o segundo desconto usa o restante
            return d1 + d2;
        }
    }

    /** Operação 2: texto que o checkout mostra ao cliente. */
    static final class Explicador implements Visitor<String> {
        public String percentual(Percentual p) { return p.pct() + "% de desconto"; }
        public String valorFixo(ValorFixo v) { return String.format("R$ %.2f de desconto", v.centavos() / 100.0); }
        public String cumulativa(Cumulativa c) {
            return c.primeira().aceitar(this) + ", depois " + c.segunda().aceitar(this);
        }
    }

    /** Operação 3: validação antes de publicar a campanha. */
    static final class Validador implements Visitor<List<String>> {
        public List<String> percentual(Percentual p) {
            return (p.pct() < 1 || p.pct() > 100) ? List.of("percentual fora de 1..100: " + p.pct()) : List.of();
        }
        public List<String> valorFixo(ValorFixo v) {
            return v.centavos() <= 0 ? List.of("valor fixo deve ser positivo") : List.of();
        }
        public List<String> cumulativa(Cumulativa c) {
            List<String> erros = new ArrayList<>(c.primeira().aceitar(this));
            erros.addAll(c.segunda().aceitar(this));
            return erros;
        }
    }

    /** Operação 4 (adicionada depois, sem tocar nas regras): trilha de auditoria. */
    static final class Auditor implements Visitor<Integer> {
        public Integer percentual(Percentual p) { return 1; }
        public Integer valorFixo(ValorFixo v) { return 1; }
        public Integer cumulativa(Cumulativa c) {
            return c.primeira().aceitar(this) + c.segunda().aceitar(this);
        }
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);   // saída reprodutível em qualquer máquina
        long subtotal = 20_000;   // R$ 200,00
        List<Regra> campanhas = List.of(
                new Percentual(10),
                new ValorFixo(500),
                new Cumulativa(new Percentual(10), new ValorFixo(500)),
                new Percentual(150)                       // erro de cadastro
        );

        for (Regra r : campanhas) {
            List<String> erros = r.aceitar(new Validador());
            if (!erros.isEmpty()) {
                System.out.println("campanha rejeitada: " + erros);
                continue;
            }
            long desconto = r.aceitar(new Calculadora(subtotal));
            System.out.printf("%-45s desconto R$ %.2f | total R$ %.2f%n",
                    r.aceitar(new Explicador()), desconto / 100.0, (subtotal - desconto) / 100.0);
        }
        System.out.println("folhas da regra cumulativa (visitante Auditor): "
                + campanhas.get(2).aceitar(new Auditor()));
    }
}
