// Equação do calor 2D (Jacobi) em CUDA, com verificação contra a CPU.
// Compilar: nvcc -O2 -arch=sm_70 12-calor-2d.cu -o 12-calor-2d
#include <cuda_runtime.h>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <utility>

#define CHECK(chamada)                                                        \
    do {                                                                      \
        cudaError_t e_ = (chamada);                                           \
        if (e_ != cudaSuccess) {                                              \
            fprintf(stderr, "erro CUDA %s em %s:%d\n",                        \
                    cudaGetErrorString(e_), __FILE__, __LINE__);              \
            exit(EXIT_FAILURE);                                               \
        }                                                                     \
    } while (0)

// Um passo do stencil de 5 pontos: cada ponto interior é atualizado com seus vizinhos.
// As bordas ficam fixas (Dirichlet), então a thread que cai nelas não faz nada.
__global__ void passo_calor(const float *u, float *v, int n, float alfa) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    if (x <= 0 || y <= 0 || x >= n - 1 || y >= n - 1) return;
    int i = y * n + x;
    v[i] = u[i] + alfa * (u[i - 1] + u[i + 1] + u[i - n] + u[i + n] - 4.0f * u[i]);
}

// Mesmo passo na CPU, usado como referência.
static void passo_cpu(const float *u, float *v, int n, float alfa) {
    for (int y = 1; y < n - 1; y++)
        for (int x = 1; x < n - 1; x++) {
            int i = y * n + x;
            v[i] = u[i] + alfa * (u[i - 1] + u[i + 1] + u[i - n] + u[i + n] - 4.0f * u[i]);
        }
}

int main() {
    const int n = 512;                 // malha n x n
    const int passos = 2000;
    const float alfa = 0.2f;           // estável para alfa <= 0.25 em 2D
    const size_t bytes = (size_t)n * n * sizeof(float);

    // Condição inicial: borda superior quente (1.0), resto frio (0.0).
    float *u = (float *)calloc((size_t)n * n, sizeof(float));
    float *w = (float *)calloc((size_t)n * n, sizeof(float));
    for (int x = 0; x < n; x++) u[x] = w[x] = 1.0f;   // primeira linha: borda quente

    // Referência em CPU (ping-pong entre u e w).
    float *cpu_a = (float *)malloc(bytes), *cpu_b = (float *)malloc(bytes);
    for (size_t i = 0; i < (size_t)n * n; i++) cpu_a[i] = cpu_b[i] = u[i];   // bordas iguais nos dois
    for (int p = 0; p < passos; p++) {
        passo_cpu(cpu_a, cpu_b, n, alfa);
        std::swap(cpu_a, cpu_b);
    }

    // GPU: dois buffers, trocados a cada passo (ping-pong).
    float *da, *db;
    CHECK(cudaMalloc(&da, bytes));
    CHECK(cudaMalloc(&db, bytes));
    CHECK(cudaMemcpy(da, u, bytes, cudaMemcpyHostToDevice));
    CHECK(cudaMemcpy(db, w, bytes, cudaMemcpyHostToDevice));   // mesma borda nos dois buffers

    dim3 bloco(16, 16);
    dim3 grade((n + 15) / 16, (n + 15) / 16);
    cudaEvent_t ini, fim;
    CHECK(cudaEventCreate(&ini));
    CHECK(cudaEventCreate(&fim));
    CHECK(cudaEventRecord(ini));
    for (int p = 0; p < passos; p++) {
        passo_calor<<<grade, bloco>>>(da, db, n, alfa);
        CHECK(cudaGetLastError());
        std::swap(da, db);             // o resultado do passo vira a entrada do próximo
    }
    CHECK(cudaEventRecord(fim));
    CHECK(cudaEventSynchronize(fim));
    float ms = 0.0f;
    CHECK(cudaEventElapsedTime(&ms, ini, fim));

    float *resultado = (float *)malloc(bytes);
    CHECK(cudaMemcpy(resultado, da, bytes, cudaMemcpyDeviceToHost));
    double erro = 0.0;
    for (size_t i = 0; i < (size_t)n * n; i++) {
        double e = fabs((double)resultado[i] - (double)cpu_a[i]);
        if (e > erro) erro = e;
    }

    // Cerca de 7 operações de ponto flutuante por ponto interior e por passo:
    // 3 somas para os vizinhos, 1 multiplicação e 1 subtração no centro, 1 multiplicação por alfa e 1 soma.
    double flops = 7.0 * (n - 2) * (n - 2) * (double)passos;
    printf("malha %d x %d, %d passos, alfa = %.2f\n", n, n, passos, alfa);
    printf("GPU: %.3f ms, %.1f GFLOP/s\n", ms, flops / (ms * 1e-3) / 1e9);
    printf("diferenca maxima GPU x CPU: %g\n", erro);

    CHECK(cudaEventDestroy(ini));
    CHECK(cudaEventDestroy(fim));
    CHECK(cudaFree(da));
    CHECK(cudaFree(db));
    free(u); free(w); free(cpu_a); free(cpu_b); free(resultado);
    return 0;
}
