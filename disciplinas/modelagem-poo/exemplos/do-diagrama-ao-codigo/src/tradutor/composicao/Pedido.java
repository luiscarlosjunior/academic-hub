package tradutor.composicao;

import java.util.*;

/** UML: Pedido ◆── "1..*" ItemPedido  (composição) */
public class Pedido {
    private final List<ItemPedido> itens = new ArrayList<>();

    // é o Pedido que CRIA o item
    public void adicionar(Produto p, int qtd) {
        itens.add(new ItemPedido(p, qtd));
    }

    // ao descartar o Pedido, os itens vão junto
    public void limpar() { itens.clear(); }

    // acrescentado para a demonstração
    public int quantidadeDeItens() { return itens.size(); }
}
