/* =====================================================================
   Academic Hub — Biblioteca compartilhada
   Navegação, progresso do aluno, quiz declarativo, reveal-on-scroll e
   utilitários de canvas usados pelas animações de cada tópico.
   ===================================================================== */

(function (global) {
  'use strict';

  const AH = {};

  /* ------------------------------------------------------------------ */
  /* Caminho base (o site roda em subpasta no GitHub Pages)              */
  /* ------------------------------------------------------------------ */
  AH.root = function () {
    return document.documentElement.getAttribute('data-root') || './';
  };

  /* ------------------------------------------------------------------ */
  /* Armazenamento local (tolerante a navegação privada / bloqueios)     */
  /* ------------------------------------------------------------------ */
  const KEY = 'academic-hub:progresso';

  AH.getProgress = function () {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  };

  AH.setDone = function (key, done) {
    try {
      const p = AH.getProgress();
      if (done) p[key] = Date.now();
      else delete p[key];
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch (e) { /* silencioso: progresso é conveniência, não requisito */ }
  };

  AH.isDone = function (key) {
    return Object.prototype.hasOwnProperty.call(AH.getProgress(), key);
  };

  /* ------------------------------------------------------------------ */
  /* Catálogo                                                            */
  /* ------------------------------------------------------------------ */
  AH.disciplina = function (id) {
    return (global.AH_DATA ? global.AH_DATA.disciplinas : []).find(d => d.id === id || d.slug === id);
  };

  AH.topicoIndex = function (disciplina, topicoId) {
    return disciplina.topicos.findIndex(t => t.id === topicoId);
  };

  AH.topicUrl = function (disciplina, topico) {
    return AH.root() + 'disciplinas/' + disciplina.slug + '/topicos/' + topico.id + '.html';
  };

  AH.progressoDisciplina = function (disciplina) {
    const done = disciplina.topicos.filter(t => AH.isDone(disciplina.id + '/' + t.id)).length;
    return { done: done, total: disciplina.topicos.length, pct: Math.round((done / disciplina.topicos.length) * 100) };
  };

  /* ------------------------------------------------------------------ */
  /* Cabeçalho global                                                    */
  /* ------------------------------------------------------------------ */
  AH.mountHeader = function (opts) {
    opts = opts || {};
    const root = AH.root();
    const el = document.getElementById('ah-header');
    if (!el) return;

    const links = (global.AH_DATA ? global.AH_DATA.disciplinas : []).map(d =>
      `<a href="${root}disciplinas/${d.slug}/index.html"
          class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition text-sm whitespace-nowrap">
         <i class="fa-solid ${d.icone} text-indigo-400 mr-1.5"></i>${d.curto}
       </a>`).join('');

    el.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <a href="${root}index.html" class="flex items-center gap-3 group shrink-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
            <i class="fa-solid fa-graduation-cap text-white"></i>
          </div>
          <div class="leading-tight">
            <h1 class="font-bold text-base text-white">Academic<span class="text-indigo-400">Hub</span></h1>
            <p class="text-[11px] text-slate-400 hidden sm:block">Material interativo das disciplinas</p>
          </div>
        </a>
        <nav class="flex items-center gap-1 overflow-x-auto">
          ${links}
          <a href="${root}index.html#disciplinas" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition text-sm hidden md:inline-flex">
            <i class="fa-solid fa-table-cells-large mr-1.5"></i>Todas
          </a>
        </nav>
      </div>`;
  };

  /* ------------------------------------------------------------------ */
  /* Página de tópico: breadcrumb, sumário, progresso, anterior/próximo  */
  /* ------------------------------------------------------------------ */
  AH.mountTopic = function (disciplinaId, topicoId) {
    const d = AH.disciplina(disciplinaId);
    if (!d) return;
    const i = AH.topicoIndex(d, topicoId);
    if (i < 0) return;
    const t = d.topicos[i];
    const root = AH.root();
    const key = d.id + '/' + t.id;

    document.title = t.titulo + ' · ' + d.nome + ' · AcademicHub';

    /* --- Hero / cabeçalho do tópico ---------------------------------- */
    const hero = document.getElementById('ah-topic-hero');
    if (hero) {
      hero.innerHTML = `
        <nav class="flex items-center gap-2 text-xs text-slate-400 mb-5 flex-wrap">
          <a href="${root}index.html" class="hover:text-indigo-400 transition">Hub</a>
          <i class="fa-solid fa-chevron-right text-[9px] text-slate-600"></i>
          <a href="${root}disciplinas/${d.slug}/index.html" class="hover:text-indigo-400 transition">${d.nome}</a>
          <i class="fa-solid fa-chevron-right text-[9px] text-slate-600"></i>
          <span class="text-slate-300">Tópico ${String(i + 1).padStart(2, '0')}</span>
        </nav>
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl text-white shadow-lg shadow-indigo-600/25 shrink-0">
              <i class="fa-solid ${t.icone}"></i>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">${t.titulo}</h1>
              <p class="text-slate-400 text-sm max-w-2xl leading-relaxed">${t.resumo}</p>
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <span class="ah-badge"><i class="fa-solid fa-signal"></i>${t.nivel}</span>
                <span class="ah-badge ah-badge-slate"><i class="fa-regular fa-clock"></i>${t.minutos} min de leitura</span>
                ${t.tags.map(tag => `<span class="ah-badge ah-badge-sky">${tag}</span>`).join('')}
              </div>
            </div>
          </div>
          <button id="ah-done-btn" class="ah-btn ah-btn-ghost shrink-0 ah-no-print">
            <i class="fa-regular fa-circle-check"></i><span>Marcar como concluído</span>
          </button>
        </div>`;

      const btn = document.getElementById('ah-done-btn');
      const paint = () => {
        const done = AH.isDone(key);
        btn.className = 'ah-btn shrink-0 ah-no-print ' + (done ? 'ah-btn-ok' : 'ah-btn-ghost');
        btn.innerHTML = done
          ? '<i class="fa-solid fa-circle-check"></i><span>Tópico concluído</span>'
          : '<i class="fa-regular fa-circle-check"></i><span>Marcar como concluído</span>';
      };
      btn.addEventListener('click', () => { AH.setDone(key, !AH.isDone(key)); paint(); });
      paint();
    }

    /* --- Sumário lateral gerado a partir das seções ------------------- */
    const toc = document.getElementById('ah-toc');
    if (toc) {
      const secs = Array.from(document.querySelectorAll('main section[id][data-toc]'));
      toc.innerHTML = secs.map(s =>
        `<a href="#${s.id}" data-toc-link="${s.id}"
            class="block px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700/40 transition border-l-2 border-transparent">
           ${s.getAttribute('data-toc')}
         </a>`).join('');

      if ('IntersectionObserver' in global) {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (!e.isIntersecting) return;
            toc.querySelectorAll('[data-toc-link]').forEach(a => {
              const on = a.getAttribute('data-toc-link') === e.target.id;
              a.classList.toggle('text-white', on);
              a.classList.toggle('bg-slate-700/40', on);
              a.style.borderLeftColor = on ? 'var(--ah-accent)' : 'transparent';
            });
          });
        }, { rootMargin: '-15% 0px -70% 0px' });
        secs.forEach(s => io.observe(s));
      }
    }

    /* --- Navegação anterior / próximo -------------------------------- */
    const nav = document.getElementById('ah-topic-nav');
    if (nav) {
      const prev = i > 0 ? d.topicos[i - 1] : null;
      const next = i < d.topicos.length - 1 ? d.topicos[i + 1] : null;
      const card = (tp, dir) => tp ? `
        <a href="${AH.topicUrl(d, tp)}" class="ah-card ah-card-hover p-4 flex items-center gap-3 ${dir === 'next' ? 'sm:flex-row-reverse sm:text-right' : ''}">
          <i class="fa-solid fa-${dir === 'next' ? 'arrow-right' : 'arrow-left'} text-indigo-400"></i>
          <div class="min-w-0">
            <div class="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">${dir === 'next' ? 'Próximo tópico' : 'Tópico anterior'}</div>
            <div class="text-sm text-white font-semibold truncate">${tp.titulo}</div>
          </div>
        </a>` : `<div class="hidden sm:block"></div>`;

      nav.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${card(prev, 'prev')}
          ${card(next, 'next')}
        </div>
        <div class="mt-4 text-center">
          <a href="${root}disciplinas/${d.slug}/index.html" class="ah-btn ah-btn-ghost">
            <i class="fa-solid fa-list"></i> Todos os ${d.topicos.length} tópicos de ${d.curto}
          </a>
        </div>`;
    }

    /* --- Rodapé ------------------------------------------------------- */
    AH.mountFooter();
  };

  /* ------------------------------------------------------------------ */
  /* Rodapé                                                              */
  /* ------------------------------------------------------------------ */
  AH.mountFooter = function () {
    const el = document.getElementById('ah-footer');
    if (!el) return;
    const root = AH.root();
    el.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p><i class="fa-solid fa-graduation-cap text-indigo-500 mr-1.5"></i>
           AcademicHub — material de apoio das disciplinas de graduação.</p>
        <div class="flex items-center gap-4">
          <a href="${root}index.html" class="hover:text-indigo-400 transition">Início</a>
          <a href="${(global.AH_DATA && global.AH_DATA.repositorio) || '#'}" target="_blank" rel="noopener"
             class="hover:text-indigo-400 transition"><i class="fa-brands fa-github mr-1"></i>Repositório das aulas</a>
        </div>
      </div>`;
  };

  /* ------------------------------------------------------------------ */
  /* Quiz declarativo                                                    */
  /*   <div class="ah-quiz" data-answer="2">                             */
  /*     <p class="ah-quiz-q">Pergunta…</p>                              */
  /*     <button class="ah-quiz-opt">A…</button>  (índice 0,1,2…)        */
  /*     <p class="ah-quiz-exp">Explicação exibida ao responder</p>      */
  /*   </div>                                                            */
  /* ------------------------------------------------------------------ */
  AH.initQuizzes = function (scope) {
    (scope || document).querySelectorAll('.ah-quiz').forEach(quiz => {
      if (quiz.dataset.ready) return;
      quiz.dataset.ready = '1';
      const answer = parseInt(quiz.getAttribute('data-answer'), 10);
      const opts = Array.from(quiz.querySelectorAll('.ah-quiz-opt'));
      const exp = quiz.querySelector('.ah-quiz-exp');
      if (exp) exp.style.display = 'none';

      opts.forEach((opt, idx) => {
        opt.addEventListener('click', () => {
          if (quiz.dataset.answered) return;
          quiz.dataset.answered = '1';
          opts.forEach((o, j) => {
            o.classList.add('locked');
            if (j === answer) o.classList.add('correct');
          });
          if (idx !== answer) opt.classList.add('wrong');
          if (exp) {
            exp.style.display = '';
            exp.classList.add('ah-reveal', 'visible');
          }
        });
      });
    });
  };

  /* ------------------------------------------------------------------ */
  /* Reveal on scroll                                                    */
  /* ------------------------------------------------------------------ */
  AH.initReveal = function (scope) {
    const els = (scope || document).querySelectorAll('.ah-reveal:not(.visible), .ah-draw:not(.visible)');
    if (!('IntersectionObserver' in global)) {
      els.forEach(e => e.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e, k) => {
        if (!e.isIntersecting) return;
        setTimeout(() => e.target.classList.add('visible'), k * 70);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  };

  /* ------------------------------------------------------------------ */
  /* Abas simples: [data-tabs] > [data-tab="x"] / [data-panel="x"]       */
  /* ------------------------------------------------------------------ */
  AH.initTabs = function (scope) {
    (scope || document).querySelectorAll('[data-tabs]').forEach(group => {
      const tabs = Array.from(group.querySelectorAll('[data-tab]'));
      const panels = Array.from(group.querySelectorAll('[data-panel]'));
      const show = name => {
        tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === name));
        panels.forEach(p => p.classList.toggle('hidden', p.getAttribute('data-panel') !== name));
      };
      tabs.forEach(t => t.addEventListener('click', () => show(t.getAttribute('data-tab'))));
      if (tabs.length) show(tabs[0].getAttribute('data-tab'));
    });
  };

  /* ------------------------------------------------------------------ */
  /* Canvas utilitário (retina + resize)                                 */
  /* ------------------------------------------------------------------ */
  AH.canvas = function (id, draw) {
    const cv = typeof id === 'string' ? document.getElementById(id) : id;
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const api = { el: cv, ctx: ctx, w: 0, h: 0, draw: draw };

    /* skipDraw evita chamar o callback antes de o estado da página existir
       (o primeiro fit roda durante a construção, quando as variáveis do
       chamador ainda podem estar na zona morta temporal do let/const). */
    api.fit = function (skipDraw) {
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect();
      const cssH = parseFloat(getComputedStyle(cv).height) || rect.height || 320;
      api.w = rect.width || cv.parentElement.clientWidth;
      api.h = cssH;
      cv.width = Math.round(api.w * dpr);
      cv.height = Math.round(api.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (skipDraw !== true && typeof api.draw === 'function') api.draw(ctx, api.w, api.h);
    };

    api.clear = function (color) {
      ctx.clearRect(0, 0, api.w, api.h);
      if (color) { ctx.fillStyle = color; ctx.fillRect(0, 0, api.w, api.h); }
    };

    let to;
    global.addEventListener('resize', () => { clearTimeout(to); to = setTimeout(() => api.fit(), 120); });
    api.fit(true);
    return api;
  };

  /* Loop de animação que pausa sozinho quando sai da tela e volta quando reaparece
     (economiza bateria sem exigir que a página cuide disso). */
  AH.loop = function (el, step) {
    let raf = null, last = 0, running = false, pedido = false, visivel = true;

    const tick = ts => {
      const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016;
      last = ts;
      step(dt, ts);
      raf = requestAnimationFrame(tick);
    };
    const roda = () => { if (!running) { running = true; last = 0; raf = requestAnimationFrame(tick); } };
    const para = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = null; };

    const ctrl = {
      start() { pedido = true; if (visivel) roda(); },
      stop() { pedido = false; para(); },
      get running() { return running; }
    };

    if (el && 'IntersectionObserver' in global) {
      new IntersectionObserver(es => {
        es.forEach(e => {
          visivel = e.isIntersecting;
          if (!visivel) para();
          else if (pedido) roda();
        });
      }, { threshold: 0 }).observe(el);
    }
    return ctrl;
  };

  /* ------------------------------ helpers --------------------------- */
  AH.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  AH.lerp = (a, b, t) => a + (b - a) * t;
  AH.rand = (a, b) => a + Math.random() * (b - a);
  AH.fmt = (v, d) => Number(v).toFixed(d === undefined ? 2 : d);

  AH.roundRect = function (ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

  AH.arrow = function (ctx, x1, y1, x2, y2, color, head) {
    head = head || 8;
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(a - 0.4), y2 - head * Math.sin(a - 0.4));
    ctx.lineTo(x2 - head * Math.cos(a + 0.4), y2 - head * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
  };

  /* ------------------------------------------------------------------ */
  /* Boot automático                                                     */
  /* ------------------------------------------------------------------ */
  AH.boot = function () {
    AH.mountHeader();
    AH.initQuizzes();
    AH.initTabs();
    AH.initReveal();
    AH.mountFooter();
    const page = document.body.getAttribute('data-topic');
    if (page) {
      const parts = page.split('/');
      AH.mountTopic(parts[0], parts[1]);
      AH.initReveal();
    }
  };

  document.addEventListener('DOMContentLoaded', AH.boot);
  global.AH = AH;
})(window);
