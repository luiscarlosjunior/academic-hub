import java.util.Locale;

/**
 * L bom: a forma é um contrato comum (área), sem herança que quebre o comportamento.
 * Retangulo e Quadrado são implementações independentes, e o teste de área vale para os dois.
 */
public class Main {

    interface Forma {
        int area();
    }

    // imutável: não há setters, então nenhuma substituição pode quebrar o contrato
    record Retangulo(int largura, int altura) implements Forma {
        public int area() { return largura * altura; }
    }

    record Quadrado(int lado) implements Forma {
        public int area() { return lado * lado; }
    }

    static void testarArea(String nome, Forma forma, int esperado) {
        System.out.println(nome + ": esperado " + esperado + ", obtido " + forma.area()
                + (forma.area() == esperado ? " (ok)" : " (FALHOU)"));
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        testarArea("retangulo 5x4", new Retangulo(5, 4), 20);
        testarArea("quadrado 4", new Quadrado(4), 16);
    }
}
