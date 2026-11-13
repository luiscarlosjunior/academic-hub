package streaming;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;

/**
 * Demonstração completa do CRUD do streaming, passo a passo.
 * Rode com Run As › Java Application. O arquivo streaming.db é recriado a cada execução.
 */
public class Main {

    public static void main(String[] args) throws Exception {
        Path arquivo = Path.of("streaming.db");
        Files.deleteIfExists(arquivo);   // começa do zero a cada execução

        try (Connection con = Conexao.abrir(arquivo.toString())) {
            Conexao.criarTabelas(con);
            StreamingDao dao = new StreamingDao(con);

            System.out.println("== 1. CREATE: cadastrar artistas, músicas e reproduções");
            long horizonte = dao.inserirArtista("Banda Horizonte", "Brasil");
            long luana = dao.inserirArtista("Luana Pires", "Brasil");
            long lowlands = dao.inserirArtista("The Lowlands", "Reino Unido");

            long noiteAzul = dao.inserirMusica("Noite Azul", 215, horizonte);
            long cidadeLenta = dao.inserirMusica("Cidade Lenta", 190, horizonte);
            long ventoLeste = dao.inserirMusica("Vento Leste", 240, luana);
            long marDeVidro = dao.inserirMusica("Mar de Vidro", 180, lowlands);

            dao.registrarReproducao(noiteAzul, "2026-05-01", "ana");
            long reproducaoParaRemover = dao.registrarReproducao(noiteAzul, "2026-05-02", "bruno");
            dao.registrarReproducao(cidadeLenta, "2026-05-02", "ana");
            dao.registrarReproducao(ventoLeste, "2026-05-03", "carla");
            dao.registrarReproducao(ventoLeste, "2026-05-03", "ana");
            dao.registrarReproducao(ventoLeste, "2026-05-04", "bruno");
            System.out.println("  artistas: " + dao.contar("artista")
                    + ", músicas: " + dao.contar("musica")
                    + ", reproduções: " + dao.contar("reproducao"));

            System.out.println("\n== 2. READ: INNER JOIN de duas tabelas (música + artista)");
            for (String linha : dao.listarMusicasComArtista()) {
                System.out.println("  " + linha);
            }

            System.out.println("\n== 3. READ: INNER JOIN de três tabelas com GROUP BY");
            for (String linha : dao.reproducoesPorArtista()) {
                System.out.println("  " + linha);
            }
            System.out.println("  (The Lowlands não aparece: nenhuma reprodução para as músicas dele)");

            System.out.println("\n== 4. UPDATE: corrigir a duração de uma música");
            System.out.println("  duração antes: " + dao.duracaoDe(noiteAzul) + " s");
            boolean atualizou = dao.atualizarDuracao(noiteAzul, 230);
            System.out.println("  atualizou: " + atualizou);
            System.out.println("  duração depois: " + dao.duracaoDe(noiteAzul) + " s");

            System.out.println("\n== 5. DELETE: remover uma reprodução");
            System.out.println("  reproduções antes: " + dao.contar("reproducao"));
            System.out.println("  removeu: " + dao.removerReproducao(reproducaoParaRemover));
            System.out.println("  removeu de novo: " + dao.removerReproducao(reproducaoParaRemover));
            System.out.println("  reproduções depois: " + dao.contar("reproducao"));

            System.out.println("\n== 6. DELETE com ON DELETE CASCADE: remover uma música apaga as reproduções dela");
            System.out.println("  reproduções antes: " + dao.contar("reproducao"));
            System.out.println("  removeu a música Vento Leste: " + dao.removerMusica(ventoLeste));
            System.out.println("  reproduções depois: " + dao.contar("reproducao"));
            System.out.println("  músicas depois: " + dao.contar("musica"));

            System.out.println("\n== 7. Resultado final: reproduções por artista");
            for (String linha : dao.reproducoesPorArtista()) {
                System.out.println("  " + linha);
            }
        }
    }
}
