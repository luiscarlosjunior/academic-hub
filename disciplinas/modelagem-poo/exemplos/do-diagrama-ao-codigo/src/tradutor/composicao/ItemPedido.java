package tradutor.composicao;

/** UML: ItemPedido { − quantidade: int } — parte que não existe sem o Pedido */
public class ItemPedido {
    private final Produto produto;
    private final int quantidade;

    // visibilidade de pacote: só o Pedido cria itens
    ItemPedido(Produto produto, int quantidade) {
        this.produto = produto;
        this.quantidade = quantidade;
    }
}
