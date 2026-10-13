// Multiplicação de matrizes em CUDA: versão ingênua e versão com tiling.
// Compilar: nvcc -O2 -arch=sm_70 10-matmul-tiling.cu -o 10-matmul-tiling
#include <cuda_runtime.h>
#include <cmath>
#include <cstdio>
#include <cstdlib>

#define CHECK(chamada)                                                        \
    do {                                                                      \
        cudaError_t e_ = (chamada);                                           \
        if (e_ != cudaSuccess) {                                              \
            fprintf(stderr, "erro CUDA %s em %s:%d\n",                        \
                    cudaGetErrorString(e_), __FILE__, __LINE__);              \
            exit(EXIT_FAILURE);                                               \
        }                                                                     \
    } while (0)

#define TILE 16   // bloco de TILE x TILE threads; cada tile é TILE x TILE floats

// Versão ingênua: cada thread calcula C[row][col] lendo A e B direto da memória global.
// Cada elemento de A e de B é lido N vezes por threads diferentes.
__global__ void matmul_ingenua(const float *A, const float *B, float *C, int N) {
    int col = blockIdx.x * blockDim.x + threadIdx.x;
    int row = blockIdx.y * blockDim.y + threadIdx.y;
    if (row < N && col < N) {
        float acc = 0.0f;
        for (int k = 0; k < N; k++)
            acc += A[row * N + k] * B[k * N + col];
        C[row * N + col] = acc;
    }
}

// Versão com tiling: o bloco carrega um tile de A e um de B na memória compartilhada,
// todas as threads usam esses dados, e só então se carrega o próximo par de tiles.
// Cada elemento da memória global é lido N / TILE vezes, e não N vezes.
__global__ void matmul_tiling(const float *A, const float *B, float *C, int N) {
    __shared__ float As[TILE][TILE];
    __shared__ float Bs[TILE][TILE];
    int row = blockIdx.y * TILE + threadIdx.y;
    int col = blockIdx.x * TILE + threadIdx.x;
    float acc = 0.0f;
    int fases = (N + TILE - 1) / TILE;
    for (int t = 0; t < fases; t++) {
        int a_col = t * TILE + threadIdx.x;   // coluna de A nesta fase
        int b_row = t * TILE + threadIdx.y;   // linha de B nesta fase
        As[threadIdx.y][threadIdx.x] = (row < N && a_col < N) ? A[row * N + a_col] : 0.0f;
        Bs[threadIdx.y][threadIdx.x] = (b_row < N && col < N) ? B[b_row * N + col] : 0.0f;
        __syncthreads();                      // tiles completos antes de usar
        for (int k = 0; k < TILE; k++)
            acc += As[threadIdx.y][k] * Bs[k][threadIdx.x];
        __syncthreads();                      // ninguém sobrescreve o tile ainda em uso
    }
    if (row < N && col < N)
        C[row * N + col] = acc;
}

int main() {
    // 1. Verificação contra a CPU em tamanho pequeno.
    const int Nv = 256;
    size_t bv = (size_t)Nv * Nv * sizeof(float);
    float *hA = (float *)malloc(bv), *hB = (float *)malloc(bv);
    float *hC = (float *)malloc(bv), *ref = (float *)malloc(bv);
    for (int i = 0; i < Nv * Nv; i++) {
        hA[i] = (float)((i * 7) % 11) * 0.1f;
        hB[i] = (float)((i * 3) % 13) * 0.1f;
    }
    for (int r = 0; r < Nv; r++)
        for (int c = 0; c < Nv; c++) {
            float acc = 0.0f;
            for (int k = 0; k < Nv; k++) acc += hA[r * Nv + k] * hB[k * Nv + c];
            ref[r * Nv + c] = acc;
        }

    float *dA, *dB, *dC;
    CHECK(cudaMalloc(&dA, bv)); CHECK(cudaMalloc(&dB, bv)); CHECK(cudaMalloc(&dC, bv));
    CHECK(cudaMemcpy(dA, hA, bv, cudaMemcpyHostToDevice));
    CHECK(cudaMemcpy(dB, hB, bv, cudaMemcpyHostToDevice));
    dim3 bloco(TILE, TILE);
    dim3 grade((Nv + TILE - 1) / TILE, (Nv + TILE - 1) / TILE);

    matmul_ingenua<<<grade, bloco>>>(dA, dB, dC, Nv);
    CHECK(cudaGetLastError());
    CHECK(cudaMemcpy(hC, dC, bv, cudaMemcpyDeviceToHost));
    double erro1 = 0.0;
    for (int i = 0; i < Nv * Nv; i++) erro1 = fmax(erro1, fabs(hC[i] - ref[i]));

    matmul_tiling<<<grade, bloco>>>(dA, dB, dC, Nv);
    CHECK(cudaGetLastError());
    CHECK(cudaMemcpy(hC, dC, bv, cudaMemcpyDeviceToHost));
    double erro2 = 0.0;
    for (int i = 0; i < Nv * Nv; i++) erro2 = fmax(erro2, fabs(hC[i] - ref[i]));
    printf("verificacao N=%d: erro ingenua = %g, erro tiling = %g\n", Nv, erro1, erro2);

    // 2. Medição em tamanho maior, com aquecimento e eventos.
    const int N = 4096;
    size_t bn = (size_t)N * N * sizeof(float);
    CHECK(cudaFree(dA)); CHECK(cudaFree(dB)); CHECK(cudaFree(dC));
    CHECK(cudaMalloc(&dA, bn)); CHECK(cudaMalloc(&dB, bn)); CHECK(cudaMalloc(&dC, bn));
    CHECK(cudaMemset(dA, 0, bn)); CHECK(cudaMemset(dB, 0, bn));
    dim3 grade2((N + TILE - 1) / TILE, (N + TILE - 1) / TILE);

    cudaEvent_t a, b;
    CHECK(cudaEventCreate(&a)); CHECK(cudaEventCreate(&b));
    double flops = 2.0 * N * N * (double)N;

    matmul_ingenua<<<grade2, bloco>>>(dA, dB, dC, N);            // aquecimento
    CHECK(cudaEventRecord(a));
    matmul_ingenua<<<grade2, bloco>>>(dA, dB, dC, N);
    CHECK(cudaEventRecord(b));
    CHECK(cudaEventSynchronize(b));
    float ms1 = 0.0f;
    CHECK(cudaEventElapsedTime(&ms1, a, b));

    matmul_tiling<<<grade2, bloco>>>(dA, dB, dC, N);             // aquecimento
    CHECK(cudaEventRecord(a));
    matmul_tiling<<<grade2, bloco>>>(dA, dB, dC, N);
    CHECK(cudaEventRecord(b));
    CHECK(cudaEventSynchronize(b));
    float ms2 = 0.0f;
    CHECK(cudaEventElapsedTime(&ms2, a, b));

    printf("N = %d\n", N);
    printf("ingenua: %9.2f ms  %8.1f GFLOP/s\n", ms1, flops / (ms1 * 1e-3) / 1e9);
    printf("tiling:  %9.2f ms  %8.1f GFLOP/s\n", ms2, flops / (ms2 * 1e-3) / 1e9);

    CHECK(cudaEventDestroy(a)); CHECK(cudaEventDestroy(b));
    CHECK(cudaFree(dA)); CHECK(cudaFree(dB)); CHECK(cudaFree(dC));
    free(hA); free(hB); free(hC); free(ref);
    return 0;
}
