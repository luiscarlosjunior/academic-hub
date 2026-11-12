-- Dados iniciais para os exemplos do dia 1.
INSERT INTO livro (id, titulo, ano, preco, isbn) VALUES
    (1, 'Dom Casmurro',        1899, 39.90, '978-0001'),
    (2, 'Memórias Póstumas',   1881, 35.00, '978-0002'),
    (3, 'Iracema',             1865, 22.50, '978-0003'),
    (4, 'Capitães da Areia',   1937, 48.00, '978-0004');

INSERT INTO autor (id, nome) VALUES
    (1, 'Machado de Assis'),
    (2, 'José de Alencar'),
    (3, 'Jorge Amado');

INSERT INTO livro_autor (livro_id, autor_id) VALUES (1, 1), (2, 1), (3, 2), (4, 3);
