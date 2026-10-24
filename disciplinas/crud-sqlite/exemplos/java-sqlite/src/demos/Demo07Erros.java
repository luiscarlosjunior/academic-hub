package demos;

import biblioteca.Conexao;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/** Tópico 8: provoca os erros mais comuns para aprender a lê-los. */
public class Demo07Erros {

    public static void main(String[] args) throws Exception {
        System.out.println("== 1. URL errada");
        try {
            DriverManager.getConnection("jdbc:mysql://localhost/x");
        } catch (SQLException e) {
            System.out.println("SQLException: " + e.getMessage());
        }

        System.out.println("== 2. SQL com erro de digitação");
        try (Connection con = Conexao.abrir("demo07.db");
             Statement st = con.createStatement()) {
            st.execute("SELEC * FROM livro");
        } catch (SQLException e) {
            System.out.println("código " + e.getErrorCode() + ": " + e.getMessage());
        }

        System.out.println("== 3. chave estrangeira violada");
        try (Connection con = Conexao.abrir("demo07.db");
             Statement st = con.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS pai (id INTEGER PRIMARY KEY)");
            st.execute("CREATE TABLE IF NOT EXISTS filho (pai_id INTEGER REFERENCES pai(id))");
            st.execute("INSERT INTO filho (pai_id) VALUES (999)");
        } catch (SQLException e) {
            System.out.println("código " + e.getErrorCode() + ": " + e.getMessage());
        }
        new java.io.File("demo07.db").delete();
    }
}
