/* ------------------------------------------------------------------
   Lógica: jogos interativos com gamificação
   LG.quiz(el, perguntas)            — verdadeiro/falso e múltipla escolha, com pontos e sequência
   LG.tabela(el, cfg)                — preencher a tabela-verdade e classificar a fórmula
   LG.memoria(el, pares)             — encontrar pares de fórmulas equivalentes
   LG.ordenar(el, cfg)               — montar a ordem de uma demonstração
   LG.circuito(el, cfg)              — descobrir a porta lógica que implementa uma tabela
   LG.cavaleiros(el, cfg)            — dizer quem é cavaleiro (fala verdade) e quem é escudeiro (mente)
   Pontuação e medalhas ficam só na página (sem armazenamento).
   ------------------------------------------------------------------ */
(function (global) {
  'use strict';

  const LG = {};
  const V = '<span class="lg-v">V</span>';
  const F = '<span class="lg-f">F</span>';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function medalha(acertos, total) {
    if (acertos === total) return { nome: 'Ouro', icone: 'fa-medal', cor: 'lg-ouro' };
    if (acertos >= total * 0.6) return { nome: 'Prata', icone: 'fa-medal', cor: 'lg-prata' };
    return { nome: 'Bronze', icone: 'fa-medal', cor: 'lg-bronze' };
  }

  function placarHTML(pontos, extra) {
    return '<div class="lg-placar">' +
      '<span><i class="fa-solid fa-star"></i> ' + pontos + ' pts</span>' +
      (extra || '') +
      '</div>';
  }

  function embaralhar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- 1. Quiz com pontos e sequência ---------- */
  LG.quiz = function (el, perguntas) {
    if (!el || !perguntas || !perguntas.length) return;
    const n = perguntas.length;
    let i = 0, pontos = 0, seq = 0, melhorSeq = 0, acertos = 0, respondido = false;

    function render() {
      if (i >= n) {
        const m = medalha(acertos, n);
        el.innerHTML = '<div class="lg-fim">' +
          '<i class="fa-solid ' + m.icone + ' ' + m.cor + '"></i>' +
          '<p class="lg-fim-t">Medalha ' + m.nome + '</p>' +
          '<p class="text-sm text-slate-300">' + acertos + ' de ' + n + ' acertos · ' + pontos + ' pontos · melhor sequência: ' + melhorSeq + '</p>' +
          '<button type="button" class="lg-btn" data-a="reiniciar">Jogar de novo</button>' +
          '</div>';
        el.querySelector('[data-a="reiniciar"]').onclick = function () {
          i = 0; pontos = 0; seq = 0; melhorSeq = 0; acertos = 0; respondido = false; render();
        };
        return;
      }
      const p = perguntas[i];
      el.innerHTML =
        placarHTML(pontos, '<span>Pergunta ' + (i + 1) + '/' + n + '</span><span><i class="fa-solid fa-fire"></i> sequência ' + seq + '</span>') +
        '<p class="lg-pergunta">' + p.q + '</p>' +
        '<div class="lg-opcoes">' +
        p.ops.map(function (o, k) { return '<button type="button" class="lg-btn lg-opc" data-k="' + k + '">' + o + '</button>'; }).join('') +
        '</div>' +
        '<p class="lg-feedback" aria-live="polite"></p>' +
        '<button type="button" class="lg-btn lg-prox" disabled>Próxima ›</button>';
      const fb = el.querySelector('.lg-feedback');
      const prox = el.querySelector('.lg-prox');
      el.querySelectorAll('.lg-opc').forEach(function (b) {
        b.onclick = function () {
          if (respondido) return;
          respondido = true;
          const k = Number(b.getAttribute('data-k'));
          if (k === p.ans) {
            acertos++; seq++; melhorSeq = Math.max(melhorSeq, seq);
            pontos += 10 + 5 * Math.min(seq, 5);
            fb.className = 'lg-feedback lg-ok';
            fb.textContent = 'Acertou! ' + (p.exp || '');
            b.classList.add('lg-certo');
          } else {
            seq = 0;
            fb.className = 'lg-feedback lg-err';
            fb.textContent = 'Não foi dessa vez. ' + (p.exp || '');
            b.classList.add('lg-errado');
            el.querySelectorAll('.lg-opc')[p.ans].classList.add('lg-certo');
          }
          el.querySelectorAll('.lg-opc').forEach(function (x) { x.disabled = true; });
          prox.disabled = false;
          prox.textContent = i === n - 1 ? 'Ver resultado ›' : 'Próxima ›';
        };
      });
      prox.onclick = function () { i++; respondido = false; render(); };
    }
    render();
  };

  /* ---------- 2. Tabela-verdade: preencher e classificar ---------- */
  LG.tabela = function (el, cfg) {
    if (!el || !cfg) return;
    const vars = cfg.vars;
    const k = vars.length;
    const linhas = [];
    for (let r = 0; r < Math.pow(2, k); r++) {
      const v = {};
      vars.forEach(function (nome, j) { v[nome] = !((r >> (k - 1 - j)) & 1); });
      linhas.push({ v: v, certo: !!cfg.f(v), resp: null });
    }
    const valores = linhas.map(function (l) { return l.certo; });
    const todosV = valores.every(Boolean);
    const todosF = valores.every(function (x) { return !x; });
    const classe = todosV ? 'tautologia' : (todosF ? 'contradição' : 'contingência');
    let pontos = 0, fase = 'preencher';

    function render() {
      const cab = vars.map(function (x) { return '<th>' + x + '</th>'; }).join('');
      const corpo = linhas.map(function (l, r) {
        const celulas = vars.map(function (x) { return '<td>' + (l.v[x] ? V : F) + '</td>'; }).join('');
        let botoes = '';
        if (fase === 'preencher') {
          botoes = '<button type="button" class="lg-mini" data-r="' + r + '" data-val="1">V</button>' +
                   '<button type="button" class="lg-mini" data-r="' + r + '" data-val="0">F</button>';
          if (l.resp !== null) botoes = (l.resp ? V : F) + ' <button type="button" class="lg-mini" data-r="' + r + '" data-val="null">limpar</button>';
        } else {
          botoes = l.certo ? V : F;
          botoes = '<span class="' + (l.resp === l.certo ? 'lg-ok-t' : 'lg-err-t') + '">' + botoes + '</span>';
        }
        return '<tr><td class="lg-idx">' + (r + 1) + '</td>' + celulas + '<td class="lg-resp">' + botoes + '</td></tr>';
      }).join('');
      let rodape = '';
      if (fase === 'preencher') {
        rodape = '<button type="button" class="lg-btn lg-prox" data-a="conferir">Conferir linhas</button>';
      } else {
        rodape = '<p class="lg-pergunta">Qual é a classificação da fórmula?</p>' +
          '<div class="lg-opcoes">' +
          ['tautologia', 'contradição', 'contingência'].map(function (o) {
            return '<button type="button" class="lg-btn lg-classe" data-c="' + o + '">' + o + '</button>';
          }).join('') +
          '</div><p class="lg-feedback" aria-live="polite"></p>';
      }
      el.innerHTML =
        placarHTML(pontos) +
        '<p class="lg-pergunta">' + cfg.texto + '</p>' +
        '<div class="lg-tbl-wrap"><table class="lg-tbl"><thead><tr><th>#</th>' + cab + '<th>' + cfg.coluna + '</th></tr></thead><tbody>' + corpo + '</tbody></table></div>' +
        rodape;

      el.querySelectorAll('.lg-mini[data-r]').forEach(function (b) {
        b.onclick = function () {
          const r = Number(b.getAttribute('data-r'));
          const val = b.getAttribute('data-val');
          linhas[r].resp = val === 'null' ? null : val === '1';
          render();
        };
      });
      const conf = el.querySelector('[data-a="conferir"]');
      if (conf) conf.onclick = function () {
        if (linhas.some(function (l) { return l.resp === null; })) {
          el.querySelector('.lg-tbl-wrap').insertAdjacentHTML('afterend', '<p class="lg-feedback lg-err">Preencha todas as linhas antes de conferir.</p>');
          return;
        }
        const acertos = linhas.filter(function (l) { return l.resp === l.certo; }).length;
        pontos += acertos * 5;
        fase = 'classificar';
        render();
        el.querySelector('.lg-feedback').className = 'lg-feedback lg-ok';
        el.querySelector('.lg-feedback').textContent = acertos + ' de ' + linhas.length + ' linhas certas (+' + acertos * 5 + ' pts). Agora classifique a fórmula.';
      };
      el.querySelectorAll('.lg-classe').forEach(function (b) {
        b.onclick = function () {
          const fb = el.querySelector('.lg-feedback');
          const escolha = b.getAttribute('data-c');
          el.querySelectorAll('.lg-classe').forEach(function (x) { x.disabled = true; });
          if (escolha === classe) {
            pontos += 20;
            fb.className = 'lg-feedback lg-ok';
            fb.textContent = 'Isso mesmo: é ' + classe + ' (+20 pts). ' + cfg.explica;
          } else {
            fb.className = 'lg-feedback lg-err';
            fb.textContent = 'A resposta correta é ' + classe + '. ' + cfg.explica;
          }
          const pts = el.querySelector('.lg-placar > span');
          if (pts) pts.innerHTML = '<i class="fa-solid fa-star"></i> ' + pontos + ' pts';
        };
      });
    }
    render();
  };

  /* ---------- 3. Memória de equivalências ---------- */
  LG.memoria = function (el, pares) {
    if (!el || !pares || !pares.length) return;
    let cartas = [];
    pares.forEach(function (p, id) {
      cartas.push({ id: id, txt: p[0] });
      cartas.push({ id: id, txt: p[1] });
    });
    cartas = embaralhar(cartas);
    let abertas = [], achadas = {}, tentativas = 0, bloqueado = false;

    function render() {
      const achadosN = Object.keys(achadas).length;
      if (achadosN === pares.length) {
        el.innerHTML = placarHTML(achadosN * 20, '<span>' + tentativas + ' tentativas</span>') +
          '<div class="lg-fim"><i class="fa-solid fa-medal lg-ouro"></i>' +
          '<p class="lg-fim-t">Todos os pares encontrados!</p>' +
          '<button type="button" class="lg-btn" data-a="reiniciar">Embaralhar</button></div>';
        el.querySelector('[data-a="reiniciar"]').onclick = function () {
          cartas = embaralhar(cartas); abertas = []; achadas = {}; tentativas = 0; render();
        };
        return;
      }
      el.innerHTML = placarHTML(achadosN * 20, '<span>' + tentativas + ' tentativas</span>') +
        '<p class="lg-pergunta">Encontre o par de fórmulas que são equivalentes (têm a mesma tabela-verdade).</p>' +
        '<div class="lg-memoria">' + cartas.map(function (c, idx) {
          const virada = abertas.indexOf(idx) >= 0 || achadas[c.id] !== undefined;
          const classe = achadas[c.id] !== undefined ? ' lg-achada' : (virada ? ' lg-virada' : '');
          return '<button type="button" class="lg-carta' + classe + '" data-i="' + idx + '">' +
            '<span>' + (virada ? esc(c.txt) : '?') + '</span></button>';
        }).join('') + '</div>';

      el.querySelectorAll('.lg-carta').forEach(function (b) {
        b.onclick = function () {
          if (bloqueado) return;
          const idx = Number(b.getAttribute('data-i'));
          if (abertas.indexOf(idx) >= 0 || achadas[cartas[idx].id] !== undefined) return;
          abertas.push(idx);
          if (abertas.length === 2) {
            tentativas++;
            const a = cartas[abertas[0]], c = cartas[abertas[1]];
            if (a.id === c.id) {
              achadas[a.id] = true;
              abertas = [];
              render();
            } else {
              bloqueado = true;
              render();
              setTimeout(function () { abertas = []; bloqueado = false; render(); }, 1100);
            }
          } else {
            render();
          }
        };
      });
    }
    render();
  };

  /* ---------- 4. Ordenar a demonstração ---------- */
  LG.ordenar = function (el, cfg) {
    if (!el || !cfg) return;
    const passos = cfg.passos;
    let escolhidos = [], restantes = embaralhar(passos.map(function (_, i) { return i; })), pontos = 0, erros = 0, fim = false;

    function render() {
      const feitos = escolhidos.map(function (i, pos) {
        return '<li class="lg-passo-feito"><span class="lg-n">' + (pos + 1) + '</span> ' + passos[i] + '</li>';
      }).join('');
      const pilha = restantes.map(function (i) {
        return '<button type="button" class="lg-btn lg-passo" data-i="' + i + '">' + passos[i] + '</button>';
      }).join('');
      el.innerHTML = placarHTML(pontos, '<span>erros ' + erros + '</span>') +
        '<p class="lg-pergunta">' + cfg.pergunta + '</p>' +
        '<ol class="lg-prova">' + (feitos || '<li class="lg-vazio">Clique nos passos na ordem em que a prova avança.</li>') + '</ol>' +
        '<div class="lg-opcoes">' + pilha + '</div>' +
        '<div class="lg-acoes">' +
        '<button type="button" class="lg-mini" data-a="desfazer"' + (escolhidos.length ? '' : ' disabled') + '>desfazer último</button>' +
        '</div><p class="lg-feedback" aria-live="polite"></p>';

      el.querySelectorAll('.lg-passo').forEach(function (b) {
        b.onclick = function () {
          const i = Number(b.getAttribute('data-i'));
          const esperado = cfg.ordem[escolhidos.length];
          const fb = el.querySelector('.lg-feedback');
          if (i === esperado) {
            escolhidos.push(i);
            restantes = restantes.filter(function (x) { return x !== i; });
            pontos += 10;
            if (restantes.length === 0) {
              pontos += 30;
              fim = true;
              el.innerHTML = placarHTML(pontos, '<span>erros ' + erros + '</span>') +
                '<ol class="lg-prova">' + escolhidos.map(function (x, pos) {
                  return '<li class="lg-passo-feito"><span class="lg-n">' + (pos + 1) + '</span> ' + passos[x] + '</li>';
                }).join('') + '</ol>' +
                '<div class="lg-fim"><i class="fa-solid fa-medal ' + (erros === 0 ? 'lg-ouro' : 'lg-prata') + '"></i>' +
                '<p class="lg-fim-t">Prova completa' + (erros === 0 ? ' sem erros' : ' com ' + erros + ' erro(s)') + '!</p>' +
                '<p class="text-sm text-slate-300">' + cfg.conclusao + '</p>' +
                '<button type="button" class="lg-btn" data-a="reiniciar">Jogar de novo</button></div>';
              el.querySelector('[data-a="reiniciar"]').onclick = function () {
                escolhidos = []; restantes = embaralhar(passos.map(function (_, j) { return j; })); pontos = 0; erros = 0; fim = false; render();
              };
              return;
            }
            render();
          } else {
            erros++;
            pontos = Math.max(0, pontos - 3);
            render();
            const novo = el.querySelector('.lg-feedback');
            novo.className = 'lg-feedback lg-err';
            novo.textContent = 'Essa linha ainda não pode vir agora: ' + (cfg.dica ? cfg.dica[escolhidos.length] || '' : '');
          }
        };
      });
      const des = el.querySelector('[data-a="desfazer"]');
      if (des) des.onclick = function () {
        if (!escolhidos.length || fim) return;
        restantes.push(escolhidos.pop());
        render();
      };
    }
    render();
  };

  /* ---------- 5. Circuito: descobrir a porta ---------- */
  const PORTAS = {
    AND: function (a, b) { return a && b; },
    OR: function (a, b) { return a || b; },
    XOR: function (a, b) { return a !== b; },
    NAND: function (a, b) { return !(a && b); },
    NOR: function (a, b) { return !(a || b); },
    XNOR: function (a, b) { return a === b; }
  };
  LG.PORTAS = PORTAS;

  LG.circuito = function (el, cfg) {
    if (!el || !cfg) return;
    const nomes = Object.keys(PORTAS);
    const alvoDe = function (a, b) { return cfg.alvo(a, b); };
    const linhas = [[false, false], [false, true], [true, false], [true, true]];
    let escolhida = null, tentativas = 0, pontos = 0, resolvido = false;

    function render() {
      const botoes = nomes.map(function (n) {
        return '<button type="button" class="lg-btn lg-porta' + (escolhida === n ? ' lg-sel' : '') + '" data-p="' + n + '">' + n + '</button>';
      }).join('');
      let tabela = '';
      if (escolhida) {
        const f = PORTAS[escolhida];
        tabela = '<div class="lg-tbl-wrap"><table class="lg-tbl"><thead><tr><th>A</th><th>B</th><th>Sua porta (' + escolhida + ')</th><th>Alvo</th></tr></thead><tbody>' +
          linhas.map(function (l) {
            const s = f(l[0], l[1]), t = alvoDe(l[0], l[1]);
            return '<tr><td>' + (l[0] ? V : F) + '</td><td>' + (l[1] ? V : F) + '</td><td>' + (s ? V : F) + '</td>' +
              '<td class="' + (s === t ? 'lg-ok-t' : 'lg-err-t') + '">' + (t ? V : F) + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }
      el.innerHTML = placarHTML(pontos, '<span>tentativas ' + tentativas + '</span>') +
        '<p class="lg-pergunta">' + cfg.pergunta + '</p>' +
        '<div class="lg-circuito"><span class="lg-io">A</span><span class="lg-io">B</span>' +
        '<span class="lg-seta">→</span><span class="lg-caixa-porta">' + (escolhida || '?') + '</span><span class="lg-seta">→</span><span class="lg-io">S</span></div>' +
        '<div class="lg-opcoes">' + botoes + '</div>' + tabela +
        (resolvido
          ? '<p class="lg-feedback lg-ok">Circuito correto em ' + tentativas + ' tentativa(s). ' + cfg.explica + '</p>'
          : '<p class="lg-feedback" aria-live="polite"></p>');

      el.querySelectorAll('.lg-porta').forEach(function (b) {
        b.onclick = function () {
          if (resolvido) return;
          escolhida = b.getAttribute('data-p');
          tentativas++;
          const f = PORTAS[escolhida];
          const acerta = linhas.every(function (l) { return f(l[0], l[1]) === alvoDe(l[0], l[1]); });
          if (acerta) {
            resolvido = true;
            pontos = Math.max(20, 100 - 15 * (tentativas - 1));
          }
          render();
          if (!resolvido) {
            const fb = el.querySelector('.lg-feedback');
            fb.className = 'lg-feedback lg-err';
            fb.textContent = 'Ainda não: compare a coluna da sua porta com a coluna do alvo.';
          }
        };
      });
    }
    render();
  };

  /* ---------- 6. Cavaleiros e escudeiros ---------- */
  LG.cavaleiros = function (el, cfg) {
    if (!el || !cfg) return;
    const pessoas = cfg.pessoas;
    const resp = {};
    pessoas.forEach(function (p) { resp[p.nome] = null; });
    let pontos = 0, resolvido = false;

    function render() {
      el.innerHTML = placarHTML(pontos) +
        '<p class="lg-pergunta">' + cfg.pergunta + '</p>' +
        '<ul class="lg-pessoas">' + pessoas.map(function (p) {
          return '<li class="lg-pessoa"><div class="lg-nome"><i class="fa-solid fa-user"></i> ' + p.nome + '</div>' +
            '<p class="lg-fala">“' + p.fala + '”</p>' +
            '<div class="lg-opcoes">' +
            '<button type="button" class="lg-mini' + (resp[p.nome] === 'cav' ? ' lg-sel' : '') + '" data-n="' + p.nome + '" data-t="cav"' + (resolvido ? ' disabled' : '') + '>Cavaleiro (sempre fala a verdade)</button>' +
            '<button type="button" class="lg-mini' + (resp[p.nome] === 'esc' ? ' lg-sel' : '') + '" data-n="' + p.nome + '" data-t="esc"' + (resolvido ? ' disabled' : '') + '>Escudeiro (sempre mente)</button>' +
            '</div></li>';
        }).join('') + '</ul>' +
        (resolvido ? '' : '<button type="button" class="lg-btn lg-prox" data-a="conferir">Conferir solução</button>') +
        '<p class="lg-feedback" aria-live="polite"></p>';

      el.querySelectorAll('[data-n]').forEach(function (b) {
        b.onclick = function () {
          if (resolvido) return;
          resp[b.getAttribute('data-n')] = b.getAttribute('data-t');
          render();
        };
      });
      const conf = el.querySelector('[data-a="conferir"]');
      if (conf) conf.onclick = function () {
        const fb = el.querySelector('.lg-feedback');
        if (pessoas.some(function (p) { return resp[p.nome] === null; })) {
          fb.className = 'lg-feedback lg-err';
          fb.textContent = 'Classifique todos antes de conferir.';
          return;
        }
        const acertos = pessoas.filter(function (p) { return resp[p.nome] === p.tipo; }).length;
        if (acertos === pessoas.length) {
          resolvido = true;
          pontos = 100;
          render();
          el.querySelector('.lg-feedback').className = 'lg-feedback lg-ok';
          el.querySelector('.lg-feedback').textContent = 'Solução correta! ' + cfg.explica;
        } else {
          pontos = Math.max(0, pontos + acertos * 5);
          fb.className = 'lg-feedback lg-err';
          fb.textContent = acertos + ' de ' + pessoas.length + ' corretos. Releia as falas: a afirmação de um cavaleiro precisa ser verdadeira.';
        }
      };
    }
    render();
  };

  global.LG = LG;
})(typeof window !== 'undefined' ? window : this);
