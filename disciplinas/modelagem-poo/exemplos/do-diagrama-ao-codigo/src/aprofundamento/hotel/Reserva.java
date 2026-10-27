package aprofundamento.hotel;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/** Reserva "1" o-- "1..*" Quarto : ocupa */
public class Reserva {
    private final LocalDate entrada;
    private final LocalDate saida;
    private final List<Quarto> quartos;

    public Reserva(LocalDate entrada, LocalDate saida, List<Quarto> quartos) {
        if (!saida.isAfter(entrada)) throw new IllegalArgumentException("saída deve ser depois da entrada");
        if (quartos == null || quartos.isEmpty()) throw new IllegalArgumentException("ao menos um quarto (1..*)");
        this.entrada = entrada;
        this.saida = saida;
        this.quartos = List.copyOf(quartos);   // cópia: a reserva não altera a lista de quem chamou
    }

    public int diarias() {
        return (int) ChronoUnit.DAYS.between(entrada, saida);
    }
}
