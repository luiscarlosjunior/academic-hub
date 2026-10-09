/* =====================================================================
   Sistemas Distribuídos e em Cloud — animações da aula
   Usada pelas páginas de tópico em disciplinas/sistemas-distribuidos-cloud/topicos/.
   Depende de assets/js/hub.js (canvas, setas e retângulos arredondados)
   e de assets/js/estrutura-dados.js (motor ED.criaAnimacao: quadros + controles).
   Expõe tudo em window.SD.
   ===================================================================== */
(function (global) {
  'use strict';

  const CORES = {
    txt: '#e2e8f0', mudo: '#64748b',
    azul: '#38bdf8', verde: '#10b981', amarelo: '#f59e0b', rosa: '#f43f5e', roxo: '#a855f7'
  };

  function limpa(ctx, w, h) {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);
  }

  function rotulo(ctx, texto, x, y, cor, alinh) {
    ctx.fillStyle = cor || CORES.mudo;
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    ctx.textAlign = alinh || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, x, y);
  }

  function bolha(ctx, x, y, r, borda, texto) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = borda;
    ctx.stroke();
    ctx.fillStyle = CORES.txt;
    ctx.font = '600 13px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, x, y);
  }

  /* ===================================================================
     1. RELÓGIO LÓGICO DE LAMPORT
     Três processos trocam mensagens. Cada evento recebe um número L:
     evento local ou envio → L + 1; recebimento → max(L local, L da mensagem) + 1.
     =================================================================== */
  const PROCESSOS = ['P1', 'P2', 'P3'];

  /* p = processo (0..2); col = posição no tempo físico (só para desenhar);
     de = índice do envio correspondente, quando o evento é um recebimento */
  const EVENTOS = [
    { p: 0, col: 0, L: 1, t: 'P1 executa um evento local. Seu relógio passa de 0 para 1.' },
    { p: 0, col: 1, L: 2, t: 'P1 envia a mensagem m para P2 e carrega o carimbo L = 2 nela.' },
    { p: 1, col: 2, L: 3, de: 1, t: 'P2 recebe m. Seu relógio local valia 0, então L = max(0, 2) + 1 = 3.' },
    { p: 2, col: 0, L: 1, t: 'P3 executa um evento local independente. Seu relógio vai para 1.' },
    { p: 1, col: 3, L: 4, t: 'P2 envia m\' para P3 com L = 4.' },
    { p: 2, col: 4, L: 5, de: 4, t: 'P3 recebe m\'. L = max(1, 4) + 1 = 5. A ordem causal é respeitada.' },
    { p: 0, col: 3, L: 3, t: 'P1 executa outro evento local: L = 2 + 1 = 3. Ele não tem relação causal com o recebimento de P2 (também L = 3): os carimbos não dizem qual veio antes.' }
  ];

  /* Relógios vetoriais sobre os mesmos sete eventos: um vetor [P1, P2, P3] por evento */
  const VETORES = ['[1,0,0]', '[2,0,0]', '[2,1,0]', '[0,0,1]', '[2,2,0]', '[2,2,2]', '[3,0,0]'];
  const TEXTO_VETORIAL = [
    'P1 executa um evento local. Seu vetor passa de [0,0,0] para [1,0,0]: só a posição de P1 muda.',
    'P1 envia m para P2. O vetor de P1 vira [2,0,0], e esse vetor viaja com a mensagem.',
    'P2 recebe m. Cada posição recebe o máximo: [2,0,0]. Depois P2 incrementa a sua: [2,1,0].',
    'P3 executa um evento local independente. Seu vetor vira [0,0,1].',
    'P2 envia m\' com o vetor [2,2,0].',
    'P3 recebe m\': o máximo de [0,0,1] e [2,2,0] é [2,2,1]. P3 incrementa a sua posição: [2,2,2].',
    'P1 executa outro evento local: [3,0,0]. Compare com [2,1,0], de P2: nenhum é menor ou igual ao outro. São concorrentes, e o relógio vetorial mostra isso.'
  ];

  /* modo: 'lamport' mostra o carimbo L; 'vetorial' mostra o vetor completo */
  function geraLamport(modo) {
    const vet = modo === 'vetorial';
    return EVENTOS.map((e, k) => ({
      k,
      modo: vet ? 'vetorial' : 'lamport',
      rots: EVENTOS.map((f, j) => (vet ? VETORES[j] : 'L' + f.L)),
      t: vet ? TEXTO_VETORIAL[k] : e.t
    }));
  }

  function desenhaLamport(ctx, w, h, q) {
    limpa(ctx, w, h);
    const x0 = 90, x1 = w - 40;
    const ys = [0.22, 0.5, 0.78].map(f => h * f);
    const xDe = c => x0 + (c / 4) * (x1 - x0);

    PROCESSOS.forEach((nome, p) => {
      ctx.strokeStyle = 'rgba(148,163,184,.25)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x0 - 20, ys[p]);
      ctx.lineTo(x1, ys[p]);
      ctx.stroke();
      ctx.setLineDash([]);
      rotulo(ctx, nome, 24, ys[p], CORES.txt);
    });

    /* Mensagens: só aparecem depois que o envio e o recebimento já aconteceram */
    EVENTOS.forEach((e, k) => {
      if (e.de === undefined || k > q.k) return;
      const env = EVENTOS[e.de];
      const cor = k === q.k ? CORES.amarelo : CORES.azul;
      global.AH.arrow(ctx, xDe(env.col), ys[env.p], xDe(e.col), ys[e.p], cor, true);
    });

    /* Eventos: os já ocorridos ficam acesos; o atual fica em destaque */
    EVENTOS.forEach((e, k) => {
      if (k > q.k) return;
      const atual = k === q.k;
      const borda = atual ? CORES.amarelo : CORES.verde;
      if (q.modo === 'vetorial') {
        /* Vetor completo não cabe num círculo: usa uma caixa */
        global.AH.roundRect(ctx, xDe(e.col) - 38, ys[e.p] - 13, 76, 26, 8);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = borda;
        ctx.stroke();
        ctx.fillStyle = CORES.txt;
        ctx.font = '600 12px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(q.rots[k], xDe(e.col), ys[e.p]);
      } else {
        bolha(ctx, xDe(e.col), ys[e.p], 17, borda, q.rots[k]);
      }
    });
  }

  /* ===================================================================
     2. HASH CONSISTENTE
     Chaves e servidores são espalhados num anel. Cada chave pertence ao
     primeiro servidor encontrado no sentido horário a partir dela.
     =================================================================== */
  const SERVIDORES = [
    { nome: 'A', ang: 30, cor: CORES.azul },
    { nome: 'B', ang: 150, cor: CORES.verde },
    { nome: 'C', ang: 270, cor: CORES.amarelo },
    { nome: 'D', ang: 90, cor: CORES.roxo }
  ];
  const CHAVES = [
    { nome: 'k1', ang: 60 }, { nome: 'k2', ang: 100 }, { nome: 'k3', ang: 200 },
    { nome: 'k4', ang: 300 }, { nome: 'k5', ang: 350 }
  ];

  /* Dono de um ângulo: o servidor ativo mais próximo no sentido horário */
  function dono(ang, ativos) {
    const ord = ativos.slice().sort((a, b) => a.ang - b.ang);
    const alvo = ord.find(s => s.ang >= ang);
    return alvo || ord[0];
  }

  function geraAnel() {
    return [
      { d: false, movida: null, t: 'Três servidores (A, B, C) ocupam posições no anel. Cada chave pertence ao primeiro servidor no sentido horário a partir dela.' },
      { d: false, movida: null, t: 'Com três servidores, k1 e k2 vão para B; k3 vai para C; k4 e k5 vão para A. Ao usar hash mod N, esta divisão seria recalculada inteira se N mudasse.' },
      { d: true, movida: null, t: 'Um servidor D entra na posição 90°. Só as chaves no arco entre A e D precisam ser reavaliadas.' },
      { d: true, movida: 'k1', t: 'Só k1 mudou: saiu de B e foi para D. As demais continuaram com o mesmo dono. Com hash mod N, trocar de 3 para 4 servidores moveria a maior parte das chaves.' }
    ];
  }

  function desenhaAnel(ctx, w, h, q) {
    limpa(ctx, w, h);
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.36;
    const pos = ang => {
      const a = (ang * Math.PI) / 180;
      return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
    };

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(148,163,184,.35)';
    ctx.stroke();

    const ativos = SERVIDORES.filter(s => s.nome !== 'D' || q.d);

    ativos.forEach(s => {
      const p = pos(s.ang);
      bolha(ctx, p.x, p.y, 20, s.cor, s.nome);
    });

    CHAVES.forEach(c => {
      const p = pos(c.ang);
      const owner = dono(c.ang, ativos);
      const movida = c.nome === q.movida;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = movida ? CORES.rosa : owner.cor;
      ctx.fill();
      const lbl = pos(c.ang);
      ctx.fillStyle = CORES.txt;
      ctx.font = '600 11px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.nome, lbl.x + Math.sign(lbl.x - cx) * 22, lbl.y + Math.sign(lbl.y - cy) * 12);
    });

    rotulo(ctx, 'anel de hash · sentido horário', 16, h - 16, CORES.mudo);
  }

  /* ===================================================================
     0. ENTREGA DE MENSAGENS EM REDE ASSÍNCRONA
     Três mensagens de A para B. A rede atrasa cada uma de um jeito:
     m2 chega antes de m1, e m3 nunca chega.
     Cada quadro tem o instante (tempo) e a legenda (t).
     =================================================================== */
  const MENSAGENS = [
    { id: 'm1', envio: 0, chegada: 4 },
    { id: 'm2', envio: 1, chegada: 2 },
    { id: 'm3', envio: 2, chegada: null }
  ];

  function geraEntregas() {
    return [
      { tempo: 0, t: 'A envia m1 para B. Quanto tempo ela levará é decidido pela rede, e A não sabe.' },
      { tempo: 1, t: 'A envia m2 logo depois. Enquanto m1 ainda viaja, m2 já está a caminho.' },
      { tempo: 2, t: 'm2 chega antes de m1: a rede não preserva a ordem entre mensagens diferentes. A envia m3.' },
      { tempo: 3, t: 'm3 ainda não chegou. A espera, sem saber se ela foi perdida ou se está atrasada.' },
      { tempo: 4, t: 'm1 chega. m3 nunca chega. Sem confirmação, A só pode usar timeout e retransmitir: a ausência de resposta é ambígua.' }
    ];
  }

  function desenhaEntregas(ctx, w, h, q) {
    limpa(ctx, w, h);
    const xA = 90, xB = w - 90;
    const yTopo = 56, yFim = h - 36, horizonte = 5;
    const yDe = t => yTopo + (t / horizonte) * (yFim - yTopo);

    ctx.strokeStyle = 'rgba(148,163,184,.35)';
    ctx.lineWidth = 2;
    [xA, xB].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, yTopo);
      ctx.lineTo(x, yFim);
      ctx.stroke();
    });
    rotulo(ctx, 'A', xA, yTopo - 22, CORES.txt, 'center');
    rotulo(ctx, 'B', xB, yTopo - 22, CORES.txt, 'center');
    rotulo(ctx, 'tempo', 12, yTopo, CORES.mudo);
    rotulo(ctx, String(q.tempo), 12, yDe(q.tempo), CORES.amarelo);

    MENSAGENS.forEach(m => {
      if (q.tempo < m.envio) return;
      const y0 = yDe(m.envio);
      const cor = m.chegada === null ? CORES.rosa : CORES.azul;
      if (m.chegada !== null && q.tempo >= m.chegada) {
        global.AH.arrow(ctx, xA, y0, xB, yDe(m.chegada), CORES.verde, true);
        rotulo(ctx, m.id, (xA + xB) / 2, (y0 + yDe(m.chegada)) / 2 - 12, CORES.verde, 'center');
        return;
      }
      /* Em trânsito: a ponta avança até o instante atual; a perdida para em 60% do caminho */
      const fim = m.chegada === null ? 0.6 : (q.tempo - m.envio) / (m.chegada - m.envio);
      const yAtual = m.chegada === null ? y0 + 0.6 * (yDe(m.envio + 4) - y0) : y0 + fim * (yDe(m.chegada) - y0);
      const xAtual = xA + (xB - xA) * (m.chegada === null ? 0.6 : fim);
      ctx.strokeStyle = cor;
      ctx.lineWidth = 2;
      ctx.setLineDash(m.chegada === null ? [6, 5] : []);
      ctx.beginPath();
      ctx.moveTo(xA, y0);
      ctx.lineTo(xAtual, yAtual);
      ctx.stroke();
      ctx.setLineDash([]);
      rotulo(ctx, m.id, xAtual + 10, yAtual - 10, cor);
      if (m.chegada === null && q.tempo >= m.envio + 3) rotulo(ctx, 'perdida?', xAtual + 10, yAtual + 12, CORES.rosa);
    });
  }

  /* ===================================================================
     0b. CHAMADA REMOTA COM PERDA DE RESPOSTA
     Um débito é pedido; a resposta se perde; o cliente reenvia.
     Opção "sem": o servidor executa o débito duas vezes.
     Opção "com": o identificador evita a segunda execução (idempotência).
     =================================================================== */
  function geraRPC(opcao) {
    const com = opcao === 'com';
    const ev = [
      { passo: 0, tipo: 'req', rot: 'debitar(100) id=7', txt: 'Cliente envia o pedido debitar(100), com identificador id=7.' },
      { passo: 1, tipo: 'exec', rot: 'saldo 500 → 400', txt: 'Servidor executa o débito: o saldo passa de 500 para 400.' },
      { passo: 2, tipo: 'perdida', rot: 'ok', txt: 'Servidor responde "ok", mas a resposta se perde na rede. O cliente não sabe disso.' },
      { passo: 3, tipo: 'timeout', rot: 'timeout', txt: 'O cliente espera, estoura o timeout e reenvia o mesmo pedido, com o mesmo id=7.' },
      { passo: 4, tipo: 'req', rot: 'debitar(100) id=7', txt: 'Reenvio: o pedido é idêntico, inclusive o identificador.' },
      com
        ? { passo: 5, tipo: 'reconhece', rot: 'id=7 já feito', txt: 'O servidor vê o id=7, já processado, e devolve a resposta guardada. Nada é debitado de novo.' }
        : { passo: 5, tipo: 'exec2', rot: 'saldo 400 → 300', txt: 'Sem identificador, o servidor não sabe que é repetição e debita de novo.' },
      { passo: 6, tipo: 'resp', rot: 'ok', txt: com
        ? 'O cliente recebe "ok". Saldo final: 400. O débito foi aplicado uma vez.'
        : 'O cliente recebe "ok". Saldo final: 300. O débito foi aplicado duas vezes.' }
    ];
    let saldo = 500;
    return ev.map((e, k) => {
      if (e.tipo === 'exec') saldo = 400;
      if (e.tipo === 'exec2') saldo = 300;
      return { passo: e.passo, cur: e, hist: ev.slice(0, k + 1), saldo, t: e.txt };
    });
  }

  function desenhaRPC(ctx, w, h, q) {
    limpa(ctx, w, h);
    const xA = 130, xB = w - 130, yTopo = 64, yFim = h - 28;
    const yDe = p => yTopo + (p / 6) * (yFim - yTopo);

    ctx.strokeStyle = 'rgba(148,163,184,.35)';
    ctx.lineWidth = 2;
    [xA, xB].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, yTopo);
      ctx.lineTo(x, yFim);
      ctx.stroke();
    });
    rotulo(ctx, 'Cliente', xA, yTopo - 24, CORES.txt, 'center');
    rotulo(ctx, 'Servidor', xB, yTopo - 24, CORES.txt, 'center');
    rotulo(ctx, 'saldo da conta: ' + q.saldo, w / 2, 22, CORES.amarelo, 'center');

    q.hist.forEach(e => {
      const atual = e.passo === q.cur.passo;
      const y = yDe(e.passo);
      const esmaece = atual ? 1 : 0.35;
      ctx.globalAlpha = esmaece;
      const cor = e.tipo === 'perdida' || e.tipo === 'exec2' ? CORES.rosa
        : e.tipo === 'reconhece' || e.tipo === 'resp' ? CORES.verde
        : e.tipo === 'timeout' ? CORES.amarelo : CORES.azul;

      if (e.tipo === 'req') {
        global.AH.arrow(ctx, xA, y, xB, y, CORES.azul, true);
        rotulo(ctx, e.rot, (xA + xB) / 2, y - 12, CORES.azul, 'center');
      } else if (e.tipo === 'exec' || e.tipo === 'exec2' || e.tipo === 'reconhece') {
        global.AH.roundRect(ctx, xB - 70, y - 13, 140, 26, 8);
        ctx.fillStyle = '#1e293b'; ctx.fill();
        ctx.strokeStyle = cor; ctx.lineWidth = 2; ctx.stroke();
        rotulo(ctx, e.rot, xB, y, cor, 'center');
      } else if (e.tipo === 'perdida') {
        ctx.setLineDash([6, 5]);
        global.AH.arrow(ctx, xB, y, xA, y, CORES.rosa, true);
        ctx.setLineDash([]);
        const mx = (xA + xB) / 2;
        rotulo(ctx, 'X', mx, y, CORES.rosa, 'center');
        rotulo(ctx, 'ok (perdida)', mx, y - 12, CORES.rosa, 'center');
      } else if (e.tipo === 'timeout') {
        rotulo(ctx, 'timeout', xA + 14, y, cor);
      } else if (e.tipo === 'resp') {
        global.AH.arrow(ctx, xB, y, xA, y, CORES.verde, true);
        rotulo(ctx, e.rot, (xA + xB) / 2, y - 12, CORES.verde, 'center');
      }
      ctx.globalAlpha = 1;
    });
  }

  global.SD = {
    CORES,
    EVENTOS,
    geraRPC,
    desenhaRPC,
    geraLamport,
    desenhaLamport,
    SERVIDORES,
    CHAVES,
    dono,
    geraAnel,
    desenhaAnel,
    MENSAGENS,
    geraEntregas,
    desenhaEntregas
  };
})(window);
