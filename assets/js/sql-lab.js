/* =====================================================================
   Academic Hub — SQL Lab
   Executa SQL de verdade no navegador (SQLite compilado para WebAssembly
   via sql.js) sobre o mesmo banco de exemplo "loja" em todas as aulas.

   Componentes:
     .sql-code[data-run]   → destaca a consulta e mostra o resultado ao vivo
     .sql-play             → editor com botão "Executar" (cada um tem o seu banco)
     SQLLab.passos(el, …)  → animação passo a passo com controles
     SQLLab.tabelaHTML()   → tabela HTML para as animações
   Cada execução usa um banco novo, então um UPDATE de um exemplo não
   altera os dados dos outros.
   ===================================================================== */

(function (global) {
  'use strict';

  const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';

  /* Banco de exemplo: uma pequena loja virtual. Usado em todos os tópicos. */
  const SEED = `
CREATE TABLE categorias (
  id_categoria INTEGER PRIMARY KEY,
  nome         TEXT NOT NULL UNIQUE
);
CREATE TABLE clientes (
  id_cliente    INTEGER PRIMARY KEY,
  nome          TEXT NOT NULL,
  cidade        TEXT,
  email         TEXT UNIQUE,
  data_cadastro TEXT NOT NULL
);
CREATE TABLE produtos (
  id_produto   INTEGER PRIMARY KEY,
  nome         TEXT NOT NULL,
  id_categoria INTEGER REFERENCES categorias(id_categoria),
  preco        REAL NOT NULL CHECK (preco >= 0),
  estoque      INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE pedidos (
  id_pedido   INTEGER PRIMARY KEY,
  id_cliente  INTEGER NOT NULL REFERENCES clientes(id_cliente),
  data_pedido TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('pendente','pago','enviado','cancelado'))
);
CREATE TABLE itens_pedido (
  id_pedido      INTEGER NOT NULL REFERENCES pedidos(id_pedido),
  id_produto     INTEGER NOT NULL REFERENCES produtos(id_produto),
  quantidade     INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario REAL NOT NULL,
  PRIMARY KEY (id_pedido, id_produto)
);
CREATE TABLE funcionarios (
  id_funcionario INTEGER PRIMARY KEY,
  nome           TEXT NOT NULL,
  cargo          TEXT NOT NULL,
  id_supervisor  INTEGER REFERENCES funcionarios(id_funcionario)
);
INSERT INTO categorias VALUES (1,'Eletrônicos'),(2,'Livros'),(3,'Roupas'),(4,'Casa'),(5,'Esportes');
INSERT INTO clientes VALUES
  (1,'Ana Souza','São Paulo','ana@loja.com','2024-01-15'),
  (2,'Bruno Lima','Rio de Janeiro','bruno@loja.com','2024-02-03'),
  (3,'Carla Mendes','Belo Horizonte','carla@loja.com','2024-03-22'),
  (4,'Diego Rocha','São Paulo','diego@loja.com','2024-05-10'),
  (5,'Elisa Ferreira','Curitiba','elisa@loja.com','2024-06-18'),
  (6,'Gabriel Tavares','Recife',NULL,'2024-08-01'),
  (7,'Helena Costa','Curitiba','helena@loja.com','2024-09-09');
INSERT INTO produtos VALUES
  (1,'Notebook 14',1,3500.00,8),
  (2,'Smartphone',1,2200.00,15),
  (3,'Fone Bluetooth',1,250.00,40),
  (4,'Livro SQL Essencial',2,89.90,30),
  (5,'Livro Algoritmos',2,120.00,0),
  (6,'Camiseta Básica',3,49.90,100),
  (7,'Tênis de Corrida',3,399.00,12),
  (8,'Cafeteira',4,299.00,5),
  (9,'Panela Antiaderente',4,150.00,20);
INSERT INTO pedidos VALUES
  (1,1,'2024-07-01','enviado'),
  (2,2,'2024-07-03','pago'),
  (3,1,'2024-07-15','pago'),
  (4,3,'2024-08-02','cancelado'),
  (5,4,'2024-08-10','enviado'),
  (6,5,'2024-08-21','pendente'),
  (7,2,'2024-09-05','enviado'),
  (8,4,'2024-09-18','pago'),
  (9,6,'2024-09-30','pendente');
INSERT INTO itens_pedido VALUES
  (1,1,1,3500.00),(1,3,2,250.00),
  (2,4,1,89.90),(2,6,3,49.90),
  (3,2,1,2200.00),(3,3,1,250.00),
  (4,7,1,399.00),
  (5,8,1,299.00),(5,9,2,150.00),
  (6,6,2,49.90),
  (7,4,2,89.90),(7,5,1,120.00),
  (8,1,1,3500.00),(8,6,1,49.90),
  (9,3,1,250.00);
INSERT INTO funcionarios VALUES
  (1,'Marta Dias','Diretora',NULL),
  (2,'Roberto Alves','Gerente de Vendas',1),
  (3,'Lúcia Prado','Gerente de Estoque',1),
  (4,'Tiago Gomes','Vendedor',2),
  (5,'Juliana Reis','Vendedora',2),
  (6,'Paulo Ramos','Analista de Estoque',3),
  (7,'Renata Lopes','Auxiliar de Estoque',6);
`;

  const KEYWORDS = new Set((
    'SELECT FROM WHERE GROUP BY HAVING ORDER LIMIT OFFSET JOIN INNER LEFT RIGHT FULL OUTER CROSS ' +
    'NATURAL ON AS AND OR NOT IN IS NULL LIKE BETWEEN CASE WHEN THEN ELSE END DISTINCT UNION ALL ' +
    'EXCEPT INTERSECT EXISTS INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP ADD COLUMN ' +
    'PRIMARY KEY FOREIGN REFERENCES UNIQUE CHECK DEFAULT INDEX VIEW WITH RECURSIVE OVER PARTITION ' +
    'ROWS RANGE UNBOUNDED PRECEDING FOLLOWING CURRENT ROW BEGIN COMMIT ROLLBACK TRANSACTION EXPLAIN ' +
    'QUERY PLAN ASC DESC TRUE FALSE ESCAPE TRIGGER BEFORE AFTER FOR EACH IF NOTHING CONSTRAINT ' +
    'TEMPORARY REPLACE CASCADE RESTRICT'
  ).split(' '));

  const FUNCTIONS = new Set((
    'COUNT SUM AVG MIN MAX TOTAL ROW_NUMBER RANK DENSE_RANK LAG LEAD FIRST_VALUE LAST_VALUE NTILE ' +
    'COALESCE NULLIF IFNULL CAST LENGTH UPPER LOWER ROUND SUBSTR REPLACE DATE STRFTIME ' +
    'GROUP_CONCAT PRINTF ABS'
  ).split(' '));

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------ Motor ------------------------------ */
  let motorPromise = null;

  function motor() {
    if (!motorPromise) {
      motorPromise = new Promise((resolve, reject) => {
        if (global.initSqlJs) return resolve(global.initSqlJs({ locateFile: f => CDN + f }));
        const s = document.createElement('script');
        s.src = CDN + 'sql-wasm.js';
        s.onload = () => resolve(global.initSqlJs({ locateFile: f => CDN + f }));
        s.onerror = () => reject(new Error('Não foi possível carregar o SQLite. Verifique a conexão.'));
        document.head.appendChild(s);
      });
    }
    return motorPromise;
  }

  /* Cada chamada devolve um banco novo com o SEED aplicado */
  function novoBanco() {
    return motor().then(SQL => {
      const db = new SQL.Database();
      db.exec(SEED);
      return db;
    });
  }

  /* ------------------------------ Render ----------------------------- */

  /* Tabela HTML a partir de colunas e linhas do sql.js (ou de arrays próprios).
     opts.destaque: índices de linha a realçar; opts.animar: linhas entram em cascata */
  function tabelaHTML(cols, rows, opts) {
    opts = opts || {};
    const destaque = opts.destaque || [];
    const head = cols.map(c => `<th>${esc(c)}</th>`).join('');
    const body = rows.map((r, i) => {
      const classes = [destaque.includes(i) ? 'sql-hl' : '', opts.animar ? 'sql-in' : ''].join(' ').trim();
      const atraso = opts.animar ? ` style="animation-delay:${i * 70}ms"` : '';
      const celulas = r.map(v => v === null ? '<td class="sql-null">NULL</td>' : `<td>${esc(v)}</td>`).join('');
      return `<tr class="${classes}"${atraso}>${celulas}</tr>`;
    }).join('');
    const legenda = opts.caption ? `<div class="sql-cap">${esc(opts.caption)}</div>` : '';
    return `${legenda}<div class="sql-wrap"><table class="sql-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  /* Executa e transforma o resultado em HTML (ou em mensagem de erro) */
  function resultadoHTML(db, sql) {
    try {
      const res = db.exec(sql);
      if (!res.length) {
        const n = db.getRowsModified();
        return `<div class="sql-ok"><i class="fa-solid fa-circle-check"></i> Comando executado. ${n} linha(s) afetada(s).</div>`;
      }
      return res.map(r => tabelaHTML(r.columns, r.values, { caption: `${r.values.length} linha(s)` })).join('');
    } catch (e) {
      return `<div class="sql-erro"><i class="fa-solid fa-triangle-exclamation"></i> ${esc(e.message)}</div>`;
    }
  }

  /* Destaca a sintaxe SQL com as mesmas classes usadas em .ah-code */
  function destacar(sql) {
    const re = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ_0-9]*\b)|([\s\S])/g;
    let out = '', m;
    while ((m = re.exec(sql))) {
      if (m[1]) out += `<span class="cm">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="str">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="num">${m[3]}</span>`;
      else if (m[4]) {
        const u = m[4].toUpperCase();
        const t = esc(m[4]);
        out += KEYWORDS.has(u) ? `<span class="kw">${t}</span>` : FUNCTIONS.has(u) ? `<span class="fn">${t}</span>` : t;
      } else out += esc(m[5]);
    }
    return out;
  }

  /* -------------------- Exemplos com saída ao vivo ------------------- */
  function iniciaExemplos(scope) {
    /* Todo bloco .sql-code recebe cor; só os marcados com data-run são executados */
    scope.querySelectorAll('pre.sql-code').forEach(pre => {
      if (pre.dataset.pronto) return;
      pre.dataset.pronto = '1';
      const sql = pre.textContent.trim();
      pre.innerHTML = destacar(sql);
      if (!pre.hasAttribute('data-run')) return;
      const saida = document.createElement('div');
      saida.className = 'sql-saida';
      saida.innerHTML = '<div class="sql-carregando"><i class="fa-solid fa-spinner fa-spin"></i> executando no SQLite…</div>';
      pre.parentNode.insertBefore(saida, pre.nextSibling);
      novoBanco().then(db => {
        saida.innerHTML = `<div class="sql-rotulo"><i class="fa-solid fa-terminal"></i> Saída</div>` + resultadoHTML(db, sql);
      }).catch(e => {
        saida.innerHTML = `<div class="sql-erro">${esc(e.message)}</div>`;
      });
    });
  }

  /* ---------------------------- Editor ------------------------------- */
  function iniciaEditores(scope) {
    scope.querySelectorAll('.sql-play').forEach(box => {
      if (box.dataset.pronto) return;
      box.dataset.pronto = '1';
      const inicial = (box.dataset.init || box.textContent).trim();
      box.innerHTML = `
        <div class="sql-play-head">
          <span class="sql-rotulo"><i class="fa-solid fa-flask"></i> Experimente</span>
          <span class="sql-dica">Ctrl/⌘ + Enter executa · o banco é novo a cada execução</span>
        </div>
        <textarea class="sql-area" spellcheck="false" aria-label="Editor SQL"></textarea>
        <div class="sql-play-ctl">
          <button type="button" class="ah-btn ah-btn-primary sql-run"><i class="fa-solid fa-play"></i> Executar</button>
          <button type="button" class="ah-btn ah-btn-ghost sql-reset"><i class="fa-solid fa-rotate-left"></i> Restaurar</button>
        </div>
        <div class="sql-saida"></div>`;
      const area = box.querySelector('.sql-area');
      const saida = box.querySelector('.sql-saida');
      area.value = inicial;
      const executa = () => {
        saida.innerHTML = '<div class="sql-carregando"><i class="fa-solid fa-spinner fa-spin"></i> executando…</div>';
        novoBanco().then(db => {
          saida.innerHTML = resultadoHTML(db, area.value);
        }).catch(e => {
          saida.innerHTML = `<div class="sql-erro">${esc(e.message)}</div>`;
        });
      };
      box.querySelector('.sql-run').addEventListener('click', executa);
      box.querySelector('.sql-reset').addEventListener('click', () => { area.value = inicial; saida.innerHTML = ''; });
      area.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); executa(); }
      });
    });
  }

  /* ---------------------- Animação passo a passo --------------------- */
  /* steps: [{ titulo, texto, html: string | () => string }] */
  function passos(el, steps) {
    let i = 0, timer = null;
    el.classList.add('sql-passos');
    el.innerHTML = `
      <div class="sql-p-top">
        <span class="sql-p-n"></span>
        <div class="sql-p-dots"></div>
      </div>
      <h4 class="sql-p-t"></h4>
      <p class="sql-p-txt"></p>
      <div class="sql-p-body"></div>
      <div class="sql-p-ctl">
        <button type="button" class="ah-btn ah-btn-ghost sql-p-prev"><i class="fa-solid fa-chevron-left"></i> Anterior</button>
        <button type="button" class="ah-btn ah-btn-ghost sql-p-auto"><i class="fa-solid fa-play"></i> Automático</button>
        <button type="button" class="ah-btn ah-btn-primary sql-p-next">Próximo <i class="fa-solid fa-chevron-right"></i></button>
      </div>`;
    const $ = s => el.querySelector(s);

    function mostra(n) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      const st = steps[i];
      const html = typeof st.html === 'function' ? st.html() : (st.html || '');
      $('.sql-p-n').textContent = `Passo ${i + 1} de ${steps.length}`;
      $('.sql-p-t').textContent = st.titulo || '';
      $('.sql-p-txt').textContent = st.texto || '';
      const corpo = $('.sql-p-body');
      corpo.innerHTML = html;
      corpo.classList.remove('sql-fade');
      void corpo.offsetWidth;          // reinicia a animação de entrada
      corpo.classList.add('sql-fade');
      $('.sql-p-dots').innerHTML = steps.map((_, k) =>
        `<button type="button" class="sql-dot ${k === i ? 'on' : ''}" data-k="${k}" aria-label="Passo ${k + 1}"></button>`).join('');
      $('.sql-p-prev').disabled = i === 0;
      $('.sql-p-next').disabled = i === steps.length - 1;
    }

    function para() {
      if (timer) clearInterval(timer);
      timer = null;
      $('.sql-p-auto').innerHTML = '<i class="fa-solid fa-play"></i> Automático';
    }

    $('.sql-p-prev').addEventListener('click', () => { para(); mostra(i - 1); });
    $('.sql-p-next').addEventListener('click', () => { para(); mostra(i + 1); });
    $('.sql-p-auto').addEventListener('click', () => {
      if (timer) return para();
      if (i === steps.length - 1) mostra(0);
      $('.sql-p-auto').innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
      timer = setInterval(() => {
        if (i >= steps.length - 1) return para();
        mostra(i + 1);
      }, 2200);
    });
    $('.sql-p-dots').addEventListener('click', e => {
      const b = e.target.closest('.sql-dot');
      if (b) { para(); mostra(+b.dataset.k); }
    });
    mostra(0);
    return { ir: n => { para(); mostra(n); } };
  }

  /* ------------------------------ Boot ------------------------------- */
  function init(scope) {
    scope = scope || document;
    iniciaExemplos(scope);
    iniciaEditores(scope);
  }

  global.SQLLab = { init, novoBanco, resultadoHTML, tabelaHTML, destacar, passos, SEED };
  document.addEventListener('DOMContentLoaded', () => init(document));
})(window);
