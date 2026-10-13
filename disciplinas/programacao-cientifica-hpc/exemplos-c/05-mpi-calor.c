/* Equação do calor 1D com decomposição de domínio e troca de halos em MPI.
   Compilar: mpicc -O2 -std=c11 05-mpi-calor.c -o 05-mpi-calor
   Executar: mpirun -np 4 ./05-mpi-calor                                 */
#include <mpi.h>
#include <stdio.h>
#include <stdlib.h>

#define N_GLOBAL 1000000   /* células do domínio inteiro */
#define PASSOS   1000
#define ALFA     0.4       /* estável para ALFA <= 0.5 */

int main(int argc, char **argv) {
    MPI_Init(&argc, &argv);
    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    /* Decomposição: cada processo recebe n células; as que sobram vão para os primeiros ranks. */
    int base = N_GLOBAL / size, resto = N_GLOBAL % size;
    int n = base + (rank < resto ? 1 : 0);
    long inicio = (long)rank * base + (rank < resto ? rank : resto);

    /* Vetores com duas células fantasmas: u[0] e u[n+1] guardam os vizinhos. */
    double *u = calloc(n + 2, sizeof *u);
    double *v = calloc(n + 2, sizeof *v);
    if (!u || !v) MPI_Abort(MPI_COMM_WORLD, 1);
    for (int i = 1; i <= n; i++)
        u[i] = (inicio + i - 1 == N_GLOBAL / 2) ? 1.0 : 0.0;   /* pico de calor no centro */

    int esq = (rank > 0) ? rank - 1 : MPI_PROC_NULL;           /* MPI_PROC_NULL: nenhum vizinho */
    int dir = (rank < size - 1) ? rank + 1 : MPI_PROC_NULL;

    double t0 = MPI_Wtime();
    for (int t = 0; t < PASSOS; t++) {
        /* Troca de halos: cada processo envia sua borda e recebe a do vizinho. */
        MPI_Sendrecv(&u[1], 1, MPI_DOUBLE, esq, 0,
                     &u[n + 1], 1, MPI_DOUBLE, dir, 0,
                     MPI_COMM_WORLD, MPI_STATUS_IGNORE);
        MPI_Sendrecv(&u[n], 1, MPI_DOUBLE, dir, 1,
                     &u[0], 1, MPI_DOUBLE, esq, 1,
                     MPI_COMM_WORLD, MPI_STATUS_IGNORE);

        /* Passo local: só usa dados do próprio processo e dos halos. */
        for (int i = 1; i <= n; i++)
            v[i] = u[i] + ALFA * (u[i - 1] - 2.0 * u[i] + u[i + 1]);

        double *tmp = u; u = v; v = tmp;
    }
    double t1 = MPI_Wtime();

    /* Redução global: soma de todas as células do domínio. */
    double local = 0.0, total = 0.0;
    for (int i = 1; i <= n; i++)
        local += u[i];
    MPI_Allreduce(&local, &total, 1, MPI_DOUBLE, MPI_SUM, MPI_COMM_WORLD);

    if (rank == 0)
        printf("processos = %d, passos = %d, soma = %.10f, tempo = %.4f s\n",
               size, PASSOS, total, t1 - t0);

    free(u); free(v);
    MPI_Finalize();
    return 0;
}
