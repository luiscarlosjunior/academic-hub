package exercicios.ex2;

import java.util.*;

/**
 * Exercício 2 (corrigido): em vez de public List<Musica> faixas,
 * a lista é privada, a adição é feita pelo próprio álbum
 * e o acesso externo recebe uma visão imutável.
 */
public class Album {
    private final List<Musica> faixas = new ArrayList<>();

    public void adicionarFaixa(String titulo) {
        faixas.add(new Musica(titulo));
    }

    public List<Musica> getFaixas() {
        return Collections.unmodifiableList(faixas);
    }
}
