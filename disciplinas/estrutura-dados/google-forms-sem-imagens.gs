/**
 * Google Form em modo quiz: 30 questões de C básica, ponteiros, vetores e matrizes,
 * em três seções (1 a 10, 11 a 20 e 21 a 30), separadas por quebra de página.
 * Este script NÃO contém imagens: o enunciado de cada questão deve ser adicionado
 * manualmente no formulário. Cada questão traz um aviso para o aluno ler o enunciado
 * na imagem. As alternativas são de múltipla escolha, com a correta marcada.
 *
 * Como usar: no Google Drive, crie um Apps Script novo (script.new), cole este código,
 * salve e execute criarQuiz uma vez. Os links aparecem em Ver > Registros.
 */

const SECOES = [{"titulo": "Parte 1 de 3 · questões 1 a 10", "ini": 1, "fim": 10, "itens": [{"n": 1, "opcoes": ["8", "40", "10", "4", "80"], "correta": "B"}, {"n": 2, "opcoes": ["6 e 6", "4 e 5", "5 e 5", "6 e 5", "5 e 6"], "correta": "E"}, {"n": 3, "opcoes": ["Erro de compilação", "0", "Um valor de lixo de memória", "10", "3"], "correta": "E"}, {"n": 4, "opcoes": ["i = 3, j = 6", "i = 3, j = 8", "i = 2, j = 6", "i = 3, j = 9", "i = 2, j = 9"], "correta": "A"}, {"n": 5, "opcoes": ["O compilador sempre bloqueia o acesso e exibe uma mensagem de erro", "É comportamento indefinido: o programa pode travar, produzir lixo ou corromper outra variável, sem aviso.", "O valor devolvido é sempre zero, pois C preenche a memória com zeros", "O índice é automaticamente reduzido ao último elemento válido", "A linguagem lança uma exceção que pode ser capturada com try/catch"], "correta": "B"}, {"n": 6, "opcoes": ["Multiplicar p por zero antes de reutilizá-lo", "Confiar que free zera o ponteiro automaticamente", "Atribuir NULL a p, para que qualquer uso posterior seja detectado com um teste explícito.", "Chamar free(p) de novo para garantir que a memória foi liberada", "Deixar p como está, pois o sistema impede acessos a memória liberada"], "correta": "C"}, {"n": 7, "opcoes": ["5", "Erro de compilação", "&x", "O endereço de x", "9"], "correta": "E"}, {"n": 8, "opcoes": ["20 20", "10 30", "20 30", "30 50", "20 40"], "correta": "E"}, {"n": 9, "opcoes": ["*(&v + i)", "*v + i", "*(v + i)", "v + i", "&v[i] + 1"], "correta": "C"}, {"n": 10, "opcoes": ["Porque sizeof não funciona com arrays de inteiros", "Porque sizeof só mede variáveis globais", "Porque o parâmetro é recebido como um ponteiro, e a informação sobre o tamanho do array não chega à função.", "Porque a função sempre recebe um vetor de um único elemento", "Porque o vetor é copiado inteiro e fica com tamanho zero"], "correta": "C"}]}, {"titulo": "Parte 2 de 3 · questões 11 a 20", "ini": 11, "fim": 20, "itens": [{"n": 11, "opcoes": ["Verificar se v->dados é NULL antes de chamar realloc", "Guardar o retorno em um ponteiro temporário e só atribuir a v->dados se o valor não for NULL.", "Trocar realloc por calloc, que nunca falha", "Chamar free(v->dados) antes de realloc, para liberar espaço", "Atribuir o retorno diretamente a v->dados, pois realloc libera o bloco antigo antes de falhar"], "correta": "B"}, {"n": 12, "opcoes": ["p pode apontar para outro endereço, mas o valor apontado não pode ser alterado através de p.", "A variável x apontada por p torna-se constante em todo o programa", "É equivalente a int * const p", "p não pode mudar de endereço, mas o valor apontado pode ser alterado", "Nem p nem o valor apontado podem ser alterados"], "correta": "A"}, {"n": 13, "opcoes": ["O valor 5 é gravado no endereço zero, sem efeito colateral", "A atribuição é ignorada silenciosamente pelo compilador", "p passa a apontar para o endereço 5", "O compilador recusa o código por incompatibilidade de tipos", "É comportamento indefinido, geralmente com falha de segmentação. O correto é testar p != NULL antes de desreferenciar."], "correta": "E"}, {"n": 14, "opcoes": ["Acesso a uma cópia da struct, que não altera o original", "Erro de sintaxe, pois ponteiros para struct não usam ponto nem seta", "Multiplicação entre o campo d e o ponteiro m", "Acesso ao campo da struct apontada por m; é equivalente a (*m).campo.", "Acesso ao endereço da struct, não ao campo"], "correta": "D"}, {"n": 15, "opcoes": ["O endereço do segundo elemento, em hexadecimal", "3", "2", "0", "1"], "correta": "C"}, {"n": 16, "opcoes": ["Porque o vetor é mantido ordenado internamente pela linguagem", "Porque C guarda um índice separado para cada elemento", "Porque C utiliza uma tabela hash para cada vetor", "Porque o endereço é calculado diretamente: endereço base + i × tamanho do elemento, sem percorrer nada.", "Porque o processador examina todos os elementos em paralelo"], "correta": "D"}, {"n": 17, "opcoes": ["O vetor deve estar ordenado.", "O vetor deve ter tamanho igual a uma potência de 2", "O vetor não pode conter valores repetidos", "O vetor deve estar armazenado em uma lista encadeada", "O vetor deve ter pelo menos mil elementos"], "correta": "A"}, {"n": 18, "opcoes": ["3", "9", "2", "1", "4"], "correta": "A"}, {"n": 19, "opcoes": ["O(n²), pois cada deslocamento exige uma nova cópia do vetor", "O(1), pois basta trocar o primeiro elemento com o último", "O(log n), pela busca binária da posição", "O(1), pois a remoção apenas diminui o tamanho do vetor", "O(n), pois todos os elementos seguintes precisam ser deslocados uma posição para a esquerda."], "correta": "E"}, {"n": 20, "opcoes": ["4: 1 2 2 3", "3: 1 2 3", "3: 1 1 2", "6: 1 1 2 2 2 3", "2: 1 2"], "correta": "B"}]}, {"titulo": "Parte 3 de 3 · questões 21 a 30", "ini": 21, "fim": 30, "itens": [{"n": 21, "opcoes": ["Para restaurar o tamanho original do vetor após as trocas", "Porque inverter faixas não altera a posição dos elementos", "Porque cada bloco fica na ordem invertida após as duas primeiras; a inversão final restaura a ordem de cada bloco e coloca o bloco [k,n) no início.", "Para impedir que k seja maior que n", "Porque sem ela o vetor fica em ordem decrescente"], "correta": "C"}, {"n": 22, "opcoes": ["6", "4", "7", "-1", "8"], "correta": "A"}, {"n": 23, "opcoes": ["O(n log n)", "O(log n)", "O(n²)", "O(n)", "O(1)"], "correta": "D"}, {"n": 24, "opcoes": ["11", "8", "9", "6", "7"], "correta": "C"}, {"n": 25, "opcoes": ["Porque a matriz é armazenada coluna por coluna em C", "Porque as linhas estão armazenadas de forma contígua, então os acessos consecutivos aproveitam o cache.", "Porque percorrer colunas usa mais memória de pilha", "Porque o percurso por colunas ignora o último elemento", "Porque o compilador só otimiza laços que percorrem linhas"], "correta": "B"}, {"n": 26, "opcoes": ["10 linhas por 1 coluna", "5 linhas por 5 colunas", "2 linhas por 5 colunas", "5 linhas por 2 colunas", "2 linhas por 2 colunas"], "correta": "D"}, {"n": 27, "opcoes": ["calloc zera toda a memória alocada, então a matriz começa com zeros sem um laço de inicialização.", "calloc aceita tamanhos maiores que malloc, sem limite", "calloc é sempre mais rápido do que malloc, em qualquer caso", "malloc não permite liberar a memória depois com free", "calloc cria automaticamente uma matriz de ponteiros"], "correta": "A"}, {"n": 28, "opcoes": ["9 8 7 6 5 4 3 2 1", "1 2 3 6 9 8 7 5 4", "1 2 3 4 5 6 7 8 9", "1 2 3 6 9 8 7 4 5", "1 4 7 8 9 6 3 2 5"], "correta": "D"}, {"n": 29, "opcoes": ["8", "12", "4", "6", "9"], "correta": "B"}, {"n": 30, "opcoes": ["24", "16", "36", "48", "12"], "correta": "D"}]}];

function criarQuiz() {
  const form = FormApp.create('Banco de questões: C básica, ponteiros, vetores e matrizes (sem imagens)');
  form.setDescription(
    'Estrutura de Dados. 30 questões de múltipla escolha, em três partes. ' +
    'Leia o enunciado de cada questão na imagem antes de responder. ' +
    'Cinco alternativas cada, uma correta. Cada questão vale 1 ponto.'
  );
  form.setIsQuiz(true);
  form.setCollectEmail(false);
  form.setShowLinkToRespondAgain(false);
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(true);
  form.setPublishingSummary(false);
  form.setConfirmationMessage('Respostas enviadas. Obrigado!');
  form.setProgressBar(true);

  const letras = ['A', 'B', 'C', 'D', 'E'];

  SECOES.forEach(function (secao, indice) {
    if (indice > 0) {
      const quebra = form.addPageBreakItem();
      quebra.setTitle(secao.titulo);
      quebra.setHelpText('Continue para a próxima parte do banco de questões.');
    } else {
      form.addSectionHeaderItem().setTitle(secao.titulo);
    }

    secao.itens.forEach(function (q) {
      const item = form.addMultipleChoiceItem();
      item.setTitle('Questão ' + String(q.n).padStart(2, '0') + ': qual é a alternativa correta?');
      item.setHelpText('Leia o enunciado na imagem e responda a questão.');
      item.setPoints(1);
      item.setRequired(true);

      const escolhas = q.opcoes.map(function (texto, i) {
        return item.createChoice(letras[i] + ') ' + texto, letras[i] === q.correta);
      });
      item.setChoices(escolhas);
    });
  });

  Logger.log('Formulário criado: ' + form.getEditUrl());
  Logger.log('Link para responder: ' + form.getPublishedUrl());
  return form.getPublishedUrl();
}
