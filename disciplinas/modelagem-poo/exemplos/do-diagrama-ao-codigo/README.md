# Do Diagrama ao Código (Java) — código da aula

Código-fonte completo da aula [15 · Do Diagrama ao Código](../../topicos/15-do-diagrama-ao-codigo.html)
e da [apresentação](../../apresentacoes/15-do-diagrama-ao-codigo.html). Requer Java 17+.

```bash
javac -encoding UTF-8 -d out $(find src -name "*.java")
java -cp out aula.Principal
```

`aula.Principal` percorre os exemplos na mesma ordem dos slides e mostra, com `[bloqueado]`,
as regras que o código passa a garantir (multiplicidade, composição, encapsulamento).

| Pacote | Slides | Conteúdo |
|---|---|---|
| `tradutor.classe` | Tradutor · Classe simples | `Produto` com visibilidades |
| `tradutor.abstrata` | Tradutor · Classe abstrata | `Conta` (abstract) e `Poupanca extends Conta` |
| `tradutor.interfaces` | Tradutor · Interface | `Pagavel` e `Fatura implements Pagavel` |
| `tradutor.associacao` | Tradutor · Associação 1 → * | `Cliente` com `List<Pedido>` imutável para fora |
| `tradutor.composicao` | Tradutor · Composição ◆ | `Pedido` cria `ItemPedido` |
| `tradutor.agregacao` | Tradutor · Agregação ◇ | `Time` recebe `Jogador`es de fora |
| `tradutor.associativa` | Tradutor · Classe associativa | `Matricula` entre `Aluno` e `Disciplina` |
| `tradutor.enumeracao` | Tradutor · Enumeração e estático | `enum Status` e campo `static` |
| `br.com.loja.dominio` | Exemplo completo | `Pagavel`, `Pedido`, `ItemPedido`, `Produto`, `Cliente`, `Status` |
| `aprofundamento.multiplicidade` | Multiplicidade e coleções | `Album` (1..*), `Playlist` (agregação) |
| `aprofundamento.genericos` | Casos que o mapeamento simples não cobre | `Repositorio<T, ID>` + implementação em memória |
| `aprofundamento.hotel` | Exemplo passo a passo | `Reserva`, `Hospede`, `Quarto` |
| `exercicios.ex1`, `exercicios.ex2` | Exercícios 1 e 2 | Gabaritos em código |
| `exercicios.ex4` | Exercício 4 (streaming) | `Album`, `Artista`, `Faixa`: associação navegável e composição 1..* |
| `exercicios.ex5` | Exercício 5 (streaming) | `Usuario`, `Playlist`, `Musica`, `Plano`, `Reproduzivel`: restrição vira validação |
| `quiz` | Quiz 1 | `Turma` com validação `3..40` |

O código mostrado nos slides é idêntico ao da aula. Onde a aula mostra só um trecho
(por exemplo, `Fatura` usa `total` sem declará-lo), os arquivos daqui acrescentam o mínimo
para compilar, marcado com o comentário *acrescentado para o exemplo*.
