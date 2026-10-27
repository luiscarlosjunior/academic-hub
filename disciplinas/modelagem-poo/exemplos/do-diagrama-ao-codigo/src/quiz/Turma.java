package quiz;

import java.util.*;

/** Quiz 1: Turma "1" —— "3..40" Aluno → coleção + validação explícita dos limites. */
public class Turma {
    public static final int MINIMO = 3;
    public static final int MAXIMO = 40;

    private final List<Aluno> alunos = new ArrayList<>();

    public void matricular(Aluno a) {
        if (alunos.size() == MAXIMO)
            throw new IllegalStateException("Turma cheia (máximo " + MAXIMO + ")");
        alunos.add(Objects.requireNonNull(a));
    }

    // o mínimo só pode ser cobrado quando a turma vai começar
    public void iniciar() {
        if (alunos.size() < MINIMO)
            throw new IllegalStateException("Turma precisa de ao menos " + MINIMO + " alunos");
    }
}
