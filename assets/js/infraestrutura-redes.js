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

  /* Liga um diagrama de sequência ao motor de controles da estrutura-dados.js.
     cfg: { canvas, ctl, cap, participantes, mensagens | cenarios, intro, cenario?, velocidade? } */
  function anima(cfg) {
    const seq = criaSequencia(cfg);
    const opcoes = cfg.cenarios
      ? Object.keys(cfg.cenarios).map(v => ({ v, rotulo: cfg.rotulos ? cfg.rotulos[v] : v }))
      : null;
    return ED.criaAnimacao({
      canvas: cfg.canvas, ctl: cfg.ctl, cap: cfg.cap,
      desenha: seq.desenha, gera: seq.gera,
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
    anima
  };
})(window);
