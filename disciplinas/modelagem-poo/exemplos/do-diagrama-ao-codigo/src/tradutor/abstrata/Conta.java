package tradutor.abstrata;

/** UML: Conta (nome em itálico = abstrata) { # saldo: double; + depositar(v); + taxaMensal() } */
public abstract class Conta {
    protected double saldo;

    public void depositar(double v) { saldo += v; }

    public abstract double taxaMensal();
}
