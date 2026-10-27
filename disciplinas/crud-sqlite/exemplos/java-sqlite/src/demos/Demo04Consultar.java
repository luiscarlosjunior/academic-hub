package demos;

import biblioteca.Conexao;
import biblioteca.Livro;
import biblioteca.LivroDao;
import java.sql.Connection;
import java.util.List;

/** Tópico 4: consultar (R do CRUD): por chave, por trecho de título e paginado. */
public class Demo04Consultar {

    public static void main(String[] args) throws Exception {
        String arq = "demo04.db";
        new java.io.File(arq).delete();
        try (Connection con = Conexao.abrir(arq)) {
            Conexao.criarTabelas(con);
            LivroDao dao = new LivroDao(con);
            dao.inserirLote(List.of(
                    new Livro(null, "Dom Casmurro", 1899, 29.9, "978-1"),
                    new Livro(null, "Memórias Póstumas", 1881, 39.9, "978-2"),
                    new Livro(null, "Vidas Secas", 1938, 24.5, "978-3"),
                    new Livro(null, "Capitães da Areia", 1937, 34.0, "978-4"),
                    new Livro(null, "A Hora da Estrela", 1977, 27.0, "978-5")));

            System.out.println("== por chave");
            dao.buscarPorId(3).ifPresentOrElse(
                    l -> System.out.println("achou: " + l),
                    () -> System.out.println("não existe"));
            System.out.println("id 99: " + dao.buscarPorId(99).isPresent());

            System.out.println("== por trecho do título ('da')");
            dao.buscarPorTitulo("da").forEach(System.out::println);

            System.out.println("== paginação, 2 por página");
            for (int pagina = 1; pagina <= 3; pagina++) {
                List<Livro> p = dao.listarPagina(pagina, 2);
                System.out.println("página " + pagina + ": " + p.stream().map(Livro::titulo).toList());
            }
        }
        new java.io.File(arq).delete();
    }
}
