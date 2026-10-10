package melodia;

/**
 * Cenário completo do domínio Melodia. Rode com:
 *   javac -d out *.java && java -cp out melodia.Principal
 * Cada bloco mostra um conceito de POO em ação.
 */
public class Principal {

    public static void main(String[] args) {
        System.out.println("=== 1. Classe e objeto: molde × instâncias ===");
        Musica m1 = new Musica("Gravidade Zero", "Banda Nébula", 213);
        Musica m2 = new Musica("Cometa", "Banda Nébula", 187);
        System.out.println(m1);
        System.out.println(m2);
        System.out.println("m1 == m2 ? " + (m1 == m2) + "   (identidade: objetos diferentes)");

        System.out.println("\n=== 2. Composição: o álbum cria suas faixas ===");
        Album orbita = new Album("Órbita", "Banda Nébula", 2024, "Abertura", 95);
        orbita.adicionarFaixa("Cometa", 187);
        for (Musica faixa : orbita.getFaixas()) {
            System.out.println("  faixa: " + faixa);
        }

        System.out.println("\n=== 3. Agregação: a playlist só aponta para músicas existentes ===");
        ContaBancaria conta = new ContaBancaria("0001-1", 30.10);
        Assinatura assinatura = new Assinatura(Plano.PREMIUM, conta);
        Ouvinte ana = new Ouvinte("Ana Souza", assinatura);
        Playlist treino = ana.montarPlaylist("Treino");
        treino.adicionar(m1);
        treino.adicionar(m2);
        treino.adicionar(m1);                       // duplicata ignorada
        System.out.println("playlist '" + treino.getNome() + "' tem " + treino.getMusicas().size()
                + " músicas, duração derivada = " + treino.duracaoTotalSegundos() + " s");
        System.out.println("m1 continua existindo fora da playlist: " + m1.getTitulo());

        System.out.println("\n=== 4. Encapsulamento e regra R1: o saldo protegido ===");
        System.out.println("saldo antes: " + conta.getSaldo());
        try {
            conta.sacar(999);
        } catch (IllegalStateException e) {
            System.out.println("saque recusado: " + e.getMessage());
        }
        System.out.println("saldo depois: " + conta.getSaldo());

        System.out.println("\n=== 5. Máquina de estados e regra R3: cobrança com e sem saldo ===");
        System.out.println("cobrança 1 (saldo 30,10 - 19,90): " + assinatura.cobrar()
                + " -> status " + assinatura.getStatus());
        System.out.println("cobrança 2 (saldo 10,20 < 19,90): " + assinatura.cobrar()
                + " -> status " + assinatura.getStatus());

        System.out.println("\n=== 6. Regra R4: cancelada é estado final ===");
        assinatura.cancelar();
        try {
            assinatura.cobrar();
        } catch (IllegalStateException e) {
            System.out.println("recusado: " + e.getMessage());
        }

        System.out.println("\n=== 7. Polimorfismo de planos (enum com comportamento) ===");
        for (Plano p : Plano.values()) {
            System.out.printf("%-8s R$ %6.2f  anúncios: %s%n", p, p.getPrecoMensal(),
                    p.isComAnuncios() ? "sim" : "não");
        }

        System.out.println("\n=== 8. Herança e interface: tratar tipos diferentes do mesmo jeito ===");
        Artista banda = new Artista("Banda Nébula");
        banda.publicar(orbita);
        System.out.println(banda.resumo() + " — álbuns: " + banda.getAlbuns().size());
        System.out.println(ana.resumo());
        java.util.List<Reproduzivel> fila = java.util.List.of(
                m1,
                new Podcast("Cosmos em 10 min", "Dra. Lívia", 10));
        for (Reproduzivel item : fila) {
            // a mesma chamada, comportamentos diferentes: o objeto real decide
            System.out.println("tocando: " + item.descricao() + " [" + item.duracaoFormatada() + "]");
        }

        System.out.println("\nExtrato da conta " + conta.getNumero() + ": " + conta.getExtrato());
    }
}
