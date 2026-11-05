package catalogo;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/** Implementação do catálogo em memória: trocável por um banco sem mudar quem usa a interface. */
public class CatalogoMemoria implements CatalogoMusica {

    private final Map<String, Musica> musicas = new HashMap<>();

    public CatalogoMemoria(Musica... faixas) {
        for (Musica m : faixas) {
            musicas.put(m.id(), m);
        }
    }

    @Override
    public Optional<Musica> buscar(String id) {
        return Optional.ofNullable(musicas.get(id));
    }
}
