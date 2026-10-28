# Roteiro de aula — Do Diagrama ao Código (Java)

Roteiro de fala, slide a slide, para a [apresentação](15-do-diagrama-ao-codigo.html).
Cada slide tem: **o que fazer na tela**, **o que falar**, **a ponte para o próximo** e, quando vale, **se perguntarem**.
No fim estão o **glossário de conceitos** e as **perguntas difíceis**, para você não travar.

---

## Antes de começar

**Teclas:** `→` ou espaço avança · `←` volta · `I` abre o índice (para pular para qualquer slide) · `F` tela cheia.
O número do slide aparece na barra de baixo (são 44); os números deste roteiro são os mesmos.

**Deixe aberto em outra aba** (para a demonstração no fim, opcional):

```bash
cd disciplinas/modelagem-poo/exemplos/do-diagrama-ao-codigo
javac -encoding UTF-8 -d out $(find src -name "*.java") && java -cp out aula.Principal
```

**Tempo:** a aula completa leva cerca de **2h** (somando os tempos de cada slide, ~116 min). Se a sua aula tiver
1h40, deixe o exercício 5 (slide 35) como lição de casa.

| Bloco | Slides | Tempo |
|---|---|---|
| Abertura e ideia central | 1–4 | 8 min |
| Tradutor (8 construções) | 5–13 | 25 min |
| Tabela de correspondência | 14–15 | 5 min |
| Exemplo completo | 16–24 | 17 min |
| Aprofundamento | 25–30 | 17 min |
| Exercícios (5, dois com diagramas de streaming) | 31–35 | 27 min |
| Exemplo do hotel | 36–39 | 8 min |
| Quiz, referências e código | 40–44 | 9 min |

**Se o tempo apertar (versão de ~50 min):** pule 25–26 (repetem a tabela 14–15), passe rápido por 17–18 e 23,
faça só os exercícios 2 e 4 (slides 32 e 34), deixe o exercício 5 como lição de casa e 43–44 como leitura em casa.

**A frase-guia da aula** (volte a ela sempre que alguém se perder):
> “O diagrama não é um desenho bonito: cada símbolo diz exatamente que código escrever. O que o símbolo não diz sozinho,
> a multiplicidade e o ciclo de vida, vira decisão de projeto — e essa decisão tem que aparecer no código.”

---

## Slide 1 — Capa · ⏱ 1 min

**Na tela:** só a capa.

**Fala:**
“Hoje a gente fecha o ciclo da modelagem. Até aqui desenhamos diagramas de classes, de sequência, de estados.
Hoje a pergunta é: *e agora, o que eu escrevo no editor?* A boa notícia é que a maior parte dessa tradução é
mecânica — dá para fazer quase sem pensar, se você conhece a tabela de correspondência. A má notícia é que as partes
que *não* são mecânicas são justamente onde aparecem os bugs. Vamos ver as duas coisas.”

**Ponte:** “Primeiro, o mapa da aula.”

---

## Slide 2 — Roteiro · ⏱ 1 min

**Na tela:** os 13 blocos, com os mesmos ícones da página da aula no AcademicHub.

**Fala:**
“A gente começa pela ideia de tradução mecânica, passa por oito construções da UML uma a uma, olhando o código em Java
— e, para comparar, em C# e Python. Depois montamos uma tabela de consulta, traduzimos um modelo inteiro arquivo por
arquivo, aprofundamos em multiplicidade e nos casos difíceis, e terminamos com exercícios, um exemplo de hotel passo a
passo e um quiz.”

**Dica:** diga que os ícones são os mesmos da página da aula, para eles acharem cada parte depois no site.

---

## Slide 3 — Cada símbolo tem um equivalente exato · ⏱ 3 min

**Na tela:** o parágrafo e os quatro cartões (Caixa → class, Atributo → campo, Operação → método, Seta → extends/implements/atributo).

**Fala:**
“Olhem os quatro cartões. Caixa vira `class`. Atributo vira campo. Operação vira método. E a seta… depende da seta:
pode virar `extends`, `implements` ou um atributo. Essa é a tabela que vocês precisam saber *de cor*. Quem sabe essa
tabela olha um diagrama e já enxerga o código; quem não sabe vê só um desenho bonito.”

“Repare na seta: é o único símbolo que vira coisas diferentes. Uma seta de herança vira `extends`; uma seta tracejada de
interface vira `implements`; uma linha de associação vira um **campo** — uma referência para o outro objeto.”

**Se perguntarem — “e os getters e setters?”:** o diagrama normalmente não mostra; são decisão de implementação.
Só gere *setter* se o atributo puder mudar de fora; muita gente gera tudo por reflexo e quebra o encapsulamento.

**Ponte:** “Se tudo fosse mecânico, um gerador de código faria tudo. Não faz. Por quê?”

---

## Slide 4 — O que não é mecânico · ⏱ 3 min

**Na tela:** três cartões: multiplicidade, composição, bidirecionalidade.

**Fala:**
“Três coisas exigem decisão.

**Multiplicidade:** o diagrama diz `*`, mas não diz se é `List`, `Set` ou outra coisa. Diz `0..1`, mas não diz se eu
uso `null` ou `Optional`. Diz `1..*`, e alguém tem que garantir que a lista nunca fique vazia.

**Composição:** o losango preenchido diz que o todo é dono da parte. No código isso vira uma pergunta concreta:
*quem dá o `new`?* E quem pode ver e mexer na parte?

**Bidirecionalidade:** se A conhece B e B conhece A, toda vez que eu ligo um ao outro preciso atualizar os dois lados.
Esquecer um lado é bug clássico. Por isso a gente prefere associações de mão única sempre que possível.”

**Se perguntarem — “como é esse código de sincronização?”:**
```java
public void adicionar(Pedido p) {
    pedidos.add(p);
    p.setCliente(this);   // o outro lado precisa ser atualizado junto
}
```
E o problema: se alguém chamar `p.setCliente(outro)` direto, as duas pontas ficam inconsistentes.

**Ponte:** “Vamos ver isso símbolo por símbolo.”

---

## Slide 5 — Tradutor: escolha o símbolo, veja o código · ⏱ 1 min

**Na tela:** grade com as 8 construções. **Dá para clicar** em qualquer uma para pular direto para ela.

**Fala:**
“São oito construções. Em cada slide vocês vão ver o símbolo UML à esquerda, o código à direita e uma observação
embaixo. O código está em Java, mas eu tenho as abas C# e Python — vou trocar algumas vezes para vocês verem que a
*ideia* é a mesma em qualquer linguagem orientada a objetos; muda só a sintaxe.”

---

## Slide 6 — Classe simples · ⏱ 3 min

**Na tela:** caixa `Produto` com `− nome`, `− preco`, `+ aplicarDesconto(p)`. Código Java.
**Clique:** aba **Python** no final.

**Fala:**
“A caixa tem três compartimentos: nome, atributos, operações. O nome vira `public class Produto`. Cada atributo vira
um campo. O sinal na frente é a **visibilidade**: menos é `private`, mais é `public`, cerquilha é `protected`, til é
de pacote — em Java, isso é *não escrever nada*.”

“A operação `aplicarDesconto(p)` vira um método público. Repare que o diagrama não disse o tipo de `p` — no código eu
tive que decidir: `double`. O diagrama pode ser mais ou menos detalhado; o código não pode.”

*(Troque para Python.)* “Em Python não existe `private` de verdade. O duplo sublinhado `__nome` é uma convenção que
embaralha o nome, mas não impede o acesso. A intenção do diagrama é a mesma; a linguagem só garante menos.”

**Se perguntarem — “qual a diferença entre `protected` em Java e `#` na UML?”:** em Java, `protected` também libera
para todas as classes do mesmo pacote, não só para as subclasses. A UML não tem essa nuance.

---

## Slide 7 — Classe abstrata · ⏱ 3 min

**Na tela:** `Conta` em itálico, `Poupanca` embaixo, seta sólida com ponta triangular vazada.

**Fala:**
“Primeiro detalhe visual: o nome `Conta` está em **itálico**. Itálico na UML significa abstrato. No código, `abstract
class`. A classe abstrata não pode ser instanciada — não existe ‘uma conta’ genérica, existe poupança, corrente.”

“A operação `taxaMensal()` também é abstrata: cada filha decide. Já `depositar` é concreto — é igual para todas, então
fica na mãe.”

“A seta é **sólida** com ponta triangular **vazada**: generalização. Vira `extends`. A filha sobrescreve o método
abstrato, e o `@Override` pede para o compilador conferir que eu estou mesmo sobrescrevendo.”

“`saldo` tem cerquilha: `protected`. As filhas precisam enxergar.”

**Se perguntarem — “por que não interface?”:** porque `Conta` tem **estado** (`saldo`) e comportamento comum
(`depositar`). Interface é contrato sem estado. Veja o próximo slide.

**Se perguntarem — “e em C#?”:** troque a aba: `: Conta` no lugar de `extends`, e `override` é obrigatório.

---

## Slide 8 — Interface (realização) · ⏱ 3 min

**Na tela:** `«interface» Pagavel`, `Fatura` embaixo, linha **tracejada** com ponta vazada.

**Fala:**
“Compare com o slide anterior: a ponta é a mesma, mas a linha é **tracejada**. Isso é *realização*: a classe promete
cumprir um contrato. Vira `implements`.”

“A interface tem o estereótipo `«interface»` entre aspas angulares. Os métodos dela são implicitamente públicos e
abstratos — por isso no código não aparece `public` nem `abstract` dentro da interface.”

“Diferença importante: em Java uma classe só pode ter **uma** superclasse, mas pode implementar **várias** interfaces.”

*(Troque para Python.)* “Python nem precisa declarar: com `Protocol`, basta a classe ter o método — é o *duck typing*:
se anda como pato e grasna como pato…”

**Atenção (pergunta provável):** o código da aula usa `total` sem declarar o campo. É um trecho; no projeto do código
pronto eu acrescentei `private final double total` e um construtor.

---

## Slide 9 — Associação 1 → * · ⏱ 3 min

**Na tela:** `Cliente` — `Pedido`, com `1` do lado do Cliente, `*` do lado do Pedido, seta apontando para Pedido.

**Fala:**
“Agora a linha simples: associação. Dois detalhes a ler.

A **seta** é a *navegabilidade*: só o Cliente conhece seus pedidos; o Pedido não sabe quem é o cliente. Então o campo
existe **só** em `Cliente`.

A **multiplicidade** `*` do lado do Pedido diz: um cliente tem muitos pedidos. ‘Muitos’ vira **coleção**:
`List<Pedido>`.”

“E reparem no `getPedidos()`: ele não devolve a lista, devolve `Collections.unmodifiableList`. Se eu devolvesse a
lista direto, qualquer um poderia fazer `cliente.getPedidos().add(...)` ou `.clear()` e passar por cima das regras do
cliente. Isso é encapsulamento de coleção.”

**Se perguntarem — “onde fica o 1?”:** o `1` está do lado do Cliente: cada pedido pertence a um cliente. Como a
seta não vai de Pedido para Cliente, essa informação não vira campo em `Pedido` — mas continua sendo uma regra.

**Se perguntarem — “List ou Set?”:** `Set` quando não pode repetir e a ordem não importa; `List` quando a ordem
importa ou pode repetir. A UML marca isso com `{unique}` / `{ordered}` quando quer ser explícita.

---

## Slide 10 — Composição ◆ · ⏱ 3 min

**Na tela:** `Pedido` ◆— `ItemPedido` `1..*`, em vermelho.

**Fala:**
“O losango **preenchido**, do lado do todo, é composição: o Pedido é **dono** dos itens. O item não existe sem pedido
e não é compartilhado com outro pedido.”

“No código, a marca registrada da composição é: **quem dá o `new` é o todo**. Olhem `adicionar`: eu não recebo um
`ItemPedido` pronto; eu recebo o produto e a quantidade, e o próprio Pedido cria o item. A lista é `final` e
privada.”

“E `limpar()`: ao descartar o pedido, os itens vão junto. Em Java não existe destrutor; ‘destruir’ significa que
ninguém mais tem referência e o *garbage collector* recolhe. Por isso é tão importante a parte não vazar para fora.”

**Se perguntarem — “e o `1..*`?”:** neste trecho ninguém garante. No exemplo completo (slide 21) a regra aparece em
`fechar()`.

---

## Slide 11 — Agregação ◇ · ⏱ 3 min

**Na tela:** `Time` ◇— `Jogador`. O ícone no título é o losango **vazado** (de propósito, como na UML).

**Fala:**
“Losango **vazado**: agregação. Também é ‘todo e parte’, mas fraco: as partes vêm de fora e **sobrevivem** ao todo.
O time acaba, o jogador continua existindo e pode ir para outro time.”

“No código: o `Time` **recebe** a lista de jogadores pelo construtor, e `escalar` recebe um jogador que já existe.
Nenhum `new Jogador` aqui dentro. Essa é a diferença que vocês têm que conseguir apontar no código.”

**Pegadinha que vale comentar (se a turma for boa):** este código guarda a *mesma* lista que veio de fora. Se quem
chamou alterar a lista dele depois, o time muda junto — *aliasing*. No exemplo do hotel (slide 38) a gente corrige
isso com `List.copyOf`, a **cópia defensiva**.

**Se perguntarem — “agregação e associação não são a mesma coisa no código?”:** quase. A própria UML trata agregação
como uma associação com uma intenção a mais (‘é parte de’). No código, os dois viram campo; a diferença é a
intenção, que você documenta e respeita (não criar, não destruir).

---

## Slide 12 — Classe associativa · ⏱ 3 min

**Na tela:** `Aluno *—* Disciplina`, com `Matricula` pendurada por uma linha tracejada laranja.

**Fala:**
“Pergunta para a turma: *onde fica a nota?* No aluno? Ele tem várias notas, uma por disciplina. Na disciplina? Ela
tem uma nota por aluno. A nota pertence ao **par** aluno–disciplina.”

“Quando uma relação muitos-para-muitos tem atributos próprios, a relação vira uma **classe**: `Matricula`. Ela guarda
as duas pontas e os atributos da relação: nota e faltas. E ganha comportamento: `aprovado()`.”

“Consequência: Aluno e Disciplina deixam de apontar direto um para o outro; passam a apontar para `Matricula`. No
banco de dados, isso é exatamente a tabela de junção com colunas extras.”

---

## Slide 13 — Enumeração e estático · ⏱ 3 min

**Na tela:** `«enumeration» Status` com ABERTO, PAGO, CANCELADO; `Pedido` com `− total: int` **sublinhado**.

**Fala:**
“`«enumeration»` vira `enum`: um conjunto **fechado** de valores. Não dá para inventar um status novo em tempo de
execução — e isso é bom, o compilador protege.”

“O outro detalhe é sutil: o atributo **sublinhado**. Sublinhado na UML é `static` — pertence à classe, não ao objeto.
Todos os pedidos compartilham o mesmo contador.”

**Se perguntarem:** o diagrama chama de `total` e o código de `totalDePedidos` — é o mesmo atributo; o nome no código
ficou mais explícito.

**Ponte:** “Oito construções. Agora, tudo numa tabela para consultar.”

---

## Slides 14 e 15 — A tabela para consultar na prova · ⏱ 5 min

**Na tela:** 14 linhas, divididas em estrutura (14) e relacionamentos (15).

**Fala (slide 14):**
“Esta é a tabela para a prova. Não leio linha por linha; destaco as pegadinhas:
itálico é `abstract`; sublinhado é `static`; seta sólida é `extends` e só pode uma; tracejada é `implements` e pode
várias.”

**Fala (slide 15):**
“Nos relacionamentos, o que muda é o **tipo do campo**: `1` é referência simples; `0..1` é `Optional` ou um campo que
aceita `null`; `*` é coleção. Composição: o todo cria. Agregação: recebe de fora. E a **dependência** — a seta
tracejada aberta — é a mais fraca: não vira campo nenhum; aparece só como parâmetro, variável local ou retorno.”

**Se perguntarem — “Optional como campo é boa prática?”:** boa pergunta, e é discutível. A recomendação comum em Java
é usar `Optional` como **retorno** de método, não como campo (ele não é serializável e cria um objeto a mais).
Alternativa: campo comum que aceita `null`, e um getter que devolve `Optional.ofNullable(campo)`. A tabela mostra as
duas opções.

---

## Slide 16 — Um modelo inteiro, traduzido · ⏱ 3 min

**Na tela:** o diagrama completo de loja e a lista dos seis arquivos.

**Fala:**
“Agora tudo junto. Leiam o diagrama comigo de cima para baixo:
`Pedido` realiza a interface `Pagavel` — linha tracejada.
`Pedido` se associa a `Cliente`: muitos pedidos para um cliente.
`Pedido` é composto de `ItemPedido` — losango cheio, `1..*`: pelo menos um item.
Cada item aponta para um `Produto`.
E `Status` é uma enumeração usada como tipo do atributo `status`.”

“São seis arquivos, um por classe pública. Vamos abrir um por um.”

---

## Slide 17 — Pagavel.java · ⏱ 1 min

**Fala:**
“O mais simples: `«interface»` vira `interface`. A operação vira um método sem corpo. Repare no `package
br.com.loja.dominio` — o diagrama de pacotes também vira código: vira o `package` e a pasta.”

---

## Slide 18 — Status.java · ⏱ 1 min

**Fala:**
“A enumeração. E de onde vieram esses seis valores? Do **diagrama de máquina de estados** do pedido. Os estados do
diagrama de estados viram os valores do enum. Os diagramas conversam entre si.”

---

## Slide 19 — Pedido.java (1/3): campos e construtor · ⏱ 3 min

**Fala:**
“Na assinatura, `implements Pagavel`: a realização.

Campos: tudo `private`, porque no diagrama tudo tinha menos. Os que não mudam depois de criados ficaram `final`.
`status` começa em `ABERTO` — o estado inicial da máquina de estados.

A associação **1** com Cliente: campo `cliente`. E notem o `Objects.requireNonNull` no construtor: multiplicidade `1`
quer dizer *obrigatório*. Se eu deixasse aceitar `null`, o código estaria dizendo `0..1`.

A composição: `final List<ItemPedido> itens = new ArrayList<>()` — criada aqui dentro, pelo próprio pedido.”

---

## Slide 20 — Pedido.java (2/3): operações · ⏱ 2 min

**Fala:**
“`adicionar` é a composição em ação: recebe produto e quantidade e dá o `new ItemPedido`. Além disso, tem uma regra
que veio do diagrama de estados: só pode adicionar enquanto o pedido está `ABERTO`.

`calcularTotal` cumpre o contrato do `Pagavel` — por isso o `@Override` — somando o subtotal de cada item. O
`ItemPedido::subtotal` é uma referência de método: ‘para cada item, chame `subtotal()`’.”

---

## Slide 21 — Pedido.java (3/3): regras e encapsulamento · ⏱ 2 min

**Fala:**
“Lembram que no slide 10 eu disse que ninguém garantia o `1..*`? Está aqui: `fechar()` recusa um pedido sem itens.
Por que não no construtor? Porque o pedido nasce vazio e vai recebendo itens; a regra vale **no momento em que ele
é fechado**. Saber *quando* a multiplicidade é cobrada é decisão de projeto.

E o `getItens()` devolve uma lista imutável: de fora, ninguém adiciona nem remove item sem passar pelo pedido.”

**Demonstração (opcional):** rode o `aula.Principal`; na seção 9 aparece
`[bloqueado] fechar() um pedido vazio (regra 1..*) → IllegalStateException`.

---

## Slide 22 — ItemPedido.java · ⏱ 2 min

**Fala:**
“A parte da composição. O detalhe mais importante é o construtor **sem modificador** — visibilidade de pacote. Só
quem está no mesmo pacote pode dar `new ItemPedido`. Na prática: só o Pedido. É assim que o código *garante* a
composição, em vez de só torcer para ninguém criar item solto.

E a quantidade é validada: zero ou negativo lança exceção.”

**Se perguntarem — “mas outra classe do pacote pode criar item”:** pode. É a melhor proteção que o Java dá sem
classe aninhada. Uma alternativa mais forte é tornar `ItemPedido` uma classe aninhada de `Pedido`.

---

## Slide 23 — Produto.java · ⏱ 1 min

**Fala:**
“A restrição ‘preço não pode ser negativo’ — que no diagrama seria uma restrição entre chaves, `{preco >= 0}` — vira
validação no `setPreco`. E o construtor chama o `setPreco`, então a regra vale desde o nascimento do objeto. Isso é
uma **invariante**: algo que é verdade durante toda a vida do objeto.”

---

## Slide 24 — Cliente.java · ⏱ 2 min

**Fala:**
“O lado ‘muitos’ da associação: `List<Pedido>`. E o `novoPedido` cria o pedido já passando `this` como cliente e
registra na lista — os dois lados ficam ligados de uma vez.”

**Pegadinha para você saber (e um ótimo gancho para a turma):** o comentário diz ‘navegável só deste lado’, mas
`Pedido` também tem o campo `cliente`. Então, no código, a associação é **bidirecional**. O `novoPedido` é justamente
o *código de sincronização* do slide 4: ele mantém os dois lados coerentes, e funciona porque `Pedido` não tem
`setCliente` — o cliente só é definido no construtor. Pergunte à turma: “O comentário está certo?” e use para revisar
navegabilidade.

**Ponte:** “Agora vamos aprofundar: o mesmo mapeamento, com mais rigor.”

---

## Slides 25 e 26 — Mapeamento rigoroso · ⏱ 4 min

**Na tela:** a tabela de aprofundamento (elemento UML → construção Java → observação).

**Fala:**
“É a mesma ideia da tabela anterior, com algumas observações que valem ouro:
*Um arquivo por classe pública* — regra do Java.
*Classe abstrata pode ter métodos concretos* — como o `depositar`.
*Associação com multiplicidade 1: validar no construtor* — o `requireNonNull` que vimos.
*A coleção é o papel, não uma classe nova* — ninguém cria uma classe `ListaDePedidos`; o papel ‘pedidos’ é o campo.
*Restrição entre chaves vira validação* — pré-condição, pós-condição e invariante, do tópico 3.”

*(Se estiver com pouco tempo, pule estes dois slides: eles reforçam o 14–15.)*

---

## Slide 27 — Multiplicidade vira tipo, e o tipo vira regra · ⏱ 3 min

**Fala:**
“Esta é a frase que eu quero que vocês levem: a multiplicidade é a parte **mais informativa** do diagrama e a **mais
esquecida** no código. Ela decide duas coisas: o tipo do campo e as validações.

Olhem o `Album`: `1..*` faixas. O construtor já recebe os dados da primeira faixa e a cria. Não existe álbum vazio —
o código torna impossível. Compare com a `Playlist`: `0..*`, agregação, a música vem de fora e a playlist pode estar
vazia.”

**Se perguntarem — “e se eu remover a única faixa?”:** então o método de remover precisa recusar quando sobrar uma.
A regra `1..*` vale para a vida inteira do objeto, não só para a criação.

---

## Slide 28 — Casos que o mapeamento simples não cobre · ⏱ 3 min

**Fala:**
“Quatro casos que exigem decisão:

**Associação qualificada:** quando a UML mostra uma caixinha com uma chave na ponta da associação — por exemplo,
`Banco [numeroConta] —— Conta` — a tradução é um `Map<String, Conta>`. O qualificador vira a chave.

**Classe de associação:** a gente já viu, `Matricula`. No sistema de música do curso, é a `Assinatura`.

**Classe parametrizada (template):** vira genérico. `Repositorio<T, ID>` serve para qualquer entidade.

**Retorno múltiplo:** Java não devolve duas coisas; você cria um `record` de resposta, ou usa `void`, ou exceção para
o caso de erro.”

**Se perguntarem — “o que é `record`?”:** desde o Java 16, uma classe imutável compacta só de dados:
`record Resultado(double total, int itens) {}` — gera construtor, getters, `equals`, `hashCode` e `toString`.

---

## Slide 29 — Modelo e código: a sincronização é o problema · ⏱ 4 min

**Fala:**
“**Engenharia direta:** do modelo para o código. Ferramentas geram classes, campos e assinaturas. Não geram a lógica.

**Engenharia reversa:** do código para o modelo. Mostra o que **existe**, não o que **deveria** existir. Código ruim
gera diagrama ruim.

E o aviso amarelo, que é o mais importante: *o diagrama que mente*. Depois de algumas semanas o código muda e o
diagrama não. Um diagrama desatualizado é **pior que nenhum**, porque as pessoas confiam nele. Escolham uma fonte da
verdade — normalmente o código, com testes — e mantenham o diagrama como documentação viva, ou gerem a partir do
código.”

**Se perguntarem — “o que é round-trip?”:** é a ferramenta fazer os dois sentidos e manter sincronizado. Na prática
funciona mal quando o código tem muita lógica.

**Se perguntarem — “como gerar diagrama a partir do código?”:** IDEs como IntelliJ (Diagrams), plugins de PlantUML,
ou escrever o diagrama em texto (Mermaid/PlantUML) dentro do repositório, versionado junto com o código.

---

## Slide 30 — Checklist de revisão do código · ⏱ 3 min

**Na tela:** seis itens. **Clique** em cada um para marcar enquanto fala.

**Fala:**
“Isto é o que eu faço quando reviso o código de vocês contra o modelo. Vou marcando:
1. Toda associação tem um campo? — Se é agregação ou dependência, pode ser parâmetro.
2. O `1` é garantido no construtor? — Não basta estar no diagrama.
3. O que é privado no diagrama está privado no código?
4. Composição cria a parte dentro do todo, sem expor a criação?
5. As restrições viraram validação ou teste?
6. Existe dependência no código que o diagrama não mostra? Ex.: uma classe de domínio importando algo de banco de
   dados — isso é acoplamento escondido.”

---

## Slide 31 — Exercício 1 · ⏱ 3 min

**Na tela:** o enunciado. Dê **1–2 minutos** para pensarem; só então clique em **Mostrar gabarito**.

**Fala do enunciado:** “`Ouvinte 1 —— 0..* Playlist`, e é o ouvinte que cria a playlist. Como fica em Java?”

**Resposta:** em `Ouvinte`, `private final List<Playlist> playlists` e um método `montarPlaylist(nome)` que faz
`new Playlist(nome)`. Como o ouvinte **cria**, a relação é tratada como composição do lado do ouvinte. Se a playlist
pudesse existir sem ouvinte, seria agregação.

**Se perguntarem — “e o `0..*`?”:** zero é permitido, então a lista começa vazia e nenhuma validação de mínimo é
necessária.

---

## Slide 32 — Exercício 2 · ⏱ 3 min

**Fala do enunciado:** “O colega gerou `public List<Musica> faixas` para uma composição. Qual o problema?”

**Resposta:** lista pública deixa qualquer código alterar as faixas, quebrando a posse exclusiva do álbum. Correto:
campo `private`, adição feita pelo próprio álbum e `getFaixas()` devolvendo `Collections.unmodifiableList(faixas)`.

**Demonstração (opcional):** no `aula.Principal`, seção 13:
`[bloqueado] Ex. 2 — alterar as faixas por fora → UnsupportedOperationException`.

---

## Slide 33 — Exercício 3 · ⏱ 2 min

**Fala do enunciado:** “Por que a engenharia reversa pura não basta para projetar um sistema?”

**Resposta:** porque ela descreve o que foi feito, com todos os acidentes do código, e não o que deveria ser feito.
Projetar é decidir **antes** de implementar; a reversa só documenta essas decisões **depois**.

---

## Slide 34 — Exercício 4: álbum, artista e faixas (enunciado) · ⏱ 5 min

**Na tela:** diagrama `Album *—> 1 Artista` e `Album ◆— 1..* Faixa`, com quatro perguntas guia à direita.
**Como conduzir:** leia o diagrama em voz alta, peça para escreverem o código no caderno (ou em duplas) e dê
**3 a 4 minutos**. Depois corrija com a turma (nota de correção abaixo).

**Fala:**
“Agora vocês traduzem. Um catálogo de streaming: cada álbum é de **um** artista e tem **uma ou mais** faixas. Leiam
os símbolos antes de escrever: a seta entre Album e Artista aponta para onde? O losango é cheio ou vazado? E o que
dizem o `1` e o `1..*`? Usem as quatro perguntas da direita como checklist.”

**Enquanto eles fazem, circule e procure estes erros:**
- campo `List<Album>` dentro de `Artista` (a seta vai só de Album para Artista);
- `adicionarFaixa(Faixa f)` recebendo a faixa pronta (isso é agregação, não composição);
- construtor de `Album` sem nenhuma faixa (quebra o `1..*`);
- `getFaixas()` devolvendo a lista interna.

### Correção do exercício 4 (sem slide — só para você) · ⏱ 3 min

A resposta **não aparece na apresentação**. Corrija no quadro ou abra o código em
`exemplos/do-diagrama-ao-codigo/src/exercicios/ex4/` (`Album.java`, `Artista.java`, `Faixa.java`).

**Fala da correção:**
“O campo `artista` fica só em `Album`, porque a seta aponta de Album para Artista; o `Artista` não conhece os álbuns.
O `1` vira `requireNonNull` no construtor: álbum sem artista não nasce.

A composição: a lista é `final`, criada aqui dentro, e quem dá o `new Faixa` é o álbum — tanto no construtor quanto
em `adicionarFaixa`. O construtor de `Faixa` é de pacote, então ninguém de fora cria faixa solta.

O `1..*`: o construtor já recebe os dados da primeira faixa. Não existe álbum vazio. É a mesma técnica do `Album` do
slide 27.

`duracaoTotal()` soma as durações, e `getFaixas()` devolve visão imutável.”

**Se perguntarem — “e se eu quiser criar o álbum vazio e ir adicionando?”:** dá, mas aí o `1..*` precisa ser cobrado
em outro momento — por exemplo, num `publicar()` que recusa álbum sem faixas, como o `fechar()` do Pedido (slide 21).

**Se perguntarem — “e se o Artista precisar listar os álbuns?”:** o diagrama mudaria para associação bidirecional, e
aí é preciso o código de sincronização do slide 4 (criar o álbum por um método do artista que liga os dois lados).

---

## Slide 35 — Exercício 5: usuário, plano e playlists (enunciado) · ⏱ 7 min

**Na tela:** `Usuario ◆— 0..* Playlist {GRATUITO: até 3}`, `Playlist ◇— 0..* Musica`,
`Musica ..|> «interface» Reproduzivel` e `«enumeration» Plano`.
**Como conduzir:** este é mais completo; dê **5 minutos**, em duplas.

**Fala:**
“Este junta quase tudo da aula num diagrama só. Tem interface com realização, enumeração, composição, agregação e uma
**restrição entre chaves**. O usuário cria playlists e põe nelas músicas que já existem no catálogo. No plano
gratuito, no máximo três playlists.

Pista: comparem os dois losangos. Um é cheio, o outro é vazado. O que isso muda sobre quem dá o `new`?”

**Enquanto eles fazem, procure:**
- `Playlist` criando `new Musica(...)` dentro dela (a música vem do catálogo: agregação);
- `Usuario` recebendo `Playlist` pronta em vez de criar (é composição);
- o limite de 3 escrito só como comentário, sem validação;
- `plano` como `String` em vez do `enum Plano`;
- esquecer o `implements Reproduzivel` ou o `@Override`.

### Correção do exercício 5 (sem slide — só para você) · ⏱ 4 min

A resposta **não aparece na apresentação**. Corrija no quadro ou abra o código em
`exemplos/do-diagrama-ao-codigo/src/exercicios/ex5/` (`Usuario.java`, `Playlist.java`, `Musica.java`, `Plano.java`,
`Reproduzivel.java`).

**Fala da correção:**
“Em `Usuario`: O `plano` é do tipo `Plano`, o enum, e começa em `GRATUITO`. A lista de playlists é a
composição: `final`, criada aqui, e o único jeito de ter uma playlist é `criarPlaylist`, que dá o `new`.

E a restrição `{GRATUITO: até 3}`: virou um `if` com exceção **antes** do `new`. Esse é o ponto principal do
exercício — restrição do diagrama vira validação no método que pode violá-la. O número 3 virou uma constante
`static final`, para não ficar um número mágico espalhado pelo código.

Em `Playlist`: construtor de pacote — só o usuário cria — e `adicionar(Musica m)` **recebe** a
música; não cria. É a agregação: se a playlist for apagada, a música continua no catálogo.

`Musica implements Reproduzivel`, com `@Override` no `tocar()`: a seta tracejada com triângulo.”

**Demonstração (opcional):** no `aula.Principal`, seção 13:
`[bloqueado] Ex. 5 — 4ª playlist no plano gratuito → IllegalStateException: Plano gratuito: até 3 playlists`
e, depois de `assinarPremium()`, a playlist “Foco” toca a música.

**Se perguntarem — “e se o usuário voltar do Premium para o gratuito com 5 playlists?”:** ótima pergunta de regra de
negócio que o diagrama não responde. Opções: bloquear o *downgrade*, ou manter as existentes e só impedir novas (o
código atual faz isso, porque só valida na criação). É decisão do negócio, não da UML.

**Se perguntarem — “por que a restrição não fica na Playlist?”:** porque quem sabe quantas playlists existem e qual
é o plano é o `Usuario`. A validação fica na classe que tem a informação (princípio do *especialista na
informação*).

**Lição de casa sugerida:** acrescentar `removerPlaylist(nome)` e uma operação `duracaoTotal()` na `Playlist`.

---

## Slide 36 — Hotel, passo 1: o diagrama · ⏱ 2 min

**Fala:**
“Um exemplo do começo ao fim. Leiam: um hóspede faz uma ou mais reservas (`1` para `1..*`, seta: o hóspede conhece as
reservas). Uma reserva ocupa um ou mais quartos, com **losango vazado**: agregação. O quarto existe antes da reserva
e continua existindo depois.

A reserva tem entrada, saída e uma operação `diarias()` que devolve `int`.”

---

## Slide 37 — Hotel, passo 2: traduzir cada elemento · ⏱ 2 min

**Fala:**
“Elemento por elemento, como na tabela: classe vira classe; atributo `-LocalDate entrada` vira `private final
LocalDate entrada`; a operação vira `public int diarias()`; `1..*` vira lista **não vazia validada**; e o losango
vazado diz que os quartos vêm de fora.”

---

## Slide 38 — Hotel, passo 3: o código gerado e revisado · ⏱ 2 min

**Fala:**
“O construtor faz duas validações: a saída tem que ser depois da entrada — essa regra não está no diagrama, é regra
de negócio — e tem que haver ao menos um quarto, que é o `1..*`.

E a linha do `List.copyOf(quartos)`: a **cópia defensiva**. Lembram do `Time` no slide 11, que guardava a lista de
quem chamou? Aqui a reserva faz uma cópia imutável. Se quem chamou limpar a lista dele depois, a reserva não muda.

`diarias()` usa `ChronoUnit.DAYS.between` para contar os dias.”

**Demonstração (opcional):** seção 12 do `aula.Principal` — `quartos.clear()` depois de criar a reserva e ela continua
com `Diárias: 3`.

---

## Slide 39 — Hotel: três decisões e o erro típico · ⏱ 2 min

**Fala:**
“Três decisões saíram direto do diagrama: validar o `1..*`; copiar a lista, por ser agregação; e não criar `Quarto`
dentro da reserva.

E o erro típico, que eu vejo todo semestre: gerar o código e **não revisar a multiplicidade**. O gerador cria
`List<Quarto>` sem validar nada, e o diagrama fica documentando uma regra que o código não cumpre.”

---

## Slides 40 a 42 — Quiz · ⏱ 6 min

**Como conduzir:** leia a pergunta, peça para a turma votar com os dedos (1, 2 ou 3), e só então **clique** na
resposta mais votada. Se estiver errada, ela fica vermelha e a certa verde — aproveite o erro.

**Quiz 1 (slide 40) — `Turma 1 —— 3..40 Aluno` vira:** resposta **3ª opção** — `List<Aluno>` com validação de tamanho
entre 3 e 40. O compilador não garante os limites; é regra de negócio explícita.
*Complemento:* o máximo se cobra ao matricular; o mínimo, quando a turma vai começar (no código pronto: `quiz.Turma`).

**Quiz 2 (slide 41) — diferença entre composição e agregação aparece em:** resposta **1ª opção** — em quem cria e
destrói a parte. A sintaxe é parecida; muda a responsabilidade pelo ciclo de vida.

**Quiz 3 (slide 42) — classe associativa com `nota` vira:** resposta **2ª opção** — classe própria (`Matricula`)
ligando os dois e guardando a nota. A nota pertence ao par.

---

## Slide 43 — Para aprofundar · ⏱ 1 min

**Fala:**
“Duas leituras. Fowler, *UML Essencial*: ele defende o diagrama como **esboço**, para pensar e comunicar, e não como
especificação completa. E Bloch, *Effective Java*: os itens sobre imutabilidade, coleções e encapsulamento explicam
por que fizemos `final`, `unmodifiableList` e cópia defensiva.”

---

## Slide 44 — O código pronto para rodar · ⏱ 2 min

**Fala:**
“Todo o código da aula está no repositório, em `exemplos/do-diagrama-ao-codigo`, um pacote para cada bloco. O
`aula.Principal` roda tudo na ordem dos slides e mostra, com `[bloqueado]`, cada regra funcionando.”

**Se for rodar ao vivo**, a saída começa assim (para você saber o que esperar):

```
=== 1. Classe simples: caixa → class, − → private, + → public ===
Preço após 10% de desconto: 36.0
...
=== 9. Exemplo completo: br.com.loja.dominio ===
[bloqueado] fechar() um pedido vazio (regra 1..*) → IllegalStateException: Pedido precisa de ao menos 1 item
Total: 380.0
Status após fechar(): AGUARDANDO_PAGAMENTO
[bloqueado] adicionar() depois de fechado → IllegalStateException: Pedido já fechado
```

**Fechamento:**
“Resumo em uma frase: o diagrama diz o que escrever; a multiplicidade e o ciclo de vida dizem as regras que o código
tem que garantir. Na próxima aula, princípios SOLID: como saber se esse código, além de correto, está **bem
projetado**.”

---

# Glossário de conceitos

Para responder sem travar. Ordem: do mais básico ao mais avançado.

**Visibilidade.** `+` public (qualquer um), `−` private (só a própria classe), `#` protected (subclasses; em Java também
o pacote), `~` package (só o pacote; em Java é não escrever modificador).

**Classe abstrata.** Não pode ser instanciada; pode ter estado (campos), métodos concretos e métodos abstratos. Na UML,
nome em itálico ou `{abstract}`. Use quando as filhas compartilham estado ou comportamento.

**Interface.** Contrato: lista de operações sem estado. Uma classe implementa várias. Desde o Java 8 pode ter métodos
`default` e `static` com corpo, mas continua sem campos de instância.

**Abstrata × interface (pergunta clássica).** Abstrata = “é um tipo de” + código comum + estado. Interface = “sabe
fazer” + vários contratos ao mesmo tempo. Na dúvida, interface — é menos acoplamento.

**Generalização × realização.** Generalização: linha sólida, ponta triangular vazada, `extends`, herda estado e código.
Realização: linha tracejada, mesma ponta, `implements`, só promete operações.

**Associação.** Relação estrutural duradoura: um objeto guarda referência ao outro (campo).

**Navegabilidade.** A seta na ponta da associação: quem conhece quem. Só o lado que “enxerga” recebe o campo. Sem setas
= não especificado (em geral, lido como bidirecional).

**Bidirecional.** Os dois lados têm campo. Exige código de sincronização (atualizar os dois lados juntos). Prefira mão
única quando der.

**Multiplicidade.** Quantos objetos participam: `1` (exatamente um, obrigatório), `0..1` (opcional), `*` ou `0..*`
(qualquer quantidade), `1..*` (pelo menos um), `3..40` (faixa). Vira tipo do campo + validações.

**Agregação (◇).** Todo–parte fraca: as partes existem antes, vêm de fora e sobrevivem ao todo; podem ser
compartilhadas.

**Composição (◆).** Todo–parte forte: o todo cria, é dono exclusivo e o ciclo de vida da parte acaba com o do todo. Uma
parte pertence a um único todo.

**Dependência (⇢).** Relação de uso passageira: parâmetro, variável local, retorno, chamada estática. Não vira campo.

**Classe associativa.** A própria associação tem atributos/comportamento; vira classe com referência às duas pontas
(ex.: `Matricula`). No banco: tabela de junção com colunas extras.

**Associação qualificada.** Uma chave identifica o objeto do outro lado; vira `Map<Chave, Outro>`.

**Enumeração.** Conjunto fechado de valores (`enum`). Em Java enums são classes: podem ter campos, construtor e
métodos.

**Membro estático (sublinhado).** Pertence à classe, não à instância. Um só valor compartilhado por todos os objetos.

**`final`.** Em campo: só pode ser atribuído uma vez (no construtor). Atenção: `final List` impede trocar a lista, mas
**não** impede alterar o conteúdo dela.

**Encapsulamento de coleção.** Nunca exponha a lista interna. Devolva visão imutável (`Collections.unmodifiableList`)
ou cópia, e ofereça métodos (`adicionar`) que aplicam as regras.

**`unmodifiableList` × `List.copyOf`.** `unmodifiableList` é uma **visão**: ninguém altera por ela, mas se a lista
original mudar, a visão mostra a mudança. `List.copyOf` é uma **cópia** imutável independente. Para expor a lista do
próprio objeto, a visão basta; para guardar uma lista que veio de fora, use a cópia.

**Cópia defensiva.** Copiar o que entra (e às vezes o que sai) para que mudanças externas não afetem o objeto. Evita
*aliasing* — duas partes do programa apontando para a mesma lista sem saber.

**Imutabilidade.** Objeto que não muda depois de criado (campos `final`, sem setters, coleções copiadas). Mais seguro
para compartilhar e para concorrência.

**`Objects.requireNonNull`.** Lança `NullPointerException` na hora se o valor for `null`. Forma curta de garantir a
multiplicidade `1`.

**`Optional`.** Contêiner que pode estar vazio; deixa explícito “pode não ter”. Uso recomendado: retorno de método.
Como campo é discutível (ver slide 15).

**Visibilidade de pacote.** Sem modificador: só classes do mesmo pacote acessam. Usada no construtor de `ItemPedido`
para que só o `Pedido` crie itens.

**`@Override`.** Anotação que pede ao compilador para conferir que o método realmente sobrescreve/implementa algo. Se
errar o nome, dá erro de compilação em vez de bug silencioso.

**Referência de método (`ItemPedido::subtotal`).** Atalho para a lambda `item -> item.subtotal()`.

**Genérico / classe parametrizada.** Tipo com parâmetro (`Repositorio<T, ID>`). Na UML, classe com uma caixinha
tracejada no canto com os parâmetros (template).

**`record`.** Classe imutável compacta só de dados (Java 16+); útil para “retorno múltiplo”.

**Restrição `{...}`.** Regra escrita no diagrama (ex.: `{preco >= 0}`, `{ordered}`, `{unique}`). Vira validação,
asserção ou teste.

**Pré-condição, pós-condição, invariante.** Pré: o que tem que ser verdade antes de chamar (quantidade > 0). Pós: o que
o método garante depois (o pedido fica `AGUARDANDO_PAGAMENTO`). Invariante: verdade durante toda a vida do objeto
(preço nunca negativo).

**Engenharia direta / reversa / round-trip.** Modelo → código; código → modelo; os dois sentidos sincronizados.

**Duck typing (Python).** O tipo é definido pelo que o objeto sabe fazer, não por herança declarada. `Protocol`
formaliza isso para o verificador de tipos.

**C#: propriedades e `IReadOnlyList`.** `public string Nome { get; set; }` é a propriedade (campo + getter/setter).
`IReadOnlyList<T>` é a forma idiomática de expor coleção só para leitura. Interfaces começam com `I` por convenção.

---

# Perguntas difíceis (e como responder)

**“Em Java não existe destrutor. Então composição não existe de verdade?”**
Existe como **responsabilidade**. “Destruir” em Java é deixar de referenciar; o *garbage collector* recolhe. A
composição é garantida por: o todo cria a parte, a parte não vaza (lista privada, visão imutável, construtor de
pacote), e ninguém mais guarda referência a ela.

**“Por que não deixar tudo `protected` ou `public` e pronto?”**
Porque cada coisa exposta é um compromisso: alguém vai depender dela e você não poderá mudar sem quebrar. Comece
privado e abra só quando precisar.

**“Composição e agregação têm o mesmo código, então para que diferenciar?”**
O código *se parece*, mas não é igual: na composição o `new` está dentro do todo e a parte não sai; na agregação a
parte entra pronta e deve ser copiada/protegida. A diferença é de responsabilidade, e é ela que evita bugs.

**“O `Time` do slide 11 tem um bug?”**
Tem um risco: guarda a mesma lista recebida (aliasing). Se o chamador mudar a lista, o time muda. Correção: `this.jogadores = new ArrayList<>(jogadores);`
(cópia mutável, porque o time ainda escala jogadores). No hotel usamos `List.copyOf` porque a reserva não altera a lista depois.

**“O `Cliente` diz ‘navegável só deste lado’, mas o `Pedido` tem `cliente`. Está errado?”**
No código, a associação é bidirecional (os dois têm campo). O comentário descreve a lista; a sincronização está
garantida porque o pedido só nasce por `Cliente.novoPedido`, que liga os dois lados de uma vez.

**“Por que o `1..*` do Pedido não é validado no construtor?”**
Porque o pedido nasce vazio e recebe itens um a um; a regra é cobrada em `fechar()`. A multiplicidade diz *o quê*; o
projeto decide *quando* cobrar.

**“Gerador de código resolve isso tudo?”**
Gera estrutura (classes, campos, assinaturas), não gera regras: não valida multiplicidade, não decide cópia defensiva
nem quem cria o quê. Por isso a revisão (checklist do slide 30) continua necessária.

**“`List` ou `Set` para `*`?”**
`Set` se não pode repetir e a ordem não importa; `List` se a ordem importa ou pode repetir. Na UML: `{unique}` e
`{ordered}`.

**“`ArrayList` ou `List` na declaração?”**
Declare pela interface (`List`), instancie a implementação (`new ArrayList<>()`). Assim dá para trocar a implementação
sem mudar quem usa.

**“E se o diagrama e o código discordarem?”**
Um deles está errado — descubra qual. Se o código está certo, atualize o diagrama; se o diagrama está certo, é bug.
Por isso é preciso escolher uma fonte da verdade.

**“Os trechos da aula compilam?”**
Alguns são recortes (ex.: `Fatura` usa `total` sem declarar; `Matricula` não mostra construtor). O projeto em
`exemplos/do-diagrama-ao-codigo` completa o mínimo para compilar e está marcado com o comentário “acrescentado para o
exemplo”.
