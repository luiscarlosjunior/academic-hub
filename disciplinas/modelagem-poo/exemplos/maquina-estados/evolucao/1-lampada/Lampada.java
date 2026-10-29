/**
 * Nível 1: a lâmpada tem dois estados e um único evento.
 * Uma transição por estado, sem guardas e sem ações.
 */
public class Lampada {

    enum Estado { DESLIGADA, LIGADA }

    private Estado estado = Estado.DESLIGADA;

    void apertar() {
        estado = switch (estado) {
            case DESLIGADA -> Estado.LIGADA;
            case LIGADA -> Estado.DESLIGADA;
        };
        System.out.println("apertar -> " + estado);
    }

    public static void main(String[] args) {
        Lampada lampada = new Lampada();
        lampada.apertar();
        lampada.apertar();
        lampada.apertar();
    }
}
