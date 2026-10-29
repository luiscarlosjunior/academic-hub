import java.util.ArrayList;
import java.util.List;

/**
 * Máquina de estados em Java, com o domínio Melodia.
 * Cada estado e cada transição é explícito: evento [guarda] / ação.
 * Um evento sem transição válida é recusado: a máquina nunca fica em estado inventado.
 */
public class Main {

    // ----------------------------------------------------------------
    // 1. Player de música: estados e transições
    // ----------------------------------------------------------------
    enum EstadoPlayer { PARADO, TOCANDO, PAUSADO, BUFFERIZANDO }

    enum EventoPlayer { PLAY, PAUSE, BUFFER_VAZIO, BUFFER_CHEIO, FIM_DA_FAIXA, STOP }

    static final class Player {
        private EstadoPlayer estado = EstadoPlayer.PARADO;
        private final List<String> log = new ArrayList<>();
        private int segundosNoBuffer;

        /** Dispara um evento. Devolve false quando a transição não existe nesse estado. */
        boolean disparar(EventoPlayer evento) {
            EstadoPlayer anterior = estado;
            EstadoPlayer destino = null;
            switch (estado) {
                case PARADO -> {
                    if (evento == EventoPlayer.PLAY) destino = EstadoPlayer.BUFFERIZANDO;
                }
                case BUFFERIZANDO -> {
                    // guarda: só toca se o buffer já tem pelo menos 3 segundos
                    if (evento == EventoPlayer.BUFFER_CHEIO && segundosNoBuffer >= 3) destino = EstadoPlayer.TOCANDO;
                    if (evento == EventoPlayer.STOP) destino = EstadoPlayer.PARADO;
                }
                case TOCANDO -> {
                    if (evento == EventoPlayer.PAUSE) destino = EstadoPlayer.PAUSADO;
                    if (evento == EventoPlayer.BUFFER_VAZIO) destino = EstadoPlayer.BUFFERIZANDO;
                    if (evento == EventoPlayer.FIM_DA_FAIXA) destino = EstadoPlayer.PARADO;
                    if (evento == EventoPlayer.STOP) destino = EstadoPlayer.PARADO;
                }
                case PAUSADO -> {
                    if (evento == EventoPlayer.PLAY) destino = EstadoPlayer.TOCANDO;
                    if (evento == EventoPlayer.STOP) destino = EstadoPlayer.PARADO;
                }
            }
            if (destino == null) {
                log.add(String.format("  %-13s + %-14s -> recusado (não existe transição)", anterior, evento));
                return false;
            }
            // ação de saída do estado anterior e de entrada no novo
            if (anterior == EstadoPlayer.BUFFERIZANDO) segundosNoBuffer = 0;
            if (destino == EstadoPlayer.BUFFERIZANDO) segundosNoBuffer = 0;
            estado = destino;
            log.add(String.format("  %-13s + %-14s -> %s", anterior, evento, destino));
            return true;
        }

        /** Simula o carregamento do buffer (um segundo por chamada). */
        void carregarSegundo() {
            if (estado == EstadoPlayer.BUFFERIZANDO) {
                segundosNoBuffer++;
            }
        }

        EstadoPlayer getEstado() { return estado; }
        List<String> getLog() { return log; }
    }

    // ----------------------------------------------------------------
    // 2. Assinatura: o ciclo de vida que a regra R3 e a regra R4 descrevem
    // ----------------------------------------------------------------
    enum StatusAssinatura { ATIVA, SUSPENSA, CANCELADA }

    static final class Assinatura {
        private StatusAssinatura status = StatusAssinatura.ATIVA;
        private final double saldoConta;
        private double saldo;
        private final List<String> log = new ArrayList<>();

        Assinatura(double saldoInicial) {
            this.saldo = saldoInicial;
            this.saldoConta = saldoInicial;
        }

        /** Cobrança mensal de R$ 19,90, com a regra R3: sem saldo, suspende. */
        void cobrancaMensal() {
            if (status == StatusAssinatura.CANCELADA) {
                log.add("  cobrança mensal recusada: assinatura cancelada (R4)");
                return;
            }
            if (saldo >= 19.90) {
                saldo -= 19.90;
                status = StatusAssinatura.ATIVA;
                log.add(String.format("  cobrança mensal: debitado R$ 19,90, saldo R$ %.2f -> ATIVA", saldo));
            } else {
                status = StatusAssinatura.SUSPENSA;
                log.add(String.format("  cobrança mensal: saldo R$ %.2f insuficiente -> SUSPENSA (R3)", saldo));
            }
        }

        void depositar(double valor) {
            saldo += valor;
            if (status == StatusAssinatura.SUSPENSA && saldo >= 19.90) {
                // transição de regularização, disparada pelo depósito
                status = StatusAssinatura.ATIVA;
                log.add(String.format("  depósito de R$ %.2f regulariza a conta -> ATIVA", valor));
            } else {
                log.add(String.format("  depósito de R$ %.2f, saldo R$ %.2f", valor, saldo));
            }
        }

        void cancelar() {
            if (status == StatusAssinatura.CANCELADA) {
                log.add("  cancelar: já cancelada, nada a fazer");
                return;
            }
            status = StatusAssinatura.CANCELADA;
            log.add("  cancelar -> CANCELADA (estado final)");
        }

        StatusAssinatura getStatus() { return status; }
        List<String> getLog() { return log; }
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);

        System.out.println("== 1. Player: uma reprodução feliz, com buffer e pausa");
        Player p = new Player();
        p.disparar(EventoPlayer.PLAY);
        p.carregarSegundo(); p.carregarSegundo(); p.carregarSegundo();
        p.disparar(EventoPlayer.BUFFER_CHEIO);
        p.disparar(EventoPlayer.PAUSE);
        p.disparar(EventoPlayer.PLAY);
        p.disparar(EventoPlayer.FIM_DA_FAIXA);
        p.getLog().forEach(System.out::println);
        System.out.println("estado final: " + p.getEstado());

        System.out.println("\n== 2. Player: a rede cai no meio da faixa e o buffer esvazia");
        Player q = new Player();
        q.disparar(EventoPlayer.PLAY);
        q.carregarSegundo(); q.carregarSegundo(); q.carregarSegundo();
        q.disparar(EventoPlayer.BUFFER_CHEIO);
        q.disparar(EventoPlayer.BUFFER_VAZIO);
        q.disparar(EventoPlayer.PAUSE);   // inválido: quem está em buffer não pausa
        q.carregarSegundo(); q.carregarSegundo(); q.carregarSegundo();
        q.disparar(EventoPlayer.BUFFER_CHEIO);
        q.getLog().forEach(System.out::println);
        System.out.println("estado final: " + q.getEstado());

        System.out.println("\n== 3. Player: guarda do buffer mínimo (3 segundos)");
        Player r = new Player();
        r.disparar(EventoPlayer.PLAY);
        r.carregarSegundo();
        r.disparar(EventoPlayer.BUFFER_CHEIO);   // guarda falsa: só 1 segundo
        r.getLog().forEach(System.out::println);
        System.out.println("estado final: " + r.getEstado());

        System.out.println("\n== 4. Assinatura: cobrança, suspensão, regularização e cancelamento");
        Assinatura a = new Assinatura(30.10);
        a.cobrancaMensal();      // R$ 30,10 -> ATIVA, sobra R$ 10,20
        a.cobrancaMensal();      // R$ 10,20 -> SUSPENSA (R3)
        a.depositar(15.00);      // regulariza
        a.cancelar();
        a.cobrancaMensal();      // recusada (R4)
        a.depositar(50.00);      // continua cancelada
        a.getLog().forEach(System.out::println);
        System.out.println("status final: " + a.getStatus());
    }
}
