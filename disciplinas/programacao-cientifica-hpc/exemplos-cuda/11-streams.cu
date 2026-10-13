// Sobreposição de transferências e computação com streams e memória pinned.
// Compilar: nvcc -O2 -arch=sm_70 11-streams.cu -o 11-streams
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

// Trabalho por elemento: raiz, multiplicação e soma. Intensidade moderada.
__global__ void transforma(const float *x, float *y, int m) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < m) y[i] = sqrtf(x[i]) * 2.0f + 1.0f;
}

int main() {
    const int n = 1 << 25;                   // 32 Mi floats = 128 MB
    const int fatias = 8;                    // a entrada é processada em 8 pedaços
    const int m = n / fatias;
    const size_t bytes = (size_t)n * sizeof(float);
    const int threads = 256;

    // Memória pinned (página fixa): necessária para cópias assíncronas de verdade.
    float *hin, *hout_seq, *hout_str;
    CHECK(cudaMallocHost(&hin, bytes));
    CHECK(cudaMallocHost(&hout_seq, bytes));
    CHECK(cudaMallocHost(&hout_str, bytes));
    for (int i = 0; i < n; i++) hin[i] = (float)(i % 100);

    float *din, *dout;
    CHECK(cudaMalloc(&din, bytes));
    CHECK(cudaMalloc(&dout, bytes));

    cudaEvent_t ini, fim;
    CHECK(cudaEventCreate(&ini));
    CHECK(cudaEventCreate(&fim));

    // --- Versão sequencial: copia tudo, processa tudo, copia tudo de volta ---
    CHECK(cudaEventRecord(ini));
    CHECK(cudaMemcpy(din, hin, bytes, cudaMemcpyHostToDevice));
    transforma<<<(n + threads - 1) / threads, threads>>>(din, dout, n);
    CHECK(cudaGetLastError());
    CHECK(cudaMemcpy(hout_seq, dout, bytes, cudaMemcpyDeviceToHost));
    CHECK(cudaEventRecord(fim));
    CHECK(cudaEventSynchronize(fim));
    float ms_seq = 0.0f;
    CHECK(cudaEventElapsedTime(&ms_seq, ini, fim));

    // --- Versão com streams: cada fatia usa seu stream (cópia, kernel, cópia) ---
    cudaStream_t fluxo[2];
    CHECK(cudaStreamCreate(&fluxo[0]));
    CHECK(cudaStreamCreate(&fluxo[1]));
    CHECK(cudaEventRecord(ini));
    for (int f = 0; f < fatias; f++) {
        cudaStream_t s = fluxo[f % 2];       // dois streams alternados
        size_t off = (size_t)f * m;
        size_t bf = (size_t)m * sizeof(float);
        CHECK(cudaMemcpyAsync(din + off, hin + off, bf, cudaMemcpyHostToDevice, s));
        transforma<<<(m + threads - 1) / threads, threads, 0, s>>>(din + off, dout + off, m);
        CHECK(cudaGetLastError());
        CHECK(cudaMemcpyAsync(hout_str + off, dout + off, bf, cudaMemcpyDeviceToHost, s));
    }
    CHECK(cudaEventRecord(fim));
    CHECK(cudaEventSynchronize(fim));
    float ms_str = 0.0f;
    CHECK(cudaEventElapsedTime(&ms_str, ini, fim));

    // Verificação: as duas versões devem produzir o mesmo resultado.
    double erro = 0.0;
    for (int i = 0; i < n; i++) {
        double e = fabs((double)hout_seq[i] - (double)hout_str[i]);
        if (e > erro) erro = e;
    }
    printf("sequencial: %8.3f ms\n", ms_seq);
    printf("streams:    %8.3f ms (%d fatias, 2 streams)\n", ms_str, fatias);
    printf("diferenca maxima entre as versoes: %g\n", erro);

    CHECK(cudaStreamDestroy(fluxo[0]));
    CHECK(cudaStreamDestroy(fluxo[1]));
    CHECK(cudaEventDestroy(ini));
    CHECK(cudaEventDestroy(fim));
    CHECK(cudaFreeHost(hin));
    CHECK(cudaFreeHost(hout_seq));
    CHECK(cudaFreeHost(hout_str));
    CHECK(cudaFree(din));
    CHECK(cudaFree(dout));
    return 0;
}
