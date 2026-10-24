package demos;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/** Tópico 1: confirma que o JDK e o driver estão prontos. Não cria arquivos. */
public class Demo01Verificacao {

    public static void main(String[] args) throws Exception {
        System.out.println("Java: " + System.getProperty("java.version"));
        Class.forName("org.sqlite.JDBC");
        System.out.println("driver carregado: sim");
        try (Connection con = DriverManager.getConnection("jdbc:sqlite::memory:");
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT sqlite_version()")) {
            rs.next();
            System.out.println("SQLite: " + rs.getString(1));
            DatabaseMetaData meta = con.getMetaData();
            System.out.println("nome do driver: " + meta.getDriverName());
            System.out.println("versão do driver: " + meta.getDriverVersion());
        }
    }
}
