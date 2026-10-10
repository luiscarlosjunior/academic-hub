import java.util.*;
import java.util.function.Consumer;

/**
 * CENÁRIO: barramento de eventos de um marketplace.
 * Auditoria quer ver TODOS os eventos; o módulo financeiro só quer PedidoPago.
 * O uso correto de wildcards deixa um único barramento servir aos dois sem cast.
 */
public class Main {

    interface Evento { String tipo(); }
    record PedidoPago(String pedidoId, long centavos) implements Evento {
        public String tipo() { return "PedidoPago"; }
    }
    record PagamentoRecusado(String pedidoId, String motivo) implements Evento {
        public String tipo() { return "PagamentoRecusado"; }
    }

    static final class BarramentoDeEventos {
        private final List<Consumer<Evento>> roteadores = new ArrayList<>();

        // Consumer<? super T>: o assinante aceita T ou qualquer supertipo (contravariância).
        // Por isso, um auditor que recebe Evento pode se inscrever em PedidoPago.
        <T extends Evento> void assinar(Class<T> tipo, Consumer<? super T> handler) {
            roteadores.add(e -> {
                if (tipo.isInstance(e)) handler.accept(tipo.cast(e));
            });
        }

        void publicar(Evento e) { roteadores.forEach(r -> r.accept(e)); }
    }

    // Produtor de leitura: ? extends Evento aceita listas de qualquer subtipo (covariância).
    static Map<String, Integer> contarPorTipo(Collection<? extends Evento> eventos) {
        Map<String, Integer> contagem = new TreeMap<>();
        for (Evento e : eventos) contagem.merge(e.tipo(), 1, Integer::sum);
        return contagem;
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);   // saída reprodutível em qualquer máquina
        BarramentoDeEventos barramento = new BarramentoDeEventos();
        List<Evento> registro = new ArrayList<>();

        // Auditoria: recebe qualquer Evento (Consumer<Evento> serve para Consumer<? super PedidoPago>)
        Consumer<Evento> auditoria = registro::add;
        barramento.assinar(Evento.class, auditoria);

        // Financeiro: só pagamentos aprovados
        barramento.assinar(PedidoPago.class, p ->
                System.out.printf("financeiro: creditar R$ %.2f do pedido %s%n", p.centavos() / 100.0, p.pedidoId()));

        barramento.publicar(new PedidoPago("PED-1", 19990));
        barramento.publicar(new PagamentoRecusado("PED-2", "cartão sem limite"));
        barramento.publicar(new PedidoPago("PED-3", 4500));

        System.out.println("auditoria recebeu " + registro.size() + " eventos");
        System.out.println("contagem: " + contarPorTipo(registro));
        System.out.println("contagem de só pagamentos: " + contarPorTipo(List.of(new PedidoPago("X", 1))));
    }
}
