/* =====================================================================
   Academic Hub — Renderiza a página de uma disciplina
   Usa <body data-disciplina="ia"> e o catálogo de assets/js/data.js
   ===================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const id = document.body.getAttribute('data-disciplina');
    const d = AH.disciplina(id);
    if (!d) return;
    const root = AH.root();

    /* ------------------------------ Hero ---------------------------- */
    const hero = document.getElementById('ah-disc-hero');
    const p = AH.progressoDisciplina(d);
    const niveis = [...new Set(d.topicos.map(t => t.nivel))];
    const minutos = d.topicos.reduce((s, t) => s + t.minutos, 0);

    if (hero) {
      hero.innerHTML = `
        <nav class="flex items-center gap-2 text-xs text-slate-400 mb-5">
          <a href="${root}index.html" class="hover:text-indigo-400 transition">Hub</a>
          <i class="fa-solid fa-chevron-right text-[9px] text-slate-600"></i>
          <span class="text-slate-300">${d.nome}</span>
        </nav>
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div class="max-w-2xl">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg"
                   style="background: linear-gradient(135deg, ${d.corHex}, #a855f7)">
                <i class="fa-solid ${d.icone}"></i>
              </div>
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-white leading-tight">${d.nome}</h1>
                <p class="text-xs text-slate-400 mt-1">${d.topicos.length} tópicos · ${Math.round(minutos / 60)}h de leitura estimada · ${niveis.join(' → ')}</p>
              </div>
            </div>
            <p class="ah-lead text-sm sm:text-base">${d.descricao}</p>
          </div>
          <div class="ah-card p-5 w-full lg:w-72 shrink-0">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-slate-400 font-semibold uppercase tracking-wide">Seu progresso</span>
              <span class="text-sm font-bold text-white">${p.pct}%</span>
            </div>
            <div class="ah-progress mb-3"><i style="width:${p.pct}%"></i></div>
            <p class="text-xs text-slate-500 mb-3">${p.done} de ${p.total} tópicos concluídos. Salvo apenas neste navegador.</p>
            <div class="flex gap-2">
              <a id="ah-continuar" href="#" class="ah-btn ah-btn-primary flex-1 text-xs"><i class="fa-solid fa-play"></i> Continuar</a>
              <button id="ah-reset" class="ah-btn ah-btn-ghost text-xs" title="Limpar progresso"><i class="fa-solid fa-rotate-left"></i></button>
            </div>
          </div>
        </div>`;

      const proximo = d.topicos.find(t => !AH.isDone(d.id + '/' + t.id)) || d.topicos[0];
      document.getElementById('ah-continuar').href = AH.topicUrl(d, proximo);
      document.getElementById('ah-reset').addEventListener('click', function () {
        d.topicos.forEach(t => AH.setDone(d.id + '/' + t.id, false));
        location.reload();
      });
    }

    /* ----------------------------- Filtros -------------------------- */
    const tags = [...new Set(d.topicos.flatMap(t => t.tags))];
    const filtros = document.getElementById('ah-filtros');
    let filtroAtivo = 'todos';

    if (filtros) {
      filtros.innerHTML =
        `<button class="ah-chip active" data-filtro="todos">Todos</button>` +
        tags.map(t => `<button class="ah-chip" data-filtro="${t}">${t}</button>`).join('');
      filtros.addEventListener('click', e => {
        const b = e.target.closest('[data-filtro]');
        if (!b) return;
        filtroAtivo = b.getAttribute('data-filtro');
        filtros.querySelectorAll('.ah-chip').forEach(c => c.classList.toggle('active', c === b));
        render();
      });
    }

    /* ----------------------------- Tópicos -------------------------- */
    const grid = document.getElementById('ah-topicos');

    function card(t, i) {
      const done = AH.isDone(d.id + '/' + t.id);
      return `
      <a href="topicos/${t.id}.html" class="ah-card ah-card-hover p-5 flex flex-col ah-reveal relative">
        ${done ? '<i class="fa-solid fa-circle-check text-emerald-500 absolute top-4 right-4"></i>' : ''}
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400">
            <i class="fa-solid ${t.icone}"></i>
          </div>
          <span class="font-mono text-xs text-slate-500">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <h3 class="text-sm font-bold text-white leading-snug mb-2">${t.titulo}</h3>
        <p class="text-xs text-slate-400 leading-relaxed flex-1 mb-3">${t.resumo}</p>
        <div class="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-700/60">
          <span class="ah-badge ah-badge-slate text-[10px]">${t.nivel}</span>
          <span class="ah-badge ah-badge-slate text-[10px]"><i class="fa-regular fa-clock"></i>${t.minutos}min</span>
          <span class="ml-auto text-indigo-400 text-xs font-semibold">Abrir <i class="fa-solid fa-arrow-right ml-1"></i></span>
        </div>
      </a>`;
    }

    function render() {
      const lista = d.topicos
        .map((t, i) => ({ t, i }))
        .filter(x => filtroAtivo === 'todos' || x.t.tags.includes(filtroAtivo));
      grid.innerHTML = lista.map(x => card(x.t, x.i)).join('');
      AH.initReveal(grid);
    }

    render();
  });
})();
