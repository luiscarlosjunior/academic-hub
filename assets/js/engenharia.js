/* =====================================================================
   Engenharia de Software, Arquitetura e Programação para a Indústria —
   animações das aulas. Usada pelas páginas de tópico em
   disciplinas/engenharia-software-arquitetura/topicos/.
   Depende de assets/js/hub.js (canvas, setas e retângulos) e de
   assets/js/estrutura-dados.js (motor ED.criaAnimacao: quadros + controles).
   Cada animação tem um gerador (gera*) que devolve os quadros e um
   desenhista (desenha*) que pinta um quadro. Expõe tudo em window.ENG.
   ===================================================================== */
(function (global) {
  'use strict';

  const C = {
    txt: '#e2e8f0', mudo: '#64748b', fundo: '#1e293b', borda: '#334155',
    sky: '#38bdf8', ok: '#10b981', alerta: '#f59e0b', erro: '#f43f5e', roxo: '#a855f7',
    okFundo: '#064e3b', skyFundo: '#0c4a6e', erroFundo: '#7f1d1d', roxoFundo: '#3b0764',
    alertaFundo: '#78350f'
  };
  const FONTE = '600 12px Inter, system-ui, sans-serif';
  const FONTE_SUAVE = '500 11px Inter, system-ui, sans-serif';

  /* ------------------------------------------------------------------ */
  /* Primitivos de desenho                                               */
  /* ------------------------------------------------------------------ */
  function caixa(ctx, x, y, w, h, linhas, o) {
    o = o || {};
    ctx.save();
    ctx.fillStyle = o.fundo || C.fundo;
    ctx.strokeStyle = o.borda || C.borda;
    ctx.lineWidth = o.lw || 1.5;
    AH.roundRect(ctx, x, y, w, h, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = o.cor || C.txt;
    ctx.font = o.fonte || FONTE;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const L = Array.isArray(linhas) ? linhas : [linhas];
    const lh = o.lh || 15;
    const y0 = y + h / 2 - (L.length - 1) * lh / 2;
    L.forEach((s, i) => ctx.fillText(s, x + w / 2, y0 + i * lh));
    ctx.restore();
  }

  function rotulo(ctx, s, x, y, o) {
    o = o || {};
    ctx.save();
    ctx.fillStyle = o.cor || C.mudo;
    ctx.font = o.fonte || '500 12px Inter, system-ui, sans-serif';
    ctx.textAlign = o.alinha || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
    ctx.restore();
  }

  function seta(ctx, x1, y1, x2, y2, cor) { AH.arrow(ctx, x1, y1, x2, y2, cor || C.mudo, 8); }

  function bolinha(ctx, x, y, r, cor) {
    ctx.save(); ctx.fillStyle = cor;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  const F = (t, extra) => Object.assign({ t: t }, extra);

  /* ================================================================== */
  /* 1. Processos: cascata × iterativo                                    */
  /* ================================================================== */
  function geraProcessos(op) {
    const Q = [];
    if (op === 'cascata') {
      const fases = ['Requisitos', 'Projeto', 'Código', 'Testes', 'Entrega'];
      fases.forEach((f, k) => Q.push(F(k === 0
        ? 'Primeiro tudo é levantado e aprovado. Ainda não existe código, então ninguém vê o resultado.'
        : `<strong>${f}</strong> só começa quando a fase anterior termina. Mudanças de requisito ficam para depois.`,
        { tipo: 'cascata', fases: fases, ativa: k, feitas: k, retorno: false })));
      Q.push(F('Em <strong>Testes</strong>, uma falha revela um requisito mal entendido. A correção volta até Requisitos, e o custo é bem maior do que seria no início.',
        { tipo: 'cascata', fases: fases, ativa: 3, feitas: 3, retorno: true }));
      Q.push(F('O cliente vê o sistema pela primeira vez no fim. Esse atraso na percepção do problema é o custo típico do modelo.',
        { tipo: 'cascata', fases: fases, ativa: 4, feitas: 4, retorno: false }));
    } else {
      const etapas = ['Planejar', 'Construir', 'Testar', 'Revisar'];
      for (let r = 0; r < 3; r++) {
        for (let e = 0; e < 4; e++) {
          Q.push(F(e === 3
            ? `Incremento ${r + 1} terminado: <strong>revisão com o cliente</strong>. O feedback reorganiza o que vem a seguir.`
            : `Incremento ${r + 1}, etapa <strong>${etapas[e]}</strong>. Cada incremento é uma fatia funcional que pode ser usada.`,
            { tipo: 'iterativo', etapas: etapas, incs: 3, idx: r * 4 + e }));
        }
      }
    }
    return Q;
  }

  function desenhaProcessos(ctx, w, h, q) {
    if (q.tipo === 'cascata') {
      const n = q.fases.length, gap = 12;
      const bw = Math.min(120, (w - 32 - gap * (n - 1)) / n), bh = 58;
      const x0 = (w - (bw * n + gap * (n - 1))) / 2, y = h * 0.36;
      q.fases.forEach((f, k) => {
        const x = x0 + k * (bw + gap);
        let fundo = C.fundo, borda = C.borda;
        if (k < q.feitas) { fundo = C.okFundo; borda = C.ok; }
        if (k === q.ativa) {
          fundo = q.retorno ? C.erroFundo : C.skyFundo;
          borda = q.retorno ? C.erro : C.sky;
        }
        caixa(ctx, x, y, bw, bh, f, { fundo: fundo, borda: borda, fonte: '600 11px Inter, system-ui, sans-serif' });
        if (k < n - 1) seta(ctx, x + bw + 2, y + bh / 2, x + bw + gap - 2, y + bh / 2);
      });
      if (q.retorno) {
        const xa = x0 + 3 * (bw + gap) + bw / 2, xb = x0 + bw / 2, yb = y + bh;
        ctx.save();
        ctx.strokeStyle = C.erro; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(xa, yb);
        ctx.bezierCurveTo(xa, yb + 110, xb, yb + 110, xb, yb + 40);
        ctx.stroke();
        ctx.restore();
        seta(ctx, xb, yb + 40, xb, yb + 6, C.erro);
        rotulo(ctx, 'retrabalho', (xa + xb) / 2, yb + 96, { cor: C.erro, alinha: 'center' });
      }
    } else {
      const cols = q.etapas.length, gap = 8, rh = 50, x0 = 110;
      const cw = Math.min(118, (w - x0 - 16 - gap * (cols - 1)) / cols);
      const y0 = h * 0.12;
      for (let r = 0; r < q.incs; r++) {
        const y = y0 + r * (rh + 20);
        rotulo(ctx, 'Incremento ' + (r + 1), 14, y + rh / 2);
        for (let e = 0; e < cols; e++) {
          const i = r * cols + e, x = x0 + e * (cw + gap);
          let fundo = C.fundo, borda = C.borda;
          if (i < q.idx) { fundo = C.okFundo; borda = C.ok; }
          if (i === q.idx) { fundo = C.skyFundo; borda = C.sky; }
          caixa(ctx, x, y, cw, rh, q.etapas[e], { fundo: fundo, borda: borda, fonte: '600 11px Inter, system-ui, sans-serif' });
        }
      }
    }
  }

  /* ================================================================== */
  /* 2. Requisitos: do adjetivo vago à rastreabilidade                   */
  /* ================================================================== */
  function geraRequisitos() {
    return [
      F('Requisito vago: <strong>“o sistema deve ser rápido”</strong>. Como testar isso? Não dá. Cada pessoa da equipe vai entender “rápido” de um jeito.', { etapa: 0 }),
      F('Trocar o adjetivo por um número: <strong>“até 300 ms no percentil 95, com 500 usuários simultâneos”</strong>. Agora existe um teste que passa ou falha.', { etapa: 1 }),
      F('A mesma necessidade como <strong>história de usuário</strong>, com critérios de aceitação em Dado / Quando / Então. Esses critérios viram testes de aceitação.', { etapa: 2 }),
      F('<strong>Rastreabilidade</strong>: o requisito RF-07 aponta para o teste CT-07, que aponta para a função no código. Se o requisito mudar, sabemos o que revisar.', { etapa: 3 })
    ];
  }

  function desenhaRequisitos(ctx, w, h, q) {
    const cx = w / 2, bw = Math.min(w - 40, 520), x = cx - bw / 2;
    if (q.etapa === 0) {
      caixa(ctx, x + bw * 0.15, h * 0.3, bw * 0.7, 70, '“O sistema deve ser rápido”', { borda: C.erro, fundo: C.erroFundo });
      rotulo(ctx, '✗ não testável', cx, h * 0.3 + 98, { cor: C.erro, alinha: 'center' });
    } else if (q.etapa === 1) {
      caixa(ctx, x + bw * 0.1, h * 0.3, bw * 0.8, 70,
        ['Consultas de catálogo: até 300 ms', 'percentil 95 · 500 usuários simultâneos'],
        { borda: C.ok, fundo: C.okFundo, lh: 20 });
      rotulo(ctx, '✓ mensurável: o teste de carga responde sim ou não', cx, h * 0.3 + 98, { cor: C.ok, alinha: 'center' });
    } else if (q.etapa === 2) {
      caixa(ctx, x + bw * 0.1, h * 0.12, bw * 0.8, 160,
        ['Como cliente, quero filtrar produtos por preço',
          'Dado um catálogo com 1.000 itens',
          'Quando informo a faixa de R$ 50 a R$ 100',
          'Então vejo somente os itens dessa faixa'],
        { borda: C.sky, fundo: C.skyFundo, lh: 24, fonte: '500 12px Inter, system-ui, sans-serif' });
    } else {
      const itens = [['RF-07', 'Requisito'], ['CT-07', 'Teste'], ['filtrar()', 'Código']];
      const bwb = (bw - 60) / 3, y = h * 0.3, hb = 80;
      itens.forEach((it, k) => {
        const bx = x + k * (bwb + 30);
        caixa(ctx, bx, y, bwb, hb, it, { borda: C.roxo, fundo: C.roxoFundo, lh: 20 });
        if (k < 2) seta(ctx, bx + bwb + 3, y + hb / 2, bx + bwb + 27, y + hb / 2, C.roxo);
      });
      rotulo(ctx, 'Se RF-07 mudar, CT-07 e filtrar() entram na revisão.', cx, y + hb + 36, { cor: C.roxo, alinha: 'center' });
    }
  }

  /* ================================================================== */
  /* 3. Testes: a pirâmide                                               */
  /* ================================================================== */
  function geraTestes() {
    return [
      F('<strong>Unitários</strong> testam uma função ou classe isolada. Centenas deles rodam em poucos segundos e apontam exatamente onde está o erro.', { ativa: 0, n: [40, 0, 0] }),
      F('<strong>Integração</strong> verifica módulos juntos: repositório com banco de teste, serviço com API externa simulada. São mais lentos e em menor número.', { ativa: 1, n: [40, 12, 0] }),
      F('<strong>Ponta a ponta</strong> percorre o sistema como um usuário faria. São os mais lentos e os mais frágeis, por isso são poucos.', { ativa: 2, n: [40, 12, 4] }),
      F('Um erro de cálculo de imposto só apareceu no teste de ponta a ponta, depois de seis minutos. Um teste unitário teria apontado a falha em milissegundos.', { ativa: 2, n: [40, 12, 4], bug: true })
    ];
  }

  function desenhaTestes(ctx, w, h, q) {
    const topo = h * 0.06, base = h * 0.94, cx = w * 0.3;
    const meia = Math.min(w * 0.22, 120);
    const largura = y => meia * (y - topo) / (base - topo);
    const t3 = (base - topo) / 3;
    const camadas = [
      { i: 2, nome: 'Ponta a ponta', cor: C.alerta, y1: topo, y2: topo + t3, n: q.n[2], tempo: '~6 min' },
      { i: 1, nome: 'Integração', cor: C.sky, y1: topo + t3, y2: topo + 2 * t3, n: q.n[1], tempo: '~40 s' },
      { i: 0, nome: 'Unitários', cor: C.ok, y1: topo + 2 * t3, y2: base, n: q.n[0], tempo: '~2 s' }
    ];
    camadas.forEach(c => {
      const h1 = largura(c.y1), h2 = largura(c.y2);
      ctx.save();
      ctx.fillStyle = c.i === q.ativa ? c.cor + '33' : C.fundo;
      ctx.strokeStyle = c.cor; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, c.y1);
      ctx.lineTo(cx + h1, c.y1);
      ctx.lineTo(cx + h2, c.y2);
      ctx.lineTo(cx - h2, c.y2);
      ctx.lineTo(cx - h1, c.y1);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();

      const meioY = (c.y1 + c.y2) / 2, hm = largura(meioY) * 0.8;
      const porLinha = Math.max(1, Math.floor(hm * 2 / 14));
      for (let k = 0; k < c.n; k++) {
        const lin = Math.floor(k / porLinha), col = k % porLinha;
        const dx = (col - (porLinha - 1) / 2) * 14;
        const dy = c.y1 + 14 + lin * 14;
        const cor = (q.bug && c.i === 2 && k === 0) ? C.erro : c.cor;
        bolinha(ctx, cx + dx, dy, 4, cor);
      }

      const ly = (c.y1 + c.y2) / 2;
      rotulo(ctx, c.nome, w * 0.62, ly - 8, { cor: c.i === q.ativa ? c.cor : C.mudo, fonte: FONTE });
      rotulo(ctx, c.n + ' testes · ' + c.tempo, w * 0.62, ly + 9, { cor: C.mudo, fonte: FONTE_SUAVE });
    });
    if (q.bug) {
      rotulo(ctx, '● bug só aparece aqui', w * 0.62, topo + t3 / 2 + 26, { cor: C.erro, fonte: FONTE_SUAVE });
    }
  }

  /* ================================================================== */
  /* 4. Qualidade: dívida técnica com e sem refatoração                  */
  /* ================================================================== */
  function geraDivida(op) {
    const Q = [];
    for (let s = 1; s <= 8; s++) {
      const dados = [];
      for (let k = 1; k <= s; k++) {
        const juros = op === 'sem' ? Math.min(70, 8 * (k - 1)) : 0;
        const refat = op === 'com' ? 10 : 0;
        dados.push({ feat: 100 - juros - refat, juros: juros, refat: refat });
      }
      const ult = dados[dados.length - 1];
      const t = op === 'sem'
        ? `Sprint ${s}: <strong>${ult.juros}%</strong> da capacidade vai para contornar código difícil de mudar. Sobram <strong>${ult.feat}%</strong> para funcionalidades.`
        : `Sprint ${s}: <strong>10%</strong> vai para refatorar. As funcionalidades mantêm <strong>${ult.feat}%</strong> da capacidade, porque a complexidade não cresce.`;
      Q.push(F(t, { dados: dados }));
    }
    return Q;
  }

  function desenhaDivida(ctx, w, h, q) {
    const x0 = 40, y0 = h * 0.06, hb = h * 0.7, base = y0 + hb, n = 8, gap = 10;
    const bw = Math.min(46, (w - x0 - 12 - gap * (n - 1)) / n);
    rotulo(ctx, '100%', 6, y0, { fonte: FONTE_SUAVE });
    rotulo(ctx, '0%', 6, base, { fonte: FONTE_SUAVE });
    q.dados.forEach((d, k) => {
      const x = x0 + k * (bw + gap);
      const hF = hb * d.feat / 100, hJ = hb * d.juros / 100, hR = hb * d.refat / 100;
      ctx.fillStyle = '#0ea5e9'; ctx.fillRect(x, base - hF, bw, hF);
      ctx.fillStyle = C.erro; ctx.fillRect(x, base - hF - hJ, bw, hJ);
      ctx.fillStyle = C.roxo; ctx.fillRect(x, base - hF - hJ - hR, bw, hR);
      ctx.strokeStyle = C.borda; ctx.lineWidth = 1; ctx.strokeRect(x, y0, bw, hb);
      rotulo(ctx, 'S' + (k + 1), x + bw / 2, base + 14, { cor: C.mudo, alinha: 'center', fonte: FONTE_SUAVE });
    });
    const legenda = [['funcionalidades', '#0ea5e9'], ['contornos', C.erro], ['refatoração', C.roxo]];
    legenda.forEach((l, k) => {
      const lx = x0 + k * Math.max(90, (w - x0) / 3);
      ctx.fillStyle = l[1]; ctx.fillRect(lx, h - 14, 10, 10);
      rotulo(ctx, l[0], lx + 16, h - 9, { cor: C.mudo, fonte: FONTE_SUAVE });
    });
  }

  /* ================================================================== */
  /* 5. Trade-offs: a escolha depende dos pesos                          */
  /* ================================================================== */
  const OPCOES_ARQ = [
    { nome: 'Monólito', notas: [5, 1, 5, 5] },
    { nome: 'Monólito modular', notas: [4, 2, 4, 4] },
    { nome: 'Microsserviços', notas: [1, 5, 1, 2] }
  ];
  const ATRIBUTOS = ['Simplicidade', 'Escalar partes', 'Custo inicial', 'Entrega rápida'];

  function geraTradeoff() {
    return [
      F('Pesos iguais: sem contexto, nenhum atributo importa mais. O monólito vence, por pouco.', { pesos: [1, 1, 1, 1] }),
      F('Equipe de três pessoas e prazo curto: simplicidade, custo e entrega pesam mais. O monólito continua na frente.', { pesos: [3, 1, 2, 2] }),
      F('Agora só importa escalar um módulo que recebe dez vezes mais tráfego. Os pesos mudam, e a resposta muda com eles.', { pesos: [1, 5, 1, 1] }),
      F('Com custo e simplicidade ainda pesando, o monólito volta a vencer. Não existe arquitetura “melhor” em abstrato.', { pesos: [3, 3, 4, 3] })
    ];
  }

  function desenhaTradeoff(ctx, w, h, q) {
    const cores = [C.sky, C.roxo, C.ok, C.alerta];
    const teto = 5 * q.pesos.reduce((a, b) => a + b, 0);
    const totais = OPCOES_ARQ.map(o => o.notas.reduce((s, n, k) => s + n * q.pesos[k], 0));
    const vence = totais.indexOf(Math.max(...totais));
    const base = h * 0.8, altoMax = h * 0.56, gap = 36;
    const bw = Math.min(100, (w - 40 - 2 * gap) / 3);
    const x0 = (w - (3 * bw + 2 * gap)) / 2;

    ATRIBUTOS.forEach((a, k) => {
      const lx = 14 + (k % 2) * (w / 2), ly = 14 + Math.floor(k / 2) * 16;
      ctx.fillStyle = cores[k]; ctx.fillRect(lx, ly - 5, 10, 10);
      rotulo(ctx, a, lx + 16, ly, { cor: C.mudo, fonte: FONTE_SUAVE });
    });

    OPCOES_ARQ.forEach((o, i) => {
      const x = x0 + i * (bw + gap);
      let y = base;
      o.notas.forEach((n, k) => {
        const seg = altoMax * n * q.pesos[k] / teto;
        ctx.fillStyle = cores[k];
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x, y - seg, bw, seg);
        ctx.globalAlpha = 1;
        y -= seg;
      });
      ctx.strokeStyle = i === vence ? C.ok : C.borda;
      ctx.lineWidth = i === vence ? 2.5 : 1;
      ctx.strokeRect(x, y, bw, base - y);
      rotulo(ctx, String(totais[i]), x + bw / 2, y - 12, { cor: C.txt, alinha: 'center', fonte: FONTE });
      rotulo(ctx, o.nome, x + bw / 2, base + 16, { cor: i === vence ? C.ok : C.mudo, alinha: 'center', fonte: FONTE_SUAVE });
    });
    rotulo(ctx, 'vencedor', x0 + vence * (bw + gap) + bw / 2, base + 32, { cor: C.ok, alinha: 'center', fonte: FONTE_SUAVE });
  }

  /* ================================================================== */
  /* 6. Estilos: arquitetura hexagonal (portas e adaptadores)            */
  /* ================================================================== */
  function geraHexagonal() {
    return [
      F('As setas de dependência apontam <strong>para dentro</strong>. Os adaptadores conhecem o núcleo; o núcleo não conhece banco, HTTP nem framework.', { passo: 0 }),
      F('O adaptador HTTP recebe <code>POST /pedidos</code> e traduz o JSON para um comando <code>CriarPedido</code>.', { passo: 1 }),
      F('O núcleo aplica as regras (estoque, desconto, limite) e chama a <strong>porta</strong> <code>PedidoRepositorio</code>, uma interface que ele mesmo define.', { passo: 2 }),
      F('O adaptador de banco implementa essa interface com SQL. Trocar o banco não mexe nas regras.', { passo: 3 }),
      F('Nos testes, o núcleo recebe um repositório falso em memória. As regras são testadas sem subir servidor nem banco.', { passo: 4 })
    ];
  }

  function desenhaHexagonal(ctx, w, h, q) {
    const cx = w / 2, cy = h / 2 + 8;
    const R = Math.min(w * 0.17, h * 0.26, 80);
    const bw = Math.max(70, w * 0.2), bh = 56;
    const ativoCore = q.passo === 2 || q.passo === 4;
    const xh = 8, xd = w - 8 - bw;

    ctx.save();
    ctx.fillStyle = ativoCore ? C.skyFundo : C.fundo;
    ctx.strokeStyle = ativoCore ? C.sky : C.borda; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = Math.PI / 3 * k;
      const px = cx + R * Math.cos(a), py = cy + R * Math.sin(a);
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    rotulo(ctx, 'Núcleo', cx, cy - 12, { cor: C.txt, alinha: 'center', fonte: FONTE });
    rotulo(ctx, 'regras de negócio', cx, cy + 4, { cor: C.mudo, alinha: 'center', fonte: FONTE_SUAVE });
    if (q.passo === 4) rotulo(ctx, 'testes: repositório falso', cx, cy + 20, { cor: C.sky, alinha: 'center', fonte: FONTE_SUAVE });

    const ativoHttp = q.passo === 1, ativoDb = q.passo === 3;
    caixa(ctx, xh, cy - bh / 2, bw, bh, ['Adaptador', 'HTTP'],
      { fundo: ativoHttp ? C.skyFundo : C.fundo, borda: ativoHttp ? C.sky : C.borda, fonte: '600 11px Inter, system-ui, sans-serif' });
    caixa(ctx, xd, cy - bh / 2, bw, bh, ['Adaptador', 'banco SQL'],
      { fundo: ativoDb ? C.skyFundo : C.fundo, borda: ativoDb ? C.sky : C.borda, fonte: '600 11px Inter, system-ui, sans-serif' });
    const topoCore = cy - R * 0.866;
    caixa(ctx, cx - 62, 6, 124, 40, ['Adaptador', 'fila / e-mail'], { fonte: '600 11px Inter, system-ui, sans-serif', lh: 14 });

    const xEsqCore = cx - R, xDirCore = cx + R;
    seta(ctx, xh + bw + 3, cy - 16, xEsqCore - 3, cy - 16, C.mudo);
    seta(ctx, xd - 3, cy - 16, xDirCore + 3, cy - 16, C.mudo);
    seta(ctx, cx, 46 + 3, cx, topoCore - 3, C.mudo);

    if (q.passo === 1) seta(ctx, xh + bw + 3, cy + 14, xEsqCore - 3, cy + 14, C.sky);
    if (q.passo === 2 || q.passo === 3) seta(ctx, xDirCore + 3, cy + 14, xd - 3, cy + 14, C.sky);
    rotulo(ctx, 'dependência', cx - R - 4, cy - 30, { cor: C.mudo, alinha: 'right', fonte: FONTE_SUAVE });
  }

  /* ================================================================== */
  /* 7. Mensageria: fila, confirmação e mensagens mortas                 */
  /* ================================================================== */
  function geraMensageria() {
    return [
      F('O produtor publica o evento <code>PedidoCriado #42</code> no broker. Ele não sabe quantos consumidores existem nem quem são.', { onde: 'produtor', tent: 0, ack: false, falha: false }),
      F('O broker guarda a mensagem na fila. Ela fica persistida até alguém confirmar o processamento.', { onde: 'fila', tent: 0, ack: false, falha: false }),
      F('O consumidor <strong>Estoque</strong> recebe, processa e envia <em>ack</em>. A mensagem sai da fila.', { onde: 'estoque', tent: 0, ack: true, falha: false }),
      F('O consumidor <strong>E-mail</strong> falha por erro de rede. Sem <em>ack</em>, o broker reentrega. Esta é a tentativa 2 de 3.', { onde: 'email', tent: 2, ack: true, falha: true }),
      F('A tentativa 3 também falha. Após o limite, a mensagem vai para a <strong>fila de mensagens mortas</strong> (DLQ), para análise humana.', { onde: 'dlq', tent: 3, ack: true, falha: true })
    ];
  }

  function desenhaMensageria(ctx, w, h, q) {
    const bw = w * 0.2, bh = 54;
    const P = {
      produtor: [w * 0.03, h * 0.4],
      fila: [w * 0.37, h * 0.4],
      estoque: [w * 0.74, h * 0.1],
      email: [w * 0.74, h * 0.68],
      dlq: [w * 0.37, h * 0.8]
    };
    const alvo = { produtor: P.produtor, fila: P.fila, estoque: P.estoque, email: P.email, dlq: P.dlq };
    const centro = k => [alvo[k][0] + bw / 2, alvo[k][1] + bh / 2];

    const [pxP, pyP] = centro('produtor'), [pxF, pyF] = centro('fila');
    const [pxE, pyE] = centro('estoque'), [pxM, pyM] = centro('email'), [pxD, pyD] = centro('dlq');
    seta(ctx, P.produtor[0] + bw + 4, pyP, P.fila[0] - 4, pyF, C.mudo);
    seta(ctx, P.fila[0] + bw + 4, pyF - 8, P.estoque[0] - 4, pyE + 4, q.onde === 'estoque' ? C.sky : C.borda);
    seta(ctx, P.fila[0] + bw + 4, pyF + 8, P.email[0] - 4, pyM - 4, C.borda);
    ctx.save(); ctx.setLineDash([5, 4]);
    seta(ctx, pxF, P.fila[1] + bh + 3, pxD, P.dlq[1] - 3, q.onde === 'dlq' ? C.erro : C.borda);
    ctx.restore();

    caixa(ctx, P.produtor[0], P.produtor[1], bw, bh, ['Produtor'], { fonte: '600 11px Inter, system-ui, sans-serif' });
    caixa(ctx, P.fila[0], P.fila[1], bw, bh, ['Broker', 'fila'], { fonte: '600 11px Inter, system-ui, sans-serif', lh: 14 });
    caixa(ctx, P.estoque[0], P.estoque[1], bw, bh, ['Estoque'], { fonte: '600 11px Inter, system-ui, sans-serif',
      borda: q.ack && q.onde === 'estoque' ? C.ok : C.borda });
    caixa(ctx, P.email[0], P.email[1], bw, bh, ['E-mail'], { fonte: '600 11px Inter, system-ui, sans-serif',
      borda: q.falha ? C.erro : C.borda, fundo: q.falha ? C.erroFundo : C.fundo });
    caixa(ctx, P.dlq[0], P.dlq[1], bw, bh, ['DLQ', 'mortas'], { fonte: '600 11px Inter, system-ui, sans-serif', lh: 14,
      borda: q.onde === 'dlq' ? C.erro : C.borda, fundo: q.onde === 'dlq' ? C.erroFundo : C.fundo });

    const pos = { produtor: [pxP, P.produtor[1] - 14], fila: [pxF, P.fila[1] + bh / 2], estoque: [pxE, P.estoque[1] - 14],
      email: [pxM, P.email[1] - 14], dlq: [pxD, P.dlq[1] - 14] };
    const [tx, ty] = pos[q.onde];
    ctx.save();
    ctx.fillStyle = q.falha && q.onde === 'email' ? C.erro : C.sky;
    AH.roundRect(ctx, tx - 22, ty - 9, 44, 18, 9); ctx.fill();
    ctx.fillStyle = '#020617'; ctx.font = '700 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('#42', tx, ty);
    ctx.restore();

    if (q.ack) rotulo(ctx, '✓ ack', P.estoque[0] + bw + 6, P.estoque[1] + bh / 2, { cor: C.ok, fonte: FONTE_SUAVE });
    if (q.falha) {
      rotulo(ctx, '✗ erro de rede', P.email[0] + bw + 6, P.email[1] + bh / 2, { cor: C.erro, fonte: FONTE_SUAVE });
      rotulo(ctx, 'tentativa ' + Math.min(q.tent, 3) + '/3', P.email[0], P.email[1] + bh + 12, { cor: C.alerta, fonte: FONTE_SUAVE });
    }
  }

  /* ================================================================== */
  /* 8. Evolução: Strangler Fig (migração gradual do monólito)           */
  /* ================================================================== */
  function geraEstrangulamento() {
    return [
      F('Fase 0: uma <strong>fachada</strong> entra na frente do monólito. Nada muda para o usuário, mas o roteamento já passa por ela.', { p: 0 }),
      F('Primeira fatia: o catálogo vai para um novo serviço. Um quarto das rotas agora responde pelo código novo.', { p: 25 }),
      F('Metade migrada. Cada fatia tem testes de contrato que garantem o mesmo comportamento de antes.', { p: 50 }),
      F('Quase tudo migrado. O monólito encolhe aos poucos, em vez de ser reescrito de uma vez.', { p: 75 }),
      F('Monólito desligado. A fachada continua como ponto de entrada, agora apontando só para os serviços.', { p: 100 })
    ];
  }

  function desenhaEstrangulamento(ctx, w, h, q) {
    const x0 = 20, larg = w - 40, gap = 8;
    const fr = q.p / 100;
    caixa(ctx, w * 0.3, 8, w * 0.4, 34, 'Usuários', { fonte: FONTE, fundo: C.fundo });
    seta(ctx, w / 2, 44, w / 2, 62, C.mudo);
    caixa(ctx, x0, 62, larg, 40, 'Fachada / roteador', { borda: C.sky, fundo: C.skyFundo });
    const yb = 150, hb = 96;
    const lm = Math.max(0, (larg - gap) * (1 - fr)), ld = Math.max(0, (larg - gap) * fr);
    seta(ctx, w * 0.3, 102, x0 + lm / 2, yb - 4, C.borda);
    seta(ctx, w * 0.7, 102, x0 + lm + gap + ld / 2, yb - 4, C.borda);
    if (lm > 0) caixa(ctx, x0, yb, lm, hb, lm > 90 ? ['Monólito', (100 - q.p) + '% das rotas'] : '', { borda: C.alerta, fundo: C.alertaFundo, lh: 18 });
    if (ld > 0) caixa(ctx, x0 + lm + gap, yb, ld, hb, ld > 90 ? ['Novos serviços', q.p + '% das rotas'] : '', { borda: C.ok, fundo: C.okFundo, lh: 18 });
    rotulo(ctx, 'tráfego migrado: ' + q.p + '%', w / 2, yb + hb + 22, { cor: C.txt, alinha: 'center', fonte: FONTE });
  }

  /* ================================================================== */
  /* 9. Git: branch de funcionalidade, pull request e merge              */
  /* ================================================================== */
  function geraGit() {
    return [
      F('A <code>main</code> recebe commits pequenos e sempre funcionais. Ela é a linha que chega à produção.', { fase: 0 }),
      F('Uma branch de funcionalidade nasce de um commit estável: <code>git switch -c feature/filtro-preco</code>.', { fase: 1 }),
      F('Commits pequenos na branch, cada um com mensagem que explica o porquê. A <code>main</code> não é tocada.', { fase: 2 }),
      F('Abre-se um <strong>pull request</strong>. A revisão de um colega e a pipeline de testes precisam aprovar antes do merge. Enquanto isso, a <code>main</code> segue andando.', { fase: 3 }),
      F('Após a aprovação, o merge integra a funcionalidade. A branch curta pode ser apagada: ela já cumpriu o papel.', { fase: 4 })
    ];
  }

  function desenhaGit(ctx, w, h, q) {
    const yM = h * 0.3, yF = h * 0.76;
    const X = f => 40 + f * (w - 80);
    const no = (x, y, cor) => { ctx.save(); ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore(); };
    const linha = (x1, y1, x2, y2, cor) => { ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); };

    linha(X(0.05), yM, X(q.fase >= 3 ? 0.62 : 0.25), yM, C.mudo);
    if (q.fase >= 3) linha(X(0.62), yM, X(q.fase >= 4 ? 0.92 : 0.62), yM, C.mudo);
    if (q.fase >= 1) {
      ctx.save(); ctx.strokeStyle = C.sky; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(X(0.25), yM); ctx.bezierCurveTo(X(0.3), yF, X(0.36), yF, X(0.4), yF); ctx.stroke();
      ctx.restore();
    }
    if (q.fase >= 2) linha(X(0.4), yF, X(0.58), yF, C.sky);
    if (q.fase >= 4) {
      ctx.save(); ctx.strokeStyle = C.ok; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(X(0.58), yF); ctx.bezierCurveTo(X(0.7), yF, X(0.8), yM, X(0.92), yM); ctx.stroke();
      ctx.restore();
    }

    no(X(0.05), yM, C.mudo); no(X(0.25), yM, C.mudo);
    if (q.fase >= 3) no(X(0.62), yM, C.mudo);
    if (q.fase >= 4) no(X(0.92), yM, C.ok);
    if (q.fase >= 2) { no(X(0.4), yF, C.sky); no(X(0.58), yF, C.sky); }

    rotulo(ctx, 'main', X(0.05), yM - 22, { cor: C.txt, fonte: FONTE });
    if (q.fase >= 1) rotulo(ctx, 'feature/filtro-preco', X(0.4), yF + 24, { cor: C.sky, fonte: FONTE_SUAVE });
    if (q.fase >= 3) {
      rotulo(ctx, 'commit de outro colega', X(0.62), yM - 22, { cor: C.mudo, alinha: 'center', fonte: FONTE_SUAVE });
      caixa(ctx, X(0.6), yF - 34, Math.min(170, w * 0.42), 26, 'PR #12 · revisão ✓ · CI ✓', { borda: C.ok, fundo: C.okFundo, fonte: FONTE_SUAVE });
    }
    if (q.fase >= 4) rotulo(ctx, 'merge', X(0.92), yM - 22, { cor: C.ok, alinha: 'center', fonte: FONTE_SUAVE });
  }

  /* ================================================================== */
  /* 10. Código: pipeline de validação e erros que param no lugar certo  */
  /* ================================================================== */
  const ETAPAS_VAL = ['Recebe o JSON', 'Valida os campos', 'Regra de negócio', 'Persiste no banco', 'Responde 201'];

  function geraValidacao(op) {
    const Q = [];
    const entrada = '{"quantidade": 3, "preco": 20}';
    if (op === 'valido') {
      Q.push(F('A requisição chega com <code>' + entrada + '</code>. O primeiro passo é apenas recebê-la.', { k: 0, falha: false }));
      Q.push(F('A validação confere tipos e faixas: quantidade inteira e maior que zero. Erros de entrada são barrados aqui, na borda.', { k: 1, falha: false }));
      Q.push(F('A regra de negócio calcula o total e confere o estoque. Ela não sabe nada de HTTP.', { k: 2, falha: false }));
      Q.push(F('A persistência grava o pedido em uma transação.', { k: 3, falha: false }));
      Q.push(F('Resposta <code>201 Created</code> com o identificador do pedido. Cada etapa fez uma coisa só.', { k: 4, falha: false }));
    } else {
      Q.push(F('Agora a requisição traz <code>{"quantidade": -3}</code>. O primeiro passo continua igual.', { k: 0, falha: false }));
      Q.push(F('A validação encontra <strong>quantidade = -3</strong>. A pipeline para aqui e o cliente recebe um <code>422</code> dizendo o campo e a regra violada.', { k: 1, falha: true, msg: '422 · quantidade deve ser > 0' }));
      Q.push(F('<strong>Anti-padrão:</strong> capturar qualquer exceção, devolver um genérico “erro interno” e seguir em frente. O cliente não sabe o que corrigir, e o log não ajuda.', { k: 1, falha: true, msg: '500 · erro interno' }));
    }
    return Q;
  }

  function desenhaValidacao(ctx, w, h, q) {
    const bw = Math.min(220, w * 0.5), bh = 36, x = w * 0.05, n = ETAPAS_VAL.length;
    const passo = (h - 20 - bh) / (n - 1);
    ETAPAS_VAL.forEach((e, k) => {
      const y = 10 + k * passo;
      let fundo = C.fundo, borda = C.borda;
      if (k < q.k) { fundo = C.okFundo; borda = C.ok; }
      if (k === q.k) { fundo = q.falha ? C.erroFundo : C.skyFundo; borda = q.falha ? C.erro : C.sky; }
      caixa(ctx, x, y, bw, bh, e, { fundo: fundo, borda: borda, fonte: '600 11px Inter, system-ui, sans-serif' });
      if (k < n - 1) seta(ctx, x + bw / 2, y + bh + 1, x + bw / 2, y + passo - 1, C.borda);
    });
    if (q.msg) {
      const mx = x + bw + 24, my = 10 + q.k * passo;
      caixa(ctx, mx, my - 4, Math.max(120, w - mx - 12), bh + 8, q.msg, { borda: C.erro, fundo: C.erroFundo, cor: '#fecaca', fonte: '600 11px Inter, system-ui, sans-serif' });
    } else {
      rotulo(ctx, q.k === 0 ? 'entrada' : (q.k === 4 ? 'saída' : 'em processamento'), x + bw + 24, 10 + q.k * passo + bh / 2, { cor: C.mudo, fonte: FONTE_SUAVE });
    }
  }

  /* ================================================================== */
  /* 11. Ciclo TDD: vermelho, verde, refatorar                           */
  /* ================================================================== */
  function geraTDD() {
    return [
      F('<strong>Vermelho</strong>: escreva um teste para um comportamento que ainda não existe. <code>deve_aplicar_10_por_cento()</code> espera 180 para uma compra de 200. Ele falha.', { no: 0, testes: 1, falhas: 1 }),
      F('<strong>Verde</strong>: escreva o código <em>mínimo</em> para passar: <code>return valor * 0.9</code>. Não generalize além do que o teste pede.', { no: 1, testes: 1, falhas: 0 }),
      F('<strong>Refatorar</strong>: dê nome à taxa (<code>TAXA_DESCONTO = 0.10</code>) e limpe a estrutura. Os testes continuam verdes, então o comportamento não mudou.', { no: 2, testes: 1, falhas: 0 }),
      F('Novo requisito: acima de R$ 1.000, o desconto sobe para 15%. Um novo teste falha de novo, e o ciclo recomeça.', { no: 0, testes: 2, falhas: 1 })
    ];
  }

  function desenhaTDD(ctx, w, h, q) {
    const nos = [
      { nome: ['Vermelho', 'teste falha'], cor: C.erro, fundo: C.erroFundo, x: w * 0.27, y: h * 0.28 },
      { nome: ['Verde', 'código mínimo'], cor: C.ok, fundo: C.okFundo, x: w * 0.73, y: h * 0.28 },
      { nome: ['Refatorar', 'sem mudar o comportamento'], cor: C.roxo, fundo: C.roxoFundo, x: w * 0.5, y: h * 0.8 }
    ];
    const bw = Math.min(170, w * 0.42), bh = 56;
    const cen = n => [n.x, n.y];
    const pares = [[0, 1], [1, 2], [2, 0]];
    pares.forEach(([a, b], k) => {
      const A = cen(nos[a]), B = cen(nos[b]);
      const destino = q.no === b;
      seta(ctx, A[0] + (B[0] - A[0]) * 0.28, A[1] + (B[1] - A[1]) * 0.28, A[0] + (B[0] - A[0]) * 0.72, A[1] + (B[1] - A[1]) * 0.72,
        destino ? C.sky : C.borda);
    });
    nos.forEach((n, k) => {
      const ativo = q.no === k;
      caixa(ctx, n.x - bw / 2, n.y - bh / 2, bw, bh, n.nome,
        { fundo: ativo ? n.fundo : C.fundo, borda: ativo ? n.cor : C.borda, cor: ativo ? n.cor : C.txt, lh: 18,
          fonte: '600 12px Inter, system-ui, sans-serif' });
    });
    rotulo(ctx, 'testes: ' + q.testes + ' · falhas: ' + q.falhas, 12, h - 10, { cor: C.mudo, fonte: FONTE_SUAVE });
  }

  /* ================================================================== */
  /* 12. Entrega: pipeline de CI/CD com portões                          */
  /* ================================================================== */
  const ETAPAS_CI = ['Build', 'Testes', 'Análise', 'Imagem', 'Homolog.', 'Produção'];

  function geraCICD(op) {
    const Q = [];
    if (op === 'ok') {
      for (let k = 0; k < 6; k++) {
        const st = ETAPAS_CI.map((_, j) => j < k ? 'ok' : j === k ? 'run' : 'pend');
        const t = k === 4
          ? 'Homologação passa. A produção exige <strong>aprovação manual</strong> de um responsável: um portão que a máquina não atravessa sozinha.'
          : `Etapa <strong>${ETAPAS_CI[k]}</strong> em execução. Cada etapa só roda se a anterior passou.`;
        Q.push(F(t, { st: st, gate: k === 4 }));
      }
      Q.push(F('Mudança em produção. Como cada passo é automático e repetível, o deploy deixa de depender de quem está de plantão.', { st: ETAPAS_CI.map(() => 'ok'), gate: false }));
    } else {
      Q.push(F('A mudança entra na pipeline. O build passa.', { st: ['ok', 'run', 'pend', 'pend', 'pend', 'pend'], gate: false }));
      Q.push(F('Os <strong>testes falham</strong>. A pipeline para: nada chega à homologação nem à produção. O erro aparece no log do teste, não no cliente.', { st: ['ok', 'fail', 'pend', 'pend', 'pend', 'pend'], gate: false }));
    }
    return Q;
  }

  function desenhaCICD(ctx, w, h, q) {
    const cols = w >= 560 ? 6 : 3, rows = Math.ceil(6 / cols);
    const gap = 10, bw = (w - 32 - gap * (cols - 1)) / cols, bh = 54;
    const y0 = 16;
    const cor = { ok: [C.ok, C.okFundo, '✓ '], run: [C.sky, C.skyFundo, '… '], fail: [C.erro, C.erroFundo, '✗ '], pend: [C.borda, C.fundo, ''] };
    ETAPAS_CI.forEach((e, k) => {
      const r = Math.floor(k / cols), c = k % cols;
      const x = 16 + c * (bw + gap), y = y0 + r * (bh + 22);
      const st = q.st[k];
      caixa(ctx, x, y, bw, bh, cor[st][2] + e, { borda: cor[st][0], fundo: cor[st][1], fonte: '600 11px Inter, system-ui, sans-serif',
        cor: st === 'pend' ? C.mudo : C.txt });
      if (c < cols - 1 && k < 5) seta(ctx, x + bw + 2, y + bh / 2, x + bw + gap - 2, y + bh / 2, C.borda);
    });
    if (q.gate) rotulo(ctx, '▲ portão manual antes da produção', 16, y0 + bh + 22 + bh + 18, { cor: C.alerta, fonte: FONTE_SUAVE });
    if (q.st.indexOf('fail') >= 0) rotulo(ctx, 'pipeline parada', 16, h - 16, { cor: C.erro, fonte: FONTE_SUAVE });
  }

  /* ------------------------------------------------------------------ */
  /* API pública                                                         */
  /* ------------------------------------------------------------------ */
  /* Todo quadro começa limpo, com o mesmo fundo do palco de ED.limpa */
  const comLimpeza = desenha => (ctx, w, h, q) => {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);
    desenha(ctx, w, h, q);
  };

  global.ENG = {
    geraProcessos: geraProcessos, desenhaProcessos: comLimpeza(desenhaProcessos),
    geraRequisitos: geraRequisitos, desenhaRequisitos: comLimpeza(desenhaRequisitos),
    geraTestes: geraTestes, desenhaTestes: comLimpeza(desenhaTestes),
    geraDivida: geraDivida, desenhaDivida: comLimpeza(desenhaDivida),
    geraTradeoff: geraTradeoff, desenhaTradeoff: comLimpeza(desenhaTradeoff),
    geraHexagonal: geraHexagonal, desenhaHexagonal: comLimpeza(desenhaHexagonal),
    geraMensageria: geraMensageria, desenhaMensageria: comLimpeza(desenhaMensageria),
    geraEstrangulamento: geraEstrangulamento, desenhaEstrangulamento: comLimpeza(desenhaEstrangulamento),
    geraGit: geraGit, desenhaGit: comLimpeza(desenhaGit),
    geraValidacao: geraValidacao, desenhaValidacao: comLimpeza(desenhaValidacao),
    geraTDD: geraTDD, desenhaTDD: comLimpeza(desenhaTDD),
    geraCICD: geraCICD, desenhaCICD: comLimpeza(desenhaCICD)
  };
})(window);
