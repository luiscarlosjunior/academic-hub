package br.com.loja.dominio;

/** Parte de um Pedido. Não faz sentido existir sozinho. */
public class ItemPedido {

    private final Produto produto;   // associação 1
    private final int quantidade;

    // visibilidade de pacote: só o Pedido cria itens
    ItemPedido(Produto produto, int quantidade) {
        if (quantidade <= 0)
            throw new IllegalArgumentException("Quantidade inválida");
        this.produto = produto;
        this.quantidade = quantidade;
    }

    public double subtotal() {
        return produto.getPreco() * quantidade;
    }
}
