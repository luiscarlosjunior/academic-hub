package streaming;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Abre a conexão com o SQLite e cria as três tabelas do streaming.
 * Esta é a única classe que conhece a URL do banco.
 */
public final class Conexao {

    static {
        // Registra o driver do SQLite. Sem o JAR no classpath, esta linha falha com uma mensagem clara.
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException(
                "Driver sqlite-jdbc não encontrado. Adicione o JAR da pasta lib/ ao projeto.", e);
        }
    }

    private Conexao() {
        // classe utilitária: não cria objetos
    }

    /** Abre o arquivo indicado (ou cria, se não existir) e liga a verificação de chave estrangeira. */
    public static Connection abrir(String arquivo) throws SQLException {
        Connection con = DriverManager.getConnection("jdbc:sqlite:" + arquivo);
        try (Statement st = con.createStatement()) {
            st.execute("PRAGMA foreign_keys = ON");   // por conexão: o SQLite começa com ela desligada
        }
        return con;
    }

    /** Cria as tabelas se ainda não existirem. Pode ser chamado a cada início do programa. */
    public static void criarTabelas(Connection con) throws SQLException {
        try (Statement st = con.createStatement()) {
            st.execute("""
                CREATE TABLE IF NOT EXISTS artista (
                    id   INTEGER PRIMARY KEY,
                    nome TEXT    NOT NULL,
                    pais TEXT)""");
            st.execute("""
                CREATE TABLE IF NOT EXISTS musica (
                    id          INTEGER PRIMARY KEY,
                    titulo      TEXT    NOT NULL,
                    duracao_seg INTEGER NOT NULL CHECK (duracao_seg > 0),
                    artista_id  INTEGER NOT NULL REFERENCES artista(id))""");
            st.execute("""
                CREATE TABLE IF NOT EXISTS reproducao (
                    id        INTEGER PRIMARY KEY,
                    musica_id INTEGER NOT NULL REFERENCES musica(id) ON DELETE CASCADE,
                    data      TEXT    NOT NULL,
                    ouvinte   TEXT)""");
        }
    }
}
