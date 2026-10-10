import java.util.ArrayList;
import java.util.List;

/**
 * Variância e substituição de tipos genéricos.
 * Pergunta central: se Musica é um Reproduzivel, List<Musica> é um List<Reproduzivel>?
 */
public class Main {

    interface Reproduzivel { int duracao(); }
    record Musica(String titulo, int duracao) implements Reproduzivel {}
    record Podcast(String titulo, int duracao) implements Reproduzivel {}

    // Produtor (só lê): ? extends T  -> covariância segura para leitura
    static int somarDuracoes(List<? extends Reproduzivel> itens) {
        int total = 0;
        for (Reproduzivel r : itens) total += r.duracao();   // leitura: seguro
        return total;
    }

    // Consumidor (só escreve): ? super T  -> contravariância segura para escrita
    static void adicionarMusicas(List<? super Musica> destino, int n) {
        for (int i = 1; i <= n; i++) destino.add(new Musica("faixa " + i, 180));  // escrita: seguro
    }

    // PECS: Producer Extends, Consumer Super (Joshua Bloch, Effective Java)
    static <T> void copiar(List<? super T> destino, List<? extends T> origem) {
        destino.addAll(origem);
    }

    // F-bounded polymorphism: o tipo se compara consigo mesmo
    static abstract class Entidade<T extends Entidade<T>> implements Comparable<T> {
        abstract int chave();
        @Override public int compareTo(T outra) { return Integer.compare(chave(), outra.chave()); }
    }
    static final class Faixa extends Entidade<Faixa> {
        private final int ordem;
        Faixa(int ordem) { this.ordem = ordem; }
        @Override int chave() { return ordem; }
        @Override public String toString() { return "faixa#" + ordem; }
    }

    public static void main(String[] args) {
        System.out.println("=== 1. Covariância de leitura (? extends) ===");
        List<Musica> musicas = new ArrayList<>(List.of(new Musica("A", 200), new Musica("B", 150)));
        // List<Musica> NÃO é um List<Reproduzivel> (invariância), mas ? extends aceita as duas:
        List<Reproduzivel> mistos = new ArrayList<>(musicas);
        mistos.add(new Podcast("P", 600));
        System.out.println("soma (Musica): " + somarDuracoes(musicas));
        System.out.println("soma (misto):  " + somarDuracoes(mistos));

        System.out.println("\n=== 2. Contravariância de escrita (? super) ===");
        List<Object> destino = new ArrayList<>();
        adicionarMusicas(destino, 2);
        System.out.println("destino: " + destino);

        System.out.println("\n=== 3. PECS em um método genérico ===");
        List<Reproduzivel> fila = new ArrayList<>();
        copiar(fila, musicas);
        System.out.println("fila após copiar: " + fila.size() + " itens");

        System.out.println("\n=== 4. Armadilha da covariância de arrays (por que genéricos são invariantes) ===");
        Object[] arr = new String[1];          // arrays SÃO covariantes em Java
        try {
            arr[0] = Integer.valueOf(42);      // compila, mas falha em execução
        } catch (ArrayStoreException e) {
            System.out.println("ArrayStoreException: " + e.getMessage());
        }
        // List<Object> lista = new ArrayList<String>();  // NÃO compila: genéricos são invariantes

        System.out.println("\n=== 5. F-bounded: ordenação de tipos que se comparam a si mesmos ===");
        List<Faixa> ordem = new ArrayList<>(List.of(new Faixa(3), new Faixa(1), new Faixa(2)));
        java.util.Collections.sort(ordem);
        System.out.println(ordem);
    }
}
