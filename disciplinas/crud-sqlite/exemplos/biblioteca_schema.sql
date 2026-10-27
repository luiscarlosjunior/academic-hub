-- Esquema de exemplo usado nos tópicos: uma biblioteca.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS autor (
    id   INTEGER PRIMARY KEY,
    nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS livro (
    id        INTEGER PRIMARY KEY,
    titulo    TEXT    NOT NULL,
    ano       INTEGER CHECK (ano > 0),
    isbn      TEXT    UNIQUE,
    preco     REAL    NOT NULL DEFAULT 0 CHECK (preco >= 0)
);

CREATE TABLE IF NOT EXISTS livro_autor (          -- relacionamento N:N
    livro_id INTEGER NOT NULL REFERENCES livro(id) ON DELETE CASCADE,
    autor_id INTEGER NOT NULL REFERENCES autor(id) ON DELETE CASCADE,
    PRIMARY KEY (livro_id, autor_id)
);

CREATE TABLE IF NOT EXISTS cliente (
    id    INTEGER PRIMARY KEY,
    nome  TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS emprestimo (           -- relacionamento 1:N (cliente) e N:1 (livro)
    id          INTEGER PRIMARY KEY,
    livro_id    INTEGER NOT NULL REFERENCES livro(id) ON DELETE RESTRICT,
    cliente_id  INTEGER NOT NULL REFERENCES cliente(id),
    data_saida  TEXT    NOT NULL,
    devolvido   INTEGER NOT NULL DEFAULT 0 CHECK (devolvido IN (0, 1))
);
