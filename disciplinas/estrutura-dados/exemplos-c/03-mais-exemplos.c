/*
 * Mais exemplos de matrizes: somas por linha e coluna, busca em matriz
 * ordenada, matriz identidade e contagem de caminhos em grade.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 03-mais-exemplos.c -o mais
 */
#include <stdio.h>

#define L 4
#define C 5

/* [ex-a] Soma de cada linha e de cada coluna em uma passagem: O(L·C) */
static void somas(const int m[L][C], long linhas[L], long colunas[C]) {
    for (int i = 0; i < L; i++) linhas[i] = 0;
    for (int j = 0; j < C; j++) colunas[j] = 0;
    for (int i = 0; i < L; i++)
        for (int j = 0; j < C; j++) {
            linhas[i] += m[i][j];
            colunas[j] += m[i][j];
        }
}
/* [/ex-a] */

/* [ex-b] Matriz com linhas e colunas crescentes: começa no canto superior direito. O(L + C) */
static int existe_ordenada(const int m[L][C], int alvo) {
    int i = 0, j = C - 1;
    while (i < L && j >= 0) {
        if (m[i][j] == alvo) return 1;
        if (m[i][j] > alvo) j--;      /* a coluna inteira é maior: descarta */
        else i++;                     /* a linha inteira é menor: descarta */
    }
    return 0;
}
/* [/ex-b] */

/* [ex-c] Verifica se uma matriz quadrada é a identidade. O(n²) no pior caso */
static int e_identidade(const int m[L][L]) {
    for (int i = 0; i < L; i++)
        for (int j = 0; j < L; j++)
            if (m[i][j] != (i == j)) return 0;
    return 1;
}
/* [/ex-c] */

/* [ex-d] Caminhos da origem ao canto em grade (só para a direita e para baixo).
 * Programação dinâmica sobre a própria matriz: O(L·C) de tempo e de espaço */
static long caminhos(int l, int c) {
    long dp[L][C];
    for (int i = 0; i < l; i++)
        for (int j = 0; j < c; j++) {
            if (i == 0 || j == 0) dp[i][j] = 1;
            else dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    return dp[l - 1][c - 1];
}
/* [/ex-d] */

int main(void) {
    const int m[L][C] = {
        {1, 2, 3, 4, 5},
        {2, 4, 6, 8, 10},
        {3, 6, 9, 12, 15},
        {4, 8, 12, 16, 20}
    };
    long lin[L], col[C];
    somas(m, lin, col);
    printf("somas por linha:");
    for (int i = 0; i < L; i++) printf(" %ld", lin[i]);
    printf("\nsomas por coluna:");
    for (int j = 0; j < C; j++) printf(" %ld", col[j]);
    printf("\n");

    printf("existe 12? %s; existe 7? %s\n",
           existe_ordenada(m, 12) ? "sim" : "não",
           existe_ordenada(m, 7) ? "sim" : "não");

    const int id[L][L] = {{1, 0, 0, 0}, {0, 1, 0, 0}, {0, 0, 1, 0}, {0, 0, 0, 1}};
    const int nao[L][L] = {{1, 0, 0, 0}, {0, 1, 0, 0}, {0, 0, 2, 0}, {0, 0, 0, 1}};
    printf("identidade? %s; %s\n", e_identidade(id) ? "sim" : "não",
           e_identidade(nao) ? "sim" : "não");

    printf("caminhos em grade 3x3: %ld; em 4x5: %ld\n", caminhos(3, 3), caminhos(4, 5));
    return 0;
}
