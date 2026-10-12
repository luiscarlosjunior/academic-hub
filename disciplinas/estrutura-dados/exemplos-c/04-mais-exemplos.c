/*
 * Mais exemplos de ordenação: ordenação por chave composta, maior lacuna
 * entre vizinhos, maior número por concatenação e ordenação de caracteres.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 04-mais-exemplos.c -o mais
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char nome[16];
    int idade;
} Pessoa;

/* [ex-a] Ordenação por idade e, em caso de empate, por nome: insertion sort é estável */
static void ordenar_pessoas(Pessoa p[], size_t n) {
    for (size_t i = 1; i < n; i++) {
        Pessoa chave = p[i];
        size_t j = i;
        while (j > 0) {
            int menor = p[j - 1].idade > chave.idade ||
                        (p[j - 1].idade == chave.idade && strcmp(p[j - 1].nome, chave.nome) > 0);
            if (!menor) break;
            p[j] = p[j - 1];
            j--;
        }
        p[j] = chave;
    }
}
/* [/ex-a] */

/* [ex-b] Maior diferença entre vizinhos depois de ordenar: O(n log n) */
static int cmp_int(const void *x, const void *y) {
    int a = *(const int *)x, b = *(const int *)y;
    return (a > b) - (a < b);
}

static int maior_lacuna(int a[], size_t n) {
    if (n < 2) return 0;
    qsort(a, n, sizeof *a, cmp_int);
    int melhor = 0;
    for (size_t i = 1; i < n; i++)
        if (a[i] - a[i - 1] > melhor) melhor = a[i] - a[i - 1];
    return melhor;
}
/* [/ex-b] */

/* [ex-c] Maior número formado pela concatenação dos inteiros: ordena por "ab" versus "ba" */
static int cmp_concat(const void *x, const void *y) {
    const char *a = *(const char *const *)x, *b = *(const char *const *)y;
    char ab[32], ba[32];
    snprintf(ab, sizeof ab, "%s%s", a, b);
    snprintf(ba, sizeof ba, "%s%s", b, a);
    return strcmp(ba, ab);        /* o que começa com o maior prefixo vem antes */
}

static void maior_numero(const char *partes[], size_t n, char saida[]) {
    qsort(partes, n, sizeof *partes, cmp_concat);
    saida[0] = '\0';
    for (size_t i = 0; i < n; i++) strcat(saida, partes[i]);
}
/* [/ex-c] */

/* [ex-d] Ordenação por contagem de caracteres: O(n + 256) */
static void ordenar_letras(char s[], size_t n) {
    size_t freq[256] = {0};
    for (size_t i = 0; i < n; i++) freq[(unsigned char)s[i]]++;
    size_t pos = 0;
    for (int c = 0; c < 256; c++)
        for (size_t k = 0; k < freq[c]; k++) s[pos++] = (char)c;
}
/* [/ex-d] */

int main(void) {
    Pessoa p[] = {{"Bia", 30}, {"Ana", 25}, {"Caio", 30}, {"Dani", 25}};
    ordenar_pessoas(p, 4);
    printf("por idade e nome:");
    for (int i = 0; i < 4; i++) printf(" %s(%d)", p[i].nome, p[i].idade);
    printf("\n");

    int v[] = {10, 3, 22, 7, 15};
    printf("maior lacuna entre vizinhos: %d\n", maior_lacuna(v, 5));

    const char *partes[] = {"3", "30", "34", "5", "9"};
    char saida[64];
    maior_numero(partes, 5, saida);
    printf("maior número concatenado: %s\n", saida);

    char letras[] = "estrutura";
    ordenar_letras(letras, strlen(letras));
    printf("letras ordenadas: %s\n", letras);
    return 0;
}
