// Multi-GPU com MPI: uma GPU por processo, halos trocados entre dispositivos.
// Compilar: nvcc -O2 -arch=sm_70 13-multi-gpu-mpi-cuda.cu -o 13-multi-gpu -ccbin mpicxx
// Executar: mpirun -np 4 ./13-multi-gpu
#include <cuda_runtime.h>
#include <mpi.h>
#include <cstdio>
#include <cstdlib>

#define CHECK(chamada)                                                        \
    do {                                                                      \
        cudaError_t e_ = (chamada);                                           \
        if (e_ != cudaSuccess) {                                              \
            fprintf(stderr, "erro CUDA %s em %s:%d\n",                        \
                    cudaGetErrorString(e_), __FILE__, __LINE__);              \
            MPI_Abort(MPI_COMM_WORLD, 1);                                     \
        }                                                                     \
    } while (0)

#define N_GLOBAL (1 << 24)   // células do domínio inteiro (1D)
#define PASSOS   500
#define ALFA     0.4f

// Passo 1D: u tem n + 2 posições. Índices 1..n são do processo; 0 e n+1 são halos.
__global__ void passo(const float *u, float *v, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x + 1;
    if (i <= n)
        v[i] = u[i] + ALFA * (u[i - 1] - 2.0f * u[i] + u[i + 1]);
}

int main(int argc, char **argv) {
    MPI_Init(&argc, &argv);
    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    // Cada processo usa uma GPU. Com 4 GPUs por nó e 4 processos, cada um pega a sua.
    int ngpu = 0;
    CHECK(cudaGetDeviceCount(&ngpu));
    CHECK(cudaSetDevice(rank % ngpu));

    // Decomposição: as células que sobram vão para os primeiros processos.
    int base = N_GLOBAL / size, resto = N_GLOBAL % size;
    int n = base + (rank < resto ? 1 : 0);
    long inicio = (long)rank * base + (rank < resto ? rank : resto);

    // Condição inicial no host, copiada para a GPU. Halos ficam zerados (bordas do domínio).
    float *hu = (float *)calloc(n + 2, sizeof(float));
    for (int i = 1; i <= n; i++)
        hu[i] = (inicio + i - 1 == N_GLOBAL / 2) ? 1.0f : 0.0f;

    float *du, *dv;
    CHECK(cudaMalloc(&du, (n + 2) * sizeof(float)));
    CHECK(cudaMalloc(&dv, (n + 2) * sizeof(float)));
    CHECK(cudaMemcpy(du, hu, (n + 2) * sizeof(float), cudaMemcpyHostToDevice));
    CHECK(cudaMemset(dv, 0, (n + 2) * sizeof(float)));

    int esq = (rank > 0) ? rank - 1 : MPI_PROC_NULL;
    int dir = (rank < size - 1) ? rank + 1 : MPI_PROC_NULL;

    // Buffers de halo no host: 1 valor por lado. Versão simples: passa pelo host.
    // (Com MPI compatível com CUDA, os ponteiros de dispositivo vão direto para MPI.)
    float h_envia_esq = 0.0f, h_envia_dir = 0.0f;
    float h_recebe_esq = 0.0f, h_recebe_dir = 0.0f;   // zero se não houver vizinho

    int threads = 256;
    int blocos = (n + threads - 1) / threads;
    double t0 = MPI_Wtime();
    for (int t = 0; t < PASSOS; t++) {
        // 1. Copia as bordas da GPU para o host.
        CHECK(cudaMemcpy(&h_envia_esq, du + 1, sizeof(float), cudaMemcpyDeviceToHost));
        CHECK(cudaMemcpy(&h_envia_dir, du + n, sizeof(float), cudaMemcpyDeviceToHost));

        // 2. Troca de halos entre processos (mesma lógica do tópico 5).
        MPI_Sendrecv(&h_envia_esq, 1, MPI_FLOAT, esq, 0,
                     &h_recebe_dir, 1, MPI_FLOAT, dir, 0,
                     MPI_COMM_WORLD, MPI_STATUS_IGNORE);
        MPI_Sendrecv(&h_envia_dir, 1, MPI_FLOAT, dir, 1,
                     &h_recebe_esq, 1, MPI_FLOAT, esq, 1,
                     MPI_COMM_WORLD, MPI_STATUS_IGNORE);

        // 3. Copia os halos recebidos de volta para a GPU, só onde há vizinho.
        if (dir != MPI_PROC_NULL)
            CHECK(cudaMemcpy(du + n + 1, &h_recebe_dir, sizeof(float), cudaMemcpyHostToDevice));
        if (esq != MPI_PROC_NULL)
            CHECK(cudaMemcpy(du + 0, &h_recebe_esq, sizeof(float), cudaMemcpyHostToDevice));

        // 4. Passo local na GPU.
        passo<<<blocos, threads>>>(du, dv, n);
        CHECK(cudaGetLastError());
        float *tmp = du; du = dv; dv = tmp;
    }
    CHECK(cudaDeviceSynchronize());
    double t1 = MPI_Wtime();

    // Soma local (copia o domínio de volta) e redução global.
    CHECK(cudaMemcpy(hu, du, (n + 2) * sizeof(float), cudaMemcpyDeviceToHost));
    double local = 0.0, total = 0.0;
    for (int i = 1; i <= n; i++) local += hu[i];
    MPI_Allreduce(&local, &total, 1, MPI_DOUBLE, MPI_SUM, MPI_COMM_WORLD);

    if (rank == 0)
        printf("GPUs = %d (por processo), processos = %d, passos = %d, soma = %.6f, tempo = %.3f s\n",
               ngpu, size, PASSOS, total, t1 - t0);

    cudaFree(du); cudaFree(dv);
    free(hu);
    MPI_Finalize();
    return 0;
}
