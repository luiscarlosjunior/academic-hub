package aprofundamento.genericos;

import java.util.Optional;

// Classe parametrizada: um repositório genérico para qualquer entidade
public interface Repositorio<T, ID> {
    void salvar(T entidade);
    Optional<T> buscar(ID id);
}
