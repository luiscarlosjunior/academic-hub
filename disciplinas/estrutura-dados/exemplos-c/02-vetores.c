/*
 * Vetores dinâmicos em C: acesso, busca, inserção, remoção e crescimento.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 02-vetores.c -o vetores
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int *dados;   /* bloco contíguo na memória (heap) */
    size_t tam;   /* quantos elementos estão em uso */
    size_t cap;   /* quantos cabem sem realocar */
} Vetor;

/* [op:criar] */
static int vetor_criar(Vetor *v, size_t cap) {
    v->dados = malloc(cap * sizeof *v->dados);
    if (v->dados == NULL) return 0;
    v->tam = 0;
    v->cap = cap;
    return 1;
}
/* [/op:criar] */

/* [op:acessar] */
static int vetor_acessar(const Vetor *v, size_t i, int *saida) {
    if (i >= v->tam) return 0;      /* C não verifica limites: a checagem é nossa */
    *saida = v->dados[i];
    return 1;
}
/* [/op:acessar] */

/* [op:buscar] */
static long vetor_buscar(const Vetor *v, int x) {
    for (size_t i = 0; i < v->tam; i++)
        if (v->dados[i] == x) return (long)i;
    return -1;
}
/* [/op:buscar] */

/* [op:crescer] */
static int vetor_crescer(Vetor *v) {
    size_t nova = (v->cap == 0) ? 4 : v->cap * 2;
    int *p = realloc(v->dados, nova * sizeof *p);
    if (p == NULL) return 0;
    v->dados = p;
    v->cap = nova;
    return 1;
}
/* [/op:crescer] */

/* [op:inserir-fim] */
static int vetor_push(Vetor *v, int x) {
    if (v->tam == v->cap && !vetor_crescer(v)) return 0;
    v->dados[v->tam++] = x;
    return 1;
}
/* [/op:inserir-fim] */

/* [op:inserir-posicao] */
static int vetor_inserir(Vetor *v, size_t pos, int x) {
    if (pos > v->tam) return 0;
    if (v->tam == v->cap && !vetor_crescer(v)) return 0;
    memmove(&v->dados[pos + 1], &v->dados[pos], (v->tam - pos) * sizeof *v->dados);
    v->dados[pos] = x;
    v->tam++;
    return 1;
}
/* [/op:inserir-posicao] */

/* [op:remover-posicao] */
static int vetor_remover(Vetor *v, size_t pos, int *removido) {
    if (pos >= v->tam) return 0;
    *removido = v->dados[pos];
    memmove(&v->dados[pos], &v->dados[pos + 1], (v->tam - pos - 1) * sizeof *v->dados);
    v->tam--;
    return 1;
}
/* [/op:remover-posicao] */

static void vetor_liberar(Vetor *v) {
    free(v->dados);
    v->dados = NULL;
    v->tam = v->cap = 0;
}

static void vetor_mostrar(const char *rotulo, const Vetor *v) {
    printf("%-20s tam=%zu cap=%zu :", rotulo, v->tam, v->cap);
    for (size_t i = 0; i < v->tam; i++) printf(" %d", v->dados[i]);
    printf("\n");
}

static void imprimir(const char *rotulo, const int a[], size_t n) {
    printf("%-20s", rotulo);
    for (size_t i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
}

/* [ex:inverter] */
static void inverter(int a[], size_t n) {
    if (n < 2) return;
    size_t i = 0, j = n - 1;
    while (i < j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
        i++;
        j--;
    }
}
/* [/ex:inverter] */

/* [ex:rotacionar] */
static void inverter_faixa(int a[], size_t ini, size_t fim) {   /* fim exclusivo */
    if (fim - ini < 2) return;
    size_t i = ini, j = fim - 1;
    while (i < j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
        i++;
        j--;
    }
}

static void rotacionar_esq(int a[], size_t n, size_t k) {
    if (n == 0) return;
    k %= n;
    inverter_faixa(a, 0, k);
    inverter_faixa(a, k, n);
    inverter_faixa(a, 0, n);
}
/* [/ex:rotacionar] */

/* [ex:duplicados] */
static size_t remover_duplicados(int a[], size_t n) {
    if (n == 0) return 0;
    size_t w = 1;                       /* próxima posição de escrita */
    for (size_t r = 1; r < n; r++)
        if (a[r] != a[w - 1]) a[w++] = a[r];
    return w;
}
/* [/ex:duplicados] */

/* [ex:kadane] */
static int maior_soma(const int a[], size_t n) {
    int melhor = a[0], atual = a[0];
    for (size_t i = 1; i < n; i++) {
        atual = (atual > 0) ? atual + a[i] : a[i];
        if (atual > melhor) melhor = atual;
    }
    return melhor;
}
/* [/ex:kadane] */

int main(void) {
    Vetor v;
    if (!vetor_criar(&v, 2)) return 1;

    printf("Crescimento por duplicação:\n");
    for (int x = 1; x <= 9; x++) {
        vetor_push(&v, x * 10);
        printf("  push %2d -> tam=%zu cap=%zu\n", x * 10, v.tam, v.cap);
    }

    int x = 0;
    if (vetor_acessar(&v, 3, &x)) printf("v[3] = %d\n", x);
    if (!vetor_acessar(&v, 99, &x)) printf("v[99] fora dos limites\n");
    printf("buscar 50 -> índice %ld\n", vetor_buscar(&v, 50));

    vetor_inserir(&v, 2, 99);
    vetor_mostrar("após inserir 99@2", &v);
    vetor_remover(&v, 0, &x);
    printf("removido %d\n", x);
    vetor_mostrar("após remover @0", &v);
    vetor_liberar(&v);

    int a[] = {1, 2, 3, 4, 5, 6, 7};
    inverter(a, 7);
    imprimir("invertido:", a, 7);

    int b[] = {1, 2, 3, 4, 5, 6, 7};
    rotacionar_esq(b, 7, 2);
    imprimir("rotação esq. 2:", b, 7);

    int c[] = {1, 1, 2, 2, 2, 3, 4, 4};
    size_t novo = remover_duplicados(c, 8);
    imprimir("sem duplicados:", c, novo);

    int d[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    printf("maior soma contígua = %d\n", maior_soma(d, 9));
    return 0;
}
