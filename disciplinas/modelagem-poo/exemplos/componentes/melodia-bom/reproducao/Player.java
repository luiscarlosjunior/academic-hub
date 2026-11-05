package reproducao;

import assinatura.VerificadorAssinatura;
import catalogo.CatalogoMusica;
import catalogo.Musica;

/**
 * Componente reprodução. Requer duas interfaces (catálogo e assinatura) e não conhece
 * nenhuma implementação concreta: quem monta o player decide quais usar.
 */
public class Player {

    private final CatalogoMusica catalogo;
    private final VerificadorAssinatura assinaturas;

    public Player(CatalogoMusica catalogo, VerificadorAssinatura assinaturas) {
        this.catalogo = catalogo;
        this.assinaturas = assinaturas;
    }

    public String tocar(String usuario, String id) {
        if (!assinaturas.podeOuvir(usuario)) {
            return "negado: " + usuario + " sem assinatura ativa";
        }
        return catalogo.buscar(id)
                .map(m -> "tocando " + m.titulo() + " (" + m.segundos() + " s) para " + usuario)
                .orElse("faixa " + id + " não encontrada");
    }
}
