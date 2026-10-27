package biblioteca;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * DAO (Data Access Object): todo o SQL da tabela livro está aqui.
 * Cada método corresponde a uma operação do CRUD ou a uma regra de uso do banco.
 * Usa PreparedStatement sempre que há valores vindos de fora: isso evita injeção de SQL.
 */
public class LivroDao {

    private final Connection con;

    public LivroDao(Connection con) {
        this.con = con;
    }

    // ---------- C: create ----------

    /** Insere um livro e devolve o id gerado pelo banco. */
    public long inserir(Livro livro) throws SQLException {
        String sql = "INSERT INTO livro (titulo, ano, preco, isbn) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, livro.titulo().strip());
            ps.setInt(2, livro.ano());
            ps.setDouble(3, livro.preco());
            ps.setString(4, livro.isbn());
            ps.executeUpdate();
            try (ResultSet chaves = ps.getGeneratedKeys()) {
                chaves.next();
                return chaves.getLong(1);
            }
        }
    }

    /** Insere vários livros numa só transação, com envio em lote (addBatch/executeBatch). */
    public int inserirLote(List<Livro> livros) throws SQLException {
        String sql = "INSERT INTO livro (titulo, ano, preco, isbn) VALUES (?, ?, ?, ?)";
        boolean autoCommitAntes = con.getAutoCommit();
        con.setAutoCommit(false);
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            for (Livro l : livros) {
                ps.setString(1, l.titulo().strip());
                ps.setInt(2, l.ano());
                ps.setDouble(3, l.preco());
                ps.setString(4, l.isbn());
                ps.addBatch();
            }
            int[] resultado = ps.executeBatch();
            con.commit();
            return resultado.length;
        } catch (SQLException e) {
            con.rollback();   // se um livro do lote falhar, nenhum entra
            throw e;
        } finally {
            con.setAutoCommit(autoCommitAntes);
        }
    }

    // ---------- R: read ----------

    /** Busca um livro pela chave primária. */
    public Optional<Livro> buscarPorId(long id) throws SQLException {
        String sql = "SELECT id, titulo, ano, preco, isbn FROM livro WHERE id = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapear(rs)) : Optional.empty();
            }
        }
    }

    /** Busca livros cujo título contém o trecho informado (sem diferenciar maiúsculas em ASCII). */
    public List<Livro> buscarPorTitulo(String trecho) throws SQLException {
        String sql = "SELECT id, titulo, ano, preco, isbn FROM livro WHERE titulo LIKE ? ORDER BY titulo";
        List<Livro> lista = new ArrayList<>();
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, "%" + trecho + "%");   // o % é montado no código, não digitado pelo usuário no SQL
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }
        return lista;
    }

    /** Uma página de livros: pagina começa em 1. */
    public List<Livro> listarPagina(int pagina, int tamanho) throws SQLException {
        String sql = "SELECT id, titulo, ano, preco, isbn FROM livro ORDER BY titulo LIMIT ? OFFSET ?";
        List<Livro> lista = new ArrayList<>();
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, tamanho);
            ps.setInt(2, (pagina - 1) * tamanho);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }
        return lista;
    }

    public int contar() throws SQLException {
        try (Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM livro")) {
            rs.next();
            return rs.getInt(1);
        }
    }

    // ---------- U: update ----------

    /** Atualiza título, ano, preço e isbn. Devolve true se a linha existia. */
    public boolean atualizar(Livro livro) throws SQLException {
        String sql = "UPDATE livro SET titulo = ?, ano = ?, preco = ?, isbn = ? WHERE id = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, livro.titulo().strip());
            ps.setInt(2, livro.ano());
            ps.setDouble(3, livro.preco());
            ps.setString(4, livro.isbn());
            ps.setLong(5, livro.id());
            return ps.executeUpdate() == 1;
        }
    }

    /**
     * Atualização condicional: só altera se o preço ainda for o que o usuário viu.
     * Evita que duas pessoas sobrescrevam mudanças uma da outra (controle otimista).
     */
    public boolean atualizarPrecoSeIgual(long id, double precoEsperado, double novoPreco) throws SQLException {
        String sql = "UPDATE livro SET preco = ? WHERE id = ? AND preco = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setDouble(1, novoPreco);
            ps.setLong(2, id);
            ps.setDouble(3, precoEsperado);
            return ps.executeUpdate() == 1;
        }
    }

    // ---------- D: delete ----------

    /** Remove um livro. Devolve true se havia uma linha com esse id. */
    public boolean remover(long id) throws SQLException {
        try (PreparedStatement ps = con.prepareStatement("DELETE FROM livro WHERE id = ?")) {
            ps.setLong(1, id);
            return ps.executeUpdate() == 1;
        }
    }

    // ---------- transação ----------

    /** Troca os preços de dois livros. Ou as duas alterações valem, ou nenhuma. */
    public void trocarPrecos(long idA, long idB) throws SQLException {
        boolean autoCommitAntes = con.getAutoCommit();
        con.setAutoCommit(false);
        try {
            double precoA = precoDe(idA);
            double precoB = precoDe(idB);
            try (PreparedStatement ps = con.prepareStatement("UPDATE livro SET preco = ? WHERE id = ?")) {
                ps.setDouble(1, precoB);
                ps.setLong(2, idA);
                ps.executeUpdate();
                ps.setDouble(1, precoA);
                ps.setLong(2, idB);
                ps.executeUpdate();
            }
            con.commit();
        } catch (SQLException e) {
            con.rollback();
            throw e;
        } finally {
            con.setAutoCommit(autoCommitAntes);
        }
    }

    private double precoDe(long id) throws SQLException {
        return buscarPorId(id)
                .orElseThrow(() -> new SQLException("livro " + id + " não existe"))
                .preco();
    }

    private Livro mapear(ResultSet rs) throws SQLException {
        return new Livro(rs.getLong("id"), rs.getString("titulo"), rs.getInt("ano"),
                rs.getDouble("preco"), rs.getString("isbn"));
    }
}
