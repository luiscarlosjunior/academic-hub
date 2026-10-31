# Aula: Sistemas multiagentes

*Roteiro falado. Trechos entre colchetes são instruções de tela ou de tempo. Página: [10-sistemas-multiagentes.html](../topicos/10-sistemas-multiagentes.html) · Laboratório: [multiagentes-visual.html](../../../simuladores/multiagentes-visual.html)*

---

## Abertura (3 min)

Até agora a gente falou de um agente só: ele percebe o ambiente, decide e age. Hoje a pergunta muda. E se houver vários agentes, cada um com objetivos próprios, vendo só uma parte do mundo, e ninguém estiver no comando?

Isso é um **sistema multiagente**, ou SMA. Não existe controlador central. O resultado global aparece da interação entre os agentes. E o detalhe importante para quem projeta: a gente não programa o resultado. Programa os indivíduos e as regras de interação.

Quando isso faz sentido? Quando o problema já é distribuído, como trânsito, logística, mercado de energia. Quando um ponto central seria frágil. Ou quando cada parte pertence a uma pessoa ou empresa diferente.

[Mostre os quatro cards de propriedades]

Todo agente, em geral, tem quatro propriedades: **autonomia**, opera sem intervenção direta; **reatividade**, responde ao ambiente a tempo; **proatividade**, age para atingir objetivos, sem só reagir; e **habilidade social**, conversa com outros agentes numa linguagem comum.

Pergunta para a turma: um termostato é um agente? Pensem nas quatro propriedades antes de responder. A resposta mais honesta é que ele é reativo e autônomo, mas não tem habilidade social.

---

## Bloco 1: comportamento emergente (8 min)

Craig Reynolds mostrou em 1987 que um bando de pássaros pode ser reproduzido com três regras locais. Cada pássaro só olha os vizinhos próximos e aplica:

- **Separação:** não colidir com quem está muito perto.
- **Alinhamento:** voar na direção média dos vizinhos.
- **Coesão:** aproximar-se do centro do grupo.

Nenhum pássaro tem a variável "formação do bando". O bando é uma propriedade do todo que nenhuma parte tem. Isso é emergência.

Pensem no trânsito. Nenhum motorista decide criar um engarrafamento. Ele surge da soma de decisões locais. E isso tem um lado ruim: a emergência também produz congestionamentos e oscilações que ninguém projetou.

[Abra o laboratório, aba Enxame]

Vamos ver o efeito de cada regra. Zere a separação: os agentes colapsam num ponto. Zere o alinhamento: viram uma nuvem sem direção. Zere a coesão: o bando se dissolve. Nenhuma regra sozinha faz um bando. As três juntas fazem.

Agora clique na área para colocar um predador. Veja o bando se dividir e se reagrupar. Ninguém mandou o bando fazer isso.

---

## Bloco 2: BDI, crenças, desejos e intenções (7 min)

Como modelar um agente que decide? A arquitetura BDI usa três conceitos.

**Crenças** são o que o agente acredita sobre o mundo. Exemplo: "tenho doze peças A em estoque". Atenção: crença é informação, não verdade. Pode estar desatualizada.

**Desejos** são estados que o agente gostaria de alcançar. Exemplo: "manter estoque de pelo menos vinte peças". Desejos podem ser muitos e até conflitantes.

**Intenções** são os desejos que o agente escolheu perseguir e com os quais se comprometeu. Exemplo: "executar o plano de comprar dez peças A".

Por que a intenção importa? Porque é um compromisso. Sem ele, o agente replaneja a cada mudança pequena e fica indeciso. Com compromisso demais, ele insiste num plano que já não faz sentido. Calibrar essa persistência é o problema central do BDI.

[Mostre o pseudocódigo no fim da seção "No dia a dia"]

Esse ciclo resume tudo: percebe, atualiza crenças, gera opções, escolhe uma intenção, executa um passo, e só replaneja se a crença mudou de forma que o plano deixou de fazer sentido.

---

## Bloco 3: como agentes dividem trabalho, Contract Net (10 min)

Agora a pergunta prática: se um pedido chega e há vários agentes capazes, quem faz? Uma resposta clássica é o leilão. O **Contract Net Protocol**, de Smith, em 1980, organiza isso em quatro fases.

1. **Anúncio.** O gerente divulga a tarefa para quem pode executar.
2. **Propostas.** Cada agente responde com um custo, ou recusa.
3. **Adjudicação.** O gerente escolhe a melhor proposta e avisa todos.
4. **Execução.** O escolhido faz a tarefa e devolve o resultado.

Reparem numa coisa: nenhum agente precisa conhecer a capacidade de todos os outros antes. A informação para decidir aparece na própria negociação.

[Mostre a seção Contract Net, clique em Passo quatro vezes e leia o log em voz alta]

Vamos a um exemplo concreto. Três robôs de resgate recebem um pedido de ajuda. O Robô A oferece custo 8, o Robô B oferece 5 e o Robô C oferece 11. O gerente escolhe B, que tem o menor custo. Os outros recebem recusa. Se B falhar, a tarefa é anunciada de novo.

Esse protocolo tem um custo, que é a comunicação. Com muitos agentes, anunciar para todos a cada tarefa pode saturar a rede. Na prática, anuncia-se só para quem pode atender.

Existem outras formas de coordenar: o quadro-negro, onde os agentes publicam resultados parciais; a estigmergia, que é comunicar pelo ambiente, como as formigas fazem com feromônio; e organizações com papéis e normas.

---

## Bloco 4: projetar um sistema multiagente (4 min)

Projetar um SMA é decidir cinco coisas, nesta ordem.

1. Quem faz o quê. Papéis sobrepostos geram disputa. Papéis vazios geram tarefa esquecida.
2. O que cada agente sabe. Isso define a quantidade de comunicação.
3. Qual protocolo usar: leilão, negociação, votação ou mural compartilhado.
4. Qual regra de desempate. Se dois agentes querem o mesmo recurso, quem ganha? Sem regra, o sistema trava.
5. Simular antes de implantar, com falhas e atrasos. Comportamento emergente só aparece assim.

E um conselho de quem já depurou sistema assim: registre as mensagens trocadas. Sem esse histórico, entender um comportamento coletivo estranho é praticamente impossível.

---

## Bloco 5: o código em Python (15 min)

Agora o código. Este programa distribui quatro tarefas entre quatro robôs. Vou ler com vocês linha por linha.

```python
# Contract Net: gerente anuncia tarefas, robôs enviam lances, menor lance ganha.
robos = {"R1": (0, 0), "R2": (9, 0), "R3": (0, 7), "R4": (9, 7)}
tarefas = [(2, 3), (8, 6), (5, 1), (1, 5)]
carga = {r: [] for r in robos}

def distancia(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

for t in tarefas:
    lances = {r: distancia(pos, t) + 1.5 * len(carga[r]) for r, pos in robos.items()}
    vencedor = min(lances, key=lances.get)
    carga[vencedor].append(t)
    print(f"tarefa {t}: " + ", ".join(f"{r}={lances[r]:.1f}" for r in robos) + f" -> {vencedor}")

total = sum(distancia(robos[r], t) for r, ts in carga.items() for t in ts)
print("distancia total ate as tarefas:", total)
for r, ts in carga.items():
    print(r, ts)
```

Vamos por partes. `robos` guarda a posição de cada robô num plano. `tarefas` é a lista de onde há trabalho. `carga` guarda, para cada robô, as tarefas que ele já aceitou; começa vazia.

A função `distancia` calcula a distância de Manhattan: soma as diferenças em x e em y. É a distância que um robô percorre numa grade, sem diagonais.

O laço `for` é o leilão. Cada tarefa é um anúncio. Para cada robô, o `lance` é a distância até a tarefa, mais 1,5 por tarefa que ele já tem. Esse termo de carga existe para não jogar todo o trabalho num robô só. A linha `min` escolhe o menor lance: é a regra de adjudicação. E o `append` registra que o vencedor agora tem mais uma tarefa, o que muda os lances das próximas rodadas.

O `print` mostra o leilão inteiro. Os alunos conseguem conferir cada conta.

No fim, `total` soma as distâncias que os robôs percorrem. É uma medida do custo global.

[Mostre a saída]

```
tarefa (2, 3): R1=5.0, R2=10.0, R3=6.0, R4=11.0 -> R1
tarefa (8, 6): R1=15.5, R2=7.0, R3=9.0, R4=2.0 -> R4
tarefa (5, 1): R1=7.5, R2=5.0, R3=11.0, R4=11.5 -> R2
tarefa (1, 5): R1=7.5, R2=14.5, R3=3.0, R4=11.5 -> R3
distancia total ate as tarefas: 15
R1 [(2, 3)]
R2 [(5, 1)]
R3 [(1, 5)]
R4 [(8, 6)]
```

Leiam a primeira linha comigo. R1 está em (0, 0) e a tarefa em (2, 3), então a distância é 2 + 3 = 5. R2 está em (9, 0): 7 + 3 = 10. R1 vence. Agora a segunda linha: R1 já tem uma tarefa, então paga 1,5 a mais, e R4 vence com lance 2, por estar perto de (8, 6).

Uma observação honesta: neste exemplo, o termo de carga não muda o resultado. Eu rodei sem ele e a atribuição final é a mesma. Então não vou dizer que ele "evita" o acúmulo aqui. O que ele faz é impedir o acúmulo quando um robô está mais perto de tudo. Quer ver? Façam a experiência: troquem o 1,5 por 0 e rodem de novo. Se a saída não mudar, mudem a posição de uma tarefa e tentem outra vez.

[Atividade de 3 min: os alunos rodam o código e trocam o 1,5 por 0]

Se quiserem levar para casa: salvem como `contract_net.py`, rodem com `python3 contract_net.py` e acrescentem uma quinta tarefa, por exemplo (9, 4). Quem a pega?

---

## Bloco 6: as três regras em números (8 min)

Vamos fazer a conta de um pássaro, à mão.

O pássaro **b** está em (0, 0), voando para a direita, com velocidade (1, 0). Tem dois vizinhos. O vizinho **o1** está em (4, 0), com velocidade (2, 0). O vizinho **o2** está em (0, 30), com velocidade (1, 1). O raio de percepção é 70, e o de separação é 22.

Separação: só o1 está dentro de 22. O vetor aponta para longe dele, então é (−1, 0). O o2 está a 30, não entra.

Alinhamento: a velocidade média dos vizinhos é (1,5; 0,5). Subtraindo a velocidade de b, sobra (0,5; 0,5).

Coesão: o centro dos vizinhos é (2; 15). O vetor até lá é (2; 15).

Agora os pesos: 1 para separação, 1 para alinhamento e 0,1 para coesão. Somando: (−1; 0) + (0,5; 0,5) + (0,2; 1,5) = (−0,3; 2,0).

Olhem o resultado. O pássaro desvia de o1, acompanha a direção do grupo e se aproxima do centro. E tudo isso só com informação local. Nenhuma das três regras conhece o bando inteiro.

Uma nota sobre os pesos: aqui a coesão pesa pouco. No laboratório os pesos são ajustáveis, e a forma do bando muda conforme eles mudam.

---

## Bloco 7: cooperar ou trair, o dilema do prisioneiro (12 min)

Dois suspeitos são interrogados separadamente. Cada um pode cooperar com o outro, ficando calado, ou trair. A matriz de pontos é esta:

| | Outro coopera | Outro trai |
|---|---|---|
| Eu coopero | 3 | 0 |
| Eu traio | 5 | 1 |

Olhem a primeira coluna: se o outro coopera, trair rende 5 e cooperar rende 3. Olhem a segunda: se o outro trai, trair rende 1 e cooperar rende 0. Em qualquer caso, trair é melhor para mim. Só que, se os dois traem, os dois ganham 1. Se os dois cooperam, ganham 3. Essa é a tensão do dilema: o que é racional para cada um leva ao pior resultado para os dois.

Pergunta para a turma: numa rodada só, qual jogada vocês fariam?

Agora o jogo se repete. Robert Axelrod, em 1984, convidou pesquisadores a mandar estratégias para um torneio. A mais simples, tit-for-tat, coopera na primeira rodada e depois repete o último movimento do adversário. Ficou entre as melhores.

[Abra o laboratório, aba Dilema, rode o torneio com 100 rodadas]

Olhem a tabela. Repare nas posições de "Sempre trai" e de "Gatilho". Os números mudam a cada execução por causa da estratégia "Aleatório", então não decorem valores. O que importa é a ordem e o motivo dela.

Não é verdade que sempre trair vence. Ele ganha de cada parceiro, sim, mas perde a chance de cooperar com quem coopera de volta. E o resultado depende de quem está no torneio. Numa população só de traidores, trair seria a melhor escolha.

[Mostre o botão Simular 120 gerações]

O experimento decisivo é o evolutivo. Aqui, cada estratégia ocupa uma fatia da população, e essa fatia cresce conforme o desempenho contra a população atual. Observem o gráfico. "Sempre trai" cresce explorando cooperadores ingênuos. Depois murcha, porque sobram só outros traidores para enfrentar. As estratégias que retaliam e perdoam sobrevivem.

---

## Bloco 8: onde isso aparece (5 min)

Sistemas multiagentes estão em setores bem reais. A tabela da página lista cada um com a referência.

Em logística, robôs de armazém buscam e levam prateleiras sem controlador central: Wurman, D'Andrea e Mountz, 2008. Em leilões, de frequências de rádio e de rotas de transporte: Milgrom, 2004. Em robótica, o desafio RoboCup, com equipes de robôs que jogam futebol: Kitano e colaboradores, 1997. Em simulação social, modelos de epidemias, mercados e migração: Epstein e Axtell, 1996. E, mais recente, sistemas com modelos de linguagem em que vários agentes dividem uma tarefa, como planejar, programar e revisar código: Wu e colaboradores, 2023, o AutoGen.

Para quem está procurando emprego: a pergunta de entrevista costuma ser o trade-off entre coordenação centralizada e distribuída. A centralizada, com um gerente que decide tudo, é simples e frágil. A distribuída, com agentes que negociam, é robusta e mais difícil de depurar. Saber explicar essa troca vale mais do que decorar o protocolo.

---

## Laboratório (10 min)

Agora vocês. O laboratório tem três abas.

Na aba **Leilão**, criem três tarefas e leiam os lances. Comparem a distância total com a de uma atribuição aleatória.

Na aba **Enxame**, ajustem os pesos até o bando se formar. Depois coloquem um predador.

Na aba **Dilema**, rodem o torneio, mudem o número de rodadas e comparem.

Quem terminar primeiro pode tentar uma pergunta: o que muda se "Sempre trai" entrar sozinho contra "Sempre coopera"?

---

## Fechamento e quiz (5 min)

Três perguntas, para fixar.

**Primeira:** "comportamento emergente" significa o quê? A resposta é que o padrão global surge das interações locais, sem estar codificado em nenhum agente.

**Segunda:** no Contract Net, como o gerente escolhe o executor? Pelas propostas recebidas, que revelam custo e disponibilidade.

**Terceira:** por que o olho por olho vai bem num torneio repetido? Porque é gentil, retalia, perdoa e é previsível, o que permite cooperação estável.

Para fechar: um sistema multiagente não é um agente grande. É um conjunto de decisões locais com interações simples, que produzem um resultado coletivo. Para projetar, vocês definem papéis, protocolos e regras de desempate, e simulam antes de colocar em uso.

---

*Antes de usar: a página 10 ainda tem trechos que este roteiro corrige (o exemplo do termo de carga, os números da tabela do torneio, o placar inline do dilema e o ano de Reynolds, que é 1987). Vale corrigir a página antes da aula.*
