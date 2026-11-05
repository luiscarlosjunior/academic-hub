title: Testes de software: técnicas de caixa-preta e caixa-branca, pirâmide, mutação e testes frágeis
desc: Aula de testes de software: o que um teste prova, partições de equivalência, valores-limite, cobertura e teste de mutação, pirâmide de testes, testes intermitentes e um laboratório com unittest executável.
icon: fa-vial
favicon: 🏭
topic: es/03-testes-de-software
---

## Visão geral {fa-eye}

Esta é a **Aula 3**. Testar software é reduzir incerteza, não provar correção. Em 1970, Dijkstra resumiu essa limitação ao escrever que testes podem mostrar a presença de defeitos, mas nunca a sua ausência (Dijkstra, 1970). A pergunta útil não é "o software está testado?", e sim "quais defeitos plausíveis os meus testes conseguiriam detectar, e quais eles deixariam passar?".

Ao final da aula você deverá ser capaz de:

- diferenciar testes de unidade, integração, sistema e aceitação pelo escopo e pelo que cada um prova;
- aplicar partições de equivalência e análise de valores-limite para escolher casos com alto poder de detecção;
- explicar por que cobertura é um indicador de lacunas e não uma garantia de qualidade, e medir a eficácia de uma suíte com teste de mutação;
- justificar a pirâmide de testes em termos de custo e de diagnóstico;
- diagnosticar testes intermitentes e propor correções.

> [!info] Pré-requisitos
> Aulas 1 e 2, e programação em Python com funções e listas. Os exemplos usam apenas `unittest` e `exec` da biblioteca padrão.

> [!tip] Estratégia de estudo
> Esta aula trabalha muito com **casos de borda**. Antes de olhar qualquer gabarito, tente escrever, para cada exercício, pelo menos um caso que o código correto passa e um caso que um código errado plausível não passaria. Essa é a habilidade central de teste.

:::mapa

## 1. O que é um teste e o que ele prova {fa-circle-question}

### 1.1 Teste como experimento

Um **teste** é um experimento: uma entrada é fornecida ao sistema, o resultado é observado e comparado com um **oráculo**, isto é, a expectativa do que deveria acontecer. A qualidade de um teste depende de duas coisas: a escolha da entrada (que determina quais comportamentos são exercitados) e a qualidade do oráculo (que determina se um comportamento errado será notado). Um teste sem asserção exercita código sem verificá-lo; é o pior dos casos.

Myers, Sandler e Badgett (2011) definem o teste como o processo de executar um programa com a intenção de encontrar defeitos, e não de demonstrar que ele funciona. Essa inversão de intenção é o núcleo da disciplina: um testador que quer provar que o software funciona escolhe casos fáceis; um testador que quer encontrar defeitos escolhe casos difíceis.

### 1.2 Níveis de teste

Os níveis se diferenciam pelo **escopo** e pelo tipo de defeito que tendem a revelar:

| Nível | Escopo | Defeitos típicos | Custo de execução |
|---|---|---|---|
| Unidade | uma função ou classe, com dependências substituídas | lógica, cálculo, casos de borda | muito baixo |
| Integração | módulos reais combinados | contratos, formatos, configuração | médio |
| Sistema | aplicação completa em ambiente parecido com produção | fluxos ponta a ponta, desempenho | alto |
| Aceitação | critérios do cliente (Aula 2) | interpretação de requisito | alto e manual, em parte |

Os níveis são complementares. Nenhum substitui os outros, e a proporção entre eles é tema da seção 5.

### 1.3 Caixa-preta e caixa-branca

Na **caixa-preta** (ou funcional), o testador conhece apenas a especificação: entradas e saídas esperadas. Na **caixa-branca** (ou estrutural), o testador conhece o código e escolhe casos para exercitar caminhos, ramos e condições. As técnicas da seção 2 são de caixa-preta; a cobertura da seção 4 é de caixa-branca. Ambas são necessárias: a caixa-preta encontra o que o código deveria fazer, e a caixa-branca encontra caminhos que nenhuma especificação mencionou.

:::quiz T-03-01 | 1 | fundamentos
P: Segundo a visão de Myers et al. (2011), qual é a intenção correta ao projetar um teste?
A) Demonstrar que o programa funciona nos casos esperados.
*B) Encontrar defeitos, escolhendo entradas que tenham boa chance de revelá-los.
C) Aumentar a cobertura de linhas para atingir uma meta da organização.
D) Garantir que o sistema está livre de defeitos antes da entrega.
X: A intenção de Myers é inverter o foco: testar é tentar falhar o programa. Demonstrar funcionamento escolhe casos fáceis e deixa defeitos sem detecção.
:::

## 2. Técnicas para escolher casos de teste {fa-sliders}

### 2.1 Partição de equivalência

O domínio de entrada é dividido em **classes de equivalência**: conjuntos de valores que, em teoria, se comportam da mesma forma. Basta um representante de cada classe válida e um de cada classe inválida. Para a regra "idade entre 18 e 65 anos", as classes são: menores de 18 (inválida), de 18 a 65 (válida) e maiores de 65 (inválida).

A hipótese da partição é uma **hipótese**, não uma certeza. Ela supõe que o código trata de forma uniforme todos os valores da classe. Quando essa suposição é falsa, o defeito costuma estar na fronteira entre classes, o que leva à técnica seguinte.

### 2.2 Análise de valores-limite

Defeitos se concentram nas fronteiras. Por isso, a técnica manda testar o valor imediatamente abaixo, exatamente no limite e imediatamente acima de cada fronteira. Para a faixa de 18 a 65, os valores são 17, 18, 19, 64, 65 e 66. Em aritmética de ponto flutuante, os "imediatamente abaixo" e "imediatamente acima" devem ser escolhidos com cuidado, porque 99.99 e 100.01 não são os vizinhos reais de 100 em precisão dupla; são apenas valores próximos o bastante para um teste de intenção.

O exemplo a seguir aplica as duas técnicas à regra de desconto "compras a partir de R$ 100,00 ganham 5%". A suíte é escrita com `unittest`, da biblioteca padrão.

:::run 03/01-valores-limite.py

Repare que o caso `test_limite_inferior_da_particao_com_desconto` é o que mais importa. A regra diz "a partir de", que é inclusiva; um código que usa `>` em vez de `>=` passaria em todos os outros casos e só falharia aqui.

:::quiz T-03-02 | 2 | valores-limite
P: Para a regra "pedidos de até 10 itens têm frete grátis", quais valores são os mais úteis para a análise de valores-limite?
A) 1, 5 e 20.
*B) 9, 10 e 11.
C) 0, 100 e 1000.
D) 10 apenas, porque é o único limite.
X: A técnica testa o valor abaixo, o limite e o valor acima. Os valores 9, 10 e 11 exercitam exatamente a fronteira do "até 10".
:::

### 2.3 Tabelas de decisão

Quando um resultado depende de combinações de condições, uma **tabela de decisão** lista todas as combinações relevantes e o resultado de cada uma. Ela torna visíveis as combinações que ninguém pensou em testar, e é especialmente útil para regras de negócio com três ou mais condições.

:::quiz T-03-03 | 2 | técnicas
P: Uma regra depende de duas condições binárias (cliente VIP e pedido acima de R$ 500). Quantos casos a tabela de decisão completa contém?
A) 2.
*B) 4.
C) 8.
D) 6.
X: Duas condições binárias geram 2 × 2 = 4 combinações. Com três condições seriam 8. A tabela completa é o ponto de partida para decidir quais combinações merecem teste explícito.
:::

## 3. Testes de unidade na prática {fa-flask}

Um teste de unidade bem escrito tem três partes, conhecidas como *arrange, act, assert* (preparar, agir, verificar). A convenção ajuda o leitor a identificar a intenção do teste em segundos. Três práticas são decisivas. Primeira: **um comportamento por teste**, para que a falha aponte a regra quebrada. Segunda: **nomes que descrevem a regra**, como `test_limite_inferior_da_particao_com_desconto`, em vez de `test_2`. Terceira: **independência**, de modo que nenhum teste dependa da ordem de execução dos outros.

Dublês de teste (*test doubles*) substituem dependências reais quando elas são lentas, externas ou não determinísticas (Meszaros, 2007). A Aula 11 os trata em profundidade.

:::quiz T-03-04 | 2 | unidade
P: Por que um teste deve verificar apenas um comportamento?
A) Porque o framework de testes não aceita mais de uma asserção.
*B) Para que, ao falhar, o teste aponte precisamente a regra quebrada, reduzindo o custo de diagnóstico.
C) Porque testes longos são sempre mais lentos.
D) Porque testes com várias asserções não podem ser executados em paralelo.
X: O valor de um teste está no diagnóstico. Um teste com cinco asserções que falha não diz qual das cinco regras foi violada.
:::

## 4. Cobertura e teste de mutação {fa-chart-simple}

### 4.1 Cobertura de código

**Cobertura** mede a fração do código executada pelos testes: de linhas, de ramos (cada lado de uma decisão), de condições e de caminhos. Ela é um **indicador de lacunas**: um trecho que nenhum teste executa é, com certeza, não verificado. Ela não indica se o que foi executado está correto.

Inozemtseva e Holmes (2014), em estudo sobre projetos Java, encontraram que a cobertura se correlaciona fracamente com a eficácia da suíte quando o nível de cobertura é controlado, o que reforça que cobertura não deve ser uma meta isolada. A Lei de Goodhart explica o mecanismo: quando a cobertura vira meta, as equipes escrevem testes que executam código sem verificar resultados.

### 4.2 Teste de mutação

O **teste de mutação** avalia diretamente a capacidade de detecção. Introduz-se um pequeno defeito artificial no código (um **mutante**), como trocar `>=` por `>` ou um operador lógico por outro, e verifica-se se algum teste falha. Um mutante que causa falha está **morto**; um que passa em todos os testes **sobreviveu**, e revela um comportamento que a suíte não verifica. A técnica tem origem em DeMillo, Lipton e Sayward (1978), e a revisão de Jia e Harman (2011) é a referência mais citada sobre seu desenvolvimento.

O programa a seguir executa a análise de mutação sobre a regra de desconto, com uma suíte inicial e uma suíte reforçada.

:::run 03/02-mutacao.py

Os resultados mostram o que a cobertura esconderia. A suíte inicial executa todas as linhas da função, então teria cobertura total, e mesmo assim deixa vivo o mutante que troca `>=` por `>`. Basta acrescentar o caso exatamente no limite para matá-lo.

> [!warn] Mutação é cara
> Em projetos grandes, o número de mutantes cresce rapidamente e a execução pode ser lenta. Ferramentas como PIT (Java) e mutmut (Python) aplicam estratégias de amostragem e de execução seletiva. A técnica deve ser usada em módulos críticos, não em todo o sistema por padrão.

:::quiz T-03-05 | 3 | cobertura e mutação
P: Uma suíte atinge 100% de cobertura de linhas, mas um mutante que troca `>=` por `>` sobrevive. O que isso indica?
A) Que a suíte está completa e o mutante é inválido.
*B) Que a suíte executa o código sem verificar a fronteira exata da regra.
C) Que a cobertura de linhas é a métrica errada e deve ser substituída por cobertura de ramos.
D) Que o teste de mutação deve ser abandonado.
X: A cobertura registra execução, não verificação. O mutante sobrevivente revela um valor-limite não testado, o que é a lacuna exata que a análise de valores-limite procura preencher.
:::

:::quiz T-03-06 | 3 | cobertura e mutação
P: Por que cobertura de código é mais bem usada como lista de lacunas do que como meta de qualidade?
A) Porque ela só pode ser medida manualmente.
*B) Porque é possível atingir cobertura alta com testes que não verificam resultados, e a métrica então deixa de refletir qualidade.
C) Porque ela não mede linhas de código.
D) Porque ela não se aplica a linguagens dinâmicas.
X: Cobertura alta com asserções fracas é uma combinação comum. A métrica só se torna informativa quando acompanhada de verificação, como a mutação.
:::

## 5. A pirâmide de testes {fa-mountain}

Cohn (2009) popularizou a **pirâmide de testes**: muitos testes de unidade na base, menos testes de integração no meio e poucos testes ponta a ponta no topo. Fowler (2012) detalhou o argumento: testes de nível mais alto são mais lentos, mais caros de manter e mais sujeitos a falhas que não têm relação com o defeito, como uma rede instável ou um dado de teste alterado.

A pirâmide é uma heurística, não uma lei. Sistemas com muita lógica de interface podem demandar mais testes de componente. Sistemas que são essencialmente integrações podem demandar mais testes de contrato. O princípio que se mantém é: **teste cada comportamento no nível mais baixo que ainda o expressa**. Um cálculo de imposto se testa como função, não pela interface.

A animação mostra a execução de uma suíte organizada como pirâmide, e o momento em que um defeito de cálculo aparece apenas no topo, o que é o cenário que a pirâmide busca evitar.

:::anim
canvas: cvTestes
ctl: ctlTestes
cap: capTestes
desenha: desenhaTestes
gera: geraTestes
velocidade: 2800
:::

:::quiz T-03-07 | 2 | pirâmide
P: Qual é o argumento econômico central da pirâmide de testes?
A) Testes de ponta a ponta são obrigatórios por lei.
*B) Testes de níveis mais altos são mais lentos, mais caros e mais frágeis, então devem ser poucos e reservados para fluxos essenciais.
C) Testes de unidade não detectam defeitos de cálculo.
D) A base deve ter poucos testes para acelerar o desenvolvimento.
X: Quanto mais alto o nível, maior o custo por teste e menor a precisão do diagnóstico. A pirâmide distribui o esforço de verificação onde ele é mais barato e mais informativo.
:::

## 6. Testes intermitentes {fa-bug}

Um teste **intermitente** (*flaky*) passa e falha sem que o código tenha mudado. Luo et al. (2014) analisaram testes intermitentes em projetos Apache e identificaram causas recorrentes: dependência de concorrência, de ordem de execução, de tempo e de recursos externos. O dano é grave: quando uma equipe aprende que "aquele teste às vezes falha", ela deixa de investigar falhas reais.

As causas mais frequentes são: dependência da hora do sistema ou do fuso horário; estado compartilhado entre testes; esperas fixas (`sleep`) em vez de condições explícitas; e chamadas reais a serviços externos. A correção consiste em tratar a intermitência como defeito de prioridade igual à de um bug de produção, isolar o estado e controlar o tempo. Se a causa não for encontrada rapidamente, o teste vai para quarentena com dono e prazo, e nunca para o esquecimento.

:::quiz T-03-08 | 2 | intermitência
P: Um teste de sistema falha às segundas-feiras de manhã e passa no resto da semana. Qual é a hipótese mais plausível a investigar primeiro?
A) O código foi alterado aos fins de semana.
*B) O teste depende da data ou da hora do sistema, ou de estado deixado por execuções anteriores.
C) A linguagem tem um erro de compilação intermitente.
D) O teste está correto e a falha deve ser ignorada.
X: Padrões temporais são pistas fortes de dependência de tempo. A hipótese deve ser testada controlando o relógio e o estado inicial do teste.
:::

## 7. Mercado de trabalho {fa-briefcase}

Na indústria, testes são organizados em camadas, executadas em pipeline (Aula 12). Frameworks como JUnit (Java), pytest e unittest (Python) e Jest (JavaScript) são padrão de fato. A certificação ISTQB (International Software Testing Qualifications Board) é a referência mais difundida de vocabulário e técnicas de teste no mercado, e o seu programa de fundamentos cobre as técnicas desta aula. Empresas de software com ciclos de entrega curtos publicam práticas de teste em seus blogs de engenharia, e o tema da confiabilidade de testes automatizados é um dos mais discutidos na comunidade. Para o estudante, a competência valorizada é a capacidade de escolher casos de borda com justificativa, e não apenas de escrever asserções.

## 8. Erros comuns {fa-triangle-exclamation}

- **Testar a implementação, não o comportamento.** Um teste que quebra quando um método privado é renomeado está acoplado demais à forma interna.
- **Asserções fracas.** Um teste que verifica apenas que a função não lançou exceção não detecta resultados errados.
- **Muitos mocks.** Simular a própria lógica do sistema faz o teste verificar a simulação, não o sistema.
- **Confiar na cobertura.** Cobertura alta com asserções fracas é uma ilusão de segurança.
- **Ignorar testes intermitentes.** Cada falha ignorada reduz a confiança da equipe em toda a suíte.

:::exercicio T-03-E1 | 2 | valores-limite
A regra de uma biblioteca diz: "empréstimos de livros de referência duram 1 dia; os demais duram 14 dias; a renovação é permitida apenas para os demais, e no máximo duas vezes." Construa uma tabela de decisão com as condições relevantes, indique os casos de valores-limite do número de renovações e explique quais casos você testaria primeiro.
:::gabarito
As condições são: tipo do livro (referência ou não) e número de renovações já realizadas (0, 1, 2, 3). A tabela de decisão tem 2 × 4 = 8 combinações. Para os valores-limite do número de renovações, os casos são 0, 1, 2 e 3, que exercitam a fronteira do "no máximo duas". A regra de tipo tem fronteira natural entre referência e não referência. Os casos prioritários são: livro de referência com renovação (deve ser recusada), livro comum com 2 renovações (deve ser aceita) e livro comum com 3 renovações (deve ser recusada). O último caso é o que um código com `<` em vez de `<=` falharia, e por isso é o primeiro a ser escrito.
:::

:::exercicio T-03-E2 | 3 | mutação
Uma suíte tem cobertura de ramos de 100% e, ao ser avaliada por teste de mutação, deixa sobreviver 30% dos mutantes. Explique o que esse resultado significa e proponha um plano de três passos para melhorar a suíte sem aumentar a cobertura declarada.
:::gabarito
Os 30% de sobreviventes indicam comportamentos executados mas não verificados: os testes passam pelo código sem checar os resultados nos pontos relevantes, ou não exercitam fronteiras e combinações que distinguem o mutante do original. O plano possível: (1) analisar os mutantes sobreviventes agrupando-os por tipo (operador relacional, constante, condição) para identificar lacunas recorrentes; (2) escrever casos de valores-limite e de combinações para cada grupo, com asserções que verifiquem o resultado exato; (3) reexecutar a mutação e medir a redução, acompanhando também o tempo da suíte para não transformá-la em um gargalo. O ponto central é que a melhoria é medida pela detecção de defeitos, e não pelo número de linhas executadas.
:::

## Resumo da aula {fa-square-check}

- Testar é experimentar para encontrar defeitos; o oráculo determina o quanto um comportamento errado será notado.
- Partições de equivalência e valores-limite escolhem casos com alto poder de detecção; tabelas de decisão tratam combinações.
- Cobertura indica lacunas de execução; mutação mede a capacidade de detecção.
- A pirâmide de testes distribui o esforço pelo custo e pela precisão do diagnóstico.
- Testes intermitentes são defeitos e devem ser tratados como tal.

## Referências {fa-book}

**Acadêmicas e fundacionais**

- AMMANN, P.; OFFUTT, J. *Introduction to Software Testing*. 2. ed. Cambridge: Cambridge University Press, 2016.
- BEIZER, B. *Software Testing Techniques*. 2. ed. New York: Van Nostrand Reinhold, 1990.
- DEMILLO, R. A.; LIPTON, R. J.; SAYWARD, F. G. Hints on test data selection: help for the practicing programmer. *IEEE Computer*, v. 11, n. 4, p. 34–41, 1978.
- DIJKSTRA, E. W. *Notes on Structured Programming* (EWD 249), 1970. Disponível em [cs.utexas.edu](https://www.cs.utexas.edu/~EWD/transcriptions/EWD02xx/EWD249.html).
- INOZEMTSEVA, L.; HOLMES, R. Coverage is not strongly correlated with test suite effectiveness. In: *Proceedings of ICSE*, 2014.
- JIA, Y.; HARMAN, M. An analysis and survey of the development of mutation testing. *IEEE Transactions on Software Engineering*, v. 37, n. 5, p. 649–678, 2011.
- LUO, Q. et al. An empirical analysis of flaky tests. In: *Proceedings of the 22nd ACM SIGSOFT International Symposium on the Foundations of Software Engineering (FSE)*, 2014.
- MESZAROS, G. *xUnit Test Patterns: Refactoring Test Code*. Upper Saddle River: Addison-Wesley, 2007.
- MYERS, G. J.; SANDLER, C.; BADGETT, T. *The Art of Software Testing*. 3. ed. Hoboken: Wiley, 2011.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.

**Prática e mercado**

- COHN, M. *Succeeding with Agile*. Boston: Addison-Wesley, 2009. (Pirâmide de testes.)
- FOWLER, M. *TestPyramid*. martinfowler.com, 2012. [martinfowler.com/bliki/TestPyramid.html](https://martinfowler.com/bliki/TestPyramid.html)
- ISTQB. *Certified Tester Foundation Level Syllabus*. [istqb.org](https://www.istqb.org/)
- PYTHON SOFTWARE FOUNDATION. *unittest — Unit testing framework*. [docs.python.org/3/library/unittest.html](https://docs.python.org/3/library/unittest.html)
- PIT. *Mutation testing for Java*. [pitest.org](https://pitest.org/)
