package tradutor.interfaces;

/** Realização (linha tracejada ▷) → implements */
public class Fatura implements Pagavel {
    // campo e construtor acrescentados para o exemplo compilar
    private final double total;

    public Fatura(double total) { this.total = total; }

    @Override
    public double calcularValor() { return total; }
}
