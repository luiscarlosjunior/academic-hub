/*
 * Mais exemplos de busca: busca em matriz achatada, menor prefixo com soma
 * mínima, contagem com limites e máximo de função unimodal.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 05-mais-exemplos.c -o mais
 */
#include <stdio.h>

/* [ex-a] Matriz ordenada linha a linha é um vetor ordenado: busca binária sobre a posição linear */
static int busca_matriz(int l, int c, const int m[][4], int alvo) {
    int lo = 0, hi = l * c - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int v = m[mid / c][mid % c];
        if (v == alvo) return 1;
        if (v < alvo) lo = mid + 1;
        else hi = mid - 1;
    }
    return 0;
}
/* [/ex-a] */

/* [ex-b] Menor k tal que a soma dos k primeiros valores positivos é ≥ alvo: busca sobre a resposta */
static int menor_prefixo(const int a[], int n, long alvo) {
    long p[64];
    p[0] = 0;
    for (int i = 0; i < n; i++) p[i + 1] = p[i] + a[i];
    int lo = 1, hi = n, resp = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (p[mid] >= alvo) { resp = mid; hi = mid - 1; }
        else lo = mid + 1;
    }
    return resp;
}
/* [/ex-b] */

/* [ex-c] Quantidade de ocorrências com limites inferior e superior */
static int primeiro_maior_igual(const int a[], int n, int x) {
    int lo = 0, hi = n;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

static int contar(const int a[], int n, int x) {
    return primeiro_maior_igual(a, n, x + 1) - primeiro_maior_igual(a, n, x);
}
/* [/ex-c] */

/* [ex-d] Busca ternária: máximo de uma função que sobe e depois desce */
static double f(double x) { return -(x - 3.0) * (x - 3.0) + 10.0; }

static double maximo_unimodal(double lo, double hi, int passos) {
    for (int k = 0; k < passos; k++) {
        double m1 = lo + (hi - lo) / 3.0, m2 = hi - (hi - lo) / 3.0;
        if (f(m1) < f(m2)) lo = m1;
        else hi = m2;
    }
    return (lo + hi) / 2.0;
}
/* [/ex-d] */

int main(void) {
    const int m[][4] = {{1, 3, 5, 7}, {8, 10, 12, 14}, {15, 17, 19, 21}};
    printf("busca 12 em matriz 3x4: %s\n", busca_matriz(3, 4, m, 12) ? "achou" : "não");
    printf("busca 13 em matriz 3x4: %s\n", busca_matriz(3, 4, m, 13) ? "achou" : "não");

    const int pos[] = {2, 4, 1, 5, 3};
    printf("menor prefixo com soma >= 10: %d elementos\n", menor_prefixo(pos, 5, 10));
    printf("menor prefixo com soma >= 100: %d\n", menor_prefixo(pos, 5, 100));

    const int rep[] = {1, 2, 2, 2, 3, 5, 5, 8};
    printf("ocorrências de 2: %d; de 5: %d; de 4: %d\n",
           contar(rep, 8, 2), contar(rep, 8, 5), contar(rep, 8, 4));

    printf("máximo de f(x) = -(x-3)^2 + 10 em [0, 10]: x = %.4f\n", maximo_unimodal(0.0, 10.0, 60));
    return 0;
}
