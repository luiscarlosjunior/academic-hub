# Banco de questões: C básica, ponteiros, vetores e matrizes

**Disciplina:** Estrutura de Dados  
**Itens:** 30 questões de múltipla escolha, cinco alternativas cada, uma correta.

> Cada questão traz um contexto, uma conversa entre alunos ou profissionais e a pergunta. Os programas em C foram compilados com `cc -std=c11` e as saídas indicadas conferem com a execução. O gabarito está ao final.

---

## Questão 01 · C básica

**Contexto.** Lucas está revisando um programa que declara um vetor local de inteiros e precisa entender quanta memória ele ocupa.

> **Lucas:** Declarei int a[10]. Se eu imprimir sizeof a, o que devo ver?  
> **Marina:** Depende do tamanho de int na sua plataforma. Rode e veja o que sai.  

**Considerando que int ocupa 4 bytes, qual é a saída do programa abaixo?**

```c
#include <stdio.h>

int main(void) {
    int a[10];
    printf("%zu\n", sizeof a);
    return 0;
}
```

A) 8  
B) 40  
C) 10  
D) 4  
E) 80  

---

## Questão 02 · C básica

**Contexto.** Duas colegas discutem a diferença entre o comprimento de uma string e o espaço que ela ocupa em um vetor de caracteres.

> **Bia:** Declarei char s[] = "vetor". Eu acho que strlen e sizeof dão o mesmo número.  
> **Rafael:** Pense no caractere de terminação. Teste e compare os dois valores.  

**Qual é a saída do programa abaixo?**

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[] = "vetor";
    printf("%zu %zu\n", strlen(s), sizeof s);
    return 0;
}
```

A) 6 e 6  
B) 4 e 5  
C) 5 e 5  
D) 6 e 5  
E) 5 e 6  

---

## Questão 03 · C básica

**Contexto.** Um estagiário escreveu uma função para 'zerar' um valor, mas não percebeu que a alteração não chega ao chamador.

> **Julia:** Eu chamei f(a) e esperava que a fosse alterado. Por que não foi?  
> **Ricardo:** Em C, o argumento é copiado. A função mexe apenas na cópia.  

**Qual é a saída do programa abaixo?**

```c
#include <stdio.h>

void f(int x) {
    x = 10;
}

int main(void) {
    int a = 3;
    f(a);
    printf("%d\n", a);
    return 0;
}
```

A) Erro de compilação  
B) 0  
C) Um valor de lixo de memória  
D) 10  
E) 3  

---

## Questão 04 · C básica

**Contexto.** Um aluno está estudando a precedência e os efeitos colaterais dos operadores de incremento em C.

> **Paula:** Na linha j = i++ * 3, qual valor de i entra na multiplicação?  
> **Caio:** O pós-incremento devolve o valor antigo e só depois soma 1. Confira com o código.  

**Qual é a saída do programa abaixo?**

```c
#include <stdio.h>

int main(void) {
    int i = 2;
    int j = i++ * 3;
    printf("i = %d, j = %d\n", i, j);
    return 0;
}
```

A) i = 3, j = 6  
B) i = 3, j = 8  
C) i = 2, j = 6  
D) i = 3, j = 9  
E) i = 2, j = 9  

---

## Questão 05 · C básica

**Contexto.** Num código de revisão, um vetor de cinco posições é percorrido por um laço escrito como for (i = 0; i <= 5; i++), e um colega pede a opinião sobre o trecho.

> **Ana:** O laço vai até i = 5 num vetor de 5 posições. Isso tem algum problema?  
> **Gustavo:** Claro. O último acesso ultrapassa o vetor, e a linguagem não avisa.  

**Em C, o que ocorre ao acessar um índice fora dos limites de um vetor, como em v[5] num vetor de 5 posições?**

A) O compilador sempre bloqueia o acesso e exibe uma mensagem de erro  
B) É comportamento indefinido: o programa pode travar, produzir lixo ou corromper outra variável, sem aviso.  
C) O valor devolvido é sempre zero, pois C preenche a memória com zeros  
D) O índice é automaticamente reduzido ao último elemento válido  
E) A linguagem lança uma exceção que pode ser capturada com try/catch  

---

## Questão 06 · C básica

**Contexto.** Duas profissionais revisam um módulo de C em produção e discutem o que acontece com um ponteiro depois de liberar a memória.

> **Fernanda:** Depois do free(p), o ponteiro ainda tem o mesmo endereço, certo?  
> **Thiago:** Exato. Ele virou um ponteiro pendurado. O que mais importa é o que se faz com ele depois.  

**Qual é a prática mais segura após liberar um bloco com free(p)?**

A) Multiplicar p por zero antes de reutilizá-lo  
B) Confiar que free zera o ponteiro automaticamente  
C) Atribuir NULL a p, para que qualquer uso posterior seja detectado com um teste explícito.  
D) Chamar free(p) de novo para garantir que a memória foi liberada  
E) Deixar p como está, pois o sistema impede acessos a memória liberada  

---

## Questão 07 · Ponteiros

**Contexto.** Em uma aula sobre ponteiros, a professora mostra como alterar uma variável indiretamente, pelo seu endereço.

> **Professora Helena:** Quando escrevo *p = 9, quem está sendo alterado?  
> **Tiago:** A variável para a qual p aponta, que é x.  

**Qual é a saída do programa abaixo?**

```c
#include <stdio.h>

int main(void) {
    int x = 5;
    int *p = &x;
    *p = 9;
    printf("%d\n", x);
    return 0;
}
```

A) 5  
B) Erro de compilação  
C) &x  
D) O endereço de x  
E) 9  

---

## Questão 08 · Ponteiros

**Contexto.** Dois colegas estudam aritmética de ponteiros sobre um vetor de quatro elementos.

> **Beatriz:** Se p = v + 1, então *p é v[1]? E p[2]?  
> **Leonardo:** Isso mesmo: p[k] é *(p + k). Vamos conferir com o código.  

**Qual é a saída do programa abaixo?**

```c
#include <stdio.h>

int main(void) {
    int v[4] = {10, 20, 30, 40};
    int *p = v + 1;
    printf("%d %d\n", *p, p[2]);
    return 0;
}
```

A) 20 20  
B) 10 30  
C) 20 30  
D) 30 50  
E) 20 40  

---

## Questão 09 · Ponteiros

**Contexto.** Um professor quer que os alunos entendam por que a notação de colchetes é apenas uma forma de escrever aritmética de ponteiros.

> **Professor Caio:** Qual expressão representa o mesmo valor que v[i]?  
> **Juliana:** Eu acho que é a soma do primeiro elemento com i, mas não tenho certeza.  

**Qual expressão é equivalente a v[i], para um vetor v e um índice i?**

A) *(&v + i)  
B) *v + i  
C) *(v + i)  
D) v + i  
E) &v[i] + 1  

---

## Questão 10 · Ponteiros

**Contexto.** Uma desenvolvedora sênior explica a uma estagiária por que uma função que recebe um vetor não consegue descobrir o tamanho dele com sizeof.

> **Estagiária:** Dentro de void f(int a[]), sizeof a não me dá o tamanho do vetor original. Por quê?  
> **Sênior:** Pense no que a função realmente recebe quando o vetor é passado como argumento.  

**Por que sizeof a, dentro de void f(int a[]), não fornece o número de elementos do vetor original?**

A) Porque sizeof não funciona com arrays de inteiros  
B) Porque sizeof só mede variáveis globais  
C) Porque o parâmetro é recebido como um ponteiro, e a informação sobre o tamanho do array não chega à função.  
D) Porque a função sempre recebe um vetor de um único elemento  
E) Porque o vetor é copiado inteiro e fica com tamanho zero  

---

## Questão 11 · Ponteiros

**Contexto.** Dois engenheiros revisam uma função que cresce um vetor com realloc e encontram um possível vazamento de memória.

> **Renato:** Olha esta linha: v->dados = realloc(v->dados, nova * sizeof *v->dados). Tem algo errado?  
> **Bruna:** Se o realloc falhar, ele devolve NULL, e o ponteiro original se perde.  

**Qual é a forma correta de usar realloc para evitar perder o bloco original em caso de falha?**

A) Verificar se v->dados é NULL antes de chamar realloc  
B) Guardar o retorno em um ponteiro temporário e só atribuir a v->dados se o valor não for NULL.  
C) Trocar realloc por calloc, que nunca falha  
D) Chamar free(v->dados) antes de realloc, para liberar espaço  
E) Atribuir o retorno diretamente a v->dados, pois realloc libera o bloco antigo antes de falhar  

---

## Questão 12 · Ponteiros

**Contexto.** Um grupo de estudo discute as diferenças entre ponteiros para constantes e ponteiros constantes.

> **Gabriel:** Quando escrevo const int *p, eu posso mudar o que p aponta?  
> **Carla:** Não através de p. Mas a pergunta importante é se p pode mudar de endereço.  

**Qual é o significado de const int *p?**

A) p pode apontar para outro endereço, mas o valor apontado não pode ser alterado através de p.  
B) A variável x apontada por p torna-se constante em todo o programa  
C) É equivalente a int * const p  
D) p não pode mudar de endereço, mas o valor apontado pode ser alterado  
E) Nem p nem o valor apontado podem ser alterados  

---

## Questão 13 · Ponteiros

**Contexto.** Num código de revisão, um desenvolvedor escreveu uma atribuição a partir de um ponteiro que ainda não foi inicializado com um endereço válido.

> **Marcos:** Eu inicializei p com NULL e depois fiz *p = 5. O que acontece?  
> **Simone:** Você está escrevendo em um endereço inválido. Isso não é tratado pela linguagem.  

**O que acontece ao executar *p = 5 quando p é NULL?**

A) O valor 5 é gravado no endereço zero, sem efeito colateral  
B) A atribuição é ignorada silenciosamente pelo compilador  
C) p passa a apontar para o endereço 5  
D) O compilador recusa o código por incompatibilidade de tipos  
E) É comportamento indefinido, geralmente com falha de segmentação. O correto é testar p != NULL antes de desreferenciar.  

---

## Questão 14 · Ponteiros

**Contexto.** Dois profissionais revisam uma matriz implementada com uma struct que guarda seus dados e as dimensões.

> **Eduarda:** No código aparece m->d[i * m->col + j]. Qual é o papel da seta?  
> **Vinicius:** Ela acessa o campo de uma struct a partir de um ponteiro. Pense em (*m).d.  

**No trecho m->d[i * m->col + j], o operador -> significa:**

A) Acesso a uma cópia da struct, que não altera o original  
B) Erro de sintaxe, pois ponteiros para struct não usam ponto nem seta  
C) Multiplicação entre o campo d e o ponteiro m  
D) Acesso ao campo da struct apontada por m; é equivalente a (*m).campo.  
E) Acesso ao endereço da struct, não ao campo  

---

## Questão 15 · Ponteiros

**Contexto.** Um aluno quer confirmar como o incremento de um ponteiro se relaciona com o tamanho do elemento apontado.

> **Heitor:** Quando faço p++ em um vetor de inteiros, o endereço sobe 1 byte?  
> **Letícia:** Não. O endereço avança pelo tamanho do tipo. Veja o resultado do código.  

**Qual é a saída do programa abaixo?**

```c
#include <stdio.h>

int main(void) {
    int v[3] = {1, 2, 3};
    int *p = v;
    p++;
    printf("%d\n", *p);
    return 0;
}
```

A) O endereço do segundo elemento, em hexadecimal  
B) 3  
C) 2  
D) 0  
E) 1  

---

## Questão 16 · Vetores

**Contexto.** Em uma discussão sobre desempenho, duas colegas comparam o custo de ler um elemento de um vetor com o custo de procurar um valor nele.

> **Nina:** Por que acessar v[i] é O(1), se o vetor pode ser grande?  
> **Tomás:** Pense no que o compilador precisa calcular para achar o elemento. Não há varredura.  

**Por que o acesso v[i] tem custo O(1) em um vetor?**

A) Porque o vetor é mantido ordenado internamente pela linguagem  
B) Porque C guarda um índice separado para cada elemento  
C) Porque C utiliza uma tabela hash para cada vetor  
D) Porque o endereço é calculado diretamente: endereço base + i × tamanho do elemento, sem percorrer nada.  
E) Porque o processador examina todos os elementos em paralelo  

---

## Questão 17 · Vetores

**Contexto.** Um time de desenvolvimento discute quando vale a pena usar busca binária em um vetor de consultas.

> **Rodrigo:** Se eu tiver um vetor de IDs, posso usar busca binária direto?  
> **Camila:** Depende de uma condição básica sobre os dados. Sem ela, o resultado é incorreto.  

**Qual é a pré-condição necessária para que a busca binária funcione corretamente?**

A) O vetor deve estar ordenado.  
B) O vetor deve ter tamanho igual a uma potência de 2  
C) O vetor não pode conter valores repetidos  
D) O vetor deve estar armazenado em uma lista encadeada  
E) O vetor deve ter pelo menos mil elementos  

---

## Questão 18 · Vetores

**Contexto.** Dois engenheiros analisam um vetor dinâmico que começa com capacidade zero e cresce dobrando quando fica cheio.

> **Otávio:** Se eu inserir 9 elementos, quantas vezes o vetor precisa realocar memória?  
> **Sofia:** Conte os momentos em que a capacidade precisa crescer: no primeiro elemento e nos seguintes pontos de dobra.  

**Considere um vetor que começa com capacidade 0, passa a 4 quando o primeiro elemento entra, e dobra quando fica cheio. Quantas realocações ocorrem ao inserir 9 elementos?**

```c
#include <stdio.h>
#include <stddef.h>

int main(void) {
    size_t cap = 0, tam = 0, realocacoes = 0;
    for (int k = 1; k <= 9; k++) {
        if (tam == cap) {
            cap = (cap == 0) ? 4 : cap * 2;
            realocacoes++;
        }
        tam++;
    }
    printf("%zu\n", realocacoes);
    return 0;
}
```

A) 3  
B) 9  
C) 2  
D) 1  
E) 4  

---

## Questão 19 · Vetores

**Contexto.** Uma estudante pergunta ao monitor qual é o custo de remover o primeiro elemento de um vetor com muitos valores.

> **Clara:** Se eu remover a posição 0, todos os outros precisam andar?  
> **Monitor:** Sim, para não deixar um buraco. Pense no que a remoção do meio faz com os elementos seguintes.  

**Qual é o custo, no pior caso, de remover o elemento da posição 0 de um vetor com n elementos?**

A) O(n²), pois cada deslocamento exige uma nova cópia do vetor  
B) O(1), pois basta trocar o primeiro elemento com o último  
C) O(log n), pela busca binária da posição  
D) O(1), pois a remoção apenas diminui o tamanho do vetor  
E) O(n), pois todos os elementos seguintes precisam ser deslocados uma posição para a esquerda.  

---

## Questão 20 · Vetores

**Contexto.** Duas profissionais implementam a remoção de duplicados de um vetor ordenado sem criar outro vetor, usando dois índices.

> **Patrícia:** Quantos elementos ficam no vetor depois da função, e quais são eles?  
> **Henrique:** Rode e confira. A função devolve o novo tamanho, e os primeiros valores são os distintos.  

**Qual é a saída do programa abaixo?**

```c
#include <stdio.h>
#include <stddef.h>

static size_t remover_duplicados(int a[], size_t n) {
    if (n == 0) return 0;
    size_t w = 1;
    for (size_t r = 1; r < n; r++)
        if (a[r] != a[w - 1]) a[w++] = a[r];
    return w;
}

int main(void) {
    int a[] = {1, 1, 2, 2, 2, 3};
    size_t n = remover_duplicados(a, 6);
    printf("%zu:", n);
    for (size_t i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
    return 0;
}
```

A) 4: 1 2 2 3  
B) 3: 1 2 3  
C) 3: 1 1 2  
D) 6: 1 1 2 2 2 3  
E) 2: 1 2  

---

## Questão 21 · Vetores

**Contexto.** Um grupo estuda como rotacionar um vetor à esquerda usando apenas inversões, sem memória extra.

> **Igor:** O método das três inversões funciona. Mas por que o último passo é necessário?  
> **Vanessa:** Depois das duas primeiras inversões, cada bloco está invertido. Pense na ordem final de cada bloco.  

**Ao rotacionar à esquerda com três inversões (a faixa [0,k), a faixa [k,n) e o vetor inteiro), por que a última inversão é necessária?**

A) Para restaurar o tamanho original do vetor após as trocas  
B) Porque inverter faixas não altera a posição dos elementos  
C) Porque cada bloco fica na ordem invertida após as duas primeiras; a inversão final restaura a ordem de cada bloco e coloca o bloco [k,n) no início.  
D) Para impedir que k seja maior que n  
E) Porque sem ela o vetor fica em ordem decrescente  

---

## Questão 22 · Vetores

**Contexto.** Dois profissionais de dados conversam sobre o problema de encontrar a maior soma contígua em uma série de variações diárias.

> **Felipe:** Essa série tem valores positivos e negativos. Qual a maior soma de um trecho contínuo?  
> **Luana:** Use o algoritmo de Kadane. Teste com o código para conferir o resultado.  

**Qual é a saída do programa abaixo?**

```c
#include <stdio.h>

int main(void) {
    int a[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    int n = 9;
    int melhor = a[0], atual = a[0];
    for (int i = 1; i < n; i++) {
        atual = (atual + a[i] > a[i]) ? atual + a[i] : a[i];
        if (atual > melhor) melhor = atual;
    }
    printf("%d\n", melhor);
    return 0;
}
```

A) 6  
B) 4  
C) 7  
D) -1  
E) 8  

---

## Questão 23 · Vetores

**Contexto.** Em uma entrevista técnica, o candidato é perguntado sobre o custo de encontrar um par com soma fixa em um vetor já ordenado.

> **Entrevistador:** Você já tem o vetor ordenado. Qual a complexidade de achar um par com soma X?  
> **Candidato:** Com dois índices, um de cada extremo, cada passo elimina um elemento.  

**Considerando o vetor já ordenado, qual é a complexidade de tempo para encontrar um par com soma fixa usando dois ponteiros?**

A) O(n log n)  
B) O(log n)  
C) O(n²)  
D) O(n)  
E) O(1)  

---

## Questão 24 · Matrizes

**Contexto.** Uma matriz de 3 linhas e 4 colunas é armazenada em linha-maior, como em C. Dois estudantes conferem a fórmula do índice linear.

> **Dayane:** Para a posição (2, 1), eu somo 2 + 1 = 3, certo?  
> **Eduardo:** Não. A linha pula de quatro em quatro posições. Use a fórmula i × C + j.  

**Em uma matriz de 3 × 4 armazenada em linha-maior, qual é a posição linear (começando em 0) do elemento (2, 1)?**

A) 11  
B) 8  
C) 9  
D) 6  
E) 7  

---

## Questão 25 · Matrizes

**Contexto.** Um desenvolvedor percebe que um algoritmo lento somava uma matriz percorrendo colunas. Ele pergunta à equipe por que trocar a ordem dos laços ajuda.

> **Arthur:** Os dois laços somam as mesmas células. Por que um é mais rápido?  
> **Melissa:** Pense em como os dados estão na memória e no que o cache traz em cada acesso.  

**Por que percorrer uma matriz em C por linhas costuma ser mais rápido do que por colunas?**

A) Porque a matriz é armazenada coluna por coluna em C  
B) Porque as linhas estão armazenadas de forma contígua, então os acessos consecutivos aproveitam o cache.  
C) Porque percorrer colunas usa mais memória de pilha  
D) Porque o percurso por colunas ignora o último elemento  
E) Porque o compilador só otimiza laços que percorrem linhas  

---

## Questão 26 · Matrizes

**Contexto.** Uma aluna explica a outra a diferença entre a transposta de uma matriz e a matriz original, na forma de dimensões.

> **Gisele:** Se a matriz tem 2 linhas e 5 colunas, como fica a transposta?  
> **Otávio:** As linhas viram colunas. Basta trocar as dimensões.  

**Qual é a dimensão da transposta de uma matriz de 2 linhas por 5 colunas?**

A) 10 linhas por 1 coluna  
B) 5 linhas por 5 colunas  
C) 2 linhas por 5 colunas  
D) 5 linhas por 2 colunas  
E) 2 linhas por 2 colunas  

---

## Questão 27 · Matrizes

**Contexto.** Em uma revisão de código, um colega perguntou por que a função de criação de matriz usa calloc e não malloc.

> **Samuel:** malloc não serve para uma matriz? Por que calloc aqui?  
> **Renata:** Os dois alocam o bloco. A diferença está no estado inicial da memória.  

**Qual é a principal vantagem de calloc, em relação a malloc, na criação de uma matriz dinâmica?**

A) calloc zera toda a memória alocada, então a matriz começa com zeros sem um laço de inicialização.  
B) calloc aceita tamanhos maiores que malloc, sem limite  
C) calloc é sempre mais rápido do que malloc, em qualquer caso  
D) malloc não permite liberar a memória depois com free  
E) calloc cria automaticamente uma matriz de ponteiros  

---

## Questão 28 · Matrizes

**Contexto.** Um grupo de estudo testa o percurso em espiral de uma matriz 3 × 3 preenchida com os números de 1 a 9.

> **Yuri:** Começamos no canto superior esquerdo e vamos para dentro. Qual é a ordem?  
> **Lívia:** Rode o código, que percorre as bordas e encolhe os limites a cada volta.  

**Qual é a saída do programa abaixo?**

```c
#include <stdio.h>
#include <stddef.h>

#define L 3
#define C 3

int main(void) {
    int m[L][C] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int saida[L * C];
    size_t n = 0, topo = 0, base = L, esq = 0, dir = C;
    while (topo < base && esq < dir) {
        for (size_t j = esq; j < dir; j++) saida[n++] = m[topo][j];
        topo++;
        for (size_t i = topo; i < base; i++) saida[n++] = m[i][dir - 1];
        dir--;
        if (topo < base) {
            for (size_t j = dir; j > esq; j--) saida[n++] = m[base - 1][j - 1];
            base--;
        }
        if (esq < dir) {
            for (size_t i = base; i > topo; i--) saida[n++] = m[i - 1][esq];
            esq++;
        }
    }
    for (size_t k = 0; k < n; k++) printf("%d%s", saida[k], k + 1 < n ? " " : "\n");
    return 0;
}
```

A) 9 8 7 6 5 4 3 2 1  
B) 1 2 3 6 9 8 7 5 4  
C) 1 2 3 4 5 6 7 8 9  
D) 1 2 3 6 9 8 7 4 5  
E) 1 4 7 8 9 6 3 2 5  

---

## Questão 29 · Matrizes

**Contexto.** Dois engenheiros estimam o custo do produto de duas matrizes, A de 2 × 3 e B de 3 × 2, com o algoritmo clássico de três laços.

> **Bianca:** Quantas multiplicações escalares são feitas no total?  
> **Pedro:** Cada célula do resultado soma K produtos. Multiplique o número de células pelo K.  

**Quantas multiplicações escalares o algoritmo clássico executa para calcular o produto de uma matriz 2 × 3 por uma matriz 3 × 2?**

A) 8  
B) 12  
C) 4  
D) 6  
E) 9  

---

## Questão 30 · Matrizes

**Contexto.** Um professor mostra uma matriz de 3 linhas e 4 colunas e pergunta quanto ela ocupa na memória quando os elementos são inteiros de 4 bytes.

> **Professor Caio:** Quanto vale sizeof m para int m[3][4], em bytes?  
> **Bia:** A matriz é um bloco contínuo de 3 × 4 inteiros. Confira o programa.  

**Qual é a saída do programa abaixo, considerando int com 4 bytes?**

```c
#include <stdio.h>

int main(void) {
    int m[3][4];
    printf("%zu\n", sizeof m);
    return 0;
}
```

A) 24  
B) 16  
C) 36  
D) 48  
E) 12  

---

## Gabarito

| Questão | Tema | Alternativa correta |
|---|---|---|
| 01 | C básica | **B** |
| 02 | C básica | **E** |
| 03 | C básica | **E** |
| 04 | C básica | **A** |
| 05 | C básica | **B** |
| 06 | C básica | **C** |
| 07 | Ponteiros | **E** |
| 08 | Ponteiros | **E** |
| 09 | Ponteiros | **C** |
| 10 | Ponteiros | **C** |
| 11 | Ponteiros | **B** |
| 12 | Ponteiros | **A** |
| 13 | Ponteiros | **E** |
| 14 | Ponteiros | **D** |
| 15 | Ponteiros | **C** |
| 16 | Vetores | **D** |
| 17 | Vetores | **A** |
| 18 | Vetores | **A** |
| 19 | Vetores | **E** |
| 20 | Vetores | **B** |
| 21 | Vetores | **C** |
| 22 | Vetores | **A** |
| 23 | Vetores | **D** |
| 24 | Matrizes | **C** |
| 25 | Matrizes | **B** |
| 26 | Matrizes | **D** |
| 27 | Matrizes | **A** |
| 28 | Matrizes | **D** |
| 29 | Matrizes | **B** |
| 30 | Matrizes | **D** |
