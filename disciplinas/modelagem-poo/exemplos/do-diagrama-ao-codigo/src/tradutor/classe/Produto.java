package tradutor.classe;

/** UML: Produto { − nome: String; − preco: double; + aplicarDesconto(p) } */
public class Produto {
    private String nome;
    private double preco;

    // construtor e getter acrescentados para o exemplo rodar
    public Produto(String nome, double preco) {
        this.nome = nome;
        this.preco = preco;
    }

    public void aplicarDesconto(double p) {
        preco -= preco * p;
    }

    public double getPreco() { return preco; }
}
