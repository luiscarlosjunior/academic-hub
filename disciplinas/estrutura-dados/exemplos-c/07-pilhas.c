/*
 * Pilhas em C: push, pop, peek; parênteses; avaliação pós-fixa (RPN);
 * conversão infixa→pós-fixa; e exercícios resolvidos.
 * Compilar: cc -std=c11 -Wall -Wextra -pedantic 07-pilhas.c -o pilhas
 */
#include <ctype.h>
#include <stdio.h>
#include <string.h>

#define MAX 64

typedef struct {
    int d[MAX];
    int topo;                   /* índice do topo; -1 = vazia */
} Pilha;

/* [op:push] */
static int push(Pilha *p, int x) {
    if (p->topo + 1 == MAX) return 0;             /* cheia */
    p->d[++p->topo] = x;
    return 1;
}
/* [/op:push] */

/* [op:pop] */
static int pop(Pilha *p, int *x) {
    if (p->topo < 0) return 0;                    /* vazia */
    *x = p->d[p->topo--];
    return 1;
}
/* [/op:pop] */

/* [op:peek] */
static int peek(const Pilha *p, int *x) {
    if (p->topo < 0) return 0;
    *x = p->d[p->topo];
    return 1;
}
/* [/op:peek] */

static void pilha_iniciar(Pilha *p) { p->topo = -1; }

/* [op:parenteses] */
static int balanceada(const char *s) {
    Pilha p;
    pilha_iniciar(&p);
    for (; *s; s++) {
        int c = *s, t;
        if (c == '(' || c == '[' || c == '{') {
            push(&p, c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (!pop(&p, &t)) return 0;
            if ((c == ')' && t != '(') || (c == ']' && t != '[') || (c == '}' && t != '{'))
                return 0;
        }
    }
    return p.topo < 0;
}
/* [/op:parenteses] */

/* [op:rpn] */
static int avaliar_rpn(const char *expr, int *resultado) {
    Pilha p;
    pilha_iniciar(&p);
    const char *s = expr;
    while (*s) {
        if (isspace((unsigned char)*s)) {
            s++;
        } else if (isdigit((unsigned char)*s)) {
            int v = 0;
            while (isdigit((unsigned char)*s)) v = v * 10 + (*s++ - '0');
            push(&p, v);
        } else {
            int b, a, r;
            if (!pop(&p, &b) || !pop(&p, &a)) return 0;   /* faltam operandos */
            switch (*s) {
                case '+': r = a + b; break;
                case '-': r = a - b; break;
                case '*': r = a * b; break;
                case '/': if (b == 0) return 0; r = a / b; break;
                default: return 0;
            }
            push(&p, r);
            s++;
        }
    }
    if (p.topo != 0) return 0;                   /* deve sobrar exatamente um valor */
    *resultado = p.d[0];
    return 1;
}
/* [/op:rpn] */

/* [op:shunting-yard] */
static int precedencia(int op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    return 0;
}

static void infixa_para_posfixa(const char *in, char *out) {
    Pilha ops;
    pilha_iniciar(&ops);
    size_t k = 0;
    for (const char *s = in; *s; s++) {
        int t;
        if (isdigit((unsigned char)*s)) {
            out[k++] = *s;
        } else if (*s == '(') {
            push(&ops, '(');
        } else if (*s == ')') {
            while (peek(&ops, &t) && t != '(') {
                pop(&ops, &t);
                out[k++] = (char)t;
            }
            pop(&ops, &t);                       /* descarta '(' */
        } else {
            while (peek(&ops, &t) && t != '(' && precedencia(t) >= precedencia(*s)) {
                pop(&ops, &t);
                out[k++] = (char)t;
            }
            push(&ops, *s);
        }
    }
    int t;
    while (pop(&ops, &t)) out[k++] = (char)t;
    out[k] = '\0';
}
/* [/op:shunting-yard] */

/* [ex:min-pilha] */
typedef struct {
    Pilha dados;
    Pilha minimos;              /* guarda o mínimo de cada estado da pilha */
} PilhaMin;

static void pm_push(PilhaMin *p, int x) {
    push(&p->dados, x);
    int m;
    if (p->minimos.topo < 0 || (peek(&p->minimos, &m), x <= m)) push(&p->minimos, x);
}

static int pm_pop(PilhaMin *p, int *x) {
    if (!pop(&p->dados, x)) return 0;
    int m;
    peek(&p->minimos, &m);
    if (*x == m) pop(&p->minimos, &m);
    return 1;
}

static int pm_minimo(const PilhaMin *p, int *m) {
    return peek(&p->minimos, m);                 /* O(1) */
}
/* [/ex:min-pilha] */

/* [ex:proximo-maior] */
static void proximo_maior(const int a[], int res[], size_t n) {
    Pilha p;
    pilha_iniciar(&p);                           /* guarda índices, valores decrescentes */
    for (size_t i = 0; i < n; i++) res[i] = -1;
    for (size_t i = 0; i < n; i++) {
        int j = 0;
        while (peek(&p, &j) && a[j] < a[i]) {
            pop(&p, &j);
            res[j] = a[i];
        }
        push(&p, (int)i);
    }
}
/* [/ex:proximo-maior] */

/* [ex:remover-pares] */
static size_t remover_adjacentes(const char *s, char *out) {
    Pilha p;
    pilha_iniciar(&p);
    for (const char *c = s; *c; c++) {
        int t;
        if (peek(&p, &t) && t == *c) pop(&p, &t);
        else push(&p, *c);
    }
    size_t n = 0;
    for (int i = 0; i <= p.topo; i++) out[n++] = (char)p.d[i];
    out[n] = '\0';
    return n;
}
/* [/ex:remover-pares] */

int main(void) {
    const char *testes[] = {"{[()]}", "{[(])}", "((()"};
    for (int i = 0; i < 3; i++)
        printf("%-8s -> %s\n", testes[i], balanceada(testes[i]) ? "balanceada" : "não balanceada");

    const char *rpn[] = {"3 4 + 2 *", "5 1 2 + 4 * + 3 -", "1 +"};
    for (int i = 0; i < 3; i++) {
        int r = 0;
        if (avaliar_rpn(rpn[i], &r)) printf("RPN \"%s\" = %d\n", rpn[i], r);
        else printf("RPN \"%s\" inválida\n", rpn[i]);
    }

    const char *infixas[] = {"3+4*2", "(1+2)*3"};
    for (int i = 0; i < 2; i++) {
        char saida[64];
        infixa_para_posfixa(infixas[i], saida);
        printf("%-8s => %s\n", infixas[i], saida);
    }

    PilhaMin pm = {{{0}, -1}, {{0}, -1}};
    pm_push(&pm, 5);
    pm_push(&pm, 2);
    pm_push(&pm, 7);
    int m = 0, x = 0;
    pm_minimo(&pm, &m);
    printf("mínimo = %d\n", m);
    pm_pop(&pm, &x);
    pm_pop(&pm, &x);
    pm_minimo(&pm, &m);
    printf("após remover 2 e 7, mínimo = %d\n", m);

    const int seq[] = {4, 5, 2, 10, 8};
    int prox[5];
    proximo_maior(seq, prox, 5);
    printf("próximo maior de {4,5,2,10,8}:");
    for (int i = 0; i < 5; i++) printf(" %d", prox[i]);
    printf("\n");

    char limpa[16];
    size_t n = remover_adjacentes("abbaca", limpa);
    printf("remover pares adjacentes de \"abbaca\" -> \"%s\" (%zu)\n", limpa, n);
    return 0;
}
