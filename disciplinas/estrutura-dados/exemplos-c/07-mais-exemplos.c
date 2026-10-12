/*
 * Mais exemplos de pilhas: avaliação de expressão com dois pilhas, maior
 * retângulo em histograma, decodificação de strings e validação de sequências.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 07-mais-exemplos.c -o mais
 */
#include <ctype.h>
#include <stdio.h>
#include <string.h>

#define MAX 128

typedef struct {
    int d[MAX];
    int topo;
} Pilha;

static void iniciar(Pilha *p) { p->topo = -1; }
static void push(Pilha *p, int x) { p->d[++p->topo] = x; }
static int pop(Pilha *p) { return p->d[p->topo--]; }
static int vazia(const Pilha *p) { return p->topo < 0; }

/* [ex-a] Avaliação de expressões com inteiros, + - * e parênteses, usando duas pilhas */
static int prec(char op) { return (op == '+' || op == '-') ? 1 : 2; }

static void aplicar(Pilha *vals, Pilha *ops) {
    int b = pop(vals), a = pop(vals);
    char op = (char)pop(ops);
    push(vals, op == '+' ? a + b : op == '-' ? a - b : a * b);
}

static int avaliar(const char *s) {
    Pilha vals, ops;
    iniciar(&vals);
    iniciar(&ops);
    for (const char *p = s; *p; p++) {
        if (isdigit((unsigned char)*p)) {
            int v = 0;
            while (isdigit((unsigned char)*p)) v = v * 10 + (*p++ - '0');
            p--;
            push(&vals, v);
        } else if (*p == '(') {
            push(&ops, '(');
        } else if (*p == ')') {
            while (!vazia(&ops) && ops.d[ops.topo] != '(') aplicar(&vals, &ops);
            pop(&ops);
        } else if (*p == '+' || *p == '-' || *p == '*') {
            while (!vazia(&ops) && ops.d[ops.topo] != '(' && prec(ops.d[ops.topo]) >= prec(*p))
                aplicar(&vals, &ops);
            push(&ops, *p);
        }
    }
    while (!vazia(&ops)) aplicar(&vals, &ops);
    return pop(&vals);
}
/* [/ex-a] */

/* [ex-b] Maior retângulo em histograma: pilha monotônica crescente de índices. O(n) */
static long maior_retangulo(const int h[], int n) {
    Pilha p;
    iniciar(&p);
    long melhor = 0;
    for (int i = 0; i <= n; i++) {
        int atual = (i == n) ? 0 : h[i];
        while (!vazia(&p) && h[p.d[p.topo]] >= atual) {
            int alt = h[pop(&p)];
            int larg = vazia(&p) ? i : i - p.d[p.topo] - 1;
            long area = (long)alt * larg;
            if (area > melhor) melhor = area;
        }
        push(&p, i);
    }
    return melhor;
}
/* [/ex-b] */

/* [ex-c] Decodifica "3[ab2[c]]" para "abccabccabcc"; a pilha guarda contagens e texto parcial */
static void decodificar(const char *s, char saida[]) {
    int cont[MAX];
    char texto[MAX][MAX];
    int nivel = 0;
    cont[0] = 1;
    texto[0][0] = '\0';
    for (const char *p = s; *p; p++) {
        if (isdigit((unsigned char)*p)) {
            cont[nivel + 1] = 0;
            while (isdigit((unsigned char)*p)) cont[nivel + 1] = cont[nivel + 1] * 10 + (*p++ - '0');
            p--;
        } else if (*p == '[') {
            nivel++;
            texto[nivel][0] = '\0';
        } else if (*p == ']') {
            char bloco[MAX * 4] = "";
            for (int k = 0; k < cont[nivel]; k++) strcat(bloco, texto[nivel]);
            nivel--;
            strcat(texto[nivel], bloco);
        } else {
            size_t t = strlen(texto[nivel]);
            texto[nivel][t] = *p;
            texto[nivel][t + 1] = '\0';
        }
    }
    strcpy(saida, texto[0]);
}
/* [/ex-c] */

/* [ex-d] Uma sequência de saídas é possível com pilha? Simula push e pop na ordem dada */
static int sequencia_possivel(const int entrada[], const int saida[], int n) {
    Pilha p;
    iniciar(&p);
    int i = 0;
    for (int k = 0; k < n; k++) {
        while (vazia(&p) || p.d[p.topo] != saida[k]) {
            if (i == n) return 0;
            push(&p, entrada[i++]);
        }
        pop(&p);
    }
    return 1;
}
/* [/ex-d] */

int main(void) {
    printf("avaliar \"2+3*(4-1)\" = %d\n", avaliar("2+3*(4-1)"));
    printf("avaliar \"(1+2)*(3+4)-5\" = %d\n", avaliar("(1+2)*(3+4)-5"));

    const int h[] = {2, 1, 5, 6, 2, 3};
    printf("maior retângulo do histograma {2,1,5,6,2,3} = %ld\n", maior_retangulo(h, 6));

    char saida[MAX * 4];
    decodificar("3[ab2[c]]", saida);
    printf("decodificado: %s\n", saida);

    const int entrada[] = {1, 2, 3, 4, 5};
    const int ok[] = {4, 5, 3, 2, 1};
    const int ruim[] = {3, 5, 4, 1, 2};
    printf("sequência {4,5,3,2,1} possível? %s\n", sequencia_possivel(entrada, ok, 5) ? "sim" : "não");
    printf("sequência {3,5,4,1,2} possível? %s\n", sequencia_possivel(entrada, ruim, 5) ? "sim" : "não");
    return 0;
}
