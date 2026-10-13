// Padrões paralelos: redução em árvore, scan por bloco e histograma com atomicAdd.
// Compilar: nvcc -O2 -arch=sm_70 09-reducao-scan.cu -o 09-reducao-scan
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

#define BLOCO 256   // tamanho do bloco: potência de 2, exigida pela redução em árvore

// Redução em árvore: cada bloco soma seus BLOCO elementos na memória compartilhada.
// Cada passo do laço dobra a distância entre pares somados: log2(BLOCO) passos.
__global__ void soma_parcial(const float *x, float *parcial, int n) {
    __shared__ float cache[BLOCO];
    int tid = threadIdx.x;
    int i = blockIdx.x * blockDim.x + tid;
    cache[tid] = (i < n) ? x[i] : 0.0f;
    __syncthreads();
    for (int s = blockDim.x / 2; s > 0; s >>= 1) {
        if (tid < s)
            cache[tid] += cache[tid + s];
        __syncthreads();              // todas as threads terminam o passo antes do próximo
    }
    if (tid == 0)
        parcial[blockIdx.x] = cache[0];
}

// Scan inclusivo por bloco (Hillis-Steele): prefixo[i] = x[0] + ... + x[i] dentro do bloco.
// Dois __syncthreads por passo: um antes de ler os vizinhos e outro antes de escrever.
__global__ void scan_por_bloco(const int *in, int *out, int n) {
    __shared__ int temp[BLOCO];
    int tid = threadIdx.x;
    int i = blockIdx.x * blockDim.x + tid;
    temp[tid] = (i < n) ? in[i] : 0;
    __syncthreads();
    for (int deslocamento = 1; deslocamento < blockDim.x; deslocamento <<= 1) {
        int v = (tid >= deslocamento) ? temp[tid - deslocamento] : 0;
        __syncthreads();              // todos leram antes de qualquer escrita
        temp[tid] += v;
        __syncthreads();
    }
    if (i < n)
        out[i] = temp[tid];
}

// Histograma: várias threads podem cair no mesmo bin ao mesmo tempo. atomicAdd
// garante que nenhuma contagem se perca. O laço de passo (grid-stride) cobre n
// elementos com qualquer tamanho de grade.
__global__ void histograma(const unsigned char *x, unsigned int *bins, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    int passo = blockDim.x * gridDim.x;
    for (; i < n; i += passo)
        atomicAdd(&bins[x[i]], 1u);
}

int main() {
    const int n = 1 << 22;                       // 4 Mi elementos
    const int blocos = (n + BLOCO - 1) / BLOCO;

    // --- Redução: soma de n floats com 1.0, resultado esperado = n ---
    float *hx = (float *)malloc(n * sizeof(float));
    for (int i = 0; i < n; i++) hx[i] = 1.0f;
    float *dx, *dparcial;
    CHECK(cudaMalloc(&dx, n * sizeof(float)));
    CHECK(cudaMalloc(&dparcial, blocos * sizeof(float)));
    CHECK(cudaMemcpy(dx, hx, n * sizeof(float), cudaMemcpyHostToDevice));

    soma_parcial<<<blocos, BLOCO>>>(dx, dparcial, n);
    CHECK(cudaGetLastError());
    float *hparcial = (float *)malloc(blocos * sizeof(float));
    CHECK(cudaMemcpy(hparcial, dparcial, blocos * sizeof(float), cudaMemcpyDeviceToHost));
    double total = 0.0;                          // a última etapa é feita na CPU (poucos valores)
    for (int b = 0; b < blocos; b++) total += hparcial[b];
    printf("reducao: soma = %.1f (esperado %d)\n", total, n);

    // --- Scan: prefixo por bloco; verificamos o primeiro bloco na CPU ---
    int *hs = (int *)malloc(n * sizeof(int)), *hso = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) hs[i] = i % 7;
    int *ds, *dso;
    CHECK(cudaMalloc(&ds, n * sizeof(int)));
    CHECK(cudaMalloc(&dso, n * sizeof(int)));
    CHECK(cudaMemcpy(ds, hs, n * sizeof(int), cudaMemcpyHostToDevice));
    scan_por_bloco<<<blocos, BLOCO>>>(ds, dso, n);
    CHECK(cudaGetLastError());
    CHECK(cudaMemcpy(hso, dso, n * sizeof(int), cudaMemcpyDeviceToHost));
    int erros = 0, acum = 0;
    for (int i = 0; i < BLOCO; i++) {
        acum += hs[i];
        if (hso[i] != acum) erros++;
    }
    printf("scan (primeiro bloco): erros = %d\n", erros);

    // --- Histograma de bytes (256 bins) com atomicAdd ---
    unsigned char *hb = (unsigned char *)malloc(n);
    for (int i = 0; i < n; i++) hb[i] = (unsigned char)((i * 31u + 7u) % 256u);
    unsigned char *db;
    unsigned int *dbins;
    CHECK(cudaMalloc(&db, n));
    CHECK(cudaMalloc(&dbins, 256 * sizeof(unsigned int)));
    CHECK(cudaMemset(dbins, 0, 256 * sizeof(unsigned int)));
    CHECK(cudaMemcpy(db, hb, n, cudaMemcpyHostToDevice));
    histograma<<<256, BLOCO>>>(db, dbins, n);
    CHECK(cudaGetLastError());
    unsigned int hbins[256];
    CHECK(cudaMemcpy(hbins, dbins, sizeof hbins, cudaMemcpyDeviceToHost));
    unsigned long long soma_bins = 0;
    for (int k = 0; k < 256; k++) soma_bins += hbins[k];
    printf("histograma: soma dos bins = %llu (esperado %d)\n", soma_bins, n);

    cudaFree(dx); cudaFree(dparcial); cudaFree(ds); cudaFree(dso); cudaFree(db); cudaFree(dbins);
    free(hx); free(hparcial); free(hs); free(hso); free(hb);
    return 0;
}
