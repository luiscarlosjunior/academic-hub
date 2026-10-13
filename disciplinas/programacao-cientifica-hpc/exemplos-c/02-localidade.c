/* Localidade espacial: somar uma matriz por linhas ou por colunas.
   A mesma quantidade de operações, tempos diferentes: o cache decide.
   Compilar: gcc -O2 -std=c11 02-localidade.c -o 02-localidade       */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define N 4096   /* matriz 4096 x 4096 de doubles: 128 MB */

static double agora(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec * 1e-9;
}

static volatile double sink;

/* Percorre a memória na ordem em que ela está armazenada (linha maior). */
static double soma_por_linhas(const double *m) {
    double s = 0.0;
    for (size_t i = 0; i < N; i++)
        for (size_t j = 0; j < N; j++)
            s += m[i * N + j];
    return s;
}

/* Mesmos elementos, mas saltando N * 8 bytes a cada passo: um cache miss quase sempre. */
static double soma_por_colunas(const double *m) {
    double s = 0.0;
    for (size_t j = 0; j < N; j++)
        for (size_t i = 0; i < N; i++)
            s += m[i * N + j];
    return s;
}

int main(void) {
    double *m = malloc((size_t)N * N * sizeof *m);
    if (!m) return 1;
    for (size_t k = 0; k < (size_t)N * N; k++)
        m[k] = (double)(k % 7);

    sink = soma_por_linhas(m);   /* aquecimento */

    double t0 = agora();
    double s1 = soma_por_linhas(m);
    double t1 = agora();
    double s2 = soma_por_colunas(m);
    double t2 = agora();

    sink = s1 + s2;
    printf("soma igual nos dois percursos: %s (%.0f)\n", s1 == s2 ? "sim" : "nao", s1);
    printf("por linhas:  %.4f s\n", t1 - t0);
    printf("por colunas: %.4f s\n", t2 - t1);
    printf("razao colunas/linhas: %.2f\n", (t2 - t1) / (t1 - t0));

    free(m);
    return 0;
}
