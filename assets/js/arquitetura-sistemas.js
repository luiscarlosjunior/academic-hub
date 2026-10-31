/* =====================================================================
   Arquitetura de Sistemas — animações de conceito
   Usada pelas páginas de tópico em disciplinas/arquitetura-sistemas/topicos/.
   Depende de assets/js/design-system-aws.js, que expõe DSA.criaConceito
   (renderizador genérico: rótulos, setas, destaques e legenda por quadro).
   Cada animação segue o formato { canvas, rotulos, con, quadros }, onde
   quadros é uma lista de [destaques, texto, erro?].
   ===================================================================== */
(function () {
  'use strict';

  DSA.criaConceito('arq01a', {
    canvas: 'cvArq01a',
    rotulos: ['Produtor', 'Fila', 'Consumidor A', 'Consumidor B'],
    con: [[0, 1], [1, 2]],
    quadros: [
      [[0], 'O produtor envia a mensagem sem esperar que ela seja processada. O envio desacopla os dois lados no tempo.'],
      [[0, 1], 'A fila guarda a mensagem até que um consumidor esteja disponível. Se o consumidor cair, a mensagem continua na fila.'],
      [[1, 2], 'Um único consumidor recebe a mensagem. Ela só sai da fila quando é confirmada.'],
      [[3], 'O consumidor B não recebe essa mensagem. Em uma fila, cada mensagem é consumida por um único destinatário.']
    ]
  });

  DSA.criaConceito('arq01b', {
    canvas: 'cvArq01b',
    rotulos: ['Publicador', 'Tópico', 'Assinante 1', 'Assinante 2', 'Assinante 3'],
    con: [[0, 1], [1, 2], [1, 3], [1, 4]],
    quadros: [
      [[0, 1], 'O publicador envia o evento ao tópico, sem conhecer quem vai consumi-lo.'],
      [[1, 2, 3, 4], 'O tópico entrega uma cópia do evento a cada assinante. Novos assinantes podem ser adicionados sem alterar o publicador.'],
      [[4], 'O assinante 3 falha. As cópias entregues aos outros assinantes não são afetadas: a falha fica isolada.', 4]
    ]
  });

  DSA.criaConceito('arq02a', {
    canvas: 'cvArq02a',
    rotulos: ['Mensagem 0', 'Mensagem 1', 'Mensagem 2', 'Mensagem 3', 'Mensagem 4'],
    con: [[0, 1], [1, 2], [2, 3], [3, 4]],
    quadros: [
      [[0, 1, 2, 3, 4], 'Um tópico de streaming é um log ordenado. Cada mensagem recebe um offset, que é a sua posição no log.'],
      [[2], 'O consumidor guarda o offset da última mensagem processada. Ao reiniciar, retoma a leitura a partir dali.'],
      [[0, 1], 'Ler uma mensagem não a remove. Elas expiram apenas após o período de retenção, o que permite reprocessamento (replay).']
    ]
  });

  DSA.criaConceito('arq02b', {
    canvas: 'cvArq02b',
    rotulos: ['Produtor', 'Partição A', 'Partição B', 'Consumidor 1', 'Consumidor 2'],
    con: [[0, 1], [0, 2], [1, 3], [2, 4]],
    quadros: [
      [[0], 'O produtor escolhe a partição pela chave do evento. Eventos com a mesma chave ficam ordenados entre si.'],
      [[1, 2], 'Cada partição é lida por no máximo um consumidor do mesmo grupo. É isso que permite paralelizar o processamento.'],
      [[3, 4], 'Com dois consumidores no grupo, cada um processa uma partição. Consumidores além do número de partições ficam ociosos.']
    ]
  });

  DSA.criaConceito('arq03a', {
    canvas: 'cvArq03a',
    rotulos: ['Pedido 1: Ana, Rua X', 'Pedido 2: Ana, Rua X', 'Pedido 3: Ana, Rua Y'],
    con: [[0, 1], [1, 2]],
    quadros: [
      [[0, 1, 2], 'O endereço da cliente Ana está repetido em cada pedido. Isso é redundância.'],
      [[2], 'Ao mudar o endereço apenas no pedido 3, os demais ficam divergentes. Esse é o problema de anomalia de atualização.', 2],
      [[0, 1], 'Separando clientes e pedidos, o endereço passa a existir uma única vez. A mudança é feita em um só lugar.']
    ]
  });

  DSA.criaConceito('arq03b', {
    canvas: 'cvArq03b',
    rotulos: ['Não normalizada', '1FN: valores atômicos', '2FN: sem dependência parcial', '3FN: sem dependência transitiva'],
    con: [[0, 1], [1, 2], [2, 3]],
    quadros: [
      [[0], 'Na forma não normalizada, uma coluna pode conter listas ou vários valores. Consultas e atualizações ficam frágeis.'],
      [[1], '1FN: cada campo guarda um único valor atômico, e cada linha é identificada por uma chave.'],
      [[2], '2FN: cada atributo não chave depende da chave inteira. Em chaves compostas, não pode haver dependência de parte dela.'],
      [[3], '3FN: nenhum atributo não chave depende de outro atributo não chave. Ex.: a cidade não deve depender do CEP na mesma tabela.']
    ]
  });

  DSA.criaConceito('arq04a', {
    canvas: 'cvArq04a',
    rotulos: ['Linha 1 (id, nome, valor)', 'Linha 2 (id, nome, valor)', 'Linha 3 (id, nome, valor)', 'Coluna valor (10, 20, 30)'],
    con: [],
    quadros: [
      [[0, 1, 2], 'No armazenamento por linhas, todos os campos de um registro ficam juntos. Ler ou gravar um registro inteiro é direto.'],
      [[3], 'No armazenamento por colunas, os valores de um mesmo campo ficam juntos. Ler uma coluna inteira deixa de lado os demais campos.']
    ]
  });

  DSA.criaConceito('arq04b', {
    canvas: 'cvArq04b',
    rotulos: ['Consulta: SOMA(valor)', 'Lê só a coluna valor', 'Ignora nome e data', 'Compressão por coluna'],
    con: [[0, 1], [1, 3]],
    quadros: [
      [[0], 'Uma consulta analítica agrega uma coluna de milhões de linhas, como a soma de vendas.'],
      [[1, 2], 'Em armazenamento colunar, o motor lê somente a coluna necessária. O restante do disco não é percorrido.'],
      [[3], 'Valores de uma mesma coluna são parecidos e repetidos. Por isso, a compressão por coluna costuma ser muito mais eficiente.']
    ]
  });

  DSA.criaConceito('arq05a', {
    canvas: 'cvArq05a',
    rotulos: ['Chave-valor', 'Documento', 'Colunar (wide-column)', 'Grafo'],
    con: [],
    quadros: [
      [[0], 'Chave-valor: acesso por uma chave, com valor opaco. Ex.: cache de sessões e carrinho de compras.'],
      [[1], 'Documento: valores estruturados (JSON). Ex.: cadastro de produto com atributos variáveis.'],
      [[2], 'Colunar (wide-column): linhas com colunas esparsas, organizadas por chave de partição. Ex.: séries temporais de sensores.'],
      [[3], 'Grafo: nós e arestas com propriedades. Ex.: detecção de fraude por caminhos entre contas.']
    ]
  });

  DSA.criaConceito('arq05b', {
    canvas: 'cvArq05b',
    rotulos: ['Buscar por id', 'Buscar por campo aninhado', 'Séries por partição', 'Caminhos entre entidades'],
    con: [[0, 1], [1, 2], [2, 3]],
    quadros: [
      [[0], 'Acesso por identificador favorece chave-valor, a família mais simples e rápida para esse padrão.'],
      [[1], 'Consultas por campos dentro de um documento favorecem o modelo documento, que indexa sua estrutura.'],
      [[2], 'Leituras de intervalos dentro de uma partição favorecem o modelo colunar, pois os dados ficam agrupados.'],
      [[3], 'Perguntas sobre relações de vários saltos favorecem grafos. Em SQL, a mesma consulta exige junções em cadeia.']
    ]
  });

  DSA.criaConceito('arq06a', {
    canvas: 'cvArq06a',
    rotulos: ['Consistência (C)', 'Disponibilidade (A)', 'Tolerância a partição (P)'],
    con: [],
    quadros: [
      [[0], 'Consistência: toda leitura devolve o valor da escrita mais recente, ou um erro.'],
      [[1], 'Disponibilidade: toda requisição recebe uma resposta, sem garantia de que ela seja a mais recente.'],
      [[2], 'Tolerância a partição: o sistema continua funcionando mesmo quando a rede separa nós que não se comunicam.']
    ]
  });

  DSA.criaConceito('arq06b', {
    canvas: 'cvArq06b',
    rotulos: ['Nó A (réplica)', 'Nó B (réplica)', 'Cliente', 'Rede interrompida'],
    con: [[0, 1], [2, 0], [2, 1]],
    quadros: [
      [[0, 1], 'Operação normal: as duas réplicas têm o mesmo dado. Nenhuma escolha precisa ser feita.'],
      [[3], 'A rede é interrompida, e o nó A não alcança o nó B. Essa separação é uma partição.', 3],
      [[2, 0], 'Escolha CP: o nó A recusa a escrita até sincronizar. A consistência é preservada, mas a disponibilidade cai.'],
      [[2, 1], 'Escolha AP: o nó A aceita a escrita. O nó B pode devolver um valor antigo até a reconciliação. A consistência cede.']
    ]
  });

  DSA.criaConceito('arq07a', {
    canvas: 'cvArq07a',
    rotulos: ['Servidor pequeno', 'Servidor grande (vertical)', 'Três servidores (horizontal)'],
    con: [],
    quadros: [
      [[0], 'Ponto de partida: um servidor pequeno, que atinge o limite de CPU e memória sob carga crescente.'],
      [[1], 'Escala vertical: aumenta-se o tamanho da máquina. Simples de fazer, mas existe um teto físico e um ponto único de falha.'],
      [[2], 'Escala horizontal: adicionam-se máquinas. Exige que a aplicação e os dados sejam distribuídos entre elas.']
    ]
  });

  DSA.criaConceito('arq07b', {
    canvas: 'cvArq07b',
    rotulos: ['Clientes', 'Balanceador', 'Servidor 1', 'Servidor 2', 'Servidor 3'],
    con: [[0, 1], [1, 2], [1, 3], [1, 4]],
    quadros: [
      [[0, 1], 'Os clientes enviam requisições a um único endereço, o balanceador de carga.'],
      [[2], 'Round robin: as requisições são distribuídas em sequência entre os servidores, uma de cada vez.'],
      [[3], 'Menos conexões: a requisição vai ao servidor com menos trabalho ativo, o que ajuda quando as requisições têm duração variável.'],
      [[4], 'Hash por chave: a mesma chave sempre vai ao mesmo servidor, o que favorece cache local e sessões.']
    ]
  });

  DSA.criaConceito('arq08a', {
    canvas: 'cvArq08a',
    rotulos: ['Conta criada (saldo 0)', 'Depósito de +100', 'Saque de -30', 'Saldo calculado: 70'],
    con: [[0, 1], [1, 2], [2, 3]],
    quadros: [
      [[0], 'Em event sourcing, o registro guarda fatos imutáveis: eventos, e não o saldo atual.'],
      [[1], 'Cada evento é acrescentado ao log. Nenhum evento anterior é alterado ou apagado.'],
      [[2], 'O saque também é um evento. Ele não sobrescreve o depósito; apenas acrescenta mais um fato.'],
      [[3], 'O estado atual é derivado por reprodução dos eventos: 0 + 100 - 30 = 70. Isso dá auditoria completa.']
    ]
  });

  DSA.criaConceito('arq08b', {
    canvas: 'cvArq08b',
    rotulos: ['Comando (escrita)', 'Log de eventos', 'Projeção de leitura', 'Consulta (leitura)'],
    con: [[0, 1], [1, 2], [2, 3]],
    quadros: [
      [[0], 'No CQRS, o lado de escrita recebe comandos, que podem ser recusados por regras de negócio.'],
      [[1], 'Um comando aceito gera eventos, que são gravados no log.'],
      [[2], 'Uma projeção consome os eventos e mantém uma visão otimizada para leitura, como uma tabela de resumo.'],
      [[3], 'A consulta lê a projeção. Ela pode estar um pouco atrás do log: a leitura é eventualmente consistente.']
    ]
  });
})();
