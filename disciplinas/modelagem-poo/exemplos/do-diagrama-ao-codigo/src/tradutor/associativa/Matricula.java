package tradutor.associativa;

/**
 * Classe associativa: Aluno "*" ── "*" Disciplina, com Matricula { − nota; − faltas }.
 * Aluno e Disciplina passam a referenciar Matricula,
 * não mais um ao outro diretamente.
 */
public class Matricula {
    private final Aluno aluno;
    private final Disciplina disciplina;
    private double nota;
    private int faltas;

    // construtor acrescentado para o exemplo compilar (campos final)
    public Matricula(Aluno aluno, Disciplina disciplina, double nota, int faltas) {
        this.aluno = aluno;
        this.disciplina = disciplina;
        this.nota = nota;
        this.faltas = faltas;
    }

    public boolean aprovado() {
        return nota >= 6.0 && faltas <= 15;
    }
}
