package exercicios.ex4;

/** Parte da composição: só o Album cria faixas. */
public class Faixa {
    private final String titulo;
    private final int duracao;   // em segundos

    // visibilidade de pacote: só o Album cria faixas
    Faixa(String titulo, int duracao) {
        if (duracao <= 0) throw new IllegalArgumentException("Duração inválida");
        this.titulo = titulo;
        this.duracao = duracao;
    }

    public int getDuracao() { return duracao; }
}
