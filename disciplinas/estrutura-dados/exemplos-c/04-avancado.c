/*
 * Exemplos avançados de ordenação: intercalação de várias listas ordenadas,
 * ordenação externa simulada, detecção de duplicados e quicksort híbrido.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 04-avancado.c -o avancado
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void imprimir(const char *rot, const int a[], size_t n) {
    printf("%-26s", rot);
    for (size_t i = 0; i < n && i < 16; i++) printf(" %d", a[i]);
    if (n > 16) printf(" ...");
    printf("\n");
}

/* [ex-a] Intercala duas sequências ordenadas em uma terceira: O(n + m) */
static size_t intercalar2(const int a[], size_t n, const int b[], size_t m, int out[]) {
    size_t i = 0, j = 0, k = 0;
    while (i < n && j < m) out[k++] = a[i] <= b[j] ? a[i++] : b[j++];
    while (i < n) out[k++] = a[i++];
    while (j < m) out[k++] = b[j++];
    return k;
}

/* Logs de k servidores, cada um já ordenado por horário. Intercala todos, dois a dois */
static size_t intercalar_k(const int *listas[], const size_t tam[], size_t k, int out[]) {
    size_t total = 0;
    int *atual = malloc(sizeof(int) * 64), *prox = malloc(sizeof(int) * 64);
    if (!atual || !prox) exit(1);
    for (size_t i = 0; i < tam[0]; i++) atual[i] = listas[0][i];
    total = tam[0];
    for (size_t l = 1; l < k; l++) {
        total = intercalar2(atual, total, listas[l], tam[l], prox);
        int *t = atual; atual = prox; prox = t;
    }
    memcpy(out, atual, total * sizeof *out);
    free(atual);
    free(prox);
    return total;
}
/* [/ex-a] */

/* [ex-b] Ordenação externa simulada: blocos que cabem na memória são ordenados e depois intercalados */
static int cmp_int(const void *x, const void *y) {
    int a = *(const int *)x, b = *(const int *)y;
    return (a > b) - (a < b);
}

static size_t ordenacao_externa(const int dados[], size_t n, size_t bloco, int out[]) {
    size_t blocos = (n + bloco - 1) / bloco;
    size_t pos[32] = {0}, fim[32];
    for (size_t b = 0; b < blocos; b++) {
        size_t ini = b * bloco, cnt = (ini + bloco <= n) ? bloco : n - ini;
        memcpy(&out[ini], &dados[ini], cnt * sizeof *out);   /* "lê o bloco do disco" */
        qsort(&out[ini], cnt, sizeof *out, cmp_int);          /* ordena na memória */
        fim[b] = ini + cnt;
        pos[b] = ini;
    }
    int *res = malloc(n * sizeof *res);
    if (!res) exit(1);
    for (size_t k = 0; k < n; k++) {                          /* intercalação de k blocos */
        size_t melhor = (size_t)-1;
        for (size_t b = 0; b < blocos; b++)
            if (pos[b] < fim[b] && (melhor == (size_t)-1 || out[pos[b]] < out[pos[melhor]]))
                melhor = b;
        res[k] = out[pos[melhor]++];
    }
    memcpy(out, res, n * sizeof *out);
    free(res);
    return blocos;
}
/* [/ex-b] */

/* [ex-c] Detecção e remoção de duplicados: ordenar aproxima repetidos, então basta olhar vizinhos */
static size_t remover_duplicados(int a[], size_t n, size_t *repetidos) {
    qsort(a, n, sizeof *a, cmp_int);
    size_t w = 0;
    *repetidos = 0;
    for (size_t r = 0; r < n; r++) {
        if (w > 0 && a[w - 1] == a[r]) { (*repetidos)++; continue; }
        a[w++] = a[r];
    }
    return w;
}
/* [/ex-c] */

/* [ex-d] Quicksort híbrido: mediana de três como pivô e insertion sort em subvetores pequenos */
static void insercao(int a[], long lo, long hi) {
    for (long i = lo + 1; i <= hi; i++) {
        int chave = a[i];
        long j = i - 1;
        while (j >= lo && a[j] > chave) { a[j + 1] = a[j]; j--; }
        a[j + 1] = chave;
    }
}

static void trocar(int *x, int *y) { int t = *x; *x = *y; *y = t; }

static void quick_hibrido(int a[], long lo, long hi) {
    while (hi - lo >= 8) {                       /* subvetor grande: particiona */
        long mid = lo + (hi - lo) / 2;
        if (a[mid] < a[lo]) trocar(&a[mid], &a[lo]);
        if (a[hi] < a[lo]) trocar(&a[hi], &a[lo]);
        if (a[hi] < a[mid]) trocar(&a[hi], &a[mid]);
        trocar(&a[mid], &a[hi - 1]);             /* mediana de três vai para hi-1 */
        int pivo = a[hi - 1];
        long i = lo, j = hi - 1;
        for (;;) {
            while (a[++i] < pivo) { }
            while (a[--j] > pivo) { }
            if (i >= j) break;
            trocar(&a[i], &a[j]);
        }
        trocar(&a[i], &a[hi - 1]);
        if (i - lo < hi - i) { quick_hibrido(a, lo, i - 1); lo = i + 1; }
        else { quick_hibrido(a, i + 1, hi); hi = i - 1; }
    }
    insercao(a, lo, hi);                         /* subvetor pequeno: insertion é mais rápida */
}
/* [/ex-d] */

int main(void) {
    const int s1[] = {100, 105, 130};            /* servidor A */
    const int s2[] = {101, 120, 121, 200};       /* servidor B */
    const int s3[] = {99, 110};                  /* servidor C */
    const int *listas[] = {s1, s2, s3};
    const size_t tam[] = {3, 4, 2};
    int todos[16];
    size_t n = intercalar_k(listas, tam, 3, todos);
    imprimir("logs intercalados:", todos, n);

    int dados[30];
    unsigned seed = 12345u;
    for (int i = 0; i < 30; i++) {               /* gerador congruencial: resultado reprodutível */
        seed = seed * 1103515245u + 12345u;
        dados[i] = (int)((seed >> 16) % 100);
    }
    int ext[30];
    size_t blocos = ordenacao_externa(dados, 30, 8, ext);
    printf("ordenação externa: %zu blocos de até 8 itens\n", blocos);
    imprimir("resultado externo:", ext, 30);

    int cad[] = {42, 7, 42, 13, 7, 7, 99, 13};
    size_t rep = 0;
    size_t u = remover_duplicados(cad, 8, &rep);
    printf("cadastros únicos: %zu (repetidos removidos: %zu)\n", u, rep);
    imprimir("lista limpa:", cad, u);

    int h[40];
    seed = 777u;
    for (int i = 0; i < 40; i++) {
        seed = seed * 1103515245u + 12345u;
        h[i] = (int)((seed >> 16) % 1000);
    }
    quick_hibrido(h, 0, 39);
    int ok = 1;
    for (int i = 1; i < 40; i++) if (h[i - 1] > h[i]) ok = 0;
    printf("quicksort híbrido com 40 valores aleatórios ordenado: %s\n", ok ? "sim" : "não");
    imprimir("menores:", h, 40);
    return 0;
}
