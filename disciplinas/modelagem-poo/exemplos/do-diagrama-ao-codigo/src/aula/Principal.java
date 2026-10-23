package aula;

import java.time.LocalDate;
import java.util.*;

/**
 * Roteiro executável da aula "Do Diagrama ao Código (Java)".
 * Cada bloco corresponde a um slide da apresentação. Rode com:
 *   javac -d out $(find src -name "*.java") && java -cp out aula.Principal
 */
public class Principal {

    public static void main(String[] args) {
        secao("1. Classe simples: caixa → class, − → private, + → public");
        var produto = new tradutor.classe.Produto("Caneca", 40.0);
        produto.aplicarDesconto(0.10);
        System.out.println("Preço após 10% de desconto: " + produto.getPreco());

        secao("2. Classe abstrata: nome em itálico → abstract, ▷ sólida → extends");
        tradutor.abstrata.Conta conta = new tradutor.abstrata.Poupanca();
        conta.depositar(1000);
        System.out.println("Taxa mensal da poupança: " + conta.taxaMensal());
        // new tradutor.abstrata.Conta();  ← não compila: classe abstrata

        secao("3. Interface: «interface» → interface, ▷ tracejada → implements");
        tradutor.interfaces.Pagavel pagavel = new tradutor.interfaces.Fatura(250.0);
        System.out.println("Valor da fatura via contrato Pagavel: " + pagavel.calcularValor());

        secao("4. Associação 1 → *: o lado 'muitos' vira coleção");
        var cliente = new tradutor.associacao.Cliente("Ana");
        cliente.adicionar(new tradutor.associacao.Pedido(LocalDate.now()));
        cliente.adicionar(new tradutor.associacao.Pedido(LocalDate.now()));
        System.out.println("Pedidos da Ana: " + cliente.getPedidos().size());
        tentar("getPedidos().add(...) na lista imutável",
               () -> cliente.getPedidos().add(new tradutor.associacao.Pedido(LocalDate.now())));

        secao("5. Composição ◆: o todo cria as partes");
        var pedidoComp = new tradutor.composicao.Pedido();
        pedidoComp.adicionar(new tradutor.composicao.Produto("Livro"), 2);
        System.out.println("Itens criados pelo próprio Pedido: " + pedidoComp.quantidadeDeItens());
        pedidoComp.limpar();
        System.out.println("Após limpar(), os itens foram junto: " + pedidoComp.quantidadeDeItens());

        secao("6. Agregação ◇: as partes vêm de fora e sobrevivem");
        var pele = new tradutor.agregacao.Jogador("Pelé");
        var elenco = new ArrayList<>(List.of(pele));
        var time = new tradutor.agregacao.Time(elenco);
        time.escalar(new tradutor.agregacao.Jogador("Garrincha"));
        time = null; // o time acabou...
        System.out.println("...mas o jogador continua existindo: " + pele.getNome());

        secao("7. Classe associativa: a nota pertence ao par Aluno–Disciplina");
        var m = new tradutor.associativa.Matricula(
                new tradutor.associativa.Aluno("Bia"),
                new tradutor.associativa.Disciplina("Modelagem POO"), 7.5, 4);
        System.out.println("Bia aprovada em Modelagem POO? " + m.aprovado());

        secao("8. Enumeração e estático: «enumeration» → enum, sublinhado → static");
        var p1 = new tradutor.enumeracao.Pedido();
        new tradutor.enumeracao.Pedido();
        System.out.println("Status inicial: " + p1.getStatus()
                + " | totalDePedidos (da classe): " + tradutor.enumeracao.Pedido.getTotalDePedidos());

        secao("9. Exemplo completo: br.com.loja.dominio");
        var ana = new br.com.loja.dominio.Cliente("Ana", "ana@exemplo.com");
        var pedido = ana.novoPedido("PED-001");
        tentar("fechar() um pedido vazio (regra 1..*)", pedido::fechar);
        pedido.adicionar(new br.com.loja.dominio.Produto("Teclado", 150.0), 2);
        pedido.adicionar(new br.com.loja.dominio.Produto("Mouse", 80.0), 1);
        System.out.println("Total: " + pedido.calcularTotal());
        pedido.fechar();
        System.out.println("Status após fechar(): " + pedido.getStatus());
        tentar("adicionar() depois de fechado",
               () -> pedido.adicionar(new br.com.loja.dominio.Produto("Cabo", 20.0), 1));
        tentar("Produto com preço negativo", () -> new br.com.loja.dominio.Produto("Erro", -1));

        secao("10. Multiplicidade vira tipo, e o tipo vira regra");
        var album = new aprofundamento.multiplicidade.Album("Abertura", "Banda Nébula", 95);
        System.out.println("O álbum nasce com " + album.quantidadeDeFaixas() + " faixa (1..*)");
        var playlist = new aprofundamento.multiplicidade.Playlist();
        playlist.adicionar(new aprofundamento.multiplicidade.Musica("Cometa", "Banda Nébula", 187));
        System.out.println("A playlist recebeu uma música vinda de fora: " + playlist.tamanho());

        secao("11. Classe parametrizada: «template» → Repositorio<T, ID>");
        aprofundamento.genericos.Repositorio<br.com.loja.dominio.Produto, String> repo =
                new aprofundamento.genericos.RepositorioEmMemoria<>(br.com.loja.dominio.Produto::getNome);
        repo.salvar(new br.com.loja.dominio.Produto("Monitor", 900.0));
        System.out.println("buscar(\"Monitor\"): " + repo.buscar("Monitor").map(x -> x.getPreco()).orElse(-1.0));
        System.out.println("buscar(\"Webcam\") presente? " + repo.buscar("Webcam").isPresent());

        secao("12. Exemplo passo a passo: reserva de hotel");
        var quartos = new ArrayList<>(List.of(new aprofundamento.hotel.Quarto(101)));
        var reserva = new aprofundamento.hotel.Reserva(
                LocalDate.of(2026, 11, 10), LocalDate.of(2026, 11, 13), quartos);
        quartos.clear(); // a cópia defensiva protege a reserva
        System.out.println("Diárias: " + reserva.diarias());
        tentar("Reserva sem quartos (1..*)", () -> new aprofundamento.hotel.Reserva(
                LocalDate.of(2026, 11, 10), LocalDate.of(2026, 11, 13), List.of()));
        tentar("Saída antes da entrada", () -> new aprofundamento.hotel.Reserva(
                LocalDate.of(2026, 11, 13), LocalDate.of(2026, 11, 10),
                List.of(new aprofundamento.hotel.Quarto(102))));

        secao("13. Exercícios");
        var ouvinte = new exercicios.ex1.Ouvinte();
        ouvinte.montarPlaylist("Para estudar");
        System.out.println("Ex. 1 — playlists criadas pelo ouvinte: " + ouvinte.getPlaylists().size());
        var albumCorrigido = new exercicios.ex2.Album();
        albumCorrigido.adicionarFaixa("Gravidade Zero");
        tentar("Ex. 2 — alterar as faixas por fora", () -> albumCorrigido.getFaixas().clear());

        secao("14. Quiz 1: Turma \"1\" —— \"3..40\" Aluno");
        var turma = new quiz.Turma();
        turma.matricular(new quiz.Aluno("Caio"));
        tentar("iniciar() com 1 aluno", turma::iniciar);
    }

    private static void secao(String titulo) {
        System.out.println("\n=== " + titulo + " ===");
    }

    private static void tentar(String descricao, Runnable acao) {
        try {
            acao.run();
            System.out.println("[ok] " + descricao);
        } catch (RuntimeException e) {
            System.out.println("[bloqueado] " + descricao + " → "
                    + e.getClass().getSimpleName() + (e.getMessage() != null ? ": " + e.getMessage() : ""));
        }
    }
}
