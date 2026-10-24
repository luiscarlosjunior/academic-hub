package demos;

import biblioteca.Conexao;
import biblioteca.Livro;
import biblioteca.LivroDao;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

/** Tópico 6: transações com commit e rollback, e leitura dos erros do banco. */
public class Demo06Transacoes {

    public static void main(String[] args) throws Exception {
        String arq = "demo06.db";
        new java.io.File(arq).delete();
        try (Connection con = Conexao.abrir(arq)) {
            Conexao.criarTabelas(con);
            LivroDao dao = new LivroDao(con);
            long a = dao.inserir(new Livro(null, "Dom Casmurro", 1899, 29.9, null));
            long b = dao.inserir(new Livro(null, "Vidas Secas", 1938, 19.9, null));

            System.out.println("antes:  " + precos(dao, a, b));
            dao.trocarPrecos(a, b);
            System.out.println("troca:  " + precos(dao, a, b));

            try {
                dao.trocarPrecos(a, 999);     // o segundo livro não existe
            } catch (SQLException e) {
                System.out.println("falhou: " + e.getMessage());
            }
            System.out.println("depois da falha (nada mudou): " + precos(dao, a, b));

            System.out.println("== lote com um registro inválido (preço negativo)");
            try {
                dao.inserirLote(List.of(
                        new Livro(null, "Bom", 2000, 10, null),
                        new Livro(null, "Ruim", 2000, -1, null)));
            } catch (SQLException e) {
                System.out.println("lote recusado: código " + e.getErrorCode());
            }
            System.out.println("total após o lote recusado: " + dao.contar());
        }
        new java.io.File(arq).delete();
    }

    private static String precos(LivroDao dao, long a, long b) throws SQLException {
        return dao.buscarPorId(a).get().preco() + " / " + dao.buscarPorId(b).get().preco();
    }
}
