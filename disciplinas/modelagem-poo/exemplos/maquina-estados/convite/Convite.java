/**
 * Convite para o plano Família, com o padrão State feito com enum.
 * Cada estado sabe quais eventos aceita. Os estados finais recusam qualquer evento,
 * e a exceção mostra o erro no lugar de deixar o convite mudar sem regra.
 */
public class Convite {

    enum Status {
        PENDENTE {
            @Override Status aceitar() { return ACEITO; }
            @Override Status recusar() { return RECUSADO; }
            @Override Status expirar() { return EXPIRADO; }
        },
        ACEITO,
        RECUSADO,
        EXPIRADO;

        // Comportamento padrão: estado final, nenhum evento é aceito.
        Status aceitar() { throw new IllegalStateException("convite já está " + this); }
        Status recusar() { throw new IllegalStateException("convite já está " + this); }
        Status expirar() { throw new IllegalStateException("convite já está " + this); }
    }

    private Status status = Status.PENDENTE;
    private final String convidado;
    private final int vagasLivres;

    Convite(String convidado, int vagasLivres) {
        this.convidado = convidado;
        this.vagasLivres = vagasLivres;
    }

    /** Guarda: aceitar só se ainda houver vaga no plano. */
    void aceitar() {
        if (vagasLivres <= 0) {
            System.out.println("  " + convidado + ": aceitar recusado, plano sem vaga (guarda)");
            return;
        }
        status = status.aceitar();
        System.out.println("  " + convidado + ": aceitou -> " + status);
    }

    void recusar() {
        status = status.recusar();
        System.out.println("  " + convidado + ": recusou -> " + status);
    }

    void expirar() {
        status = status.expirar();
        System.out.println("  " + convidado + ": prazo de 7 dias -> " + status);
    }

    Status getStatus() { return status; }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);

        System.out.println("== 1. Convite aceito dentro do prazo");
        Convite ana = new Convite("Ana", 2);
        ana.aceitar();

        System.out.println("\n== 2. Convite recusado e depois aceito (estado final)");
        Convite bruno = new Convite("Bruno", 2);
        bruno.recusar();
        try {
            bruno.aceitar();
        } catch (IllegalStateException erro) {
            System.out.println("  erro capturado: " + erro.getMessage());
        }

        System.out.println("\n== 3. Prazo vence sem resposta");
        Convite carla = new Convite("Carla", 1);
        carla.expirar();

        System.out.println("\n== 4. Plano sem vaga");
        Convite diego = new Convite("Diego", 0);
        diego.aceitar();
        System.out.println("  status final de Diego: " + diego.getStatus());
    }
}
