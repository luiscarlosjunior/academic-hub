package demos;

import biblioteca.Conexao;
import biblioteca.Livro;
import biblioteca.LivroDao;
import java.sql.Connection;
import java.util.List;

/** Tópico 5: atualizar (U) e remover (D), olhando o número de linhas afetadas. */
public class Demo05Atualizar {

    public static void main(String[] args) throws Exception {
        String arq = "demo05.db";
        new java.io.File(arq).delete();
        try (Connection con = Conexao.abrir(arq)) {
            Conexao.criarTabelas(con);
            LivroDao dao = new LivroDao(con);
            long id = dao.inserir(new Livro(null, "Vidas Secas", 1938, 24.5, "978-3"));

            System.out.println("== atualizar");
            boolean ok = dao.atualizar(new Livro(id, "Vidas Secas", 1938, 19.9, "978-3"));
            System.out.println("atualizou: " + ok + ", preço agora: " + dao.buscarPorId(id).get().preco());
            System.out.println("id inexistente: " + dao.atualizar(new Livro(999L, "X", 2000, 1, null)));

            System.out.println("== atualização condicional");
            System.out.println("preço esperado 19.9 -> 17.0: " + dao.atualizarPrecoSeIgual(id, 19.9, 17.0));
            System.out.println("preço esperado 19.9 (já mudou) -> 15.0: " + dao.atualizarPrecoSeIgual(id, 19.9, 15.0));
            System.out.println("preço final: " + dao.buscarPorId(id).get().preco());

            System.out.println("== remover");
            System.out.println("primeira vez: " + dao.remover(id));
            System.out.println("segunda vez: " + dao.remover(id));
            System.out.println("total: " + dao.contar());
        }
        new java.io.File(arq).delete();
    }
}
