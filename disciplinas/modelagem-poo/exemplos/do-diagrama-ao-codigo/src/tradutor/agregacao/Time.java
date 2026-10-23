package tradutor.agregacao;

import java.util.*;

/** UML: Time ◇── "1..*" Jogador  (agregação) */
public class Time {
    private List<Jogador> jogadores;

    // recebe jogadores que já existiam
    public Time(List<Jogador> jogadores) {
        this.jogadores = jogadores;
    }

    public void escalar(Jogador j) { jogadores.add(j); }

    // acrescentado para a demonstração
    public int tamanho() { return jogadores.size(); }
}
