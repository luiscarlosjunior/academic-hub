/* =====================================================================
   Infraestrutura de Redes — animações da disciplina
   Usada pelas páginas de tópico em disciplinas/infraestrutura-redes/topicos/.
   Depende de assets/js/hub.js (canvas, setas e retângulos arredondados)
   e de assets/js/estrutura-dados.js (motor ED.criaAnimacao: quadros + controles).
   Expõe tudo em window.IR.
   ===================================================================== */
(function (global) {
  'use strict';

  const CORES = {
    txt: '#e2e8f0', mudo: '#64748b', grade: 'rgba(148,163,184,.28)',
    azul: '#38bdf8', verde: '#10b981', amarelo: '#f59e0b', rosa: '#f43f5e', roxo: '#a855f7'
  };

  function limpa(ctx, w, h) {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);
  }

  function rotulo(ctx, texto, x, y, cor, alinh, tam) {
    ctx.fillStyle = cor || CORES.mudo;
    ctx.font = '600 ' + (tam || 12) + 'px Inter, system-ui, sans-serif';
    ctx.textAlign = alinh || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, x, y);
  }

  /* Caixa com borda colorida e texto centralizado (cabeçalhos, pacotes, nós) */
  function caixa(ctx, x, y, w, h, cor, texto, tam) {
    AH.roundRect(ctx, x, y, w, h, 8);
    ctx.fillStyle = cor + '33';
    ctx.fill();
    ctx.strokeStyle = cor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = CORES.txt;
    ctx.font = '600 ' + (tam || 12) + 'px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, x + w / 2, y + h / 2);
  }

  /* Linha tracejada vertical (linha de vida de um participante) */
  function linhaTracejada(ctx, x1, y1, x2, y2, cor) {
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = cor || CORES.grade;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  /* ===================================================================
     MOTOR DE SEQUÊNCIA — diagrama de troca de mensagens entre participantes.
     cfg.participantes: nomes da esquerda para a direita.
     cfg.mensagens: [{ de, para, rotulo, cor?, cap, fim?, perdida? }]
       de/para  — índice do participante (0 = primeiro da esquerda)
       rotulo   — texto escrito sobre a seta
       cap      — legenda exibida enquanto a mensagem está em trânsito
       fim      — legenda exibida quando ela chega (padrão: cap)
       perdida  — se true, a mensagem termina em um X e nunca é entregue
     cfg.intro: legenda do primeiro quadro, antes de qualquer mensagem.
     cfg.cenarios (opcional): { valor: mensagens }, para escolher um cenário.
     Cada mensagem gera dois quadros: a seta em trânsito e a seta concluída.
     =================================================================== */
  function criaSequencia(cfg) {
    const mensagensDo = opcao => (cfg.cenarios && opcao && cfg.cenarios[opcao]) || cfg.mensagens;

    function gera(opcao) {
      const msgs = mensagensDo(opcao);
      const q = [{ i: -1, p: 0, msgs, t: cfg.intro || '' }];
      msgs.forEach((m, i) => {
        q.push({ i, p: 0.5, msgs, t: m.cap });
        q.push({ i, p: 1, msgs, t: m.fim || m.cap });
      });
      return q;
    }

    function desenha(ctx, w, h, q) {
      limpa(ctx, w, h);
      const nomes = cfg.participantes;
      const n = nomes.length;
      const msgs = q.msgs;
      const margem = Math.min(90, w * 0.12);
      const X = j => margem + j * (w - 2 * margem) / (n - 1);
      const topo = 58;
      const base = h - 14;
      const altura = (base - topo) / Math.max(1, msgs.length);

      /* Cabeçalhos e linhas de vida */
      nomes.forEach((nome, j) => {
        linhaTracejada(ctx, X(j), topo - 6, X(j), base, CORES.grade);
        caixa(ctx, X(j) - 62, 10, 124, 28, CORES.azul, nome, 11);
      });

      /* Mensagens: as concluídas ficam visíveis; a atual avança até p */
      msgs.forEach((m, i) => {
        if (i > q.i) return;
        const y = topo + altura * (i + 0.5);
        const cor = m.cor || CORES.azul;
        const x1 = X(m.de), x2 = X(m.para);
        const sentido = x2 >= x1 ? 1 : -1;
        const p = i === q.i ? q.p : 1;
        const fim = x1 + (x2 - x1) * p;

        if (i === q.i) {
          ctx.fillStyle = 'rgba(56,189,248,.06)';
          ctx.fillRect(12, y - altura / 2, w - 24, altura);
        }

        const sobra = m.perdida && p === 1 ? 0.7 : 1;
        const ponta = x1 + (fim - x1) * sobra;
        AH.arrow(ctx, x1, y, ponta, y, cor, 9);
        if (m.perdida && p === 1) {
          const xx = ponta + sentido * 6;
          ctx.strokeStyle = CORES.rosa; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(xx - 6, y - 6); ctx.lineTo(xx + 6, y + 6);
          ctx.moveTo(xx + 6, y - 6); ctx.lineTo(xx - 6, y + 6);
          ctx.stroke();
        }

        rotulo(ctx, m.rotulo, (x1 + x2) / 2, y - 9, m.perdida && p === 1 ? CORES.rosa : CORES.txt, 'center', 11);
      });
    }

    return { gera, desenha };
  }

  /* ===================================================================
     MOTOR DE PILHA — duas pilhas de camadas com um quadro viajando entre elas.
     cfg.camadas: nomes de cima para baixo, ex.: ['Aplicação', 'Transporte', ...]
     cfg.pdu: nome da unidade de dados em cada camada, mesma ordem.
     cfg.cabecalhos: [{ nivel, rotulo, cauda?, cor }]: cabeçalho que a camada de
       índice nivel acrescenta ao descer (e remove ao subir). Ex.: TCP na camada 1.
       cauda: texto acrescentado ao fim do quadro, como o FCS do Ethernet.
     cfg.legendas: { desce: [...], meio, sobe: [...], intro } (textos dos quadros)
     =================================================================== */
  function criaPilha(cfg) {
    const n = cfg.camadas.length;

    function gera() {
      const q = [{ fase: 'intro', k: -1, t: cfg.legendas.intro }];
      for (let k = 0; k < n; k++) q.push({ fase: 'desce', k, t: cfg.legendas.desce[k] });
      q.push({ fase: 'meio', k: n - 1, t: cfg.legendas.meio });
      for (let k = n - 1; k >= 0; k--) q.push({ fase: 'sobe', k, t: cfg.legendas.sobe[k] });
      return q;
    }

    /* Cabeçalhos presentes no quadro em cada fase: os que a camada já adicionou */
    function presentes(q) {
      const ativos = [];
      cfg.cabecalhos.forEach(c => {
        const subiu = q.fase === 'desce' ? q.k >= c.nivel : q.fase === 'meio' ? true
          : q.fase === 'sobe' ? q.k > c.nivel : false;
        if (subiu) ativos.push(c);
      });
      return ativos;
    }

    function desenhaPilha(ctx, x, topo, w, h, rotuloCol, ativa) {
      rotulo(ctx, rotuloCol, x + w / 2, topo - 16, CORES.txt, 'center', 12);
      const passo = (h - topo - 10) / n;
      cfg.camadas.forEach((nome, k) => {
        const y = topo + k * passo;
        const cor = k === ativa ? CORES.azul : CORES.mudo;
        caixa(ctx, x, y + 4, w, passo - 8, cor, nome + ' · ' + cfg.pdu[k], 10);
      });
    }

    function desenha(ctx, w, h, q) {
      limpa(ctx, w, h);
      const largura = Math.min(170, w * 0.26);
      const xA = 16, xB = w - largura - 16;
      const topo = 46;

      /* Pilha do emissor (A) e do receptor (B); a camada ativa fica destacada */
      desenhaPilha(ctx, xA, topo, largura, h - 6, 'Host A (emissor)',
        q.fase === 'desce' || q.fase === 'intro' ? q.k : -1);
      desenhaPilha(ctx, xB, topo, largura, h - 6, 'Host B (receptor)', q.fase === 'sobe' ? q.k : -1);

      /* Quadro no meio: faixa de blocos, do cabeçalho mais externo (à esquerda)
         ao dado, seguido das caudas (como o FCS do Ethernet) */
      const ativos = presentes(q);
      const cx = w / 2;
      const cy = topo + (h - topo) / 2;
      const meioX = xA + largura + 40;
      const meioW = xB - meioX - 40;
      const cabs = [...ativos].reverse();
      const caudas = ativos.filter(c => c.cauda);
      const unidade = Math.max(40, Math.min(60, (meioW - 80) / (cabs.length + caudas.length * 0.7 + 1)));
      const larguraDado = Math.max(44, unidade * 1.2);
      const total = cabs.length * unidade + larguraDado + caudas.length * unidade * 0.7;
      let x = cx - total / 2;
      const yFaixa = cy - 22, alt = 44;
      cabs.forEach(c => {
        caixa(ctx, x, yFaixa, unidade - 3, alt, c.cor, c.rotulo, 10);
        x += unidade;
      });
      caixa(ctx, x, yFaixa, larguraDado - 3, alt, CORES.verde, cfg.dado || 'dados', 10);
      x += larguraDado;
      caudas.forEach(c => {
        caixa(ctx, x, yFaixa, unidade * 0.7 - 3, alt, c.cor, c.cauda, 10);
        x += unidade * 0.7;
      });

      /* Setas do emissor para o quadro e do quadro para o receptor */
      if (q.fase === 'meio') {
        AH.arrow(ctx, xA + largura + 6, cy, meioX - 2, cy, CORES.amarelo, 9);
        AH.arrow(ctx, meioX + meioW + 2, cy, xB - 8, cy, CORES.amarelo, 9);
        rotulo(ctx, 'bits no meio físico', cx, cy + 74, CORES.amarelo, 'center', 11);
      }
      if (q.fase === 'desce') {
        AH.arrow(ctx, xA + largura + 6, cy, meioX - 2, cy, CORES.mudo, 9);
      }
      if (q.fase === 'sobe') {
        AH.arrow(ctx, meioX + meioW + 2, cy, xB - 8, cy, CORES.mudo, 9);
      }
      rotulo(ctx, 'cabeçalhos no quadro: ' + (ativos.length ? ativos.map(c => c.rotulo).join(' + ') : 'nenhum'),
        cx, h - 8, CORES.mudo, 'center', 11);
    }

    return { gera, desenha };
  }

  /* Liga um motor (criaSequencia ou criaPilha) aos controles da estrutura-dados.js.
     cfg: { canvas, ctl, cap, velocidade?, cenarios?, rotulos?, ...config do motor } */
  function liga(motor, cfg) {
    const opcoes = cfg.cenarios
      ? Object.keys(cfg.cenarios).map(v => ({ v, rotulo: cfg.rotulos ? cfg.rotulos[v] : v }))
      : null;
    return ED.criaAnimacao({
      canvas: cfg.canvas, ctl: cfg.ctl, cap: cfg.cap,
      desenha: motor.desenha, gera: motor.gera,
      opcoes: opcoes, velocidade: cfg.velocidade || 1800
    });
  }

  global.IR = {
    CORES,
    limpa,
    rotulo,
    caixa,
    linhaTracejada,
    criaSequencia,
    criaPilha,
    liga
  };
})(window);
