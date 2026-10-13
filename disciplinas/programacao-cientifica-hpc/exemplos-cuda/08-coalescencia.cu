// Padrões de acesso à memória global: coalescência e transposição de matriz.
// Compilar: nvcc -O2 -arch=sm_70 08-coalescencia.cu -o 08-coalescencia
#include <cuda_runtime.h>
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

#define TILE 32

// Leitura coalescida: threads consecutivas de um warp leem endereços consecutivos.
__global__ void copia_linear(const float *in, float *out, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) out[i] = in[i];
}

// Leitura com passo (stride): cada thread salta 'passo' elementos. O warp espalha
// os acessos por várias linhas de memória, e a largura de banda efetiva cai.
__global__ void copia_passo(const float *in, float *out, int n, int passo) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) out[i] = in[((long long)i * passo) % n];
}

// Transposição ingênua: a leitura é coalescida, mas a escrita não (acesso por colunas).
__global__ void transposta_ingenua(const float *in, float *out, int n) {
    int x = blockIdx.x * TILE + threadIdx.x;
    int y = blockIdx.y * TILE + threadIdx.y;
    if (x < n && y < n)
        out[x * n + y] = in[y * n + x];
}

// Transposição com memória compartilhada. O bloco lê linhas (coalescido), guarda no
// tile, sincroniza, e escreve linhas do resultado (coalescido de novo).
// O 'tile[TILE][TILE + 1]' com uma coluna extra evita conflitos de banco ao ler por colunas.
__global__ void transposta_compartilhada(const float *in, float *out, int n) {
    __shared__ float tile[TILE][TILE + 1];
    int x = blockIdx.x * TILE + threadIdx.x;
    int y = blockIdx.y * TILE + threadIdx.y;
    if (x < n && y < n)
        tile[threadIdx.y][threadIdx.x] = in[y * n + x];
    __syncthreads();
    x = blockIdx.y * TILE + threadIdx.x;   // troca os índices de bloco
    y = blockIdx.x * TILE + threadIdx.y;
    if (x < n && y < n)
        out[y * n + x] = tile[threadIdx.x][threadIdx.y];
}

static float tempo_ms(cudaEvent_t a, cudaEvent_t b) {
    float ms = 0.0f;
    CHECK(cudaEventElapsedTime(&ms, a, b));
    return ms;
}

int main() {
    const int n = 1 << 24;                 // para as cópias: 16 Mi floats
    const size_t bytes = (size_t)n * sizeof(float);
    float *in, *out;
    CHECK(cudaMalloc(&in, bytes));
    CHECK(cudaMalloc(&out, bytes));
    CHECK(cudaMemset(in, 1, bytes));

    cudaEvent_t a, b;
    CHECK(cudaEventCreate(&a));
    CHECK(cudaEventCreate(&b));
    const int threads = 256;
    const int blocos = (n + threads - 1) / threads;

    printf("%-22s %10s %12s\n", "padrao de leitura", "ms", "GB/s efetivos");
    int passos[] = {1, 2, 4, 8, 32};
    for (int k = 0; k < 5; k++) {
        copia_passo<<<blocos, threads>>>(in, out, n, passos[k]);   // aquecimento
        CHECK(cudaEventRecord(a));
        copia_passo<<<blocos, threads>>>(in, out, n, passos[k]);
        CHECK(cudaEventRecord(b));
        CHECK(cudaEventSynchronize(b));
        float ms = tempo_ms(a, b);
        // 2 * bytes: uma leitura e uma escrita por elemento
        printf("passo = %-14d %10.3f %12.1f\n", passos[k], ms, 2.0 * bytes / (ms * 1e-3) / 1e9);
    }

    // Transposição: N x N floats, comparação entre ingênua e com memória compartilhada.
    const int N = 4096;
    const size_t nb = (size_t)N * N * sizeof(float);
    float *ma, *mb, *hm = (float *)malloc(nb), *hr = (float *)malloc(nb);
    CHECK(cudaMalloc(&ma, nb));
    CHECK(cudaMalloc(&mb, nb));
    for (int i = 0; i < N * N; i++) hm[i] = (float)i;
    CHECK(cudaMemcpy(ma, hm, nb, cudaMemcpyHostToDevice));

    dim3 bloco(TILE, TILE);
    dim3 grade((N + TILE - 1) / TILE, (N + TILE - 1) / TILE);

    transposta_ingenua<<<grade, bloco>>>(ma, mb, N);
    CHECK(cudaEventRecord(a));
    transposta_ingenua<<<grade, bloco>>>(ma, mb, N);
    CHECK(cudaEventRecord(b));
    CHECK(cudaEventSynchronize(b));
    printf("\ntransposicao ingenua:          %8.3f ms\n", tempo_ms(a, b));

    transposta_compartilhada<<<grade, bloco>>>(ma, mb, N);
    CHECK(cudaEventRecord(a));
    transposta_compartilhada<<<grade, bloco>>>(ma, mb, N);
    CHECK(cudaEventRecord(b));
    CHECK(cudaEventSynchronize(b));
    printf("transposicao com compartilhada: %8.3f ms\n", tempo_ms(a, b));

    // Verificação: a transposta de uma transposta é a matriz original.
    CHECK(cudaMemcpy(hr, mb, nb, cudaMemcpyDeviceToHost));
    int erros = 0;
    for (int y = 0; y < N; y++)
        for (int x = 0; x < N; x++)
            if (hr[(size_t)x * N + y] != hm[(size_t)y * N + x]) erros++;
    printf("erros na transposicao: %d\n", erros);

    CHECK(cudaEventDestroy(a));
    CHECK(cudaEventDestroy(b));
    CHECK(cudaFree(in)); CHECK(cudaFree(out));
    CHECK(cudaFree(ma)); CHECK(cudaFree(mb));
    free(hm); free(hr);
    return 0;
}
