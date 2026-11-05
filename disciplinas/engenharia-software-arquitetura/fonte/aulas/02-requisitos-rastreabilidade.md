title: Requisitos: levantamento, especificação, ambiguidade e rastreabilidade
desc: Aula de engenharia de requisitos: tipos de requisito, técnicas de levantamento, especificação com histórias e critérios de aceitação, detecção de ambiguidade, priorização e rastreabilidade, com exemplos executáveis, animação e testes mapeados.
icon: fa-list-check
favicon: 🏭
topic: es/02-requisitos-rastreabilidade
---

## Visão geral {fa-eye}

Esta é a **Aula 2**. O erro mais caro de um projeto raramente é um defeito de programação. É construir, com perfeição, a coisa errada, ou a coisa certa de um modo que ninguém consegue verificar. A **engenharia de requisitos** é a disciplina que trata desse problema: descobrir o que o sistema deve fazer, registrar isso sem ambiguidade e manter o registro ligado ao restante do trabalho.

Ao final da aula você deverá ser capaz de:

- distinguir requisitos funcionais, não funcionais, regras de negócio e restrições, com exemplos e referências normativas;
- escolher técnicas de levantamento adequadas ao tipo de informação que cada uma revela;
- escrever histórias de usuário com critérios de aceitação verificáveis e aplicar o critério INVEST;
- identificar ambiguidades estruturais (limites, quantificadores, pronomes) e reescrevê-las de forma testável;
- construir e auditar uma matriz de rastreabilidade com um programa que encontra lacunas.

> [!info] Pré-requisitos
> Aula 1 (processos) e noções básicas de Python. Os exemplos de rastreabilidade usam apenas listas e dicionários.

> [!tip] Como estudar esta aula
> A seção 4 é a mais importante. Leia-a duas vezes e faça os exercícios de ambiguidade antes de olhar o gabarito: a habilidade de perceber a ambiguidade é treinável e é exatamente o que os testes avaliam.

:::mapa

## 1. Requisitos: definição e tipos {fa-tags}

### 1.1 Definição

Um **requisito** é uma condição ou capacidade que um sistema precisa possuir para atender a uma necessidade de uma parte interessada, ou uma condição que um sistema precisa atender para satisfazer um contrato, um padrão ou uma especificação (ISO/IEC/IEEE 29148, 2018). A definição tem duas faces: a necessidade (o que o usuário quer alcançar) e a especificação (o que o sistema deve fazer para isso). Confundir as duas é a origem de muitos desastres.

Jackson (1995) formulou essa distinção de maneira influente, no artigo *The world and the machine*: o engenheiro de requisitos trabalha sobre o **mundo** (domínio, pessoas, processos, leis) e propõe uma **máquina** (o software) que, junto com o mundo, satisfaça as necessidades. Um requisito fala do mundo; uma especificação fala da máquina. Zave e Jackson (1997), em *Four dark corners of requirements engineering*, identificaram os problemas que a disciplina raramente resolve: a relação entre o mundo e a máquina, a validação com as partes interessadas, a alocação de requisitos e a sua satisfação real.

### 1.2 Taxonomia

- **Requisitos funcionais (RF)** descrevem comportamentos observáveis: "o usuário pode renovar um empréstimo até duas vezes".
- **Requisitos não funcionais (RNF)** restringem como o sistema se comporta: desempenho, segurança, disponibilidade, usabilidade, acessibilidade e manutenibilidade. Eles são tratados como atributos de qualidade na Aula 5.
- **Regras de negócio (RN)** são políticas da organização que o sistema aplica: "usuários com multa pendente não podem renovar". Regras mudam quando a política muda; por isso devem ser isoladas e rastreáveis.
- **Restrições** são decisões impostas de fora da equipe: linguagem obrigatória, banco homologado, exigência legal de armazenamento no país.

> [!warn] Requisito não é solução
> "O botão deve ser azul" é uma solução de design, não um requisito. "O usuário deve identificar a ação principal da tela em até 5 segundos, em teste com 10 usuários" é um requisito. A regra prática: um requisito descreve um **problema** ou uma **propriedade verificável**; uma solução pode ser discutida depois, sem perder a intenção.

:::quiz T-02-01 | 1 | tipos de requisito
P: Qual dos enunciados é um requisito não funcional bem formulado?
A) O sistema deve usar uma interface moderna e agradável.
*B) A busca de produtos responde em até 300 ms no percentil 95, com 500 usuários simultâneos.
C) O sistema deve usar o framework X na camada de apresentação.
D) O administrador pode cadastrar produtos.
X: A alternativa B tem medida, condição de carga e critério verificável. A alternativa A é um adjetivo sem medida, a C é uma solução disfarçada de requisito, e a D é um requisito funcional.
:::

## 2. Levantamento: descobrir o que ninguém disse {fa-magnifying-glass}

Pessoas raramente descrevem o próprio trabalho com precisão. Quem usa um sistema de estoque há dez anos executa dezenas de passos sem pensar neles. O levantamento, portanto, combina técnicas que revelam tipos diferentes de informação.

| Técnica | O que revela bem | Limitação |
|---|---|---|
| Entrevistas | intenção, vocabulário, exceções lembradas | o entrevistado não descreve o que faz automaticamente |
| Observação | o trabalho real, atalhos, planilhas paralelas | o observador altera o comportamento observado |
| Análise de documentos | regras formais, normas, formulários | documentos podem estar desatualizados |
| Questionários | opiniões de muitos usuários | pouca profundidade; perguntas mal formuladas enviesam |
| Protótipos e *storyboards* | reações concretas; descobertas de fluxo | podem ser confundidos com o produto final |
| Análise de dados de uso | comportamento efetivo em produção | só existe quando há um sistema anterior |

Três princípios orientam o levantamento. Primeiro, **pergunte por exemplos** ("me conte a última vez em que isso deu errado") em vez de opiniões abstratas. Segundo, **identifique as partes interessadas** e o que cada uma ganha ou perde com o sistema (Sommerville, 2019, capítulo sobre engenharia de requisitos). Terceiro, **trate requisitos como hipóteses** a validar com usuários reais, e não como verdades a serem executadas.

> [!tip] Pergunta de controle
> Ao final de cada entrevista, pergunte: "o que eu deveria ter perguntado e não perguntei?". Essa pergunta costuma revelar a exceção que nenhum requisito listava.

## 3. Especificação: histórias, critérios e Gherkin {fa-file-lines}

### 3.1 Histórias de usuário

Cohn (2004) popularizou a **história de usuário**, com a forma *como* um papel, *quero* uma funcionalidade, *para que* um benefício. A parte mais valiosa é o "para que", porque ela permite à equipe escolher soluções diferentes para o mesmo objetivo, às vezes mais simples do que a pedida.

Uma história é boa quando satisfaz o acrônimo **INVEST**, proposto por Bill Wake (2003): *Independent* (independente), *Negotiable* (negociável), *Valuable* (valiosa), *Estimable* (estimável), *Small* (pequena) e *Testable* (testável). A última letra é a que mais exige disciplina: uma história sem critério de aceitação não é testável.

### 3.2 Critérios de aceitação em Dado / Quando / Então

Um **critério de aceitação** é uma condição verificável que indica quando a história está concluída. O formato Dado / Quando / Então (*Given / When / Then*) foi popularizado pela prática de *Behaviour-Driven Development* (North, 2006) e pela linguagem Gherkin. Ele separa três elementos: o contexto inicial, a ação e o resultado observável.

```gherkin
Funcionalidade: Filtro de produtos por preço

  Cenário: listar apenas itens dentro da faixa
    Dado que o catálogo tem 1.000 produtos
    Quando eu informo a faixa de R$ 50 a R$ 100
    Então vejo somente produtos com preço entre R$ 50 e R$ 100

  Cenário: faixa sem produtos não quebra a tela
    Dado que nenhum produto custa entre R$ 500 e R$ 600
    Quando eu informo a faixa de R$ 500 a R$ 600
    Então vejo a mensagem "Nenhum produto nesta faixa"
```

Repare que o primeiro cenário contém uma ambiguidade. "Entre R$ 50 e R$ 100" inclui os extremos? A resposta não está no cenário, e é justamente a ambiguidade que a seção 4 ensina a encontrar.

### 3.3 Priorização

Nenhum projeto entrega tudo. A técnica **MoSCoW**, associada ao método DSDM, separa os requisitos em *Must*, *Should*, *Could* e *Won't*. O grupo *Won't* é o mais útil, porque registra o que foi conscientemente excluído do ciclo. Priorizar combina valor para o cliente, risco de não fazer, esforço e dependências: um requisito de baixo valor visível pode ser prioritário por ser pré-requisito de todos os outros.

## 4. Ambiguidade: o inimigo silencioso {fa-magnifying-glass-chart}

Um requisito é **ambíguo** quando pode ser lido de mais de uma forma por pessoas razoáveis. Ele raramente produz um erro explícito; produz dois módulos que assumem regras contrárias, ou um teste que passa enquanto o usuário reclama. Eis quatro famílias de ambiguidade, todas frequentes:

1. **Adjetivos sem medida**: "rápido", "intuitivo", "seguro", "escalável". A correção é substituir por medida, cenário ou critério de comparação.
2. **Limites sem definição de inclusão**: "a partir de R$ 100" inclui R$ 100,00? "até 30 dias" inclui o trigésimo dia? É a fonte de defeitos mais comum em regras de preço e de prazo.
3. **Quantificadores vagos**: "vários", "normalmente", "geralmente". Quantas vezes, em que condições?
4. **Pronomes e sujeitos ocultos**: "ele envia o relatório". Quem é "ele"?

O teste de **testabilidade** é um critério operacional: se você não consegue imaginar um caso que passe e outro que falhe para o requisito, ele ainda não está pronto. A demonstração a seguir torna a ambiguidade de limites observável.

:::run 02/02-limites-ambiguos.py

Note a linha em que o preço é exatamente 50,00: a leitura inclusiva o aceita e a exclusiva o rejeita. Os dois extremos são exatamente os casos que um teste de aceitação deve fixar, depois que o cliente decidir qual leitura vale.

> [!ok] Procedimento de revisão de requisitos
> Para cada requisito com um número, pergunte: o limite está incluído? a unidade está explícita? o que acontece com zero, com vazio e com o valor máximo? Essas três perguntas eliminam a maior parte das ambiguidades antes da implementação.

:::quiz T-02-02 | 2 | ambiguidade
P: O requisito "descontos são aplicados a partir de R$ 100" é ambíguo porque:
A) não diz qual é o desconto.
*B) não define se o valor exato de R$ 100,00 recebe o desconto.
C) usa a palavra "descontos" em vez de "promoções".
D) não menciona o sistema que aplica o desconto.
X: "A partir de" pode ser lido como inclusivo ou exclusivo no extremo. A resposta precisa vir do cliente, e o teste de borda deve fixá-la.
:::

:::quiz T-02-03 | 2 | ambiguidade
P: Qual reescrita torna testável o requisito "a busca deve ser rápida"?
A) A busca deve ser muito rápida para qualquer usuário.
*B) A busca responde em até 300 ms no percentil 95, medidos com 500 usuários simultâneos.
C) A busca deve usar índices, como todo sistema moderno.
D) A busca deve ser implementada com a melhor tecnologia disponível.
X: A alternativa B tem medida, condição de carga e critério binário. A C e a D são soluções, não critérios.
:::

## 5. Rastreabilidade {fa-link}

**Rastreabilidade** é a capacidade de seguir um requisito por todas as fases do desenvolvimento: da necessidade do negócio ao código, passando pelos testes. Gotel e Finkelstein (1994) definiram o problema com clareza ao analisar as causas da falta de rastreabilidade, e Ramesh e Jarke (2001) propuseram modelos de referência para ela. A rastreabilidade responde a três perguntas práticas: este código é necessário? este requisito foi testado? se este requisito mudar, o que deve ser revisto?

A forma mínima é uma matriz, com um identificador por requisito (RF-02), um por teste (CT-03) e a função que implementa o comportamento. O exemplo a seguir constrói essa matriz e encontra três tipos de lacuna que aparecem em projetos reais: requisitos sem teste, testes órfãos e testes sem código identificado.

:::run 02/01-rastreabilidade.py

Os resultados são simples de ler, e isso é o objetivo. Um sistema que aceita a matriz com lacunas sem registrá-las como decisão (por exemplo, "adiado" ou "fora do escopo") está escondendo risco. Um requisito marcado como concluído sem teste é a pior situação possível.

:::quiz T-02-04 | 2 | rastreabilidade
P: Na saída do programa de rastreabilidade, o teste "CT-99" aparece como órfão. O que isso significa?
A) O teste falhou na última execução.
*B) O teste não está associado a nenhum requisito, o que pode indicar teste desnecessário ou requisito não documentado.
C) O teste foi escrito antes do código.
D) O teste cobre todos os requisitos do sistema.
X: Um teste órfão não rastreia nenhum requisito. Ele deve ser justificado ou removido, e a ausência de requisito correspondente é um sinal de documentação incompleta.
:::

:::quiz T-02-05 | 3 | rastreabilidade
P: Por que a rastreabilidade de requisitos não funcionais costuma ser mais difícil que a de funcionais?
A) Porque RNF não precisam de testes.
*B) Porque RNF tendem a ser atendidos por decisões arquiteturais distribuídas, e não por uma função identificável.
C) Porque RNF não podem ser documentados.
D) Porque RNF mudam mais raramente.
X: Desempenho e segurança emergem de muitas partes do sistema. Por isso, a rastreabilidade de RNF liga o requisito a cenários de teste e a decisões de arquitetura, não a uma única função.
:::

## 6. Animação: do vago ao testável {fa-film}

A animação acompanha a reescrita de um requisito vago até um requisito verificável e, em seguida, sua ligação com o teste e o código.

:::anim
canvas: cvRequisitos
ctl: ctlRequisitos
cap: capRequisitos
desenha: desenhaRequisitos
gera: geraRequisitos
velocidade: 3200
:::

## 7. Mercado de trabalho {fa-briefcase}

Na prática profissional, a engenharia de requisitos aparece em três papéis. O **analista de negócio** conduz o levantamento e escreve histórias; o **Product Owner** ordena e aceita; o **engenheiro** transforma critérios em testes. O formato Gherkin é suportado por ferramentas como Cucumber e SpecFlow, e a abordagem BDD é usada em empresas de diferentes setores. A competência mais valorizada é a capacidade de perceber ambiguidades antes que virem código, e isso se treina com exercícios como os desta aula.

Padrões de referência para a indústria incluem a ISO/IEC/IEEE 29148 (2018), que substituiu a IEEE 830-1998 e define conteúdo e qualidade de especificações de requisitos.

## 8. Erros comuns {fa-triangle-exclamation}

- **Especificar tudo antes de programar.** Especificação completa tende a estar desatualizada quando chega ao código. Especifique o suficiente para a próxima entrega e aprenda com ela.
- **Escrever o requisito depois do código.** Critérios redigidos a posteriori refletem o que foi feito, não o que foi pedido.
- **Ignorar exceções.** Caminhos de erro (lista vazia, conexão caída, valor inválido) são onde os sistemas falham em produção.
- **Confundir requisito com tarefa técnica.** "Criar tabela de pedidos" é uma tarefa; o requisito é a capacidade de registrar e consultar pedidos.
- **Ausência de glossário.** Quando "cliente", "aluno" ou "reserva" têm significados diferentes para áreas diferentes, a ambiguidade é estrutural.

:::exercicio T-02-E1 | 2 | ambiguidade
Reescreva os três requisitos abaixo de modo que cada um possa ser verificado por um teste de aceitação. Para cada um, indique a decisão que o cliente precisa tomar antes de você poder fechar a redação.

1. "O sistema deve enviar lembretes de devolução com antecedência adequada."
2. "Usuários com muitos atrasos não podem renovar empréstimos."
3. "O relatório mensal deve estar disponível rapidamente após o fechamento."
:::gabarito
Uma resposta forte transforma cada frase em critério com número, condição e resultado observável, e explicita a decisão pendente:

1. "Um lembrete por e-mail é enviado 2 dias antes da data de devolução, às 9h no fuso de Brasília." Decisão pendente: a antecedência é 2 dias ou outro valor, e o fuso é o da instituição ou o do usuário?
2. "Um usuário com três ou mais devoluções atrasadas nos últimos 12 meses não pode renovar." Decisões pendentes: o que conta como "muitos" (três?), e a janela de 12 meses é contada a partir de quando?
3. "O relatório mensal fica disponível até às 10h do primeiro dia útil após o fechamento." Decisões pendentes: o que é "fechamento" (último dia do mês?), e o que é "rapidamente" em termos de prazo?

O ponto central é que cada critério só fica completo quando a ambiguidade é resolvida por quem tem autoridade para isso, e não pela equipe de desenvolvimento.
:::

:::exercicio T-02-E2 | 3 | rastreabilidade
Uma equipe marcou o requisito RNF-03 ("o pagamento é processado com segurança") como concluído. A matriz de rastreabilidade não tem nenhum teste associado a ele. Explique por que essa marcação é um risco e proponha uma forma de tornar o requisito verificável.
:::gabarito
Marcar como concluído um requisito sem teste afirma uma conformidade que ninguém verificou; o risco é que a falha só apareça em produção, possivelmente com dados de pagamento. "Segurança" também é ambígua: é preciso definir quais propriedades (confidencialidade dos dados de cartão, integridade da transação, autenticação do pagador) e que padrão é exigido (por exemplo, o PCI DSS, que é a norma do setor de cartões). Uma forma verificável é decompor o requisito em critérios: "nenhum número de cartão aparece em logs" (teste automatizado de logs), "a transação é rejeitada se a assinatura não confere" (teste de integridade), e "a comunicação usa TLS 1.2 ou superior" (teste de configuração). Cada critério passa a ter teste e ligação na matriz.
:::

## Resumo da aula {fa-square-check}

- Requisitos descrevem problemas e propriedades verificáveis, não soluções. Jackson separa o mundo da máquina.
- O levantamento combina técnicas, cada uma revelando um tipo de informação; perguntas por exemplo são as mais produtivas.
- Histórias com critérios Dado / Quando / Então são testáveis; o INVEST orienta a qualidade da história.
- Ambiguidades de limite, medida, quantificador e pronome são as mais frequentes e as mais caras.
- A rastreabilidade liga requisito, teste e código, e torna explícitas as lacunas.

## Referências {fa-book}

**Acadêmicas e normativas**

- COHN, M. *User Stories Applied: For Agile Software Development*. Boston: Addison-Wesley, 2004.
- GOTEL, O.; FINKELSTEIN, A. An analysis of the requirements traceability problem. In: *Proceedings of the First International Conference on Requirements Engineering (ICRE)*, 1994, p. 94–101.
- ISO/IEC/IEEE 29148:2018. *Systems and software engineering: life cycle processes: requirements engineering*. Genebra: ISO, 2018.
- JACKSON, M. The world and the machine. In: *Proceedings of the 17th International Conference on Software Engineering (ICSE)*, 1995.
- POHL, K. *Requirements Engineering: Fundamentals, Principles, and Techniques*. Berlin: Springer, 2010.
- RAMESH, B.; JARKE, M. Toward reference models for requirements traceability. *IEEE Transactions on Software Engineering*, v. 27, n. 1, p. 58–93, 2001.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.
- WIEGERS, K.; BEATTY, J. *Software Requirements*. 3. ed. Redmond: Microsoft Press, 2013.
- ZAVE, P.; JACKSON, M. Four dark corners of requirements engineering. *ACM Transactions on Software Engineering and Methodology*, v. 6, n. 1, p. 1–30, 1997.

**Prática e mercado**

- ADZIC, G. *Specification by Example*. Shelter Island: Manning, 2011.
- NORTH, D. Introducing BDD. *Better Software*, 2006. [dannorth.net/introducing-bdd](https://dannorth.net/introducing-bdd/)
- WAKE, B. INVEST in good stories, and SMART tasks. *XP123*, 2003. [xp123.com](https://xp123.com/articles/invest-in-good-stories-and-smart-tasks/)
- CUCUMBER. *Gherkin Reference*. [cucumber.io/docs/gherkin](https://cucumber.io/docs/gherkin/)
