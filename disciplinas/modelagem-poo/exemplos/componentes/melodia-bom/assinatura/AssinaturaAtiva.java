package assinatura;

import java.util.Set;

/** Implementação simples: uma lista de usuários com assinatura ativa. */
public class AssinaturaAtiva implements VerificadorAssinatura {

    private final Set<String> ativos;

    public AssinaturaAtiva(String... usuarios) {
        this.ativos = Set.of(usuarios);
    }

    @Override
    public boolean podeOuvir(String usuario) {
        return ativos.contains(usuario);
    }
}
