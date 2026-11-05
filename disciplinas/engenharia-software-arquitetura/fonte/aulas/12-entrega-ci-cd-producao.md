title: Entrega contínua: integração e entrega contínuas, pipelines, artefatos reprodutíveis, implantação canário e pronto para produção
desc: Aula de entrega de software: integração contínua, entrega e implantação contínuas, pipeline com portões de qualidade, reprodutibilidade de artefatos, estratégias de implantação (canário, azul-verde), configuração e segredos, e a definição de pronto para produção, com exemplos executáveis, animação e testes mapeados.
icon: fa-rocket
favicon: 🏭
topic: es/12-entrega-ci-cd-producao
---

## Visão geral {fa-eye}

Esta é a **Aula 12**, que fecha a trilha de Programação. Entregar software é o momento em que todo o trabalho anterior encontra o mundo real. Em muitas equipes esse momento ainda é um evento raro, tenso e manual. A **entrega contínua** transforma-o em uma rotina pequena, automática e repetível, que pode acontecer várias vezes ao dia, com verificações em cada etapa e reversão planejada.

Ao final da aula você deverá ser capaz de:

- distinguir integração contínua, entrega contínua e implantação contínua;
- descrever uma pipeline com portões de qualidade e explicar o papel de cada portão;
- demonstrar por que o mesmo artefato deve ser promovido entre ambientes, e não reconstruído;
- comparar estratégias de implantação (substituição direta, contínua, azul-verde e canário) e simular a decisão de um canário;
- aplicar uma lista de verificação de "pronto para produção" com critérios verificáveis.

> [!info] Pré-requisitos
> Aulas 7 (integração), 9 (Git) e 10 (configuração e logs). Os exemplos não exigem Docker: usam apenas Python e a biblioteca padrão, e representam os mecanismos sem depender de uma ferramenta específica.

> [!tip] Como estudar
> Para cada portão de uma pipeline, pergunte: o que ele garante? o que ele não garante? Esse par de perguntas evita a ilusão de que um portão verde significa que tudo está bem.

:::mapa

## 1. Integração, entrega e implantação contínuas {fa-arrows-spin}

Humble e Farley (2010), em *Continuous Delivery*, organizam os conceitos em torno de um princípio: cada mudança deve percorrer um caminho automatizado até a produção, e qualquer etapa que falhe interrompe o caminho. Os três termos se distinguem pelo último passo.

- **Integração contínua (CI)**: cada mudança é integrada à linha principal e verificada automaticamente, com compilação, testes e análise. O objetivo é descobrir problemas de integração em minutos.
- **Entrega contínua (CD)**: o software está sempre em estado implantável, mas a implantação pode exigir uma decisão humana, como a aprovação de um responsável.
- **Implantação contínua**: toda mudança que passa na pipeline vai para produção automaticamente.

A diferença entre entrega e implantação contínuas é de decisão de negócio e de maturidade, não só técnica. Forsgren, Humble e Kim (2018) reportam, com base no programa DORA, que equipes com integração frequente, entregas pequenas e pipelines automatizadas tendem a entregar com mais rapidez e com menos falhas.

:::quiz T-12-01 | 1 | conceitos
P: Qual é a diferença essencial entre entrega contínua e implantação contínua?
A) A entrega contínua não usa testes automatizados.
*B) Na entrega contínua o software está sempre pronto para implantação, mas a ida à produção pode exigir aprovação humana; na implantação contínua, toda mudança aprovada vai automaticamente.
C) A implantação contínua é mais lenta.
D) Não há diferença; são sinônimos.
X: O último passo é a diferença. A entrega mantém um estado sempre implantável, e a implantação automatiza também a decisão de publicar.
:::

## 2. A pipeline e seus portões {fa-diagram-next}

Uma pipeline é uma sequência de etapas, e cada etapa é um **portão**: só deixa a mudança avançar se a verificação for satisfeita. Um exemplo típico tem seis etapas: compilação ou empacotamento; testes automatizados (unitários e de integração); análise estática (lint, segurança, cobertura); geração do artefato com versão identificável; implantação em homologação, com testes de aceitação; e a produção, por uma das estratégias da seção 4.

A regra essencial é que **o mesmo artefato percorre todas as etapas**. Reconstruir o código para cada ambiente é uma fonte clássica de surpresas, porque a versão testada não é a versão implantada. A seção seguinte demonstra o motivo técnico.

Para cada portão, vale o par de perguntas: o que ele garante, e o que não garante? Um teste verde garante que os casos testados passam; não garante que casos não testados funcionem. Essa distinção evita a ilusão de segurança que levou muitos times a subestimar riscos.

:::quiz T-12-02 | 2 | pipeline
P: Por que a pipeline deve promover o mesmo artefato para homologação e produção, em vez de reconstruí-lo em cada ambiente?
A) Porque reconstruir é mais lento e mais caro.
*B) Porque a reconstrução pode produzir um artefato diferente do testado, por mudança de dependência, de ferramenta ou de carimbo de tempo.
C) Porque o artefato não pode ter número de versão.
D) Porque a produção não aceita código compilado.
X: O artefato testado precisa ser o artefato implantado. A reconstrução abre espaço para diferenças invisíveis, que aparecem apenas em produção.
:::

## 3. Reprodutibilidade de artefatos {fa-fingerprint}

Um **artefato reprodutível** é aquele que, construído duas vezes a partir da mesma fonte e das mesmas dependências, produz o mesmo resultado binário. A reprodutibilidade é verificável por um **hash criptográfico** do arquivo: se os hashes coincidem, os conteúdos coincidem. Quando não coincidem, algo mudou, como um carimbo de tempo embutido no arquivo, uma versão de dependência não fixada ou uma ordem de arquivos não determinística.

O experimento a seguir empacota o mesmo código duas vezes, com relógios diferentes e com carimbo fixo, e depois verifica se o artefato promovido é idêntico ao testado.

:::run 12/01-reprodutibilidade.py

Os resultados mostram duas coisas. Com o relógio do sistema, o conteúdo muda e, com ele, o hash: é a reconstrução que introduz a diferença, mesmo com o mesmo código. Com carimbo fixo, as construções são idênticas. E o artefato promovido, lido de volta, coincide com o testado. Esse é o princípio que sustenta a promoção de artefatos: o hash é a identidade do que foi testado, e ele deve acompanhar o artefato até a produção.

:::quiz T-12-03 | 2 | reprodutibilidade
P: Duas construções do mesmo código produzem hashes diferentes. Qual é a explicação mais plausível, no caso de um arquivo empacotado com data embutida?
A) O código foi alterado entre as construções.
*B) O arquivo contém um carimbo de tempo que muda a cada construção, o que altera o conteúdo binário.
C) O hash é aleatório por natureza.
D) A linguagem de programação é a causa.
X: Um carimbo de tempo embutido é uma das causas mais comuns de falta de reprodutibilidade. Fixar o carimbo, ou removê-lo do artefato, torna a construção determinística.
:::

## 4. Estratégias de implantação {fa-shuffle}

Implantar não é um ato único. Existem formas de expor a mudança gradualmente, o que limita o estrago de um erro:

- **Substituição direta**: a versão antiga é trocada pela nova de uma vez. Simples, mas um erro atinge todos os usuários imediatamente.
- **Implantação contínua (rolling)**: instâncias são substituídas uma a uma. Reduz o impacto, mas por um período convivem duas versões, o que exige compatibilidade entre elas.
- **Azul-verde** (*blue-green*), descrita por Fowler (2010): dois ambientes idênticos; a nova versão é preparada em um deles e o tráfego é virado de uma vez. A reversão é imediata, basta voltar o tráfego.
- **Canário** (*canary release*), descrita por Fowler (2010): a nova versão recebe uma fração pequena do tráfego, e métricas de erro e latência são observadas antes de aumentar a fração.

O canário combina baixo risco com aprendizado rápido, e depende de observabilidade. Sem métricas que mostrem o efeito da mudança, não há como decidir se a fração deve crescer ou se a versão antiga deve voltar. O experimento a seguir simula essa decisão com um limite de erro.

:::run 12/02-canario.py

A simulação reverte já na etapa de 5%, porque a taxa observada (0,50%) ultrapassa o limite (0,4%), embora a taxa real seja a mesma para qualquer amostra. Esse é um ponto importante: amostras pequenas são ruidosas, e a decisão deve considerar o tamanho da amostra. Em sistemas reais, a decisão usa janelas de observação e testes estatísticos, e não uma comparação simples.

:::anim
canvas: cvCICD
ctl: ctlCICD
cap: capCICD
desenha: desenhaCICD
gera: geraCICD
velocidade: 2600
opcoes: ok=Tudo passa (com aprovação manual);falha=Testes falham
:::

:::quiz T-12-04 | 2 | canário
P: Em uma implantação canário, a fração de 5% do tráfego mostra taxa de erro acima do limite. Por que a decisão de reverter deve considerar o tamanho da amostra?
A) Porque amostras grandes são sempre mais lentas.
*B) Porque amostras pequenas têm muita variação: uma taxa acima do limite pode ser ruído, e uma taxa abaixo pode ser sorte.
C) Porque o limite deve ser ajustado para cada amostra.
D) Porque o canário não usa métricas.
X: Com poucas requisições, a taxa observada oscila muito. A decisão deve considerar a incerteza da estimativa, por janela de tempo ou por teste estatístico, para evitar reversões desnecessárias e aprovações precipitadas.
:::

## 5. Configuração, segredos e reversão {fa-key}

A pipeline precisa de credenciais para publicar, acessar o banco e chamar serviços externos. Essas credenciais são o alvo mais valioso de um ataque, e o princípio é simples: **nenhum segredo entra no repositório**. Eles ficam em um cofre de segredos da plataforma, são injetados na execução e são rotacionados periodicamente. Cada ambiente usa credenciais próprias, para que um erro em homologação não atinja produção.

A configuração que muda por ambiente vem de variáveis de ambiente, como visto na Aula 10. Por isso, a mesma imagem pode ser promovida de um ambiente a outro sem alteração. Wiggins (2011), no *Twelve-Factor App*, descreve essa separação entre código e configuração.

A **reversão** é uma parte do plano de entrega, e não um improviso. Uma reversão que nunca foi ensaiada costuma falhar justamente quando é necessária. Mudanças de banco de dados merecem cuidado especial: remover uma coluna usada pela versão anterior quebra a reversão. A prática segura é **expandir** (adicionar o novo), **migrar** os dados e só então **contrair** (remover o antigo), em implantações separadas.

:::quiz T-12-05 | 3 | reversão
P: Uma migração remove uma coluna usada pela versão anterior do serviço. Por que isso torna a reversão perigosa e qual é a prática segura?
A) A reversão fica mais lenta, mas continua segura.
*B) A versão antiga volta a depender de uma coluna que não existe mais; a prática segura é expandir, migrar e só depois contrair, em implantações separadas.
C) Não há perigo, porque containers isolam o banco de dados.
D) A coluna deve ser removida apenas na madrugada, para não afetar os usuários.
X: Esquemas devem ser compatíveis com a versão anterior durante a transição. Expandir antes e contrair depois preserva a possibilidade de reversão em todo o processo.
:::

## 6. Pronto para produção {fa-flag-checkered}

"Funciona na minha máquina" mostra que o trabalho não terminou. Estar pronto para produção significa que o software opera sem o autor por perto, pode ser diagnosticado quando falha e pode ser revertido sem drama. A lista a seguir é um ponto de partida, que deve integrar a Definição de Pronto da equipe (Aula 1):

- código revisado por outra pessoa, em pull request pequeno e descrito (Aula 9);
- testes automatizados passando na pipeline, unitários e de integração (Aulas 3 e 11);
- análise estática e de segurança sem alertas bloqueantes;
- nenhum segredo no código e configuração por variáveis de ambiente (Aula 10);
- migrações de banco testadas e compatíveis com a versão anterior;
- logs com contexto, sem dados sensíveis, nos caminhos novos (Aula 10);
- métricas ou alertas para o comportamento novo (erro, latência);
- procedimento de reversão descrito e testado;
- documentação atualizada, com ADR quando houve decisão relevante (Aula 5);
- validação pelo dono do produto em homologação.

A lista não precisa ser longa; precisa ser verdadeira. Cada item deve ser verificado de fato. Um item assinalado por hábito, sem verificação, é uma decoração.

:::quiz T-12-06 | 2 | pronto para produção
P: Um item da lista de pronto para produção é "procedimento de reversão descrito e testado". Por que o adjetivo "testado" é essencial?
A) Porque testes são obrigatórios em qualquer documento.
*B) Porque uma reversão nunca ensaiada tende a falhar justamente no momento de incidente, quando é mais necessária.
C) Porque a reversão deve ser feita por ferramentas de teste.
D) Porque o procedimento precisa ser escrito em inglês.
X: O valor do plano de reversão está na certeza de que ele funciona sob pressão. Um procedimento não testado é uma hipótese.
:::

:::exercicio T-12-E1 | 2 | pipeline
Uma equipe reconstrói a imagem do serviço em cada ambiente, com as dependências instaladas na hora. Em uma semana, a homologação passou e a produção quebrou por uma biblioteca de versão diferente. Explique a causa, proponha a mudança na pipeline e indique que verificação adicional evita a repetição do problema.
:::gabarito
A causa é a reconstrução: a biblioteca foi resolvida para uma versão diferente no momento da construção de produção, e o artefato testado não era o artefato implantado. A mudança: construir o artefato uma única vez, com dependências fixadas (versões exatas ou um arquivo de bloqueio), gerar um identificador de versão e promover esse mesmo artefato de homologação para produção. A verificação adicional: comparar o hash do artefato implantado com o hash do artefato aprovado, como um portão antes da produção, e falhar a implantação se os hashes divergirem. Assim, a reconstrução não pode introduzir diferenças sem ser percebida.
:::

:::exercicio T-12-E2 | 3 | canário
Você precisa implantar uma mudança de alto risco em um sistema de pagamentos. Escolha uma estratégia de implantação, justifique-a em termos de risco e reversibilidade, e defina os critérios objetivos para avançar de uma etapa à seguinte e para reverter.
:::gabarito
Uma escolha defensável é o canário com fração inicial pequena (1%), porque limita o número de usuários afetados por um erro e permite observar métricas reais. A justificativa é o equilíbrio entre risco e aprendizado; o azul-verde também seria adequado se o custo de manter dois ambientes for aceitável, por causa da reversão imediata. Critérios para avançar: taxa de erro da nova versão não superior à da versão antiga acima de um limiar (por exemplo, 0,1 ponto percentual), latência do percentil 95 dentro de um orçamento definido, e tamanho de amostra suficiente em cada etapa (ou janela de tempo mínima). Critérios para reverter: qualquer violação do limiar de erro por janela de observação, qualquer aumento de falhas de pagamento sem explicação, e alertas de integridade de dados. A reversão deve ser um comando testado, com tempo máximo definido, e a equipe deve saber quem decide. Os critérios precisam ser escritos antes da implantação, para não serem negociados durante um incidente.
:::

## 7. Mercado de trabalho {fa-briefcase}

Na indústria, pipelines de CI/CD são operadas por plataformas como GitHub Actions, GitLab CI e Jenkins, e as práticas de entrega são acompanhadas por métricas do programa DORA: frequência de implantação, tempo de entrega de mudanças, taxa de falha em mudanças e tempo de restauração (Aula 1). Livros como *The DevOps Handbook* (Kim et al., 2016) e o *Site Reliability Engineering* (Beyer et al., 2016) descrevem as práticas de operação que sustentam a entrega contínua. A competência valorizada é a capacidade de projetar uma pipeline com portões significativos, reversão testada e critérios explícitos de decisão.

## 8. Erros comuns {fa-triangle-exclamation}

- **Pipeline que implanta sem verificar.** Automatizar a implantação sem automatizar a verificação só aumenta a velocidade do erro.
- **Artefato reconstruído.** A versão testada não é necessariamente a versão implantada.
- **Segredo no repositório.** Credenciais vazadas devem ser trocadas imediatamente, mesmo após a remoção do histórico.
- **Migração destrutiva em uma única etapa.** Quebra a reversão e transforma um incidente em crise.
- **Reversão nunca ensaiada.** Só se descobre que não funciona quando é preciso usá-la.

## Resumo da aula {fa-square-check}

- Integração, entrega e implantação contínuas se distinguem pelo último passo da pipeline.
- Cada portão tem um papel; um portão verde garante o que ele verifica, e nada além disso.
- O artefato deve ser construído uma vez e promovido com o seu hash, que é a sua identidade.
- Canário e azul-verde limitam o risco; o canário depende de observabilidade e de amostras suficientes.
- Pronto para produção é um conjunto de verificações reais, incluindo a reversão ensaiada.

## Referências {fa-book}

**Acadêmicas e fundacionais**

- BEYER, B. et al. (eds.). *Site Reliability Engineering: How Google Runs Production Systems*. Sebastopol: O'Reilly, 2016.
- FORSGREN, N.; HUMBLE, J.; KIM, G. *Accelerate: The Science of Lean Software and DevOps*. Portland: IT Revolution, 2018.
- HUMBLE, J.; FARLEY, D. *Continuous Delivery*. Upper Saddle River: Addison-Wesley, 2010.
- KIM, G. et al. *The DevOps Handbook*. Portland: IT Revolution, 2016.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.
- WIGGINS, A. *The Twelve-Factor App*. 2011. [12factor.net](https://12factor.net/)

**Prática e mercado**

- FOWLER, M. *Blue Green Deployment*. martinfowler.com, 2010. [martinfowler.com/bliki/BlueGreenDeployment.html](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- FOWLER, M. *Canary Release*. martinfowler.com, 2010. [martinfowler.com/bliki/CanaryRelease.html](https://martinfowler.com/bliki/CanaryRelease.html)
- FOWLER, M. *Continuous Integration*. martinfowler.com, 2006. [martinfowler.com/articles/continuousIntegration.html](https://martinfowler.com/articles/continuousIntegration.html)
- GITHUB. *Documentação do GitHub Actions*. [docs.github.com/actions](https://docs.github.com/en/actions)
- DORA. *Accelerate State of DevOps Report*. [dora.dev](https://dora.dev/)
