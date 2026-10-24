package demos;

import biblioteca.Conexao;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

/** Tópico 2: abrir, usar e fechar uma conexão com try-with-resources. */
public class Demo02Conexao {

    public static void main(String[] args) throws Exception {
        Connection con = null;
        try {
            con = Conexao.abrir("demo02.db");
            System.out.println("conexão aberta: " + !con.isClosed());
            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery("PRAGMA foreign_keys")) {
                rs.next();
                System.out.println("chave estrangeira ligada: " + (rs.getInt(1) == 1));
            }
        } finally {
            if (con != null) {
                con.close();
            }
        }
        System.out.println("conexão fechada: " + con.isClosed());
        new java.io.File("demo02.db").delete();
    }
}
