package aprofundamento.hotel;

/** Hospede "1" --> "1..*" Reserva : faz */
public class Hospede {
    private final String nome;

    public Hospede(String nome) { this.nome = nome; }

    public String getNome() { return nome; }
}
