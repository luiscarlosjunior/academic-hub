package melodia;

/**
 * SUPERCLASSE ABSTRATA: define o que todo usuário tem (nome) e o contrato tipoDePerfil().
 * Não existe "usuário genérico": só ouvintes e artistas, por isso é abstrata.
 */
public abstract class Usuario {

    private final String nome;

    protected Usuario(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("nome é obrigatório");
        }
        this.nome = nome;
    }

    /** Operação abstrata: cada subclasse fornece o seu método (polimorfismo). */
    public abstract String tipoDePerfil();

    /** Método concreto reutilizado por todas as subclasses; chama a operação abstrata. */
    public String resumo() {
        return tipoDePerfil() + ": " + nome;
    }

    public String getNome() { return nome; }
}
