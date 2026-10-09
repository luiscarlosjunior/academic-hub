/*
 * Algoritmos de ordenação em C: bolha, seleção, inserção, quicksort,
 * merge sort e contagem, além de três exercícios resolvidos.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 04-ordenacao.c -o ordenacao
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void trocar(int *x, int *y) {
    int t = *x;
    *x = *y;
    *y = t;
}

/* [op:bolha] */
static void bolha(int a[], size_t n) {
    for (size_t p = 0; p + 1 < n; p++) {
        int trocou = 0;
        for (size_t j = 0; j + 1 < n - p; j++)
            if (a[j] > a[j + 1]) {
                trocar(&a[j], &a[j + 1]);
                trocou = 1;
            }
        if (!trocou) break;                 /* já ordenado: parada antecipada */
    }
}
/* [/op:bolha] */

/* [op:selecao] */
static void selecao(int a[], size_t n) {
    for (size_t i = 0; i + 1 < n; i++) {
        size_t menor = i;
        for (size_t j = i + 1; j < n; j++)
            if (a[j] < a[menor]) menor = j;
        trocar(&a[i], &a[menor]);
    }
}
/* [/op:selecao] */

/* [op:insercao] */
static void insercao(int a[], size_t n) {
    for (size_t i = 1; i < n; i++) {
        int chave = a[i];
        size_t j = i;
        while (j > 0 && a[j - 1] > chave) {
            a[j] = a[j - 1];
            j--;
        }
        a[j] = chave;
    }
}
/* [/op:insercao] */

/* [op:quicksort] */
static void quicksort(int a[], long lo, long hi) {
    if (lo >= hi) return;
    int pivo = a[hi];
    long i = lo;
    for (long j = lo; j < hi; j++)
        if (a[j] < pivo) {
            trocar(&a[i], &a[j]);
            i++;
        }
    trocar(&a[i], &a[hi]);
    quicksort(a, lo, i - 1);
    quicksort(a, i + 1, hi);
}
/* [/op:quicksort] */

/* [op:mergesort] */
static void intercalar(int a[], int aux[], size_t lo, size_t mid, size_t hi) {
    size_t i = lo, j = mid, k = lo;
    while (i < mid && j < hi) aux[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i < mid) aux[k++] = a[i++];
    while (j < hi) aux[k++] = a[j++];
    memcpy(&a[lo], &aux[lo], (hi - lo) * sizeof *a);
}

static void merge_rec(int a[], int aux[], size_t lo, size_t hi) {
    if (hi - lo < 2) return;
    size_t mid = lo + (hi - lo) / 2;
    merge_rec(a, aux, lo, mid);
    merge_rec(a, aux, mid, hi);
    intercalar(a, aux, lo, mid, hi);
}

static int merge_sort(int a[], size_t n) {
    if (n < 2) return 1;
    int *aux = malloc(n * sizeof *aux);      /* O(n) de memória auxiliar */
    if (aux == NULL) return 0;
    merge_rec(a, aux, 0, n);
    free(aux);
    return 1;
}
/* [/op:mergesort] */

/* [op:contagem] */
static void contagem(int a[], size_t n, int k) {   /* valores em 0..k-1 */
    size_t *freq = calloc((size_t)k, sizeof *freq);
    if (freq == NULL) return;
    for (size_t i = 0; i < n; i++) freq[a[i]]++;
    size_t pos = 0;
    for (int v = 0; v < k; v++)
        for (size_t c = 0; c < freq[v]; c++) a[pos++] = v;
    free(freq);
}
/* [/op:contagem] */

static int ordenado(const int a[], size_t n) {
    for (size_t i = 1; i < n; i++)
        if (a[i - 1] > a[i]) return 0;
    return 1;
}

static void imprimir(const char *rotulo, const int a[], size_t n) {
    printf("%-12s", rotulo);
    for (size_t i = 0; i < n; i++) printf(" %d", a[i]);
    printf("  [%s]\n", ordenado(a, n) ? "ok" : "ERRO");
}

/* [ex:anagramas] */
static void ordenar_chars(char s[], size_t n) {
    for (size_t i = 1; i < n; i++) {
        char c = s[i];
        size_t j = i;
        while (j > 0 && s[j - 1] > c) {
            s[j] = s[j - 1];
            j--;
        }
        s[j] = c;
    }
}

static int anagramas(const char *x, const char *y) {
    size_t n = strlen(x);
    if (n != strlen(y) || n >= 64) return 0;   /* limite do exemplo */
    char a[64], b[64];
    memcpy(a, x, n);
    memcpy(b, y, n);
    ordenar_chars(a, n);
    ordenar_chars(b, n);
    return memcmp(a, b, n) == 0;
}
/* [/ex:anagramas] */

/* [ex:inversoes] */
static long contar_inv(int a[], int aux[], size_t lo, size_t hi) {
    if (hi - lo < 2) return 0;
    size_t mid = lo + (hi - lo) / 2;
    long c = contar_inv(a, aux, lo, mid) + contar_inv(a, aux, mid, hi);
    size_t i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
        if (a[i] <= a[j]) {
            aux[k++] = a[i++];
        } else {
            aux[k++] = a[j++];
            c += (long)(mid - i);            /* a[j] é menor que todo o resto da metade esquerda */
        }
    }
    while (i < mid) aux[k++] = a[i++];
    while (j < hi) aux[k++] = a[j++];
    memcpy(&a[lo], &aux[lo], (hi - lo) * sizeof *a);
    return c;
}

static long inversoes(int a[], size_t n) {
    if (n < 2) return 0;
    int *aux = malloc(n * sizeof *aux);
    if (aux == NULL) return -1;
    long c = contar_inv(a, aux, 0, n);
    free(aux);
    return c;
}
/* [/ex:inversoes] */

/* [ex:kesimo] */
static int kesimo(int a[], size_t n, size_t k) {  /* k começa em 0 */
    size_t lo = 0, hi = n - 1;
    while (lo < hi) {
        int pivo = a[hi];
        size_t i = lo;
        for (size_t j = lo; j < hi; j++)
            if (a[j] < pivo) {
                trocar(&a[i], &a[j]);
                i++;
            }
        trocar(&a[i], &a[hi]);
        if (k == i) return a[i];
        if (k < i) hi = i - 1;
        else lo = i + 1;
    }
    return a[lo];
}
/* [/ex:kesimo] */

int main(void) {
    const int base[] = {29, 10, 14, 37, 13, 5, 42, 8};
    const size_t n = sizeof base / sizeof base[0];
    int a[8];

    memcpy(a, base, sizeof base); bolha(a, n);     imprimir("bolha", a, n);
    memcpy(a, base, sizeof base); selecao(a, n);   imprimir("seleção", a, n);
    memcpy(a, base, sizeof base); insercao(a, n);  imprimir("inserção", a, n);
    memcpy(a, base, sizeof base); quicksort(a, 0, (long)n - 1); imprimir("quicksort", a, n);
    memcpy(a, base, sizeof base); merge_sort(a, n); imprimir("mergesort", a, n);

    int d[] = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};
    contagem(d, 10, 10);
    imprimir("contagem", d, 10);

    printf("\nanagramas(\"amor\", \"roma\") = %d\n", anagramas("amor", "roma"));
    printf("anagramas(\"casa\", \"caso\") = %d\n", anagramas("casa", "caso"));

    int e[] = {2, 4, 1, 3, 5};
    printf("inversões em {2,4,1,3,5} = %ld\n", inversoes(e, 5));

    int f[] = {7, 10, 4, 3, 20, 15};
    printf("3º menor de {7,10,4,3,20,15} = %d\n", kesimo(f, 6, 2));
    return 0;
}
