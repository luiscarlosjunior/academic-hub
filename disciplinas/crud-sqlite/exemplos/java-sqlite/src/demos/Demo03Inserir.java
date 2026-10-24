package demos;

import biblioteca.Conexao;
import biblioteca.Livro;
import biblioteca.LivroDao;
import java.sql.Connection;
import java.util.List;

/** Tópico 3: criar a tabela e inserir (C do CRUD), com id gerado e inserção em lote. */
public class Demo03Inserir {

    public static void main(String[] args) throws Exception {
        String arq = "demo03.db";
        new java.io.File(arq).delete();
        try (Connection con = Conexao.abrir(arq)) {
            Conexao.criarTabelas(con);
            LivroDao dao = new LivroDao(con);

            long id = dao.inserir(new Livro(null, "  Dom Casmurro ", 1899, 29.9, "978-1"));
            System.out.println("id gerado: " + id);

            int n = dao.inserirLote(List.of(
                    new Livro(null, "Vidas Secas", 1938, 24.5, "978-3"),
                    new Livro(null, "Capitães da Areia", 1937, 34.0, "978-4")));
            System.out.println("lote enviado: " + n + " comandos");
            System.out.println("total na tabela: " + dao.contar());

            try {
                dao.inserir(new Livro(null, "Repetido", 2000, 1, "978-1"));
            } catch (java.sql.SQLException e) {
                System.out.println("isbn repetido recusado: código " + e.getErrorCode());
            }
        }
        new java.io.File(arq).delete();
    }
}
