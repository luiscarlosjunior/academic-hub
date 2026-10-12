/*
 * Mais exemplos de árvores: diâmetro, reconstrução a partir do percurso
 * pré-ordem, somas por nível e caminho até um valor.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 09-mais-exemplos.c -o mais
 */
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct No {
    int v;
    struct No *esq, *dir;
} No;

static No *novo(int v) {
    No *n = malloc(sizeof *n);
    if (!n) exit(1);
    n->v = v;
    n->esq = n->dir = NULL;
    return n;
}

static void liberar(No *r) {
    if (!r) return;
    liberar(r->esq);
    liberar(r->dir);
    free(r);
}

/* [ex-a] Diâmetro: o maior caminho entre duas folhas, em arestas. Uma só visita: O(n) */
static int diam_aux(const No *r, int *melhor) {
    if (!r) return -1;
    int e = diam_aux(r->esq, melhor) + 1;
    int d = diam_aux(r->dir, melhor) + 1;
    if (e + d > *melhor) *melhor = e + d;
    return e > d ? e : d;
}

static int diametro(const No *r) {
    int melhor = 0;
    diam_aux(r, &melhor);
    return melhor;
}
/* [/ex-a] */

/* [ex-b] Reconstrução a partir do pré-ordem: cada valor respeita um intervalo (min, max). O(n) */
static int pos = 0;

static No *reconstruir(const int pre[], int n, long min, long max) {
    if (pos >= n) return NULL;
    int v = pre[pos];
    if (v <= min || v >= max) return NULL;
    pos++;
    No *r = novo(v);
    r->esq = reconstruir(pre, n, min, v);
    r->dir = reconstruir(pre, n, v, max);
    return r;
}
/* [/ex-b] */

/* [ex-c] Soma de cada nível, percorrido por uma fila de nós */
static void somas_por_nivel(const No *raiz) {
    const No *fila[64];
    int prof[64];
    size_t ini = 0, fim = 0;
    if (!raiz) return;
    fila[fim] = raiz;
    prof[fim++] = 0;
    long soma = 0;
    int atual = 0;
    while (ini < fim) {
        const No *r = fila[ini];
        int p = prof[ini++];
        if (p != atual) {
            printf("  nível %d: soma %ld\n", atual, soma);
            soma = 0;
            atual = p;
        }
        soma += r->v;
        if (r->esq) { fila[fim] = r->esq; prof[fim++] = p + 1; }
        if (r->dir) { fila[fim] = r->dir; prof[fim++] = p + 1; }
    }
    printf("  nível %d: soma %ld\n", atual, soma);
}
/* [/ex-c] */

/* [ex-d] Caminho da raiz até um valor (inclusive). Guarda o caminho ao descer */
static int caminho(const No *r, int alvo, int trilha[], int *tam) {
    if (!r) return 0;
    trilha[(*tam)++] = r->v;
    if (r->v == alvo) return 1;
    if (caminho(r->esq, alvo, trilha, tam) || caminho(r->dir, alvo, trilha, tam)) return 1;
    (*tam)--;                              /* desfaz: o ramo não contém o alvo */
    return 0;
}
/* [/ex-d] */

int main(void) {
    No *r = novo(1);
    r->esq = novo(2);
    r->dir = novo(3);
    r->esq->esq = novo(4);
    r->esq->esq->esq = novo(6);
    r->esq->dir = novo(5);
    printf("diâmetro = %d arestas\n", diametro(r));
    printf("somas por nível:\n");
    somas_por_nivel(r);

    int trilha[16], tam = 0;
    if (caminho(r, 6, trilha, &tam)) {
        printf("caminho até 6:");
        for (int i = 0; i < tam; i++) printf(" %d", trilha[i]);
        printf("\n");
    }
    liberar(r);

    const int pre[] = {8, 3, 1, 6, 4, 7, 10, 14};
    pos = 0;
    No *b = reconstruir(pre, 8, LONG_MIN, LONG_MAX);
    printf("reconstruída a partir do pré-ordem: raiz %d, nós usados %d, diâmetro %d\n",
           b->v, pos, diametro(b));
    liberar(b);
    return 0;
}
