package exercicio;

import biblioteca.Conexao;
import biblioteca.Livro;
import biblioteca.LivroDao;

import java.sql.Connection;
import java.util.List;
import java.util.Locale;

/**
 * Teste automático dos exercícios do dia 2. Rode esta classe depois de cada alteração.
 * Cada linha diz OK ou FALHOU; no fim, o total de acertos.
 * Usa um banco em memória: nada é gravado em disco.
 */
public class ExercicioTeste {

    private static int passou = 0;
    private static int total = 0;

    public static void main(String[] args) throws Exception {
        Locale.setDefault(Locale.ROOT);
        try (Connection con = Conexao.abrir(":memory:")) {
            Conexao.criarTabelas(con);
            LivroDao dao = new LivroDao(con);
            dao.inserirLote(List.of(
                    new Livro(null, "Dom Casmurro", 1899, 40.00, "978-1"),
                    new Livro(null, "Iracema", 1865, 20.00, "978-2"),
                    new Livro(null, "Capitães da Areia", 1937, 50.00, "978-3"),
                    new Livro(null, "Memórias Póstumas", 1881, 30.00, "978-4")));

            verifica("buscarPorAno(1899) traz só Dom Casmurro",
                    () -> dao.buscarPorAno(1899).size() == 1 && dao.buscarPorAno(1899).get(0).titulo().equals("Dom Casmurro"));
            verifica("buscarPorAno(1000) devolve lista vazia",
                    () -> dao.buscarPorAno(1000).isEmpty());
            verifica("precoMedio() é 35.00 para estes quatro livros",
                    () -> Math.abs(dao.precoMedio() - 35.00) < 0.001);
            verifica("existeIsbn('978-2') é verdadeiro",
                    () -> dao.existeIsbn("978-2"));
            verifica("existeIsbn('999-9') é falso",
                    () -> !dao.existeIsbn("999-9"));
            verifica("aplicarDescontoAntesDe(1900, 10) muda 3 livros",
                    () -> dao.aplicarDescontoAntesDe(1900, 10) == 3);
            verifica("após o desconto, Iracema custa 18.00",
                    () -> Math.abs(dao.buscarPorId(2).orElseThrow().preco() - 18.00) < 0.001);
            verifica("Capitães da Areia (1937) não recebe desconto e custa 50.00",
                    () -> Math.abs(dao.buscarPorId(3).orElseThrow().preco() - 50.00) < 0.001);
        }
        System.out.println("\n" + passou + " de " + total + " testes passaram.");
    }

    private interface Checagem {
        boolean executa() throws Exception;
    }

    private static void verifica(String descricao, Checagem checagem) {
        total++;
        boolean ok;
        try {
            ok = checagem.executa();
        } catch (Exception e) {
            ok = false;
            descricao += " (erro: " + e.getClass().getSimpleName() + ": " + e.getMessage() + ")";
        }
        if (ok) passou++;
        System.out.println((ok ? "OK      " : "FALHOU ") + descricao);
    }
}
