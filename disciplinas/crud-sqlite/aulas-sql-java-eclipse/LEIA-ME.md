# SQL, SQLite e CRUD com Java: duas aulas de 2 horas

Material para uma disciplina de **4 horas**, dividida em **dois dias de 2 horas**. Em cada dia, uma hora é de explicação com demonstração e uma hora é de exercícios. Ao todo, **2 horas de teoria e 2 horas de prática**.

## O que você aprende

1. **Dia 1 (SQL e SQLite):** o que é um banco relacional, como consultar com `SELECT`, juntar tabelas com `JOIN`, alterar dados com `INSERT`, `UPDATE` e `DELETE`, e como uma transação garante que tudo acontece ou nada acontece.
2. **Dia 2 (Java com SQLite):** como conectar um programa Java ao banco com JDBC, e como montar um CRUD completo com um DAO, `PreparedStatement` e transações.

## Cronograma

| Dia | Tempo | Atividade | Conteúdo |
|---|---|---|---|
| 1 | 0:00–1:00 | Explicação e demonstração | Conceitos, `SELECT`, `JOIN`, CRUD em SQL (roteiro `sql/03-consultas.sql`) |
| 1 | 1:00–2:00 | **Exercícios de SQL** | 5 exercícios em `exercicios/EXERCICIOS.md`, parte 1 |
| 2 | 0:00–1:00 | Explicação e demonstração | JDBC, `Connection`, `PreparedStatement`, DAO, transações (`aula/Dia2Demo.java`) |
| 2 | 1:00–2:00 | **Exercícios de Java** | 4 métodos no projeto `exercicios/dia2-java-aluno`, parte 2 |

Antes do dia 2, a turma precisa ter o Eclipse configurado. Use o roteiro de [01-configuracao-eclipse.md](01-configuracao-eclipse.md) no início do dia 1, com 15 minutos reservados para isso.

## Estrutura da pasta

```
aulas-sql-java-eclipse/
├── LEIA-ME.md                       ← este arquivo
├── 01-configuracao-eclipse.md       ← passo a passo do Eclipse (e VS Code, NetBeans)
├── codigo-fonte/                    ← projeto Eclipse COMPLETO (para o professor e para as demonstrações)
│   ├── .project, .classpath         ← importação direta no Eclipse
│   ├── lib/                         ← sqlite-jdbc e slf4j-api
│   ├── src/biblioteca/              ← Livro, Conexao, LivroDao, App (CRUD completo)
│   ├── src/aula/Dia2Demo.java       ← demonstração do CRUD, passo a passo
│   ├── src/exercicio/ExercicioTeste ← teste dos exercícios (gabarito: passa 8 de 8)
│   ├── sql/                         ← 01-schema, 02-dados, 03-consultas (dia 1)
│   └── saidas/                      ← saída real de cada demonstração
├── exercicios/
│   ├── EXERCICIOS.md                ← enunciados e gabaritos dos dois dias
│   └── dia2-java-aluno/             ← projeto Eclipse para o aluno (4 métodos a implementar)
└── (apresentação: https://claude.ai/artifact/7mRePSDYhwS44WU3Km9p7b, 33 slides, privada até ser compartilhada)
```

## Pré-requisitos

- JDK 17 ou mais recente (`java -version` deve mostrar 17).
- Eclipse (qualquer versão recente, com o *Java Development Tools*).
- `sqlite3` no terminal, para o dia 1. No macOS ele já vem instalado; no Windows, baixe em sqlite.org.
- Conhecimento básico de Java: classes, métodos, `try`/`catch`, `List`. Não é preciso saber SQL.

## Para o professor: antes da aula

1. Rode `codigo-fonte` no Eclipse e confirme que `aula.Dia2Demo` e `exercicio.ExercicioTeste` funcionam.
2. Gere a versão do aluno com `exercicios/dia2-java-aluno` (já está pronta, com 4 métodos com `TODO`).
3. Confirme que o `sqlite3` responde no terminal de todos os computadores.

## Observações

- O aviso `SLF4J(W): No SLF4J providers were found` aparece no console. É esperado: o driver usa a API de log, mas nenhuma implementação foi incluída. Pode ignorar.
- O arquivo `biblioteca_aula.db` é criado na pasta do projeto, e é recriado a cada execução da demonstração.
