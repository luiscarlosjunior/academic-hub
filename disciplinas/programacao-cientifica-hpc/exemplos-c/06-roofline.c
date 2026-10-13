/* Roofline caseiro: mede a vazão de memória (triad) e de computação (laço
   com muitas operações por elemento) e mostra o teto previsto para cada
   intensidade aritmética.
   Compilar: gcc -O2 -std=c11 06-roofline.c -o 06-roofline              */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define N (8 * 1024 * 1024)  /* 8 Mi doubles por vetor: 64 MB, maior que o cache */

static double agora(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec * 1e-9;
}

static int compara(const void *a, const void *b) {
    double x = *(const double *)a, y = *(const double *)b;
    return (x > y) - (x < y);
}

static volatile double sink;

/* Triad: a[i] = b[i] + s * c[i]. 2 flops e 24 bytes de tráfego por elemento
   (2 leituras + 1 escrita), contando o caso ideal sem leitura extra da linha
   na escrita: AI = 2/24 = 1/12 flop/byte. */
static double triad(double *restrict a, const double *restrict b,
                    const double *restrict c, double s) {
    for (size_t i = 0; i < N; i++)
        a[i] = b[i] + s * c[i];
    return a[N / 2];
}

/* Laço com K iterações de x = x*y + 0.5 em 8 cadeias independentes por
   elemento. Uma cadeia só mede latência; oito cadeias expõem o paralelismo
   de instrução do núcleo, e aí o gargalo passa a ser a computação.
   Cada iteração: 2 flops por cadeia, 8 cadeias: 16 * K flops por elemento. */
#define K 64
static double denso(double *restrict a, const double *restrict b) {
    for (size_t i = 0; i < N; i++) {
        double x0 = b[i],       x1 = x0 + 1, x2 = x0 + 2, x3 = x0 + 3;
        double x4 = x0 + 4,     x5 = x0 + 5, x6 = x0 + 6, x7 = x0 + 7;
        const double y = 1.0000001;
        for (int k = 0; k < K; k++) {
            x0 = x0 * y + 0.5; x1 = x1 * y + 0.5; x2 = x2 * y + 0.5; x3 = x3 * y + 0.5;
            x4 = x4 * y + 0.5; x5 = x5 * y + 0.5; x6 = x6 * y + 0.5; x7 = x7 * y + 0.5;
        }
        a[i] = x0 + x1 + x2 + x3 + x4 + x5 + x6 + x7;
    }
    return a[N / 2];
}

/* Mediana de 5 execuções, depois de um aquecimento. */
static double mede(double (*f)(void), int reps) {
    double t[16];
    f();
    for (int r = 0; r < reps; r++) {
        double t0 = agora();
        sink = f();
        t[r] = agora() - t0;
    }
    qsort(t, reps, sizeof t[0], compara);
    return t[reps / 2];
}

static double *A, *B, *C;
static double wrap_triad(void) { return triad(A, B, C, 3.0); }
static double wrap_denso(void) { return denso(A, B); }

int main(void) {
    A = malloc(N * sizeof *A); B = malloc(N * sizeof *B); C = malloc(N * sizeof *C);
    if (!A || !B || !C) return 1;
    for (size_t i = 0; i < N; i++) { B[i] = 1.0 + i % 3; C[i] = 0.5 * (i % 5); }

    double t_triad = mede(wrap_triad, 5);
    double flops_triad = 2.0 * N, bytes_triad = 24.0 * N;
    double bw = bytes_triad / t_triad / 1e9;
    printf("triad: %.4f s, %.2f GB/s, AI = %.3f flop/byte\n",
           t_triad, bw, flops_triad / bytes_triad);

    double t_denso = mede(wrap_denso, 5);
    double flops_denso = 16.0 * K * N, bytes_denso = 16.0 * N;
    double gf = flops_denso / t_denso / 1e9;
    printf("denso: %.4f s, %.2f GFLOP/s, AI = %.2f flop/byte\n",
           t_denso, gf, flops_denso / bytes_denso);

    /* Teto roofline: min(pico de computação, AI * largura de banda).
       O pico teórico depende da máquina (frequência, unidades SIMD, FMA);
       aqui usamos o desempenho medido do laço denso como estimativa. */
    double pico = gf;
    double ponto_ridge = pico / bw;
    printf("\nteto estimado de computacao = %.2f GFLOP/s, banda = %.2f GB/s\n", pico, bw);
    printf("ponto de inflexao (ridge) = %.2f flop/byte\n\n", ponto_ridge);
    printf("%10s %16s %s\n", "AI", "teto (GFLOP/s)", "limitado por");
    double ais[] = {0.0625, 0.25, 1.0, 4.0, 16.0, 64.0};
    for (size_t i = 0; i < sizeof ais / sizeof ais[0]; i++) {
        double teto = ais[i] * bw < pico ? ais[i] * bw : pico;
        printf("%10.4f %16.2f %s\n", ais[i], teto, ais[i] < ponto_ridge ? "memoria" : "computacao");
    }

    free(A); free(B); free(C);
    return 0;
}
