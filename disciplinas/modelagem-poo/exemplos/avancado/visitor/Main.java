/**
 * Double dispatch e o Visitor, com o "expression problem" de Wadler (1998):
 * - Adicionar uma OPERAÇÃO nova é fácil: crie um novo Visitor.
 * - Adicionar um TIPO novo é difícil: todos os visitors precisam mudar.
 */
public class Main {

    // Hierarquia fechada (sealed): o compilador conhece todos os casos.
    sealed interface Valor permits Preco, Desconto, Soma { <R> R aceitar(Visitor<R> v); }

    record Preco(double valor) implements Valor {
        public <R> R aceitar(Visitor<R> v) { return v.visitarPreco(this); }
    }
    record Desconto(Valor base, double percentual) implements Valor {
        public <R> R aceitar(Visitor<R> v) { return v.visitarDesconto(this); }
    }
    record Soma(Valor esquerda, Valor direita) implements Valor {
        public <R> R aceitar(Visitor<R> v) { return v.visitarSoma(this); }
    }

    interface Visitor<R> {
        R visitarPreco(Preco p);
        R visitarDesconto(Desconto d);
        R visitarSoma(Soma s);
    }

    // Operação 1: calcular o valor (um visitor)
    static final class Avaliador implements Visitor<Double> {
        public Double visitarPreco(Preco p) { return p.valor(); }
        public Double visitarDesconto(Desconto d) {
            return d.base().aceitar(this) * (1 - d.percentual() / 100.0);
        }
        public Double visitarSoma(Soma s) {
            return s.esquerda().aceitar(this) + s.direita().aceitar(this);
        }
    }

    // Operação 2: imprimir a fórmula (outro visitor, sem tocar nas classes acima)
    static final class Impressor implements Visitor<String> {
        public String visitarPreco(Preco p) { return String.format("R$%.2f", p.valor()); }
        public String visitarDesconto(Desconto d) {
            return "(" + d.base().aceitar(this) + " - " + d.percentual() + "%)";
        }
        public String visitarSoma(Soma s) {
            return "(" + s.esquerda().aceitar(this) + " + " + s.direita().aceitar(this) + ")";
        }
    }

    public static void main(String[] args) {
        // Assinatura Premium com cupom de 10% + taxa de R$ 2,00
        Valor total = new Soma(new Desconto(new Preco(19.90), 10), new Preco(2.00));

        System.out.println("fórmula: " + total.aceitar(new Impressor()));
        System.out.printf("total:   R$ %.2f%n", total.aceitar(new Avaliador()));

        // Double dispatch: a chamada 'aceitar' escolhe o método pelo tipo do elemento;
        // 'visitar...' escolhe a operação pelo tipo do visitor. Duas escolhas dinâmicas.
        System.out.println("\nSealed: o compilador sabe que os casos são Preco, Desconto e Soma.");
    }
}
