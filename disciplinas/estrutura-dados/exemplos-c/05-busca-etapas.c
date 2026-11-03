/*
 * Busca passo a passo em C: linear com contagem, linear com sentinela,
 * binária com trilha de etapas, o estouro do meio, busca em agenda com
 * strcmp, ocorrências repetidas e bisect (achar o primeiro commit ruim).
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 05-busca-etapas.c -o etapas
 */
#include <stdio.h>
#include <string.h>

/* [ex-a] Busca linear contando as comparações feitas */
static long linear_contando(const int a[], size_t n, int x, int *cmp) {
    *cmp = 0;
    for (size_t i = 0; i < n; i++) {
        (*cmp)++;
        if (a[i] == x) return (long)i;
    }
    return -1;
}
/* [/ex-a] */

/* [ex-b] Busca linear com sentinela: o alvo é colocado depois do fim,
 * então o laço não precisa testar i < n a cada volta. Exige a[n] livre. */
static long linear_sentinela(int a[], size_t n, int x) {
    int salvo = a[n];
    a[n] = x;
    size_t i = 0;
    while (a[i] != x) i++;
    a[n] = salvo;
    return (i < n) ? (long)i : -1;
}
/* [/ex-b] */

/* [ex-c] Busca binária com trilha: mostra o intervalo e o meio em cada passo */
static long binaria_trilha(const int a[], size_t n, int x) {
    size_t lo = 0, hi = n;
    int passo = 0;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        passo++;
        printf("  passo %d: intervalo [%zu, %zu) meio=%zu a[meio]=%d\n", passo, lo, hi, mid, a[mid]);
        if (a[mid] == x) {
            printf("  achou em %zu após %d passos\n", mid, passo);
            return (long)mid;
        }
        if (a[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    printf("  intervalo vazio após %d passos: não existe\n", passo);
    return -1;
}
/* [/ex-c] */

/* [ex-d] Por que lo + (hi - lo) / 2: a soma lo + hi pode estourar o tipo */
static void demonstra_estouro(void) {
    unsigned int lo = 3000000000u, hi = 3500000000u;
    unsigned int ingenuo = (lo + hi) / 2;      /* a soma passa de UINT_MAX e dá a volta */
    unsigned int seguro = lo + (hi - lo) / 2;
    printf("  lo=%u hi=%u\n", lo, hi);
    printf("  (lo + hi) / 2     = %u  (errado: a soma estourou)\n", ingenuo);
    printf("  lo + (hi - lo)/2  = %u  (correto)\n", seguro);
}
/* [/ex-d] */

/* [ex-e] Agenda: vetor de strings ordenado, comparado com strcmp */
static long agenda_busca(const char *nomes[], size_t n, const char *alvo) {
    size_t lo = 0, hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        int c = strcmp(nomes[mid], alvo);
        if (c == 0) return (long)mid;
        if (c < 0) lo = mid + 1;
        else hi = mid;
    }
    return -1;
}
/* [/ex-e] */

/* [ex-f] Ocorrências repetidas: linear conta tudo; binária usa lower_bound duas vezes */
static size_t lower_bound(const int a[], size_t n, int x) {
    size_t lo = 0, hi = n;
    while (lo < hi) {
        size_t m = lo + (hi - lo) / 2;
        if (a[m] < x) lo = m + 1;
        else hi = m;
    }
    return lo;
}

static size_t ocorrencias_linear(const int a[], size_t n, int x) {
    size_t c = 0;
    for (size_t i = 0; i < n; i++)
        if (a[i] == x) c++;
    return c;
}

static size_t ocorrencias_binaria(const int a[], size_t n, int x) {
    return lower_bound(a, n, x + 1) - lower_bound(a, n, x);
}
/* [/ex-f] */

/* [ex-g] Bisect: com commits em ordem, achar o primeiro ruim em log2(n) testes */
static int ruim(int commit, int primeiro_ruim) {
    return commit >= primeiro_ruim;
}

static int bisect(int total, int primeiro_ruim) {
    int lo = 1, hi = total, testes = 0;
    while (lo < hi) {
        int meio = lo + (hi - lo) / 2;
        testes++;
        printf("  testa commit %d: %s\n", meio, ruim(meio, primeiro_ruim) ? "ruim" : "bom");
        if (ruim(meio, primeiro_ruim)) hi = meio;
        else lo = meio + 1;
    }
    printf("  primeiro commit ruim = %d, encontrado em %d testes\n", lo, testes);
    return lo;
}
/* [/ex-g] */

int main(void) {
    const int a[] = {3, 7, 11, 15, 19, 24, 28, 33, 41, 47, 52, 60};
    const size_t n = sizeof a / sizeof a[0];

    int cmp = 0;
    long p = linear_contando(a, n, 41, &cmp);
    printf("linear contando: 41 está no índice %ld após %d comparações\n", p, cmp);

    int b[13];
    memcpy(b, a, sizeof a);
    printf("linear com sentinela: 47 está no índice %ld\n", linear_sentinela(b, n, 47));
    printf("linear com sentinela: 50 está no índice %ld\n", linear_sentinela(b, n, 50));

    printf("binária com trilha, procurando 41:\n");
    binaria_trilha(a, n, 41);
    printf("binária com trilha, procurando 40:\n");
    binaria_trilha(a, n, 40);

    printf("o estouro do meio:\n");
    demonstra_estouro();

    const char *agenda[] = {"Ana", "Bruno", "Carla", "Diego", "Elisa"};
    printf("agenda: Diego está na posição %ld\n", agenda_busca(agenda, 5, "Diego"));
    printf("agenda: Zoe está na posição %ld\n", agenda_busca(agenda, 5, "Zoe"));

    const int rep[] = {1, 2, 2, 2, 3, 5, 5, 8};
    printf("ocorrências de 2: linear=%zu binária=%zu\n",
           ocorrencias_linear(rep, 8, 2), ocorrencias_binaria(rep, 8, 2));
    printf("ocorrências de 5: linear=%zu binária=%zu\n",
           ocorrencias_linear(rep, 8, 5), ocorrencias_binaria(rep, 8, 5));

    printf("bisect com 16 commits, falha começa no commit 11:\n");
    bisect(16, 11);
    return 0;
}
