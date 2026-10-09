/*
 * Tabelas hash em C: função de espalhamento, encadeamento (chaves texto),
 * sondagem linear (chaves inteiras), redimensionamento e exercícios.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 08-tabelas-hash.c -o hash
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* [op:hash-string] */
static unsigned long hash_str(const char *s) {        /* djb2 */
    unsigned long h = 5381;
    for (; *s; s++) h = h * 33 + (unsigned char)*s;
    return h;
}
/* [/op:hash-string] */

typedef struct No {
    char chave[32];
    int valor;
    struct No *prox;
} No;

typedef struct {
    No **baldes;
    size_t m;                  /* número de baldes */
    size_t n;                  /* número de chaves */
} TabEnc;

static int tab_criar(TabEnc *t, size_t m) {
    t->baldes = calloc(m, sizeof *t->baldes);
    if (t->baldes == NULL) return 0;
    t->m = m;
    t->n = 0;
    return 1;
}

/* [op:encadeamento-inserir] */
static void enc_inserir(TabEnc *t, const char *chave, int valor) {
    size_t len = strlen(chave);
    if (len >= sizeof ((No *)0)->chave) return;
    size_t b = hash_str(chave) % t->m;
    for (No *p = t->baldes[b]; p; p = p->prox)
        if (strcmp(p->chave, chave) == 0) {    /* chave já existe: atualiza */
            p->valor = valor;
            return;
        }
    No *n = malloc(sizeof *n);
    if (n == NULL) return;
    memcpy(n->chave, chave, len + 1);
    n->valor = valor;
    n->prox = t->baldes[b];                    /* entra no início: O(1) */
    t->baldes[b] = n;
    t->n++;
}
/* [/op:encadeamento-inserir] */

/* [op:encadeamento-buscar] */
static int enc_buscar(const TabEnc *t, const char *chave, int *valor) {
    size_t b = hash_str(chave) % t->m;
    for (const No *p = t->baldes[b]; p; p = p->prox)
        if (strcmp(p->chave, chave) == 0) {
            *valor = p->valor;
            return 1;
        }
    return 0;
}
/* [/op:encadeamento-buscar] */

static void enc_liberar(TabEnc *t) {
    for (size_t b = 0; b < t->m; b++) {
        No *p = t->baldes[b];
        while (p) {
            No *seguinte = p->prox;
            free(p);
            p = seguinte;
        }
    }
    free(t->baldes);
    t->baldes = NULL;
    t->m = t->n = 0;
}

static void enc_mostrar(const TabEnc *t) {
    for (size_t b = 0; b < t->m; b++) {
        if (t->baldes[b] == NULL) continue;
        printf("  balde %zu:", b);
        for (const No *p = t->baldes[b]; p; p = p->prox) printf(" %s=%d", p->chave, p->valor);
        printf("\n");
    }
}

/* Endereçamento aberto: chaves inteiras não negativas */
#define VAZIO (-1)

typedef struct {
    int *chaves;
    int *vals;
    size_t cap;
    size_t n;
} TabAberta;

static int aberta_criar(TabAberta *t, size_t cap) {
    t->chaves = malloc(cap * sizeof *t->chaves);
    t->vals = malloc(cap * sizeof *t->vals);
    if (t->chaves == NULL || t->vals == NULL) {
        free(t->chaves);
        free(t->vals);
        return 0;
    }
    for (size_t i = 0; i < cap; i++) t->chaves[i] = VAZIO;
    t->cap = cap;
    t->n = 0;
    return 1;
}

static void aberta_liberar(TabAberta *t) {
    free(t->chaves);
    free(t->vals);
    t->chaves = NULL;
    t->vals = NULL;
    t->cap = t->n = 0;
}

/* [op:sondagem-inserir] */
static int sondagem_inserir(TabAberta *t, int chave, int valor) {
    if (t->n == t->cap) return 0;                       /* cheia */
    size_t i = (size_t)chave % t->cap;
    while (t->chaves[i] != VAZIO && t->chaves[i] != chave)
        i = (i + 1) % t->cap;                           /* sondagem linear */
    if (t->chaves[i] == VAZIO) t->n++;
    t->chaves[i] = chave;
    t->vals[i] = valor;
    return 1;
}
/* [/op:sondagem-inserir] */

/* [op:sondagem-buscar] */
static int sondagem_buscar(const TabAberta *t, int chave, int *valor) {
    size_t i = (size_t)chave % t->cap;
    for (size_t k = 0; k < t->cap; k++) {
        if (t->chaves[i] == VAZIO) return 0;            /* achou vazio: não está */
        if (t->chaves[i] == chave) {
            *valor = t->vals[i];
            return 1;
        }
        i = (i + 1) % t->cap;
    }
    return 0;
}
/* [/op:sondagem-buscar] */

/* [op:redimensionar] */
static int aberta_redimensionar(TabAberta *t) {
    TabAberta nova;
    if (!aberta_criar(&nova, t->cap * 2)) return 0;
    for (size_t i = 0; i < t->cap; i++)
        if (t->chaves[i] != VAZIO) sondagem_inserir(&nova, t->chaves[i], t->vals[i]);
    aberta_liberar(t);
    *t = nova;
    return 1;
}
/* [/op:redimensionar] */

/* [ex:dois-somas] */
static int dois_somas(const int a[], size_t n, int alvo, size_t *i_out, size_t *j_out) {
    TabAberta t;
    if (!aberta_criar(&t, 2 * n + 1)) return 0;
    int achou = 0;
    for (size_t j = 0; j < n && !achou; j++) {
        int i = 0;
        int falta = alvo - a[j];                      /* o complemento que falta */
        if (falta >= 0 && sondagem_buscar(&t, falta, &i)) {
            *i_out = (size_t)i;
            *j_out = j;
            achou = 1;
        } else {
            sondagem_inserir(&t, a[j], (int)j);      /* guarda valor -> índice */
        }
    }
    aberta_liberar(&t);
    return achou;
}
/* [/ex:dois-somas] */

/* [ex:frequencias] */
static void contar_palavras(TabEnc *t, const char *const palavras[], size_t n) {
    for (size_t i = 0; i < n; i++) {
        int c = 0;
        enc_buscar(t, palavras[i], &c);
        enc_inserir(t, palavras[i], c + 1);
    }
}
/* [/ex:frequencias] */

int main(void) {
    printf("hash_str(\"ana\") %% 5 = %lu\n", hash_str("ana") % 5);

    TabEnc t;
    tab_criar(&t, 5);
    const char *nomes[] = {"ana", "bia", "caio", "dani", "eva", "fabio"};
    for (int i = 0; i < 6; i++) enc_inserir(&t, nomes[i], i + 1);
    printf("encadeamento (5 baldes, %zu chaves):\n", t.n);
    enc_mostrar(&t);
    int v = 0;
    printf("buscar dani: %s\n", enc_buscar(&t, "dani", &v) ? "achou" : "não achou");
    printf("buscar zeca: %s\n", enc_buscar(&t, "zeca", &v) ? "achou" : "não achou");
    enc_liberar(&t);

    const char *pal[] = {"sol", "lua", "sol", "mar", "sol", "lua"};
    TabEnc f;
    tab_criar(&f, 7);
    contar_palavras(&f, pal, 6);
    printf("frequências:\n");
    enc_mostrar(&f);
    enc_liberar(&f);

    TabAberta a;
    aberta_criar(&a, 4);
    int chaves[] = {10, 14, 3};             /* 10 e 14 colidem em 10 % 4 == 2 */
    for (int i = 0; i < 3; i++) sondagem_inserir(&a, chaves[i], i * 100);
    printf("sondagem linear, cap=%zu n=%zu\n", a.cap, a.n);
    for (int i = 0; i < 3; i++) {
        int val = -1;
        printf("  chave %2d -> %s\n", chaves[i], sondagem_buscar(&a, chaves[i], &val) ? "achou" : "falhou");
    }
    aberta_redimensionar(&a);
    printf("após redimensionar: cap=%zu n=%zu\n", a.cap, a.n);
    aberta_liberar(&a);

    const int nums[] = {2, 7, 11, 15};
    size_t i = 0, j = 0;
    if (dois_somas(nums, 4, 9, &i, &j)) printf("dois somas para 9: índices %zu e %zu\n", i, j);
    return 0;
}
