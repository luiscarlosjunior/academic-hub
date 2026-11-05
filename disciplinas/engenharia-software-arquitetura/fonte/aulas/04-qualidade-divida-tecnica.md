title: Qualidade interna, refatoração e dívida técnica
desc: Aula sobre qualidade interna de software: manutenibilidade e métricas (complexidade ciclomática), code smells, refatoração segura com testes de caracterização e dívida técnica, com exemplos executáveis, animação e testes mapeados.
icon: fa-broom
favicon: 🏭
topic: es/04-qualidade-divida-tecnica
---

## Visão geral {fa-eye}

Esta é a **Aula 4**. Todo software vive duas vidas. Na primeira, ele é construído e funciona. Na segunda, ele é alterado por anos, quase sempre por pessoas que não o escreveram. A **qualidade interna** (legibilidade, modularidade, testabilidade) decide quanto custa cada alteração nessa segunda vida. Código difícil de mudar não quebra no primeiro dia; ele desacelera a equipe a cada mês, até que uma mudança simples vira um projeto.

Ao final da aula você deverá ser capaz de:

- relacionar qualidade interna às características de manutenibilidade da norma ISO/IEC 25010;
- medir complexidade ciclomática de funções a partir do código-fonte e interpretar o resultado;
- reconhecer code smells e escolher a refatoração adequada para cada um;
- refatorar com segurança, usando testes de caracterização para fixar o comportamento;
- explicar dívida técnica como metáfora de custo, distinguir dívida deliberada de inadvertida e propor formas de pagamento.

> [!info] Pré-requisitos
> Aula 3 (testes). A seção 4 usa testes de caracterização, e a seção 5 usa o módulo `ast` de Python, que lê código sem executá-lo.

> [!tip] Leitura recomendada
> Refatorar é uma habilidade de prática. Ao ler a seção 4, reproduza cada transformação no seu próprio editor, com testes, e não apenas leia o exemplo.

:::mapa

## 1. Qualidade interna {fa-medal}

### 1.1 O modelo de qualidade

A norma ISO/IEC 25010 organiza a qualidade de produto de software em características, entre elas funcionalidade, desempenho, compatibilidade, usabilidade, confiabilidade, segurança, **manutenibilidade** e portabilidade. A manutenibilidade é a característica que governa a segunda vida do software, e se decompõe em subcaracterísticas: modularidade, reusabilidade, analisabilidade, modificabilidade e testabilidade.

Essas subcaracterísticas são observáveis no código. Um módulo modular tem responsabilidades claras; um trecho analisável pode ser compreendido sem ler todo o restante; um trecho modificável exige alterar poucos lugares; um trecho testável pode ser verificado isoladamente.

### 1.2 Coesão e acoplamento

Parnas (1972) mostrou que um sistema deve ser decomposto segundo as decisões que podem mudar, escondendo cada decisão atrás de uma fronteira. Essa ideia se traduz em duas propriedades clássicas. **Coesão** é o grau em que os elementos de um módulo pertencem uns aos outros: alta coesão é desejável. **Acoplamento** é o grau de dependência entre módulos: baixo acoplamento é desejável. Chidamber e Kemerer (1994) propuseram um conjunto de métricas orientadas a objetos, entre elas acoplamento entre objetos e falta de coesão, que se tornou referência acadêmica.

:::quiz T-04-01 | 1 | qualidade interna
P: Qual subcaracterística da manutenibilidade (ISO/IEC 25010) é mais diretamente afetada pela presença de dependências ocultas, como uma função que lê o relógio do sistema sem recebê-lo como parâmetro?
A) Portabilidade.
*B) Testabilidade.
C) Usabilidade.
D) Desempenho.
X: Uma dependência oculta impede que o trecho seja verificado isoladamente, porque o resultado depende de um fator que o teste não controla. Esse é o exemplo clássico de baixa testabilidade.
:::

## 2. Complexidade ciclomática {fa-diagram-project}

Thomas McCabe (1976) propôs a **complexidade ciclomática** de um programa como o número de caminhos linearmente independentes do grafo de controle. Para funções simples, a regra prática é: começa-se em 1 e soma-se 1 a cada ponto de decisão (um `if`, um laço, uma cláusula de exceção, um operador booleano que introduz uma ramificação). Uma função com complexidade 10 exige, no mínimo, dez casos de teste para cobrir todos os caminhos independentes.

A complexidade é uma **lista de revisão**, não uma meta. O valor 10 é uma convenção difundida, e não um limiar universal. Quando uma função ultrapassa esse valor, o indicado é revisá-la, não necessariamente dividi-la.

:::quiz T-04-02 | 2 | complexidade
P: Quantos caminhos independentes, no mínimo, uma função com três `if` sequenciais e nenhum outro desvio tem?
A) 3.
*B) 4.
C) 8.
D) 2.
X: A complexidade ciclomática é 1 + 3 = 4. Cada decisão acrescenta um caminho independente ao grafo de controle.
:::

## 3. Code smells {fa-biohazard}

Um **code smell** é um sintoma de que algo pode estar errado na estrutura do código. Fowler e Beck (1999), e depois Fowler (2018), catalogaram os mais frequentes e associaram a cada um uma transformação de refatoração. Os principais são:

- **Função longa**: faz várias coisas e exige rolagem para ser compreendida. Refatoração: *extrair função*.
- **Código duplicado**: a mesma regra aparece em mais de um lugar, e uma mudança exige editar todos. Refatoração: *extrair função* ou *extrair classe*.
- **Lista longa de parâmetros**: funções com muitos argumentos são fáceis de chamar errado. Refatoração: *introduzir objeto de parâmetro*.
- **Obsessão por primitivos**: dinheiro como `float`, status como número mágico. Refatoração: *substituir primitivo por objeto*.
- **Inveja de funcionalidade**: um método passa a maior parte do tempo lendo dados de outro objeto. Refatoração: *mover método*.
- **Cirurgia de espingarda**: uma mudança simples exige editar muitos arquivos. Refatoração: *juntar* as responsabilidades espalhadas.
- **Mudança divergente**: uma classe muda por motivos diferentes. Refatoração: *separar responsabilidades*, em linha com o princípio de responsabilidade única.

Smells não são proibidos. Uma função longa pode ser a forma mais clara de um algoritmo sequencial. O critério é se o smell atrapalha quem precisa mudar o código.

:::quiz T-04-03 | 2 | code smells
P: Uma mesma regra de cálculo de frete aparece em três módulos diferentes, e uma mudança de tarifa exige editar os três. Qual smell é esse e qual refatoração é indicada?
A) Função longa; dividir a função em partes menores.
*B) Código duplicado; extrair a regra para uma função ou módulo compartilhado.
C) Obsessão por primitivos; substituir o número por um objeto.
D) Inveja de funcionalidade; mover o método para outra classe.
X: Duplicação é o smell mais frequente e mais caro: a regra existe em três cópias que podem divergir. A extração centraliza a decisão em um único lugar.
:::

## 4. Refatoração segura {fa-wand-magic-sparkles}

### 4.1 Definição

Fowler (2018) define **refatoração** como uma mudança na estrutura interna do software que não altera o seu comportamento observável, feita em pequenos passos nomeados. A definição tem uma consequência prática decisiva: sem uma forma de verificar que o comportamento foi preservado, não há como saber se a refatoração foi correta. Por isso, refatorar sem testes é apenas alterar código.

### 4.2 Testes de caracterização

Feathers (2004), em *Working Effectively with Legacy Code*, definiu **código legado** como código sem testes, independentemente da idade. Antes de refatorar um trecho sem testes, escreve-se um **teste de caracterização**: um teste que registra o comportamento atual, mesmo que pareça errado. Ele não diz qual deveria ser o comportamento; diz qual é o comportamento hoje, para que qualquer mudança seja percebida. Se o sistema cobra 2,5% de juros e deveria cobrar 2%, o teste de caracterização registra os 2,5%, e a correção passa a ser uma decisão explícita e separada da refatoração.

O exemplo a seguir refatora uma função de cálculo de total com regra de desconto duplicada em uma tabela de dados. A equivalência é verificada sobre uma malha de entradas, o que é uma forma de caracterização mais forte do que alguns casos isolados.

:::run 04/01-caracterizacao.py

Note o que o programa demonstra: a malha de 48 combinações não encontra divergência entre as duas versões. Isso não prova equivalência para todas as entradas possíveis (o domínio é contínuo), mas dá confiança proporcional à cobertura da malha, e é exatamente o tipo de evidência que a refatoração exige.

> [!warn] Não refatore e corrija ao mesmo tempo
> Quando uma refatoração e uma mudança de comportamento estão no mesmo commit, um teste que falha não diz qual das duas causou a falha. Separe as mudanças: primeiro refatore com testes verdes, depois corrija com um teste novo que descreve o comportamento correto.

:::quiz T-04-04 | 2 | refatoração
P: Qual é a condição necessária para que uma transformação seja considerada refatoração?
A) O código deve ficar mais curto.
*B) O comportamento observável deve permanecer o mesmo, verificado por testes.
C) A transformação deve usar um padrão de projeto conhecido.
D) O tempo de execução deve diminuir.
X: A definição de refatoração depende da preservação do comportamento. Redução de linhas ou de tempo de execução podem ocorrer, mas não definem a refatoração.
:::

:::quiz T-04-05 | 3 | caracterização
P: Um teste de caracterização falha após uma refatoração. O que deve ser feito primeiro?
A) Atualizar o teste para o novo resultado, porque a refatoração é a fonte da verdade.
*B) Verificar se a mudança de resultado é intencional; se não for, o comportamento foi alterado e a refatoração deve ser corrigida.
C) Remover o teste, porque ele estava errado.
D) Ignorar a falha, porque testes de caracterização não são confiáveis.
X: O teste de caracterização registra o comportamento antes da refatoração. Uma falha indica mudança de comportamento, que pode ser um defeito introduzido ou uma mudança legítima que precisa ser decidida explicitamente.
:::

## 5. Medindo a complexidade no código real {fa-gauge}

A complexidade ciclomática pode ser calculada automaticamente. O programa a seguir percorre a árvore sintática de um trecho de código, sem executá-lo, e conta os pontos de decisão de cada função, aplicando a regra da seção 2.

:::run 04/02-complexidade.py

A função `processa`, com laço, condicional, operador `and` e `elif`, tem complexidade 5. A função `classifica` tem complexidade 4. Uma ferramenta profissional como o Radon (Python) ou o SonarQube aplica o mesmo raciocínio com regras mais completas.

:::quiz T-04-06 | 2 | medição
P: No programa de medição, por que o código é analisado com `ast.parse` em vez de ser executado?
A) Porque executar código é proibido pela linguagem.
*B) Porque a análise estática examina a estrutura sem depender de entradas, e não exige que o código seja executado com dados válidos.
C) Porque `ast.parse` é mais rápido que qualquer execução.
D) Porque o código analisado contém erros de sintaxe.
X: A análise estática lê a estrutura do programa. Ela é segura e reprodutível, e não depende de valores de entrada, o que a torna adequada para medir propriedades estruturais como a complexidade.
:::

## 6. Dívida técnica {fa-credit-card}

### 6.1 A metáfora

Cunningham (1992), em um relato de experiência sobre um sistema de gestão de portfólio, usou a expressão **dívida técnica** para descrever o custo futuro de escolhas de implementação que aceleram a entrega no presente. Como um empréstimo, a dívida pode ser uma decisão inteligente, se o valor obtido agora compensa os juros. Mas os juros se acumulam: cada funcionalidade nova sobre código confuso custa um pouco mais do que a anterior.

Kruchten, Nord e Ozkaya (2012) analisaram a metáfora e propuseram que a dívida técnica seja tratada como um conceito de engenharia, com tipos, custos e decisões explícitas. Ernst et al. (2015), em um estudo com praticantes, mostraram que a dívida é reconhecida por quase todos, mas que as equipes têm dificuldade de quantificá-la e de decidir quando pagá-la.

### 6.2 Tipos de dívida

Fowler propôs um quadrante que cruza dois eixos: **deliberada ou inadvertida** (a equipe sabia que estava fazendo uma escolha rápida?) e **prudente ou imprudente** (a equipe avaliou o trade-off?). Uma dívida deliberada e prudente é legítima: lançar um protótipo para validar uma hipótese, sabendo que ele será descartado. Uma dívida inadvertida e imprudente é a mais perigosa, porque ninguém a enxerga até que cada mudança leve semanas.

:::quiz T-04-07 | 2 | dívida técnica
P: Uma equipe lança um protótipo rápido para validar uma hipótese com usuários, sabendo que ele será descartado. Como a dívida é classificada no quadrante de Fowler?
A) Inadvertida e imprudente.
B) Inadvertida e prudente.
*C) Deliberada e prudente.
D) Deliberada e imprudente.
X: A equipe sabia da escolha (deliberada) e avaliou o trade-off (prudente). O risco surge quando o protótipo descartável é promovido a produto sem reescrita.
:::

### 6.3 Pagamento

Pagar dívida técnica é refatorar com um propósito: reduzir o custo de mudanças futuras nas áreas que mais mudam. Três práticas funcionam bem. A **regra do escoteiro**, atribuída a Robert Martin, recomenda deixar o código um pouco melhor do que foi encontrado a cada alteração. A **reserva de capacidade** destina uma fração fixa de cada iteração à melhoria. E a **priorização por ponto quente** concentra o esforço nos arquivos que mudam com mais frequência, como Tornhill (2015) mostra ao combinar histórico de versões com complexidade.

:::quiz T-04-08 | 3 | pagamento
P: Qual critério torna a priorização da dívida técnica mais eficaz?
A) Pagar primeiro o código mais antigo do sistema.
*B) Concentrar o esforço em áreas com alta complexidade e alta frequência de mudança, onde os juros são maiores.
C) Refatorar todo o sistema de uma vez, em um período dedicado.
D) Pagar a dívida apenas quando ela causar uma falha em produção.
X: Os juros da dívida são proporcionais à frequência com que o código difícil é tocado. A combinação de complexidade e de frequência de mudança indica onde pagar primeiro.
:::

### 6.4 Animação: os juros sprint a sprint

A animação compara duas equipes com a mesma capacidade. Na primeira, a parcela de capacidade que vai para contornar código difícil cresce a cada Sprint. Na segunda, 10% da capacidade é reservada para refatorar, e a entrega de funcionalidades se mantém.

:::anim
canvas: cvDivida
ctl: ctlDivida
cap: capDivida
desenha: desenhaDivida
gera: geraDivida
velocidade: 2200
opcoes: sem=Sem refatorar;com=Refatorando 10% por Sprint
:::

## 7. Mercado de trabalho {fa-briefcase}

Na indústria, a qualidade interna é medida por ferramentas de análise estática (SonarQube, Radon, ESLint e outras), revisada em pull requests (Aula 9) e discutida em retrospectivas. Organizações que publicam sobre o tema costumam relatar a dívida técnica em termos de tempo de remediação estimado, e não em valores absolutos, o que é uma convenção útil e também uma simplificação. A competência valorizada em entrevistas é a capacidade de justificar uma refatoração em termos de custo de mudança futuro, e não de gosto estético.

## 8. Erros comuns {fa-triangle-exclamation}

- **Reescrever tudo.** A reescrita total costuma reintroduzir defeitos que o código antigo já tinha resolvido. A alternativa é a refatoração por partes, com o sistema funcionando em todo momento (Aula 8).
- **Refatorar sem testes.** Sem verificação, cada transformação é um palpite.
- **Métricas como meta.** Quando a complexidade vira meta, as funções são divididas em pedaços sem sentido, e a legibilidade piora.
- **Copiar em vez de extrair.** Duplicação "temporária" tende a se tornar permanente.
- **TODO sem dono.** Um comentário de dívida sem responsável e sem prazo é dívida invisível.

:::exercicio T-04-E1 | 2 | refatoração
A função abaixo calcula a média final de um aluno, aplica uma regra de situação e imprime o resultado. Proponha uma sequência de três refatorações pequenas, indique que teste de caracterização escreveria antes e explique por que a separação entre cálculo e impressão melhora a testabilidade.

```python
def boletim(notas, pesos):
    soma = 0
    for n, p in zip(notas, pesos):
        soma += n * p
    media = soma / sum(pesos)
    if media >= 7:
        sit = "aprovado"
    elif media >= 4:
        sit = "recuperação"
    else:
        sit = "reprovado"
    print(f"média {media:.2f}: {sit}")
    return media
```
:::gabarito
Uma sequência razoável: (1) extrair o cálculo da média para uma função `media_ponderada(notas, pesos)`, mantendo o `zip`; (2) extrair a regra de situação para `situacao(media)`, com as constantes 7 e 4 nomeadas (`NOTA_APROVACAO`, `NOTA_RECUPERACAO`); (3) separar a impressão, deixando `boletim` apenas como composição, ou remover a impressão para a camada de apresentação. Antes de qualquer passo, o teste de caracterização deve chamar `boletim` com um conjunto de notas e pesos (incluindo a média exatamente 7 e exatamente 4) e registrar a saída impressa e o retorno. A separação melhora a testabilidade porque a regra de situação passa a ser uma função pura: entrada numérica, saída textual, sem efeito colateral. Ela pode ser testada com valores-limite sem capturar a saída do terminal.
:::

:::exercicio T-04-E2 | 3 | dívida técnica
Uma equipe identificou uma dívida técnica em um módulo de faturamento, que muda em quase toda Sprint e tem complexidade alta. A gerência pede para “pagar a dívida no próximo trimestre, em um projeto separado”. Argumente se essa decisão é adequada e proponha uma alternativa com base nos conceitos da aula.
:::gabarito
A decisão de adiar a dívida para um projeto separado é frágil por três razões: (1) o módulo muda em quase toda Sprint, então os juros continuam sendo pagos enquanto o projeto não começa; (2) projetos separados de limpeza tendem a ser cancelados quando a pressão por funcionalidades aumenta; (3) a dívida não foi classificada, e sem classificação não se sabe se ela é deliberada e prudente, ou inadvertida e imprudente. Uma alternativa consistente com a aula: reservar uma fração fixa da capacidade de cada Sprint para o módulo, priorizando as funções mais complexas e mais alteradas (ponto quente), e medir o custo das mudanças antes e depois. Essa abordagem paga a dívida no ritmo em que ela é tocada, e torna o progresso visível para a gerência.
:::

## Resumo da aula {fa-square-check}

- Qualidade interna determina o custo das mudanças; a ISO/IEC 25010 a decompõe em subcaracterísticas observáveis.
- Complexidade ciclomática conta caminhos independentes e serve como lista de revisão.
- Code smells apontam refatorações; sua presença não é, por si, um erro.
- Refatoração preserva o comportamento, e só é verificável com testes, de preferência de caracterização.
- Dívida técnica é uma escolha com juros: classifique-a, meça-a e pague-a onde os juros são maiores.

## Referências {fa-book}

**Acadêmicas e fundacionais**

- CHIDAMBER, S. R.; KEMERER, C. F. A metrics suite for object oriented design. *IEEE Transactions on Software Engineering*, v. 20, n. 6, p. 476–493, 1994.
- CUNNINGHAM, W. The WyCash Portfolio Management System. In: *OOPSLA '92 Experience Report*, 1992.
- ERNST, N. A. et al. Measure it? Manage it? Ignore it? Software practitioners and technical debt. In: *Proceedings of the 10th Joint Meeting of ESEC/FSE*, 2015.
- FEATHERS, M. *Working Effectively with Legacy Code*. Upper Saddle River: Prentice Hall, 2004.
- FOWLER, M.; BECK, K. *Refactoring: Improving the Design of Existing Code*. Reading: Addison-Wesley, 1999.
- FOWLER, M. *Refactoring: Improving the Design of Existing Code*. 2. ed. Boston: Addison-Wesley, 2018.
- KRUCHTEN, P.; NORD, R. L.; OZKAYA, I. Technical debt: from metaphor to theory and practice. *IEEE Software*, v. 29, n. 6, p. 18–21, 2012.
- MCCABE, T. J. A complexity measure. *IEEE Transactions on Software Engineering*, v. SE-2, n. 4, p. 308–320, 1976.
- PARNAS, D. L. On the criteria to be used in decomposing systems into modules. *Communications of the ACM*, v. 15, n. 12, p. 1053–1058, 1972.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.
- ISO/IEC 25010:2023. *Systems and software engineering: SQuaRE: Product quality model*. Genebra: ISO, 2023.

**Prática e mercado**

- KERIEVSKY, J. *Refactoring to Patterns*. Boston: Addison-Wesley, 2004.
- MARTIN, R. C. *Clean Code: A Handbook of Agile Software Craftsmanship*. Upper Saddle River: Prentice Hall, 2008.
- TORNHILL, A. *Your Code as a Crime Scene*. Raleigh: Pragmatic Bookshelf, 2015.
- SONARSOURCE. *Documentação do SonarQube: dívida técnica*. [docs.sonarsource.com](https://docs.sonarsource.com/)
