title: Testes automatizados na prática: TDD, vermelho, verde e refatorar, e dublês de teste
desc: Aula de testes automatizados como especificação executável: o ciclo do TDD com exemplos executados (fase vermelha, verde e refatoração), dublês de teste (stub, fake, mock) e os erros típicos de quem começa, com animação e testes mapeados.
icon: fa-flask-vial
favicon: 🏭
topic: es/11-tdd-testes-automatizados
---

## Visão geral {fa-eye}

Esta é a **Aula 11**. Um teste automatizado é código que verifica outro código e roda sozinho a cada mudança. Na faculdade, muitos projetos são testados manualmente, uma vez, na hora da apresentação. Na indústria, o teste manual não acompanha o ritmo de mudança: o que não é automático é ignorado, ou feito tarde demais para ser barato.

Esta aula trata os testes como ferramenta de trabalho e apresenta o **desenvolvimento orientado a testes** (TDD), um ciclo curto que muda a forma de projetar o código. Ao final você deverá ser capaz de:

- escrever testes que documentam o comportamento esperado, usando `unittest` da biblioteca padrão;
- executar o ciclo vermelho, verde e refatorar, e reconhecer cada fase na saída do programa;
- distinguir stub, fake e mock, e escolher o dublê adequado a cada situação;
- reconhecer os erros típicos de quem começa com testes e corrigi-los.

> [!info] Pré-requisitos
> Aulas 3 (testes) e 4 (refatoração). Os exemplos usam `unittest` e `unittest.mock`, da biblioteca padrão.

> [!tip] Como estudar
> Faça o ciclo com um exercício pequeno e puro, como cálculo de média, cinco vezes seguidas. Quando o ciclo ficar automático, aplique-o a uma regra real. A disciplina de não escrever código além do que o teste exige é a parte mais difícil.

:::mapa

## 1. O teste como especificação executável {fa-file-circle-check}

Um bom teste é a documentação mais precisa que existe, porque não pode ficar desatualizado sem que a suíte falhe. Quando um teste se chama `test_media_7_ou_mais_e_aprovado`, ele diz uma regra de negócio que qualquer pessoa lê e que o computador verifica a cada commit.

A pergunta para escrever um teste não é "como testar esta função?", e sim "qual comportamento eu quero garantir?". Testes escritos a partir da implementação repetem o código de forma indireta. Testes escritos a partir do comportamento sobrevivem à refatoração e expressam a intenção do sistema. A estrutura **arranjar, agir, verificar** (*arrange, act, assert*) organiza o teste em três blocos legíveis.

:::quiz T-11-01 | 1 | especificação
P: Por que um teste bem escrito funciona como documentação mais confiável que um comentário?
A) Porque é mais longo que o comentário.
*B) Porque, se a regra mudar sem que o teste seja atualizado, a suíte falha e a divergência aparece.
C) Porque é escrito em linguagem natural.
D) Porque substitui a necessidade de código.
X: A documentação executável se mantém verdadeira porque é verificada a cada execução. Um comentário pode ficar desatualizado sem que ninguém perceba.
:::

## 2. O ciclo do TDD {fa-arrows-rotate}

Beck (2002) popularizou o desenvolvimento orientado a testes em torno de um ciclo de três passos, repetido em minutos:

1. **Vermelho**: escreva um teste para um comportamento que ainda não existe e veja-o falhar. A falha prova que o teste verifica algo. Um teste que nunca falhou não provou nada.
2. **Verde**: escreva o código **mínimo** que faz o teste passar. "Mínimo" é a palavra importante: se a implementação parece óbvia demais, o teste ainda é pequeno demais, e um novo caso deve ser adicionado.
3. **Refatorar**: melhore o código e os testes mantendo tudo verde. Nomes, duplicação e estrutura são limpos com a segurança de que o comportamento está protegido.

O TDD muda a forma de projetar: como o código precisa ser testável antes de existir, as dependências ficam explícitas, as funções ficam pequenas e as interfaces ficam claras. Freeman e Pryce (2009) mostram como essa disciplina conduz o design de sistemas orientados a objetos. Estudos empíricos de TDD, como George e Williams (2004) e Nagappan et al. (2008), relatam benefícios em qualidade de código com custos variáveis de tempo, e os resultados dependem muito do contexto e da experiência da equipe.

:::quiz T-11-02 | 1 | TDD
P: Qual é a função principal da fase vermelha no ciclo do TDD?
A) Escrever o código final da funcionalidade.
*B) Provar que o teste verifica um comportamento ainda inexistente, por meio da falha.
C) Remover testes antigos que não passam mais.
D) Medir a cobertura de código.
X: O vermelho é a evidência de que o teste está ligado a um comportamento que ainda não existe. Um teste que passa sem código novo pode estar verificando algo errado, ou nada.
:::

## 3. Exemplo: a regra de situação do aluno {fa-code}

Vamos construir, em pequenos passos, a regra de situação de um aluno: média igual ou superior a 7,0 é aprovado; de 4,0 a 6,99 vai para recuperação; abaixo de 4,0 é reprovado. A média é ponderada pelos pesos das avaliações.

### 3.1 Fase vermelha

Antes de qualquer implementação, o teste é escrito e executado contra um esqueleto que ainda não tem a regra. O programa a seguir faz exatamente isso.

:::run 11/03-vermelho.py

A saída mostra o ciclo no seu primeiro passo. Os testes não passam. Repare que o `unittest` relata `ERROR` (e não `FAIL`) porque a exceção `NotImplementedError` é lançada dentro do código, antes de qualquer asserção. Em ambos os casos o resultado é o esperado no vermelho: o comportamento ainda não existe e o teste percebe isso. Um teste mais maduro falharia por asserção, com `FAIL`, quando o código existe mas retorna o valor errado.

### 3.2 Fase verde e refatoração

O programa a seguir apresenta o estado final após os ciclos: a média ponderada, a regra de situação com valores-limite e os testes, todos passando. Em um fluxo real, cada função teria sido escrita após o teste correspondente falhar.

:::run 11/01-tdd-situacao-aluno.py

Note três detalhes. O teste de média ponderada verifica um caso com pesos diferentes, e não um caso trivial de pesos iguais, porque o caso trivial aceitaria uma média simples. O teste de situação verifica os valores exatamente nos limites (7,0, 6,99, 4,0 e 3,99), que são onde os defeitos se escondem. E há um teste para o caso de peso zero, que a implementação trata com uma exceção de domínio clara, em vez de uma divisão por zero.

:::anim
canvas: cvTDD
ctl: ctlTDD
cap: capTDD
desenha: desenhaTDD
gera: geraTDD
velocidade: 3000
:::

:::quiz T-11-03 | 2 | verde
P: Ao escrever o código mínimo para passar no teste `situacao(7.0) == "aprovado"`, uma implementação que apenas retorna `"aprovado"` para qualquer entrada é aceitável no passo verde?
A) Não, porque nunca é aceitável retornar um valor fixo.
*B) Sim, como primeiro passo, desde que um novo teste com outra entrada force a generalização no ciclo seguinte.
C) Sim, e a suíte está completa.
D) Não, porque o teste deve usar mock.
X: O TDD usa a própria suíte para forçar a generalização: um teste com outro valor (como 3,0, que deve ser reprovado) exige que a implementação deixe de ser um valor fixo. O código final nasce dessa sequência de testes.
:::

## 4. Dublês de teste {fa-masks-theater}

Quando a unidade depende de algo lento, externo ou não determinístico (um e-mail, um relógio, uma API de pagamento), usamos um **dublê** no lugar da dependência real. Meszaros (2007) organizou os tipos de dublê, e três são os mais úteis:

- **Stub**: devolve respostas fixas. Controla a entrada da unidade testada.
- **Fake**: tem uma implementação simplificada, mas funcional, como um repositório em memória. Serve quando o teste precisa de comportamento real, como gravar e depois ler.
- **Mock**: verifica interações, isto é, se um método foi chamado com certos argumentos. Serve quando o efeito colateral é o que importa.

Fowler (2007), em *Mocks Aren't Stubs*, distingue dois estilos de teste: o baseado em estado, que verifica o resultado, e o baseado em comportamento, que verifica as chamadas. Testes baseados em estado sobrevivem à refatoração; os baseados em comportamento quebram quando a forma interna muda, mesmo sem mudança de comportamento. O exemplo a seguir compara os dois estilos sobre o mesmo serviço.

:::run 11/02-duplos-teste.py

Os dois testes passam, mas se comportam de forma diferente diante de uma mudança. Se a implementação passar a enviar o e-mail em duas etapas (um aviso e depois a confirmação), o teste com fake continua verificando a caixa de saída, e o teste com mock quebra, porque a chamada única mudou. Quando a mudança preserva o comportamento observável, o teste de estado é o mais útil.

:::quiz T-11-04 | 2 | dublês
P: Qual dublê é mais adequado para verificar que um e-mail de confirmação chegou à caixa de saída, mantendo o teste robusto a mudanças internas?
A) Um stub que sempre devolve `True`.
*B) Um fake que guarda os e-mails enviados, e o teste verifica o conteúdo guardado.
C) Um mock que exige a sequência exata de chamadas internas.
D) Nenhum dublê, usando o servidor de e-mail real.
X: O fake verifica o efeito observável (a mensagem na caixa). O mock acoplado à sequência de chamadas quebra sempre que a forma interna muda, mesmo sem mudar o comportamento.
:::

:::quiz T-11-05 | 3 | dublês
P: Qual é a diferença essencial entre um stub e um mock?
A) O stub é mais rápido que o mock.
*B) O stub controla as entradas da unidade testada; o mock verifica as interações (chamadas) feitas pela unidade.
C) O mock nunca pode devolver valores.
D) O stub só pode ser usado com bancos de dados.
X: A distinção é de propósito: stubs fornecem dados, mocks registram e verificam chamadas. Ambos são úteis, mas o uso excessivo de mocks verifica a implementação, e não o comportamento.
:::

## 5. Erros comuns de quem começa {fa-triangle-exclamation}

- **Escrever o teste depois, só para cobrir o código.** O teste perde o papel de especificação e se torna um registro do que já foi feito.
- **Teste que nunca falhou.** Se o teste passou na primeira execução, verifique se ele pode falhar, quebrando o código de propósito.
- **Refatorar e quebrar vinte testes.** Os testes verificam a interna do código; prefira verificar o comportamento público.
- **Mock para tudo.** Simular a própria lógica faz o teste verificar a simulação.
- **Estado compartilhado entre testes.** Um teste que depende da ordem de execução é intermitente e enganoso.

:::exercicio T-11-E1 | 2 | TDD
Aplique o ciclo TDD à regra de frete: "pedidos com valor igual ou superior a R$ 200 têm frete grátis; abaixo disso o frete é R$ 15." Escreva, em ordem, o teste vermelho, a implementação verde e o teste que força a generalização. Indique o que você verificaria na fase de refatoração.
:::gabarito
Passo vermelho: `assertEqual(frete(200), 0)` (o valor-limite é o primeiro teste, porque é onde a regra se decide), contra um esqueleto que lança `NotImplementedError`. Passo verde: `def frete(valor): return 0 if valor >= 200 else 15`, o código mínimo que passa nesse teste (também passa em `frete(150) == 15` se for escrito depois). Passo que força a generalização: `assertEqual(frete(150), 15)` e `assertEqual(frete(199.99), 15)`, que a implementação já atende, mas que documentam a regra e impedem regressões. Refatoração: nomear a constante `VALOR_FRETE_GRATIS = 200` e `TAXA_FRETE = 15`, e verificar que os testes continuam verdes, sem nenhuma mudança de comportamento. Um cuidado adicional é testar o valor exato 200,00, que é o limite inclusivo.
:::

:::exercicio T-11-E2 | 3 | dublês
Um módulo de faturamento chama um serviço externo de emissão de nota fiscal. Proponha uma estratégia de testes que cubra a regra de cálculo do imposto, o comportamento quando o serviço externo falha e a integração real com o serviço. Indique o tipo de dublê em cada caso e justifique.
:::gabarito
A regra de cálculo do imposto é lógica pura: testes de unidade sem dublês, com valores-limite. O comportamento em falha do serviço externo é controlado por um stub que lança a exceção de indisponibilidade, verificando que o módulo a traduz em erro de domínio e não corrompe o estado. Quando o efeito observável importa (a nota foi registrada), um fake que guarda as notas emitidas verifica o resultado sem depender da ordem das chamadas. A integração real com o serviço externo pertence a um pequeno conjunto de testes de integração, executado em ambiente de homologação, e não à suíte rápida de unidade. O princípio é que dublês controlam o que não podemos controlar, e a integração real é verificada em poucos pontos, que são caros de executar.
:::

## 6. Mercado de trabalho {fa-briefcase}

Na indústria, os testes automatizados são executados em pipeline (Aula 12) e em frameworks como JUnit, pytest, unittest e Jest. A prática de TDD é adotada por algumas equipes e é tema frequente de debate, com defensores que valorizam o design resultante e críticos que apontam custos em projetos com requisitos instáveis. A competência que se espera de um candidato é a capacidade de escrever testes que documentam a regra, de escolher dublês com critério e de explicar as trocas entre rapidez, fidelidade e manutenção da suíte.

## 7. Resumo da aula {fa-square-check}

- Um teste automatizado é especificação executável, verificada a cada mudança.
- O ciclo do TDD é vermelho (provar que o teste falha), verde (código mínimo) e refatorar (limpar com verde).
- A generalização nasce de novos casos de teste, não de palpites.
- Stub controla entradas, fake simula comportamento real, mock verifica interações; prefira verificar estado.
- Dublês controlam o que não podemos controlar; a integração real é verificada em poucos pontos.

## Referências {fa-book}

**Acadêmicas e fundacionais**

- BECK, K. *Test-Driven Development: By Example*. Boston: Addison-Wesley, 2002.
- FREEMAN, S.; PRYCE, N. *Growing Object-Oriented Software, Guided by Tests*. Boston: Addison-Wesley, 2009.
- GEORGE, B.; WILLIAMS, L. A structured experiment of test-driven development. *IEEE Software*, v. 21, n. 5, p. 40–50, 2004.
- MESZAROS, G. *xUnit Test Patterns: Refactoring Test Code*. Upper Saddle River: Addison-Wesley, 2007.
- NAGAPPAN, N. et al. Realizing quality improvement through test driven development: results and experiences of four industrial teams. *Empirical Software Engineering*, v. 13, p. 289–302, 2008.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.

**Prática e mercado**

- FOWLER, M. *Mocks Aren't Stubs*. martinfowler.com, 2007. [martinfowler.com/articles/mocksArentStubs.html](https://martinfowler.com/articles/mocksArentStubs.html)
- MARTIN, R. C. *Clean Code*. Upper Saddle River: Prentice Hall, 2008.
- PYTHON SOFTWARE FOUNDATION. *unittest.mock — mock object library*. [docs.python.org/3/library/unittest.mock.html](https://docs.python.org/3/library/unittest.mock.html)
- PYTHON SOFTWARE FOUNDATION. *unittest — Unit testing framework*. [docs.python.org/3/library/unittest.html](https://docs.python.org/3/library/unittest.html)
- PYTEST. *Documentação oficial*. [docs.pytest.org](https://docs.pytest.org/)
