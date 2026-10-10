import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Invariantes sob concorrência.
 * Parte 1: check-then-act (bug): a verificação e a ação não são atômicas.
 * Parte 2: a mesma regra protegida por sincronização.
 * Parte 3: contador sem lock (AtomicLong): atomicidade de uma única variável.
 */
public class Main {

    /** Versão ingênua: verifica e age em momentos separados. */
    static final class ContaIngenua {
        long saldo;
        /** A barreira força o pior escalonamento: os dois checks acontecem antes de qualquer ACT. */
        void sacar(long v, CyclicBarrier depoisDoCheck) throws Exception {
            boolean podeSacar = saldo >= v;     // CHECK
            depoisDoCheck.await();              // ambas as threads já verificaram o saldo
            if (podeSacar) saldo -= v;          // ACT, baseado em um check possivelmente antigo
        }
    }

    /** Versão correta: check e act são uma operação atômica (monitor). */
    static final class ContaSegura {
        private long saldo;
        synchronized void depositar(long v) { saldo += v; }
        synchronized boolean sacar(long v) {
            if (saldo < v) return false;
            saldo -= v;
            return true;
        }
        synchronized long saldo() { return saldo; }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== 1. Check-then-act: dois saques de 100 com saldo 100 ===");
        ContaIngenua ingenua = new ContaIngenua();
        ingenua.saldo = 100;
        CyclicBarrier barreira = new CyclicBarrier(2);
        Thread t1 = new Thread(() -> { try { ingenua.sacar(100, barreira); } catch (Exception e) {} });
        Thread t2 = new Thread(() -> { try { ingenua.sacar(100, barreira); } catch (Exception e) {} });
        t1.start(); t2.start(); t1.join(); t2.join();
        System.out.println("saldo final = " + ingenua.saldo + "  (invariante saldo >= 0 " +
                (ingenua.saldo >= 0 ? "mantido)" : "VIOLADO)"));

        System.out.println("\n=== 2. Mesma regra com monitor (sincronizado) ===");
        ContaSegura segura = new ContaSegura();
        segura.depositar(100);
        Thread s1 = new Thread(() -> segura.sacar(100));
        Thread s2 = new Thread(() -> segura.sacar(100));
        s1.start(); s2.start(); s1.join(); s2.join();
        System.out.println("saldo final = " + segura.saldo() + " (invariante mantido)");

        System.out.println("\n=== 3. Contagem em 4 threads x 100.000 incrementos ===");
        ContaSegura depositos = new ContaSegura();
        Thread[] ts = new Thread[4];
        for (int i = 0; i < ts.length; i++) {
            ts[i] = new Thread(() -> { for (int k = 0; k < 100_000; k++) depositos.depositar(1); });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("esperado 400000, obtido " + depositos.saldo());

        System.out.println("\n=== 4. Variável atômica: sem lock, mas só para uma operação ===");
        AtomicLong contador = new AtomicLong();
        Thread[] as = new Thread[4];
        for (int i = 0; i < as.length; i++) {
            as[i] = new Thread(() -> { for (int k = 0; k < 100_000; k++) contador.incrementAndGet(); });
            as[i].start();
        }
        for (Thread t : as) t.join();
        System.out.println("contador = " + contador.get());
    }
}
