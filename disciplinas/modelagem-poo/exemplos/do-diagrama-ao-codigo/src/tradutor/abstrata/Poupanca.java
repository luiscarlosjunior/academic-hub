package tradutor.abstrata;

/** Generalização (linha sólida ▷) → extends */
public class Poupanca extends Conta {
    @Override
    public double taxaMensal() { return 0.005; }
}
