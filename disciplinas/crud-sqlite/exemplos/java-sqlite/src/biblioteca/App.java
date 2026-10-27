package biblioteca;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Scanner;

/**
 * Aplicação de console: menu com as operações do CRUD.
 * Lê a entrada de System.in, então pode ser testada com um arquivo: java ... < entrada-exemplo.txt
 */
public class App {

    public static void main(String[] args) {
        String arquivo = args.length > 0 ? args[0] : Conexao.ARQUIVO_PADRAO;
        try (Connection con = Conexao.abrir(arquivo);
             Scanner entrada = new Scanner(System.in)) {
            Conexao.criarTabelas(con);
            LivroDao dao = new LivroDao(con);
            System.out.println("Banco: " + arquivo);
            boolean rodando = true;
            while (rodando) {
                mostrarMenu();
                String opcao = entrada.nextLine().strip();
                try {
                    rodando = executar(opcao, dao, entrada);
                } catch (SQLException e) {
                    System.out.println("Erro no banco: " + e.getMessage());
                } catch (NumberFormatException e) {
                    System.out.println("Valor numérico inválido.");
                }
            }
            System.out.println("Até logo.");
        } catch (SQLException e) {
            System.out.println("Não foi possível abrir o banco: " + e.getMessage());
        }
    }

    private static void mostrarMenu() {
        System.out.println("""
                
                1) Listar livros (página 1)
                2) Buscar por título
                3) Cadastrar livro
                4) Alterar preço
                5) Remover livro
                0) Sair""");
        System.out.print("Escolha: ");
    }

    private static boolean executar(String opcao, LivroDao dao, Scanner entrada) throws SQLException {
        switch (opcao) {
            case "1" -> {
                List<Livro> pagina = dao.listarPagina(1, 10);
                System.out.println("Total de livros: " + dao.contar());
                pagina.forEach(System.out::println);
            }
            case "2" -> {
                System.out.print("Trecho do título: ");
                dao.buscarPorTitulo(entrada.nextLine().strip()).forEach(System.out::println);
            }
            case "3" -> {
                System.out.print("Título: ");
                String titulo = entrada.nextLine();
                System.out.print("Ano: ");
                int ano = Integer.parseInt(entrada.nextLine().strip());
                System.out.print("Preço: ");
                double preco = Double.parseDouble(entrada.nextLine().strip().replace(',', '.'));
                System.out.print("ISBN (vazio se não tiver): ");
                String isbn = entrada.nextLine().strip();
                long id = dao.inserir(new Livro(null, titulo, ano, preco, isbn.isEmpty() ? null : isbn));
                System.out.println("Cadastrado com id " + id);
            }
            case "4" -> {
                System.out.print("Id do livro: ");
                long id = Long.parseLong(entrada.nextLine().strip());
                System.out.print("Novo preço: ");
                double preco = Double.parseDouble(entrada.nextLine().strip().replace(',', '.'));
                var atual = dao.buscarPorId(id);
                if (atual.isEmpty()) {
                    System.out.println("Livro não encontrado.");
                } else {
                    Livro l = atual.get();
                    dao.atualizar(new Livro(l.id(), l.titulo(), l.ano(), preco, l.isbn()));
                    System.out.println("Preço alterado.");
                }
            }
            case "5" -> {
                System.out.print("Id do livro: ");
                long id = Long.parseLong(entrada.nextLine().strip());
                System.out.println(dao.remover(id) ? "Removido." : "Livro não encontrado.");
            }
            case "0" -> {
                return false;
            }
            default -> System.out.println("Opção inválida.");
        }
        return true;
    }
}
