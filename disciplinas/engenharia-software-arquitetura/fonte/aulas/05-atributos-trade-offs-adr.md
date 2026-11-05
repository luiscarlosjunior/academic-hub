title: Atributos de qualidade, trade-offs e decisões arquiteturais (ADR)
desc: Aula de arquitetura de software: o que é arquitetura, como transformar atributos de qualidade em cenários medidos, análise de trade-offs por fronteira de Pareto, modelagem de latência em filas e registro de decisões em ADRs.
icon: fa-scale-balanced
favicon: 🏭
topic: es/05-atributos-trade-offs-adr
---

## Visão geral {fa-eye}

Esta é a **Aula 5**, a primeira da trilha de Arquitetura. Uma arquitetura é o conjunto de decisões estruturais que são caras de mudar depois: as partes do sistema, suas responsabilidades, como elas se comunicam e onde ficam os dados. Essas decisões determinam os **atributos de qualidade** do sistema, e quase toda decisão arquitetural importante é um **trade-off**, isto é, melhora um atributo à custa de outro.

Ao final da aula você deverá ser capaz de:

- definir arquitetura de software com as referências da área (Bass, Clements e Kazman, 2012; ISO/IEC/IEEE 42010) e distingui-la de uma lista de tecnologias;
- transformar requisitos de qualidade em **cenários** com estímulo, ambiente, resposta e medida;
- identificar **pontos de sensibilidade** e **pontos de trade-off** e analisar alternativas por dominância de Pareto;
- modelar, com a fórmula de fila M/M/1, por que a latência cresce de forma não linear com a carga;
- escrever um **ADR** (Architecture Decision Record) completo, incluindo as consequências negativas.

> [!info] Pré-requisitos
> Aulas 1 a 4 e noções de probabilidade elementar para a seção 4. A fórmula de fila é apresentada e derivada de forma intuitiva, sem exigir teoria de filas avançada.

> [!tip] Como estudar
> Para cada exemplo, escreva antes de executar: qual alternativa você espera que vença e por quê. A diferença entre a sua previsão e o resultado é o que mais ensina.

:::mapa

## 1. O que é arquitetura de software {fa-cubes}

### 1.1 Definições

Garlan e Shaw (1994) descreveram a arquitetura de software como o nível de projeto em que se tratam a organização do sistema em componentes, as interações entre eles e os padrões que guiam sua composição. Bass, Clements e Kazman (2012) a definem como a estrutura ou estruturas do sistema, compostas por elementos de software, pelas propriedades externamente visíveis desses elementos e pelos relacionamentos entre eles. A norma ISO/IEC/IEEE 42010 (2022) formaliza a ideia de **descrição de arquitetura**: um conjunto de visões, cada uma voltada a um conjunto de *stakeholders* e às suas preocupações.

Duas consequências dessas definições são importantes. A primeira é que **arquitetura é sobre propriedades**: uma arquitetura existe para dar ao sistema certas qualidades, e a escolha de componentes só se justifica por essas qualidades. A segunda é que **arquitetura não é uma lista de tecnologias**. Escolher um framework é uma decisão de projeto, que pode ser trocada; a arquitetura é a organização das partes que sobrevive a essas trocas quando bem projetada.

### 1.2 Visões

Kruchten (1995) propôs o modelo 4+1: visões lógica, de processo, de desenvolvimento e física, unificadas por cenários. Cada visão responde a preocupações diferentes: a lógica trata de responsabilidades e conceitos do domínio; a de processo, de concorrência e comunicação em tempo de execução; a de desenvolvimento, da organização do código; a física, da implantação em hardware. Clements et al. (2010) sistematizaram a documentação dessas visões, e a Aula 8 apresenta o modelo C4, que organiza as visões em níveis de zoom.

:::quiz T-05-01 | 1 | conceitos
P: Qual das afirmações sobre arquitetura de software está de acordo com a definição de Bass, Clements e Kazman (2012)?
A) Arquitetura é a lista de tecnologias usadas no projeto.
*B) Arquitetura é a estrutura do sistema, com seus elementos, suas propriedades visíveis e seus relacionamentos.
C) Arquitetura é o diagrama de classes de um módulo.
D) Arquitetura só existe em sistemas distribuídos.
X: A definição enfatiza estrutura, propriedades externamente visíveis e relacionamentos. Tecnologias e diagramas de classes são artefatos que podem expressar a arquitetura, mas não a definem.
:::

## 2. Atributos de qualidade e cenários {fa-bullseye}

### 2.1 O problema da vagueza

"O sistema deve ser escalável" não orienta nenhuma decisão. Escalável para quê, sob qual carga, a que custo? A solução proposta por Bass et al. (2012) é o **cenário de atributo de qualidade**, uma frase estruturada em seis partes:

| Parte | Pergunta | Exemplo |
|---|---|---|
| Fonte do estímulo | quem ou o que dispara? | um usuário pagante |
| Estímulo | o que acontece? | pico de 10 vezes a carga normal |
| Artefato | qual parte é afetada? | o serviço de catálogo |
| Ambiente | em que condição? | operação normal, réplicas em funcionamento |
| Resposta | o que o sistema faz? | atende e escala réplicas automaticamente |
| Medida | quanto é aceitável? | p95 abaixo de 300 ms; erros abaixo de 0,5% |

Um cenário bem escrito é testável e custa algo. Um pico de 10 vezes com medida de 300 ms exige uma capacidade muito diferente de um pico de 2 vezes com medida de 2 segundos. Esse custo é o que o cliente precisa conhecer para decidir.

### 2.2 Pontos de sensibilidade e de trade-off

Kazman, Klein e Clements (2000), no método ATAM, distinguem dois conceitos. Um **ponto de sensibilidade** é uma decisão que afeta fortemente um atributo: o número de réplicas, por exemplo, afeta a disponibilidade. Um **ponto de trade-off** é uma decisão que afeta dois ou mais atributos em sentidos opostos: a replicação melhora a disponibilidade e pode piorar a consistência e o custo. Toda decisão arquitetural importante é um ponto de trade-off, e a pergunta de controle é sempre: *o que estamos pagando por isso?*

:::quiz T-05-02 | 2 | cenários
P: Qual das alternativas é um cenário de atributo de qualidade bem formado?
A) O sistema deve ser seguro e rápido.
*B) Em pico de 5 mil logins por minuto, 99% das autenticações respondem em até 500 ms.
C) A autenticação deve usar a melhor tecnologia disponível.
D) O sistema deve ter uma arquitetura moderna.
X: Apenas a alternativa B tem estímulo, ambiente e medida verificável. As demais são adjetivos ou escolhas de tecnologia sem critério de verificação.
:::

:::quiz T-05-03 | 2 | trade-offs
P: Uma decisão aumenta a disponibilidade de um serviço e, ao mesmo tempo, aumenta a dificuldade de manter todas as cópias de dados iguais. Como ATAM classifica essa decisão?
A) Ponto de sensibilidade apenas para disponibilidade.
*B) Ponto de trade-off, por afetar dois atributos em sentidos opostos.
C) Risco de implantação.
D) Requisito funcional.
X: Um ponto de trade-off é justamente a decisão que afeta atributos em direções opostas. A replicação é o exemplo clássico, discutido também no teorema CAP da trilha de Sistemas Distribuídos.
:::

## 3. Análise de trade-offs por dominância {fa-sitemap}

### 3.1 Dominância de Pareto

Quando há várias alternativas e vários atributos, a pergunta "qual é a melhor?" não tem resposta até que se conheçam os pesos. Antes de pesar, porém, é possível eliminar alternativas sem nenhuma discussão. Uma alternativa A **domina** B se A é pelo menos tão boa que B em todos os atributos e estritamente melhor em pelo menos um. Nenhuma função de utilidade monotônica (aquela que cresce quando um atributo melhora) preferirá B a A. O conjunto das alternativas não dominadas é a **fronteira de Pareto**, e é nela que a decisão deve ser tomada.

A dominância é uma ferramenta de **descarte**, não de escolha final: ela reduz o espaço, e a escolha dentro da fronteira depende dos pesos definidos pelos cenários prioritários.

### 3.2 Exemplo executável

O programa a seguir aplica a dominância a cinco alternativas (e uma sexta, claramente inferior) avaliadas em quatro atributos com notas de 1 a 5.

:::run 05/01-pareto.py

A saída identifica a alternativa dominada e quem a domina. Note que a fronteira não escolhe um vencedor: ela apenas mostra que, para qualquer conjunto de pesos, a alternativa dominada está em desvantagem. A escolha entre as cinco restantes é uma decisão de prioridade, e precisa ser registrada com a justificativa.

:::quiz T-05-04 | 2 | Pareto
P: Na análise de dominância, o que significa dizer que a alternativa A domina a alternativa B?
A) A tem nota maior que B em todos os atributos.
*B) A é pelo menos tão boa quanto B em todos os atributos e estritamente melhor em pelo menos um.
C) A é mais barata que B.
D) A foi escolhida pela equipe em uma reunião anterior.
X: A dominância exige igualdade ou superioridade em todos os atributos e superioridade estrita em pelo menos um. A alternativa A pode ter nota igual em alguns atributos.
:::

### 3.3 Animação: a escolha muda com os pesos

Três alternativas são avaliadas em quatro atributos com notas de 1 a 5. Cada quadro muda a importância relativa dos atributos, sem alterar as notas. Observe que a alternativa vencedora muda com os pesos: a decisão depende das prioridades, não de uma superioridade absoluta.

:::anim
canvas: cvTradeoff
ctl: ctlTradeoff
cap: capTradeoff
desenha: desenhaTradeoff
gera: geraTradeoff
velocidade: 3200
:::

## 4. Latência, carga e a fila M/M/1 {fa-chart-line}

### 4.1 Por que a relação não é linear

Um intuito comum é que dobrar a carga dobra a latência. Não é o caso. Em um servidor que atende requisições com taxa μ e recebe requisições com taxa λ, a utilização é `ρ = λ/μ`. Para o modelo de fila M/M/1 (chegadas e atendimentos aleatórios, com um servidor), o tempo médio de resposta é

`W = 1 / (μ − λ)`, válida para `ρ < 1`.

Kleinrock (1975) apresentou essa e outras relações da teoria das filas. Perto da saturação, o denominador tende a zero e a latência cresce sem limite. Little (1961) demonstrou uma relação ainda mais geral, `L = λW`, entre o número médio de itens no sistema, a taxa de chegada e o tempo de permanência, que vale independentemente da distribuição das chegadas.

A consequência arquitetural é direta: **operar perto da saturação é uma escolha com custo em latência**. Um atributo de desempenho só pode ser garantido se a arquitetura mantiver a utilização abaixo de um limite, o que tem custo de infraestrutura. Esse é um trade-off entre desempenho e custo, e o modelo permite quantificá-lo.

:::run 05/02-latencia-carga.py

A tabela mostra o comportamento não linear: passar de 90% para 99% de utilização multiplica a latência por dez. O segundo bloco de saída mostra como a fórmula orienta uma decisão de dimensionamento: quantas instâncias garantem a meta de latência para uma carga conhecida.

> [!warn] O modelo é uma aproximação
> M/M/1 supõe chegadas e tempos de serviço exponenciais e independentes. Sistemas reais têm distribuições diferentes, e os tempos de cauda (p95, p99) são mais sensíveis do que a média. Use o modelo para entender a forma da curva, e meça o sistema real para dimensionar.

:::quiz T-05-05 | 3 | desempenho
P: Um serviço com taxa de atendimento de 100 req/s recebe 90 req/s. Qual é o tempo médio de resposta pelo modelo M/M/1?
A) 10 ms.
*B) 100 ms.
C) 1000 ms.
D) 0,1 ms.
X: W = 1/(μ − λ) = 1/(100 − 90) = 0,1 s = 100 ms. Note que com 50 req/s o tempo seria de 20 ms: a relação entre carga e latência é fortemente não linear.
:::

## 5. Decisões arquiteturais registradas (ADR) {fa-file-signature}

### 5.1 O que é um ADR

Nygard (2011) propôs o **ADR** (*Architecture Decision Record*) como um documento curto que registra uma decisão arquitetural significativa, junto com o seu contexto e as suas consequências. Ele responde a uma pergunta que o código não responde: *por que foi feito assim, e que alternativas foram consideradas?* Richards e Ford (2020) recomendam que decisões arquiteturais sejam tratadas como artefatos de primeira classe, versionados junto com o código.

### 5.2 Estrutura

Um ADR completo tem seções com funções específicas:

- **Título e número**, estáveis. Decisões nunca são apagadas; quando mudam, um novo ADR as substitui e o antigo recebe o status "substituído".
- **Status**: proposta, aceita, substituída ou descontinuada.
- **Contexto**: as forças em jogo, os requisitos e as restrições que tornaram a decisão necessária.
- **Decisão**: o que foi escolhido, escrito no presente e de forma direta.
- **Consequências**: o que melhora, o que piora e o que passa a ser necessário fazer. Esta é a seção mais negligenciada e a mais valiosa.
- **Alternativas consideradas** (recomendada): cada alternativa rejeitada, com o motivo. Ela evita que a equipe repita a mesma discussão.

Um ADR deve caber em uma ou duas páginas. Se precisar de muito mais, o problema provavelmente é de escopo: a decisão está misturada com várias outras.

### 5.3 Exemplo

O ADR a seguir registra a decisão de enviar notificações por fila, e não de forma síncrona. Ele serve de modelo para os ADRs do projeto da disciplina.

```markdown
# ADR-0007: Envio de notificações de atraso por fila

Status: aceita (2026-10-02)

## Contexto
A devolução registra o estado do empréstimo e, em caso de atraso, precisa
notificar o aluno. O servidor de e-mail é instável (quedas de até 40 minutos).
A devolução não deve falhar por causa do e-mail.

## Decisão
O registro da devolução publica o evento EmprestimoAtrasado em uma fila.
Um consumidor separado envia o e-mail, com até 3 tentativas e uma fila de
mensagens mortas para o que não puder ser entregue.

## Alternativas consideradas
- Envio síncrono na mesma requisição: rejeitado, porque acopla a devolução
  à disponibilidade do servidor de e-mail.
- Varredura periódica do banco: rejeitada por latência e carga desnecessária.

## Consequências
+ A devolução responde em tempo constante, mesmo com o e-mail fora do ar.
+ Falhas de envio ficam isoladas e podem ser reprocessadas.
- O e-mail pode atrasar alguns minutos, e o sistema deve aceitar isso.
- Passa a existir um componente novo para operar e monitorar (a fila).
- O consumidor precisa ser idempotente: o mesmo evento pode chegar duas vezes.
```

Repare que as consequências negativas são tão específicas quanto as positivas. Um ADR que só lista benefícios não analisou a decisão.

:::quiz T-05-06 | 2 | ADR
P: Qual seção de um ADR é a mais valiosa para quem lerá a decisão anos depois?
A) O título, porque identifica a decisão.
*B) As consequências, porque registram os custos aceitos e o que precisa ser reavaliado se o contexto mudar.
C) O status, porque indica se a decisão ainda está em vigor.
D) A lista de tecnologias, porque ela muda com frequência.
X: As consequências registram o que a equipe aceitou em troca. Sem elas, uma mudança de decisão parece uma simplificação, e não uma reabertura fundamentada.
:::

:::exercicio T-05-E1 | 2 | cenários
Transforme em cenário de atributo de qualidade completo (fonte, estímulo, artefato, ambiente, resposta e medida) o requisito: "o sistema de matrículas deve aguentar a época de inscrições sem cair."
:::gabarito
Uma resposta forte preenche as seis partes com valores e justificativa. Por exemplo: *Fonte*: estudantes inscritos no portal. *Estímulo*: pico de 20 mil acessos simultâneos nas duas primeiras horas da janela de inscrições. *Artefato*: o serviço de inscrição e o banco de matrículas. *Ambiente*: operação normal, com uma zona de disponibilidade inteira indisponível. *Resposta*: o serviço continua aceitando inscrições, possivelmente com degradação (fila de espera informada ao usuário). *Medida*: disponibilidade de 99,9% durante a janela de inscrição; p95 abaixo de 1 segundo; nenhuma inscrição confirmada perdida. O ponto importante é que "não cair" foi substituído por uma medida e por um ambiente de falha, e as duas ações (aceitar com degradação ou recusar) são decisões que o cliente deve tomar.
:::

:::exercicio T-05-E2 | 3 | ADR
Escreva a seção de consequências de um ADR que decide manter um monólito modular em vez de migrar para microsserviços, em uma equipe de quatro pessoas. Inclua pelo menos duas consequências negativas e uma condição objetiva que deveria reabrir a decisão.
:::gabarito
Uma seção forte inclui, por exemplo: (+) menor custo operacional, sem rede de serviços para operar; (+) transações locais simples; (−) escalar partes isoladamente exige mais trabalho, porque o módulo é implantado junto com o restante; (−) disciplina necessária para manter as fronteiras entre módulos, que um monólito não impõe sozinho (a verificação automática de dependências é o mecanismo); (−) equipes futuras maiores podem exigir revisão. Condição objetiva para reabrir: por exemplo, "se um módulo passar a exigir implantação independente em mais de uma por mês, ou se a equipe ultrapassar 12 pessoas trabalhando no mesmo código, a decisão deve ser reavaliada com um novo ADR". A condição é objetiva porque pode ser observada, e não apenas sentida.
:::

## 6. Mercado de trabalho {fa-briefcase}

Na indústria, decisões arquiteturais são registradas em ADRs em muitas organizações de tecnologia, e o formato é tratado como prática recomendada em radares de tecnologia de consultorias como a Thoughtworks. Frameworks de qualidade em nuvem, como o *Well-Architected Framework* da AWS, organizam os atributos em pilares (por exemplo, confiabilidade, desempenho, segurança e custo) e pedem que cada decisão seja justificada em relação a eles. A competência valorizada em entrevistas de arquitetura é a capacidade de justificar uma escolha por seus trade-offs, reconhecendo o que se perde, e não apenas o que se ganha.

## 7. Erros comuns {fa-triangle-exclamation}

- **Requisito não funcional vago.** "Rápido" e "seguro" sem medida não orientam nenhuma decisão.
- **Tecnologia por moda.** Escolher microsserviços porque são modernos, sem cenário que os justifique.
- **Decisão sem registro.** Um ano depois, ninguém sabe por que o sistema usa duas linguagens.
- **ADR sem consequências negativas.** Uma decisão sem custos declarados não foi analisada.
- **Arquitetura para escala imaginária.** Projetar para dez milhões de usuários quando há cem reais, sem cenário que o justifique.

## Resumo da aula {fa-square-check}

- Arquitetura é a estrutura de um sistema orientada às suas propriedades; não é uma lista de tecnologias.
- Atributos de qualidade se tornam decisões quando são escritos como cenários com medida.
- Toda decisão importante é um trade-off; a dominância de Pareto elimina alternativas sem discussão de pesos.
- A latência cresce de forma não linear com a utilização; operar perto da saturação tem custo.
- Um ADR registra contexto, decisão, alternativas e, sobretudo, consequências.

## Referências {fa-book}

**Acadêmicas e normativas**

- BASS, L.; CLEMENTS, P.; KAZMAN, R. *Software Architecture in Practice*. 3. ed. Boston: Addison-Wesley, 2012.
- CLEMENTS, P. et al. *Documenting Software Architectures: Views and Beyond*. 2. ed. Boston: Addison-Wesley, 2010.
- GARLAN, D.; SHAW, M. *An Introduction to Software Architecture*. Technical Report CMU-CS-94-166, Carnegie Mellon University, 1994.
- ISO/IEC/IEEE 42010:2022. *Software, systems and enterprise: architecture description*. Genebra: ISO, 2022.
- KAZMAN, R.; KLEIN, M.; CLEMENTS, P. *ATAM: Method for Architecture Evaluation*. CMU/SEI-2000-TR-004. Pittsburgh: Software Engineering Institute, 2000.
- KLEINROCK, L. *Queueing Systems, Volume 1: Theory*. New York: Wiley, 1975.
- KRUCHTEN, P. The 4+1 view model of architecture. *IEEE Software*, v. 12, n. 6, p. 42–50, 1995.
- LITTLE, J. D. C. A proof for the queuing formula: L = λW. *Operations Research*, v. 9, n. 3, p. 383–387, 1961.
- NYGARD, M. *Documenting Architecture Decisions*. Cognitect Blog, 2011. [cognitect.com/blog/2011/11/15/documenting-architecture-decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- RICHARDS, M.; FORD, N. *Fundamentals of Software Architecture*. Sebastopol: O'Reilly, 2020.
- FORD, N.; PARSONS, R.; KUA, P. *Building Evolutionary Architectures*. Sebastopol: O'Reilly, 2017.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.

**Mercado**

- AWS. *Well-Architected Framework*. [aws.amazon.com/architecture/well-architected](https://aws.amazon.com/architecture/well-architected/)
- THOUGHTWORKS. *Technology Radar*. [thoughtworks.com/radar](https://www.thoughtworks.com/radar)
