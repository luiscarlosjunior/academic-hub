import java.util.Locale;

/**
 * O bom: a calculadora é fechada para mudança e aberta para extensão.
 * Um novo desconto é uma nova classe que implementa a interface; nenhuma linha antiga muda.
 */
public class Main {

    interface Desconto {
        double aplicar(double total);
    }

    static final class SemDesconto implements Desconto {
        public double aplicar(double total) { return total; }
    }

    static final class DescontoVip implements Desconto {
        public double aplicar(double total) { return total * 0.80; }
    }

    static final class DescontoFuncionario implements Desconto {
        public double aplicar(double total) { return total * 0.70; }
    }

    // Adicionado depois, sem tocar nas classes acima
    static final class DescontoEstudante implements Desconto {
        public double aplicar(double total) { return total * 0.85; }
    }

    static final class CalculadoraDesconto {
        double calcular(double total, Desconto desconto) {
            return desconto.aplicar(total);
        }
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        CalculadoraDesconto calc = new CalculadoraDesconto();
        System.out.printf("VIP: %.2f%n", calc.calcular(200, new DescontoVip()));
        System.out.printf("FUNCIONARIO: %.2f%n", calc.calcular(200, new DescontoFuncionario()));
        System.out.printf("NORMAL: %.2f%n", calc.calcular(200, new SemDesconto()));
        System.out.printf("ESTUDANTE: %.2f%n", calc.calcular(200, new DescontoEstudante()));
    }
}
