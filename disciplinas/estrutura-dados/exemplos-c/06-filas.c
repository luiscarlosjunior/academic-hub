/*
 * Filas em C: buffer circular, fila encadeada, simulação round-robin e
 * fila construída com duas pilhas.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 06-filas.c -o filas
 */
#include <stdio.h>
#include <stdlib.h>

#define CAP 5

/* [op:enqueue] */
typedef struct {
    int dados[CAP];
    size_t frente;      /* índice do primeiro elemento */
    size_t tam;         /* quantos elementos estão na fila */
} FilaCirc;

static int fila_enqueue(FilaCirc *f, int x) {
    if (f->tam == CAP) return 0;                    /* cheia */
    f->dados[(f->frente + f->tam) % CAP] = x;       /* índice circular */
    f->tam++;
    return 1;
}
/* [/op:enqueue] */

/* [op:dequeue] */
static int fila_dequeue(FilaCirc *f, int *saida) {
    if (f->tam == 0) return 0;                      /* vazia */
    *saida = f->dados[f->frente];
    f->frente = (f->frente + 1) % CAP;
    f->tam--;
    return 1;
}
/* [/op:dequeue] */

/* [op:peek] */
static int fila_frente(const FilaCirc *f, int *saida) {
    if (f->tam == 0) return 0;
    *saida = f->dados[f->frente];
    return 1;
}
/* [/op:peek] */

/* [op:fila-encadeada] */
typedef struct No {
    int v;
    struct No *prox;
} No;

typedef struct {
    No *ini, *fim;
} FilaLig;

static int lig_enqueue(FilaLig *f, int v) {
    No *n = malloc(sizeof *n);
    if (n == NULL) return 0;
    n->v = v;
    n->prox = NULL;
    if (f->fim) f->fim->prox = n;
    else f->ini = n;
    f->fim = n;
    return 1;
}

static int lig_dequeue(FilaLig *f, int *saida) {
    No *n = f->ini;
    if (n == NULL) return 0;
    *saida = n->v;
    f->ini = n->prox;
    if (f->ini == NULL) f->fim = NULL;
    free(n);
    return 1;
}

static void lig_liberar(FilaLig *f) {
    int descartado;
    while (lig_dequeue(f, &descartado)) { }
}
/* [/op:fila-encadeada] */

/* [ex:round-robin] */
static void round_robin(const int duracao[], size_t n, int quantum) {
    int restante[16];
    FilaLig f = {NULL, NULL};
    for (size_t i = 0; i < n && i < 16; i++) {
        restante[i] = duracao[i];
        lig_enqueue(&f, (int)i);
    }
    int t = 0, idx;
    while (lig_dequeue(&f, &idx)) {
        int fatia = restante[idx] < quantum ? restante[idx] : quantum;
        t += fatia;
        restante[idx] -= fatia;
        if (restante[idx] > 0) lig_enqueue(&f, idx);      /* volta para o fim da fila */
        else printf("  processo %d termina em t=%d\n", idx, t);
    }
}
/* [/ex:round-robin] */

/* [ex:duas-pilhas] */
typedef struct {
    int d[32];
    int n;
} Pilha;

static void p_push(Pilha *p, int x) { p->d[p->n++] = x; }

static int p_pop(Pilha *p, int *x) {
    if (p->n == 0) return 0;
    *x = p->d[--p->n];
    return 1;
}

typedef struct {
    Pilha entrada, saida;
} FilaDuasPilhas;

static void fdp_enqueue(FilaDuasPilhas *q, int x) {
    p_push(&q->entrada, x);
}

/* Amortizado O(1): cada elemento é movido da entrada para a saída no máximo uma vez */
static int fdp_dequeue(FilaDuasPilhas *q, int *x) {
    if (q->saida.n == 0) {
        int t;
        while (p_pop(&q->entrada, &t)) p_push(&q->saida, t);
    }
    return p_pop(&q->saida, x);
}
/* [/ex:duas-pilhas] */

int main(void) {
    FilaCirc c = {{0}, 0, 0};
    for (int x = 1; x <= 6; x++) {
        if (!fila_enqueue(&c, x * 10)) printf("fila cheia ao inserir %d\n", x * 10);
    }
    int v = 0;
    fila_dequeue(&c, &v);
    printf("saiu %d\n", v);
    fila_dequeue(&c, &v);
    printf("saiu %d\n", v);
    fila_enqueue(&c, 70);
    fila_enqueue(&c, 80);                 /* reaproveita as posições do início */
    if (fila_frente(&c, &v)) printf("frente agora = %d (tamanho %zu)\n", v, c.tam);

    FilaLig l = {NULL, NULL};
    lig_enqueue(&l, 1);
    lig_enqueue(&l, 2);
    lig_enqueue(&l, 3);
    printf("fila encadeada:");
    while (lig_dequeue(&l, &v)) printf(" %d", v);
    printf("\n");
    lig_liberar(&l);

    printf("round-robin, quantum=2, durações {5,3,8}:\n");
    const int dur[] = {5, 3, 8};
    round_robin(dur, 3, 2);

    FilaDuasPilhas q = {{{0}, 0}, {{0}, 0}};
    fdp_enqueue(&q, 1);
    fdp_enqueue(&q, 2);
    fdp_enqueue(&q, 3);
    fdp_dequeue(&q, &v);
    printf("duas pilhas: saiu %d\n", v);
    fdp_enqueue(&q, 4);
    printf("duas pilhas: restante");
    while (fdp_dequeue(&q, &v)) printf(" %d", v);
    printf("\n");
    return 0;
}
