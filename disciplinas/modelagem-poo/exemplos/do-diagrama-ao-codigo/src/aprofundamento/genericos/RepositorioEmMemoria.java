package aprofundamento.genericos;

import java.util.*;
import java.util.function.Function;

/** Implementação simples para o exemplo rodar: guarda as entidades num Map. */
public class RepositorioEmMemoria<T, ID> implements Repositorio<T, ID> {
    private final Map<ID, T> dados = new HashMap<>();
    private final Function<T, ID> extrairId;

    public RepositorioEmMemoria(Function<T, ID> extrairId) {
        this.extrairId = extrairId;
    }

    @Override
    public void salvar(T entidade) { dados.put(extrairId.apply(entidade), entidade); }

    @Override
    public Optional<T> buscar(ID id) { return Optional.ofNullable(dados.get(id)); }
}
