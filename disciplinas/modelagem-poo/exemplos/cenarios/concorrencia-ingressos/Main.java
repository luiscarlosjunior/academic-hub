import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * CENÁRIO: venda do último lote de ingressos de um evento.
 * 10 compradores tentam pegar um dos 5 ingressos restantes ao mesmo tempo.
 * A versão ingênua vende mais ingressos do que existem (oversell).
 * Versões corretas: monitor (synchronized) ou CAS (compareAndSet), sem perder vendas.
 */
public class Main {

    static final int COMPRADORES = 10;
    static final int INGRESSOS = 5;

    /** Ingênua: verifica e vende em momentos distintos. A barreira força o pior escalonamento. */
    static int venderIngenuo() throws Exception {
        AtomicInteger disponiveis = new AtomicInteger(INGRESSOS);
        AtomicInteger vendidos = new AtomicInteger();
        CyclicBarrier barreira = new CyclicBarrier(COMPRADORES);
        Thread[] ts = new Thread[COMPRADORES];
        for (int i = 0; i < COMPRADORES; i++) {
            ts[i] = new Thread(() -> {
                try {
                    boolean viu = disponiveis.get() > 0;     // CHECK
                    barreira.await();                        // todos já viram "há ingresso"
                    if (viu) {
                        disponiveis.decrementAndGet();      // ACT sobre um check obsoleto
                        vendidos.incrementAndGet();
                    }
                } catch (Exception e) { throw new RuntimeException(e); }
            });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        return vendidos.get();
    }

    /** Correta com monitor: check e venda são uma operação. */
    static final class Bilheteria {
        private int disponiveis = INGRESSOS;
        synchronized boolean vender() {
            if (disponiveis == 0) return false;
            disponiveis--;
            return true;
        }
        synchronized int disponiveis() { return disponiveis; }
    }

    /** Correta sem bloqueio: laço de compareAndSet. */
    static final class BilheteriaCAS {
        private final AtomicInteger disponiveis = new AtomicInteger(INGRESSOS);
        boolean vender() {
            while (true) {
                int atual = disponiveis.get();
                if (atual == 0) return false;
                if (disponiveis.compareAndSet(atual, atual - 1)) return true;   // tenta de novo se perdeu a corrida
            }
        }
        int disponiveis() { return disponiveis.get(); }
    }

    static int venderComBilheteria(java.util.function.BooleanSupplier venda) throws InterruptedException {
        AtomicInteger vendidos = new AtomicInteger();
        Thread[] ts = new Thread[COMPRADORES];
        for (int i = 0; i < COMPRADORES; i++) {
            ts[i] = new Thread(() -> { if (venda.getAsBoolean()) vendidos.incrementAndGet(); });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        return vendidos.get();
    }

    public static void main(String[] args) throws Exception {
        java.util.Locale.setDefault(java.util.Locale.ROOT);   // saída reprodutível em qualquer máquina
        System.out.println("=== Versão ingênua (check-then-act) ===");
        System.out.println("ingressos vendidos: " + venderIngenuo() + " de " + INGRESSOS + " existentes");

        System.out.println("\n=== Monitor (synchronized) ===");
        Bilheteria bilheteria = new Bilheteria();
        int v1 = venderComBilheteria(bilheteria::vender);
        System.out.println("vendidos: " + v1 + ", restantes: " + bilheteria.disponiveis());

        System.out.println("\n=== Compare-and-set (sem bloqueio) ===");
        BilheteriaCAS cas = new BilheteriaCAS();
        int v2 = venderComBilheteria(cas::vender);
        System.out.println("vendidos: " + v2 + ", restantes: " + cas.disponiveis());
    }
}
