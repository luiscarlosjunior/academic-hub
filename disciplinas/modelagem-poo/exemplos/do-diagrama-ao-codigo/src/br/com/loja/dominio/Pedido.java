package br.com.loja.dominio;

import java.time.LocalDate;
import java.util.*;

public class Pedido implements Pagavel {

    private final String numero;
    private final LocalDate data;
    private Status status = Status.ABERTO;

    // associação 1: todo pedido tem um cliente
    private final Cliente cliente;

    // composição 1..*: o pedido é dono dos itens
    private final List<ItemPedido> itens = new ArrayList<>();

    public Pedido(String numero, Cliente cliente) {
        this.numero = Objects.requireNonNull(numero);
        this.cliente = Objects.requireNonNull(cliente);
        this.data = LocalDate.now();
    }

    // o Pedido CRIA o item — isso é composição
    public void adicionar(Produto p, int quantidade) {
        if (status != Status.ABERTO)
            throw new IllegalStateException("Pedido já fechado");
        itens.add(new ItemPedido(p, quantidade));
    }

    @Override
    public double calcularTotal() {
        return itens.stream()
                    .mapToDouble(ItemPedido::subtotal)
                    .sum();
    }

    // multiplicidade 1..* vira regra de negócio explícita
    public void fechar() {
        if (itens.isEmpty())
            throw new IllegalStateException("Pedido precisa de ao menos 1 item");
        status = Status.AGUARDANDO_PAGAMENTO;
    }

    public List<ItemPedido> getItens() {
        return Collections.unmodifiableList(itens);
    }

    // acrescentado para a demonstração (não aparece na aula)
    public Status getStatus() { return status; }
    public String getNumero() { return numero; }
}
