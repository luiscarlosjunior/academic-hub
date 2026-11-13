package streaming;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * CRUD das três tabelas do streaming: artista, musica e reproducao.
 * Todo o SQL do projeto fica nesta classe.
 */
public class StreamingDao {

    private final Connection con;

    public StreamingDao(Connection con) {
        this.con = con;
    }

    // ================= CREATE (INSERT) =================

    public long inserirArtista(String nome, String pais) throws SQLException {
        String sql = "INSERT INTO artista (nome, pais) VALUES (?, ?)";
        try (PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, nome);
            ps.setString(2, pais);
            ps.executeUpdate();
            return idGerado(ps);
        }
    }

    public long inserirMusica(String titulo, int duracaoSeg, long artistaId) throws SQLException {
        String sql = "INSERT INTO musica (titulo, duracao_seg, artista_id) VALUES (?, ?, ?)";
        try (PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, titulo);
            ps.setInt(2, duracaoSeg);
            ps.setLong(3, artistaId);
            ps.executeUpdate();
            return idGerado(ps);
        }
    }

    public long registrarReproducao(long musicaId, String data, String ouvinte) throws SQLException {
        String sql = "INSERT INTO reproducao (musica_id, data, ouvinte) VALUES (?, ?, ?)";
        try (PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, musicaId);
            ps.setString(2, data);
            ps.setString(3, ouvinte);
            ps.executeUpdate();
            return idGerado(ps);
        }
    }

    /** Lê o id que o banco gerou para o último INSERT. */
    private static long idGerado(PreparedStatement ps) throws SQLException {
        try (ResultSet chaves = ps.getGeneratedKeys()) {
            chaves.next();
            return chaves.getLong(1);
        }
    }

    // ================= READ (SELECT com INNER JOIN) =================

    /** INNER JOIN de duas tabelas: cada música com o nome do artista. */
    public List<String> listarMusicasComArtista() throws SQLException {
        String sql = """
            SELECT m.titulo, a.nome, m.duracao_seg
            FROM musica m
            INNER JOIN artista a ON a.id = m.artista_id
            ORDER BY m.titulo""";
        List<String> linhas = new ArrayList<>();
        try (PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                linhas.add(rs.getString("titulo") + " - " + rs.getString("nome")
                        + " (" + rs.getInt("duracao_seg") + " s)");
            }
        }
        return linhas;
    }

    /**
     * INNER JOIN de três tabelas com GROUP BY: quantas reproduções cada artista teve.
     * Artistas sem nenhuma reprodução não aparecem, porque o INNER JOIN exige correspondência nas três tabelas.
     */
    public List<String> reproducoesPorArtista() throws SQLException {
        String sql = """
            SELECT a.nome, COUNT(r.id) AS reproducoes
            FROM artista a
            INNER JOIN musica m    ON m.artista_id = a.id
            INNER JOIN reproducao r ON r.musica_id = m.id
            GROUP BY a.id
            ORDER BY reproducoes DESC, a.nome""";
        List<String> linhas = new ArrayList<>();
        try (PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                linhas.add(rs.getString("nome") + ": " + rs.getInt("reproducoes") + " reproduções");
            }
        }
        return linhas;
    }

    /** Lê a duração atual de uma música. Devolve -1 se a música não existe. */
    public int duracaoDe(long musicaId) throws SQLException {
        String sql = "SELECT duracao_seg FROM musica WHERE id = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, musicaId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt("duracao_seg") : -1;
            }
        }
    }

    /** Conta as linhas de uma tabela. Útil para conferir o efeito de cada operação. */
    public int contar(String tabela) throws SQLException {
        // Só nomes fixos do próprio projeto chegam aqui: o nome da tabela não vem do usuário.
        try (Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM " + tabela)) {
            rs.next();
            return rs.getInt(1);
        }
    }

    // ================= UPDATE =================

    /** Corrige a duração de uma música. Devolve true se a música existia. */
    public boolean atualizarDuracao(long musicaId, int novaDuracao) throws SQLException {
        String sql = "UPDATE musica SET duracao_seg = ? WHERE id = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, novaDuracao);
            ps.setLong(2, musicaId);
            return ps.executeUpdate() == 1;
        }
    }

    // ================= DELETE =================

    /** Remove uma reprodução. Devolve true se ela existia. */
    public boolean removerReproducao(long reproducaoId) throws SQLException {
        String sql = "DELETE FROM reproducao WHERE id = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, reproducaoId);
            return ps.executeUpdate() == 1;
        }
    }

    /** Remove uma música. As reproduções dela saem junto (ON DELETE CASCADE). */
    public boolean removerMusica(long musicaId) throws SQLException {
        String sql = "DELETE FROM musica WHERE id = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, musicaId);
            return ps.executeUpdate() == 1;
        }
    }
}
