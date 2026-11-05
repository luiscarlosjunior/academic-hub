title: Código legível e robusto: nomes, funções, tratamento de erros, validação e logs
desc: Aula de qualidade de código para a prática profissional: nomes que revelam intenção, funções coesas, tratamento de erros específico com causa preservada, validação na borda, configuração fora do código e logs estruturados com mascaramento, com exemplos executáveis, animação e testes mapeados.
icon: fa-book-open
favicon: 🏭
topic: es/10-codigo-legivel-erros-logs
---

## Visão geral {fa-eye}

Esta é a **Aula 10**. Código é lido muito mais vezes do que é escrito. Em um time profissional, a proporção costuma ser de muitas leituras para cada alteração: alguém precisa entender o código para corrigi-lo, estendê-lo, revisá-lo ou descobrir por que ele falhou às três da manhã. Escrever código legível não é luxo estético; é a forma mais barata de reduzir o custo de tudo o que vem depois.

Ao final da aula você deverá ser capaz de:

- escolher nomes que revelam intenção e comentários que explicam o porquê;
- decompor funções segundo responsabilidades, com critérios objetivos;
- tratar erros de forma específica, preservando a causa e sem engolir falhas;
- posicionar a validação na borda e a regra de negócio no núcleo, coletando todos os erros de entrada;
- escrever logs estruturados, úteis para diagnóstico e livres de dados sensíveis.

> [!info] Pré-requisitos
> Aulas 4 (qualidade) e 6 (estilos). Os exemplos usam Python e a biblioteca `logging`, da biblioteca padrão.

> [!tip] Como estudar
> Para cada exemplo, leia primeiro a versão ruim e tente, em voz alta, dizer o que ela faz. Se você precisar de mais de uma leitura, o código precisa de nomes melhores. Esse exercício vale mais do que qualquer regra.

:::mapa

## 1. Legibilidade: nomes e comentários {fa-tag}

### 1.1 Nomes como promessas

Um nome é uma promessa sobre o que o elemento faz. Kernighan e Pike (1999), em *The Practice of Programming*, defendem que a clareza é a primeira virtude do código. Martin (2008) resume o critério: um nome deve revelar por que o elemento existe, o que faz e como é usado. Se você precisa de um comentário para explicar o nome, o nome ainda não está bom.

Algumas regras práticas decorrem disso. Evite abreviações obscuras (`qtd_dias_atr` obriga a decifrar; `dias_em_atraso` comunica). Evite nomes genéricos como `dados`, `info` ou `processa`. Use o vocabulário do domínio: se o negócio fala de "empréstimo", o código não deve falar de "transação de registro". Booleanos devem ser perguntas, como `esta_atrasado` ou `pode_renovar`.

### 1.2 Comentários

Comentários devem explicar o **porquê**, nunca o **o quê**. `i += 1  # incrementa i` é ruído. Um comentário que explica que um limite de 30 dias existe por exigência de uma norma interna, e que não deve ser alterado sem consulta, carrega informação que o código não consegue expressar sozinho. Comentários desatualizados são piores do que nenhum, por isso devem ser revisados com o código.

:::quiz T-10-01 | 1 | nomes e comentários
P: Qual comentário é mais útil em um código?
A) `# incrementa o contador` antes de `contador += 1`.
*B) `# o limite de 30 dias vem da norma interna; não altere sem consultar o jurídico`.
C) `# TODO: arrumar depois`, sem responsável.
D) `# este bloco faz o que o nome diz`.
X: O comentário útil explica uma razão que o código não expressa. Os demais repetem o código, não dizem nada acionável ou apenas aumentam o ruído.
:::

## 2. Funções coesas {fa-puzzle-piece}

Uma função deve fazer uma coisa e fazê-la bem. O critério prático é que o leitor consiga descrevê-la em uma frase sem usar a palavra "e". Quando a descrição exige "e", há mais de uma responsabilidade.

Três sinais indicam que uma função merece divisão: aninhamento profundo, muitos parâmetros usados apenas em parte do corpo, e mistura de níveis de abstração (regra de negócio e formatação de texto no mesmo bloco). A extração de uma função com nome claro é, muitas vezes, a forma mais barata de documentar um trecho complexo. Cuidado com o excesso: funções minúsculas sem nome significativo espalham a lógica e pioram a leitura.

:::quiz T-10-02 | 2 | funções
P: Uma função calcula o total de um pedido, aplica desconto e envia um e-mail de confirmação. Qual é o critério que indica a divisão?
A) A função tem mais de dez linhas.
*B) A descrição exige o "e": há mais de uma responsabilidade (cálculo, regra de desconto e efeito de envio).
C) A função usa a palavra "total".
D) A função não tem comentários.
X: Coesão é o critério: cada função deve ter uma razão para mudar. Cálculo, desconto e envio mudam por motivos diferentes.
:::

## 3. Tratamento de erros {fa-circle-exclamation}

### 3.1 Três posturas

Há três formas comuns de lidar com erros, e só uma é aceitável. **Engolir a exceção** (`except: pass`) faz o erro desaparecer e o problema reaparecer longe da causa. **Capturar tudo e devolver um valor genérico** (como `None` ou "erro interno") mantém o sistema de pé, mas ninguém sabe o que deu errado. **Capturar o específico e tratar com intenção** é a postura recomendada: cada erro esperado tem um tipo próprio, que pode ser tratado, traduzido ou registrado com contexto.

O exemplo a seguir compara as três posturas, com um gateway de pagamento que falha por tempo esgotado.

:::run 10/01-erros-especificos.py

Na primeira saída, o chamador recebe `None` e não consegue distinguir uma falha de rede de uma recusa. Na segunda, a exceção de domínio `GatewayIndisponivel` informa o problema, e `from erro` preserva a causa original, que aparece na depuração. A terceira mostra a regra de falhar cedo: uma entrada inválida é rejeitada no ponto da violação, com mensagem clara.

### 3.2 Encadeamento de exceções

A cláusula `raise ... from` cria uma cadeia de causas: a exceção de alto nível informa o que o sistema tentou fazer, e a exceção original informa por que falhou. Essa cadeia é o registro que um desenvolvedor precisa para diagnosticar um problema sem reproduzi-lo. Sem ela, a informação técnica se perde na tradução para o vocabulário do domínio.

:::quiz T-10-03 | 2 | erros
P: Por que a cláusula `raise GatewayIndisponivel(...) from erro` é preferível a `raise GatewayIndisponivel(...)` sem `from`?
A) Porque o `from` torna a exceção mais rápida.
*B) Porque preserva a causa original (`__cause__`), que é indispensável para o diagnóstico, sem perder o vocabulário do domínio.
C) Porque o `from` impede que a exceção seja capturada.
D) Porque o `from` é obrigatório em todas as exceções Python.
X: O encadeamento preserva a exceção técnica original como causa. A exceção de domínio explica o contexto, e a causa explica o motivo técnico.
:::

:::quiz T-10-04 | 2 | erros
P: O que há de errado com `except: pass` em um bloco que chama um serviço externo?
A) Nada, desde que o serviço seja confiável.
*B) O erro desaparece sem registro, o chamador não sabe da falha e o problema reaparece longe da causa.
C) A cláusula `except` é obsoleta na linguagem.
D) Ele impede o uso de `try`.
X: Engolir uma exceção converte uma falha conhecida em um estado silenciosamente incorreto. O custo aparece depois, quando o dado já está inconsistente.
:::

## 4. Validação na borda {fa-filter}

Entrada de dados é sempre suspeita: campos vazios, tipos errados, valores fora da faixa, JSON malformado. A validação deve acontecer na **borda** do sistema e verificar a **forma** dos dados. A **regra de negócio** (há estoque suficiente?) pertence ao núcleo, como visto na Aula 6. A separação importa porque cada tipo de validação responde a uma pergunta diferente, e misturá-las torna o código lento, difícil de testar e sujeito a inconsistências.

Uma boa validação de borda coleta **todos** os erros de uma vez, em vez de parar no primeiro. Isso reduz o número de idas e vindas entre cliente e servidor e informa a quem preenche o formulário, de uma só vez, tudo o que precisa corrigir. O exemplo mostra essa forma de validação.

:::run 10/02-validacao-borda.py

:::anim
canvas: cvValidacao
ctl: ctlValidacao
cap: capValidacao
desenha: desenhaValidacao
gera: geraValidacao
velocidade: 2600
opcoes: valido=Requisição válida;invalido=Requisição inválida
:::

:::quiz T-10-05 | 2 | validação
P: Uma regra diz que a quantidade pedida deve ser inteira e maior que zero, e que há estoque suficiente. Em que camadas cada parte deve ser verificada?
A) Ambas na interface gráfica, porque é ali que o usuário digita.
*B) A forma (inteiro, maior que zero) na borda; o estoque na regra de negócio do núcleo.
C) Ambas no banco de dados, por meio de restrições.
D) Ambas no log, para análise posterior.
X: A forma é uma propriedade dos dados de entrada; o estoque depende do estado do sistema. Separar as camadas torna a validação de forma reutilizável e a regra testável sem interface.
:::

## 5. Logs estruturados {fa-receipt}

Um log é um registro do que o sistema fez e do que aconteceu com ele. Um bom log responde, sem reproduzir o problema, a pergunta "o que aconteceu com esta requisição?". Três cuidados fazem diferença. O **nível** deve ter significado: `DEBUG` para investigação, `INFO` para eventos normais relevantes, `WARNING` para situações anormais contornadas, `ERROR` para falhas que exigem atenção. O **contexto** deve incluir identificadores da requisição ou do pedido, sem dados pessoais. E os **dados sensíveis** nunca devem aparecer em texto puro.

Logs estruturados, com pares chave-valor, são mais fáceis de pesquisar e agregar do que frases livres. Em vez de "pedido 42 cobrado", registre `evento=cobranca_ok pedido_id=42`. A OWASP mantém recomendações específicas sobre o que não registrar (OWASP, Logging Cheat Sheet). O programa a seguir produz logs estruturados e mascara campos sensíveis antes de qualquer registro.

:::run 10/03-logs-estruturados.py

Repare que o número do cartão e o token aparecem como `***`. A proteção ocorre antes do registro, na função `mascara`, e não depende da disciplina de quem lê os logs depois.

:::quiz T-10-06 | 2 | logs
P: Um log registra o número completo do cartão de crédito de um cliente para facilitar a investigação de cobranças. Qual é o problema principal?
A) O log ocupa muito espaço em disco.
*B) Dados sensíveis passam a existir em texto puro em um lugar com acesso amplo e retenção longa, o que cria risco de vazamento.
C) O log não aceita números.
D) A investigação fica mais lenta por causa do tamanho do registro.
X: O risco é a exposição de dado sensível em um repositório que costuma ter acesso ampliado. A investigação não depende do número completo; um identificador de transação basta.
:::

:::exercicio T-10-E1 | 2 | nomes e funções
Reescreva a função abaixo com nomes que revelem a intenção e divida as responsabilidades em funções coesas. Explique a sua escolha.

```python
def p(l, t):
    s = 0
    for x in l:
        if x[2] == 1:
            s = s + x[1] * x[0]
    if t == 1:
        s = s * 0.9
    return s
```
:::gabarito
A função original é ambígua porque os nomes dos campos não existem. A primeira etapa é inferir o significado de cada posição: suponha que `x[0]` seja a quantidade, `x[1]` o preço unitário e `x[2]` um indicador de item ativo, e que `t == 1` signifique cliente com desconto. Uma versão legível separa as responsabilidades:

```python
DESCONTO_CLIENTE = 0.10

def total_itens_ativos(itens):
    return sum(quantidade * preco for quantidade, preco, ativo in itens if ativo)

def aplica_desconto(valor, percentual):
    return valor * (1 - percentual)

def total_pedido(itens, cliente_com_desconto):
    total = total_itens_ativos(itens)
    if cliente_com_desconto:
        total = aplica_desconto(total, DESCONTO_CLIENTE)
    return total
```

O ganho é que cada função tem uma responsabilidade, um nome que diz o que faz e pode ser testada isoladamente. A constante `DESCONTO_CLIENTE` substitui o número `0.9` (que equivale a 10% de desconto, em forma invertida), e o nome obriga o leitor a entender a regra. Uma resposta forte também registra que a inferência dos campos deve ser confirmada com quem escreveu o código, antes de qualquer refatoração.

:::exercicio T-10-E2 | 3 | erros e logs
Um serviço de envio de e-mails captura todas as exceções, registra "erro ao enviar" sem detalhes e segue em frente. Liste os problemas dessa prática e proponha uma versão que trate erros transitórios, falhas permanentes e registre o diagnóstico sem expor dados pessoais.
:::gabarito
Problemas: (1) a captura genérica esconde erros de programação (um nome de variável errado vira "erro ao enviar"); (2) a mensagem sem detalhes impede o diagnóstico; (3) não há distinção entre falha transitória (servidor momentaneamente fora, que deve ser retentada) e permanente (endereço inválido, que não deve ser retentada); (4) a ausência de identificadores impede correlacionar o log ao pedido. Proposta: capturar a exceção de rede do cliente de e-mail como transitória, com retentativa com backoff (Aula 7); capturar a exceção de endereço inválido como permanente, marcando o registro para correção; deixar exceções de programação subirem sem captura. O log registra evento, identificador do pedido, tipo de falha e tentativa, sem o endereço completo do destinatário, que é dado pessoal, e sim um identificador ou um mascaramento parcial.
:::

## 6. Configuração fora do código {fa-sliders}

Um sistema que roda em mais de um ambiente (desenvolvimento, homologação, produção) precisa de valores diferentes para endereços de banco, chaves de API e limites. Esses valores não devem estar no código. Wiggins (2011), na metodologia *The Twelve-Factor App*, recomenda guardar a configuração em variáveis de ambiente, e isso permanece a abordagem mais simples e portátil. Segredos, como senhas e chaves, nunca são versionados: vêm de um cofre da plataforma ou de variáveis injetadas em tempo de execução. Valores padrão devem ser seguros, e a ausência de uma configuração obrigatória deve gerar falha clara, e não um valor de produção escondido no código.

## 7. Mercado de trabalho {fa-briefcase}

Na indústria, a qualidade do código é cobrada em revisões (Aula 9), em análise estática e em padrões internos das equipes. Os livros clássicos da área, como *Clean Code* e *The Pragmatic Programmer*, são usados em treinamentos de contratação e em programas de integração de novos desenvolvedores. A competência valorizada em entrevistas é a capacidade de explicar por que um nome, uma função ou um tratamento de erro foi escolhido, e não apenas de apresentar uma solução que funciona.

## 8. Erros comuns {fa-triangle-exclamation}

- **`except` genérico.** Erros de programação e falhas esperadas se misturam, e nenhum é tratado com precisão.
- **Mensagem sem contexto.** "Erro ao processar" não diz o que, para qual pedido, nem por quê.
- **`None` como sinal de falha.** O chamador esquece de verificar, e o valor vazio aparece muito depois.
- **Segredo no código.** Senhas e chaves em código-fonte são vazadas por quem tem acesso ao repositório.
- **Log com dado pessoal.** Registros de objetos inteiros expõem informações que deveriam estar protegidas.

## Resumo da aula {fa-square-check}

- Nomes devem revelar intenção; comentários devem explicar o porquê.
- Funções devem ter uma responsabilidade, o que se verifica com a descrição sem a palavra "e".
- Erros devem ser específicos, com causa preservada (`from`), sem serem engolidos.
- A validação de forma fica na borda e coleta todos os erros; a regra de negócio fica no núcleo.
- Logs estruturados e com mascaramento de dados sensíveis são úteis para diagnóstico e seguros.

## Referências {fa-book}

**Acadêmicas e fundacionais**

- KERNIGHAN, B. W.; PIKE, R. *The Practice of Programming*. Reading: Addison-Wesley, 1999.
- MARTIN, R. C. *Clean Code: A Handbook of Agile Software Craftsmanship*. Upper Saddle River: Prentice Hall, 2008.
- OUSTERHOUT, J. *A Philosophy of Software Design*. Palo Alto: Yaknyam Press, 2018.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.

**Prática e mercado**

- HUNT, A.; THOMAS, D. *The Pragmatic Programmer*. 20. aniversário ed. Boston: Addison-Wesley, 2019.
- OWASP. *Logging Cheat Sheet*. [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- PYTHON SOFTWARE FOUNDATION. *Logging HOWTO*. [docs.python.org/3/howto/logging.html](https://docs.python.org/3/howto/logging.html)
- PYTHON SOFTWARE FOUNDATION. *Exceções: a cláusula raise*. [docs.python.org/3/tutorial/errors.html](https://docs.python.org/3/tutorial/errors.html)
- WIGGINS, A. *The Twelve-Factor App*. 2011. [12factor.net](https://12factor.net/)
