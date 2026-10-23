package aprofundamento.multiplicidade;

import java.util.*;

// Album "1" *-- "1..*" Musica   (composição, pelo menos uma faixa)
public class Album {
    private final List<Musica> faixas = new ArrayList<>();

    public Album(String titulo, String artista, int primeiraDuracao) {
        // 1..* : o álbum nasce com pelo menos uma faixa
        faixas.add(new Musica(titulo, artista, primeiraDuracao));
    }

    // acrescentado para a demonstração
    public int quantidadeDeFaixas() { return faixas.size(); }
}
