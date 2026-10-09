/*
 * Grafos em C: lista de adjacências, BFS, DFS, componentes, ciclos,
 * Dijkstra, ordenação topológica e exercícios resolvidos.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 10-grafos.c -o grafos
 */
#include <limits.h>
#include <stdio.h>
#include <string.h>

#define MAXV 16

/* [op:lista-adjacencias] */
typedef struct {
    size_t V;                          /* número de vértices */
    int viz[MAXV][MAXV];               /* viz[u][k]: k-ésimo vizinho de u */
    int peso[MAXV][MAXV];              /* peso da aresta correspondente */
    size_t grau[MAXV];                 /* quantos vizinhos cada vértice tem */
} Grafo;

static void grafo_iniciar(Grafo *g, size_t V) {
    g->V = V;
    memset(g->grau, 0, sizeof g->grau);
}

static void grafo_aresta(Grafo *g, int u, int v, int w, int dirigido) {
    g->viz[u][g->grau[u]] = v;
    g->peso[u][g->grau[u]++] = w;
    if (!dirigido) {
        g->viz[v][g->grau[v]] = u;
        g->peso[v][g->grau[v]++] = w;
    }
}
/* [/op:lista-adjacencias] */

/* [op:bfs] */
static void bfs(const Grafo *g, int origem, int dist[]) {
    int fila[MAXV];
    size_t ini = 0, fim = 0;
    for (size_t i = 0; i < g->V; i++) dist[i] = -1;
    dist[origem] = 0;
    fila[fim++] = origem;
    while (ini < fim) {
        int u = fila[ini++];
        for (size_t k = 0; k < g->grau[u]; k++) {
            int v = g->viz[u][k];
            if (dist[v] < 0) {
                dist[v] = dist[u] + 1;
                fila[fim++] = v;
            }
        }
    }
}
/* [/op:bfs] */

/* [op:dfs] */
static void dfs_aux(const Grafo *g, int u, int vis[], int ordem[], size_t *n) {
    vis[u] = 1;
    ordem[(*n)++] = u;
    for (size_t k = 0; k < g->grau[u]; k++) {
        int v = g->viz[u][k];
        if (!vis[v]) dfs_aux(g, v, vis, ordem, n);
    }
}

static size_t dfs(const Grafo *g, int origem, int ordem[]) {
    int vis[MAXV] = {0};
    size_t n = 0;
    dfs_aux(g, origem, vis, ordem, &n);
    return n;
}
/* [/op:dfs] */

/* [op:componentes] */
static int componentes(const Grafo *g) {
    int vis[MAXV] = {0}, ordem[MAXV];
    int c = 0;
    for (size_t s = 0; s < g->V; s++)
        if (!vis[s]) {
            size_t n = 0;
            c++;
            dfs_aux(g, (int)s, vis, ordem, &n);
        }
    return c;
}
/* [/op:componentes] */

/* [op:ciclo] */
static int ciclo_aux(const Grafo *g, int u, int pai, int vis[]) {
    vis[u] = 1;
    for (size_t k = 0; k < g->grau[u]; k++) {
        int v = g->viz[u][k];
        if (!vis[v]) {
            if (ciclo_aux(g, v, u, vis)) return 1;
        } else if (v != pai) {
            return 1;                           /* aresta de retorno: há ciclo */
        }
    }
    return 0;
}

static int tem_ciclo(const Grafo *g) {          /* grafo não dirigido */
    int vis[MAXV] = {0};
    for (size_t s = 0; s < g->V; s++)
        if (!vis[s] && ciclo_aux(g, (int)s, -1, vis)) return 1;
    return 0;
}
/* [/op:ciclo] */

/* [op:dijkstra] */
static void dijkstra(const Grafo *g, int origem, int dist[]) {
    int feito[MAXV] = {0};
    for (size_t i = 0; i < g->V; i++) dist[i] = INT_MAX;
    dist[origem] = 0;
    for (size_t it = 0; it < g->V; it++) {
        int u = -1;
        for (size_t v = 0; v < g->V; v++)       /* escolhe o não visitado mais perto */
            if (!feito[v] && dist[v] != INT_MAX && (u < 0 || dist[v] < dist[u]))
                u = (int)v;
        if (u < 0) break;
        feito[u] = 1;
        for (size_t k = 0; k < g->grau[u]; k++) {
            int v = g->viz[u][k], w = g->peso[u][k];
            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
    }
}
/* [/op:dijkstra] */

/* [ex:grade] */
#define LIN 5
#define COL 6

static int caminho_grade(const char g[LIN][COL]) {
    int dist[LIN][COL];
    int fila[LIN * COL];
    size_t ini = 0, fim = 0;
    for (int i = 0; i < LIN; i++)
        for (int j = 0; j < COL; j++) dist[i][j] = -1;
    dist[0][0] = 0;
    fila[fim++] = 0;
    const int di[4] = {1, -1, 0, 0}, dj[4] = {0, 0, 1, -1};
    while (ini < fim) {
        int p = fila[ini++], i = p / COL, j = p % COL;
        for (int d = 0; d < 4; d++) {
            int ni = i + di[d], nj = j + dj[d];
            if (ni < 0 || nj < 0 || ni >= LIN || nj >= COL) continue;
            if (g[ni][nj] == '#' || dist[ni][nj] >= 0) continue;
            dist[ni][nj] = dist[i][j] + 1;
            fila[fim++] = ni * COL + nj;
        }
    }
    return dist[LIN - 1][COL - 1];
}
/* [/ex:grade] */

/* [ex:topologica] */
static int ordenacao_topologica(const Grafo *g, int ordem[]) {
    int entrada[MAXV] = {0}, fila[MAXV];
    size_t ini = 0, fim = 0, n = 0;
    for (size_t u = 0; u < g->V; u++)
        for (size_t k = 0; k < g->grau[u]; k++) entrada[g->viz[u][k]]++;
    for (size_t v = 0; v < g->V; v++)
        if (entrada[v] == 0) fila[fim++] = (int)v;
    while (ini < fim) {
        int u = fila[ini++];
        ordem[n++] = u;
        for (size_t k = 0; k < g->grau[u]; k++) {
            int v = g->viz[u][k];
            if (--entrada[v] == 0) fila[fim++] = v;
        }
    }
    return n == g->V;                 /* se faltou algum vértice, há ciclo */
}
/* [/ex:topologica] */

int main(void) {
    Grafo g;
    grafo_iniciar(&g, 7);
    grafo_aresta(&g, 0, 1, 1, 0);      /* A-B */
    grafo_aresta(&g, 0, 2, 1, 0);      /* A-C */
    grafo_aresta(&g, 1, 3, 1, 0);      /* B-D */
    grafo_aresta(&g, 1, 4, 1, 0);      /* B-E */
    grafo_aresta(&g, 2, 5, 1, 0);      /* C-F */
    grafo_aresta(&g, 4, 6, 1, 0);      /* E-G */
    grafo_aresta(&g, 5, 6, 1, 0);      /* F-G */

    int dist[MAXV];
    bfs(&g, 0, dist);
    printf("distâncias BFS a partir de A:");
    for (size_t i = 0; i < g.V; i++) printf(" %c=%d", 'A' + (int)i, dist[i]);
    printf("\n");

    int ordem[MAXV];
    size_t n = dfs(&g, 0, ordem);
    printf("DFS a partir de A:");
    for (size_t i = 0; i < n; i++) printf(" %c", 'A' + ordem[i]);
    printf("\n");
    printf("tem ciclo? %s\n", tem_ciclo(&g) ? "sim" : "não");

    Grafo h;
    grafo_iniciar(&h, 5);
    grafo_aresta(&h, 0, 1, 1, 0);
    grafo_aresta(&h, 2, 3, 1, 0);      /* segunda componente */
    grafo_aresta(&h, 3, 4, 1, 0);
    printf("componentes conexas = %d\n", componentes(&h));

    Grafo p;
    grafo_iniciar(&p, 5);
    grafo_aresta(&p, 0, 1, 4, 1);
    grafo_aresta(&p, 0, 2, 1, 1);
    grafo_aresta(&p, 2, 1, 2, 1);
    grafo_aresta(&p, 1, 3, 1, 1);
    grafo_aresta(&p, 2, 3, 5, 1);
    grafo_aresta(&p, 3, 4, 3, 1);
    dijkstra(&p, 0, dist);
    printf("Dijkstra de 0:");
    for (size_t i = 0; i < p.V; i++) printf(" %d", dist[i]);
    printf("\n");

    const char grade[LIN][COL] = {
        "..#...",
        ".##.#.",
        "...#..",
        "#.....",
        "..##.."
    };
    printf("menor caminho na grade = %d passos\n", caminho_grade(grade));

    Grafo t;
    grafo_iniciar(&t, 4);
    grafo_aresta(&t, 0, 1, 1, 1);      /* 0 antes de 1 */
    grafo_aresta(&t, 0, 2, 1, 1);
    grafo_aresta(&t, 1, 3, 1, 1);
    grafo_aresta(&t, 2, 3, 1, 1);
    int topo[MAXV];
    if (ordenacao_topologica(&t, topo)) {
        printf("ordem topológica:");
        for (size_t i = 0; i < t.V; i++) printf(" %d", topo[i]);
        printf("\n");
    }
    return 0;
}
