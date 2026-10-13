/* Medição de tempo, speedup, eficiência e a lei de Amdahl.
   Compilar: gcc -O2 -std=c11 01-medicao.c -o 01-medicao
   Executar: ./01-medicao                                             */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

/* Relógio monotônico: não volta no tempo se o sistema ajustar a hora. */
static double agora(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec * 1e-9;
}

static int compara(const void *a, const void *b) {
    double x = *(const double *)a, y = *(const double *)b;
    return (x > y) - (x < y);
}

/* volatile impede que o compilador elimine o laço por achar que ele não tem efeito. */
static volatile double resultado;

static void trabalho(const double *v, size_t n) {
    double s = 0.0;
    for (size_t i = 0; i < n; i++)
        s += v[i] * v[i];
    resultado = s;
}

int main(void) {
    const size_t n = 20000000;   /* 20 milhões de doubles: 160 MB, maior que o cache */
    const int reps = 7;
    double *v = malloc(n * sizeof *v);
    if (!v) return 1;
    for (size_t i = 0; i < n; i++)
        v[i] = 1.0 / (double)(i + 1);

    trabalho(v, n);   /* aquecimento: a primeira execução paga page faults e cache frio */

    double t[7];
    for (int r = 0; r < reps; r++) {
        double t0 = agora();
        trabalho(v, n);
        t[r] = agora() - t0;
    }
    qsort(t, reps, sizeof t[0], compara);

    double mediana = t[reps / 2];
    printf("n = %zu, repeticoes = %d\n", n, reps);
    printf("minimo  = %.6f s\n", t[0]);
    printf("mediana = %.6f s\n", mediana);
    printf("maximo  = %.6f s\n", t[reps - 1]);
    printf("vazao   = %.2f GB/s (lidos %zu bytes por execucao)\n",
           n * sizeof *v / mediana / 1e9, n * sizeof *v);

    /* Lei de Amdahl: f é a fração do tempo serial que pode ser paralelizada. */
    const double f = 0.95;
    const int ps[] = {1, 2, 4, 8, 16, 32, 64};
    printf("\nAmdahl com f = %.2f (teto de speedup = %.1f)\n", f, 1.0 / (1.0 - f));
    printf("%6s %10s %12s\n", "p", "speedup", "eficiencia");
    for (size_t i = 0; i < sizeof ps / sizeof ps[0]; i++) {
        double S = 1.0 / ((1.0 - f) + f / ps[i]);
        printf("%6d %10.2f %11.1f%%\n", ps[i], S, 100.0 * S / ps[i]);
    }

    free(v);
    return 0;
}
