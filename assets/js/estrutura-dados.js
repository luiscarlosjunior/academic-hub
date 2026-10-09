/* =====================================================================
   Estrutura de Dados — biblioteca de animações e visualizações
   Usada pelas páginas de tópico em disciplinas/estrutura-dados/topicos/.
   Depende de assets/js/hub.js (canvas, setas e retângulos arredondados).
   Expõe tudo em window.ED.
   ===================================================================== */
(function (global) {
  'use strict;'.replace(';','');

  'use strict';

  /* ===================================================================
     Paleta e estilos das caixas e barras nas animações
     =================================================================== */
  const CORES = {
    txt: '#e2e8f0', mudo: '#64748b',
    azulBorda: '#38bdf8', okBorda: '#10b981', hlBorda: '#f59e0b', erroBorda: '#f43f5e'
  };
  const ESTILO = {
    normal: { fill: '#1e293b', borda: 'rgba(148,163,184,.45)', txt: CORES.txt },
    hl:     { fill: 'rgba(245,158,11,.35)', borda: CORES.hlBorda, lw: 2.5, txt: '#fef3c7' },
    ok:     { fill: 'rgba(16,185,129,.30)', borda: CORES.okBorda, lw: 2, txt: '#d1fae5' },
    erro:   { fill: 'rgba(244,63,94,.30)', borda: CORES.erroBorda, lw: 2.5, txt: '#ffe4e6' },
    azul:   { fill: 'rgba(56,189,248,.25)', borda: CORES.azulBorda, lw: 2, txt: '#e0f2fe' },
    apag:   { fill: '#0f172a', borda: 'rgba(100,116,139,.25)', txt: '#475569' }
  };

  /* ===================================================================
     Primitivas de desenho
     =================================================================== */
  function limpa(ctx, w, h) {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);
  }

  function caixa(ctx, x, y, w, h, s, texto, rot) {
    AH.roundRect(ctx, x, y, w, h, 8);
    ctx.fillStyle = s.fill; ctx.fill();
    ctx.strokeStyle = s.borda; ctx.lineWidth = s.lw || 1.5; ctx.stroke();
    ctx.fillStyle = s.txt || CORES.txt;
    ctx.font = '600 13px "Fira Code", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(texto, x + w / 2, y + h / 2);
    if (rot !== undefined && rot !== null) {
      ctx.fillStyle = CORES.mudo;
      ctx.font = '11px "Fira Code", monospace';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(rot), x + w / 2, y + h + 16);
    }
  }

  function rotulo(ctx, texto, x, y, cor, alinh) {
    ctx.fillStyle = cor || CORES.mudo;
    ctx.font = '600 11px Inter, system-ui, sans-serif';
    ctx.textAlign = alinh || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, x, y);
  }

  /* ===================================================================
     Motor de animação: quadros pré-calculados + controles + legenda.
     Cada quadro tem um texto explicativo (campo t) exibido abaixo do canvas.
     =================================================================== */
  function criaAnimacao(cfg) {
    const ctl = document.getElementById(cfg.ctl);
    const cap = document.getElementById(cfg.cap);
    let quadros = [], i = 0, timer = null;
    let opcao = cfg.opcoes ? cfg.opcoes[0].v : null;

    const cv = AH.canvas(cfg.canvas, (ctx, w, h) => {
      if (quadros.length) cfg.desenha(ctx, w, h, quadros[i]);
    });

    ctl.innerHTML = `
      <div class="flex flex-wrap items-center gap-2">
        <button class="ah-btn ah-btn-ghost" data-a="ini" title="Voltar ao início" aria-label="Voltar ao início"><i class="fa-solid fa-backward-step"></i></button>
        <button class="ah-btn ah-btn-ghost" data-a="ant" title="Passo anterior" aria-label="Passo anterior"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="ah-btn ah-btn-primary" data-a="play" title="Reproduzir" aria-label="Reproduzir"><i class="fa-solid fa-play"></i></button>
        <button class="ah-btn ah-btn-ghost" data-a="prox" title="Próximo passo" aria-label="Próximo passo"><i class="fa-solid fa-chevron-right"></i></button>
        <button class="ah-btn ah-btn-ghost" data-a="fim" title="Ir ao fim" aria-label="Ir ao fim"><i class="fa-solid fa-forward-step"></i></button>
        <span class="text-xs font-mono text-slate-400" data-a="cont"></span>
        ${cfg.opcoes ? `<select data-a="op" class="ah-input ml-auto text-xs" style="width:auto" aria-label="Escolher cenário">${cfg.opcoes.map(o => `<option value="${o.v}">${o.rotulo}</option>`).join('')}</select>` : ''}
      </div>`;

    const btn = a => ctl.querySelector(`[data-a="${a}"]`);
    const botaoPlay = btn('play');
    const contador = btn('cont');

    function render() {
      i = Math.max(0, Math.min(quadros.length - 1, i));
      const q = quadros[i];
      /* Só desenha com largura real: antes do layout o canvas ainda mede 0 */
      if (cv.w >= 120) cfg.desenha(cv.ctx, cv.w, cv.h, q);
      cap.innerHTML = q.t;
      contador.textContent = 'Passo ' + (i + 1) + ' de ' + quadros.length;
    }

    function para() {
      clearInterval(timer); timer = null;
      botaoPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
      botaoPlay.title = 'Reproduzir';
    }

    function reproduz() {
      if (timer) return para();
      if (i >= quadros.length - 1) i = 0;
      botaoPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
      botaoPlay.title = 'Pausar';
      timer = setInterval(() => {
        if (i >= quadros.length - 1) { para(); return; }
        i++; render();
      }, cfg.velocidade || 1600);
      render();
    }

    ctl.addEventListener('click', e => {
      const b = e.target.closest('button[data-a]');
      if (!b) return;
      const a = b.getAttribute('data-a');
      if (a === 'play') return reproduz();
      para();
      if (a === 'ini') i = 0;
      if (a === 'ant') i--;
      if (a === 'prox') i++;
      if (a === 'fim') i = quadros.length - 1;
      render();
    });

    const sel = btn('op');
    if (sel) sel.addEventListener('change', () => { para(); opcao = sel.value; carrega(); });

    function carrega() {
      quadros = cfg.gera(opcao);
      i = 0;
      render();
    }
    carrega();
    /* Após o layout (fontes e CSS carregados), mede o canvas de novo e redesenha */
    window.addEventListener('load', () => { cv.fit(true); render(); });
  }

  /* ===================================================================
     1. VETORES
     =================================================================== */
  function geraVetor(op) {
    const Q = [];
    const base = [4, 8, 15, 16, 23, 42];
    const fr = (a, extra) => Object.assign({ a: a.slice(), hl: [], est: null, t: '' }, extra);

    if (op === 'acesso') {
      Q.push(fr(base, { t: 'Vetor com n = 6 elementos, índices de 0 a 5. Cada posição ocupa o mesmo espaço na memória, em sequência.' }));
      Q.push(fr(base, { hl: [3], est: ESTILO.azul, t: '<code>arr[3]</code> é calculado como <em>base + 3 × tamanho</em>. Uma única conta leva direto ao valor 16: <strong>O(1)</strong>, qualquer que seja n.' }));
      Q.push(fr(base, { t: 'Agora buscamos o <em>valor</em> 23, sem saber o índice. Não há fórmula: é preciso olhar um por um.' }));
      for (let k = 0; k <= 4; k++) {
        const achou = base[k] === 23;
        Q.push(fr(base, {
          hl: [k], est: achou ? ESTILO.ok : ESTILO.hl,
          t: `Comparamos ${base[k]} com 23: ${achou ? '<strong>igual</strong>. Encontrado no índice ' + k + '.' : 'diferente, seguimos para o próximo índice.'}`
        }));
        if (achou) break;
      }
      Q.push(fr(base, { t: 'Resumo: acesso por índice O(1); busca por valor O(n) em vetor não ordenado, no pior caso percorrendo todo o vetor.' }));
    } else if (op === 'insercao') {
      Q.push(fr(base, { t: 'Vamos inserir o valor <code>10</code> na posição 2. Os elementos a partir do índice 2 precisam andar uma casa para a direita, para abrir espaço.' }));
      const s = base.slice(); s.push(null);
      Q.push(fr(s, { hl: [6], est: ESTILO.azul, t: 'Primeiro, criamos uma posição livre no fim (em C, isso exige <code>realloc</code> se o vetor estiver cheio).' }));
      for (let j = s.length - 1; j > 2; j--) {
        s[j] = s[j - 1];
        Q.push(fr(s, { hl: [j], est: ESTILO.azul, t: `Copia <code>${s[j]}</code> do índice ${j - 1} para o índice ${j}. Trabalhamos de trás para frente, para não sobrescrever valores.` }));
      }
      s[2] = 10;
      Q.push(fr(s, { hl: [2], est: ESTILO.ok, t: `Escreve <code>10</code> no índice 2. Vetor agora: [${s.join(', ')}]. Custo: O(n) no pior caso, porque podem ser deslocados todos os elementos.` }));
    } else {
      const s = base.slice();
      Q.push(fr(s, { hl: [1], est: ESTILO.erro, t: 'Vamos remover o valor do índice 1 (o 8). Para não deixar um buraco, os elementos à direita precisam andar uma casa para a esquerda.' }));
      for (let j = 1; j < s.length - 1; j++) {
        s[j] = s[j + 1];
        Q.push(fr(s, { hl: [j], est: ESTILO.azul, t: `Copia <code>${s[j]}</code> do índice ${j + 1} para o índice ${j}.` }));
      }
      Q.push(fr(s, { hl: [s.length - 1], est: ESTILO.erro, t: 'O último valor sobra duplicado. A região válida agora termina no índice ' + (s.length - 2) + ', e o tamanho lógico diminui em 1.' }));
      const fim = s.slice(0, -1);
      Q.push(fr(fim, { t: `Remoção concluída: [${fim.join(', ')}]. Remover no início ou no meio custa O(n); remover no fim custa O(1).` }));
    }
    return Q;
  }

  function desenhaVetor(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.a.length;
    const cw = Math.min(72, (w - 40) / n), ch = 56;
    const x0 = (w - cw * n) / 2, y = h * 0.3;
    q.a.forEach((v, k) => {
      let s = ESTILO.normal;
      if (v === null) s = ESTILO.apag;
      if (q.hl.includes(k)) s = q.est || ESTILO.hl;
      caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, s, v === null ? '' : String(v), k);
    });
    rotulo(ctx, 'índices', x0, y + ch + 44);
  }

  /* ===================================================================
     2. MATRIZES
     =================================================================== */
  const MAT = [[3, 1, 4, 1], [5, 9, 2, 6], [5, 3, 5, 8]];
  const FLAT = MAT.flat();

  function geraMatriz(modo) {
    const R = MAT.length, C = MAT[0].length, Q = [], vis = [], ordem = [];
    if (modo === 'linha') {
      for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) ordem.push([i, j]);
    } else {
      for (let j = 0; j < C; j++) for (let i = 0; i < R; i++) ordem.push([i, j]);
    }
    Q.push({ i: -1, j: -1, k: -1, vis: [], t: modo === 'linha'
      ? '<strong>Percurso por linhas</strong>: M[0][0], M[0][1], …. Na memória, as posições k visitadas são 0, 1, 2, … (vizinhas). É o padrão que aproveita o cache.'
      : `<strong>Percurso por colunas</strong>: M[0][0], M[1][0], M[2][0], …. Os saltos na memória são de ${C} posições, e a localidade piora.` });
    for (const [i, j] of ordem) {
      const k = i * C + j;
      Q.push({ i, j, k, vis: [...vis], t: `Acessando M[${i}][${j}] = <strong>${MAT[i][j]}</strong>. Posição linear: k = ${i} × ${C} + ${j} = <strong>${k}</strong>.` });
      vis.push(k);
    }
    Q.push({ i: -1, j: -1, k: -1, vis: [...vis], t: 'Fim: as 12 posições foram visitadas. Acessar M[i][j] é O(1), porque basta calcular k. Percorrer tudo custa O(n × m).' });
    return Q;
  }

  function desenhaMatriz(ctx, w, h, q) {
    limpa(ctx, w, h);
    const R = MAT.length, C = MAT[0].length;
    const cs = Math.min(58, (w - 40) / C);
    const gx = (w - cs * C) / 2, gy = 14;
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
      const k = i * C + j;
      let s = ESTILO.normal;
      if (q.vis.includes(k)) s = ESTILO.azul;
      if (q.i === i && q.j === j) s = ESTILO.hl;
      caixa(ctx, gx + j * cs + 3, gy + i * cs + 3, cs - 6, cs - 6, s, String(MAT[i][j]));
    }
    const ss = Math.min(44, (w - 40) / FLAT.length);
    const sx = (w - ss * FLAT.length) / 2, sy = h - ss - 30;
    rotulo(ctx, 'memória (linear)', sx, sy - 14);
    FLAT.forEach((v, k) => {
      let s = ESTILO.normal;
      if (q.vis.includes(k)) s = ESTILO.azul;
      if (q.k === k) s = ESTILO.hl;
      caixa(ctx, sx + k * ss + 2, sy, ss - 4, ss, s, String(v), k);
    });
  }

  /* ===================================================================
     3. ORDENAÇÃO
     =================================================================== */
  const BASE_ORD = [29, 10, 14, 37, 13, 5, 42, 8];

  function geraOrd(alg) {
    const a = BASE_ORD.slice(), n = a.length, Q = [], fx = new Set();
    let cmp = 0;
    const fr = (hl, t, extra) => Q.push(Object.assign({ a: a.slice(), hl, fix: [...fx], cmp, pivo: -1, t }, extra || {}));

    if (alg === 'bolha') {
      fr([], `<strong>Ordenação por bolha</strong>: percorre o vetor comparando vizinhos e troca os que estão fora de ordem. Ao fim de cada passagem, o maior valor restante “flutua” até a posição final. Vetor inicial: [${a.join(', ')}].`);
      for (let p = 0; p < n - 1; p++) {
        let trocou = false;
        for (let j = 0; j < n - 1 - p; j++) {
          cmp++;
          const fora = a[j] > a[j + 1];
          fr([j, j + 1], `Compara <code>${a[j]}</code> com <code>${a[j + 1]}</code>. ${fora ? 'Estão fora de ordem: vamos trocar.' : 'Já estão em ordem: nada muda.'}`);
          if (fora) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            trocou = true;
            fr([j, j + 1], `Troca feita: <code>${a[j]}</code> fica à esquerda e <code>${a[j + 1]}</code> à direita.`);
          }
        }
        fx.add(n - 1 - p);
        fr([], `Fim da passagem ${p + 1}: o valor ${a[n - 1 - p]} está na posição definitiva ${n - 1 - p}.`);
        if (!trocou) break;
      }
    } else if (alg === 'insercao') {
      fr([0], '<strong>Ordenação por inserção</strong>: como organizar cartas na mão. A parte à esquerda já está ordenada; pegamos o próximo valor e o encaixamos no lugar certo.');
      fx.add(0);
      for (let i = 1; i < n; i++) {
        const chave = a[i];
        let k = i;
        fr([i], `Pegar <code>${chave}</code> e inseri-lo na parte ordenada [0..${i - 1}].`);
        while (k > 0 && a[k - 1] > chave) {
          cmp++;
          const v = a[k - 1];
          a[k] = v; k--;
          fr([k, k + 1], `<code>${v}</code> &gt; <code>${chave}</code>: <code>${v}</code> desloca uma casa para a direita.`);
        }
        if (k > 0) cmp++;
        a[k] = chave;
        fx.clear();
        for (let z = 0; z <= i; z++) fx.add(z);
        fr([k], `<code>${chave}</code> vai para a posição ${k}. O prefixo [0..${i}] agora está ordenado.`);
      }
    } else {
      fr([], '<strong>Quicksort</strong> (partição de Lomuto): escolhe um pivô e coloca os menores à esquerda e os maiores à direita. O pivô fica na posição definitiva. Depois, o mesmo é feito em cada lado.');
      const qs = (lo, hi) => {
        if (lo > hi) return;
        if (lo === hi) { fx.add(lo); fr([lo], `Subvetor com um único elemento (${a[lo]}): já está no lugar.`); return; }
        const p = a[hi];
        let i = lo;
        fr([hi], `Pivô = <code>${p}</code>, o último elemento de [${lo}..${hi}].`, { pivo: hi });
        for (let j = lo; j < hi; j++) {
          cmp++;
          const menor = a[j] < p;
          fr([j, hi], `<code>${a[j]}</code> ${menor ? '&lt;' : '&ge;'} ${p}: ${menor ? 'vai para a região dos menores.' : 'fica do lado dos maiores.'}`, { pivo: hi });
          if (menor) {
            if (i !== j) {
              [a[i], a[j]] = [a[j], a[i]];
              fr([i, j], `Troca as posições ${i} e ${j}. Agora a região dos menores cresce.`, { pivo: hi });
            }
            i++;
          }
        }
        [a[i], a[hi]] = [a[hi], a[i]];
        fx.add(i);
        fr([i], `O pivô ${p} vai para a posição final ${i}: à esquerda ficam os menores, à direita, os maiores.`);
        qs(lo, i - 1);
        qs(i + 1, hi);
      };
      qs(0, n - 1);
    }
    for (let k = 0; k < n; k++) fx.add(k);
    fr([], `Vetor ordenado: [${a.join(', ')}]. Total de comparações: ${cmp}.`);
    return Q;
  }

  function desenhaOrd(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.a.length, bw = (w - 40) / n, base = h - 34, escala = (h - 84) / 42;
    q.a.forEach((v, k) => {
      const bh = v * escala, x = 20 + k * bw + bw * 0.15, larg = bw * 0.7;
      let s = ESTILO.normal;
      if (q.fix.includes(k)) s = ESTILO.ok;
      if (q.hl.includes(k)) s = ESTILO.hl;
      if (q.pivo === k) s = ESTILO.erro;
      AH.roundRect(ctx, x, base - bh, larg, bh, 4);
      ctx.fillStyle = s.fill; ctx.fill();
      ctx.strokeStyle = s.borda; ctx.lineWidth = s.lw || 1.2; ctx.stroke();
      ctx.fillStyle = CORES.txt;
      ctx.font = '600 11px "Fira Code", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(String(v), x + larg / 2, base - bh - 4);
      ctx.fillStyle = CORES.mudo; ctx.textBaseline = 'top';
      ctx.fillText(String(k), x + larg / 2, base + 6);
    });
    rotulo(ctx, 'comparações: ' + q.cmp, 16, 14, CORES.azulBorda);
  }

  /* ===================================================================
     4. BUSCA BINÁRIA
     =================================================================== */
  const ORD_ARR = [3, 7, 11, 15, 19, 24, 28, 33, 41, 47, 52, 60];

  function geraBusca(valor) {
    const alvo = Number(valor), a = ORD_ARR, Q = [];
    let lo = 0, hi = a.length - 1, passo = 0;
    Q.push({ a, lo, hi, mid: -1, achou: false, t: `Procuramos <code>${alvo}</code> em um vetor <strong>ordenado</strong> de n = ${a.length}. Pré-condição: sem ordem, descartar metades pode eliminar o alvo.` });
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      passo++;
      Q.push({ a, lo, hi, mid, achou: false, t: `Passo ${passo}: intervalo [${lo}..${hi}], meio = índice ${mid} (valor ${a[mid]}). Comparamos ${a[mid]} com ${alvo}.` });
      if (a[mid] === alvo) {
        Q.push({ a, lo, hi, mid, achou: true, t: `<strong>Encontrado</strong> no índice ${mid}, em ${passo} comparação(ões). A busca linear poderia precisar de até ${a.length}.` });
        return Q;
      }
      if (a[mid] < alvo) {
        lo = mid + 1;
        Q.push({ a, lo, hi, mid: -1, achou: false, t: `${a[mid]} &lt; ${alvo}: a metade esquerda, com o meio, é descartada. Novo intervalo: [${lo}..${hi}].` });
      } else {
        hi = mid - 1;
        Q.push({ a, lo, hi, mid: -1, achou: false, t: `${a[mid]} &gt; ${alvo}: a metade direita, com o meio, é descartada. Novo intervalo: [${lo}..${hi}].` });
      }
    }
    Q.push({ a, lo: 0, hi: -1, mid: -1, achou: false, t: `Intervalo vazio: ${alvo} não está no vetor. Foram ${passo} comparações. Para n = 12, o máximo é ⌊log₂ 12⌋ + 1 = 4.` });
    return Q;
  }

  function desenhaBusca(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.a.length, cw = Math.min(62, (w - 40) / n), x0 = (w - cw * n) / 2, y = h * 0.28, ch = 52;
    q.a.forEach((v, k) => {
      const fora = k < q.lo || k > q.hi;
      let s = fora ? ESTILO.apag : ESTILO.normal;
      if (!fora && k === q.mid) s = q.achou ? ESTILO.ok : ESTILO.hl;
      caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, s, String(v), k);
    });
    if (q.lo <= q.hi) {
      rotulo(ctx, 'lo', x0 + q.lo * cw + cw / 2, y + ch + 40, CORES.azulBorda, 'center');
      rotulo(ctx, 'hi', x0 + q.hi * cw + cw / 2, y + ch + 58, CORES.erroBorda, 'center');
    }
  }

  /* ===================================================================
     5. FILA
     =================================================================== */
  function geraFila() {
    const Q = [], f = [];
    const push = (t, extra) => Q.push(Object.assign({ f: f.slice(), saiu: null, t }, extra || {}));
    push('Fila vazia. A regra é <strong>FIFO</strong>: quem entra primeiro sai primeiro, como numa fila de banco.');
    const ops = [['enq', 'A'], ['enq', 'B'], ['enq', 'C'], ['deq'], ['enq', 'D'], ['deq']];
    for (const op of ops) {
      if (op[0] === 'enq') {
        f.push(op[1]);
        push(`<strong>enqueue(${op[1]})</strong>: insere ${op[1]} no <strong>fim</strong> da fila. Custo O(1), com um ponteiro para o último elemento.`);
      } else {
        const saiu = f.shift();
        push(`<strong>dequeue()</strong> remove <code>${saiu}</code>, o elemento da <strong>frente</strong>. Custo O(1), com um ponteiro para o primeiro.`, { saiu });
      }
    }
    push(`Restam na fila: [${f.join(', ')}]. Em um vetor comum, remover do início custaria O(n), porque todos andariam uma casa. Por isso as implementações reais usam fila circular ou lista encadeada.`);
    return Q;
  }

  function desenhaFila(ctx, w, h, q) {
    limpa(ctx, w, h);
    const cw = Math.max(36, Math.min(78, (w - 150) / 6)), x0 = 130, y = h * 0.3, ch = 56;
    rotulo(ctx, 'removido', 14, y - 12);
    if (q.saiu !== null) caixa(ctx, 14, y, cw - 8, ch, ESTILO.erro, q.saiu);
    q.f.forEach((v, k) => {
      const s = k === 0 ? ESTILO.azul : (k === q.f.length - 1 ? ESTILO.ok : ESTILO.normal);
      caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, s, v);
    });
    if (q.f.length) {
      rotulo(ctx, 'frente', x0 + cw / 2, y + ch + 20, CORES.azulBorda, 'center');
      rotulo(ctx, 'fim', x0 + (q.f.length - 1) * cw + cw / 2, y + ch + 20, CORES.okBorda, 'center');
    } else {
      rotulo(ctx, 'fila vazia', x0, y + ch / 2);
    }
  }

  /* ===================================================================
     6. PILHA
     =================================================================== */
  function geraPilha(expr) {
    const Q = [], st = [], par = { ')': '(', ']': '[', '}': '{' };
    let ok = true;
    Q.push({ expr, idx: -1, st: [], res: null, t: `Verificar se <code>${expr}</code> está balanceada. Cada abertura é empilhada (<em>push</em>); cada fechamento precisa casar com o topo, que é desempilhado (<em>pop</em>).` });
    for (let k = 0; k < expr.length && ok; k++) {
      const c = expr[k];
      if ('([{'.includes(c)) {
        st.push(c);
        Q.push({ expr, idx: k, st: [...st], res: null, t: `<code>${c}</code> é abertura: <strong>push</strong>. O topo passa a ser <code>${c}</code>.` });
      } else {
        const topo = st[st.length - 1];
        if (topo === par[c]) {
          st.pop();
          Q.push({ expr, idx: k, st: [...st], res: 'ok', t: `<code>${c}</code> fecha <code>${topo}</code>, que está no topo: <strong>pop</strong>. O par casa.` });
        } else {
          ok = false;
          Q.push({ expr, idx: k, st: [...st], res: 'erro', t: `<code>${c}</code> fecha, mas o topo é ${topo === undefined ? 'vazio' : '<code>' + topo + '</code>'}. Os pares não casam.` });
        }
      }
    }
    const balanceada = ok && st.length === 0;
    Q.push({ expr, idx: -1, st: [...st], res: balanceada ? 'ok' : 'erro', t: `Resultado: <strong>${balanceada ? 'balanceada' : 'não balanceada'}</strong>. ${balanceada ? 'Cada abertura encontrou seu fechamento, na ordem certa.' : 'Ou um fechamento não casou com o topo, ou sobraram aberturas na pilha.'}` });
    return Q;
  }

  function desenhaPilha(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.expr.length, ss = Math.min(44, (w - 40) / n), sx = (w - ss * n) / 2, sy = 22;
    for (let k = 0; k < n; k++) {
      let s = ESTILO.normal;
      if (k === q.idx) s = q.res === 'erro' ? ESTILO.erro : (q.res === 'ok' ? ESTILO.ok : ESTILO.hl);
      caixa(ctx, sx + k * ss + 2, sy, ss - 4, ss - 4, s, q.expr[k]);
    }
    const pw = 96, px = (w - pw) / 2, ch = 36, base = h - 14;
    const topoY = base - Math.max(1, q.st.length) * (ch + 4);
    rotulo(ctx, 'pilha', w / 2, topoY - 14, CORES.mudo, 'center');
    q.st.forEach((c, k) => {
      const y = base - (k + 1) * (ch + 4);
      caixa(ctx, px, y, pw, ch, k === q.st.length - 1 ? ESTILO.azul : ESTILO.normal, c);
    });
    if (q.st.length) rotulo(ctx, '← topo', px + pw + 12, base - q.st.length * (ch + 4) + ch / 2, CORES.azulBorda);
    if (!q.st.length) rotulo(ctx, 'vazia', px + 4, base - ch / 2);
  }

  /* ===================================================================
     7. TABELA HASH
     =================================================================== */
  const HM = 5;
  const CHAVES = ['ana', 'bia', 'caio', 'dani', 'eva', 'fabio'];
  const somaCod = s => [...s].reduce((t, c) => t + c.charCodeAt(0), 0);

  function geraHash() {
    const Q = [], baldes = Array.from({ length: HM }, () => []);
    const push = (t, extra) => Q.push(Object.assign({ baldes: baldes.map(l => [...l]), b: -1, k: null, t }, extra || {}));
    push(`<strong>Tabela hash</strong>: a função <code>h(chave)</code> devolve o índice de um balde. Função didática: <code>h(s) = soma dos códigos dos caracteres mod ${HM}</code>.`);
    for (const c of CHAVES) {
      const soma = somaCod(c), b = soma % HM;
      push(`Calcular h("${c}"): soma = ${soma}; ${soma} mod ${HM} = <strong>${b}</strong>. Vamos ao balde ${b}.`, { b, k: c });
      if (baldes[b].length) {
        push(`<strong>Colisão</strong>: o balde ${b} já contém ${baldes[b].map(x => '"' + x + '"').join(', ')}. Com <em>encadeamento</em>, a nova chave entra na lista do balde.`, { b, k: c });
      }
      baldes[b].push(c);
      push(`"${c}" foi inserida no balde ${b}.`, { b, k: c });
    }
    const alvo = 'dani', ba = somaCod(alvo) % HM;
    push(`<strong>Busca</strong> de "${alvo}": h = ${ba}. Percorremos a lista do balde ${ba}, porque pode haver colisão.`, { b: ba, k: alvo });
    for (const x of baldes[ba]) {
      if (x === alvo) {
        push(`"${x}" = "${alvo}": <strong>encontrada</strong>. A busca custa O(1) em média, mais o tamanho da lista do balde.`, { b: ba, k: alvo });
        break;
      }
      push(`"${x}" ≠ "${alvo}": seguimos para o próximo elemento da lista.`, { b: ba, k: alvo });
    }
    push(`Fator de carga: α = n / M = ${CHAVES.length} / ${HM} = ${(CHAVES.length / HM).toFixed(2).replace('.', ',')}. Quando α cresce, a tabela é <strong>redimensionada</strong> (rehash), o que mantém as listas curtas e a média em O(1).`);
    return Q;
  }

  function desenhaHash(ctx, w, h, q) {
    limpa(ctx, w, h);
    const linha = (h - 44) / HM;
    const cw = Math.max(70, Math.min(110, (w - 120) / 3));
    for (let b = 0; b < HM; b++) {
      const cy = 12 + b * linha + linha / 2 - 18;
      caixa(ctx, 14, cy, 54, 36, q.b === b ? ESTILO.hl : ESTILO.normal, String(b));
      q.baldes[b].forEach((k, j) => {
        const x = 96 + j * cw;
        if (j > 0) AH.arrow(ctx, x - 16, cy + 18, x - 3, cy + 18, '#64748b', 6);
        caixa(ctx, x, cy, cw - 22, 36, q.k === k ? ESTILO.ok : ESTILO.azul, k);
      });
    }
    const n = q.baldes.flat().length;
    rotulo(ctx, `n = ${n} chaves · M = ${HM} baldes · α = ${(n / HM).toFixed(2).replace('.', ',')}`, 14, h - 14);
  }

  /* ===================================================================
     8. ÁRVORE BINÁRIA DE BUSCA
     =================================================================== */
  const SEQ_ARV = [50, 30, 70, 20, 40, 60, 80, 35];

  function copiaNo(no) {
    return no ? { v: no.v, l: copiaNo(no.l), r: copiaNo(no.r) } : null;
  }

  function altura(no) {
    return no ? 1 + Math.max(altura(no.l), altura(no.r)) : 0;
  }

  function geraArvore() {
    const Q = [];
    let raiz = null;
    const push = (t, extra) => Q.push(Object.assign({ root: copiaNo(raiz), hl: null, vis: [], t }, extra || {}));
    push('<strong>Árvore binária de busca</strong>: em cada nó, os valores menores ficam à esquerda e os maiores à direita. Cada comparação descarta uma subárvore inteira.');

    for (const x of SEQ_ARV) {
      if (!raiz) {
        raiz = { v: x, l: null, r: null };
        push(`Árvore vazia: <code>${x}</code> vira a raiz.`, { hl: x });
        continue;
      }
      let no = raiz;
      for (;;) {
        const dir = x < no.v ? 'l' : 'r';
        push(`Inserir ${x}: ${x} ${dir === 'l' ? '&lt;' : '&gt;'} ${no.v}, então vamos à subárvore ${dir === 'l' ? 'esquerda' : 'direita'} de ${no.v}.`, { hl: no.v });
        if (!no[dir]) {
          no[dir] = { v: x, l: null, r: null };
          push(`${x} vira o filho ${dir === 'l' ? 'esquerdo' : 'direito'} de ${no.v}: a posição estava livre.`, { hl: x });
          break;
        }
        no = no[dir];
      }
    }

    const em = [];
    (function ir(no) { if (!no) return; ir(no.l); em.push(no.v); ir(no.r); })(raiz);
    em.forEach((v, k) => push(`Percurso em-ordem, visita <code>${v}</code>. Sequência até aqui: ${em.slice(0, k + 1).join(', ')}. Em uma BST, o percurso em-ordem sempre sai ordenado.`, { hl: v, vis: em.slice(0, k + 1) }));

    const alt = altura(raiz);
    push(`Altura da árvore: ${alt - 1} arestas (${alt} níveis) para ${em.length} nós. Busca, inserção e remoção custam O(h). Com h ≈ log₂ n, temos O(log n). Se inserirmos 20, 30, 40 em ordem, a altura vira n − 1 e o custo volta a O(n): por isso existem árvores balanceadas.`, { vis: em });
    return Q;
  }

  function desenhaArvore(ctx, w, h, q) {
    limpa(ctx, w, h);
    const lista = [];
    (function ir(no, d) { if (!no) return; ir(no.l, d + 1); lista.push({ no, d }); ir(no.r, d + 1); })(q.root, 0);
    if (!lista.length) return;
    const n = lista.length, m = 30, maxD = Math.max(...lista.map(o => o.d));
    const passo = maxD > 0 ? (h - 80) / maxD : 0;
    const pos = new Map();
    lista.forEach((o, k) => pos.set(o.no, { x: m + (k + 0.5) * (w - 2 * m) / n, y: 36 + o.d * passo }));

    ctx.lineWidth = 1.5;
    lista.forEach(({ no }) => {
      const p = pos.get(no);
      [no.l, no.r].forEach(c => {
        if (!c) return;
        const pc = pos.get(c);
        ctx.strokeStyle = 'rgba(148,163,184,.4)';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pc.x, pc.y); ctx.stroke();
      });
    });

    lista.forEach(({ no }) => {
      const p = pos.get(no);
      let s = { fill: '#1e293b', borda: 'rgba(148,163,184,.6)', lw: 1.5 };
      if (q.vis.includes(no.v)) s = { fill: 'rgba(16,185,129,.30)', borda: CORES.okBorda, lw: 2 };
      if (q.hl === no.v) s = { fill: 'rgba(245,158,11,.35)', borda: CORES.hlBorda, lw: 2.5 };
      ctx.beginPath(); ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = s.fill; ctx.fill();
      ctx.strokeStyle = s.borda; ctx.lineWidth = s.lw; ctx.stroke();
      ctx.fillStyle = CORES.txt;
      ctx.font = '600 12px "Fira Code", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(no.v), p.x, p.y);
    });
  }

  /* ===================================================================
     9. GRAFOS (BFS e DFS)
     =================================================================== */
  const ADJ = { A: ['B', 'C'], B: ['A', 'D', 'E'], C: ['A', 'F'], D: ['B'], E: ['B', 'G'], F: ['C', 'G'], G: ['E', 'F'] };
  const POS = { A: [0.5, 0.08], B: [0.25, 0.38], C: [0.75, 0.38], D: [0.1, 0.68], E: [0.38, 0.68], F: [0.7, 0.68], G: [0.5, 0.92] };
  const ARESTAS = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'F'], ['E', 'G'], ['F', 'G']];

  function geraGrafo(modo) {
    const Q = [], vis = [];
    const lab = modo === 'bfs' ? 'Fila (frente → fim)' : 'Pilha (base → topo)';
    const push = (t, extra) => Q.push(Object.assign({ est: [], vis: [...vis], atual: null, aresta: null, lab, t }, extra || {}));

    if (modo === 'bfs') {
      const fila = ['A'], marcados = new Set(['A']);
      push('<strong>BFS</strong> (busca em largura) a partir de A. A <strong>fila</strong> explora em camadas: primeiro os vizinhos de A, depois os vizinhos desses (MOORE, 1959).', { est: [...fila] });
      while (fila.length) {
        const u = fila.shift();
        vis.push(u);
        push(`Remove <code>${u}</code> da frente da fila e o visita. Vizinhos de ${u}: ${ADJ[u].join(', ')}.`, { est: [...fila], atual: u });
        for (const v of ADJ[u]) {
          if (!marcados.has(v)) {
            marcados.add(v);
            fila.push(v);
            push(`${v} ainda não foi marcado: marca e entra no <strong>fim</strong> da fila. Marcar ao enfileirar evita repetir vértices.`, { est: [...fila], atual: u, aresta: [u, v] });
          }
        }
      }
    } else {
      const pilha = ['A'], visitados = new Set();
      push('<strong>DFS</strong> (busca em profundidade) a partir de A. A <strong>pilha</strong> (LIFO) faz a busca descer por um caminho antes de voltar. Empilhamos os vizinhos na ordem inversa, para que B seja visitado antes de C.', { est: [...pilha] });
      while (pilha.length) {
        const u = pilha.pop();
        if (visitados.has(u)) {
          push(`${u} já foi visitado (apareceu mais de uma vez na pilha): descartamos.`, { est: [...pilha] });
          continue;
        }
        visitados.add(u);
        vis.push(u);
        push(`Desempilha <code>${u}</code> do topo e o visita.`, { est: [...pilha], atual: u });
        for (const v of [...ADJ[u]].reverse()) {
          if (!visitados.has(v)) {
            pilha.push(v);
            push(`Empilha ${v}, vizinho ainda não visitado de ${u}.`, { est: [...pilha], atual: u, aresta: [u, v] });
          }
        }
      }
    }
    push(`Ordem de visita: ${vis.join(' → ')}. ${modo === 'bfs'
      ? 'Em grafos sem pesos, a BFS encontra os caminhos mais curtos a partir da origem.'
      : 'A DFS é a base para detectar ciclos, ordenação topológica e componentes conexos (TARJAN, 1972).'}`, { est: [], atual: null, aresta: null });
    return Q;
  }

  function desenhaGrafo(ctx, w, h, q) {
    limpa(ctx, w, h);
    const area = h - 80;
    const P = k => ({ x: 40 + POS[k][0] * (w - 80), y: 22 + POS[k][1] * (area - 44) });

    ARESTAS.forEach(([u, v]) => {
      const pu = P(u), pv = P(v);
      const usada = q.aresta && ((q.aresta[0] === u && q.aresta[1] === v) || (q.aresta[0] === v && q.aresta[1] === u));
      ctx.strokeStyle = usada ? CORES.hlBorda : 'rgba(148,163,184,.4)';
      ctx.lineWidth = usada ? 3 : 1.5;
      ctx.beginPath(); ctx.moveTo(pu.x, pu.y); ctx.lineTo(pv.x, pv.y); ctx.stroke();
    });

    Object.keys(POS).forEach(k => {
      const p = P(k);
      let fill = '#1e293b', borda = 'rgba(148,163,184,.6)', lw = 1.5;
      if (q.est.includes(k) && q.atual !== k) borda = CORES.azulBorda;
      if (q.vis.includes(k)) { fill = 'rgba(16,185,129,.30)'; borda = CORES.okBorda; lw = 2; }
      if (q.atual === k) { fill = 'rgba(245,158,11,.35)'; borda = CORES.hlBorda; lw = 2.5; }
      ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = borda; ctx.lineWidth = lw; ctx.stroke();
      ctx.fillStyle = CORES.txt;
      ctx.font = '600 13px "Fira Code", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(k, p.x, p.y);
    });

    rotulo(ctx, q.lab + ':', 14, h - 52);
    if (!q.est.length) rotulo(ctx, 'vazia', 14, h - 24);
    q.est.forEach((v, k) => caixa(ctx, 14 + k * 44, h - 40, 38, 30, ESTILO.azul, v));
  }

  /* ===================================================================
     0. COMPLEXIDADE (BIG-O) E ESPAÇO
     =================================================================== */
  const CLASSES_BIGO = [
    { nome: 'O(1)', f: n => 1, cor: '#34d399' },
    { nome: 'O(log n)', f: n => Math.log2(n), cor: '#38bdf8' },
    { nome: 'O(n)', f: n => n, cor: '#a3e635' },
    { nome: 'O(n log n)', f: n => n * Math.log2(n), cor: '#fbbf24' },
    { nome: 'O(n²)', f: n => n * n, cor: '#fb923c' },
    { nome: 'O(2ⁿ)', f: n => Math.pow(2, n), cor: '#f43f5e' }
  ];
  const LOG_MAX = Math.log10(Math.pow(2, 256));

  function fmtOps(v) {
    if (v < 1e6) return String(Math.round(v));
    return '10^' + Math.round(Math.log10(v));
  }

  function geraBigO() {
    const Q = [];
    const dicas = {
      8: 'Com n = 8, O(n²) já vale 64 e O(2ⁿ) vale 256: a exponencial começa a se separar.',
      32: 'Com n = 32, O(2ⁿ) passa de um bilhão, e O(n²) ainda vale só 1024. O logaritmo quase não se move.',
      256: 'Com n = 256, O(2ⁿ) tem 78 dígitos. Um computador de 10⁹ operações por segundo levaria mais tempo que a idade do universo.'
    };
    [2, 4, 8, 16, 32, 64, 128, 256].forEach((n, k) => {
      const resumo = CLASSES_BIGO.map(c => c.nome + ': ' + fmtOps(c.f(n))).join(' · ');
      const dica = dicas[n] ? ' ' + dicas[n] : '';
      Q.push({ n, t: (k === 0 ? 'Cada barra mostra quantas operações cada classe executa para um n. A altura é proporcional ao logaritmo do valor, porque a escala vai de 1 a 10⁷⁷. ' : '') + '<strong>n = ' + n + '</strong>. ' + resumo + '.' + dica });
    });
    Q.push({ n: 256, t: 'Resumo ao dobrar n: O(log n) ganha uma unidade; O(n) dobra; O(n log n) quase dobra; O(n²) quadruplica; e O(2ⁿ) passa a ser o quadrado do valor anterior, pois 2²ⁿ = (2ⁿ)².' });
    return Q;
  }

  function desenhaBigO(ctx, w, h, q) {
    limpa(ctx, w, h);
    const base = h - 46, topo = 30;
    const bw = (w - 40) / CLASSES_BIGO.length;
    CLASSES_BIGO.forEach((c, k) => {
      const v = c.f(q.n);
      const bh = (base - topo) * (Math.log10(v) + 1) / (LOG_MAX + 1);
      const x = 20 + k * bw + bw * 0.18, larg = bw * 0.64;
      AH.roundRect(ctx, x, base - bh, larg, bh, 4);
      ctx.globalAlpha = 0.8; ctx.fillStyle = c.cor; ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = CORES.txt;
      ctx.font = '600 11px "Fira Code", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(fmtOps(v), x + larg / 2, base - bh - 4);
      ctx.fillStyle = CORES.mudo; ctx.textBaseline = 'top';
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.fillText(c.nome, x + larg / 2, base + 8);
    });
    rotulo(ctx, 'n = ' + q.n + ' · escala logarítmica', 16, 14, CORES.azulBorda);
  }

  function geraContagem(tipo) {
    const Q = [];
    const n = tipo === 'log' ? 16 : 8;
    const a = Array.from({ length: n }, (_, k) => k + 1);
    const intervalo = m => Array.from({ length: m }, (_, k) => k);
    let ops = 0;
    const fr = (hl, t) => Q.push({ a, n, hl, ops, t });

    if (tipo === 'const') {
      fr([], 'Ler o primeiro elemento: <code>a[0]</code>. É uma operação, <strong>O(1)</strong>, qualquer que seja o tamanho do vetor (aqui n = ' + n + ').');
      ops = 1;
      fr([0], 'Operações: ' + ops + '. O custo não depende de n.');
    } else if (tipo === 'linear') {
      fr([], 'Somar todos os elementos: <code>for (i = 0; i &lt; n; i++)</code>. Cada volta custa uma operação, então o total é <strong>O(n)</strong>.');
      for (let i = 0; i < n; i++) {
        ops++;
        fr([i], 'i = ' + i + ': somamos a[' + i + '] = ' + a[i] + '. Operações até agora: ' + ops + '.');
      }
      fr([], 'Fim: ' + ops + ' operações para n = ' + n + '. Dobrar n dobra o trabalho.');
    } else if (tipo === 'quad') {
      fr([], 'Comparar todos os pares: um laço dentro de outro. Para cada i, o interno percorre todos os j. São <strong>n × n</strong> operações: <strong>O(n²)</strong>.');
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          ops++;
          fr([i, j], 'i = ' + i + ', j = ' + j + ': comparamos a[i] com a[j]. Operações: ' + ops + '.');
        }
      }
      fr([], 'Fim: ' + ops + ' = ' + n + '² operações. Dobrar n quadruplica o trabalho.');
    } else {
      fr(intervalo(n), 'Dividir ao meio: a janela começa com ' + n + ' elementos. Quantas vezes dá para dividir ' + n + ' por 2 até chegar a 1? É log₂ n: <strong>O(log n)</strong>.');
      let m = n;
      while (m > 1) {
        ops++;
        m = Math.floor(m / 2);
        fr(intervalo(m), 'Divide ao meio: a janela tem ' + m + ' elementos. Operações: ' + ops + '.');
      }
      fr([], 'Fim: ' + ops + ' operações = log₂ ' + n + '. Dobrar n acrescenta apenas uma operação.');
    }
    return Q;
  }

  function desenhaContagem(ctx, w, h, q) {
    limpa(ctx, w, h);
    const cw = Math.min(64, (w - 40) / q.n), x0 = (w - cw * q.n) / 2, y = h * 0.34, ch = 52;
    q.a.forEach((v, k) => {
      const s = q.hl.includes(k) ? ESTILO.hl : ESTILO.normal;
      caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, s, String(v), k);
    });
    rotulo(ctx, 'operações: ' + q.ops, 16, 14, CORES.azulBorda);
  }

  function geraEspaco(tipo) {
    const Q = [], n = 5;
    if (tipo === 'rec') {
      const pilha = [];
      Q.push({ pilha: [], t: '<strong>fat(n) recursivo</strong>, com n = ' + n + '. Cada chamada espera o resultado da próxima, então cada uma continua <em>viva</em> num quadro próprio da pilha de execução.' });
      for (let k = n; k >= 1; k--) {
        pilha.push('fat(' + k + ')');
        Q.push({ pilha: [...pilha], t: 'Chamada fat(' + k + ') empilhada. Quadros em uso: ' + pilha.length + '. ' + (k > 1 ? 'Ela chama fat(' + (k - 1) + ') e espera o resultado.' : 'Caso base: devolve 1.') });
      }
      while (pilha.length) {
        const topo = pilha.pop();
        Q.push({ pilha: [...pilha], t: topo + ' devolve seu valor e o quadro é liberado. Quadros restantes: ' + pilha.length + '.' });
      }
      Q.push({ pilha: [], t: 'Espaço auxiliar: <strong>O(n)</strong>, pois o pico foi de ' + n + ' quadros ao mesmo tempo. O tempo também é O(n).' });
    } else {
      Q.push({ r: 1, i: 1, t: '<strong>fat(n) iterativo</strong>, com n = ' + n + '. Usamos só duas variáveis, <code>r</code> e <code>i</code>, quaisquer que sejam os valores de n.' });
      let r = 1;
      for (let i = 2; i <= n; i++) {
        r *= i;
        Q.push({ r, i, t: 'i = ' + i + ': r = r × i = ' + r + '. As mesmas duas variáveis são reaproveitadas.' });
      }
      Q.push({ r, i: n, t: 'Resultado ' + r + '. Espaço auxiliar: <strong>O(1)</strong>. O tempo continua O(n), porque o laço dá n voltas.' });
    }
    return Q;
  }

  function desenhaEspaco(ctx, w, h, q) {
    limpa(ctx, w, h);
    if (q.pilha) {
      const bw = Math.min(200, w * 0.4), x = (w - bw) / 2, ch = 34, base = h - 16;
      rotulo(ctx, 'pilha de execução (memória)', 16, 14);
      q.pilha.forEach((nome, k) => {
        const y = base - (k + 1) * (ch + 6);
        caixa(ctx, x, y, bw, ch, k === q.pilha.length - 1 ? ESTILO.azul : ESTILO.normal, nome);
      });
      if (!q.pilha.length) rotulo(ctx, 'pilha vazia', x, base - ch / 2, CORES.mudo, 'left');
    } else {
      rotulo(ctx, 'variáveis locais (tamanho fixo)', 16, 14);
      caixa(ctx, w / 2 - 130, h / 2 - 30, 110, 60, ESTILO.azul, 'r = ' + q.r);
      caixa(ctx, w / 2 + 20, h / 2 - 30, 110, 60, ESTILO.hl, 'i = ' + q.i);
    }
  }





  /* ===================================================================
     NOVAS ANIMAÇÕES (uma página por tópico)
     =================================================================== */

  /* ---------- Vetores: crescimento dinâmico ---------- */
  function geraCrescimento() {
    const Q = [], dados = [];
    let cap = 2;
    const estado = (t, hl, est) => Q.push({
      cap, hl: hl || [], est: est || null, t,
      a: Array.from({ length: cap }, (_, k) => (k < dados.length ? dados[k] : null))
    });
    estado('Vetor dinâmico com capacidade 2. Os elementos ficam em posições contíguas; quando a capacidade acaba, precisamos de um bloco maior.');
    for (const x of [10, 20, 30, 40, 50]) {
      if (dados.length === cap) {
        const novo = cap * 2;
        estado(`Capacidade cheia (${cap}). <code>realloc</code> pede um bloco de ${novo} posições e <strong>copia</strong> os ${dados.length} elementos. Esta chamada custa O(n).`, [], ESTILO.erro);
        cap = novo;
        estado(`Novo bloco com capacidade ${cap}, já com os elementos copiados.`, [], ESTILO.azul);
      }
      dados.push(x);
      estado(`push(${x}) grava na posição ${dados.length - 1}. Custo O(1).`, [dados.length - 1], ESTILO.ok);
    }
    estado('Cinco inserções, duas realocações (2 → 4 → 8) e 6 cópias no total. Espalhado pelas inserções, o custo fica em O(1) amortizado: o crescimento é geométrico, não de uma em uma.');
    return Q;
  }

  function desenhaCrescimento(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.cap, cw = Math.min(64, (w - 40) / n), x0 = (w - cw * n) / 2, y = h * 0.36, ch = 56;
    rotulo(ctx, 'capacidade = ' + q.cap, x0, y - 20, CORES.azulBorda);
    q.a.forEach((v, k) => {
      let s = v === null ? ESTILO.apag : ESTILO.normal;
      if (q.est && v !== null) s = q.est;
      if (q.hl.includes(k)) s = ESTILO.hl;
      caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, s, v === null ? '' : String(v), k);
    });
  }

  /* ---------- Matrizes: espiral ---------- */
  const ESPIRAL_M = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];

  function geraEspiral() {
    const L = ESPIRAL_M.length, C = ESPIRAL_M[0].length, Q = [], ordem = [];
    let topo = 0, base = L, esq = 0, dir = C;
    const visitado = () => ordem.map(p => p[0] * C + p[1]);
    Q.push({ i: -1, j: -1, vis: [], t: '<strong>Percurso em espiral</strong>: andamos pela borda da matriz, de fora para dentro. Cada volta fecha uma camada e reduz os quatro limites (topo, base, esquerda e direita).' });
    while (topo < base && esq < dir) {
      for (let j = esq; j < dir; j++) ordem.push([topo, j]);
      topo++;
      for (let i = topo; i < base; i++) ordem.push([i, dir - 1]);
      dir--;
      if (topo < base) {
        for (let j = dir; j > esq; j--) ordem.push([base - 1, j - 1]);
        base--;
      }
      if (esq < dir) {
        for (let i = base; i > topo; i--) ordem.push([i - 1, esq]);
        esq++;
      }
    }
    ordem.forEach(([i, j], k) => {
      Q.push({ i, j, vis: visitado().slice(0, k), t: `Visita M[${i}][${j}] = <strong>${ESPIRAL_M[i][j]}</strong>, o ${k + 1}º elemento da espiral. ${k === 0 ? 'Começamos no canto superior esquerdo.' : 'Ao chegar à borda, o percurso vira para dentro.'}` });
    });
    Q.push({ i: -1, j: -1, vis: visitado(), t: `Espiral completa: ${ordem.map(p => ESPIRAL_M[p[0]][p[1]]).join(', ')}. Cada célula é visitada uma vez: O(n·m) de tempo e O(1) de memória extra.` });
    return Q;
  }

  function desenhaEspiral(ctx, w, h, q) {
    limpa(ctx, w, h);
    const L = ESPIRAL_M.length, C = ESPIRAL_M[0].length;
    const cs = Math.min(70, (w - 40) / C), gx = (w - cs * C) / 2, gy = 16;
    for (let i = 0; i < L; i++) for (let j = 0; j < C; j++) {
      const k = i * C + j;
      let s = ESTILO.normal;
      if (q.vis.includes(k)) s = ESTILO.azul;
      if (q.i === i && q.j === j) s = ESTILO.hl;
      caixa(ctx, gx + j * cs + 3, gy + i * cs + 3, cs - 6, cs - 6, s, String(ESPIRAL_M[i][j]));
    }
  }

  /* ---------- Ordenação: seleção ---------- */
  function geraSelecao() {
    const a = BASE_ORD.slice(), n = a.length, Q = [], fx = new Set();
    let cmp = 0;
    const fr = (hl, t) => Q.push({ a: a.slice(), hl, fix: [...fx], cmp, pivo: -1, t });
    fr([], '<strong>Ordenação por seleção</strong>: em cada passagem, procuramos o menor valor da parte ainda não ordenada e o trocamos com a primeira posição dela. Vetor inicial: [' + a.join(', ') + '].');
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      fr([i], `Passagem ${i + 1}: procuramos o menor valor a partir da posição ${i}. Candidato atual: ${a[m]}.`);
      for (let j = i + 1; j < n; j++) {
        cmp++;
        const menor = a[j] < a[m];
        fr([j, m], `Compara <code>${a[j]}</code> com o menor atual <code>${a[m]}</code>: ${menor ? 'é menor, vira o novo candidato.' : 'não é menor.'}`);
        if (menor) m = j;
      }
      if (m !== i) {
        [a[i], a[m]] = [a[m], a[i]];
        fr([i, m], `Troca a[${i}] com a[${m}]: o valor ${a[i]} vai para a posição definitiva ${i}.`);
      } else {
        fr([i], `${a[i]} já era o menor: nenhuma troca.`);
      }
      fx.add(i);
    }
    for (let k = 0; k < n; k++) fx.add(k);
    fr([], `Vetor ordenado. Total de comparações: ${cmp} = n(n−1)/2. Seleção faz esse número mesmo se o vetor já estiver ordenado.`);
    return Q;
  }

  /* ---------- Busca linear ---------- */
  function geraBuscaLinear() {
    const a = ORD_ARR, alvo = 33, Q = [];
    Q.push({ a, lo: 0, hi: a.length - 1, mid: -1, achou: false, t: `<strong>Busca linear</strong> de <code>${alvo}</code>. Não exige ordem: olhamos um elemento de cada vez, da esquerda para a direita.` });
    for (let i = 0; i < a.length; i++) {
      const acha = a[i] === alvo;
      Q.push({ a, lo: 0, hi: a.length - 1, mid: i, achou: acha, t: `Posição ${i}: <code>${a[i]}</code> ${acha ? '= ' + alvo + ': <strong>encontrado</strong>.' : '≠ ' + alvo + ', seguimos.'} Comparações feitas: ${i + 1}.` });
      if (acha) break;
    }
    return Q;
  }

  /* ---------- Filas: buffer circular ---------- */
  function geraFilaCircular() {
    const CAP = 5, Q = [], slots = Array(CAP).fill(null);
    let frente = 0, tam = 0;
    const fr = (t, extra) => Q.push(Object.assign({ slots: slots.slice(), frente, tam, CAP, hl: [], est: null, t }, extra || {}));
    fr('Buffer circular de capacidade 5. <strong>frente</strong> aponta para o primeiro elemento. A posição do fim é calculada como (frente + tamanho) % 5: quando o índice passa do último slot, ele volta ao início.');
    const ops = [['e', 10], ['e', 20], ['e', 30], ['e', 40], ['e', 50], ['d'], ['d'], ['e', 60], ['e', 70], ['d']];
    for (const op of ops) {
      if (op[0] === 'e') {
        const pos = (frente + tam) % CAP;
        slots[pos] = op[1];
        tam++;
        fr(`enqueue(${op[1]}): grava no slot ${pos} = (${frente} + ${tam - 1}) % ${CAP}. Custo O(1).`, { hl: [pos], est: ESTILO.ok });
      } else {
        const antiga = frente, v = slots[frente];
        slots[frente] = null;
        frente = (frente + 1) % CAP;
        tam--;
        fr(`dequeue() remove ${v} do slot ${antiga} e avança a frente para ${frente}. Nada é deslocado: custo O(1).`, { hl: [antiga], est: ESTILO.erro });
      }
    }
    fr('Fim: a fila contém os elementos a partir da frente, dando a volta quando necessário. Nenhum elemento foi copiado, ao contrário do que aconteceria com um vetor comum na remoção do início.');
    return Q;
  }

  function desenhaFilaCircular(ctx, w, h, q) {
    limpa(ctx, w, h);
    const cw = Math.min(90, (w - 40) / q.CAP), x0 = (w - cw * q.CAP) / 2, y = h * 0.36, ch = 60;
    q.slots.forEach((v, k) => {
      let s = v === null ? ESTILO.apag : ESTILO.normal;
      if (q.hl.includes(k)) s = q.est || ESTILO.hl;
      caixa(ctx, x0 + k * cw + 4, y, cw - 8, ch, s, v === null ? 'vazio' : String(v), k);
    });
    rotulo(ctx, 'frente', x0 + q.frente * cw + cw / 2, y - 20, CORES.azulBorda, 'center');
    if (q.tam > 0) rotulo(ctx, 'fim', x0 + ((q.frente + q.tam - 1) % q.CAP) * cw + cw / 2, y + ch + 36, CORES.okBorda, 'center');
    rotulo(ctx, 'tamanho = ' + q.tam, 16, 14, CORES.azulBorda);
  }

  /* ---------- Pilhas: avaliação pós-fixa (RPN) ---------- */
  function geraRPN(expr) {
    const toks = expr.split(' '), Q = [], st = [];
    Q.push({ toks, idx: -1, st: [], res: undefined, t: `Avaliação de <strong>notação pós-fixa</strong> (RPN) de <code>${expr}</code>. Números vão para a pilha; um operador retira os dois valores do topo, calcula e empilha o resultado.` });
    toks.forEach((tk, k) => {
      if (/^\d+$/.test(tk)) {
        st.push(Number(tk));
        Q.push({ toks, idx: k, st: [...st], res: undefined, t: `<code>${tk}</code> é um número: <strong>push</strong>.` });
      } else {
        const b = st.pop(), a = st.pop();
        const r = tk === '+' ? a + b : tk === '-' ? a - b : tk === '*' ? a * b : Math.trunc(a / b);
        st.push(r);
        Q.push({ toks, idx: k, st: [...st], res: r, t: `<code>${tk}</code> é operador: <strong>pop</strong> ${b} e ${a}, calcula ${a} ${tk} ${b} = ${r} e faz <strong>push</strong> do resultado.` });
      }
    });
    Q.push({ toks, idx: -1, st: [...st], res: undefined, t: `Resultado: <strong>${st[st.length - 1]}</strong>. Sobrou um único valor na pilha, como deve ser numa expressão válida. Não há parênteses nem precedência: a ordem dos tokens já define a conta.` });
    return Q;
  }

  function desenhaRPN(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.toks.length, cw = Math.min(64, (w - 40) / Math.max(n, 1)), x0 = (w - cw * n) / 2, y = 44, ch = 44;
    q.toks.forEach((tk, k) => {
      let s = ESTILO.normal;
      if (k === q.idx) s = q.res !== undefined ? ESTILO.ok : ESTILO.hl;
      caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, s, tk);
    });
    const pw = 90, px = (w - pw) / 2, base = h - 16, sh = 36;
    rotulo(ctx, 'pilha (topo ↑)', w / 2, base - Math.max(1, q.st.length) * (sh + 4) - 14, CORES.mudo, 'center');
    q.st.forEach((v, k) => {
      const yy = base - (k + 1) * (sh + 4);
      caixa(ctx, px, yy, pw, sh, k === q.st.length - 1 ? ESTILO.azul : ESTILO.normal, String(v));
    });
  }

  /* ---------- Tabelas hash: sondagem linear ---------- */
  function geraSondagem() {
    const CAP = 6, Q = [], tab = Array(CAP).fill(null);
    const fr = (t, extra) => Q.push(Object.assign({ tab: tab.slice(), CAP, hl: [], est: null, t }, extra || {}));
    fr(`<strong>Endereçamento aberto</strong> com sondagem linear. A tabela tem ${CAP} posições e h(k) = k mod ${CAP}. Se a posição está ocupada, testamos a seguinte, dando a volta quando preciso. Tudo fica dentro da própria tabela.`);
    for (const k of [7, 13, 1, 19, 8]) {
      let i = k % CAP, sondas = 0;
      fr(`Inserir ${k}: h(${k}) = ${k} mod ${CAP} = ${i}.`, { hl: [i] });
      while (tab[i] !== null) {
        sondas++;
        fr(`Posição ${i} ocupada por ${tab[i]}: <strong>colisão</strong>. Sondagem: tenta a posição ${(i + 1) % CAP}.`, { hl: [i], est: ESTILO.erro });
        i = (i + 1) % CAP;
      }
      tab[i] = k;
      fr(`${k} vai para a posição ${i}${sondas ? ' depois de ' + sondas + ' sonda(s)' : ' (estava livre)'}.`, { hl: [i], est: ESTILO.ok });
    }
    const alvo = 19;
    let i = alvo % CAP;
    fr(`<strong>Busca</strong> de ${alvo}: começa em h = ${i}. Segue a mesma sequência de sondagens até achar a chave ou encontrar uma posição vazia.`, { hl: [i] });
    for (;;) {
      if (tab[i] === alvo) { fr(`Encontrado na posição ${i}.`, { hl: [i], est: ESTILO.ok }); break; }
      if (tab[i] === null) { fr('Posição vazia: a chave não está na tabela.', { hl: [i], est: ESTILO.erro }); break; }
      fr(`Posição ${i} tem ${tab[i]} ≠ ${alvo}: segue a sondagem.`, { hl: [i], est: ESTILO.erro });
      i = (i + 1) % CAP;
    }
    fr('Aglomerados (clusters) de posições ocupadas aumentam o custo das buscas. Por isso a tabela é redimensionada quando o fator de carga cresce.');
    return Q;
  }

  function desenhaSondagem(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.CAP, cw = Math.min(90, (w - 40) / n), x0 = (w - cw * n) / 2, y = h * 0.36, ch = 60;
    q.tab.forEach((v, k) => {
      let s = v === null ? ESTILO.apag : ESTILO.normal;
      if (q.hl.includes(k)) s = q.est || ESTILO.hl;
      caixa(ctx, x0 + k * cw + 4, y, cw - 8, ch, s, v === null ? 'vazio' : String(v), k);
    });
    rotulo(ctx, 'tabela de tamanho ' + n + ' (índices embaixo)', 16, 14, CORES.azulBorda);
  }

  /* ---------- Árvores: percursos ---------- */
  function insereArv(r, x) {
    if (!r) return { v: x, l: null, r: null };
    if (x < r.v) r.l = insereArv(r.l, x);
    else if (x > r.v) r.r = insereArv(r.r, x);
    return r;
  }

  function geraTravessia(tipo) {
    let raiz = null;
    SEQ_ARV.forEach(x => { raiz = insereArv(raiz, x); });
    const ordem = [];
    const visita = no => {
      if (!no) return;
      if (tipo === 'pre') { ordem.push(no.v); visita(no.l); visita(no.r); }
      else if (tipo === 'em') { visita(no.l); ordem.push(no.v); visita(no.r); }
      else { visita(no.l); visita(no.r); ordem.push(no.v); }
    };
    if (tipo === 'nivel') {
      const fila = [raiz];
      while (fila.length) {
        const no = fila.shift();
        ordem.push(no.v);
        if (no.l) fila.push(no.l);
        if (no.r) fila.push(no.r);
      }
    } else {
      visita(raiz);
    }
    const nomes = {
      pre: 'pré-ordem: raiz, depois a esquerda e a direita',
      em: 'em-ordem: esquerda, raiz, depois a direita',
      pos: 'pós-ordem: esquerda, direita, e só então a raiz',
      nivel: 'por níveis: uma fila, nível a nível, da raiz para as folhas'
    };
    const Q = [{ root: copiaNo(raiz), hl: null, vis: [], t: `<strong>Percurso ${nomes[tipo]}</strong>. A árvore é a mesma da aula de árvores: 50, 30, 70, 20, 40, 60, 80 e 35.` }];
    ordem.forEach((v, k) => Q.push({
      root: copiaNo(raiz), hl: v, vis: ordem.slice(0, k),
      t: `Visita <code>${v}</code>. Sequência até aqui: ${ordem.slice(0, k + 1).join(', ')}.`
    }));
    Q.push({ root: copiaNo(raiz), hl: null, vis: ordem.slice(), t: `Sequência final: ${ordem.join(', ')}. Cada nó é visitado uma vez, então o percurso custa O(n) de tempo; o espaço é O(h) pela pilha de recursão (ou O(largura) na fila).` });
    return Q;
  }

  /* ---------- Grafos: Dijkstra ---------- */
  const DJ_POS = { 0: [0.08, 0.5], 1: [0.35, 0.12], 2: [0.35, 0.88], 3: [0.66, 0.5], 4: [0.92, 0.5] };
  const DJ_ARCOS = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]];

  function geraDijkstra() {
    const N = 5, dist = Array(N).fill(Infinity), feito = Array(N).fill(false), Q = [];
    dist[0] = 0;
    const fmt = d => (d === Infinity ? '∞' : String(d));
    const fr = (t, extra) => Q.push(Object.assign({ dist: dist.slice(), feito: feito.slice(), atual: -1, aresta: null, t }, extra || {}));
    fr('<strong>Dijkstra</strong> a partir do vértice 0. Cada vértice guarda a melhor distância conhecida (∞ = ainda desconhecida). Em cada passo, fechamos o vértice não fechado mais próximo e <em>relaxamos</em> as arestas que saem dele.');
    for (let it = 0; it < N; it++) {
      let u = -1;
      for (let v = 0; v < N; v++)
        if (!feito[v] && dist[v] !== Infinity && (u < 0 || dist[v] < dist[u])) u = v;
      if (u < 0) break;
      feito[u] = true;
      fr(`Fecha o vértice ${u}, com distância ${dist[u]}: é o mais próximo entre os não fechados, então essa distância é definitiva.`, { atual: u });
      DJ_ARCOS.filter(a => a[0] === u).forEach(([, v, w]) => {
        const nova = dist[u] + w, antiga = dist[v];
        if (nova < dist[v]) {
          dist[v] = nova;
          fr(`Aresta ${u} → ${v} (peso ${w}): ${dist[u]} + ${w} = ${nova}, melhor que ${fmt(antiga)}. Atualiza d(${v}).`, { atual: u, aresta: [u, v] });
        } else {
          fr(`Aresta ${u} → ${v} (peso ${w}): ${nova} não melhora d(${v}) = ${fmt(dist[v])}. Nada muda.`, { atual: u, aresta: [u, v] });
        }
      });
    }
    fr(`Distâncias finais: ${dist.map((d, k) => k + '=' + fmt(d)).join(', ')}. Esta versão custa O(V²); com um heap binário, O((V + E) log V).`);
    return Q;
  }

  function desenhaDijkstra(ctx, w, h, q) {
    limpa(ctx, w, h);
    const P = k => ({ x: 56 + DJ_POS[k][0] * (w - 112), y: 32 + DJ_POS[k][1] * (h - 110) });
    DJ_ARCOS.forEach(([u, v, wt]) => {
      const pu = P(u), pv = P(v);
      const usada = q.aresta && q.aresta[0] === u && q.aresta[1] === v;
      const ang = Math.atan2(pv.y - pu.y, pv.x - pu.x);
      const sx = pu.x + 24 * Math.cos(ang), sy = pu.y + 24 * Math.sin(ang);
      const ex = pv.x - 24 * Math.cos(ang), ey = pv.y - 24 * Math.sin(ang);
      AH.arrow(ctx, sx, sy, ex, ey, usada ? CORES.hlBorda : 'rgba(148,163,184,.55)', 9);
      ctx.fillStyle = CORES.mudo;
      ctx.font = '600 11px "Fira Code", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(wt), (sx + ex) / 2 + 10 * Math.sin(ang), (sy + ey) / 2 - 10 * Math.cos(ang));
    });
    for (let k = 0; k < 5; k++) {
      const p = P(k);
      let fill = '#1e293b', borda = 'rgba(148,163,184,.6)';
      if (q.feito[k]) { fill = 'rgba(16,185,129,.30)'; borda = CORES.okBorda; }
      if (q.atual === k) { fill = 'rgba(245,158,11,.35)'; borda = CORES.hlBorda; }
      ctx.beginPath(); ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = borda; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = CORES.txt;
      ctx.font = '600 13px "Fira Code", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(k), p.x, p.y);
      ctx.fillStyle = CORES.azulBorda;
      ctx.font = '600 11px "Fira Code", monospace';
      ctx.fillText('d=' + (q.dist[k] === Infinity ? '∞' : q.dist[k]), p.x, p.y + 38);
    }
  }

  /* ---------- Padrões: dois ponteiros ---------- */
  function geraDoisPonteiros() {
    const a = [1, 3, 4, 6, 8, 11], alvo = 10, Q = [];
    let lo = 0, hi = a.length - 1;
    Q.push({ a, lo, hi, ok: false, t: `<strong>Padrão: dois ponteiros.</strong> O vetor está ordenado. Procuramos dois valores cuja soma seja ${alvo}: um ponteiro começa no início (lo) e outro no fim (hi).` });
    while (lo < hi) {
      const s = a[lo] + a[hi];
      if (s === alvo) {
        Q.push({ a, lo, hi, ok: true, t: `${a[lo]} + ${a[hi]} = ${alvo}: <strong>par encontrado</strong>. Com o vetor ordenado, a primeira soma exata encontrada basta para este objetivo.` });
        return Q;
      }
      if (s < alvo) {
        lo++;
        Q.push({ a, lo, hi, ok: false, t: `${a[lo - 1]} + ${a[hi]} = ${s} &lt; ${alvo}: soma pequena. Avançamos lo, para aumentar o menor valor.` });
      } else {
        hi--;
        Q.push({ a, lo, hi, ok: false, t: `${a[lo]} + ${a[hi + 1]} = ${s} &gt; ${alvo}: soma grande. Recuamos hi, para diminuir o maior valor.` });
      }
    }
    Q.push({ a, lo, hi, ok: false, t: `Os ponteiros se cruzaram: nenhum par soma ${alvo}. Cada ponteiro anda no máximo n vezes, então a busca custa O(n), além da ordenação.` });
    return Q;
  }

  function desenhaPonteiros(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.a.length, cw = Math.min(70, (w - 40) / n), x0 = (w - cw * n) / 2, y = h * 0.36, ch = 56;
    q.a.forEach((v, k) => {
      let s = ESTILO.normal;
      if (k < q.lo || k > q.hi) s = ESTILO.apag;
      if (k === q.lo || k === q.hi) s = q.ok ? ESTILO.ok : ESTILO.hl;
      caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, s, String(v), k);
    });
    if (q.lo < n) rotulo(ctx, 'lo', x0 + q.lo * cw + cw / 2, y - 18, CORES.azulBorda, 'center');
    if (q.hi >= 0 && q.hi < n) rotulo(ctx, 'hi', x0 + q.hi * cw + cw / 2, y + ch + 36, CORES.erroBorda, 'center');
  }

  /* ---------- Padrões: janela deslizante ---------- */
  function geraJanela() {
    const a = [2, 1, 5, 1, 3, 2], k = 3, Q = [];
    let s = 0;
    for (let i = 0; i < k; i++) s += a[i];
    let melhor = s, melhorIni = 0;
    Q.push({ a, ini: 0, fim: k - 1, soma: s, melhor: s, entra: -1, sai: -1, ok: false, t: `<strong>Padrão: janela deslizante</strong>. Queremos a soma máxima de ${k} elementos seguidos. Em vez de somar cada janela do zero, a janela anda uma posição: entra um elemento à direita e sai um à esquerda.` });
    for (let i = k; i < a.length; i++) {
      s += a[i] - a[i - k];
      if (s > melhor) { melhor = s; melhorIni = i - k + 1; }
      Q.push({ a, ini: i - k + 1, fim: i, soma: s, melhor, entra: i, sai: i - k, ok: false, t: `Entra a[${i}] = ${a[i]} e sai a[${i - k}] = ${a[i - k]}: soma = ${s}. ${s === melhor ? '<strong>Nova melhor janela.</strong>' : 'Melhor até agora: ' + melhor + '.'}` });
    }
    Q.push({ a, ini: melhorIni, fim: melhorIni + k - 1, soma: melhor, melhor, entra: -1, sai: -1, ok: true, t: `Melhor janela: índices ${melhorIni} a ${melhorIni + k - 1}, soma ${melhor}. Cada elemento entrou e saiu no máximo uma vez: O(n), em vez de O(n·k) de somar cada janela.` });
    return Q;
  }

  function desenhaJanela(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.a.length, cw = Math.min(70, (w - 40) / n), x0 = (w - cw * n) / 2, y = h * 0.36, ch = 56;
    q.a.forEach((v, k) => {
      let s = ESTILO.normal;
      if (k >= q.ini && k <= q.fim) s = q.ok ? ESTILO.ok : ESTILO.hl;
      if (k === q.entra) s = ESTILO.azul;
      if (k === q.sai) s = ESTILO.erro;
      caixa(ctx, x0 + k * cw + 3, y, cw - 6, ch, s, String(v), k);
    });
    rotulo(ctx, 'soma da janela = ' + q.soma + ' · melhor = ' + q.melhor, 16, 14, CORES.azulBorda);
  }

  global.ED = {
    criaAnimacao,
    limpa,
    caixa,
    rotulo,
    CORES,
    ESTILO,
    geraVetor,
    desenhaVetor,
    geraMatriz,
    desenhaMatriz,
    geraOrd,
    desenhaOrd,
    geraBusca,
    desenhaBusca,
    geraFila,
    desenhaFila,
    geraPilha,
    desenhaPilha,
    geraHash,
    desenhaHash,
    geraArvore,
    desenhaArvore,
    geraGrafo,
    desenhaGrafo,
    geraBigO,
    desenhaBigO,
    geraContagem,
    desenhaContagem,
    geraEspaco,
    desenhaEspaco,
    fmtOps,
    CLASSES_BIGO,
    ORD_ARR,
    BASE_ORD,
    SEQ_ARV,
    copiaNo,
    altura,
    ADJ,
    POS,
    ARESTAS,
    HM,
    CHAVES,
    geraCrescimento,
    desenhaCrescimento,
    geraEspiral,
    desenhaEspiral,
    geraSelecao,
    geraBuscaLinear,
    geraFilaCircular,
    desenhaFilaCircular,
    geraRPN,
    desenhaRPN,
    geraSondagem,
    desenhaSondagem,
    geraTravessia,
    geraDijkstra,
    desenhaDijkstra,
    geraDoisPonteiros,
    desenhaPonteiros,
    geraJanela,
    desenhaJanela
  };
})(window);
