/*
 * Complexidade temporal e espacial, medidas na prática.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 01-complexidade.c -o complexidade
 */
#include <stdio.h>

static long ops = 0;   /* contador de operações elementares */

/* [op:constante] */
static int primeiro(const int a[]) {
    ops++;
    return a[0];
}
/* [/op:constante] */

/* [op:linear] */
static long soma(const int a[], int n) {
    long s = 0;
    for (int i = 0; i < n; i++) {
        ops++;
        s += a[i];
    }
    return s;
}
/* [/op:linear] */

/* [op:quadratico] */
static int pares_iguais(const int a[], int n) {
    int c = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            ops++;
            if (a[i] == a[j]) c++;
        }
    return c;
}
/* [/op:quadratico] */

/* [op:logaritmico] */
static int metades(int n) {
    int k = 0;
    for (int m = n; m > 1; m /= 2) {
        ops++;
        k++;
    }
    return k;
}
/* [/op:logaritmico] */

/* [op:fatorial-rec] */
static unsigned long long fat_rec(unsigned n) {
    return n <= 1 ? 1 : n * fat_rec(n - 1);
}
/* [/op:fatorial-rec] */

/* [op:fatorial-it] */
static unsigned long long fat_it(unsigned n) {
    unsigned long long r = 1;
    for (unsigned i = 2; i <= n; i++) r *= i;
    return r;
}
/* [/op:fatorial-it] */

/* [ex:1] */
static long triangular(int n) {
    long c = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < i; j++)
            c++;
    return c;
}
/* [/ex:1] */

/* [ex:2] */
static long n_log_n(int n) {
    long c = 0;
    for (int i = 1; i < n; i *= 2)
        for (int j = 0; j < n; j++)
            c++;
    return c;
}
/* [/ex:2] */

/* [ex:3] */
static long misto(int n) {
    long c = 0;
    for (int i = 0; i < n; i++) c++;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            c++;
    return c;
}
/* [/ex:3] */

int main(void) {
    static int a[1024];
    for (int i = 0; i < 1024; i++) a[i] = i;

    printf("%6s %6s %8s %8s %10s\n", "n", "O(1)", "O(log n)", "O(n)", "O(n^2)");
    for (int n = 8; n <= 1024; n *= 2) {
        ops = 0; primeiro(a);        long c1 = ops;
        ops = 0; metades(n);         long cl = ops;
        ops = 0; soma(a, n);         long cn = ops;
        ops = 0; pares_iguais(a, n); long cq = ops;
        printf("%6d %6ld %8ld %8ld %10ld\n", n, c1, cl, cn, cq);
    }
    printf("\nfatorial de 10: recursivo=%llu iterativo=%llu\n", fat_rec(10), fat_it(10));
    printf("triangular(5)=%ld  n_log_n(8)=%ld  misto(4)=%ld\n",
           triangular(5), n_log_n(8), misto(4));
    return 0;
}
