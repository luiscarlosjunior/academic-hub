/**
 * Diagrama de sequência em Java: o checkout de uma loja.
 * Cada chamada vira uma mensagem numerada. O recuo mostra a barra de ativação (a pilha de chamadas).
 * Fragmentos: opt (cupom opcional), alt (aprovado ou recusado), loop (reservar cada item), ref (autenticação).
 */
public class Main {

    static int passo = 0;
    static int profundidade = 0;

    /** Mensagem síncrona: o emissor espera a execução do corpo (barra de ativação). */
    static void chamada(String de, String para, String texto, Runnable corpo) {
        passo++;
        System.out.println("  ".repeat(profundidade) + passo + ": " + de + " -> " + para + ": " + texto);
        profundidade++;
        corpo.run();
        profundidade--;
    }

    /** Mensagem de retorno: linha tracejada no diagrama. */
    static void retorno(String de, String para, String valor) {
        passo++;
        System.out.println("  ".repeat(profundidade) + passo + ": " + de + " --> " + para + ": " + valor);
    }

    static void checkout(boolean comCupom, boolean aprovado, List2 itens) {
        chamada("Cliente", "Interface", "finalizar compra", () ->
        chamada("Interface", "Checkout", "iniciar(carrinho)", () -> {

            // ref: a autenticação é um cenário reaproveitado (aparece em outros diagramas)
            chamada("Checkout", "Sessao", "autenticar()  [ref: Autenticação]", () ->
                    retorno("Sessao", "Checkout", "usuário válido"));

            // opt: o cupom só é validado se o cliente informou um
            if (comCupom) {
                chamada("Checkout", "Cupons", "validar(BEMVINDO10)", () ->
                        retorno("Cupons", "Checkout", "desconto de 10%"));
            }

            // loop: cada item é reservado no estoque
            for (String item : itens.valores) {
                chamada("Checkout", "Estoque", "reservar(" + item + ")", () ->
                        retorno("Estoque", "Checkout", "reservado"));
            }

            // alt: caminho de sucesso ou de recusa do cartão
            chamada("Checkout", "Gateway", "cobrar(total)", () -> {
                if (aprovado) {
                    retorno("Gateway", "Checkout", "aprovado");
                    chamada("Checkout", "Pedidos", "criar(pedido)", () ->
                            retorno("Pedidos", "Checkout", "pedido P-2001"));
                } else {
                    retorno("Gateway", "Checkout", "recusado");
                    chamada("Checkout", "Pedidos", "cancelar(reservas)", () ->
                            retorno("Pedidos", "Checkout", "reservas liberadas"));
                }
            });
            retorno("Checkout", "Interface", aprovado ? "pedido concluído" : "pagamento recusado");
        }));
        retorno("Interface", "Cliente", aprovado ? "confirmação na tela" : "tente outro cartão");
    }

    /** Pequeno invólucro para passar a lista de itens como um valor simples. */
    static final class List2 {
        final java.util.List<String> valores;
        List2(String... v) { valores = java.util.List.of(v); }
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);   // saída igual em qualquer máquina
        System.out.println("== Cenário A: com cupom, cartão aprovado");
        passo = 0; profundidade = 0;
        checkout(true, true, new List2("FONE-01", "CAPA-07"));

        System.out.println("\n== Cenário B: sem cupom, cartão recusado");
        passo = 0; profundidade = 0;
        checkout(false, false, new List2("CABO-02"));
    }
}
