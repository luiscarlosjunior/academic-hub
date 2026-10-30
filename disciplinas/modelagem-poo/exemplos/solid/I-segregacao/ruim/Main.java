import java.util.Locale;

/**
 * I ruim: uma interface gorda obriga a implementação a ter métodos que ela não usa.
 * ImpressoraSimples precisa "implementar" escanear e fax, e lança exceção.
 */
public class Main {

    interface Equipamento {
        void imprimir(String texto);
        void escanear();
        void enviarFax(String numero);
    }

    static final class ImpressoraSimples implements Equipamento {
        public void imprimir(String texto) { System.out.println("imprimindo: " + texto); }
        public void escanear() { throw new UnsupportedOperationException("não escaneia"); }
        public void enviarFax(String numero) { throw new UnsupportedOperationException("não envia fax"); }
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        Equipamento eq = new ImpressoraSimples();
        eq.imprimir("relatório de vendas");
        try {
            eq.escanear();
        } catch (UnsupportedOperationException e) {
            System.out.println("erro em tempo de execução: " + e.getMessage());
        }
    }
}
