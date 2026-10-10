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

  /* ===================================================================
     0c. ELEIÇÃO EM ANEL (CHANG E ROBERTS)
     Cada nó envia o próprio id no sentido horário. Quem recebe um id maior
     repassa; um id menor é descartado. O id que volta ao próprio dono
     elege o líder. Os quadros são rodadas da simulação.
     =================================================================== */
  const IDS_ANEL = [3, 7, 1, 5, 2];

  function simulaChangRoberts(ids) {
    const n = ids.length;
    let msgs = ids.map((id, i) => ({ de: i, para: (i + 1) % n, id }));
    const rodadas = [];
    let lider = null;
    while (msgs.length && lider === null) {
      const prox = [], descartes = [], repassa = [];
      msgs.forEach(m => {
        if (m.id === ids[m.para]) {
          lider = m.para;
        } else if (m.id > ids[m.para]) {
          prox.push({ de: m.para, para: (m.para + 1) % n, id: m.id });
          repassa.push(m);
        } else {
          descartes.push(m.para);
        }
      });
      rodadas.push({ msgs, repassa, descartes, lider: null });
      msgs = prox;
    }
    return { rodadas, lider };
  }

  function geraEleicao() {
    const { rodadas, lider } = simulaChangRoberts(IDS_ANEL);
    const quadros = rodadas.map((r, k) => ({
      ids: IDS_ANEL,
      msgs: r.msgs,
      descartes: r.descartes,
      lider: null,
      t: r.repassa.length === 0 && r.descartes.length === 0
        ? 'Rodada ' + (k + 1) + ': a mensagem com o id ' + r.msgs[0].id + ' chegou ao próprio dono.'
        : 'Rodada ' + (k + 1) + ': ' + r.repassa.length + ' mensagem(ns) é(são) repassada(s) porque o id é maior que o do vizinho; ' +
          r.descartes.length + ' é(são) descartada(s) porque o id é menor.'
    }));
    quadros.push({
      ids: IDS_ANEL, msgs: [], descartes: [], lider,
      t: 'O id ' + IDS_ANEL[lider] + ' voltou ao próprio dono: ele é o maior e está eleito. Um anúncio final avisa os demais.'
    });
    return quadros;
  }

  function desenhaEleicao(ctx, w, h, q) {
    limpa(ctx, w, h);
    const cx = w / 2, cy = h / 2 + 4, r = Math.min(w, h) * 0.32;
    const n = q.ids.length;
    const pos = i => {
      const a = (-Math.PI / 2) + (i / n) * Math.PI * 2;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    };

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(148,163,184,.25)';
    ctx.stroke();

    q.ids.forEach((id, i) => {
      const p = pos(i);
      const lider = q.msgs.length === 0 && i === (q.lider !== undefined && q.lider !== null ? q.lider : -1);
      const borda = q.descartes.indexOf(i) >= 0 ? CORES.rosa : (lider ? CORES.verde : CORES.azul);
      bolha(ctx, p.x, p.y, 22, borda, String(id));
    });

    q.msgs.forEach(m => {
      const a = pos(m.de), b = pos(m.para);
      const x = a.x + (b.x - a.x) * 0.55, y = a.y + (b.y - a.y) * 0.55;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fillStyle = CORES.amarelo;
      ctx.fill();
      ctx.fillStyle = '#020617';
      ctx.font = '700 11px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(m.id), x, y);
    });

    rotulo(ctx, 'anel · sentido horário · mensagens em amarelo', 16, h - 16, CORES.mudo);
  }

  /* ===================================================================
     0d. EXCLUSÃO MÚTUA COM TOKEN
     Um token circula no anel. Só quem tem o token entra na seção crítica.
     Quem quer entrar marca o pedido e espera a sua vez.
     =================================================================== */
  const NOS_TOKEN = ['P0', 'P1', 'P2', 'P3'];

  function geraToken() {
    return [
      { token: 0, sc: null, quer: [], t: 'O token começa com P0. Ninguém quer entrar na seção crítica, então P0 repassa o token a P1.' },
      { token: 1, sc: null, quer: [1], t: 'P1 quer entrar. Ele espera o token chegar: é o único jeito de ter exclusão mútua sem coordenador.' },
      { token: 1, sc: 1, quer: [], t: 'P1 tem o token e entra na seção crítica. Nenhum outro processo pode entrar enquanto ele estiver lá.' },
      { token: 2, sc: null, quer: [3], t: 'P1 sai e repassa o token a P2. P3 pede a seção crítica enquanto o token viaja.' },
      { token: 3, sc: 3, quer: [], t: 'O token chega a P3, que estava na fila. P3 entra e P1 espera a sua próxima vez.' },
      { token: 0, sc: null, quer: [], t: 'P3 sai e passa o token a P0. A ordem de acesso é justa: cada pedido é atendido em uma volta do anel.' }
    ];
  }

  function desenhaToken(ctx, w, h, q) {
    limpa(ctx, w, h);
    const cx = w / 2, cy = h / 2 + 4, r = Math.min(w, h) * 0.3;
    const pos = i => {
      const a = (-Math.PI / 2) + (i / NOS_TOKEN.length) * Math.PI * 2;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    };

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(148,163,184,.25)';
    ctx.stroke();

    NOS_TOKEN.forEach((nome, i) => {
      const p = pos(i);
      let borda = CORES.azul;
      if (q.sc === i) borda = CORES.verde;
      else if (q.quer.indexOf(i) >= 0) borda = CORES.rosa;
      bolha(ctx, p.x, p.y, 24, borda, nome);
      if (q.quer.indexOf(i) >= 0) rotulo(ctx, 'pede a seção', p.x, p.y + 40, CORES.rosa, 'center');
      if (q.sc === i) rotulo(ctx, 'na seção crítica', p.x, p.y + 40, CORES.verde, 'center');
    });

    const tp = pos(q.token);
    ctx.beginPath();
    ctx.arc(tp.x + 30, tp.y - 26, 9, 0, Math.PI * 2);
    ctx.fillStyle = CORES.amarelo;
    ctx.fill();
    rotulo(ctx, 'token', tp.x + 44, tp.y - 26, CORES.amarelo);

    rotulo(ctx, 'verde: dentro da seção crítica · rosa: pedindo entrada', 16, h - 16, CORES.mudo);
  }

  /* ===================================================================
     0e. QUÓRUNS DE LEITURA E ESCRITA (N = 3)
     A escrita exige W confirmações; a leitura consulta R réplicas e fica
     com a versão mais nova. Se W + R > N, toda leitura toca alguma réplica
     que recebeu a escrita. Opções: "r1" (R = 1) e "r2" (R = 2), com W = 2.
     =================================================================== */
  const REPLICAS = ['R1', 'R2', 'R3'];

  function geraQuorum(opcao) {
    const r2 = opcao === 'r2';
    const estadoInicial = [['A', 1], ['A', 1], ['A', 1]];
    const comEscrita = [['B', 2], ['B', 2], ['A', 1]];
    const base = [
      { rep: estadoInicial, escritas: [], ativos: [], leitura: null, t: 'Três réplicas guardam o valor A, na versão 1.' },
      { rep: [['B', 2], ['A', 1], ['A', 1]], escritas: [0], ativos: [], leitura: null, t: 'O cliente escreve B, versão 2. R1 recebe e confirma.' },
      { rep: comEscrita, escritas: [0, 1], ativos: [], leitura: null, t: 'R2 também confirma. Com W = 2 confirmações, a escrita é dada como concluída. R3 ainda não recebeu, por atraso ou partição.' }
    ];
    const leitura = r2
      ? { rep: comEscrita, escritas: [], ativos: [0, 2], leitura: ['B', 2],
          t: 'Leitura com R = 2: consulta R1 e R3. R1 devolve B, versão 2, a mais nova. Como W + R = 4 > N = 3, sempre há uma réplica comum ao quórum da escrita.' }
      : { rep: comEscrita, escritas: [], ativos: [2], leitura: ['A', 1],
          t: 'Leitura com R = 1: consulta só R3, que devolve A, versão 1. Essa leitura é desatualizada, feita depois de uma escrita já confirmada.' };
    return base.concat([leitura]);
  }

  function desenhaQuorum(ctx, w, h, q) {
    limpa(ctx, w, h);
    const yBox = h * 0.42, larg = 150, alt = 84;
    const xDe = i => w * (0.2 + i * 0.3);

    REPLICAS.forEach((nome, i) => {
      const [valor, versao] = q.rep[i];
      const x = xDe(i) - larg / 2;
      const escrita = q.escritas.indexOf(i) >= 0;
      const lida = q.ativos.indexOf(i) >= 0;
      const borda = lida ? CORES.amarelo : escrita ? CORES.verde : CORES.azul;
      global.AH.roundRect(ctx, x, yBox - alt / 2, larg, alt, 10);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = borda;
      ctx.stroke();
      rotulo(ctx, nome, xDe(i), yBox - alt / 2 - 14, CORES.txt, 'center');
      ctx.fillStyle = CORES.txt;
      ctx.font = '600 18px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(valor, xDe(i), yBox - 10);
      rotulo(ctx, 'versão ' + versao, xDe(i), yBox + 18, versao === 2 ? CORES.verde : CORES.mudo, 'center');
      if (lida) rotulo(ctx, 'consultada', xDe(i), yBox + alt / 2 + 16, CORES.amarelo, 'center');
    });

    if (q.leitura) {
      const [valor, versao] = q.leitura;
      const cor = versao === 2 ? CORES.verde : CORES.rosa;
      rotulo(ctx, 'resposta da leitura: ' + valor + ' (versão ' + versao + ')' +
        (versao === 2 ? ' · atual' : ' · desatualizada'), w / 2, h - 34, cor, 'center');
    }
    rotulo(ctx, 'verde: escrita confirmada · amarelo: réplica consultada na leitura', 16, h - 14, CORES.mudo);
  }

  /* ===================================================================
     0f. CONSENSO POR MAIORIA (ESTILO RAFT)
     Cinco servidores. Um líder só é eleito com voto de uma maioria (3 de 5).
     Opções: "maioria" (falhas de servidores) e "particao" (rede dividida em 2 e 3).
     Cada quadro traz o papel de cada nó: S (seguidor), C (candidato), L (líder), X (falho).
     =================================================================== */
  const SERVIDORES_RAFT = ['S1', 'S2', 'S3', 'S4', 'S5'];

  function geraRaft(opcao) {
    if (opcao === 'particao') {
      const grupos = [[0, 1], [2, 3, 4]];
      return [
        { papel: ['S', 'S', 'S', 'S', 'S'], votos: [], grupos, cont: {}, t: 'A rede se parte em dois lados: {S1, S2} e {S3, S4, S5}. Nenhum lado enxerga o outro.' },
        { papel: ['C', 'S', 'S', 'S', 'S'], votos: [{ de: 1, para: 0 }], grupos, cont: { 0: '2/5' }, t: 'S1 dá timeout e pede votos. Só S2 responde: são 2 votos de 5. Sem maioria, S1 não vira líder.' },
        { papel: ['C', 'S', 'C', 'S', 'S'], votos: [{ de: 1, para: 0 }, { de: 3, para: 2 }, { de: 4, para: 2 }], grupos, cont: { 0: '2/5', 2: '3/5' }, t: 'Do outro lado, S3 vira candidato e recebe votos de S4 e S5: 3 de 5, uma maioria. S3 se torna líder.' },
        { papel: ['C', 'S', 'L', 'S', 'S'], votos: [], grupos, cont: {}, t: 'Resultado: S3 é o único líder. S1 segue candidato sem sucesso. Não há dois líderes: quem não tem maioria não manda.' }
      ];
    }
    return [
      { papel: ['S', 'S', 'S', 'S', 'S'], votos: [], grupos: null, cont: {}, t: 'Cinco servidores, todos seguidores. S1 é o primeiro a dar timeout sem ouvir o líder.' },
      { papel: ['C', 'S', 'S', 'S', 'S'], votos: [], grupos: null, cont: { 0: '1/5' }, t: 'S1 vira candidato no termo 2, vota em si mesmo e pede votos aos demais.' },
      { papel: ['C', 'S', 'S', 'S', 'S'], votos: [{ de: 1, para: 0 }, { de: 2, para: 0 }], grupos: null, cont: { 0: '3/5' }, t: 'S2 e S3 votam em S1. Com 3 votos de 5, S1 tem maioria.' },
      { papel: ['L', 'S', 'S', 'S', 'S'], votos: [], grupos: null, cont: {}, t: 'S1 é o líder. Ele envia heartbeats, e os demais deixam de se candidatar.' },
      { papel: ['L', 'S', 'S', 'S', 'X'], votos: [], grupos: null, cont: {}, t: 'S5 cai. O líder continua, porque 4 nós vivos ainda formam maioria (3 de 5).' },
      { papel: ['L', 'S', 'X', 'S', 'X'], votos: [], grupos: null, cont: {}, t: 'S3 também cai. Restam 3 nós vivos, exatamente a maioria. Se mais um cair, o sistema para: nenhum líder pode ser eleito sem maioria.' }
    ];
  }

  function desenhaRaft(ctx, w, h, q) {
    limpa(ctx, w, h);
    const yc = h * 0.5, alt = 58, larg = 84;
    const xDe = i => w * (0.1 + i * 0.2);

    if (q.grupos) {
      q.grupos.forEach(g => {
        const xs = g.map(xDe);
        const x0 = Math.min(...xs) - larg / 2 - 14, x1 = Math.max(...xs) + larg / 2 + 14;
        global.AH.roundRect(ctx, x0, yc - alt / 2 - 46, x1 - x0, alt + 92, 14);
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = 'rgba(148,163,184,.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    q.votos.forEach((v, k) => {
      const y = yc - alt / 2 - 22 - 8 * (k % 3);
      global.AH.arrow(ctx, xDe(v.de), y, xDe(v.para), y, CORES.amarelo, true);
    });

    SERVIDORES_RAFT.forEach((nome, i) => {
      const papel = q.papel[i];
      const x = xDe(i) - larg / 2;
      const cor = papel === 'L' ? CORES.verde : papel === 'C' ? CORES.amarelo : papel === 'X' ? CORES.mudo : CORES.azul;
      global.AH.roundRect(ctx, x, yc - alt / 2, larg, alt, 10);
      ctx.fillStyle = papel === 'X' ? '#0f172a' : '#1e293b';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = cor;
      ctx.setLineDash(papel === 'X' ? [5, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = papel === 'X' ? CORES.mudo : CORES.txt;
      ctx.font = '600 14px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nome, xDe(i), yc - 6);
      const legenda = { S: 'seguidor', C: 'candidato', L: 'líder', X: 'falho' }[papel];
      rotulo(ctx, legenda, xDe(i), yc + 14, cor, 'center');
      if (q.cont[i]) rotulo(ctx, 'votos ' + q.cont[i], xDe(i), yc + alt / 2 + 16, CORES.amarelo, 'center');
    });

    rotulo(ctx, 'maioria = 3 de 5 · setas amarelas: votos · tracejado: partição da rede', 16, h - 14, CORES.mudo);
  }

  /* ===================================================================
     0g. COMMIT EM DUAS FASES (2PC)
     Um coordenador pede votos (fase 1) e envia a decisão (fase 2).
     Opções: "sucesso" (todos votam SIM), "aborta" (um vota NÃO) e
     "bloqueio" (o coordenador cai depois dos votos SIM).
     =================================================================== */
  const PARTICIPANTES_2PC = ['P1', 'P2', 'P3'];

  function geraDoisFases(opcao) {
    const voto = opcao === 'aborta' ? ['SIM', 'NÃO', 'SIM'] : ['SIM', 'SIM', 'SIM'];
    const decisao = voto.every(v => v === 'SIM') ? 'COMMIT' : 'ABORT';
    const preparados = voto.map(v => (v === 'SIM' ? 'preparado (trava)' : 'vota NÃO'));
    const quadros = [
      { msg: null, coord: 'pronto', part: ['pronto', 'pronto', 'pronto'], t: 'Transação T1 com três participantes. Cada um guarda uma parte dos dados.' },
      { msg: 'PREPARE', coord: 'pede votos', part: ['pronto', 'pronto', 'pronto'], t: 'Fase 1: o coordenador pede a cada participante que se prepare. Ele grava no log e trava os dados que vai alterar.' },
      { msg: 'VOTO', coord: 'coleta votos', part: preparados, t: 'Cada participante responde. SIM quer dizer "consigo confirmar, e já travei meus dados". NÃO quer dizer "não consigo".' }
    ];

    if (opcao === 'bloqueio') {
      quadros.push({ msg: null, coord: 'FALHOU', falho: true, part: preparados, t: 'O coordenador cai antes de decidir. Os participantes estão presos: não podem confirmar nem desfazer, e os dados seguem travados.' });
      quadros.push({ msg: null, coord: 'FALHOU', falho: true, part: preparados, t: 'Enquanto o coordenador não voltar com a decisão no log, a transação continua pendente. Esse é o bloqueio do 2PC, e é o motivo de ele não ser usado sozinho em sistemas de alta disponibilidade.' });
      return quadros;
    }

    quadros.push({
      msg: decisao, coord: 'decide ' + decisao, part: preparados,
      t: decisao === 'COMMIT'
        ? 'Todos votaram SIM. O coordenador grava COMMIT no log, e só depois avisa os participantes.'
        : 'Um participante votou NÃO. O coordenador decide ABORT e avisa todos, que desfazem o que fizeram.'
    });
    quadros.push({
      msg: null, coord: 'concluída', part: voto.map(() => decisao === 'COMMIT' ? 'commit' : 'abort'),
      t: decisao === 'COMMIT'
        ? 'Os participantes confirmam e liberam as travas. A transação foi atômica: todos aplicaram a mudança.'
        : 'Os participantes desfazem o que tinham feito e liberam as travas. Nenhuma mudança ficou aplicada: a transação foi atômica, mas não executou.'
    });
    return quadros;
  }

  function desenhaDoisFases(ctx, w, h, q) {
    limpa(ctx, w, h);
    const xC = w / 2, yC = h * 0.2, yP = h * 0.72;
    const xP = i => w * (0.2 + i * 0.3);
    const larg = 150, alt = 50;

    /* Coordenador */
    global.AH.roundRect(ctx, xC - larg / 2, yC - alt / 2, larg, alt, 10);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = q.falho ? CORES.rosa : CORES.azul;
    ctx.setLineDash(q.falho ? [5, 4] : []);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = q.falho ? CORES.mudo : CORES.txt;
    ctx.font = '600 13px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Coordenador', xC, yC - 8);
    rotulo(ctx, q.coord, xC, yC + 12, q.falho ? CORES.rosa : CORES.amarelo, 'center');

    /* Mensagens: PREPARE (para baixo), VOTO (para cima), decisão (para baixo) */
    PARTICIPANTES_2PC.forEach((nome, i) => {
      const x = xP(i);
      if (q.msg === 'PREPARE' || q.msg === 'COMMIT' || q.msg === 'ABORT') {
        const cor = q.msg === 'ABORT' ? CORES.rosa : q.msg === 'COMMIT' ? CORES.verde : CORES.azul;
        global.AH.arrow(ctx, xC + (x - xC) * 0.15, yC + alt / 2, x, yP - alt / 2 - 2, cor, true);
      }
      if (q.msg === 'VOTO') {
        const cor = q.part[i] === 'vota NÃO' ? CORES.rosa : CORES.verde;
        global.AH.arrow(ctx, x, yP - alt / 2 - 2, xC + (x - xC) * 0.15, yC + alt / 2, cor, true);
      }
    });

    /* Participantes */
    PARTICIPANTES_2PC.forEach((nome, i) => {
      const x = xP(i);
      const estado = q.part[i];
      const cor = estado === 'commit' ? CORES.verde : estado === 'abort' ? CORES.rosa
        : estado === 'vota NÃO' ? CORES.rosa : estado.indexOf('trava') >= 0 ? CORES.amarelo : CORES.azul;
      global.AH.roundRect(ctx, x - larg / 2, yP - alt / 2, larg, alt, 10);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = cor;
      ctx.stroke();
      ctx.fillStyle = CORES.txt;
      ctx.font = '600 13px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nome, x, yP - 8);
      rotulo(ctx, estado, x, yP + 12, cor, 'center');
    });

    rotulo(ctx, 'fase 1: votos · fase 2: decisão · amarelo: dados travados', 16, h - 14, CORES.mudo);
  }

  /* ===================================================================
     0h. ELASTICIDADE: DEMANDA × CAPACIDADE
     A demanda sobe e desce ao longo de nove intervalos. Cada instância atende
     30 requisições por intervalo. Opções: "fixo" (2 instâncias o tempo todo)
     e "auto" (o escalonador decide a cada intervalo, com 1 intervalo de atraso).
     =================================================================== */
  const DEMANDA = [20, 35, 60, 90, 120, 110, 70, 40, 25];
  const CAPACIDADE_INSTANCIA = 30;

  function geraElasticidade(opcao) {
    const auto = opcao === 'auto';
    const quadros = [];
    for (let t = 0; t < DEMANDA.length; t++) {
      const inst = auto ? Math.max(1, Math.ceil(DEMANDA[Math.max(0, t - 1)] / CAPACIDADE_INSTANCIA)) : 2;
      const cap = inst * CAPACIDADE_INSTANCIA;
      const perdida = Math.max(0, DEMANDA[t] - cap);
      let texto;
      if (auto && t === 0) texto = 'Demanda baixa: o escalonador mantém uma instância. Ele reage à demanda do intervalo anterior, então sempre existe um atraso.';
      else if (perdida > 0) texto = 'Demanda de ' + DEMANDA[t] + ' com ' + inst + ' instância(s) (capacidade ' + cap + '): ' + perdida + ' requisições ficam sem atendimento.';
      else if (auto) texto = 'Com ' + inst + ' instância(s), a capacidade de ' + cap + ' cobre a demanda de ' + DEMANDA[t] + '.';
      else texto = 'Com 2 instâncias fixas (capacidade ' + cap + ') a demanda de ' + DEMANDA[t] + ' é atendida.';
      quadros.push({ tempo: t, dem: DEMANDA.slice(0, t + 1), cap, perdida, auto, t: texto,
        instancias: Array.from({ length: t + 1 }, (_, k) => (auto ? Math.max(1, Math.ceil(DEMANDA[Math.max(0, k - 1)] / CAPACIDADE_INSTANCIA)) : 2)) });
    }
    return quadros;
  }

  function desenhaElasticidade(ctx, w, h, q) {
    limpa(ctx, w, h);
    const x0 = 56, x1 = w - 24, yBase = h - 52, yTopo = 28;
    const max = 130;
    const yDe = v => yBase - (v / max) * (yBase - yTopo);
    const passo = (x1 - x0) / (DEMANDA.length - 1);
    const xDe = i => x0 + i * passo;

    ctx.strokeStyle = 'rgba(148,163,184,.25)';
    ctx.lineWidth = 1;
    [0, 30, 60, 90, 120].forEach(v => {
      ctx.beginPath();
      ctx.moveTo(x0, yDe(v));
      ctx.lineTo(x1, yDe(v));
      ctx.stroke();
      rotulo(ctx, String(v), x0 - 8, yDe(v), CORES.mudo, 'right');
    });

    /* Capacidade ao longo do tempo (linha amarela em degraus) */
    ctx.strokeStyle = CORES.amarelo;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    q.instancias.forEach((n, i) => {
      const y = yDe(n * CAPACIDADE_INSTANCIA);
      if (i === 0) ctx.moveTo(xDe(i), y); else ctx.lineTo(xDe(i), y);
    });
    ctx.stroke();

    /* Demanda até o instante atual (barras azuis); perdas em rosa */
    q.dem.forEach((d, i) => {
      const x = xDe(i);
      const bw = 26;
      const cap = q.instancias[i] * CAPACIDADE_INSTANCIA;
      const atendida = Math.min(d, cap);
      ctx.fillStyle = 'rgba(56,189,248,.45)';
      ctx.fillRect(x - bw / 2, yDe(atendida), bw, yBase - yDe(atendida));
      if (d > cap) {
        ctx.fillStyle = 'rgba(244,63,94,.55)';
        ctx.fillRect(x - bw / 2, yDe(d), bw, yDe(cap) - yDe(d));
      }
      rotulo(ctx, String(i), x, yBase + 14, CORES.mudo, 'center');
    });

    rotulo(ctx, 'requisições por intervalo', x0, yTopo - 14, CORES.mudo);
    rotulo(ctx, 'azul: atendidas · rosa: perdidas · linha amarela: capacidade', 16, h - 14, CORES.mudo);
  }

  /* ===================================================================
     0i. LAÇO DE RECONCILIAÇÃO (ORQUESTRADOR)
     O usuário declara o estado desejado; o controlador compara com o atual e
     corrige a diferença. Opções: "falha" (um pod cai e é recriado) e
     "escala" (o desejado sobe de 3 para 5).
     =================================================================== */
  const SLOTS_POD = 5;

  function geraReconcilia(opcao) {
    if (opcao === 'escala') {
      return [
        { desejado: 3, pods: ['run', 'run', 'run', null, null], t: 'O estado desejado é 3 réplicas, e 3 estão rodando. Nada a corrigir.' },
        { desejado: 5, pods: ['run', 'run', 'run', null, null], t: 'O usuário muda o desejado para 5. O estado atual ainda é 3: o controlador percebe a diferença.' },
        { desejado: 5, pods: ['run', 'run', 'run', 'pend', null], t: 'O controlador cria o pod 4. Ele está pendente: a imagem ainda está sendo baixada e o pod ainda não atende.' },
        { desejado: 5, pods: ['run', 'run', 'run', 'run', 'pend'], t: 'O pod 4 entra em execução e o controlador cria o pod 5, até o atual igualar o desejado.' },
        { desejado: 5, pods: ['run', 'run', 'run', 'run', 'run'], t: 'Atual igual ao desejado: 5 de 5. O sistema convergiu, e nenhuma ação é necessária.' }
      ];
    }
    return [
      { desejado: 3, pods: ['run', 'run', 'run', null, null], t: 'Estado desejado: 3 réplicas. Todas estão rodando, e o sistema está convergido.' },
      { desejado: 3, pods: ['run', 'run', 'falha', null, null], t: 'O pod 3 falha, por um erro na aplicação ou no nó. O atual cai para 2; o desejado continua 3.' },
      { desejado: 3, pods: ['run', 'run', 'pend', null, null], t: 'O controlador detecta a diferença e cria um pod substituto. Ele ainda não está pronto.' },
      { desejado: 3, pods: ['run', 'run', 'run', null, null], t: 'O substituto entra em execução. Atual igual ao desejado de novo: a correção foi automática, sem intervenção humana.' }
    ];
  }

  function desenhaReconcilia(ctx, w, h, q) {
    limpa(ctx, w, h);
    const larg = 92, alt = 72, gap = 16;
    const total = SLOTS_POD * larg + (SLOTS_POD - 1) * gap;
    const x0 = (w - total) / 2, yPod = h * 0.40;

    q.pods.forEach((estado, i) => {
      const x = x0 + i * (larg + gap);
      if (estado === null) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(148,163,184,.3)';
        ctx.lineWidth = 1.5;
        global.AH.roundRect(ctx, x, yPod - alt / 2, larg, alt, 10);
        ctx.stroke();
        ctx.setLineDash([]);
        rotulo(ctx, 'vazio', x + larg / 2, yPod, CORES.mudo, 'center');
        return;
      }
      const cor = estado === 'run' ? CORES.verde : estado === 'pend' ? CORES.amarelo : CORES.rosa;
      const rot = estado === 'run' ? 'rodando' : estado === 'pend' ? 'pendente' : 'falhou';
      global.AH.roundRect(ctx, x, yPod - alt / 2, larg, alt, 10);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = cor;
      ctx.stroke();
      ctx.fillStyle = CORES.txt;
      ctx.font = '600 13px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('pod ' + (i + 1), x + larg / 2, yPod - 8);
      rotulo(ctx, rot, x + larg / 2, yPod + 14, cor, 'center');
    });

    const atual = q.pods.filter(p => p === 'run').length;
    const cor = atual === q.desejado ? CORES.verde : CORES.amarelo;
    rotulo(ctx, 'desejado: ' + q.desejado + '   ·   atual (rodando): ' + atual, w / 2, yPod + alt / 2 + 46, cor, 'center');
    rotulo(ctx, 'o controlador compara os dois valores e age até igualar', 16, h - 14, CORES.mudo);
  }

  /* ===================================================================
     0j. DISJUNTOR (CIRCUIT BREAKER)
     Três estados: fechado (chamadas passam), aberto (chamadas são rejeitadas
     na hora) e meio-aberto (uma chamada de teste decide o próximo estado).
     Opções: "recupera" (o teste dá certo) e "reabre" (o teste falha).
     =================================================================== */
  function geraCircuito(opcao) {
    const reabre = opcao === 'reabre';
    const base = [
      { estado: 'fechado', falhas: 0, req: [], t: 'Estado normal: as chamadas passam e o serviço responde.' },
      { estado: 'fechado', falhas: 1, req: ['falha'], t: 'Primeira falha. O disjuntor conta, mas ainda deixa as chamadas passarem.' },
      { estado: 'fechado', falhas: 2, req: ['falha'], t: 'Segunda falha seguida. Ainda fechado: um erro isolado não deve derrubar o caminho.' },
      { estado: 'aberto', falhas: 3, req: ['falha'], t: 'Terceira falha seguida. O disjuntor abre: as chamadas são rejeitadas na hora, sem tocar no serviço.' },
      { estado: 'aberto', falhas: 3, req: ['rejeitada'], t: 'Nova chamada: rejeição imediata (fail fast). O serviço ganha tempo para se recuperar, e o cliente não fica preso esperando.' }
    ];
    const teste = reabre
      ? [
          { estado: 'meio-aberto', falhas: 3, req: ['teste'], t: 'Passou o tempo de espera. Uma chamada de teste é enviada ao serviço.' },
          { estado: 'aberto', falhas: 3, req: ['falha'], t: 'O teste falhou. O disjuntor reabre e a espera recomeça. Nenhuma outra chamada chega ao serviço.' }
        ]
      : [
          { estado: 'meio-aberto', falhas: 3, req: ['teste'], t: 'Passou o tempo de espera. Uma chamada de teste é enviada ao serviço.' },
          { estado: 'fechado', falhas: 0, req: ['ok'], t: 'O teste deu certo: o disjuntor fecha e o tráfego volta ao normal.' }
        ];
    return base.concat(teste);
  }

  function desenhaCircuito(ctx, w, h, q) {
    limpa(ctx, w, h);
    const estados = [
      { nome: 'fechado', cor: CORES.verde, x: w * 0.2 },
      { nome: 'meio-aberto', cor: CORES.amarelo, x: w * 0.5 },
      { nome: 'aberto', cor: CORES.rosa, x: w * 0.8 }
    ];
    const yc = h * 0.36, larg = 150, alt = 60;

    estados.forEach(e => {
      const ativo = e.nome === q.estado;
      global.AH.roundRect(ctx, e.x - larg / 2, yc - alt / 2, larg, alt, 12);
      ctx.fillStyle = ativo ? 'rgba(255,255,255,.06)' : '#0f172a';
      ctx.fill();
      ctx.lineWidth = ativo ? 3 : 1.5;
      ctx.strokeStyle = ativo ? e.cor : 'rgba(148,163,184,.3)';
      ctx.stroke();
      rotulo(ctx, e.nome, e.x, yc, ativo ? e.cor : CORES.mudo, 'center');
    });

    /* Setas de transição, só ilustrativas */
    global.AH.arrow(ctx, estados[0].x + larg / 2, yc - 10, estados[1].x - larg / 2, yc - 10, 'rgba(148,163,184,.4)', true);
    global.AH.arrow(ctx, estados[1].x - larg / 2, yc + 10, estados[0].x + larg / 2, yc + 10, 'rgba(148,163,184,.4)', true);
    global.AH.arrow(ctx, estados[1].x + larg / 2, yc - 10, estados[2].x - larg / 2, yc - 10, 'rgba(148,163,184,.4)', true);
    global.AH.arrow(ctx, estados[2].x - larg / 2, yc + 10, estados[1].x + larg / 2, yc + 10, 'rgba(148,163,184,.4)', true);

    /* Contador de falhas: uma barra com 3 marcas (limite do disjuntor) */
    const yBar = h * 0.66, x0 = w * 0.2, x1 = w * 0.8;
    rotulo(ctx, 'falhas seguidas: ' + q.falhas + ' de 3 (limite)', x0, yBar - 18, CORES.mudo);
    ctx.fillStyle = 'rgba(148,163,184,.2)';
    ctx.fillRect(x0, yBar, x1 - x0, 10);
    ctx.fillStyle = q.falhas >= 3 ? CORES.rosa : CORES.amarelo;
    ctx.fillRect(x0, yBar, (x1 - x0) * Math.min(q.falhas, 3) / 3, 10);

    /* Resultado da chamada atual */
    const r = q.req.length ? q.req[q.req.length - 1] : null;
    const texto = { falha: 'chamada: falhou', rejeitada: 'chamada: rejeitada sem chegar ao serviço', teste: 'chamada de teste enviada', ok: 'chamada de teste: ok' }[r];
    const cor = { falha: CORES.rosa, rejeitada: CORES.amarelo, teste: CORES.azul, ok: CORES.verde }[r] || CORES.mudo;
    if (texto) rotulo(ctx, texto, w / 2, h - 30, cor, 'center');
    rotulo(ctx, 'fechado: tráfego normal · aberto: rejeição imediata · meio-aberto: um teste decide', 16, h - 12, CORES.mudo);
  }

  global.SD = {
    CORES,
    EVENTOS,
    geraRPC,
    desenhaRPC,
    geraCircuito,
    desenhaCircuito,
    geraReconcilia,
    desenhaReconcilia,
    geraElasticidade,
    desenhaElasticidade,
    geraDoisFases,
    desenhaDoisFases,
    geraRaft,
    desenhaRaft,
    geraQuorum,
    desenhaQuorum,
    geraEleicao,
    desenhaEleicao,
    geraToken,
    desenhaToken,
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
