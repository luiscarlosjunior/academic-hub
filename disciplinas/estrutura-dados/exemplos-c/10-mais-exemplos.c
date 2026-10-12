/*
 * Mais exemplos de grafos: ciclo em grafo dirigido com três cores, união e
 * busca (union-find), caminho reconstruído por BFS e vértice de maior grau.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 10-mais-exemplos.c -o mais
 */
#include <stdio.h>
#include <string.h>

#define V 6

typedef struct {
    int n;
    int viz[V][V];
    int g[V];
} Grafo;

static void inicia(Grafo *g) { memset(g, 0, sizeof *g); }

static void arco(Grafo *g, int u, int v) { g->viz[u][g->g[u]++] = v; }

/* [ex-a] Ciclo em grafo dirigido com três cores: branco, cinza (em exploração) e preto */
static int ciclo_aux(const Grafo *g, int u, int cor[]) {
    cor[u] = 1;
    for (int k = 0; k < g->g[u]; k++) {
        int v = g->viz[u][k];
        if (cor[v] == 1) return 1;                   /* aresta para cinza: ciclo */
        if (cor[v] == 0 && ciclo_aux(g, v, cor)) return 1;
    }
    cor[u] = 2;
    return 0;
}

static int tem_ciclo(const Grafo *g) {
    int cor[V] = {0};
    for (int u = 0; u < g->n; u++)
        if (cor[u] == 0 && ciclo_aux(g, u, cor)) return 1;
    return 0;
}
/* [/ex-a] */

/* [ex-b] Union-find com compressão de caminho: componentes sem percorrer o grafo */
static int pai[V];

static int achar(int x) {
    while (pai[x] != x) {
        pai[x] = pai[pai[x]];
        x = pai[x];
    }
    return x;
}

static void unir(int a, int b) {
    int ra = achar(a), rb = achar(b);
    if (ra != rb) pai[ra] = rb;
}

static int componentes_uf(int n, const int ar[][2], int m) {
    for (int i = 0; i < n; i++) pai[i] = i;
    for (int i = 0; i < m; i++) unir(ar[i][0], ar[i][1]);
    int c = 0;
    for (int i = 0; i < n; i++)
        if (achar(i) == i) c++;
    return c;
}
/* [/ex-b] */

/* [ex-c] BFS reconstruindo o caminho com o vetor de pais */
static int caminho_bfs(const Grafo *g, int origem, int destino, int saida[], int *tam) {
    int pai_b[V], vis[V] = {0}, fila[V], ini = 0, fim = 0;
    for (int i = 0; i < V; i++) pai_b[i] = -1;
    fila[fim++] = origem;
    vis[origem] = 1;
    while (ini < fim) {
        int u = fila[ini++];
        for (int k = 0; k < g->g[u]; k++) {
            int v = g->viz[u][k];
            if (!vis[v]) {
                vis[v] = 1;
                pai_b[v] = u;
                fila[fim++] = v;
            }
        }
    }
    if (!vis[destino]) return 0;
    int tmp[V], t = 0;
    for (int x = destino; x != -1; x = pai_b[x]) tmp[t++] = x;
    for (int i = 0; i < t; i++) saida[i] = tmp[t - 1 - i];
    *tam = t;
    return 1;
}
/* [/ex-c] */

/* [ex-d] Vértice de maior grau de saída, com empate pelo menor índice */
static int maior_grau(const Grafo *g) {
    int melhor = 0;
    for (int u = 1; u < g->n; u++)
        if (g->g[u] > g->g[melhor]) melhor = u;
    return melhor;
}
/* [/ex-d] */

int main(void) {
    Grafo d;
    inicia(&d);
    d.n = 4;
    arco(&d, 0, 1);
    arco(&d, 1, 2);
    arco(&d, 2, 3);
    printf("dirigido 0->1->2->3 tem ciclo? %s\n", tem_ciclo(&d) ? "sim" : "não");
    arco(&d, 3, 1);
    printf("após 3->1, tem ciclo? %s\n", tem_ciclo(&d) ? "sim" : "não");

    const int ar[][2] = {{0, 1}, {1, 2}, {3, 4}};
    printf("componentes (union-find) em 5 vértices: %d\n", componentes_uf(5, ar, 3));

    Grafo u;
    inicia(&u);
    u.n = 6;
    arco(&u, 0, 1); arco(&u, 1, 0);
    arco(&u, 0, 2); arco(&u, 2, 0);
    arco(&u, 2, 3); arco(&u, 3, 2);
    arco(&u, 3, 4); arco(&u, 4, 3);
    arco(&u, 1, 4); arco(&u, 4, 1);
    int caminho[V], tam = 0;
    if (caminho_bfs(&u, 0, 4, caminho, &tam)) {
        printf("menor caminho de 0 a 4:");
        for (int i = 0; i < tam; i++) printf(" %d", caminho[i]);
        printf("\n");
    }
    printf("vértice de maior grau de saída: %d\n", maior_grau(&u));
    return 0;
}
