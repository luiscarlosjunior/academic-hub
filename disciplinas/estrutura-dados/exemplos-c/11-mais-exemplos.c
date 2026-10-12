/*
 * Mais exemplos de padrões: água presa entre barras (dois ponteiros),
 * menor janela com todos os caracteres (janela deslizante), subsequência
 * crescente mais longa (programação dinâmica) e oito rainhas em 6×6 (backtracking).
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 11-mais-exemplos.c -o mais
 */
#include <stdio.h>
#include <string.h>

/* [ex-a] Água presa entre barras: dois ponteiros com o máximo à esquerda e à direita. O(n), O(1) */
static long agua_presa(const int h[], int n) {
    if (n < 3) return 0;
    int lo = 0, hi = n - 1, mesq = 0, mdir = 0;
    long total = 0;
    while (lo < hi) {
        if (h[lo] < h[hi]) {
            if (h[lo] >= mesq) mesq = h[lo];
            else total += mesq - h[lo];
            lo++;
        } else {
            if (h[hi] >= mdir) mdir = h[hi];
            else total += mdir - h[hi];
            hi--;
        }
    }
    return total;
}
/* [/ex-a] */

/* [ex-b] Menor janela de s que contém todos os caracteres de t: janela deslizante com contagens */
static int menor_janela(const char *s, const char *t, int *ini_out) {
    int need[256] = {0}, have[256] = {0};
    int faltam = 0;
    for (const char *p = t; *p; p++) {
        if (need[(unsigned char)*p] == 0) faltam++;
        need[(unsigned char)*p]++;
    }
    int n = (int)strlen(s), melhor = n + 1, ini = 0, esq = 0, formados = 0;
    for (int dir = 0; dir < n; dir++) {
        unsigned char c = (unsigned char)s[dir];
        have[c]++;
        if (need[c] > 0 && have[c] == need[c]) formados++;
        while (formados == faltam) {
            if (dir - esq + 1 < melhor) { melhor = dir - esq + 1; ini = esq; }
            unsigned char e = (unsigned char)s[esq++];
            if (need[e] > 0 && have[e] == need[e]) formados--;
            have[e]--;
        }
    }
    *ini_out = ini;
    return melhor <= n ? melhor : 0;
}
/* [/ex-b] */

/* [ex-c] Maior subsequência crescente em O(n²) por programação dinâmica */
static int lis(const int a[], int n) {
    int dp[64], melhor = 0;
    for (int i = 0; i < n; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++)
            if (a[j] < a[i] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;
        if (dp[i] > melhor) melhor = dp[i];
    }
    return melhor;
}
/* [/ex-c] */

/* [ex-d] Rainhas: conta as soluções em tabuleiro n×n por backtracking com poda por colunas e diagonais */
static int ataca(const int col[], int linha, int c) {
    for (int r = 0; r < linha; r++)
        if (col[r] == c || col[r] - c == r - linha || col[r] - c == linha - r) return 1;
    return 0;
}

static long rainhas(int n, int linha, int col[]) {
    if (linha == n) return 1;
    long total = 0;
    for (int c = 0; c < n; c++) {
        if (ataca(col, linha, c)) continue;          /* poda: a posição é inválida */
        col[linha] = c;
        total += rainhas(n, linha + 1, col);
    }
    return total;
}
/* [/ex-d] */

int main(void) {
    const int h[] = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};
    printf("água presa: %ld unidades\n", agua_presa(h, 12));

    const char *texto = "ADOBECODEBANC";
    int ini = 0;
    int len = menor_janela(texto, "ABC", &ini);
    printf("menor janela de \"ABC\" em \"%s\": \"%.*s\" (%d)\n", texto, len, texto + ini, len);

    const int seq[] = {10, 9, 2, 5, 3, 7, 101, 18};
    printf("subsequência crescente mais longa: %d\n", lis(seq, 8));

    int col[8];
    printf("soluções das 6 rainhas: %ld\n", rainhas(6, 0, col));
    printf("soluções das 8 rainhas: %ld\n", rainhas(8, 0, col));
    return 0;
}
