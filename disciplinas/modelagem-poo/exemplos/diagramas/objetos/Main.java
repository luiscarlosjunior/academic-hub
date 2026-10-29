import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Diagrama de objetos em Java: um instantâneo de um carrinho de compras.
 * Cada variável local é um objeto (uma instância), e as referências entre eles são os links.
 */
public class Main {

    static final class Cliente {
        private final String nome;
        Cliente(String nome) { this.nome = Objects.requireNonNull(nome, "nome"); }
        String getNome() { return nome; }
    }

    static final class Cupom {
        private final String codigo;
        private final int percentual;
        private boolean usado;
        Cupom(String codigo, int percentual) {
            if (percentual < 1 || percentual > 100) throw new IllegalArgumentException("percentual entre 1 e 100");
            this.codigo = codigo;
            this.percentual = percentual;
        }
        String getCodigo() { return codigo; }
        int getPercentual() { return percentual; }
        boolean isUsado() { return usado; }
        /** Restrição: um cupom só pode ser usado uma vez. */
        void marcarUsado() {
            if (usado) throw new IllegalStateException("cupom " + codigo + " já foi usado");
            usado = true;
        }
    }

    record ItemCarrinho(String sku, int quantidade, double precoUnitario) {
        ItemCarrinho {
            if (quantidade <= 0) throw new IllegalArgumentException("quantidade deve ser positiva");
        }
        double subtotal() { return quantidade * precoUnitario; }
    }

    static final class Carrinho {
        private final String id;
        private final Cliente cliente;                       // multiplicidade 1: obrigatório
        private final List<ItemCarrinho> itens = new ArrayList<>();
        private Cupom cupom;                                  // multiplicidade 0..1: opcional

        Carrinho(String id, Cliente cliente) {
            this.id = id;
            this.cliente = Objects.requireNonNull(cliente, "todo carrinho pertence a um cliente");
        }
        void adicionar(ItemCarrinho item) { itens.add(item); }
        void aplicarCupom(Cupom c) { c.marcarUsado(); this.cupom = c; }
        double subtotal() { return itens.stream().mapToDouble(ItemCarrinho::subtotal).sum(); }
        double total() {
            double s = subtotal();
            return cupom == null ? s : s * (100 - cupom.getPercentual()) / 100.0;
        }
        Optional<Cupom> getCupom() { return Optional.ofNullable(cupom); }
        Cliente getCliente() { return cliente; }
        String getId() { return id; }
        int quantidadeItens() { return itens.size(); }
    }

    /** Mostra um instantâneo no formato do diagrama: objeto : Classe [atributos] e os links. */
    static void instantaneo(String nomeCliente, Cliente c, String nomeCarrinho, Carrinho k) {
        System.out.println(nomeCliente + " : Cliente [nome = " + c.getNome() + "]");
        System.out.printf("%s : Carrinho [id = %s, itens = %d, total = R$ %.2f]%n",
                nomeCarrinho, k.getId(), k.quantidadeItens(), k.total());
        System.out.println("  link: " + nomeCarrinho + " --> " + nomeCliente);
        k.getCupom().ifPresentOrElse(
                cp -> System.out.println("  link: " + nomeCarrinho + " --> cupom " + cp.getCodigo()
                        + " (" + cp.getPercentual() + "%, usado = " + cp.isUsado() + ")"),
                () -> System.out.println("  link: " + nomeCarrinho + " --> (sem cupom)"));
    }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);   // saída igual em qualquer máquina
        System.out.println("== 1. Montar o instantâneo");
        Cliente bruno = new Cliente("Bruno");
        Carrinho carrinho1 = new Carrinho("C-1", bruno);
        carrinho1.adicionar(new ItemCarrinho("FONE-01", 1, 100.00));
        carrinho1.adicionar(new ItemCarrinho("CAPA-07", 2, 24.90));
        Cupom bemVindo = new Cupom("BEMVINDO10", 10);
        carrinho1.aplicarCupom(bemVindo);
        instantaneo("bruno", bruno, "carrinho1", carrinho1);

        System.out.println("\n== 2. Identidade: dois objetos com o mesmo nome não são o mesmo objeto");
        Cliente outroBruno = new Cliente("Bruno");
        System.out.println("bruno == outroBruno ? " + (bruno == outroBruno));
        System.out.println("nomes iguais? " + bruno.getNome().equals(outroBruno.getNome()));

        System.out.println("\n== 3. Multiplicidade 1: o carrinho exige um cliente");
        try {
            new Carrinho("C-2", null);
        } catch (NullPointerException e) {
            System.out.println("recusado: " + e.getMessage());
        }

        System.out.println("\n== 4. Restrição: o mesmo cupom não pode ser usado em dois carrinhos");
        Carrinho carrinho2 = new Carrinho("C-3", outroBruno);
        try {
            carrinho2.aplicarCupom(bemVindo);
        } catch (IllegalStateException e) {
            System.out.println("recusado: " + e.getMessage());
        }

        System.out.println("\n== 5. Depois de mudar o estado, o instantâneo muda");
        carrinho1.adicionar(new ItemCarrinho("CABO-02", 1, 15.00));
        instantaneo("bruno", bruno, "carrinho1", carrinho1);
    }
}
