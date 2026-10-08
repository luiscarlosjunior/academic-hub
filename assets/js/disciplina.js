/* =====================================================================
   Academic Hub — Renderiza a página de uma disciplina
   Usa <body data-disciplina="ia"> e o catálogo de assets/js/data.js.
   Quando a disciplina tem "trilhas", mostra abas para separar os grupos
   (ex.: Modelagem UML × POO em Java) e agrupa a lista em "Todas".
   ===================================================================== */

(function () {
  'use strict';

  /* Remove acentos e caixa para a busca funcionar com "logica" e "Lógica" */
  const normaliza = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

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
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg shrink-0"
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

    /* ------------------------ Numeração por trilha ------------------- */
    const trilhas = d.trilhas || null;
    const numero = {};
    const contaTrilha = {};
    d.topicos.forEach(t => {
      const k = t.trilha || '_';
      contaTrilha[k] = (contaTrilha[k] || 0) + 1;
      numero[t.id] = contaTrilha[k];
    });

    /* ----------------------------- Estado --------------------------- */
    const abas = document.getElementById('ah-trilhas');
    const filtros = document.getElementById('ah-filtros');
    const busca = document.getElementById('ah-busca');
    const contagem = document.getElementById('ah-contagem');
    const grid = document.getElementById('ah-topicos');

    /* Aceita ?trilha=<id> (vindo de um tópico) para abrir direto na aba certa */
    const trilhaURL = new URLSearchParams(location.search).get('trilha');
    let trilhaAtiva = trilhas && trilhas.some(x => x.id === trilhaURL) ? trilhaURL : 'todas';
    let tagAtiva = 'todos';
    let termo = '';

    /* Tópicos do escopo atual (uma trilha ou todas) */
    const doTrilha = () => (trilhaAtiva === 'todas' || !trilhas) ? d.topicos : d.topicos.filter(t => t.trilha === trilhaAtiva);
    const dasTrilhas = tr => d.topicos.filter(t => t.trilha === tr);

    /* ------------------------------ Abas ---------------------------- */
    function desenhaAbas() {
      if (!abas) return;
      if (!trilhas) { abas.classList.add('hidden'); return; }
      const botao = (valor, nome, icone, total) => `
        <button class="ah-tab ${trilhaAtiva === valor ? 'active' : ''}" data-trilha="${valor}" aria-pressed="${trilhaAtiva === valor}">
          <i class="fa-solid ${icone}"></i>${nome}
          <span class="n">${total}</span>
        </button>`;
      abas.innerHTML =
        botao('todas', 'Todas as trilhas', 'fa-layer-group', d.topicos.length) +
        trilhas.map(tr => botao(tr.id, tr.nome, tr.icone, dasTrilhas(tr.id).length)).join('');
    }

    /* ----------------------------- Filtros -------------------------- */
    function desenhaFiltros() {
      if (!filtros) return;
      const tags = [...new Set(doTrilha().flatMap(t => t.tags))];
      if (tagAtiva !== 'todos' && !tags.includes(tagAtiva)) tagAtiva = 'todos';
      filtros.innerHTML =
        `<button class="ah-chip ${tagAtiva === 'todos' ? 'active' : ''}" data-filtro="todos">Todos os temas</button>` +
        tags.map(t => `<button class="ah-chip ${tagAtiva === t ? 'active' : ''}" data-filtro="${t}">${t}</button>`).join('');
    }

    function casa(t) {
      if (trilhaAtiva !== 'todas' && trilhas && t.trilha !== trilhaAtiva) return false;
      if (tagAtiva !== 'todos' && !t.tags.includes(tagAtiva)) return false;
      if (!termo) return true;
      const alvo = normaliza([t.titulo, t.resumo, t.nivel, ...t.tags].join(' '));
      return termo.split(/\s+/).every(palavra => alvo.includes(palavra));
    }

    /* ----------------------------- Tópicos -------------------------- */
    function card(t) {
      const done = AH.isDone(d.id + '/' + t.id);
      return `
      <a href="topicos/${t.id}.html" class="ah-card ah-card-hover p-5 flex flex-col ah-reveal relative min-w-0">
        ${done ? '<i class="fa-solid fa-circle-check text-emerald-500 absolute top-4 right-4" title="Concluído"></i>' : ''}
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
            <i class="fa-solid ${t.icone}"></i>
          </div>
          <span class="font-mono text-xs text-slate-500">${String(numero[t.id]).padStart(2, '0')}</span>
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
      const lista = d.topicos.filter(casa);
      const total = doTrilha().length;

      if (!lista.length) {
        grid.innerHTML = `
          <div class="col-span-full ah-card p-8 text-center">
            <i class="fa-solid fa-magnifying-glass text-2xl text-slate-500 mb-3"></i>
            <p class="text-sm text-slate-300 font-semibold">Nenhum tópico encontrado</p>
            <p class="text-xs text-slate-500 mt-1">Tente outro termo ou limpe os filtros.</p>
          </div>`;
      } else if (trilhas && trilhaAtiva === 'todas') {
        /* Em "Todas", cada trilha ganha um cabeçalho próprio */
        grid.innerHTML = trilhas.map(tr => {
          const itens = lista.filter(t => t.trilha === tr.id);
          if (!itens.length) return '';
          return `
            <div class="col-span-full flex items-center gap-3 mt-4 first:mt-0 pb-1">
              <i class="fa-solid ${tr.icone} text-lg" style="color:${tr.cor}"></i>
              <div>
                <h3 class="ah-h3">${tr.nome}</h3>
                <p class="text-xs text-slate-500">${tr.descricao}</p>
              </div>
            </div>
            ${itens.map(card).join('')}`;
        }).join('');
      } else {
        grid.innerHTML = lista.map(card).join('');
      }

      if (contagem) {
        contagem.textContent = lista.length === total
          ? `Mostrando os ${total} tópicos`
          : `Mostrando ${lista.length} de ${total} tópicos`;
      }
      AH.initReveal(grid);
    }

    /* ----------------------------- Eventos -------------------------- */
    if (abas) {
      abas.addEventListener('click', e => {
        const b = e.target.closest('[data-trilha]');
        if (!b) return;
        trilhaAtiva = b.getAttribute('data-trilha');
        tagAtiva = 'todos';
        desenhaAbas();
        desenhaFiltros();
        render();
      });
    }

    if (filtros) {
      filtros.addEventListener('click', e => {
        const b = e.target.closest('[data-filtro]');
        if (!b) return;
        tagAtiva = b.getAttribute('data-filtro');
        desenhaFiltros();
        render();
      });
    }

    if (busca) {
      busca.addEventListener('input', () => {
        termo = normaliza(busca.value.trim());
        render();
      });
    }

    desenhaAbas();
    desenhaFiltros();
    render();
  });
})();
