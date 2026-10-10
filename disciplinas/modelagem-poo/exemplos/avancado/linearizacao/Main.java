import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Herança múltipla e linearização (algoritmo C3, usado por Python e Dylan).
 * Em Java, classes têm uma superclasse, mas interfaces com default criam o mesmo problema
 * de ordem de resolução. Aqui calculamos a MRO (Method Resolution Order) do diamante.
 */
public class Main {

    /** C3: a MRO de C é C seguido da mesclagem das MROs das bases, preservando a ordem local. */
    static List<String> c3(String classe, Map<String, List<String>> bases) {
        List<String> basesDaClasse = bases.getOrDefault(classe, List.of());
        if (basesDaClasse.isEmpty()) return new ArrayList<>(List.of(classe));

        List<List<String>> seqs = new ArrayList<>();
        for (String b : basesDaClasse) seqs.add(c3(b, bases));
        seqs.add(new ArrayList<>(basesDaClasse));          // a lista das bases, na ordem declarada

        List<String> resultado = new ArrayList<>();
        resultado.add(classe);
        while (true) {
            seqs.removeIf(List::isEmpty);
            if (seqs.isEmpty()) return resultado;
            String candidato = null;
            for (List<String> s : seqs) {
                String cabeca = s.get(0);
                boolean naCauda = seqs.stream().anyMatch(t -> t.indexOf(cabeca) > 0);
                if (!naCauda) { candidato = cabeca; break; }
            }
            if (candidato == null) throw new IllegalStateException("hierarquia inconsistente");
            resultado.add(candidato);
            final String c = candidato;
            seqs.forEach(s -> s.remove(c));
        }
    }

    public static void main(String[] args) {
        // Diamante:      A
        //               / \
        //              B   C
        //               \ /
        //                D
        Map<String, List<String>> bases = new LinkedHashMap<>();
        bases.put("D", List.of("B", "C"));
        bases.put("B", List.of("A"));
        bases.put("C", List.of("A"));
        bases.put("A", List.of());

        System.out.println("MRO de D (C3): " + c3("D", bases));

        // Mesma situação em Java: duas interfaces com default de mesmo nome.
        System.out.println("\nJava exige resolver o conflito explicitamente:");
        System.out.println(new Dois().oi());
    }

    interface Esquerda { default String oi() { return "esquerda"; } }
    interface Direita  { default String oi() { return "direita"; } }
    static class Dois implements Esquerda, Direita {
        @Override public String oi() { return Esquerda.super.oi() + " + " + Direita.super.oi(); }
    }
}
