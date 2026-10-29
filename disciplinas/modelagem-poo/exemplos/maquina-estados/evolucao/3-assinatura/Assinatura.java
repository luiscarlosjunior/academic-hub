import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Nível 3: guardas numéricas e estado final.
 * A cobrança depende do saldo (guarda), e CANCELADA não tem transição de saída.
 */
public class Assinatura {

    enum Status { ATIVA, SUSPENSA, CANCELADA }

    private static final double PLANO = 19.90;

    private Status status = Status.ATIVA;
    private double saldo;
    private final List<String> log = new ArrayList<>();

    Assinatura(double saldoInicial) {
        this.saldo = saldoInicial;
    }

    /** Cobrança mensal. Guarda: saldo >= PLANO. Sem saldo, suspende (R3). */
    void cobrar() {
        if (status == Status.CANCELADA) {
            log.add("cobrança recusada: assinatura cancelada (R4)");
            return;
        }
        if (saldo >= PLANO) {
            saldo -= PLANO;
            status = Status.ATIVA;
            log.add(String.format("cobrança: debita %.2f, saldo %.2f -> ATIVA", PLANO, saldo));
        } else {
            status = Status.SUSPENSA;
            log.add(String.format("cobrança: saldo %.2f insuficiente -> SUSPENSA (R3)", saldo));
        }
    }

    void depositar(double valor) {
        saldo += valor;
        if (status == Status.SUSPENSA && saldo >= PLANO) {
            status = Status.ATIVA;
            log.add(String.format("depósito %.2f regulariza -> ATIVA", valor));
        } else {
            log.add(String.format("depósito %.2f, saldo %.2f", valor, saldo));
        }
    }

    void cancelar() {
        if (status == Status.CANCELADA) {
            log.add("cancelar: já estava cancelada");
            return;
        }
        status = Status.CANCELADA;
        log.add("cancelar -> CANCELADA (estado final)");
    }

    Status getStatus() { return status; }
    List<String> getLog() { return log; }

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        Assinatura assinatura = new Assinatura(30.10);
        assinatura.cobrar();      // sobra 10,20 -> ATIVA
        assinatura.cobrar();      // 10,20 < 19,90 -> SUSPENSA
        assinatura.depositar(15.00);
        assinatura.cancelar();
        assinatura.cobrar();      // recusada: R4
        assinatura.depositar(50.00);
        assinatura.getLog().forEach(System.out::println);
        System.out.println("status final: " + assinatura.getStatus());
    }
}
