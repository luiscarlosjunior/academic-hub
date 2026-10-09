/*
 * Árvores binárias de busca em C: inserção, busca, mínimo, remoção,
 * percursos (pré, em e pós-ordem, por níveis) e exercícios resolvidos.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 09-arvores.c -o arvores
 */
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct No {
    int v;
    struct No *esq, *dir;
} No;

static No *no_criar(int v) {
    No *n = malloc(sizeof *n);
    if (n == NULL) exit(1);
    n->v = v;
    n->esq = n->dir = NULL;
    return n;
}

/* [op:inserir] */
static No *inserir(No *r, int v) {
    if (r == NULL) return no_criar(v);
    if (v < r->v) r->esq = inserir(r->esq, v);
    else if (v > r->v) r->dir = inserir(r->dir, v);
    return r;                                  /* repetido: ignora */
}
/* [/op:inserir] */

/* [op:buscar] */
static const No *buscar(const No *r, int v) {
    while (r != NULL && r->v != v)             /* O(h) */
        r = (v < r->v) ? r->esq : r->dir;
    return r;
}
/* [/op:buscar] */

/* [op:minimo] */
static const No *minimo(const No *r) {
    if (r == NULL) return NULL;
    while (r->esq != NULL) r = r->esq;
    return r;
}
/* [/op:minimo] */

/* [op:remover] */
static No *remover(No *r, int v) {
    if (r == NULL) return NULL;
    if (v < r->v) {
        r->esq = remover(r->esq, v);
    } else if (v > r->v) {
        r->dir = remover(r->dir, v);
    } else if (r->esq == NULL) {               /* sem filho à esquerda */
        No *d = r->dir;
        free(r);
        return d;
    } else if (r->dir == NULL) {               /* sem filho à direita */
        No *e = r->esq;
        free(r);
        return e;
    } else {                                   /* dois filhos: sucessor em-ordem */
        const No *s = minimo(r->dir);
        r->v = s->v;
        r->dir = remover(r->dir, s->v);
    }
    return r;
}
/* [/op:remover] */

/* [op:percursos] */
static void pre_ordem(const No *r) {
    if (r == NULL) return;
    printf("%d ", r->v);
    pre_ordem(r->esq);
    pre_ordem(r->dir);
}

static void em_ordem(const No *r) {
    if (r == NULL) return;
    em_ordem(r->esq);
    printf("%d ", r->v);
    em_ordem(r->dir);
}

static void pos_ordem(const No *r) {
    if (r == NULL) return;
    pos_ordem(r->esq);
    pos_ordem(r->dir);
    printf("%d ", r->v);
}

/* Por níveis: usa uma fila (array circular de ponteiros) */
static void por_niveis(const No *raiz) {
    const No *fila[64];
    size_t ini = 0, fim = 0;
    if (raiz == NULL) return;
    fila[fim++] = raiz;
    while (ini < fim) {
        const No *r = fila[ini++];
        printf("%d ", r->v);
        if (r->esq) fila[fim++] = r->esq;
        if (r->dir) fila[fim++] = r->dir;
    }
}
/* [/op:percursos] */

/* [op:altura] */
static int altura(const No *r) {          /* número de arestas no caminho mais longo */
    if (r == NULL) return -1;
    int e = altura(r->esq), d = altura(r->dir);
    return 1 + (e > d ? e : d);
}
/* [/op:altura] */

static void liberar(No *r) {
    if (r == NULL) return;
    liberar(r->esq);
    liberar(r->dir);
    free(r);
}

/* [ex:e-bst] */
static int e_bst(const No *r, long min, long max) {
    if (r == NULL) return 1;
    if (r->v <= min || r->v >= max) return 0;
    return e_bst(r->esq, min, r->v) && e_bst(r->dir, r->v, max);
}
/* [/ex:e-bst] */

/* [ex:ancestral] */
static const No *ancestral_comum(const No *r, int a, int b) {
    while (r != NULL) {
        if (a < r->v && b < r->v) r = r->esq;      /* os dois estão à esquerda */
        else if (a > r->v && b > r->v) r = r->dir; /* os dois estão à direita */
        else return r;                             /* o nó separa a e b */
    }
    return NULL;
}
/* [/ex:ancestral] */

/* [ex:kesimo] */
static const No *kesimo_aux(const No *r, int k, int *cont) {
    if (r == NULL) return NULL;
    const No *e = kesimo_aux(r->esq, k, cont);
    if (e != NULL) return e;
    if (++(*cont) == k) return r;
    return kesimo_aux(r->dir, k, cont);
}

static const No *kesimo_menor(const No *r, int k) {
    int cont = 0;
    return kesimo_aux(r, k, &cont);
}
/* [/ex:kesimo] */

int main(void) {
    No *r = NULL;
    const int seq[] = {50, 30, 70, 20, 40, 60, 80, 35};
    for (int i = 0; i < 8; i++) r = inserir(r, seq[i]);

    printf("pré-ordem : "); pre_ordem(r);   printf("\n");
    printf("em-ordem  : "); em_ordem(r);    printf("\n");
    printf("pós-ordem : "); pos_ordem(r);   printf("\n");
    printf("por níveis: "); por_niveis(r);  printf("\n");
    printf("altura = %d arestas\n", altura(r));
    printf("buscar 40: %s, buscar 45: %s\n",
           buscar(r, 40) ? "achou" : "não achou", buscar(r, 45) ? "achou" : "não achou");
    printf("mínimo = %d\n", minimo(r)->v);

    printf("e_bst = %d\n", e_bst(r, LONG_MIN, LONG_MAX));
    printf("ancestral comum de 20 e 35 = %d\n", ancestral_comum(r, 20, 35)->v);
    printf("ancestral comum de 60 e 80 = %d\n", ancestral_comum(r, 60, 80)->v);
    printf("3º menor = %d\n", kesimo_menor(r, 3)->v);

    r = remover(r, 30);                       /* dois filhos: usa o sucessor 35 */
    printf("após remover 30, em-ordem: "); em_ordem(r); printf("\n");
    liberar(r);
    return 0;
}
