package br.com.loja.dominio;

public class Produto {

    private final String nome;
    private double preco;

    public Produto(String nome, double preco) {
        this.nome = nome;
        setPreco(preco);
    }

    public void setPreco(double preco) {
        if (preco < 0)
            throw new IllegalArgumentException("Preço negativo");
        this.preco = preco;
    }

    public double getPreco() { return preco; }
    public String getNome()  { return nome; }
}
