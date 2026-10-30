import java.util.Locale;

/**
 * L ruim: Quadrado herda de Retangulo e quebra o contrato de setLargura/setAltura.
 * Código que usa Retangulo espera que largura e altura mudem de forma independente.
 */
public class Main {

    static class Retangulo {
        protected int largura;
        protected int altura;

        void setLargura(int largura) { this.largura = largura; }
        void setAltura(int altura) { this.altura = altura; }
        int area() { return largura * altura; }
    }

    static final class Quadrado extends Retangulo {
        @Override void setLargura(int valor) { largura = valor; altura = valor; }
        @Override void setAltura(int valor) { largura = valor; altura = valor; }
    }

    static void testarArea(Retangulo r) {
        r.setLargura(5);
        r.setAltura(4);
        int esperado = 20;
        System.out.println("esperado " + esperado + ", obtido " + r.area()
                + (r.area() == esperado ? " (ok)" : " (FALHOU)"));
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        testarArea(new Retangulo());
        testarArea(new Quadrado());
    }
}
