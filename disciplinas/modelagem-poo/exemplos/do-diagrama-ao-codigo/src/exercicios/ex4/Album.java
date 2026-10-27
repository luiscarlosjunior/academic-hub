package exercicios.ex4;

import java.util.*;

/**
 * Exercício 4: Album "*" --> "1" Artista  e  Album "1" *-- "1..*" Faixa.
 */
public class Album {
    private final String titulo;
    // associação 1, navegável Album → Artista
    private final Artista artista;
    // composição 1..*
    private final List<Faixa> faixas = new ArrayList<>();

    public Album(String titulo, Artista artista, String primeiraFaixa, int duracao) {
        this.titulo = titulo;
        this.artista = Objects.requireNonNull(artista);  // 1: obrigatório
        faixas.add(new Faixa(primeiraFaixa, duracao));   // 1..*: nasce com uma faixa
    }

    public void adicionarFaixa(String titulo, int duracao) {
        faixas.add(new Faixa(titulo, duracao));  // o álbum cria a faixa
    }

    public int duracaoTotal() {
        return faixas.stream().mapToInt(Faixa::getDuracao).sum();
    }

    public List<Faixa> getFaixas() {
        return Collections.unmodifiableList(faixas);
    }
}
