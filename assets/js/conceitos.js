/* =====================================================================
   Estrutura de Dados — animações de conceitos (uma por conceito)
   Usa o motor de animação de estrutura-dados.js (window.ED). Cada função
   gera quadros com um texto explicativo; os desenhos ficam em canvas.
   Expõe window.CONC.
   ===================================================================== */
(function (global) {
  'use strict';
  const ED = global.ED;
  const { limpa, caixa, rotulo, CORES, ESTILO } = ED;
  const AH = global.AH;

  /* ---------- 1) Endereço de memória de um vetor ---------- */
  const END_VALORES = [4, 8, 15, 16, 23, 42];
  function geraEndereco() {
    const base = 1000, s = 4, Q = [];
    Q.push({ a: END_VALORES, hl: [], base, s, addr: null,
      t: `Vetor com ${END_VALORES.length} inteiros. Em C, cada int ocupa ${s} bytes e o primeiro elemento está no endereço ${base}.` });
    for (let i = 0; i < END_VALORES.length; i++) {
      Q.push({ a: END_VALORES, hl: [i], base, s, addr: base + i * s,
        t: `endereço(a[${i}]) = base + ${i} × ${s} = ${base} + ${i * s} = ${base + i * s}. Uma multiplicação e uma soma: não há busca, por isso o acesso é O(1).` });
    }
    Q.push({ a: END_VALORES, hl: [], base, s, addr: null,
      t: 'Por isso a[i] é tão barato: o compilador calcula o endereço. Se o índice estiver fora de 0..n−1, C não avisa: o endereço calculado pode apontar para outra variável.' });
    return Q;
  }
  function desenhaEndereco(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.a.length, cw = Math.min(78, (w - 40) / n), x0 = (w - cw * n) / 2, y = h * 0.28, ch = 52;
    q.a.forEach((v, k) => {
      const st = q.hl.includes(k) ? ESTILO.hl : ESTILO.normal;
      caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, st, String(v), '@' + (q.base + k * q.s));
    });
    rotulo(ctx, `base = ${q.base} · cada posição ocupa ${q.s} bytes`, 16, 14, CORES.azulBorda);
    if (q.addr !== null) rotulo(ctx, `endereço = ${q.addr}`, 16, h - 16, CORES.hlBorda);
  }

  /* ---------- 2) Transposta de uma matriz ---------- */
  const MAT_A = [[3, 1, 4, 1], [5, 9, 2, 6], [5, 3, 5, 8]];
  function geraTransposta() {
    const L = MAT_A.length, C = MAT_A[0].length, Q = [];
    const T = Array.from({ length: C }, () => Array(L).fill(null));
    Q.push({ T: T.map(r => r.slice()), i: -1, j: -1, t: `Matriz A de ${L} linhas × ${C} colunas. A transposta Aᵀ tem ${C} linhas × ${L} colunas, e Aᵀ[j][i] = A[i][j].` });
    for (let i = 0; i < L; i++) for (let j = 0; j < C; j++) {
      T[j][i] = MAT_A[i][j];
      Q.push({ T: T.map(r => r.slice()), i, j,
        t: `Copia A[${i}][${j}] = ${MAT_A[i][j]} para Aᵀ[${j}][${i}]. A linha ${i} de A vira a coluna ${i} de Aᵀ.` });
    }
    Q.push({ T: T.map(r => r.slice()), i: -1, j: -1, t: 'Pronto. Transpor troca linhas por colunas: a transposta de uma matriz n × m é m × n. Custo O(n·m), com uma matriz nova.' });
    return Q;
  }
  function desenhaTransposta(ctx, w, h, q) {
    limpa(ctx, w, h);
    const cs = 42, L = MAT_A.length, C = MAT_A[0].length;
    const ax = 30, ay = 30, tx = Math.max(ax + C * cs + 60, w / 2 + 10), ty = 30;
    rotulo(ctx, 'A', ax, ay - 14, CORES.azulBorda);
    rotulo(ctx, 'Aᵀ', tx, ty - 14, CORES.okBorda);
    for (let i = 0; i < L; i++) for (let j = 0; j < C; j++) {
      const hl = q.i === i && q.j === j;
      caixa(ctx, ax + j * cs + 2, ay + i * cs + 2, cs - 4, cs - 4, hl ? ESTILO.hl : ESTILO.normal, String(MAT_A[i][j]));
    }
    for (let j = 0; j < C; j++) for (let i = 0; i < L; i++) {
      const v = q.T[j][i];
      const hl = q.i === i && q.j === j;
      caixa(ctx, tx + i * cs + 2, ty + j * cs + 2, cs - 4, cs - 4, hl ? ESTILO.ok : (v === null ? ESTILO.apag : ESTILO.normal), v === null ? '' : String(v));
    }
  }

  /* ---------- 3) lower_bound: primeira posição ≥ x ---------- */
  const LB_VALORES = [1, 2, 2, 2, 3, 5, 5, 8];
  function geraLowerBound() {
    const a = LB_VALORES, x = 2, Q = [];
    let lo = 0, hi = a.length;
    Q.push({ a, lo, hi: hi - 1, mid: -1, achou: false, t: `lower_bound procura a primeira posição com a[i] ≥ ${x}. Intervalo semiaberto [lo, hi), começando com [0, ${a.length}).` });
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      Q.push({ a, lo, hi: hi - 1, mid, achou: false, t: `mid = ${mid}: a[${mid}] = ${a[mid]}. ${a[mid] < x ? `${a[mid]} < ${x}: a resposta está à direita, lo = mid + 1.` : `${a[mid]} ≥ ${x}: a resposta está em mid ou à esquerda, hi = mid.`}` });
      if (a[mid] < x) lo = mid + 1; else hi = mid;
    }
    Q.push({ a, lo: lo, hi: lo - 1, mid: -1, achou: true, t: `lo = ${lo}: primeira posição com valor ≥ ${x}. Com repetições, essa é a primeira ocorrência de ${x}. Contar ocorrências: lower_bound(3) − lower_bound(2).` });
    return Q;
  }
  function desenhaLowerBound(ctx, w, h, q) { ED.desenhaBusca(ctx, w, h, q); }

  /* ---------- 4) Deque: fila de duas pontas ---------- */
  function geraDeque() {
    const d = [], Q = [];
    const fr = (t, extra) => Q.push(Object.assign({ d: d.slice(), hl: -1, t }, extra || {}));
    fr('Deque (double-ended queue): insere e remove nas duas pontas, em O(1). A fila comum só usa uma ponta para entrar e a outra para sair.');
    d.push(5); fr('pushBack(5): insere 5 no fim.', { hl: d.length - 1 });
    d.unshift(3); fr('pushFront(3): insere 3 no início. Agora a ordem é 3, 5.', { hl: 0 });
    d.push(8); fr('pushBack(8): insere 8 no fim.', { hl: d.length - 1 });
    const f = d.shift(); fr(`popFront(): remove ${f} do início, como uma fila FIFO.`, { hl: -1, saiu: f });
    const b = d.pop(); fr(`popBack(): remove ${b} do fim, como uma pilha LIFO.`, { hl: -1, saiu: b });
    d.unshift(9); fr('pushFront(9): insere 9 no início.', { hl: 0 });
    fr('Duas pontas dão o melhor dos dois: fila (por um lado) e pilha (pelo outro). É a base da janela deslizante de máximo.');
    return Q;
  }
  function desenhaDeque(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.d.length, cw = Math.min(80, (w - 120) / Math.max(n, 5)), x0 = 90, y = h * 0.34, ch = 52;
    q.d.forEach((v, k) => caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, q.hl === k ? ESTILO.hl : ESTILO.normal, String(v)));
    if (n) {
      rotulo(ctx, 'início', x0 + cw / 2, y + ch + 18, CORES.azulBorda, 'center');
      rotulo(ctx, 'fim', x0 + (n - 1) * cw + cw / 2, y + ch + 18, CORES.okBorda, 'center');
    } else rotulo(ctx, 'deque vazio', x0, y + ch / 2);
    if (q.saiu !== undefined) caixa(ctx, 12, y, 62, ch, ESTILO.erro, 'saiu ' + q.saiu);
  }

  /* ---------- 5) Desfazer com pilha ---------- */
  function geraUndo() {
    const desfazer = [], refazer = [], Q = [];
    const fr = (t, extra) => Q.push(Object.assign({ und: desfazer.slice(), ref: refazer.slice(), t }, extra || {}));
    fr('Desfazer (undo) é uma pilha: cada ação é empilhada. Desfazer desempilha a última ação e a guarda para refazer.');
    for (const acao of ['digitar A', 'digitar B', 'apagar B']) {
      desfazer.push(acao); refazer.length = 0;
      fr(`Ação "${acao}": empilhada em desfazer. A pilha de refazer é esvaziada, porque uma nova ação muda o histórico.`);
    }
    const u1 = desfazer.pop(); refazer.push(u1);
    fr(`Desfazer: desempilha "${u1}" e a envia para a pilha de refazer.`);
    const u2 = desfazer.pop(); refazer.push(u2);
    fr(`Desfazer de novo: desempilha "${u2}". Cada desfazer é um pop: O(1).`);
    const r1 = refazer.pop(); desfazer.push(r1);
    fr(`Refazer: "${r1}" volta para a pilha de desfazer. Refazer é o caminho inverso.`);
    return Q;
  }
  function desenhaUndo(ctx, w, h, q) {
    limpa(ctx, w, h);
    const colunas = [{ nome: 'desfazer', pilha: q.und, x: w * 0.25 }, { nome: 'refazer', pilha: q.ref, x: w * 0.7 }];
    colunas.forEach(c => {
      rotulo(ctx, c.nome, c.x - 50, 22, CORES.mudo);
      c.pilha.forEach((v, k) => {
        const topo = k === c.pilha.length - 1;
        caixa(ctx, c.x - 60, h - 24 - (k + 1) * 38, 120, 32, topo ? ESTILO.azul : ESTILO.normal, v);
      });
      if (!c.pilha.length) rotulo(ctx, 'vazia', c.x - 20, h - 40, CORES.mudo);
    });
  }

  /* ---------- 6) Rehash: a tabela cresce quando o fator de carga passa de 0,75 ---------- */
  function geraRehash() {
    let cap = 4, b = Array.from({ length: cap }, () => []), n = 0;
    const Q = [];
    const fr = (t, hl) => Q.push({ cap, b: b.map(x => x.slice()), n, hl, t });
    fr('Tabela hash com 4 baldes e encadeamento. Regra: se o fator de carga α = n / capacidade passar de 0,75, a tabela dobra e tudo é reinserido.');
    const chaves = [10, 21, 3, 7, 14];
    for (const k of chaves) {
      const idx = k % cap;
      b[idx].push(k); n++;
      fr(`Inserir ${k}: ${k} mod ${cap} = ${idx}. n = ${n}, α = ${n}/${cap} = ${(n / cap).toFixed(2)}.`, { bal: idx });
      if (n / cap > 0.75) {
        const antiga = cap;
        cap *= 2;
        const nova = Array.from({ length: cap }, () => []);
        for (const lista of b) for (const x of lista) nova[x % cap].push(x);
        b = nova;
        fr(`α = ${(n / antiga).toFixed(2)} > 0,75: rehash. A capacidade passa de ${antiga} para ${cap} e cada chave é recalculada com mod ${cap}.`, { reh: true });
      }
    }
    fr('Por isso a média continua O(1): o custo do rehash, O(n), é dividido entre as inserções que o causaram (amortizado).');
    return Q;
  }
  function desenhaRehash(ctx, w, h, q) {
    limpa(ctx, w, h);
    const linha = Math.min(34, (h - 40) / q.cap), x0 = 80;
    for (let k = 0; k < q.cap; k++) {
      const y = 24 + k * linha;
      caixa(ctx, 14, y, 52, linha - 6, q.bal === k ? ESTILO.hl : ESTILO.normal, String(k));
      q.b[k].forEach((v, j) => caixa(ctx, x0 + j * 62, y, 56, linha - 6, q.reh ? ESTILO.ok : ESTILO.azul, String(v)));
    }
    rotulo(ctx, `n = ${q.n} · capacidade = ${q.cap} · α = ${(q.n / q.cap).toFixed(2)}`, 16, h - 12);
  }

  /* ---------- 7) Remoção com sucessor em uma BST ---------- */
  function insere(r, v) {
    if (!r) return { v, l: null, r: null };
    if (v < r.v) r.l = insere(r.l, v); else if (v > r.v) r.r = insere(r.r, v);
    return r;
  }
  function geraRemocao() {
    let raiz = null;
    [50, 30, 70, 20, 40, 60, 80, 35].forEach(v => { raiz = insere(raiz, v); });
    const Q = [];
    const snap = (t, hl, vis) => Q.push({ root: ED.copiaNo(raiz), hl: hl === undefined ? null : hl, vis: vis || [], t });
    snap('Remover 30 da BST. O nó 30 tem dois filhos (20 e 40), então não basta ligar o filho no lugar dele.');
    snap('Passo 1: procurar 30. 30 < 50: desce à esquerda. Encontrado.', 50);
    snap('Passo 2: como 30 tem dois filhos, o substituto é o sucessor em ordem: o menor valor da subárvore direita.', 30);
    snap('Vá à direita (40). Depois, enquanto houver filho à esquerda, desça por ele.', 40);
    snap('O menor valor da direita de 30 é 35: o sucessor. 35 não tem filho à esquerda.', 35);
    const no30 = raiz.l, no40 = no30.r, no35 = no40.l;
    no30.v = no35.v;
    snap('Copia o valor 35 para o nó 30. A posição agora tem o valor certo para a ordem da árvore.', 30);
    no40.l = null;
    snap('Remove o sucessor 35 da posição original. Ele é folha, então basta desligá-lo. A árvore continua em ordem.', 40);
    snap('Pronto: em ordem, a árvore segue 20, 35, 40, 50, 60, 70, 80. Custo O(h), igual a uma busca.', null, [20, 35, 40, 50, 60, 70, 80]);
    return Q;
  }
  function desenhaRemocao(ctx, w, h, q) { ED.desenhaArvore(ctx, w, h, q); }

  /* ---------- 8) Ordenação topológica (algoritmo de Kahn) ---------- */
  const TOPO_NOS = { 0: [0.08, 0.5], 1: [0.45, 0.15], 2: [0.45, 0.85], 3: [0.88, 0.5] };
  const TOPO_ARCOS = [[0, 1], [0, 2], [1, 3], [2, 3]];
  function geraKahn() {
    const grau = [0, 0, 0, 0];
    TOPO_ARCOS.forEach(([, v]) => grau[v]++);
    const fila = [], ordem = [], feito = [false, false, false, false], Q = [];
    const fr = (t, extra) => Q.push(Object.assign({ grau: grau.slice(), fila: fila.slice(), ordem: ordem.slice(), feito: feito.slice(), u: -1, aresta: null, t }, extra || {}));
    fr('Kahn: a grau de entrada de cada vértice é o número de arestas que chegam nele. Vértices com grau 0 não têm dependências e podem começar.');
    for (let v = 0; v < 4; v++) if (grau[v] === 0) fila.push(v);
    fr(`Fila inicial: os vértices de grau 0 (${fila.join(', ')}).`);
    while (fila.length) {
      const u = fila.shift();
      ordem.push(u); feito[u] = true;
      fr(`Retira ${u} da fila e o coloca na ordem. Ele não tem mais dependências pendentes.`, { u });
      for (const [a, b] of TOPO_ARCOS.filter(x => x[0] === u)) {
        grau[b]--;
        fr(`Remove a aresta ${a} → ${b}: o grau de ${b} cai para ${grau[b]}.`, { u, aresta: [a, b] });
        if (grau[b] === 0) { fila.push(b); fr(`${b} ficou com grau 0: entra na fila.`, { u }); }
      }
    }
    fr(`Ordem topológica: ${ordem.join(' → ')}. Se a ordem tivesse menos vértices que o grafo, sobraria um ciclo.`);
    return Q;
  }
  function desenhaKahn(ctx, w, h, q) {
    limpa(ctx, w, h);
    const P = k => ({ x: 40 + TOPO_NOS[k][0] * (w - 80), y: 24 + TOPO_NOS[k][1] * (h - 90) });
    TOPO_ARCOS.forEach(([a, b]) => {
      const pa = P(a), pb = P(b);
      const usada = q.aresta && q.aresta[0] === a && q.aresta[1] === b;
      AH.arrow(ctx, pa.x + 20, pa.y, pb.x - 22, pb.y, usada ? CORES.hlBorda : 'rgba(148,163,184,.55)', 8);
    });
    for (let k = 0; k < 4; k++) {
      const p = P(k);
      const st = q.feito[k] ? ESTILO.ok : (q.u === k ? ESTILO.hl : ESTILO.normal);
      caixa(ctx, p.x - 22, p.y - 22, 44, 44, st, String(k));
      rotulo(ctx, 'grau ' + q.grau[k], p.x, p.y + 36, CORES.azulBorda, 'center');
    }
    rotulo(ctx, 'fila: [' + q.fila.join(', ') + ']', 16, h - 14);
  }

  /* ---------- 9) Union-find: união e busca com compressão de caminho ---------- */
  function geraUnionFind() {
    const pai = [0, 1, 2, 3, 4, 5], Q = [];
    const fr = (t, hl) => Q.push({ pai: pai.slice(), hl: hl || [], t });
    const achar = x => { while (pai[x] !== x) x = pai[x]; return x; };
    fr('Union-find: cada vértice começa como raiz de si mesmo. pai[x] aponta para o representante do seu conjunto.');
    const une = (a, b) => {
      const ra = achar(a), rb = achar(b);
      pai[ra] = rb;
      fr(`union(${a}, ${b}): raiz de ${a} é ${ra}, raiz de ${b} é ${rb}. Liga ${ra} a ${rb}.`, [ra, rb]);
    };
    une(0, 1); une(2, 3); une(1, 3);
    const x = 0;
    const path = []; let y = x;
    while (pai[y] !== y) { path.push(y); y = pai[y]; }
    fr(`find(0): sobe a cadeia 0 → ${path.slice(1).concat([y]).join(' → ')}, até a raiz ${y}.`, path);
    for (const p of path) pai[p] = y;
    fr(`Compressão de caminho: todos os nós do caminho passam a apontar direto para a raiz ${y}. Próximas buscas ficam quase O(1).`, path);
    fr('Com união por tamanho ou por rank e compressão, as operações ficam quase constantes: O(α(n)), a inversa de Ackermann.');
    return Q;
  }
  function desenhaUnionFind(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.pai.length, cw = Math.min(70, (w - 40) / n), x0 = (w - cw * n) / 2, y = h * 0.3, ch = 50;
    rotulo(ctx, 'vértice', 16, y - 18, CORES.mudo);
    q.pai.forEach((p, k) => caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, q.hl.includes(k) || q.hl.includes(p) ? ESTILO.hl : ESTILO.normal, 'pai ' + p, String(k)));
    const raizes = q.pai.map((p, k) => (p === k ? k : null)).filter(v => v !== null);
    rotulo(ctx, 'raízes: ' + raizes.join(', ') + ' · conjuntos: ' + raizes.length, 16, h - 16, CORES.okBorda);
  }

  /* ---------- 10) Backtracking: 4 rainhas ---------- */
  function geraRainhas() {
    const N = 4, Q = [], col = [];
    const ataca = (r, c) => col.some((cc, rr) => cc === c || Math.abs(cc - c) === Math.abs(rr - r));
    const fr = (t, hl) => Q.push({ col: col.slice(), hl: hl || null, t });
    fr('Backtracking: coloca uma rainha por linha. Se uma posição é inválida, testamos a próxima; se não há opção, voltamos (desfazemos) a rainha anterior.');
    function tenta(r) {
      if (r === N) { fr('Solução completa: 4 rainhas sem ataque. Esta é uma das 2 soluções do tabuleiro 4 × 4.'); return true; }
      let achou = false;
      for (let c = 0; c < N; c++) {
        if (ataca(r, c)) { fr(`Linha ${r}, coluna ${c}: ataca uma rainha anterior. Poda: não desce por este ramo.`, { r, c }); continue; }
        col[r] = c;
        fr(`Linha ${r}: coloca a rainha na coluna ${c}. Nenhuma rainha anterior ataca esta casa.`, { r, c });
        if (tenta(r + 1)) achou = true;
        col.length = r;
        fr(`Volta da linha ${r} (backtrack): retira a rainha da coluna ${c} para testar outra.`, { r, c });
      }
      return achou;
    }
    tenta(0);
    return Q;
  }
  function desenhaRainhas(ctx, w, h, q) {
    limpa(ctx, w, h);
    const N = 4, cs = Math.min(56, (h - 40) / N), x0 = (w - cs * N) / 2, y0 = 20;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const hl = q.hl && q.hl.r === r && q.hl.c === c;
      const tem = q.col[r] === c;
      const st = hl ? ESTILO.hl : (tem ? ESTILO.ok : ESTILO.normal);
      caixa(ctx, x0 + c * cs + 2, y0 + r * cs + 2, cs - 4, cs - 4, st, tem ? 'Q' : '');
    }
    rotulo(ctx, 'rainhas colocadas: ' + q.col.length + ' de 4', 16, h - 12);
  }

  /* ---------- 11) Programação dinâmica: escadas ---------- */
  function geraEscadas() {
    const N = 6, f = [1, 1], Q = [];
    const fr = (t, hl, src) => Q.push({ f: f.slice(), hl, src, t });
    fr('Escadas: de quantas formas subir n degraus andando 1 ou 2 por vez? f(0) = 1, f(1) = 1. Para n ≥ 2, cada resposta depende só das duas anteriores.');
    for (let i = 2; i <= N; i++) {
      f[i] = f[i - 1] + f[i - 2];
      fr(`f(${i}) = f(${i - 1}) + f(${i - 2}) = ${f[i - 1]} + ${f[i - 2]} = ${f[i]}. Cada subproblema é calculado uma vez e guardado.`, i, [i - 1, i - 2]);
    }
    fr(`Tabela pronta: f(${N}) = ${f[N]}. Sem a tabela, a recursão repetiria os mesmos subproblemas e custaria O(2ⁿ). Com a tabela, O(n).`);
    return Q;
  }
  function desenhaEscadas(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.f.length, cw = Math.min(70, (w - 40) / 7), x0 = (w - cw * 7) / 2, y = h * 0.3, ch = 52;
    for (let i = 0; i < 7; i++) {
      const v = q.f[i];
      const st = i === q.hl ? ESTILO.hl : (q.src && q.src.includes(i) ? ESTILO.azul : (v === undefined ? ESTILO.apag : ESTILO.normal));
      caixa(ctx, x0 + i * cw + 3, y, cw - 6, ch, st, v === undefined ? '' : String(v), 'f(' + i + ')');
    }
  }

  /* ---------- 12) Guloso: troco com moedas canônicas ---------- */
  function geraGuloso() {
    const moedas = [25, 10, 5, 1];
    let valor = 68;
    const pego = [], Q = [];
    const fr = (t, hl) => Q.push({ valor, pego: pego.slice(), hl, moedas, t });
    fr(`Troco de ${valor} centavos com as moedas ${moedas.join(', ')}. Estratégia gulosa: a cada passo, pegue a maior moeda que cabe.`);
    for (const m of moedas) {
      while (valor >= m) {
        valor -= m;
        pego.push(m);
        fr(`${m} cabe em ${valor + m}: pega uma moeda de ${m}. Restam ${valor}.`, m);
      }
      fr(`A moeda ${m} não cabe mais em ${valor}: passa para a próxima moeda.`, null);
    }
    fr(`Total: ${pego.length} moedas. O guloso é ótimo neste sistema de moedas. Com moedas 1, 3 e 4 para o troco de 6, ele dá 4+1+1 (3 moedas), mas 3+3 usa 2.`);
    return Q;
  }
  function desenhaGuloso(ctx, w, h, q) {
    limpa(ctx, w, h);
    rotulo(ctx, `valor restante: ${q.valor}`, 16, 18, CORES.azulBorda);
    const cs = Math.min(64, (w - 40) / Math.max(q.pego.length, 6));
    q.pego.forEach((m, k) => caixa(ctx, 20 + k * cs + 2, 46, cs - 4, 44, k === q.pego.length - 1 && q.hl ? ESTILO.ok : ESTILO.normal, String(m)));
    const bar = (w - 40) * (q.valor / 68);
    AH.roundRect(ctx, 20, h - 46, Math.max(4, bar), 22, 6);
    ctx.fillStyle = 'rgba(56,189,248,.55)'; ctx.fill();
    ctx.strokeStyle = CORES.azulBorda; ctx.lineWidth = 1.5; ctx.stroke();
    rotulo(ctx, 'restante', 20, h - 56);
  }

  global.CONC = {
    geraEndereco, desenhaEndereco,
    geraTransposta, desenhaTransposta,
    geraLowerBound, desenhaLowerBound,
    geraDeque, desenhaDeque,
    geraUndo, desenhaUndo,
    geraRehash, desenhaRehash,
    geraRemocao, desenhaRemocao,
    geraKahn, desenhaKahn,
    geraUnionFind, desenhaUnionFind,
    geraRainhas, desenhaRainhas,
    geraEscadas, desenhaEscadas,
    geraGuloso, desenhaGuloso
  };
})(window);
