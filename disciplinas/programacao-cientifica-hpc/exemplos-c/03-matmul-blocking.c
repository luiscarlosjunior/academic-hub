/* Otimização serial de C = A x B: ordem dos laços e blocking (tiling).
   Três versões, mesmo resultado, tempos diferentes.
   Compilar: gcc -O2 -std=c11 03-matmul-blocking.c -o 03-matmul-blocking  */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define N 512     /* matrizes N x N de doubles */
#define BLOCO 64  /* tamanho do bloco: três blocos devem caber no cache */

static double agora(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec * 1e-9;
}

/* Versão ijk: B é acessado por colunas no laço interno (ruim para o cache). */
static void mul_ijk(const double *A, const double *B, double *C) {
    for (size_t i = 0; i < N; i++)
        for (size_t j = 0; j < N; j++) {
            double s = 0.0;
            for (size_t k = 0; k < N; k++)
                s += A[i * N + k] * B[k * N + j];
            C[i * N + j] = s;
        }
}

/* Versão ikj: o laço interno anda em linha em B e em C (acesso contíguo). */
static void mul_ikj(const double *A, const double *B, double *C) {
    memset(C, 0, (size_t)N * N * sizeof *C);
    for (size_t i = 0; i < N; i++)
        for (size_t k = 0; k < N; k++) {
            double a = A[i * N + k];
            for (size_t j = 0; j < N; j++)
                C[i * N + j] += a * B[k * N + j];
        }
}

/* Versão em blocos: cada sub-matriz BLOCO x BLOCO é reutilizada enquanto está no cache. */
static void mul_bloco(const double *A, const double *B, double *C) {
    memset(C, 0, (size_t)N * N * sizeof *C);
    for (size_t ii = 0; ii < N; ii += BLOCO)
        for (size_t kk = 0; kk < N; kk += BLOCO)
            for (size_t jj = 0; jj < N; jj += BLOCO)
                for (size_t i = ii; i < ii + BLOCO; i++)
                    for (size_t k = kk; k < kk + BLOCO; k++) {
                        double a = A[i * N + k];
                        for (size_t j = jj; j < jj + BLOCO; j++)
                            C[i * N + j] += a * B[k * N + j];
                    }
}

static double diferenca_max(const double *X, const double *Y) {
    double d = 0.0;
    for (size_t k = 0; k < (size_t)N * N; k++) {
        double e = X[k] - Y[k];
        if (e < 0) e = -e;
        if (e > d) d = e;
    }
    return d;
}

int main(void) {
    double *A = malloc((size_t)N * N * sizeof *A);
    double *B = malloc((size_t)N * N * sizeof *B);
    double *C1 = malloc((size_t)N * N * sizeof *C1);
    double *C2 = malloc((size_t)N * N * sizeof *C2);
    double *C3 = malloc((size_t)N * N * sizeof *C3);
    if (!A || !B || !C1 || !C2 || !C3) return 1;

    for (size_t k = 0; k < (size_t)N * N; k++) {
        A[k] = (double)((k * 31) % 17) / 17.0;
        B[k] = (double)((k * 13) % 11) / 11.0;
    }

    double t0 = agora(); mul_ijk(A, B, C1);   double t1 = agora();
    double t2 = agora(); mul_ikj(A, B, C2);   double t3 = agora();
    double t4 = agora(); mul_bloco(A, B, C3); double t5 = agora();

    double flops = 2.0 * N * N * N;
    printf("N = %d, bloco = %d\n", N, BLOCO);
    printf("%-10s %10s %12s %10s\n", "versao", "tempo (s)", "GFLOP/s", "erro max");
    printf("%-10s %10.4f %12.2f %10s\n", "ijk",   t1 - t0, flops / (t1 - t0) / 1e9, "ref.");
    printf("%-10s %10.4f %12.2f %10.2e\n", "ikj",   t3 - t2, flops / (t3 - t2) / 1e9, diferenca_max(C1, C2));
    printf("%-10s %10.4f %12.2f %10.2e\n", "bloco", t5 - t4, flops / (t5 - t4) / 1e9, diferenca_max(C1, C3));

    free(A); free(B); free(C1); free(C2); free(C3);
    return 0;
}
