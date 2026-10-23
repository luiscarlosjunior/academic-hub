package exercicios.ex4;

import java.util.Objects;

public class Artista {
    private final String nome;

    public Artista(String nome) { this.nome = Objects.requireNonNull(nome); }

    public String getNome() { return nome; }
}
