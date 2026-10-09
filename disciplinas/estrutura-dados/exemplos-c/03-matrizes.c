/*
 * Matrizes em C: armazenamento linha-maior, percursos, transposta, produto,
 * espiral, rotação e zeragem.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 03-matrizes.c -o matrizes
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    size_t lin, col;
    int *d;               /* lin*col inteiros contíguos, linha-maior */
} Matriz;

/* [op:criar] */
static int mat_criar(Matriz *m, size_t lin, size_t col) {
    m->d = calloc(lin * col, sizeof *m->d);   /* já zerada */
    if (m->d == NULL) return 0;
    m->lin = lin;
    m->col = col;
    return 1;
}
/* [/op:criar] */

/* [op:acessar] */
static int mat_get(const Matriz *m, size_t i, size_t j) {
    return m->d[i * m->col + j];              /* posição linear k = i·col + j */
}

static void mat_set(Matriz *m, size_t i, size_t j, int x) {
    m->d[i * m->col + j] = x;
}
/* [/op:acessar] */

/* [op:percurso-linha] */
static long soma_por_linhas(const Matriz *m) {
    long s = 0;
    for (size_t i = 0; i < m->lin; i++)
        for (size_t j = 0; j < m->col; j++)
            s += mat_get(m, i, j);            /* acessos consecutivos na memória */
    return s;
}
/* [/op:percurso-linha] */

/* [op:percurso-coluna] */
static long soma_por_colunas(const Matriz *m) {
    long s = 0;
    for (size_t j = 0; j < m->col; j++)
        for (size_t i = 0; i < m->lin; i++)
            s += mat_get(m, i, j);            /* saltos de 'col' posições */
    return s;
}
/* [/op:percurso-coluna] */

/* [op:transposta] */
static int mat_transposta(const Matriz *a, Matriz *t) {
    if (!mat_criar(t, a->col, a->lin)) return 0;
    for (size_t i = 0; i < a->lin; i++)
        for (size_t j = 0; j < a->col; j++)
            mat_set(t, j, i, mat_get(a, i, j));
    return 1;
}
/* [/op:transposta] */

/* [op:multiplicar] */
static int mat_multiplicar(const Matriz *a, const Matriz *b, Matriz *c) {
    if (a->col != b->lin) return 0;
    if (!mat_criar(c, a->lin, b->col)) return 0;
    for (size_t i = 0; i < a->lin; i++)
        for (size_t j = 0; j < b->col; j++) {
            int s = 0;
            for (size_t k = 0; k < a->col; k++)
                s += mat_get(a, i, k) * mat_get(b, k, j);
            mat_set(c, i, j, s);
        }
    return 1;
}
/* [/op:multiplicar] */

static void mat_liberar(Matriz *m) {
    free(m->d);
    m->d = NULL;
    m->lin = m->col = 0;
}

static void mat_mostrar(const char *rotulo, const Matriz *m) {
    printf("%s (%zux%zu)\n", rotulo, m->lin, m->col);
    for (size_t i = 0; i < m->lin; i++) {
        printf("  ");
        for (size_t j = 0; j < m->col; j++) printf("%4d", mat_get(m, i, j));
        printf("\n");
    }
}

/* [ex:espiral] */
static size_t espiral(const Matriz *m, int saida[]) {
    size_t topo = 0, base = m->lin, esq = 0, dir = m->col, n = 0;
    while (topo < base && esq < dir) {
        for (size_t j = esq; j < dir; j++) saida[n++] = mat_get(m, topo, j);
        topo++;
        for (size_t i = topo; i < base; i++) saida[n++] = mat_get(m, i, dir - 1);
        dir--;
        if (topo < base) {
            for (size_t j = dir; j > esq; j--) saida[n++] = mat_get(m, base - 1, j - 1);
            base--;
        }
        if (esq < dir) {
            for (size_t i = base; i > topo; i--) saida[n++] = mat_get(m, i - 1, esq);
            esq++;
        }
    }
    return n;
}
/* [/ex:espiral] */

/* [ex:rotacionar90] */
static void rotacionar90(Matriz *m) {                 /* quadrada, sentido horário */
    size_t n = m->lin;
    for (size_t i = 0; i < n; i++)                     /* 1) transpõe in place */
        for (size_t j = i + 1; j < n; j++) {
            int t = mat_get(m, i, j);
            mat_set(m, i, j, mat_get(m, j, i));
            mat_set(m, j, i, t);
        }
    for (size_t i = 0; i < n; i++)                     /* 2) inverte cada linha */
        for (size_t a = 0, b = n - 1; a < b; a++, b--) {
            int t = mat_get(m, i, a);
            mat_set(m, i, a, mat_get(m, i, b));
            mat_set(m, i, b, t);
        }
}
/* [/ex:rotacionar90] */

/* [ex:zeros] */
static void zerar_linhas_colunas(Matriz *m) {
    unsigned char *linha = calloc(m->lin, 1);
    unsigned char *coluna = calloc(m->col, 1);
    if (linha == NULL || coluna == NULL) {
        free(linha);
        free(coluna);
        return;
    }
    for (size_t i = 0; i < m->lin; i++)
        for (size_t j = 0; j < m->col; j++)
            if (mat_get(m, i, j) == 0) {
                linha[i] = 1;
                coluna[j] = 1;
            }
    for (size_t i = 0; i < m->lin; i++)
        for (size_t j = 0; j < m->col; j++)
            if (linha[i] || coluna[j]) mat_set(m, i, j, 0);
    free(linha);
    free(coluna);
}
/* [/ex:zeros] */

/* [ex:diagonais] */
static long soma_diagonais(const Matriz *m) {
    long s = 0;
    for (size_t i = 0; i < m->lin; i++) {
        s += mat_get(m, i, i);
        size_t k = m->lin - 1 - i;
        if (k != i) s += mat_get(m, i, k);      /* o centro não é contado duas vezes */
    }
    return s;
}
/* [/ex:diagonais] */

int main(void) {
    Matriz a, b, c, t;
    mat_criar(&a, 3, 4);
    mat_criar(&b, 4, 2);
    int va = 0;
    for (size_t i = 0; i < 3; i++)
        for (size_t j = 0; j < 4; j++) mat_set(&a, i, j, ++va);
    for (size_t i = 0; i < 4; i++)
        for (size_t j = 0; j < 2; j++) mat_set(&b, i, j, (int)(i + j));

    mat_mostrar("A", &a);
    printf("soma por linhas = %ld, por colunas = %ld\n", soma_por_linhas(&a), soma_por_colunas(&a));

    mat_transposta(&a, &t);
    mat_mostrar("transposta de A", &t);

    if (mat_multiplicar(&a, &b, &c)) mat_mostrar("A x B", &c);

    int espiral_saida[12];
    size_t n = espiral(&a, espiral_saida);
    printf("espiral de A:");
    for (size_t k = 0; k < n; k++) printf(" %d", espiral_saida[k]);
    printf("\n");

    Matriz q;
    mat_criar(&q, 3, 3);
    int vq = 1;
    for (size_t i = 0; i < 3; i++)
        for (size_t j = 0; j < 3; j++) mat_set(&q, i, j, vq++);
    printf("diagonais de Q = %ld\n", soma_diagonais(&q));
    rotacionar90(&q);
    mat_mostrar("Q rotacionada 90°", &q);

    Matriz z;
    mat_criar(&z, 3, 3);
    mat_set(&z, 0, 0, 5); mat_set(&z, 0, 2, 7);
    mat_set(&z, 1, 1, 9); mat_set(&z, 2, 0, 4);
    mat_set(&z, 2, 2, 6);
    mat_set(&z, 1, 2, 0);            /* zero em (1,2) zera a linha 1 e a coluna 2 */
    zerar_linhas_colunas(&z);
    mat_mostrar("Z após zerar", &z);

    mat_liberar(&a); mat_liberar(&b); mat_liberar(&c); mat_liberar(&t);
    mat_liberar(&q); mat_liberar(&z);
    return 0;
}
