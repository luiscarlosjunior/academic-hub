package tradutor.associacao;

import java.time.LocalDate;

/** UML: Pedido { − data: LocalDate } — não conhece o Cliente (navegabilidade) */
public class Pedido {
    private LocalDate data;

    public Pedido(LocalDate data) { this.data = data; }

    public LocalDate getData() { return data; }
}
