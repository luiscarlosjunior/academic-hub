package melodia;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * AGREGAÇÃO: a playlist apenas referencia músicas que existem no catálogo.
 * Apagar a playlist NÃO apaga as músicas. O dono é uma referência.
 */
public class Playlist {

    private final String nome;
    private final Ouvinte dono;
    private final List<Musica> musicas = new ArrayList<>();

    /** Construtor com acesso de pacote: só o Ouvinte cria playlists (ponto único de criação). */
    Playlist(String nome, Ouvinte dono) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("nome da playlist é obrigatório");
        }
        this.nome = nome;
        this.dono = dono;
    }

    /** Recebe uma música já existente. Não cria nem duplica. */
    public void adicionar(Musica m) {
        if (m == null) throw new IllegalArgumentException("música nula");
        if (!musicas.contains(m)) musicas.add(m);
    }

    public void remover(Musica m) {
        musicas.remove(m);
    }

    /** Atributo derivado: calculado quando pedido, nunca guardado (evita inconsistência). */
    public int duracaoTotalSegundos() {
        int total = 0;
        for (Musica m : musicas) total += m.getDuracaoSegundos();
        return total;
    }

    public String getNome()          { return nome; }
    public Ouvinte getDono()         { return dono; }
    public List<Musica> getMusicas() { return Collections.unmodifiableList(musicas); }
}
