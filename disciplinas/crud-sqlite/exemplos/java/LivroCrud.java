import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * CRUD de livros com JDBC e SQLite.
 * Compile e rode (com o driver sqlite-jdbc no classpath):
 *   javac -cp sqlite-jdbc.jar -d out LivroCrud.java
 *   java -cp out:sqlite-jdbc.jar LivroCrud
 */
public class LivroCrud {

    record Livro(Long id, String titulo, int ano, double preco, String isbn) {}

    static {
        // Registra o driver do SQLite. Em JDBC 4+ isso costuma ser automático,
        // mas o registro explícito deixa claro de onde vem a conexão.
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("driver sqlite-jdbc não está no classpath", e);
        }
    }

    private final String url;

    LivroCrud(String url) throws SQLException {
        this.url = url;
        try (Connection con = conectar(); Statement st = con.createStatement()) {
            st.execute("PRAGMA foreign_keys = ON");
            st.execute("""
                CREATE TABLE IF NOT EXISTS livro (
                    id     INTEGER PRIMARY KEY,
                    titulo TEXT    NOT NULL,
                    ano    INTEGER NOT NULL CHECK (ano > 0),
                    preco  REAL    NOT NULL DEFAULT 0 CHECK (preco >= 0),
                    isbn   TEXT    UNIQUE)""");
        }
    }

    private Connection conectar() throws SQLException {
        Connection con = DriverManager.getConnection(url);
        try (Statement st = con.createStatement()) {
            st.execute("PRAGMA foreign_keys = ON");   // a cada conexão: é uma configuração da sessão
        }
        return con;
    }

    // C: create. PreparedStatement evita injeção de SQL.
    Livro criar(Livro l) throws SQLException {
        String sql = "INSERT INTO livro (titulo, ano, preco, isbn) VALUES (?, ?, ?, ?)";
        try (Connection con = conectar();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, l.titulo().strip());
            ps.setInt(2, l.ano());
            ps.setDouble(3, l.preco());
            ps.setString(4, l.isbn());
            ps.executeUpdate();
            try (ResultSet chaves = ps.getGeneratedKeys()) {
                chaves.next();
                return new Livro(chaves.getLong(1), l.titulo().strip(), l.ano(), l.preco(), l.isbn());
            }
        }
    }

    // R: read por chave
    Optional<Livro> buscar(long id) throws SQLException {
        String sql = "SELECT id, titulo, ano, preco, isbn FROM livro WHERE id = ?";
        try (Connection con = conectar(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapear(rs)) : Optional.empty();
            }
        }
    }

    // R: read em lista, com filtro e ordenação
    List<Livro> listar(int anoMinimo) throws SQLException {
        String sql = "SELECT id, titulo, ano, preco, isbn FROM livro WHERE ano >= ? ORDER BY titulo";
        List<Livro> lista = new ArrayList<>();
        try (Connection con = conectar(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, anoMinimo);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapear(rs));
            }
        }
        return lista;
    }

    // U: update. Devolve quantas linhas mudaram (0 significa "não existe").
    int atualizar(Livro l) throws SQLException {
        String sql = "UPDATE livro SET titulo = ?, ano = ?, preco = ?, isbn = ? WHERE id = ?";
        try (Connection con = conectar(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, l.titulo());
            ps.setInt(2, l.ano());
            ps.setDouble(3, l.preco());
            ps.setString(4, l.isbn());
            ps.setLong(5, l.id());
            return ps.executeUpdate();
        }
    }

    // D: delete
    int remover(long id) throws SQLException {
        try (Connection con = conectar(); PreparedStatement ps = con.prepareStatement("DELETE FROM livro WHERE id = ?")) {
            ps.setLong(1, id);
            return ps.executeUpdate();
        }
    }

    // Transação: duas operações que precisam acontecer juntas (tudo ou nada)
    void trocarPrecos(long idA, long idB) throws SQLException {
        try (Connection con = conectar()) {
            con.setAutoCommit(false);
            try (PreparedStatement sel = con.prepareStatement("SELECT preco FROM livro WHERE id = ?");
                 PreparedStatement upd = con.prepareStatement("UPDATE livro SET preco = ? WHERE id = ?")) {
                double pa = precoDe(sel, idA), pb = precoDe(sel, idB);
                upd.setDouble(1, pb); upd.setLong(2, idA); upd.executeUpdate();
                upd.setDouble(1, pa); upd.setLong(2, idB); upd.executeUpdate();
                con.commit();
            } catch (SQLException e) {
                con.rollback();          // desfaz as duas alterações
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    private double precoDe(PreparedStatement sel, long id) throws SQLException {
        sel.setLong(1, id);
        try (ResultSet rs = sel.executeQuery()) {
            if (!rs.next()) throw new SQLException("livro " + id + " não existe");
            return rs.getDouble(1);
        }
    }

    private Livro mapear(ResultSet rs) throws SQLException {
        return new Livro(rs.getLong("id"), rs.getString("titulo"), rs.getInt("ano"),
                         rs.getDouble("preco"), rs.getString("isbn"));
    }

    public static void main(String[] args) throws SQLException {
        LivroCrud repo = new LivroCrud("jdbc:sqlite:biblioteca-java.db");
        System.out.println("== create");
        Livro a = repo.criar(new Livro(null, "  Dom Casmurro ", 1899, 29.9, "978-1"));
        Livro b = repo.criar(new Livro(null, "Vidas Secas", 1938, 24.5, "978-3"));
        System.out.println(a);
        System.out.println(b);

        System.out.println("== read");
        System.out.println("buscar(" + b.id() + "): " + repo.buscar(b.id()).map(Livro::titulo).orElse("-"));
        System.out.println("buscar(999): " + repo.buscar(999).isPresent());
        System.out.println("listar(1930): " + repo.listar(1930).stream().map(Livro::titulo).toList());

        System.out.println("== update");
        int linhas = repo.atualizar(new Livro(b.id(), b.titulo(), b.ano(), 19.9, b.isbn()));
        System.out.println("linhas alteradas: " + linhas + ", preço agora: " + repo.buscar(b.id()).get().preco());

        System.out.println("== transação");
        repo.trocarPrecos(a.id(), b.id());
        System.out.println("após troca: " + repo.buscar(a.id()).get().preco() + " / " + repo.buscar(b.id()).get().preco());
        try {
            repo.trocarPrecos(a.id(), 999);      // o segundo livro não existe: tudo é desfeito
        } catch (SQLException e) {
            System.out.println("troca com livro inexistente: " + e.getMessage());
        }
        System.out.println("preços após a falha (sem mudança): " + repo.buscar(a.id()).get().preco() + " / " + repo.buscar(b.id()).get().preco());

        System.out.println("== delete");
        System.out.println("linhas removidas: " + repo.remover(a.id()) + ", de novo: " + repo.remover(a.id()));

        System.out.println("== erros do banco");
        try {
            repo.criar(new Livro(null, "Repetido", 2000, 1, "978-3"));
        } catch (SQLException e) {
            System.out.println("isbn repetido recusado: " + e.getMessage());
        }
        try {
            repo.criar(new Livro(null, "Preço ruim", 2000, -5, null));
        } catch (SQLException e) {
            System.out.println("preço negativo recusado: " + e.getMessage());
        }
    }
}
