/**
 * Nível 2: três estados em ciclo e um evento de emergência que vai a VERMELHO de qualquer cor.
 * O switch cobre todos os casos: o compilador avisa se faltar um estado.
 */
public class Semaforo {

    enum Cor { VERDE, AMARELO, VERMELHO }

    enum Evento { TEMPO, EMERGENCIA }

    private Cor cor = Cor.VERDE;

    void disparar(Evento evento) {
        Cor anterior = cor;
        if (evento == Evento.EMERGENCIA) {
            cor = Cor.VERMELHO;
        } else {
            cor = switch (cor) {
                case VERDE -> Cor.AMARELO;
                case AMARELO -> Cor.VERMELHO;
                case VERMELHO -> Cor.VERDE;
            };
        }
        System.out.println(anterior + " + " + evento + " -> " + cor);
    }

    public static void main(String[] args) {
        Semaforo semaforo = new Semaforo();
        for (int i = 0; i < 4; i++) {
            semaforo.disparar(Evento.TEMPO);
        }
        semaforo.disparar(Evento.EMERGENCIA);
        semaforo.disparar(Evento.TEMPO);
    }
}
