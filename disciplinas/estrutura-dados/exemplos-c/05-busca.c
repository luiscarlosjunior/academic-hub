/*
 * Busca em C: linear, binária (iterativa e recursiva), lower_bound,
 * busca na resposta, e exercícios resolvidos.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 05-busca.c -o busca
 */
#include <stdio.h>

/* [op:linear] */
static long busca_linear(const int a[], size_t n, int x) {
    for (size_t i = 0; i < n; i++)
        if (a[i] == x) return (long)i;
    return -1;
}
/* [/op:linear] */

/* [op:binaria-iter] */
static long busca_binaria(const int a[], size_t n, int x) {
    size_t lo = 0, hi = n;                         /* intervalo [lo, hi) */
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (a[mid] == x) return (long)mid;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return -1;
}
/* [/op:binaria-iter] */

/* [op:binaria-rec] */
static long busca_rec(const int a[], size_t lo, size_t hi, int x) {
    if (lo >= hi) return -1;
    size_t mid = lo + (hi - lo) / 2;
    if (a[mid] == x) return (long)mid;
    if (a[mid] < x) return busca_rec(a, mid + 1, hi, x);
    return busca_rec(a, lo, mid, x);
}

static long busca_binaria_rec(const int a[], size_t n, int x) {
    return busca_rec(a, 0, n, x);
}
/* [/op:binaria-rec] */

/* [op:lower-bound] */
static size_t lower_bound(const int a[], size_t n, int x) {
    size_t lo = 0, hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;                                     /* primeira posição com a[i] >= x */
}
/* [/op:lower-bound] */

/* [ex:primeira] */
static long primeira_ocorrencia(const int a[], size_t n, int x) {
    size_t p = lower_bound(a, n, x);
    return (p < n && a[p] == x) ? (long)p : -1;
}
/* [/ex:primeira] */

/* [ex:raiz] */
static unsigned long raiz_inteira(unsigned long n) {
    unsigned long lo = 0, hi = n;                  /* a resposta está em [lo, hi] */
    while (lo < hi) {
        unsigned long mid = lo + (hi - lo + 1) / 2;   /* arredonda para cima */
        if (mid <= n / mid) lo = mid;              /* mid² <= n, sem estouro */
        else hi = mid - 1;
    }
    return lo;
}
/* [/ex:raiz] */

/* [ex:rotacionado] */
static int minimo_rotacionado(const int a[], size_t n) {
    size_t lo = 0, hi = n - 1;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (a[mid] > a[hi]) lo = mid + 1;          /* o mínimo está à direita */
        else hi = mid;
    }
    return a[lo];
}
/* [/ex:rotacionado] */

/* [ex:pico] */
static size_t achar_pico(const int a[], size_t n) {
    size_t lo = 0, hi = n - 1;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (a[mid] < a[mid + 1]) lo = mid + 1;     /* subindo: pico à direita */
        else hi = mid;                             /* descendo: pico em mid ou à esquerda */
    }
    return lo;
}
/* [/ex:pico] */

int main(void) {
    const int a[] = {3, 7, 11, 15, 19, 24, 28, 33, 41, 47, 52, 60};
    const size_t n = sizeof a / sizeof a[0];
    const int alvos[] = {24, 40, 3};

    for (int k = 0; k < 3; k++) {
        printf("buscar %2d: linear=%ld binária=%ld recursiva=%ld\n",
               alvos[k], busca_linear(a, n, alvos[k]),
               busca_binaria(a, n, alvos[k]), busca_binaria_rec(a, n, alvos[k]));
    }

    const int rep[] = {1, 2, 2, 2, 5, 8};
    printf("primeira ocorrência de 2 em {1,2,2,2,5,8} = %ld\n",
           primeira_ocorrencia(rep, 6, 2));
    printf("primeira ocorrência de 4 = %ld\n", primeira_ocorrencia(rep, 6, 4));

    printf("raiz inteira de 99 = %lu, de 100 = %lu\n", raiz_inteira(99), raiz_inteira(100));

    const int rot[] = {4, 5, 6, 7, 0, 1, 2};
    printf("mínimo de {4,5,6,7,0,1,2} = %d\n", minimo_rotacionado(rot, 7));

    const int pico[] = {1, 3, 8, 12, 4, 2};
    printf("índice de um pico em {1,3,8,12,4,2} = %zu\n", achar_pico(pico, 6));
    return 0;
}
