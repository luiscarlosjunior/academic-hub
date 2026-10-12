/*
 * Mais exemplos de filas: fila de impressão, máximo de janela com deque,
 * alunos e sanduíches e geração de binários com fila.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 06-mais-exemplos.c -o mais
 */
#include <stdio.h>

#define CAP 64

typedef struct {
    int d[CAP];
    int ini, fim;      /* fim exclusivo; sem buffer circular para simplificar */
} Fila;

static void push(Fila *q, int x) { q->d[q->fim++] = x; }
static int pop(Fila *q) { return q->d[q->ini++]; }
static int vazia(const Fila *q) { return q->ini == q->fim; }

/* [ex-a] Impressora: a tarefa da frente sai se houver outra mais prioritária esperando. Conta a ordem de saída */
static int ordem_impressao(const int prio[], int n, int alvo) {
    Fila q = {{0}, 0, 0};
    int feito[16] = {0};
    for (int i = 0; i < n; i++) push(&q, i);
    int ordem = 0;
    while (!vazia(&q)) {
        int t = pop(&q);
        int maior = 0;                                   /* só tarefas ainda pendentes */
        for (int i = 0; i < n; i++)
            if (!feito[i] && prio[i] > maior) maior = prio[i];
        if (prio[t] < maior) { push(&q, t); continue; }   /* volta para o fim */
        feito[t] = 1;
        ordem++;
        if (t == alvo) return ordem;
    }
    return -1;
}
/* [/ex-a] */

/* [ex-b] Máximo de cada janela de tamanho k com deque (fila de duas pontas): O(n) */
static void maximos_janela(const int a[], int n, int k) {
    int dq[CAP], ini = 0, fim = 0;
    for (int i = 0; i < n; i++) {
        while (fim > ini && a[dq[fim - 1]] <= a[i]) fim--;   /* descarta os menores atrás */
        dq[fim++] = i;
        if (dq[ini] <= i - k) ini++;                          /* sai da janela pela frente */
        if (i >= k - 1) printf(" %d", a[dq[ini]]);
    }
    printf("\n");
}
/* [/ex-b] */

/* [ex-c] Alunos e sanduíches: quem está na frente da fila de sanduíches come ou desiste */
static int alunos_sem_almoco(const int alunos[], const int pilha[], int n) {
    Fila q = {{0}, 0, 0};
    for (int i = 0; i < n; i++) push(&q, alunos[i]);
    int idx = 0, falhas = 0;
    /* se todos os que restam recusaram o sanduíche do topo, ninguém mais come */
    while (!vazia(&q) && falhas < (int)(q.fim - q.ini)) {
        if (q.d[q.ini] == pilha[idx]) {
            pop(&q);
            idx++;
            falhas = 0;
        } else {
            push(&q, pop(&q));
            falhas++;
        }
    }
    return (int)(q.fim - q.ini);
}
/* [/ex-c] */

/* [ex-d] Números binários de 1 a n, gerados em ordem com uma fila: cada um gera dois novos */
static void binarios(int n) {
    Fila q = {{0}, 0, 0};
    push(&q, 1);
    /* a fila sempre contém strings em ordem; usamos inteiros que representam as strings em base 2 */
    for (int k = 0; k < n; k++) {
        int v = pop(&q);
        printf(" %d", v);
        push(&q, v * 10);
        push(&q, v * 10 + 1);
    }
    printf("\n");
}
/* [/ex-d] */

int main(void) {
    const int prio[] = {2, 1, 3, 2};
    printf("ordem de saída da tarefa 3 (prioridade 2): %d\n", ordem_impressao(prio, 4, 3));
    printf("ordem de saída da tarefa 1 (prioridade 1): %d\n", ordem_impressao(prio, 4, 1));

    const int a[] = {1, 3, -1, -3, 5, 3, 6, 7};
    printf("máximos de janelas de 3:");
    maximos_janela(a, 8, 3);

    const int alunos[] = {1, 1, 0, 0};
    const int sanduiches[] = {0, 1, 0, 1};
    printf("alunos sem almoço: %d\n", alunos_sem_almoco(alunos, sanduiches, 4));

    printf("os 10 primeiros binários (escritos como decimais):");
    binarios(10);
    return 0;
}
