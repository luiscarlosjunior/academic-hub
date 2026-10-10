package melodia;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Conta que guarda o saldo e registra o extrato.
 * Invariante R1: o saldo nunca fica negativo.
 * Invariante R5: toda movimentação gera uma transação no extrato.
 * O saldo é private: só muda por operações que validam.
 */
public class ContaBancaria {

    private final String numero;
    private double saldo;
    private final List<String> extrato = new ArrayList<>();

    public ContaBancaria(String numero, double saldoInicial) {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("número da conta é obrigatório");
        }
        if (saldoInicial < 0) {
            throw new IllegalArgumentException("saldo inicial não pode ser negativo (R1)");
        }
        this.numero = numero;
        this.saldo = saldoInicial;
    }

    public void depositar(double valor) {
        if (valor <= 0) throw new IllegalArgumentException("valor deve ser positivo");
        saldo += valor;
        extrato.add("DEPÓSITO " + valor);
    }

    /** Pré-condição: valor > 0. Invariante: saldo continua >= 0. */
    public void sacar(double valor) {
        if (valor <= 0) throw new IllegalArgumentException("valor deve ser positivo");
        if (valor > saldo) throw new IllegalStateException("saldo insuficiente (R1)");
        saldo -= valor;
        extrato.add("SAQUE " + valor);
    }

    /** Operação de negócio com nome de intenção: débito de assinatura. Retorna false se faltar saldo. */
    public boolean debitarAssinatura(double valor) {
        if (valor > saldo) return false;
        saldo -= valor;
        extrato.add("ASSINATURA " + valor);
        return true;
    }

    public String getNumero()  { return numero; }
    public double getSaldo()   { return saldo; }

    /** Cópia defensiva do extrato. */
    public List<String> getExtrato() {
        return Collections.unmodifiableList(extrato);
    }
}
