title: Integração entre sistemas: comunicação síncrona e assíncrona, filas, eventos, garantias de entrega e DLQ
desc: Aula de integração de sistemas: síncrono versus assíncrono, filas e tópicos, garantias de entrega, idempotência, retentativas com backoff e jitter, mensagens mortas e padrão outbox, com exemplos executáveis, animação e testes mapeados.
icon: fa-tower-broadcast
favicon: 🏭
topic: es/07-integracao-mensageria
---

## Visão geral {fa-eye}

Esta é a **Aula 7**. Nenhum sistema de negócio vive isolado. Um pedido precisa de estoque, de pagamento, de nota fiscal e de uma notificação. A forma como esses sistemas conversam determina a resistência do conjunto a falhas, a facilidade de evolução e o quanto do sistema para quando uma parte cai. A **integração** é a disciplina que decide essas formas de comunicação.

Ao final da aula você deverá ser capaz de:

- escolher entre comunicação síncrona e assíncrona com base em acoplamento temporal, latência e tolerância a falhas;
- diferenciar fila (um consumidor por mensagem) de tópico (vários interessados) e mensagem de comando de evento;
- explicar por que a entrega "exatamente uma vez" é, na prática, "pelo menos uma vez" somada a consumidores idempotentes;
- projetar retentativas com backoff e jitter, e justificar o jitter com uma simulação;
- aplicar o padrão outbox para evitar a dupla escrita entre banco e broker.

> [!info] Pré-requisitos
> Aulas 2 (requisitos) e 5 (trade-offs). Para as seções sobre sistemas distribuídos, a trilha de Sistemas Distribuídos da disciplina aprofunda consenso e relógios.

> [!tip] Como estudar
> Para cada padrão desta aula, pergunte: o que acontece se esta mensagem chegar duas vezes? e se não chegar nenhuma vez? A resposta a essas duas perguntas é o núcleo da integração confiável.

:::mapa

## 1. Síncrono e assíncrono {fa-arrows-left-right}

### 1.1 Acoplamento temporal

Na comunicação **síncrona**, quem chama envia uma requisição (HTTP, gRPC) e espera a resposta. É o modelo mais simples de raciocinar, porque o resultado está disponível no mesmo fluxo. O custo é o **acoplamento temporal**: se o serviço chamado está lento ou fora do ar, quem chama fica bloqueado, e a falha se propaga pela cadeia de chamadas.

Na comunicação **assíncrona**, quem envia deposita uma mensagem em um intermediário, como uma fila ou um barramento de eventos, e segue em frente. O destinatário processa quando puder. O ganho é o desacoplamento no tempo; o custo é a complexidade: a resposta não é imediata, a ordem pode não ser preservada e as repetições precisam ser tratadas.

Hohpe e Woolf (2003), em *Enterprise Integration Patterns*, catalogaram os padrões de integração que ainda orientam o assunto. Kleppmann (2017), em *Designing Data-Intensive Applications*, analisa as garantias que sistemas assíncronos podem oferecer e as que não podem.

:::quiz T-07-01 | 1 | síncrono e assíncrono
P: Qual é a principal vantagem da comunicação assíncrona?
A) A resposta é sempre obtida imediatamente.
*B) O remetente não precisa que o destinatário esteja disponível naquele instante, reduzindo o acoplamento temporal.
C) A ordem das mensagens é sempre garantida.
D) Não é necessário tratar falhas.
X: O desacoplamento temporal é o ganho central. Ordem e tratamento de falhas continuam sendo responsabilidade da aplicação, e até se tornam mais difíceis.
:::

### 1.2 Regra prática

Use a comunicação síncrona quando quem chama **precisa** do resultado para continuar: consultar um saldo antes de autorizar um pagamento, por exemplo. Use a assíncrona quando quem chama só precisa que algo aconteça: enviar um e-mail, atualizar um índice de busca, registrar um evento para análise.

## 2. Filas, tópicos e a semântica dos eventos {fa-layer-group}

Duas estruturas são fundamentais. Uma **fila** entrega cada mensagem a um único consumidor, e serve para distribuir trabalho entre instâncias de um mesmo serviço. Um **tópico** (publicação-assinatura) entrega cada mensagem a todos os assinantes, e serve para anunciar fatos a vários interessados.

A distinção também é semântica. Uma **mensagem de comando** diz o que deve ser feito ("envie este e-mail") e tem um destinatário claro. Um **evento** diz o que aconteceu ("o pedido 42 foi criado"), no passado, e não sabe quem vai reagir. Essa diferença determina o acoplamento: eventos reduzem o que o produtor precisa saber sobre os consumidores. Fowler (2017) distingue esses usos em uma discussão sobre tipos de eventos, e alerta que eventos que carregam apenas identificadores obrigam os consumidores a consultar a origem, criando um acoplamento escondido.

:::quiz T-07-02 | 2 | filas e eventos
P: Um serviço publica "PedidoCriado" e três serviços diferentes reagem a ele. Qual estrutura é a mais adequada?
A) Uma fila, com um único consumidor por mensagem.
*B) Um tópico (publicação-assinatura), para que cada assinante receba o evento.
C) Uma chamada síncrona a cada um dos três serviços.
D) Um arquivo compartilhado lido periodicamente.
X: Um evento anunciado a vários interessados é entregue por tópico. Uma fila entregaria a mensagem a apenas um deles.
:::

## 3. Garantias de entrega {fa-envelope-circle-check}

Há três garantias possíveis, e a diferença entre elas é o que a aplicação precisa tratar:

- **No máximo uma vez**: a mensagem pode se perder, mas nunca chega duplicada. Adequada para telemetria, em que perder um ponto é aceitável.
- **Pelo menos uma vez**: a mensagem não se perde, mas pode chegar mais de uma vez. É a garantia mais comum, porque o produtor reenvia quando não recebe confirmação, e o consumidor pode processar e cair antes de confirmar.
- **Exatamente uma vez**: cada mensagem tem efeito único. Em sistemas distribuídos, essa garantia não é oferecida de forma geral pela infraestrutura. O que se obtém é **pelo menos uma vez somado a idempotência** no consumidor.

Um **efeito idempotente** é aquele que, repetido, produz o mesmo resultado que uma execução única. O consumidor torna o efeito idempotente registrando os identificadores já processados e ignorando as repetições. Sem isso, um e-mail de cobrança é enviado duas vezes, ou um débito é aplicado em dobro.

:::quiz T-07-03 | 2 | garantias
P: Um broker oferece entrega "pelo menos uma vez". Como garantir que um débito não seja aplicado duas vezes?
A) Confiar que a entrega exatamente uma vez do broker resolve o problema.
*B) Tornar o consumidor idempotente, registrando identificadores processados na mesma transação do efeito.
C) Aumentar o número de consumidores para processar mais rápido.
D) Desativar as retentativas do produtor.
X: A repetição é uma propriedade da entrega. O efeito único precisa ser garantido pelo consumidor, com um identificador que reconhece a repetição e uma transação que une o registro ao efeito.
:::

## 4. Retentativas: backoff, jitter e mensagens mortas {fa-rotate-left}

### 4.1 Por que retentar, e como

Muitas falhas são transitórias: uma conexão caiu, um serviço reiniciou, um banco estava sobrecarregado por um instante. Retentar resolve esses casos, desde que a estratégia tenha três cuidados. O **limite de tentativas** evita laços infinitos. O **backoff exponencial** espaça as tentativas (1, 2, 4 unidades de tempo). E o **jitter** acrescenta aleatoriedade ao intervalo.

O jitter parece um detalhe e é decisivo. Brooker (2015), em um texto do blog de arquitetura da AWS, analisa o efeito de retentativas sincronizadas: quando muitos clientes falham juntos e retentam no mesmo instante, formam ondas de carga que impedem o serviço de se recuperar. A simulação a seguir mede esse efeito.

:::run 07/02-jitter.py

O backoff sem jitter faz todos os clientes retentarem exatamente no mesmo instante, em cada rodada: o pico é a população inteira. Com jitter, as mesmas retentativas se espalham, e o pico cai de forma substancial. A simulação não é uma medida de um sistema real, mas mostra o mecanismo, e a redução que aparece nela é a razão pela qual o jitter é recomendado em clientes de serviços.

:::quiz T-07-04 | 2 | retentativas
P: Por que o backoff exponencial, sozinho, pode não bastar para proteger um serviço que está se recuperando?
A) Porque o backoff exponencial aumenta o tempo total de cada requisição sem limite.
*B) Porque clientes que falharam juntos continuam retentando juntos, formando ondas sincronizadas de carga; o jitter espalha essas tentativas.
C) Porque o backoff exponencial não funciona para falhas transitórias.
D) Porque o backoff impede a entrega de mensagens em ordem.
X: A sincronização é o problema que o jitter resolve. Sem aleatoriedade, o backoff apenas adia a onda de carga, mantendo a mesma forma.
:::

### 4.2 Mensagens mortas

Quando o limite de tentativas é atingido, a mensagem não pode ser descartada em silêncio. Ela vai para uma **fila de mensagens mortas** (DLQ, *dead letter queue*), onde pode ser inspecionada, corrigida e reprocessada. Falhas **permanentes** (um dado inválido, por exemplo) devem ir à DLQ imediatamente, sem gastar tentativas, porque repetir não as resolve. A distinção entre falha transitória e permanente é, portanto, uma decisão de projeto que precisa existir no código. A DLQ, por sua vez, precisa de dono, de alerta e de procedimento de reprocessamento; uma DLQ esquecida é um vazamento silencioso.

O exemplo a seguir implementa um consumidor com essas regras, com um efeito externo simulado e com a semente fixa para que a execução seja reproduzível.

:::run 07/01-consumidor-idempotente.py

A saída mostra os três destinos possíveis de uma mensagem: processada (após retentativas), repetida (ignorada) e enviada à DLQ (falha permanente). Repare que a mensagem 1 chega duas vezes e o efeito é aplicado uma única vez.

:::anim
canvas: cvMensageria
ctl: ctlMensageria
cap: capMensageria
desenha: desenhaMensageria
gera: geraMensageria
velocidade: 2600
:::

:::quiz T-07-05 | 2 | DLQ
P: Uma mensagem contém um campo com valor negativo onde a regra exige valor positivo. Qual é o destino correto?
A) Retentar com backoff até o limite, porque pode ser um erro transitório.
*B) Enviar diretamente à DLQ, porque repetir a mesma mensagem não resolve uma falha permanente.
C) Descartar a mensagem, porque ela não tem valor.
D) Reenviar ao produtor com a mesma carga, sem alteração.
X: A falha permanente não muda com a repetição. Retentar gasta recursos e atrasa a detecção do problema real, que é um dado inválido na origem.
:::

## 5. Padrão outbox: a dupla escrita {fa-inbox}

Um erro sutil surge quando o serviço precisa gravar um dado no banco **e** publicar um evento. Se grava e cai antes de publicar, o evento nunca sai. Se publica e depois falha ao gravar, o evento anuncia algo que não aconteceu. Não existe forma simples de tornar as duas operações atômicas sem coordenação distribuída, que é cara.

O **padrão outbox**, descrito por Richardson (2018), resolve o problema na mesma transação: o serviço grava o dado de negócio e, em uma tabela de saída (*outbox*), o evento correspondente. Um processo separado lê a tabela e publica os eventos. Como o dado e o evento estão na mesma transação, ou os dois existem, ou nenhum existe. A publicação passa a ser pelo menos uma vez, o que reforça a necessidade de consumidores idempotentes, como vimos na seção 3.

:::quiz T-07-06 | 3 | outbox
P: Por que o padrão outbox não elimina a necessidade de consumidores idempotentes?
A) Porque o banco de dados não suporta transações.
*B) Porque o processo que publica os eventos pode repetir uma publicação após uma falha, de modo que a entrega continua sendo pelo menos uma vez.
C) Porque a fila não guarda mensagens.
D) Porque o outbox impede a leitura dos eventos.
X: O outbox garante que o evento não se perca nem seja inventado em relação ao dado. Mas a publicação pode ser repetida após uma falha entre o envio e a marcação de "enviado", o que torna a repetição possível do lado do consumidor.
:::

:::exercicio T-07-E1 | 2 | garantias
Um serviço de pagamentos publica o evento "PagamentoAprovado" e um serviço de faturamento o consome para emitir a nota fiscal. Descreva o que acontece se a mensagem chegar duas vezes e se o faturamento falhar por três horas. Proponha o projeto do consumidor para ambos os casos.
:::gabarito
Se a mensagem chegar duas vezes, sem idempotência o faturamento emitiria duas notas fiscais, o que é um erro fiscal. A solução é o consumidor registrar o identificador do pagamento na mesma transação em que emite a nota; a repetição é reconhecida e ignorada. Se o faturamento ficar fora por três horas, as mensagens acumulam na fila (é esperado, e é uma vantagem do desacoplamento). O consumidor deve retentar com backoff e jitter, e mensagens que continuam falhando de forma permanente (dados inválidos) vão à DLQ. Também é preciso monitorar a idade da mensagem mais antiga, porque três horas de acúmulo podem violar um prazo legal de emissão. A resposta forte relaciona a idempotência à segurança fiscal e o backlog ao monitoramento.
:::

:::exercicio T-07-E2 | 3 | outbox
Descreva, passo a passo, como o padrão outbox garante que um pedido gravado e seu evento "PedidoCriado" nunca fiquem inconsistentes, mesmo que o processo de publicação caia no meio do caminho. Indique que propriedade a publicação precisa ter para isso funcionar.
:::gabarito
Passos: (1) a aplicação abre uma transação; (2) grava o pedido na tabela de pedidos; (3) grava o evento na tabela outbox, com status "pendente"; (4) confirma a transação, de modo que ambos existam ou nenhum exista. Um processo separado lê os eventos pendentes, publica no broker e marca cada um como enviado. Se esse processo cair após publicar e antes de marcar, o evento será publicado de novo na próxima leitura. Por isso a propriedade necessária é que a publicação seja **pelo menos uma vez**, combinada com consumidores idempotentes que reconhecem o identificador do evento. A inconsistência é evitada porque o dado nunca existe sem seu evento na mesma transação, e a repetição não causa efeito duplicado.
:::

## 6. Mercado de trabalho {fa-briefcase}

Na prática, a integração assíncrona é realizada com brokers como Apache Kafka, RabbitMQ e serviços gerenciados de nuvem, como Amazon SQS e SNS, que oferecem filas, tópicos e DLQ. A documentação desses produtos descreve as garantias de entrega com precisão, e é leitura obrigatória antes de qualquer projeto. Kreps (2013), engenheiro que participou do projeto do Kafka, descreveu o log como abstração central da integração de dados, uma ideia que aparece em muitas arquiteturas de dados modernas. Em entrevistas de engenharia, a pergunta sobre o que acontece quando uma mensagem chega duas vezes é quase universal, e a resposta esperada é a idempotência.

## 7. Erros comuns {fa-triangle-exclamation}

- **Assumir exatamente uma vez.** A repetição acontece; o projeto deve prever o efeito repetido.
- **Consumidor sem identificador.** Sem chave, não há como reconhecer repetições.
- **Retentativas sem limite.** Uma falha permanente vira um laço sem fim e consumo de recursos.
- **Dupla escrita.** Gravar no banco e publicar sem outbox produz eventos perdidos ou inventados.
- **DLQ sem dono.** Mensagens mortas acumuladas sem análise escondem defeitos reais.

## Resumo da aula {fa-square-check}

- Comunicação assíncrona desacopla no tempo, ao custo de complexidade.
- Fila distribui trabalho; tópico anuncia fatos a vários interessados; eventos e comandos têm semânticas diferentes.
- A entrega é, na prática, pelo menos uma vez; o efeito único depende de consumidores idempotentes.
- Retentativas precisam de limite, backoff e jitter; falhas permanentes vão direto à DLQ.
- O padrão outbox une a gravação do dado e a publicação do evento em uma única transação.

## Referências {fa-book}

**Acadêmicas e fundacionais**

- DEAN, J.; BARROSO, L. A. The tail at scale. *Communications of the ACM*, v. 56, n. 2, p. 74–80, 2013.
- HELLAND, P. Life beyond distributed transactions: an apostate's opinion. In: *Proceedings of CIDR*, 2007.
- HOHPE, G.; WOOLF, B. *Enterprise Integration Patterns*. Boston: Addison-Wesley, 2003.
- KLEPPMANN, M. *Designing Data-Intensive Applications*. Sebastopol: O'Reilly, 2017.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.

**Prática e mercado**

- BROOKER, M. Exponential backoff and jitter. *AWS Architecture Blog*, 2015. [aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- FOWLER, M. *What do you mean by "Event-Driven"?* martinfowler.com, 2017. [martinfowler.com/articles/201701-event-driven.html](https://martinfowler.com/articles/201701-event-driven.html)
- KREPS, J. The log: what every software engineer should know about real-time data's unifying abstraction. *LinkedIn Engineering Blog*, 2013. [engineering.linkedin.com](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)
- NEWMAN, S. *Building Microservices*. 2. ed. Sebastopol: O'Reilly, 2021.
- RICHARDSON, C. *Microservices Patterns*. Shelter Island: Manning, 2018. (Padrão outbox.)
- APACHE KAFKA. *Documentação oficial*. [kafka.apache.org/documentation](https://kafka.apache.org/documentation/)
- AMAZON WEB SERVICES. *Amazon SQS: dead-letter queues*. [docs.aws.amazon.com](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html)
