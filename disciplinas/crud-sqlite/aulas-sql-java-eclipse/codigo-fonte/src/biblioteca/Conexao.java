package biblioteca;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Abre conexões com o banco SQLite e cria o esquema.
 * Esta é a única classe que conhece a URL do banco: o resto do projeto recebe uma Connection pronta.
 */
public final class Conexao {

    /** Nome do arquivo usado quando nenhum outro é informado. */
    public static final String ARQUIVO_PADRAO = "biblioteca.db";

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

    /** Cria a tabela livro se ainda não existir. Pode ser chamado a cada início do programa. */
    public static void criarTabelas(Connection con) throws SQLException {
        try (Statement st = con.createStatement()) {
            st.execute("""
                CREATE TABLE IF NOT EXISTS livro (
                    id     INTEGER PRIMARY KEY,
                    titulo TEXT    NOT NULL,
                    ano    INTEGER NOT NULL CHECK (ano > 0),
                    preco  REAL    NOT NULL DEFAULT 0 CHECK (preco >= 0),
                    isbn   TEXT    UNIQUE)""");
        }
    }
}
