import java.util.ArrayList;
import java.util.List;

/**
 * Exercício: o login da conta Melodia.
 * Leia o código, desenhe o diagrama de estados e só depois confira o gabarito da página.
 * Não há diagrama aqui de propósito: o desenho é a tarefa.
 */
public class Login {

    enum Estado { DESLOGADO, AGUARDANDO_CODIGO, LOGADO, BLOQUEADA }

    enum Evento { SENHA_CORRETA, SENHA_ERRADA, CODIGO_CORRETO, CODIGO_ERRADO, TEMPO_ESGOTADO, LOGOUT }

    static final class Conta {
        private Estado estado = Estado.DESLOGADO;
        private int falhas;
        private final List<String> log = new ArrayList<>();

        void disparar(Evento evento) {
            Estado anterior = estado;
            estado = switch (estado) {
                case DESLOGADO -> {
                    if (evento == Evento.SENHA_CORRETA) yield Estado.AGUARDANDO_CODIGO;
                    if (evento == Evento.SENHA_ERRADA) {
                        falhas++;
                        yield falhas >= 3 ? Estado.BLOQUEADA : Estado.DESLOGADO;
                    }
                    yield Estado.DESLOGADO;
                }
                case AGUARDANDO_CODIGO -> {
                    if (evento == Evento.CODIGO_CORRETO) {
                        falhas = 0;
                        yield Estado.LOGADO;
                    }
                    if (evento == Evento.CODIGO_ERRADO || evento == Evento.TEMPO_ESGOTADO) yield Estado.DESLOGADO;
                    yield Estado.AGUARDANDO_CODIGO;
                }
                case LOGADO -> evento == Evento.LOGOUT ? Estado.DESLOGADO : Estado.LOGADO;
                case BLOQUEADA -> Estado.BLOQUEADA;
            };
            log.add(String.format("  %-18s + %-15s -> %s", anterior, evento, estado));
        }

        Estado getEstado() { return estado; }
        List<String> getLog() { return log; }
    }

    static void cenario(String titulo, Evento... eventos) {
        Conta conta = new Conta();
        System.out.println("== " + titulo);
        for (Evento e : eventos) conta.disparar(e);
        conta.getLog().forEach(System.out::println);
        System.out.println("estado final: " + conta.getEstado());
        System.out.println();
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);
        cenario("1. Login feliz",
                Evento.SENHA_CORRETA, Evento.CODIGO_CORRETO, Evento.LOGOUT);
        cenario("2. Três senhas erradas",
                Evento.SENHA_ERRADA, Evento.SENHA_ERRADA, Evento.SENHA_ERRADA, Evento.SENHA_CORRETA);
        cenario("3. Código errado e tempo esgotado",
                Evento.SENHA_CORRETA, Evento.CODIGO_ERRADO, Evento.SENHA_CORRETA, Evento.TEMPO_ESGOTADO);
    }
}
