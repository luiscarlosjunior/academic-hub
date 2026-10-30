import java.util.Locale;

/**
 * O ruim: cada novo tipo de desconto obriga a editar o método existente.
 * O if/else cresce, e cada teste antigo precisa ser refeito.
 */
public class Main {

    static final class CalculadoraDesconto {
        double calcular(double total, String tipoCliente) {
            if (tipoCliente.equals("VIP")) {
                return total * 0.80;
            } else if (tipoCliente.equals("FUNCIONARIO")) {
                return total * 0.70;
            } else if (tipoCliente.equals("NORMAL")) {
                return total;
            }
            // para incluir ESTUDANTE, é preciso abrir esta classe e mudar a lógica
            throw new IllegalArgumentException("tipo desconhecido: " + tipoCliente);
        }
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        CalculadoraDesconto calc = new CalculadoraDesconto();
        System.out.printf("VIP: %.2f%n", calc.calcular(200, "VIP"));
        System.out.printf("FUNCIONARIO: %.2f%n", calc.calcular(200, "FUNCIONARIO"));
        System.out.printf("NORMAL: %.2f%n", calc.calcular(200, "NORMAL"));
        try {
            calc.calcular(200, "ESTUDANTE");
        } catch (IllegalArgumentException e) {
            System.out.println("erro: " + e.getMessage());
        }
    }
}
