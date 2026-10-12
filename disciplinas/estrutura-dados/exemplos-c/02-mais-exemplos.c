/*
 * Mais exemplos de vetores: remoção de todas as ocorrências, mesclagem de
 * vetores ordenados e reorganização de zeros.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 02-mais-exemplos.c -o mais
 */
#include <stdio.h>
#include <stdlib.h>

static void imprimir(const char *rot, const int a[], size_t n) {
    printf("%-22s", rot);
    for (size_t i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
}

/* [ex-a] Remove todas as ocorrências de x, mantendo a ordem relativa. O(n), in place */
static size_t remover_todos(int a[], size_t n, int x) {
    size_t w = 0;
    for (size_t r = 0; r < n; r++)
        if (a[r] != x) a[w++] = a[r];
    return w;
}
/* [/ex-a] */

/* [ex-b] Mescla dois vetores ordenados em um terceiro. O(n + m) de tempo e de espaço */
static void mesclar(const int a[], size_t n, const int b[], size_t m, int out[]) {
    size_t i = 0, j = 0, k = 0;
    while (i < n && j < m) out[k++] = (a[i] <= b[j]) ? a[i++] : b[j++];
    while (i < n) out[k++] = a[i++];
    while (j < m) out[k++] = b[j++];
}
/* [/ex-b] */

/* [ex-c] Move os zeros para o fim, mantendo a ordem dos demais. Um escritor e um leitor */
static void mover_zeros(int a[], size_t n) {
    size_t w = 0;
    for (size_t r = 0; r < n; r++)
        if (a[r] != 0) a[w++] = a[r];
    while (w < n) a[w++] = 0;
}
/* [/ex-c] */

int main(void) {
    int a[] = {3, 7, 3, 1, 3, 9, 3};
    size_t n = remover_todos(a, 7, 3);
    imprimir("sem os 3:", a, n);

    const int x[] = {1, 4, 6, 9};
    const int y[] = {2, 3, 7, 10, 12};
    int z[9];
    mesclar(x, 4, y, 5, z);
    imprimir("mesclados:", z, 9);

    int w[] = {0, 5, 0, 2, 0, 0, 8};
    mover_zeros(w, 7);
    imprimir("zeros no fim:", w, 7);
    return 0;
}
