// Primeiro kernel CUDA: soma de vetores com checagem de erros e medição por eventos.
// Compilar: nvcc -O2 -arch=sm_70 07-vetor-add.cu -o 07-vetor-add
#include <cuda_runtime.h>
#include <cmath>
#include <cstdio>
#include <cstdlib>

// Checa o retorno de cada chamada da API: sem isso, um erro passa em silêncio.
#define CHECK(chamada)                                                        \
    do {                                                                      \
        cudaError_t e_ = (chamada);                                           \
        if (e_ != cudaSuccess) {                                              \
            fprintf(stderr, "erro CUDA %s em %s:%d\n",                        \
                    cudaGetErrorString(e_), __FILE__, __LINE__);              \
            exit(EXIT_FAILURE);                                               \
        }                                                                     \
    } while (0)

// Cada thread calcula um elemento. O índice global combina bloco e thread.
__global__ void soma_vetores(const float *a, const float *b, float *c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n)                       // o último bloco pode ter threads além de n
        c[i] = a[i] + b[i];
}

int main() {
    const int n = 1 << 24;           // 16 Mi elementos
    const size_t bytes = (size_t)n * sizeof(float);

    float *ha = (float *)malloc(bytes);
    float *hb = (float *)malloc(bytes);
    float *hc = (float *)malloc(bytes);
    for (int i = 0; i < n; i++) {
        ha[i] = (float)(i % 1000);
        hb[i] = (float)((2 * i) % 1000);
    }

    float *da, *db, *dc;
    CHECK(cudaMalloc(&da, bytes));
    CHECK(cudaMalloc(&db, bytes));
    CHECK(cudaMalloc(&dc, bytes));
    CHECK(cudaMemcpy(da, ha, bytes, cudaMemcpyHostToDevice));
    CHECK(cudaMemcpy(db, hb, bytes, cudaMemcpyHostToDevice));

    const int threads = 256;                           // múltiplo de 32 (tamanho do warp)
    const int blocos = (n + threads - 1) / threads;    // arredonda para cima

    cudaEvent_t ini, fim;
    CHECK(cudaEventCreate(&ini));
    CHECK(cudaEventCreate(&fim));

    CHECK(cudaEventRecord(ini));
    soma_vetores<<<blocos, threads>>>(da, db, dc, n);
    CHECK(cudaGetLastError());       // erro de lançamento (configuração inválida)
    CHECK(cudaEventRecord(fim));
    CHECK(cudaEventSynchronize(fim));

    float ms = 0.0f;
    CHECK(cudaEventElapsedTime(&ms, ini, fim));
    CHECK(cudaMemcpy(hc, dc, bytes, cudaMemcpyDeviceToHost));

    double erro = 0.0;
    for (int i = 0; i < n; i++) {
        double e = fabs((double)hc[i] - ((double)ha[i] + (double)hb[i]));
        if (e > erro) erro = e;
    }
    // 3 acessos por elemento (2 leituras e 1 escrita) de 4 bytes cada
    double gbs = 3.0 * bytes / (ms * 1e-3) / 1e9;
    printf("n = %d, blocos = %d x %d threads\n", n, blocos, threads);
    printf("kernel: %.3f ms, %.1f GB/s efetivos, erro max = %g\n", ms, gbs, erro);

    CHECK(cudaEventDestroy(ini));
    CHECK(cudaEventDestroy(fim));
    CHECK(cudaFree(da));
    CHECK(cudaFree(db));
    CHECK(cudaFree(dc));
    free(ha); free(hb); free(hc);
    return 0;
}
