package tradutor.enumeracao;

/** UML: Pedido { − status: Status; − total: int (sublinhado) } */
public class Pedido {
    private Status status = Status.ABERTO;

    // sublinhado na UML = static
    private static int totalDePedidos = 0;

    // acrescentado para a demonstração: cada instância incrementa o contador da classe
    public Pedido() { totalDePedidos++; }

    public static int getTotalDePedidos() { return totalDePedidos; }
    public Status getStatus() { return status; }
}
