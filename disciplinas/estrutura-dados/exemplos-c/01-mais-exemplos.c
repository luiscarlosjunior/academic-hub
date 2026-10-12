/*
 * Mais exemplos de complexidade: comparações contadas, análise amortizada
 * e custo de consultas com e sem pré-processamento.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 01-mais-exemplos.c -o mais
 */
#include <stdio.h>

static long cont = 0;   /* contador de operações */

/* [ex-a] */
static long busca_linear(const int a[], int n, int x) {
    for (int i = 0; i < n; i++) {
        cont++;
        if (a[i] == x) return i;
    }
    return -1;
}

static long busca_binaria(const int a[], int n, int x) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int m = lo + (hi - lo) / 2;
        cont++;
        if (a[m] == x) return m;
        if (a[m] < x) lo = m + 1;
        else hi = m - 1;
    }
    return -1;
}
/* [/ex-a] */

/* [ex-b] */
static long consultas_diretas(const long a[], int n, int q) {
    long total = 0;
    for (int k = 0; k < q; k++) {
        long s = 0;
        for (int i = 0; i < n; i++) {
            cont++;
            s += a[i];
        }
        total += s;
    }
    return total;
}

static long consultas_prefixo(const long a[], int n, int q) {
    long p[64];
    p[0] = 0;
    for (int i = 0; i < n; i++) {
        cont++;
        p[i + 1] = p[i] + a[i];
    }
    long total = 0;
    for (int k = 0; k < q; k++) {
        cont++;
        total += p[n];
    }
    return total;
}
/* [/ex-b] */

/* [ex-c] Análise amortizada: incrementar um contador binário n vezes */
static long bit_flips(int n) {
    int bits[32] = {0};
    long flips = 0;
    for (int k = 0; k < n; k++) {
        int i = 0;
        while (i < 32 && bits[i] == 1) {
            bits[i] = 0;
            flips++;
            i++;
        }
        if (i < 32) {
            bits[i] = 1;
            flips++;
        }
    }
    return flips;
}
/* [/ex-c] */

int main(void) {
    int a[16];
    for (int i = 0; i < 16; i++) a[i] = 2 * i + 1;

    printf("ex-a: busca de 31 (posição 15)\n");
    cont = 0; busca_linear(a, 16, 31);
    printf("  linear:  %ld comparações\n", cont);
    cont = 0; busca_binaria(a, 16, 31);
    printf("  binária: %ld comparações\n", cont);
    cont = 0; busca_linear(a, 16, 2);
    printf("  linear ausente 2: %ld comparações\n", cont);

    long v[64];
    for (int i = 0; i < 10; i++) v[i] = i + 1;
    cont = 0; long r1 = consultas_diretas(v, 10, 100);
    long c1 = cont;
    cont = 0; long r2 = consultas_prefixo(v, 10, 100);
    printf("ex-b: 100 consultas de soma em n=10\n");
    printf("  diretas: total=%ld, custo=%ld\n", r1, c1);
    printf("  prefixos: total=%ld, custo=%ld\n", r2, cont);

    printf("ex-c: bit flips em n incrementos\n");
    int ns[] = {8, 16, 1000};
    for (int i = 0; i < 3; i++) {
        long f = bit_flips(ns[i]);
        printf("  n=%4d: flips=%ld (menos de 2n = %d)\n", ns[i], f, 2 * ns[i]);
    }
    return 0;
}
