package catalogo;

import java.util.Optional;

/** Interface fornecida pelo componente catálogo: quem quiser buscar faixas depende só disto. */
public interface CatalogoMusica {
    Optional<Musica> buscar(String id);
}
