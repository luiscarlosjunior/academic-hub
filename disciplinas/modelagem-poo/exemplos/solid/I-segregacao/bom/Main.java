import java.util.Locale;

/**
 * I bom: interfaces pequenas, uma por capacidade.
 * Cada classe implementa só o que de fato faz; quem precisa de escanear depende só de Escaneavel.
 */
public class Main {

    interface Imprimivel { void imprimir(String texto); }
    interface Escaneavel { void escanear(); }
    interface Fax { void enviarFax(String numero); }

    static final class ImpressoraSimples implements Imprimivel {
        public void imprimir(String texto) { System.out.println("imprimindo: " + texto); }
    }

    static final class MultifuncionalCompleta implements Imprimivel, Escaneavel, Fax {
        public void imprimir(String texto) { System.out.println("imprimindo: " + texto); }
        public void escanear() { System.out.println("escaneando documento"); }
        public void enviarFax(String numero) { System.out.println("enviando fax para " + numero); }
    }

    // depende só do que usa: não precisa saber que existe fax
    static void digitalizar(Escaneavel equipamento) {
        equipamento.escanear();
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        new ImpressoraSimples().imprimir("relatório de vendas");
        MultifuncionalCompleta mf = new MultifuncionalCompleta();
        digitalizar(mf);
        mf.enviarFax("1199999-0000");
    }
}
