# Exercícios: SQL e CRUD com Java

Duas horas de prática, uma em cada dia. Tente sozinho antes de abrir o gabarito: a resposta pronta ensina menos que o erro que você cometeu tentando.

---

## Dia 1 (1 hora): SQL com SQLite

Use o banco de exemplo. Crie-o com:

```bash
cd codigo-fonte
sqlite3 dia1.db < sql/01-schema.sql
sqlite3 dia1.db < sql/02-dados.sql
sqlite3 -header -column dia1.db
```

Dentro do `sqlite3`, rode `PRAGMA foreign_keys = ON;` antes de qualquer `DELETE` (o pragma vale só para a sessão atual). Os exercícios usam as tabelas `livro`, `autor` e `livro_autor`.

**Exercício 1.1 (SELECT).** Liste os títulos dos livros publicados depois de 1880, do mais novo para o mais antigo.

**Exercício 1.2 (COUNT).** Quantos livros custam mais de R$ 30,00?

**Exercício 1.3 (JOIN e GROUP BY).** Quais autores têm mais de um livro na biblioteca? Mostre o nome e a quantidade.

**Exercício 1.4 (UPDATE com subconsulta).** Aumente em 5% o preço de todos os livros do *Jorge Amado*, sem escrever nenhum id na mão. Mostre o preço de *Capitães da Areia* antes e depois.

**Exercício 1.5 (DELETE e chave estrangeira).** Remova o autor *José de Alencar*. O que acontece com a linha de `livro_autor` que ligava *Iracema* a ele? E com o livro *Iracema*? Confirme com `SELECT`.

<details><summary><strong>Gabarito do dia 1</strong></summary>

```sql
-- 1.1
SELECT titulo FROM livro WHERE ano > 1880 ORDER BY ano DESC;
-- resultado: Capitães da Areia, Dom Casmurro, Memórias Póstumas

-- 1.2
SELECT COUNT(*) FROM livro WHERE preco > 30;
-- resultado: 3

-- 1.3
SELECT a.nome, COUNT(*) AS livros
FROM autor a
JOIN livro_autor la ON la.autor_id = a.id
GROUP BY a.nome
HAVING COUNT(*) > 1;
-- resultado: Machado de Assis | 2

-- 1.4
UPDATE livro
SET preco = ROUND(preco * 1.05, 2)
WHERE id IN (
    SELECT la.livro_id
    FROM livro_autor la
    JOIN autor a ON a.id = la.autor_id
    WHERE a.nome = 'Jorge Amado'
);
SELECT titulo, preco FROM livro WHERE titulo = 'Capitães da Areia';
-- resultado: Capitães da Areia | 50.4

-- 1.5
PRAGMA foreign_keys = ON;
DELETE FROM autor WHERE nome = 'José de Alencar';
SELECT COUNT(*) FROM livro_autor WHERE autor_id = 2;   -- 0: o vínculo foi apagado em cascata
SELECT COUNT(*) FROM livro WHERE titulo = 'Iracema';   -- 1: o livro continua existindo
```

**Por quê:** `ON DELETE CASCADE` apaga as linhas filhas (de `livro_autor`) quando a linha pai (`autor`) some. O livro não é filho do autor, então ele permanece, agora sem autor.

</details>

---

## Dia 2 (1 hora): CRUD em Java

Abra o projeto **`dia2-java-aluno`** no Eclipse (veja [01-configuracao-eclipse.md](../01-configuracao-eclipse.md)). Ele já tem `Livro`, `Conexao` e a classe `LivroDao` com as operações de CRUD. Faltam quatro métodos, marcados com `TODO`.

Para conferir, rode `exercicio/ExercicioTeste.java`. Ele usa um banco em memória e mostra OK ou FALHOU para cada verificação. Antes de implementar, a saída mostra FALHOU com a mensagem `TODO: implementar ...`.

**Exercício 2.1 — `buscarPorAno(int ano)`.** Devolva os livros publicados em um ano, em ordem alfabética de título. Use `PreparedStatement` e `setInt`.

**Exercício 2.2 — `precoMedio()`.** Devolva a média dos preços. Se a tabela estiver vazia, devolva 0. Dica: `AVG` devolve `NULL` quando não há linhas; `COALESCE` resolve isso.

**Exercício 2.3 — `existeIsbn(String isbn)`.** Devolva `true` se já existe um livro com esse ISBN. Dica: você não precisa contar; basta saber se a consulta devolve uma linha.

**Exercício 2.4 — `aplicarDescontoAntesDe(int anoLimite, double percentual)`.** Aplique o desconto a todos os livros publicados antes de `anoLimite` e devolva quantas linhas mudaram. Dica: `executeUpdate()` devolve esse número.

<details><summary><strong>Gabarito do dia 2</strong></summary>

Os quatro métodos estão implementados no projeto completo, em `codigo-fonte/src/biblioteca/LivroDao.java`. O trecho é este:

```java
    /** Livros publicados em um ano, em ordem alfabética de título. */
    public List<Livro> buscarPorAno(int ano) throws SQLException {
        String sql = "SELECT id, titulo, ano, preco, isbn FROM livro WHERE ano = ? ORDER BY titulo";
        List<Livro> lista = new ArrayList<>();
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, ano);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }
        }
        return lista;
    }

    /** Preço médio do acervo; 0 quando a tabela está vazia. */
    public double precoMedio() throws SQLException {
        try (Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT COALESCE(AVG(preco), 0) FROM livro")) {
            rs.next();
            return rs.getDouble(1);
        }
    }

    /** Verdadeiro se já existe um livro com este ISBN. */
    public boolean existeIsbn(String isbn) throws SQLException {
        try (PreparedStatement ps = con.prepareStatement("SELECT 1 FROM livro WHERE isbn = ? LIMIT 1")) {
            ps.setString(1, isbn);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    /** Aplica desconto em todos os livros publicados antes de anoLimite. Devolve quantos mudaram. */
    public int aplicarDescontoAntesDe(int anoLimite, double percentual) throws SQLException {
        String sql = "UPDATE livro SET preco = ROUND(preco * (1 - ? / 100.0), 2) WHERE ano < ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setDouble(1, percentual);
            ps.setInt(2, anoLimite);
            return ps.executeUpdate();
        }
    }
```

**Pontos para discutir:**

- Em `buscarPorAno`, o valor vem de fora e entra por `setInt`, nunca concatenado no texto do SQL.
- Em `precoMedio`, o `COALESCE` evita que o método devolva `NULL` (que não cabe em `double`) quando a tabela está vazia.
- Em `aplicarDescontoAntesDe`, o `ROUND` mantém o preço com duas casas decimais. Sem ele, o valor fica com muitas casas no banco.

</details>

---

## Ao terminar

1. Rode `ExercicioTeste`. O resultado esperado é `8 de 8 testes passaram.`
2. Compare com a saída guardada em `codigo-fonte/saidas/dia2-teste-exercicio.txt`.
3. Se algum teste falhar, leia a mensagem entre parênteses: ela mostra a exceção que apareceu.
