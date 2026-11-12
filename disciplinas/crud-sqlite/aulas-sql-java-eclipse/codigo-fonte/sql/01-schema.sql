-- Dia 1: o esquema da biblioteca. Execute: sqlite3 dia1.db < sql/01-schema.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS livro (
    id     INTEGER PRIMARY KEY,
    titulo TEXT    NOT NULL,
    ano    INTEGER NOT NULL CHECK (ano > 0),
    preco  REAL    NOT NULL DEFAULT 0 CHECK (preco >= 0),
    isbn   TEXT    UNIQUE
);

CREATE TABLE IF NOT EXISTS autor (
    id   INTEGER PRIMARY KEY,
    nome TEXT    NOT NULL
);

-- relacionamento N:N: um livro pode ter vários autores, e um autor vários livros
CREATE TABLE IF NOT EXISTS livro_autor (
    livro_id INTEGER NOT NULL REFERENCES livro(id) ON DELETE CASCADE,
    autor_id INTEGER NOT NULL REFERENCES autor(id) ON DELETE CASCADE,
    PRIMARY KEY (livro_id, autor_id)
);
