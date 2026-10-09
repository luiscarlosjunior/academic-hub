/*
 * Padrões de resolução de problemas em C: dois ponteiros, janela deslizante,
 * somas de prefixos, backtracking, divisão e conquista, guloso,
 * programação dinâmica, e exercícios resolvidos.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 11-padroes.c -o padroes
 */
#include <stdio.h>
#include <stdlib.h>

static int cmp_int(const void *x, const void *y) {
    int a = *(const int *)x, b = *(const int *)y;
    return (a > b) - (a < b);
}

/* [pad:dois-ponteiros] */
static int par_soma(const int a[], size_t n, long alvo, size_t *i, size_t *j) {
    if (n < 2) return 0;
    size_t lo = 0, hi = n - 1;                       /* vetor já ordenado */
    while (lo < hi) {
        long s = (long)a[lo] + a[hi];
        if (s == alvo) {
            *i = lo;
            *j = hi;
            return 1;
        }
        if (s < alvo) lo++;                          /* soma pequena: aumenta o menor */
        else hi--;                                   /* soma grande: diminui o maior */
    }
    return 0;
}
/* [/pad:dois-ponteiros] */

/* [pad:janela] */
static long soma_janela_max(const int a[], size_t n, size_t k, size_t *inicio) {
    long s = 0;
    for (size_t i = 0; i < k; i++) s += a[i];
    long melhor = s;
    *inicio = 0;
    for (size_t i = k; i < n; i++) {
        s += a[i] - a[i - k];                        /* entra a[i], sai a[i-k] */
        if (s > melhor) {
            melhor = s;
            *inicio = i - k + 1;
        }
    }
    return melhor;
}
/* [/pad:janela] */

/* [pad:prefixos] */
static void prefixos(const int a[], size_t n, long p[]) {    /* p tem n+1 posições */
    p[0] = 0;
    for (size_t i = 0; i < n; i++) p[i + 1] = p[i] + a[i];
}

static long soma_intervalo(const long p[], size_t l, size_t r) {   /* [l, r] inclusive */
    return p[r + 1] - p[l];
}
/* [/pad:prefixos] */

/* [pad:backtracking] */
static void imprimir_subconjunto(const int a[], size_t k) {
    printf("{");
    for (size_t i = 0; i < k; i++) printf("%s%d", i ? "," : "", a[i]);
    printf("} ");
}

static void subconjuntos(const int a[], size_t n, size_t i, int atual[], size_t k) {
    if (i == n) {
        imprimir_subconjunto(atual, k);
        return;
    }
    subconjuntos(a, n, i + 1, atual, k);             /* escolha 1: sem a[i] */
    atual[k] = a[i];
    subconjuntos(a, n, i + 1, atual, k + 1);         /* escolha 2: com a[i] */
}
/* [/pad:backtracking] */

/* [pad:divisao] */
typedef struct {
    int min, max;
} MinMax;

static MinMax minmax(const int a[], size_t lo, size_t hi) {    /* [lo, hi), hi > lo */
    MinMax r;
    if (hi - lo == 1) {
        r.min = r.max = a[lo];
        return r;
    }
    size_t mid = lo + (hi - lo) / 2;
    MinMax e = minmax(a, lo, mid), d = minmax(a, mid, hi);
    r.min = e.min < d.min ? e.min : d.min;
    r.max = e.max > d.max ? e.max : d.max;
    return r;
}
/* [/pad:divisao] */

/* [pad:guloso] */
static int moedas_gulosas(int valor, int usadas[4]) {    /* sistema 25, 10, 5, 1 */
    const int sistema[4] = {25, 10, 5, 1};
    int total = 0;
    for (size_t i = 0; i < 4; i++) {
        usadas[i] = valor / sistema[i];
        total += usadas[i];
        valor %= sistema[i];
    }
    return total;
}
/* [/pad:guloso] */

/* [pad:dinamica] */
static unsigned long long escadas(unsigned n) {      /* passos de 1 ou 2 */
    if (n <= 1) return 1;
    unsigned long long a = 1, b = 1;
    for (unsigned i = 2; i <= n; i++) {
        unsigned long long c = a + b;                 /* f(i) = f(i-1) + f(i-2) */
        a = b;
        b = c;
    }
    return b;
}
/* [/pad:dinamica] */

/* [ex:tres-soma] */
static int tres_soma_zero(int a[], size_t n) {
    qsort(a, n, sizeof *a, cmp_int);                 /* ordena: O(n log n) */
    for (size_t i = 0; i + 2 < n; i++) {
        size_t lo = i + 1, hi = n - 1;
        while (lo < hi) {
            long s = (long)a[i] + a[lo] + a[hi];
            if (s == 0) return 1;
            if (s < 0) lo++;
            else hi--;
        }
    }
    return 0;                                         /* O(n²) no total */
}
/* [/ex:tres-soma] */

/* [ex:subarray] */
static int subarray_com_soma(const int a[], size_t n, long alvo, size_t *ini, size_t *fim) {
    /* valores positivos: a janela só cresce quando a soma é pequena */
    size_t l = 0;
    long s = 0;
    for (size_t r = 0; r < n; r++) {
        s += a[r];
        while (s > alvo && l <= r) {
            s -= a[l];
            l++;
        }
        if (s == alvo) {
            *ini = l;
            *fim = r;
            return 1;
        }
    }
    return 0;
}
/* [/ex:subarray] */

/* [ex:moedas] */
static unsigned long long formas_troco(unsigned valor) {
    unsigned long long *dp = calloc(valor + 1, sizeof *dp);
    if (dp == NULL) return 0;
    dp[0] = 1;
    const unsigned moedas[3] = {1, 2, 5};
    for (size_t m = 0; m < 3; m++)
        for (unsigned v = moedas[m]; v <= valor; v++)
            dp[v] += dp[v - moedas[m]];           /* as formas que usam a moeda m */
    unsigned long long r = dp[valor];
    free(dp);
    return r;
}
/* [/ex:moedas] */

int main(void) {
    const int sorted[] = {1, 3, 4, 6, 8, 11};
    size_t i = 0, j = 0;
    if (par_soma(sorted, 6, 10, &i, &j)) printf("dois ponteiros: %d + %d = 10\n", sorted[i], sorted[j]);

    const int w[] = {2, 1, 5, 1, 3, 2};
    size_t inicio = 0;
    long m = soma_janela_max(w, 6, 3, &inicio);
    printf("janela de 3: soma máxima = %ld a partir do índice %zu\n", m, inicio);

    long p[7];
    prefixos(w, 6, p);
    printf("soma de [1,4] = %ld\n", soma_intervalo(p, 1, 4));

    int atual[3];
    printf("subconjuntos de {1,2,3}: ");
    const int conj[] = {1, 2, 3};
    subconjuntos(conj, 3, 0, atual, 0);
    printf("\n");

    const int mm[] = {7, 2, 9, 4, 1, 8};
    MinMax r = minmax(mm, 0, 6);
    printf("divisão e conquista: min=%d max=%d\n", r.min, r.max);

    int usadas[4];
    int total = moedas_gulosas(68, usadas);
    printf("troco de 68 com o sistema guloso: %d moedas (%d×25, %d×10, %d×5, %d×1)\n",
           total, usadas[0], usadas[1], usadas[2], usadas[3]);

    printf("escadas(5) = %llu, escadas(10) = %llu\n", escadas(5), escadas(10));

    int t3[] = {-1, 0, 1, 2, -1, -4};
    printf("existe trio com soma zero em {-1,0,1,2,-1,-4}? %s\n",
           tres_soma_zero(t3, 6) ? "sim" : "não");

    const int pos[] = {1, 2, 3, 7, 5};
    size_t a = 0, b = 0;
    if (subarray_com_soma(pos, 5, 12, &a, &b)) printf("subarray de soma 12: índices %zu a %zu\n", a, b);

    printf("formas de formar 10 com moedas {1,2,5} = %llu\n", formas_troco(10));
    return 0;
}
