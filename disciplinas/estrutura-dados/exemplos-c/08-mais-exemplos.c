/*
 * Mais exemplos de tabelas hash: subvetor de soma zero, elemento mais
 * frequente, primeiro caractere não repetido e agrupamento de anagramas.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 08-mais-exemplos.c -o mais
 */
#include <stdio.h>
#include <string.h>

#define M 64

/* Tabela de prefixos: chave = valor do prefixo, valor = primeira posição vista */
typedef struct {
    long chave[M];
    int val[M];
    int usado[M];
} Tab;

static unsigned idx(long k) { return (unsigned)((k % M + M) % M); }

static int buscar(const Tab *t, long k, int *v) {
    for (unsigned i = idx(k), s = 0; s < M; s++, i = (i + 1) % M) {
        if (!t->usado[i]) return 0;
        if (t->chave[i] == k) { *v = t->val[i]; return 1; }
    }
    return 0;
}

static void inserir(Tab *t, long k, int v) {
    unsigned i = idx(k);
    while (t->usado[i] && t->chave[i] != k) i = (i + 1) % M;
    t->usado[i] = 1;
    t->chave[i] = k;
    t->val[i] = v;
}

/* [ex-a] Subvetor de soma zero: dois prefixos iguais delimitam um trecho de soma zero. O(n) médio */
static int subvetor_soma_zero(const int a[], int n, int *ini, int *fim) {
    Tab t;
    memset(&t, 0, sizeof t);
    long soma = 0;
    inserir(&t, 0, -1);                          /* prefixo vazio na posição -1 */
    for (int i = 0; i < n; i++) {
        soma += a[i];
        int antes;
        if (buscar(&t, soma, &antes)) {
            *ini = antes + 1;
            *fim = i;
            return 1;
        }
        inserir(&t, soma, i);
    }
    return 0;
}
/* [/ex-a] */

/* [ex-b] Elemento mais frequente: contagem numa tabela; empates vencem o primeiro visto */
static int mais_frequente(const int a[], int n) {
    Tab t;
    memset(&t, 0, sizeof t);
    int melhor = a[0], melhor_cont = 0;
    for (int i = 0; i < n; i++) {
        int c = 0;
        buscar(&t, a[i], &c);
        c++;
        inserir(&t, a[i], c);
        if (c > melhor_cont) { melhor_cont = c; melhor = a[i]; }
    }
    return melhor;
}
/* [/ex-b] */

/* [ex-c] Primeiro caractere não repetido: duas passagens, a primeira conta, a segunda decide */
static int primeiro_unico(const char *s) {
    int cont[256] = {0};
    for (const char *p = s; *p; p++) cont[(unsigned char)*p]++;
    for (const char *p = s; *p; p++)
        if (cont[(unsigned char)*p] == 1) return (unsigned char)*p;
    return -1;
}
/* [/ex-c] */

/* [ex-d] Agrupar anagramas: a assinatura é a contagem de letras, usada como chave de um vetor de grupos */
static void assinatura(const char *s, char out[27]) {
    int cont[26] = {0};
    for (const char *p = s; *p; p++) cont[*p - 'a']++;
    for (int i = 0; i < 26; i++) out[i] = (char)('A' + cont[i]);   /* contagem como caractere */
    out[26] = '\0';
}

static void agrupar(const char *palavras[], int n) {
    char chaves[16][27];
    int grupos = 0;
    for (int i = 0; i < n; i++) {
        char k[27];
        assinatura(palavras[i], k);
        int g = -1;
        for (int j = 0; j < grupos; j++)
            if (strcmp(chaves[j], k) == 0) { g = j; break; }
        if (g < 0) { strcpy(chaves[grupos], k); g = grupos++; }
        printf("  %s -> grupo %d\n", palavras[i], g);
    }
    printf("  total de grupos: %d\n", grupos);
}
/* [/ex-d] */

int main(void) {
    const int a[] = {3, 4, -7, 3, 1, 3, 1, -4};
    int ini = -1, fim = -1;
    if (subvetor_soma_zero(a, 8, &ini, &fim))
        printf("subvetor de soma zero: índices %d a %d\n", ini, fim);

    const int f[] = {5, 2, 5, 3, 5, 2};
    printf("mais frequente de {5,2,5,3,5,2}: %d\n", mais_frequente(f, 6));

    printf("primeiro caractere único de \"swiss\": %c\n", primeiro_unico("swiss"));
    printf("primeiro caractere único de \"aabb\": %s\n", primeiro_unico("aabb") < 0 ? "nenhum" : "achou");

    const char *palavras[] = {"amor", "roma", "casa", "mora", "saca"};
    printf("agrupamento de anagramas:\n");
    agrupar(palavras, 5);
    return 0;
}
