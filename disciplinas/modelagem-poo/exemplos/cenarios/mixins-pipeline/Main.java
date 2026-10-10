import java.util.*;

/**
 * CENÁRIO: exportação de relatórios com três comportamentos transversais:
 * Validável, Cacheável e Auditável. Na plataforma, a ORDEM dessas etapas muda o resultado.
 * Cache antes da validação serve relatório inválido. Este exemplo calcula a ordem
 * de execução com C3 (a mesma lógica da MRO de Python) e mostra o efeito.
 */
public class Main {

    /** C3: MRO = C + merge(MRO das bases, lista das bases). */
    static List<String> c3(String classe, Map<String, List<String>> bases) {
        List<String> bs = bases.getOrDefault(classe, List.of());
        if (bs.isEmpty()) return new ArrayList<>(List.of(classe));
        List<List<String>> seqs = new ArrayList<>();
        for (String b : bs) seqs.add(c3(b, bases));
        seqs.add(new ArrayList<>(bs));
        List<String> out = new ArrayList<>(List.of(classe));
        while (true) {
            seqs.removeIf(List::isEmpty);
            if (seqs.isEmpty()) return out;
            String cand = null;
            for (List<String> s : seqs) {
                String h = s.get(0);
                if (seqs.stream().noneMatch(t -> t.indexOf(h) > 0)) { cand = h; break; }
            }
            if (cand == null) throw new IllegalStateException("ordem inconsistente");
            out.add(cand);
            final String c = cand;
            seqs.forEach(s -> s.remove(c));
        }
    }

    /** Cada etapa transforma o dado e pode decidir não continuar (curto-circuito). */
    interface Etapa { Optional<String> executar(String dado, Set<String> cache); }

    static Etapa validavel = (dado, cache) -> dado.isBlank() ? Optional.empty() : Optional.of(dado);
    static Etapa cacheavel = (dado, cache) -> {
        if (cache.contains(dado)) System.out.println("    cache: hit");
        cache.add(dado);
        return Optional.of(dado);
    };
    static Etapa auditavel = (dado, cache) -> {
        System.out.println("    auditoria: '" + dado + "'");
        return Optional.of(dado);
    };

    static Optional<String> rodar(List<String> ordem, Map<String, Etapa> etapas, String entrada, Set<String> cache) {
        String dado = entrada;
        for (String nome : ordem) {
            System.out.println("  -> " + nome);
            Optional<String> saida = etapas.get(nome).executar(dado, cache);
            if (saida.isEmpty()) {
                System.out.println("  recusado em " + nome);
                return Optional.empty();
            }
            dado = saida.get();
        }
        return Optional.of(dado);
    }

    static String mostrar(Optional<String> r) { return r.map(x -> "OK: " + x).orElse("recusado"); }

    public static void main(String[] args) {
        java.util.Locale.setDefault(java.util.Locale.ROOT);   // saída reprodutível em qualquer máquina
        // Hierarquia: RelatorioPDF herda dos três mixins, na ordem declarada
        Map<String, List<String>> bases = new LinkedHashMap<>();
        bases.put("RelatorioPDF", List.of("Auditavel", "Cacheavel", "Validavel"));
        bases.put("Auditavel", List.of());
        bases.put("Cacheavel", List.of());
        bases.put("Validavel", List.of());

        Map<String, Etapa> etapas = Map.of("Validavel", validavel, "Cacheavel", cacheavel, "Auditavel", auditavel);
        List<String> mro = c3("RelatorioPDF", bases);
        List<String> ordemDeExecucao = mro.subList(1, mro.size());
        System.out.println("MRO calculada: " + mro);

        System.out.println("\nRelatório válido, ordem da MRO:");
        Set<String> cache = new HashSet<>();
        System.out.println("  resultado: " + mostrar(rodar(ordemDeExecucao, etapas, "vendas-2026-09", cache)));

        System.out.println("\nSegunda vez, mesmo relatório: cache responde");
        System.out.println("  resultado: " + mostrar(rodar(ordemDeExecucao, etapas, "vendas-2026-09", cache)));

        System.out.println("\nRelatório vazio, ordem da MRO (validação protege o cache):");
        System.out.println("  resultado: " + mostrar(rodar(ordemDeExecucao, etapas, "", new HashSet<>())));

        System.out.println("\nDefeito de configuração: cache ANTES da validação");
        List<String> ordemErrada = List.of("Cacheavel", "Validavel", "Auditavel");
        Set<String> cacheErrado = new HashSet<>();
        rodar(ordemErrada, etapas, "", cacheErrado);
        System.out.println("  itens no cache após a falha: " + cacheErrado.stream().map(x -> "'" + x + "'").toList());
    }
}
