title: Processos de software: modelos de ciclo de vida, Scrum, Kanban e métricas
desc: Aula de Engenharia de Software sobre processos de desenvolvimento: por que um processo existe, os modelos clássicos e ágeis, métricas de entrega (DORA) e um laboratório com exemplos executáveis, animação e testes.
icon: fa-rotate
favicon: 🏭
topic: es/01-processos-ciclo-de-vida
---

## Visão geral {fa-eye}

Esta é a **Aula 1** da trilha de Engenharia de Software. Ela responde a uma pergunta que parece simples e não é: *como organizar o trabalho de construir software para que o resultado seja correto, entregue a tempo e possível de manter?*

Ao final da aula você deverá ser capaz de:

- explicar, com referências, por que a engenharia de software precisa de um **processo** e quais problemas ele resolve;
- descrever os modelos de ciclo de vida clássicos (cascata, incremental, espiral, prototipação) e os ágeis (XP, Scrum, Kanban), comparando suas premissas;
- demonstrar, com um modelo executável, por que a detecção tardia de defeitos encarece a correção;
- calcular uma previsão de entrega a partir de dados históricos de velocidade;
- reconhecer as métricas de entrega que a indústria usa e as armadilhas de usá-las como metas.

> [!info] Pré-requisitos
> Lógica básica, noções de programação em Python e a disciplina de Modelagem Orientada a Objetos (para entender a noção de componente). Nenhum conhecimento prévio de gestão é necessário.

> [!tip] Roteiro sugerido
> Leia as seções 1 a 3 com calma, execute os exemplos, assista à animação do modelo cascata × incremental, faça os testes da seção final e só então confira os gabaritos. Quem fizer isso em duas sessões de uma hora costuma reter bem mais do que quem lê tudo de uma vez.

:::mapa

## 1. Por que existe um processo {fa-circle-question}

### 1.1 O problema que o processo enfrenta

Um sistema de software de porte médio contém milhares de decisões: regras de negócio, estruturas de dados, interfaces, integrações e restrições operacionais. Nenhuma pessoa as mantém todas na memória, e cada integrante que entra no projeto precisa reconstruí-las. Três forças tornam a tarefa difícil:

1. **Complexidade**: o sistema é grande demais para ser compreendido de uma vez.
2. **Mudança**: requisitos mudam porque o negócio muda e porque as partes interessadas aprendem durante o projeto.
3. **Coordenação**: várias pessoas produzem partes que precisam se encaixar, e o encaixe é onde os defeitos se escondem.

Um **processo de software** é o conjunto de atividades, papéis, artefatos e critérios de decisão que a organização usa para lidar com essas forças. Sommerville (2019, cap. 2) define o processo como um conjunto de atividades que levam à produção de um software; a definição é propositalmente ampla, porque admite desde um fluxo rígido até uma prática informal bem combinada.

> [!warn] Processo não é burocracia
> Um processo é uma **hipótese** sobre como produzir software bem. Quando a hipótese deixa de funcionar, o processo deve ser revisto. Burocracia é o processo que deixou de responder ao problema real e continua sendo obedecido por inércia.

### 1.2 Os argumentos clássicos

Três textos fundam a discussão e merecem leitura integral por qualquer estudante da área.

- **Royce (1970)** apresentou um fluxo sequencial de fases, hoje chamado de cascata, e alertou que, da forma como costuma ser aplicado, ele é arriscado: o teste só acontece quando o erro já custa caro.
- **Brooks (1975)**, em *The Mythical Man-Month*, observou que a produtividade humana não é aditiva e que, em projetos atrasados, acrescentar pessoas pode atrasar ainda mais, por causa do custo de comunicação e de integração. A frase mais citada do livro é a de que adicionar gente a um projeto atrasado o deixa mais atrasado.
- **Lehman (1980)** formulou leis empíricas sobre a evolução de sistemas. Entre elas, o sistema útil precisa ser continuamente adaptado, ou se torna progressivamente menos satisfatório. Isso significa que a manutenção não é uma fase final, e sim parte permanente do ciclo de vida.

Esses três argumentos explicam por que quase todo processo moderno se organiza em torno de **ciclos curtos de feedback**, **gestão explícita da mudança** e **coordenação frequente**.

### 1.3 A ideia central: o custo do atraso no feedback

A intuição mais importante desta aula é a seguinte: *o custo de corrigir um defeito cresce com o tempo decorrido entre a sua introdução e a sua detecção*. Boehm (1981) sistematizou esse fenômeno com dados de projetos militares e comerciais e estimou multiplicadores de custo por fase. Boehm e Basili (2001) revisitaram o tema e mostraram que os números variam muito de um contexto para outro. O que se mantém é a direção da curva. A simulação da seção 4 torna essa tendência concreta.

## 2. Modelos clássicos de ciclo de vida {fa-rotate}

Um **modelo de ciclo de vida** descreve a ordem, a frequência e a forma como as atividades se relacionam. Ele não é um cronograma; é uma estrutura lógica que determina quando o cliente vê o software e com que frequência a equipe recebe feedback.

### 2.1 Cascata

No modelo cascata, as fases são executadas em sequência: levantamento de requisitos, projeto, implementação, verificação, implantação e manutenção. Cada fase termina com um conjunto de documentos aprovados antes que a seguinte comece. A origem do modelo é atribuída a Benington (1983), que descreveu um processo semelhante na década de 1950 para o sistema SAGE, e foi formalizada por Royce (1970).

**Premissas:** requisitos estáveis e bem compreendidos; mudança cara; necessidade de documentação formal (defesa, aviação, sistemas regulados).

**Riscos:** feedback tardio; dependência de especificações perfeitas no início; teste concentrado no fim, quando o custo de corrigir é maior.

> [!info] Uma leitura correta de Royce
> O artigo de 1970 não recomenda o modelo em sua forma simples. Ele propõe a iteração entre fases e a execução de protótipos antes da implementação final. O uso puramente sequencial é uma simplificação posterior da literatura, frequentemente atribuída ao próprio Royce por ter sido popularizada a partir do seu texto.

### 2.2 Desenvolvimento incremental e iterativo

Basili e Turner (1975) descreveram o *iterative enhancement*, em que o sistema é construído em versões sucessivas, cada uma incorporando novas funcionalidades e corrigindo a anterior. Cada incremento é utilizável, e o cliente pode avaliá-lo antes do próximo.

**Premissas:** o problema pode ser decomposto em fatias funcionais; há valor em entregar cedo.

**Riscos:** a arquitetura precisa suportar a evolução; incrementos que não se integram geram retrabalho.

### 2.3 Espiral

Boehm (1988) propôs o modelo espiral, em que cada volta do ciclo passa por quatro quadrantes: determinação de objetivos, análise de riscos, desenvolvimento e validação, e planejamento da próxima volta. A análise de riscos é explícita, e a decisão de continuar ou parar é tomada a cada volta. O modelo é útil em projetos grandes e de alto risco técnico, mas exige experiência para avaliar riscos com honestidade.

### 2.4 Prototipação

A prototipação constrói versões descartáveis ou parciais para validar requisitos com usuários. Ela é especialmente útil quando os requisitos são difíceis de articular, como em interfaces. O risco é que o protótipo, por já funcionar, seja promovido a produto sem a engenharia necessária.

### 2.5 Processo unificado

O *Rational Unified Process* (Kruchten, 2003) organiza o trabalho em quatro fases (iniciação, elaboração, construção e transição) e em disciplinas (requisitos, análise, projeto, implementação, teste). Ele é iterativo e dirigido por casos de uso e pela arquitetura. Sua complexidade fez com que muitas organizações o adaptassem em vez de adotá-lo integralmente.

:::quiz T-01-01 | 1 | modelos clássicos
P: Qual afirmação descreve melhor a premissa do modelo cascata?
A) Os requisitos devem mudar a cada fase para acompanhar o negócio.
*B) Os requisitos devem ser estáveis e bem compreendidos antes do projeto, porque a mudança posterior é cara.
C) A análise de riscos é a atividade central de cada volta do ciclo.
D) O cliente só deve ver o sistema quando ele estiver integralmente pronto para produção.
X: A cascata se apoia na estabilidade de requisitos. Quando essa premissa falha, o custo de mudança aparece tarde, na fase de teste ou de implantação.
:::

:::quiz T-01-02 | 2 | modelos clássicos
P: No modelo espiral de Boehm (1988), o que distingue cada volta do ciclo?
A) A ausência de documentação formal.
*B) A análise explícita de riscos antes de cada desenvolvimento, seguida da decisão de continuar.
C) A entrega de uma única versão final ao fim do projeto.
D) A substituição de todas as fases por prototipação.
X: O quadrante de análise de riscos e a decisão de continuar ou parar em cada volta são as marcas do modelo espiral.
:::

## 3. Métodos ágeis {fa-people-group}

### 3.1 O manifesto e seus princípios

O *Manifesto para o Desenvolvimento Ágil de Software* (Beck et al., 2001) declarou quatro preferências: indivíduos e interações acima de processos e ferramentas; software funcionando acima de documentação abrangente; colaboração com o cliente acima de negociação de contrato; e resposta a mudanças acima de seguir um plano. Os itens da direita não são descartados, mas os da esquerda têm prioridade.

Os doze princípios do manifesto enfatizam entregas frequentes de software funcionando, sustentabilidade do ritmo de trabalho, atenção contínua à excelência técnica e reflexão periódica sobre o próprio modo de trabalhar.

### 3.2 Extreme Programming

A XP (Beck, 1999) propôs práticas técnicas intensivas: programação em par, desenvolvimento orientado a testes, integração contínua, refatoração, propriedade coletiva do código e ritmo sustentável. Muitas dessas práticas foram incorporadas pela indústria mesmo por equipes que não adotam XP como processo completo, e são tratadas nas aulas da trilha de Programação.

### 3.3 Scrum

Scrum é um *framework* (não um processo completo) descrito por Schwaber e Beedle (2002) e mantido no *Scrum Guide* (Schwaber & Sutherland, 2020). Ele define três papéis (Product Owner, Scrum Master e Developers), cinco eventos (Sprint, Sprint Planning, Daily Scrum, Sprint Review e Sprint Retrospective) e três artefatos (Product Backlog, Sprint Backlog e Incremento). O nome vem de um artigo de Takeuchi e Nonaka (1986), que comparou o desenvolvimento de produtos a uma formação de rúgbi em que a equipe avança como uma unidade.

Três elementos do Scrum são frequentemente mal compreendidos:

- **Incremento "pronto"** significa que o trabalho atende a uma Definição de Pronto combinada pela equipe. Sem essa definição, cada pessoa tem o seu critério.
- **Sprint** é um intervalo de tempo fixo. Mudanças de escopo no meio da Sprint quebram a previsibilidade do ciclo.
- **Product Owner** ordena o backlog. Um backlog sem dono é um depósito de pedidos.

### 3.4 Kanban

Kanban é um método de gestão de fluxo originado na indústria automobilística japonesa e adaptado ao software por Anderson (2010). Ele visualiza o trabalho em um quadro com colunas e impõe **limites de trabalho em andamento** (WIP). O limite é o seu elemento mais valioso: ele expõe gargalos e força a conclusão antes do início de novas tarefas. A Lei de Little, `L = λW`, relaciona o número médio de itens em um sistema (L), a taxa média de chegada (λ) e o tempo médio de permanência (W), e fornece a base teórica para pensar em fluxo.

:::quiz T-01-03 | 2 | métodos ágeis
P: Em Kanban, qual é o principal efeito de impor um limite de trabalho em andamento (WIP)?
A) Aumentar a quantidade de itens iniciados ao mesmo tempo, para acelerar a entrega.
*B) Expor gargalos e reduzir o tempo de permanência dos itens no fluxo.
C) Eliminar a necessidade de uma definição de pronto.
D) Substituir a necessidade de reuniões de acompanhamento.
X: Pela Lei de Little, mantendo a taxa de chegada, reduzir L (itens em andamento) reduz W (tempo de permanência). O limite de WIP é a alavanca prática dessa relação.
:::

:::quiz T-01-04 | 2 | scrum
P: Quem é responsável por ordenar o Product Backlog segundo o Scrum Guide?
A) O Scrum Master.
*B) O Product Owner.
C) Os Developers, por consenso.
D) A gerência de projetos, fora do framework.
X: O Product Owner maximiza o valor do produto e ordena o backlog. Os Developers estimam e constroem; o Scrum Master cuida do framework.
:::

## 4. Laboratório: a curva de custo e a detecção tardia {fa-flask}

Esta seção transforma a tese de Boehm em um modelo executável. Os multiplicadores são **hipotéticos**; o objetivo é observar a *forma* da relação entre o momento da detecção e o custo, não reproduzir um número.

:::run 01/01-custo-tardio.py

Leia o programa com atenção. A função `custo_defeito` multiplica o custo base pelo multiplicador da fase de detecção e, quando a detecção ocorre depois da inserção, soma o efeito de atravessar as fases intermediárias. O resultado tem duas propriedades que o modelo quer mostrar: o custo sobe de forma acentuada à medida que a detecção se afasta da origem, e um defeito detectado na própria fase em que foi introduzido custa bem menos do que o mesmo defeito propagado.

:::anim
canvas: cvProcessos
ctl: ctlProcessos
cap: capProcessos
desenha: desenhaProcessos
gera: geraProcessos
velocidade: 2600
opcoes: cascata=Cascata (sequencial);iterativo=Incremental (iterativo)
:::

> [!tip] Como ler a animação
> Na cascata, observe o retorno tracejado em vermelho: o defeito encontrado em teste obriga o retrabalho desde os requisitos. No modo incremental, cada incremento termina com revisão do cliente, e o feedback entra no planejamento do incremento seguinte. A diferença não está no esforço total de cada fase, e sim no **tempo** entre a decisão e a validação.

## 5. Métricas de entrega {fa-gauge-high}

### 5.1 Velocidade e previsão

No Scrum, a **velocidade** é a quantidade de trabalho concluída por Sprint, medida em pontos de história ou em outra unidade relativa. Ela não é produtividade individual e não deve ser comparada entre equipes. Seu uso legítimo é a previsão: dado o trabalho restante, a velocidade histórica estima quantas Sprints serão necessárias. A previsão deve sempre vir com uma faixa, e não com um número único.

:::run 01/02-velocidade-sprints.py

Observe que o resultado é uma **distribuição** de cenários. Um gestor que apresenta apenas "7 Sprints" omite a incerteza que ele mesmo conhece.

### 5.2 Métricas de entrega de software

Forsgren, Humble e Kim (2018) reuniram quatro métricas que se mostraram associadas a desempenho organizacional nas pesquisas do programa DORA (*DevOps Research and Assessment*): frequência de implantação, tempo de entrega de mudanças (*lead time*), taxa de falha em mudanças e tempo de restauração do serviço. Os relatórios anuais do DORA, publicados desde 2014, são uma das fontes de dados mais citadas da indústria sobre o tema.

> [!warn] A lei de Goodhart
> Quando uma medida vira meta, deixa de ser boa medida. Se a velocidade virar meta de produtividade, as equipes inflacionam estimativas e a métrica perde todo o sentido. Use métricas para aprender, não para avaliar pessoas.

:::quiz T-01-05 | 2 | métricas
P: Por que a velocidade de uma equipe Scrum não deve ser usada para comparar produtividade entre equipes?
A) Porque ela é sempre medida em horas, que não são comparáveis.
*B) Porque a unidade é relativa à própria equipe e à sua estimativa, e tratá-la como meta induz distorções.
C) Porque a velocidade só existe em Kanban.
D) Porque ela não é calculada a partir de dados históricos.
X: A velocidade depende da escala de estimativa de cada equipe. Comparar equipes com escalas diferentes não tem sentido, e transformar a métrica em meta a corrompe (Lei de Goodhart).
:::

## 6. Mercado de trabalho {fa-briefcase}

Na indústria, o processo aparece como **combinação** de práticas, e não como adoção pura de um modelo. Relatórios anuais de práticas ágeis, como o *State of Agile* publicado pela Digital.ai, mostram que a maioria das organizações combina elementos de Scrum e de Kanban com práticas técnicas de XP e de DevOps. Esse é um fato da prática, e a sua leitura crítica é a competência que a aula quer desenvolver: entender por que cada prática existe antes de escolhê-la.

Para o estudante, três competências são valorizadas em entrevistas e no dia a dia:

- explicar um processo em termos de **feedback**, **risco** e **custo de mudança**, e não apenas de cerimônias;
- interpretar métricas (lead time, taxa de falha) como sinais de um sistema, com cuidado com a Lei de Goodhart;
- participar de retrospectivas com sugestões concretas, o que é uma forma de engenharia de processo aplicada.

## 7. Erros comuns {fa-triangle-exclamation}

- **Adotar o nome sem a prática.** Uma equipe que chama de Sprint um ciclo de escopo fixo, com teste apenas no fim, está fazendo cascata com outro nome. A pergunta de controle é: quando um defeito é descoberto, qual é o intervalo até a correção?
- **Confundir processo com ferramenta.** Um quadro de tarefas não é Kanban; é um quadro. Kanban é o conjunto de limites, políticas explícitas e a prática de melhoria a partir do fluxo.
- **Estimar em horas para cobrar prazo.** Estimativas viram promessas quando são usadas como contrato. Estimativas relativas e histórico de velocidade são instrumentos de previsão, não de cobrança.
- **Ignorar a retrospectiva.** Uma retrospectiva que não gera uma ação concreta com dono e prazo é um ritual sem efeito.
- **Não ter Definição de Pronto.** Sem um critério compartilhado, "pronto" passa a significar "codificado", e os defeitos aparecem depois, em produção.

:::exercicio T-01-E1 | 2 | modelos clássicos
Uma equipe de sistemas bancários precisa entregar um módulo de conformidade regulatória cujas regras são publicadas pelo Banco Central com prazos fixos e alterações raras. Qual modelo de ciclo de vida você recomendaria? Justifique com base nas premissas de cada modelo e cite o risco principal da sua escolha.
:::gabarito
Um modelo sequencial ou híbrido com forte ênfase em especificação é defensável, porque as regras são estáveis e a mudança posterior é cara e auditável. Uma resposta completa menciona: (1) a estabilidade dos requisitos como premissa central da cascata; (2) a necessidade de rastreabilidade e documentação exigidas pela regulação; (3) o risco principal, que é descobrir uma interpretação errada da regra só nos testes. A mitigação típica combina especificação com revisão formal por especialistas e testes derivados das próprias regras.
:::

:::exercicio T-01-E2 | 3 | métricas
Explique por que a Lei de Goodhart é relevante quando uma organização decide premiar equipes pela quantidade de pontos entregues por Sprint. Proponha dois indicadores complementares que reduzam esse efeito.
:::gabarito
Ao premiar pontos, as equipes tendem a inflar estimativas e a dividir trabalho para aumentar o número de itens, sem entregar mais valor. A medida deixa de representar valor e passa a representar comportamento para a métrica. Indicadores complementares possíveis: (a) lead time das mudanças, que mede o tempo real até o usuário; (b) taxa de falha em mudanças ou de incidentes após a entrega, que impede a otimização à custa da estabilidade. Uma resposta forte também menciona que métricas de processo devem ser lidas em conjunto e discutidas em retrospectivas, não usadas isoladamente para avaliação.
:::

## Resumo da aula {fa-square-check}

- Um processo é uma hipótese sobre como produzir software bem, e deve ser revisto quando falha.
- Royce, Brooks e Lehman fundam a discussão: feedback tardio é caro, equipes crescem com custo de comunicação, e o software evolui permanentemente.
- Os modelos diferenciam-se pela **frequência de feedback** e pela **gestão de risco**: cascata, incremental, espiral, prototipação e processo unificado.
- Os métodos ágeis (XP, Scrum, Kanban) organizam o trabalho em ciclos curtos, com limites explícitos e melhoria contínua.
- Métricas de entrega (DORA) e de previsão (velocidade) são úteis desde que não sejam transformadas em metas.

## Referências {fa-book}

**Acadêmicas e fundacionais**

- BASILI, V. R.; TURNER, A. J. Iterative enhancement: a practical technique for software development. *IEEE Transactions on Software Engineering*, v. SE-1, n. 4, p. 390–396, 1975.
- BENINGTON, H. D. Production of large computer programs. *Annals of the History of Computing*, v. 5, n. 4, p. 350–361, 1983. (Texto original de 1956, republicado em 1983.)
- BOEHM, B. W. *Software Engineering Economics*. Englewood Cliffs: Prentice-Hall, 1981.
- BOEHM, B. W. A spiral model of software development and enhancement. *IEEE Computer*, v. 21, n. 5, p. 61–72, 1988.
- BOEHM, B.; BASILI, V. R. Software defect reduction top 10 list. *IEEE Computer*, v. 34, n. 1, p. 135–137, 2001.
- BROOKS, F. P. *The Mythical Man-Month: Essays on Software Engineering*. Reading: Addison-Wesley, 1975 (ed. comemorativa, 1995).
- LEHMAN, M. M. Programs, life cycles, and laws of software evolution. *Proceedings of the IEEE*, v. 68, n. 9, p. 1060–1076, 1980.
- ROYCE, W. W. Managing the development of large software systems. *Proceedings of IEEE WESCON*, 1970.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.
- TAKEUCHI, H.; NONAKA, I. The new new product development game. *Harvard Business Review*, jan./fev. 1986.

**Métodos ágeis e práticas**

- ANDERSON, D. J. *Kanban: Successful Evolutionary Change for Your Technology Business*. Sequim: Blue Hole Press, 2010.
- BECK, K. *Extreme Programming Explained*. Reading: Addison-Wesley, 1999.
- BECK, K. et al. *Manifesto para o Desenvolvimento Ágil de Software*, 2001. [agilemanifesto.org](https://agilemanifesto.org/)
- KRUCHTEN, P. *The Rational Unified Process: An Introduction*. 3. ed. Boston: Addison-Wesley, 2003.
- SCHWABER, K.; BEEDLE, M. *Agile Software Development with Scrum*. Upper Saddle River: Prentice Hall, 2002.
- SCHWABER, K.; SUTHERLAND, J. *The Scrum Guide*, 2020. [scrumguides.org](https://scrumguides.org/)

**Medição e desempenho**

- FORSGREN, N.; HUMBLE, J.; KIM, G. *Accelerate: The Science of Lean Software and DevOps*. Portland: IT Revolution, 2018.
- DORA. *Accelerate State of DevOps Report*, edições anuais. [dora.dev](https://dora.dev/)
- HUMPHREY, W. S. *Managing the Software Process*. Reading: Addison-Wesley, 1989.

**Mercado e práticas da indústria**

- DIGITAL.AI. *State of Agile Report*, edições anuais. [digital.ai](https://digital.ai/)
- GOODHART, C. A. E. Problems of monetary management: the UK experience. In: *Papers in Monetary Economics*, Reserve Bank of Australia, 1975. (Origem da lei que leva seu nome.)
