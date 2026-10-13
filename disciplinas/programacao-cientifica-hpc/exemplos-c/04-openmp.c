/* Memória compartilhada com OpenMP: redução, condição de corrida,
   false sharing e escalonamento.
   Compilar: gcc -O2 -fopenmp -std=c11 04-openmp.c -o 04-openmp
   (com clang: clang -O2 -fopenmp ..., com libomp instalada)           */
#include <omp.h>
#include <stdio.h>
#include <stdlib.h>

#define N 100000000L
#define MAX_THREADS 64

/* Um contador por thread, com cada um ocupando sua própria linha de cache. */
typedef struct {
    long valor;
    char preenchimento[64 - sizeof(long)];
} ContadorAlinhado;

int main(void) {
    double *x = malloc(N * sizeof *x);
    if (!x) return 1;
    for (long i = 0; i < N; i++)
        x[i] = 1.0 / (double)(i + 1);

    /* 1. Redução: cada thread soma sua fatia e o OpenMP combina os resultados. */
    double soma = 0.0;
    double t0 = omp_get_wtime();
    #pragma omp parallel for reduction(+:soma) schedule(static)
    for (long i = 0; i < N; i++)
        soma += x[i];
    double t1 = omp_get_wtime();
    printf("reducao:  soma = %.10f  tempo = %.4f s  threads = %d\n",
           soma, t1 - t0, omp_get_max_threads());

    /* 2. Condição de corrida: várias threads incrementam a mesma variável sem proteção. */
    long errado = 0;
    #pragma omp parallel for
    for (long i = 0; i < N; i++)
        errado++;                       /* ERRADO: leitura e escrita não são atômicas */

    /* Correção: atomic (ou reduction(+:certo)). */
    long certo = 0;
    #pragma omp parallel for
    for (long i = 0; i < N; i++) {
        #pragma omp atomic
        certo++;
    }
    printf("contador sem protecao: %ld (esperado %ld)\n", errado, N);
    printf("contador com atomic:   %ld\n", certo);

    /* 3. False sharing: contadores vizinhos na mesma linha de cache disputam a linha. */
    static long contadores_juntos[MAX_THREADS];
    static ContadorAlinhado contadores_separados[MAX_THREADS];
    int nthreads = omp_get_max_threads();

    double t2 = omp_get_wtime();
    #pragma omp parallel num_threads(nthreads)
    {
        int id = omp_get_thread_num();
        for (long i = id; i < N; i += nthreads)
            contadores_juntos[id]++;
    }
    double t3 = omp_get_wtime();
    printf("\nfalse sharing (juntos):       %.4f s\n", t3 - t2);

    double t4 = omp_get_wtime();
    #pragma omp parallel num_threads(nthreads)
    {
        int id = omp_get_thread_num();
        for (long i = id; i < N; i += nthreads)
            contadores_separados[id].valor++;
    }
    double t5 = omp_get_wtime();
    printf("sem false sharing (separados): %.4f s\n", t5 - t4);

    /* 4. Escalonamento: trabalho desigual por iteração pede schedule(dynamic). */
    double total = 0.0;
    #pragma omp parallel for reduction(+:total) schedule(dynamic, 1000)
    for (long i = 0; i < N / 10; i++) {
        double s = 0.0;
        for (long k = 0; k < i % 1000; k++)  /* custo varia de 0 a 999 */
            s += 1e-9 * k;
        total += s;
    }
    printf("\nescalonamento dinamico: total = %.6f\n", total);

    free(x);
    return 0;
}
