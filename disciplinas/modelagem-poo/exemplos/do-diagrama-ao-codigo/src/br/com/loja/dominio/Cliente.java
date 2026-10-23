package br.com.loja.dominio;

import java.util.*;

public class Cliente {

    private final String nome;
    private final String email;

    // associação * — navegável só deste lado
    private final List<Pedido> pedidos = new ArrayList<>();

    public Cliente(String nome, String email) {
        this.nome = nome;
        this.email = email;
    }

    public Pedido novoPedido(String numero) {
        Pedido p = new Pedido(numero, this);
        pedidos.add(p);
        return p;
    }
}
