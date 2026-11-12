package aula;

import biblioteca.Conexao;
import biblioteca.Livro;
import biblioteca.LivroDao;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.util.List;
import java.util.Locale;

/**
 * Demonstração do dia 2: o CRUD completo em Java, passo a passo.
 * Recria o arquivo do banco a cada execução, para que a saída seja sempre a mesma.
 */
public class Dia2Demo {

    static final String ARQUIVO = "biblioteca_aula.db";

    public static void main(String[] args) throws Exception {
        Locale.setDefault(Locale.ROOT);
        Files.deleteIfExists(Path.of(ARQUIVO));

        try (Connection con = Conexao.abrir(ARQUIVO)) {
            Conexao.criarTabelas(con);
            LivroDao dao = new LivroDao(con);

            System.out.println("== 1. CREATE: inserir um livro");
            long id = dao.inserir(new Livro(null, "Dom Casmurro", 1899, 39.90, "978-0001"));
            System.out.println("id gerado: " + id);

            System.out.println("\n== 2. CREATE em lote, numa transação");
            int inseridos = dao.inserirLote(List.of(
                    new Livro(null, "Memórias Póstumas", 1881, 35.00, "978-0002"),
                    new Livro(null, "Iracema", 1865, 22.50, "978-0003"),
                    new Livro(null, "Capitães da Areia", 1937, 48.00, "978-0004")));
            System.out.println("livros inseridos no lote: " + inseridos);

            System.out.println("\n== 3. READ: listar em páginas de 2");
            for (Livro l : dao.listarPagina(1, 2)) System.out.println("  " + l);
            System.out.println("  --- página 2");
            for (Livro l : dao.listarPagina(2, 2)) System.out.println("  " + l);
            System.out.println("total na tabela: " + dao.contar());

            System.out.println("\n== 4. READ: buscar por id e por trecho do título");
            System.out.println("buscarPorId(1): " + dao.buscarPorId(1).map(Livro::toString).orElse("não existe"));
            System.out.println("buscarPorId(99): " + dao.buscarPorId(99).map(Livro::toString).orElse("não existe"));
            for (Livro l : dao.buscarPorTitulo("ca")) System.out.println("  título contém 'ca': " + l);

            System.out.println("\n== 5. UPDATE: atualizar o preço de Iracema");
            Livro iracema = dao.buscarPorId(3).orElseThrow();
            boolean ok = dao.atualizar(new Livro(iracema.id(), iracema.titulo(), iracema.ano(), 25.90, iracema.isbn()));
            System.out.println("atualizado: " + ok + " -> " + dao.buscarPorId(3).orElseThrow());

            System.out.println("\n== 6. UPDATE condicional (controle otimista)");
            System.out.println("preço era 25.90? " + dao.atualizarPrecoSeIgual(3, 25.90, 24.00));
            System.out.println("preço era 25.90 de novo? " + dao.atualizarPrecoSeIgual(3, 25.90, 20.00));

            System.out.println("\n== 7. TRANSAÇÃO: trocar preços de dois livros");
            dao.trocarPrecos(1, 2);
            System.out.println("Dom Casmurro: " + dao.buscarPorId(1).orElseThrow().preco()
                    + " | Memórias: " + dao.buscarPorId(2).orElseThrow().preco());

            System.out.println("\n== 8. DELETE: remover um livro");
            System.out.println("remover(4): " + dao.remover(4));
            System.out.println("remover(4) de novo: " + dao.remover(4));
            System.out.println("total final: " + dao.contar());

            System.out.println("\n== 9. Consultas extras");
            System.out.println("livros de 1881: " + dao.buscarPorAno(1881));
            System.out.printf("preço médio: %.2f%n", dao.precoMedio());
            System.out.println("existe ISBN 978-0002? " + dao.existeIsbn("978-0002"));
            System.out.println("existe ISBN 000-0000? " + dao.existeIsbn("000-0000"));
            System.out.println("desconto de 10% em livros anteriores a 1900: " + dao.aplicarDescontoAntesDe(1900, 10));
            for (Livro l : dao.listarPagina(1, 10)) System.out.println("  " + l);
        }
    }
}
