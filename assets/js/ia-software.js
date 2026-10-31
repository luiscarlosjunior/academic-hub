/* =====================================================================
   Engenharia de Software com IA — componentes interativos das aulas
   Cada componente é declarado no HTML com data-ias="<tipo>" e recebe os
   dados num <script type="application/json"> dentro do próprio bloco.
   Tipos: show, token, flow, hype, rogers, classify, passk, mut, diff,
          iam, canary, rag.
   ===================================================================== */
(function () {
  'use strict';

  const IAS = (window.IAS = {});
  const h = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  const dados = box => {
    const s = box.querySelector(':scope > script[type="application/json"]');
    try { return s ? JSON.parse(s.textContent) : {}; } catch (e) { console.error('ias: JSON inválido', box, e); return {}; }
  };
  const css = nome => getComputedStyle(document.documentElement).getPropertyValue(nome).trim() || '#888';
  const pct = (v, d = 0) => (v * 100).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%';
  const dec = (v, d) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const reduz = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* show: apresentação passo a passo sobre um diagrama                  */
  /* elementos do diagrama têm data-k; cada passo {t, d, on:[k...]}      */
  /* ------------------------------------------------------------------ */
  IAS.show = function (box) {
    const passos = dados(box).passos || [];
    const els = [...box.querySelectorAll('.ias-stage [data-k]')];
    const cap = h('div', 'ias-cap', '<div class="t"><span></span><small></small></div><p></p>');
    const dots = h('div', 'ias-dots');
    passos.forEach((_, i) => { const d = h('i'); d.title = 'Passo ' + (i + 1); d.onclick = () => { pare(); ir(i); }; dots.appendChild(d); });
    const ctl = h('div', 'ias-row',
      '<button type="button" class="ias-btn" data-a="ant">← Anterior</button>' +
      '<button type="button" class="ias-btn pri" data-a="prox">Próximo →</button>' +
      '<button type="button" class="ias-btn" data-a="play">▶ Apresentar</button>' +
      '<button type="button" class="ias-btn" data-a="zero">↺ Recomeçar</button>');
    box.append(cap, dots, ctl);
    let i = -1, timer = null;
    function pare() { clearInterval(timer); timer = null; ctl.querySelector('[data-a=play]').textContent = '▶ Apresentar'; }
    function ir(n) {
      i = Math.max(0, Math.min(passos.length - 1, n));
      box.classList.add('started');
      const p = passos[i];
      const vistos = new Set(passos.slice(0, i).flatMap(x => x.on || []));
      els.forEach(el => {
        const k = el.dataset.k;
        const on = (p.on || []).includes(k);
        el.classList.toggle('on', on);
        el.classList.toggle('off', !on && !vistos.has(k));
      });
      cap.querySelector('.t span').textContent = p.t || '';
      cap.querySelector('.t small').textContent = 'passo ' + (i + 1) + ' de ' + passos.length;
      cap.querySelector('p').innerHTML = p.d || '';
      [...dots.children].forEach((d, j) => d.classList.toggle('on', j <= i));
      ctl.querySelector('[data-a=ant]').disabled = i <= 0;
      ctl.querySelector('[data-a=prox]').disabled = i >= passos.length - 1;
    }
    ctl.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      const ac = a.dataset.a;
      if (ac === 'play') {
        if (timer) { pare(); return; }
        if (i >= passos.length - 1) ir(0); else ir(i + 1);
        a.textContent = '❚❚ Pausar';
        timer = setInterval(() => { if (i >= passos.length - 1) pare(); else ir(i + 1); }, 3400);
        return;
      }
      pare();
      if (ac === 'ant') ir(i - 1);
      if (ac === 'prox') ir(i + 1);
      if (ac === 'zero') ir(0);
    });
    cap.querySelector('.t span').textContent = 'Clique em "Próximo" ou "Apresentar" para começar';
    cap.querySelector('.t small').textContent = passos.length + ' passos';
    ctl.querySelector('[data-a=ant]').disabled = true;
  };

  /* ------------------------------------------------------------------ */
  /* token: previsão da próxima palavra com temperatura                  */
  /* {prompt, cands:[{t, l, nota, errado}]}  l = logit                   */
  /* ------------------------------------------------------------------ */
  IAS.token = function (box) {
    const D = dados(box);
    const c = D.cands || [];
    const ui = h('div', '',
      '<div class="ias-prompt"><span class="p"></span> <span class="g"></span></div>' +
      '<div class="grid2" style="margin-top:12px"><div><label class="r">Temperatura <span class="tv"></span></label><input type="range" min="0.1" max="2" step="0.1" value="1"><p class="ias-note">Baixa: quase sempre a palavra mais provável. Alta: mais variedade, e mais chance de escolher algo errado.</p></div>' +
      '<div class="ias-row" style="align-content:flex-start"><button type="button" class="ias-btn pri" data-a="1">Sortear a próxima palavra</button><button type="button" class="ias-btn" data-a="50">Sortear 50 vezes</button><button type="button" class="ias-btn" data-a="z">↺</button></div></div>' +
      '<div class="ias-bars"></div><p class="ias-note nt"></p>');
    box.appendChild(ui);
    ui.querySelector('.p').textContent = D.prompt || '';
    const range = ui.querySelector('input'), bars = ui.querySelector('.ias-bars'), nt = ui.querySelector('.nt'), gen = ui.querySelector('.g');
    let cont = c.map(() => 0), total = 0;
    c.forEach((x, j) => {
      const b = h('div', 'ias-bar' + (x.errado ? ' wrong' : ''), '<span class="tk"></span><span class="tr"><i></i></span><span class="pc"></span>');
      b.querySelector('.tk').textContent = x.t; b.dataset.j = j; bars.appendChild(b);
    });
    function probs() {
      const T = +range.value, m = Math.max(...c.map(x => x.l / T));
      const e = c.map(x => Math.exp(x.l / T - m)), s = e.reduce((a, b) => a + b, 0);
      return e.map(v => v / s);
    }
    function pinta(hit) {
      const p = probs();
      ui.querySelector('.tv').textContent = dec(+range.value, 1);
      [...bars.children].forEach((b, j) => {
        b.querySelector('i').style.width = (p[j] * 100) + '%';
        b.querySelector('.pc').textContent = pct(p[j], 1) + (total ? ' · ' + cont[j] + '×' : '');
        b.classList.toggle('hit', j === hit);
      });
    }
    function sorteia() { const p = probs(); let r = Math.random(), j = 0; while (j < p.length - 1 && (r -= p[j]) > 0) j++; return j; }
    ui.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'z') { cont = c.map(() => 0); total = 0; gen.textContent = ''; nt.textContent = ''; pinta(-1); return; }
      const n = +a.dataset.a; let j = 0;
      for (let k = 0; k < n; k++) { j = sorteia(); cont[j]++; total++; }
      gen.innerHTML = '<span class="gen"></span>'; gen.firstChild.textContent = c[j].t;
      const erradas = c.reduce((s, x, k) => s + (x.errado ? cont[k] : 0), 0);
      nt.innerHTML = (n === 1 ? '<strong>Escolhida: “' + c[j].t + '”.</strong> ' + (c[j].nota || '') : '') +
        (total > 1 ? ' Em ' + total + ' sorteios, ' + erradas + ' (' + pct(erradas / total) + ') caíram numa continuação plausível mas errada.' : '');
      pinta(j);
    });
    range.addEventListener('input', () => pinta(-1));
    pinta(-1);
  };

  /* ------------------------------------------------------------------ */
  /* flow: simulação de fila codificação → revisão → produção            */
  /* ------------------------------------------------------------------ */
  IAS.flow = function (box) {
    const ui = h('div', '',
      '<div class="grid2"><div><label class="r">Aceleração da IA na codificação <span class="sv"></span></label><input type="range" data-k="s" min="1" max="4" step="0.5" value="1"></div>' +
      '<div><label class="r">Pessoas revisando <span class="rv"></span></label><input type="range" data-k="r" min="1" max="4" step="1" value="2"></div></div>' +
      '<div class="ias-chk" style="margin-top:6px"><label><input type="checkbox" data-k="g"> PRs ficam maiores com IA (cada revisão demora mais)</label></div>' +
      '<canvas width="760" height="230" role="img" aria-label="Simulação: PRs saem da codificação, esperam na fila de revisão e chegam à produção"></canvas>' +
      '<div class="ias-kpis"><div class="ias-kpi"><span>Semana simulada</span><b class="k-sem">0</b></div><div class="ias-kpi"><span>PRs esperando revisão</span><b class="k-fila">0</b></div><div class="ias-kpi"><span>Entregas por semana</span><b class="k-thr">0</b></div><div class="ias-kpi"><span>Espera média (horas)</span><b class="k-lt">0</b></div></div>' +
      '<div class="ias-row"><button type="button" class="ias-btn pri" data-a="go">❚❚ Pausar</button><button type="button" class="ias-btn" data-a="z">↺ Recomeçar</button></div><p class="ias-note nt"></p>');
    box.appendChild(ui);
    const cv = ui.querySelector('canvas'), ctx = cv.getContext('2d');
    const DEVS = 4, TC = 16, TR = 4;           // horas por PR para codificar e revisar
    let st, rodando = true, ultimo = 0, acc = 0;
    const inp = k => ui.querySelector('[data-k=' + k + ']');
    function zera() { st = { t: 0, prog: Array(DEVS).fill(0).map((_, i) => i * 4), fila: [], rev: [], voando: [], feitos: [], entregues: 0 }; }
    function passo() {                          // 1 passo = 1 hora simulada
      const s = +inp('s').value, r = +inp('r').value, g = inp('g').checked;
      const tr = TR * (g ? 1 + 0.45 * (s - 1) : 1);
      st.t++;
      st.prog = st.prog.map((p, i) => {
        p += s;
        if (p >= TC) { p -= TC; st.voando.push({ x: 0, y: 40 + i * 42, nasc: st.t }); }
        return p;
      });
      st.voando.forEach(v => { if (v.x >= 1) st.fila.push(v.nasc); });
      st.voando = st.voando.filter(v => v.x < 1);
      st.rev = st.rev.map(x => ({ ...x, falta: x.falta - 1 }));
      st.rev.filter(x => x.falta <= 0).forEach(x => { st.entregues++; st.feitos.push({ t: st.t, lt: st.t - x.nasc }); });
      st.rev = st.rev.filter(x => x.falta > 0);
      while (st.rev.length < r && st.fila.length) st.rev.push({ nasc: st.fila.shift(), falta: tr });
      st.feitos = st.feitos.filter(x => st.t - x.t < 160);
    }
    function desenha() {
      const W = cv.width, H = cv.height, fg = css('--fg'), mu = css('--muted'), ac = css('--accent'), am = css('--amber'), bl = css('--blue'), ln = css('--line');
      ctx.clearRect(0, 0, W, H);
      ctx.font = '600 13px system-ui'; ctx.textBaseline = 'middle';
      const caixa = (x, y, w, hh, txt, cor) => { ctx.strokeStyle = cor; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, hh, 10) : ctx.rect(x, y, w, hh); ctx.stroke(); ctx.fillStyle = fg; ctx.fillText(txt, x + 10, y + 14); };
      caixa(14, 14, 150, 200, 'Codificação', bl);
      caixa(290, 14, 220, 200, 'Fila de revisão', am);
      caixa(560, 14, 186, 200, 'Revisão → produção', ac);
      for (let i = 0; i < DEVS; i++) {
        const y = 40 + i * 42 + 8;
        ctx.fillStyle = ln; ctx.fillRect(30, y, 118, 8);
        ctx.fillStyle = bl; ctx.fillRect(30, y, 118 * (st.prog[i] / TC), 8);
        ctx.fillStyle = mu; ctx.font = '11px system-ui'; ctx.fillText('dev ' + (i + 1), 30, y - 7); ctx.font = '600 13px system-ui';
      }
      st.voando.forEach(v => { const x = 160 + v.x * 140; ctx.fillStyle = bl; ctx.beginPath(); ctx.arc(x, v.y + 12, 6, 0, 7); ctx.fill(); });
      const n = st.fila.length, maxv = 48;
      for (let k = 0; k < Math.min(n, maxv); k++) {
        const cx = 306 + (k % 8) * 25, cy = 196 - Math.floor(k / 8) * 25;
        ctx.fillStyle = am; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 7); ctx.fill();
      }
      if (n > maxv) { ctx.fillStyle = fg; ctx.fillText('+' + (n - maxv), 470, 40); }
      st.rev.forEach((x, k) => { const cy = 50 + k * 40; ctx.fillStyle = ac; ctx.beginPath(); ctx.arc(590, cy, 9, 0, 7); ctx.fill(); ctx.fillStyle = mu; ctx.font = '11px system-ui'; ctx.fillText('revisor ' + (k + 1), 606, cy); ctx.font = '600 13px system-ui'; });
      ctx.fillStyle = fg; ctx.font = '700 22px system-ui'; ctx.fillText(st.entregues + ' em produção', 572, 190);
    }
    function kpis() {
      const sem = st.t / 40;
      ui.querySelector('.k-sem').textContent = dec(sem, 1);
      const fq = ui.querySelector('.k-fila'); fq.textContent = st.fila.length; fq.parentNode.className = 'ias-kpi ' + (st.fila.length > 12 ? 'bad' : st.fila.length > 4 ? 'warn' : 'ok');
      const ult = st.feitos.filter(x => st.t - x.t < 80);
      ui.querySelector('.k-thr').textContent = dec(ult.length / Math.min(2, Math.max(sem, .01)), 1);
      ui.querySelector('.k-lt').textContent = ult.length ? (ult.reduce((a, x) => a + x.lt, 0) / ult.length).toFixed(0) : '–';
      const s = +inp('s').value, r = +inp('r').value, g = inp('g').checked;
      const lam = DEVS * s / TC, mu = r / (TR * (g ? 1 + 0.45 * (s - 1) : 1));
      ui.querySelector('.nt').innerHTML = 'Chegam <strong>' + dec(lam, 2) + '</strong> PRs por hora e a revisão dá conta de <strong>' + dec(mu, 2) + '</strong>. ' +
        (lam > mu ? '<strong style="color:var(--red)">A fila cresce sem parar:</strong> a IA acelerou uma etapa que não era o gargalo (Goldratt), e a espera explode (Little).' : lam > mu * 0.85 ? 'O sistema está no limite: qualquer variação forma fila.' : 'A revisão acompanha o ritmo: o ganho na codificação chega à produção.');
      ui.querySelector('.sv').textContent = dec(s, 1) + '×'; ui.querySelector('.rv').textContent = r;
    }
    function loop(ts) {
      if (!box.isConnected) return;
      const dt = Math.min(100, ts - (ultimo || ts)); ultimo = ts;
      if (rodando) {
        acc += dt;
        st.voando.forEach(v => { v.x += dt / 700; });
        while (acc > 110) { acc -= 110; passo(); }
        kpis();
      }
      desenha();
      requestAnimationFrame(loop);
    }
    ui.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'go') { rodando = !rodando; a.textContent = rodando ? '❚❚ Pausar' : '▶ Continuar'; }
      if (a.dataset.a === 'z') { zera(); kpis(); }
    });
    ui.addEventListener('input', () => kpis());
    zera(); kpis();
    if (reduz()) { rodando = false; ui.querySelector('[data-a=go]').textContent = '▶ Continuar'; }
    // só anima quando o bloco está na tela
    if ('IntersectionObserver' in window) {
      let visto = false;
      new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !visto) { visto = true; requestAnimationFrame(loop); } })).observe(box);
    } else requestAnimationFrame(loop);
  };

  /* ------------------------------------------------------------------ */
  /* hype: ciclo de expectativas com um marcador que anda por ano        */
  /* {anos:[{a, f, txt}]}  f = fração do caminho (0..1)                  */
  /* ------------------------------------------------------------------ */
  IAS.hype = function (box) {
    const anos = dados(box).anos || [];
    const ns = 'http://www.w3.org/2000/svg';
    const wrap = h('div', 'ias-curve',
      '<svg viewBox="0 0 760 270" role="img" aria-label="Ciclo de expectativas: gatilho, pico, vale da desilusão, rampa e platô">' +
      '<path class="cv" d="M20,240 C90,238 120,40 190,36 C250,32 270,214 360,214 C440,214 470,150 560,138 C640,128 690,126 740,125" fill="none" stroke-width="3"/>' +
      '<g class="lb"></g><circle class="mk" r="9"/><text class="ml" text-anchor="middle"></text></svg>' +
      '<div class="ias-row yrs"></div><div class="ias-info"></div>');
    box.appendChild(wrap);
    const svg = wrap.querySelector('svg'), path = svg.querySelector('.cv'), mk = svg.querySelector('.mk'), ml = svg.querySelector('.ml');
    path.style.stroke = css('--muted'); mk.style.fill = css('--accent'); ml.style.fill = css('--fg'); ml.style.font = '700 13px system-ui';
    const L = path.getTotalLength();
    [['Gatilho', .03, 252], ['Pico das expectativas', .25, 22], ['Vale da desilusão', .52, 238], ['Rampa', .74, 118], ['Platô de produtividade', .95, 108]].forEach(([t, f, y]) => {
      const p = path.getPointAtLength(L * f), tx = document.createElementNS(ns, 'text');
      tx.setAttribute('x', Math.min(700, Math.max(40, p.x))); tx.setAttribute('y', y); tx.setAttribute('text-anchor', 'middle');
      tx.style.fill = css('--muted'); tx.style.font = '12px system-ui'; tx.textContent = t; svg.querySelector('.lb').appendChild(tx);
    });
    let fAtual = 0, anim = null;
    function poe(f) { const p = path.getPointAtLength(L * f); mk.setAttribute('cx', p.x); mk.setAttribute('cy', p.y); ml.setAttribute('x', p.x); ml.setAttribute('y', p.y - 16); }
    function vai(j) {
      const alvo = anos[j].f, ini = fAtual, t0 = performance.now(), dur = reduz() ? 1 : 900;
      cancelAnimationFrame(anim);
      const step = now => { const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; fAtual = ini + (alvo - ini) * e; poe(fAtual); if (k < 1) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
      ml.textContent = 'IA generativa · ' + anos[j].a;
      wrap.querySelector('.ias-info').innerHTML = '<b>' + anos[j].a + '.</b> ' + anos[j].txt;
      [...wrap.querySelectorAll('.yrs button')].forEach((b, k) => b.setAttribute('aria-pressed', String(k === j)));
    }
    anos.forEach((a, j) => { const b = h('button', 'ias-btn', a.a); b.type = 'button'; b.onclick = () => vai(j); wrap.querySelector('.yrs').appendChild(b); });
    const play = h('button', 'ias-btn pri', '▶ Animar'); play.type = 'button';
    play.onclick = async () => { for (let j = 0; j < anos.length; j++) { vai(j); await espera(1700); } };
    wrap.querySelector('.yrs').appendChild(play);
    poe(0); if (anos.length) vai(0);
  };

  /* ------------------------------------------------------------------ */
  /* rogers: curva de difusão de inovações com segmentos clicáveis       */
  /* {grupos:[{nome, pct, txt}]} (5 grupos, da esquerda para a direita)  */
  /* ------------------------------------------------------------------ */
  IAS.rogers = function (box) {
    const G = dados(box).grupos || [];
    const W = 760, H = 240, x0 = 30, x1 = 730, base = 200, alt = 170;
    const X = z => x0 + (z + 3) / 6 * (x1 - x0), Y = z => base - alt * Math.exp(-z * z / 2);
    const cortes = [-3, -2, -1, 0, 1, 3];
    const cores = ['--blue', '--accent', '--accent', '--amber', '--red'];
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Curva de adoção de Rogers em cinco grupos">';
    for (let g = 0; g < 5; g++) {
      let d = 'M' + X(cortes[g]) + ',' + base;
      for (let z = cortes[g]; z <= cortes[g + 1] + 1e-9; z += 0.05) d += ' L' + X(z).toFixed(1) + ',' + Y(z).toFixed(1);
      d += ' L' + X(cortes[g + 1]) + ',' + base + 'Z';
      svg += '<path class="seg" data-g="' + g + '" d="' + d + '" style="fill:var(' + cores[g] + '-soft);stroke:var(' + cores[g] + ');stroke-width:1.5"/>';
      const zm = (cortes[g] + cortes[g + 1]) / 2;
      svg += '<text x="' + X(zm) + '" y="' + (base + 18) + '" text-anchor="middle" style="fill:var(--muted);font:11px system-ui">' + (G[g] ? G[g].pct : '') + '</text>';
    }
    svg += '</svg>';
    const wrap = h('div', 'ias-curve', svg + '<div class="ias-row gs"></div><div class="ias-info">Clique num grupo da curva para ver como ele costuma reagir à IA e como conversar com ele.</div>');
    box.appendChild(wrap);
    function sel(g) {
      wrap.querySelectorAll('.seg').forEach(s => { s.style.opacity = +s.dataset.g === g ? 1 : .35; });
      wrap.querySelector('.ias-info').innerHTML = '<b>' + G[g].nome + ' (' + G[g].pct + ').</b> ' + G[g].txt;
      [...wrap.querySelectorAll('.gs button')].forEach((b, k) => b.setAttribute('aria-pressed', String(k === g)));
    }
    G.forEach((g, k) => { const b = h('button', 'ias-btn', g.nome); b.type = 'button'; b.onclick = () => sel(k); wrap.querySelector('.gs').appendChild(b); });
    wrap.querySelectorAll('.seg').forEach(s => s.addEventListener('click', () => sel(+s.dataset.g)));
  };

  /* ------------------------------------------------------------------ */
  /* classify: classificar itens em categorias, com explicação           */
  /* {cats:[{id, nome}], itens:[{t, c, e}]}                              */
  /* ------------------------------------------------------------------ */
  IAS.classify = function (box) {
    const D = dados(box), cats = D.cats || [], itens = D.itens || [];
    const placar = h('p', 'ias-note'), lista = h('div', 'ias-cls');
    const reset = h('button', 'ias-btn', '↺ Recomeçar'); reset.type = 'button';
    box.append(lista, h('div', 'ias-row'), placar); box.lastChild.previousSibling.appendChild(reset);
    function monta() {
      lista.innerHTML = ''; let ok = 0, feitos = 0;
      const up = () => { placar.textContent = ok + ' de ' + feitos + ' certas · ' + (itens.length - feitos) + ' restantes'; };
      itens.forEach(it => {
        const d = h('div', 'ias-it', '<p class="q"></p><div class="ops"></div><p class="ex" hidden></p>');
        d.querySelector('.q').textContent = it.t;
        cats.forEach(c => {
          const b = h('button', '', c.nome); b.type = 'button';
          b.onclick = () => {
            feitos++; if (c.id === it.c) ok++;
            [...d.querySelectorAll('.ops button')].forEach((x, k) => { x.disabled = true; if (cats[k].id === it.c) x.classList.add('ok'); else if (x === b) x.classList.add('bad'); });
            const ex = d.querySelector('.ex'); ex.hidden = false; ex.innerHTML = (c.id === it.c ? '<strong>Isso.</strong> ' : '<strong>Não exatamente.</strong> ') + (it.e || ''); up();
          };
          d.querySelector('.ops').appendChild(b);
        });
        lista.appendChild(d);
      });
      up();
    }
    reset.onclick = monta; monta();
  };

  /* ------------------------------------------------------------------ */
  /* passk: várias tentativas filtradas por testes (com oráculo fraco)   */
  /* ------------------------------------------------------------------ */
  IAS.passk = function (box) {
    const ui = h('div', '',
      '<div class="grid2"><div><label class="r">Chance de uma tentativa estar certa <span class="pv"></span></label><input type="range" data-k="p" min="5" max="90" step="5" value="30"></div>' +
      '<div><label class="r">Tentativas (k) <span class="kv"></span></label><input type="range" data-k="k" min="1" max="20" step="1" value="5"></div></div>' +
      '<div class="ias-chk" style="margin-top:6px"><label><input type="checkbox" data-k="f"> Testes fracos: deixam passar 40% das soluções erradas</label></div>' +
      '<div class="ias-row"><button type="button" class="ias-btn pri" data-a="1">Gerar k soluções</button><button type="button" class="ias-btn" data-a="200">Repetir 200 vezes</button></div>' +
      '<div class="ias-tries"></div><div class="ias-legend"><span><i style="background:var(--accent-soft);border:1px solid var(--accent)"></i>certa e passou</span><span><i style="background:var(--red-soft);border:1px solid var(--red)"></i>errada, teste pegou</span><span><i style="background:var(--amber-soft);border:1px solid var(--amber)"></i>errada, mas passou (falso positivo)</span></div>' +
      '<div class="ias-kpis"><div class="ias-kpi ok"><span>pass@k teórico</span><b class="k-t"></b></div><div class="ias-kpi ok"><span>Aceitou solução certa</span><b class="k-c">–</b></div><div class="ias-kpi bad"><span>Aceitou solução errada</span><b class="k-w">–</b></div><div class="ias-kpi"><span>Rodadas</span><b class="k-n">0</b></div></div><p class="ias-note nt"></p>');
    box.appendChild(ui);
    const v = k => ui.querySelector('[data-k=' + k + ']');
    let n = 0, ac = 0, aw = 0;
    function teoria() {
      const p = v('p').value / 100, k = +v('k').value;
      ui.querySelector('.pv').textContent = pct(p); ui.querySelector('.kv').textContent = k;
      ui.querySelector('.k-t').textContent = pct(1 - Math.pow(1 - p, k), 1);
    }
    function rodada() {
      const p = v('p').value / 100, k = +v('k').value, f = v('f').checked ? 0.4 : 0;
      const t = []; let sel = -1;
      for (let i = 0; i < k; i++) {
        const certa = Math.random() < p, passa = certa || Math.random() < f;
        t.push(certa ? 'c' : passa ? 'fp' : 'w');
        if (passa && sel < 0) sel = i;
      }
      return { t, sel };
    }
    function placar() {
      ui.querySelector('.k-n').textContent = n;
      ui.querySelector('.k-c').textContent = n ? pct(ac / n) : '–';
      ui.querySelector('.k-w').textContent = n ? pct(aw / n) : '–';
      ui.querySelector('.nt').innerHTML = v('f').checked
        ? 'Com testes fracos, o "juiz" aceita a primeira solução que passa, e às vezes ela está errada. Mais tentativas não resolvem: <strong>aumentam</strong> a chance de um falso positivo ser escolhido.'
        : 'Com testes confiáveis, mais tentativas só ajudam: a primeira que passa está certa. É por isso que o laço gerador-verificador funciona.';
    }
    ui.addEventListener('input', () => { n = ac = aw = 0; teoria(); placar(); });
    ui.addEventListener('click', async e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      const reps = +a.dataset.a, box2 = ui.querySelector('.ias-tries');
      if (reps === 1) {
        const r = rodada(); box2.innerHTML = '';
        for (let i = 0; i < r.t.length; i++) {
          const c = h('i', r.t[i] + (i === r.sel ? ' sel' : ''), r.t[i] === 'c' ? '✓' : r.t[i] === 'w' ? '✗' : '!');
          c.title = i === r.sel ? 'escolhida pelos testes' : ''; box2.appendChild(c);
          if (!reduz()) await espera(110);
        }
        n++; if (r.sel >= 0) { if (r.t[r.sel] === 'c') ac++; else aw++; }
      } else {
        for (let i = 0; i < reps; i++) { const r = rodada(); n++; if (r.sel >= 0) { if (r.t[r.sel] === 'c') ac++; else aw++; } }
      }
      placar();
    });
    teoria(); placar();
  };

  /* ------------------------------------------------------------------ */
  /* mut: laboratório de teste de mutação                                */
  /* {codigo, testes:[{id, nome, on}], mutantes:[{id, desc, mata:[...], dica}]} */
  /* ------------------------------------------------------------------ */
  IAS.mut = function (box) {
    const D = dados(box);
    const ui = h('div', 'grid2',
      '<div><pre><code></code></pre></div><div><b style="font-size:.9rem">Testes que a suíte tem</b><div class="ias-chk tst" style="margin-top:6px"></div>' +
      '<div class="ias-row"><button type="button" class="ias-btn pri" data-a="go">Rodar mutação</button></div></div>');
    const res = h('div', '', '<div class="ias-scroll"><table class="ias-mx"><thead><tr><th>Mutante (defeito inserido)</th><th>Resultado</th></tr></thead><tbody></tbody></table></div><div class="ias-kpis"><div class="ias-kpi"><span>Escore de mutação</span><b class="k-s">–</b></div><div class="ias-kpi"><span>Mutantes sobreviventes</span><b class="k-v">–</b></div></div><p class="ias-note nt"></p>');
    box.append(ui, res);
    ui.querySelector('code').textContent = D.codigo || '';
    (D.testes || []).forEach(t => {
      const l = h('label', '', '<input type="checkbox"> <span></span>');
      l.querySelector('input').checked = !!t.on; l.querySelector('input').dataset.id = t.id; l.querySelector('span').textContent = t.nome;
      ui.querySelector('.tst').appendChild(l);
    });
    const tb = res.querySelector('tbody');
    (D.mutantes || []).forEach(m => { const tr = h('tr', '', '<td></td><td class="st">aguardando</td>'); tr.firstChild.textContent = m.desc; tb.appendChild(tr); });
    ui.querySelector('[data-a=go]').onclick = async () => {
      const on = new Set([...ui.querySelectorAll('.tst input:checked')].map(i => i.dataset.id));
      let mortos = 0; const vivos = [];
      const linhas = [...tb.children];
      linhas.forEach(tr => { tr.className = ''; tr.lastChild.textContent = '…'; });
      for (let i = 0; i < D.mutantes.length; i++) {
        const m = D.mutantes[i], tr = linhas[i];
        tr.classList.add('run'); if (!reduz()) await espera(380);
        const quem = m.mata.filter(t => on.has(t));
        tr.classList.remove('run');
        if (quem.length) { mortos++; tr.className = 'ok'; tr.lastChild.textContent = 'morto ✓'; }
        else { vivos.push(m); tr.className = 'bad'; tr.lastChild.textContent = 'sobreviveu ✗'; }
      }
      res.querySelector('.k-s').textContent = pct(mortos / D.mutantes.length);
      res.querySelector('.k-v').textContent = vivos.length;
      res.querySelector('.nt').innerHTML = vivos.length
        ? 'Os testes passaram mesmo com estes defeitos no código. Ou seja, eles <strong>não protegem</strong> estas regras: ' + vivos.map(m => m.dica).join(' ')
        : 'Todos os defeitos inseridos foram detectados: a suíte realmente protege as regras testadas.';
    };
  };

  /* ------------------------------------------------------------------ */
  /* diff: simulador de plano de mudança de infraestrutura               */
  /* {mudancas:[{id, nome, linha, efeito: add|mod|int|rep|del, dados}]}  */
  /* ------------------------------------------------------------------ */
  IAS.diff = function (box) {
    const M = dados(box).mudancas || [];
    const ui = h('div', 'grid2', '<div><b style="font-size:.9rem">Mudanças que a IA fez no código</b><div class="ias-chk ms" style="margin-top:6px"></div></div><div><b style="font-size:.9rem">cdk diff</b><div class="ias-out"></div><div class="ias-verdict"></div></div>');
    box.appendChild(ui);
    M.forEach(m => { const l = h('label', '', '<input type="checkbox"> <span></span>'); l.querySelector('input').dataset.id = m.id; l.querySelector('span').textContent = m.nome; ui.querySelector('.ms').appendChild(l); });
    const rot = { add: '[+]', mod: '[~]', int: '[~]', rep: '[~]', del: '[-]' }, cl = { add: 'add', mod: 'mod', int: 'mod', rep: 'rep', del: 'del' };
    function atualiza() {
      const sel = M.filter(m => ui.querySelector('[data-id="' + m.id + '"]').checked);
      const out = ui.querySelector('.ias-out'), ver = ui.querySelector('.ias-verdict');
      out.innerHTML = sel.length ? 'Stack CondominioStack\nResources\n' : '<span style="color:var(--muted)">Marque uma ou mais mudanças para ver o plano.</span>';
      sel.forEach(m => { const s = h('span', cl[m.efeito]); s.textContent = rot[m.efeito] + ' ' + m.linha + '\n'; out.appendChild(s); });
      const perigo = sel.filter(m => (m.efeito === 'rep' || m.efeito === 'del') && m.dados);
      const atencao = sel.filter(m => m.efeito === 'int' || ((m.efeito === 'rep' || m.efeito === 'del') && !m.dados));
      ver.className = 'ias-verdict' + (perigo.length ? ' stop' : atencao.length ? ' warn' : '');
      ver.innerHTML = !sel.length ? 'Nenhuma mudança selecionada.'
        : perigo.length ? '<strong>Pare.</strong> ' + perigo.map(m => m.nota).join(' ') + ' Este plano apagaria dados. Não aplique sem migração e backup.'
        : atencao.length ? '<strong>Atenção.</strong> ' + atencao.map(m => m.nota).join(' ')
        : '<strong>Seguro.</strong> Só criações e alterações sem interrupção. Pode seguir pela esteira.';
    }
    ui.addEventListener('change', atualiza); atualiza();
  };

  /* ------------------------------------------------------------------ */
  /* iam: o "crachá" do agente — avaliação de permissões                 */
  /* {politicas:[{id, nome, allow:[], deny:[]}], scp:[...], acoes:[{a, desc}]} */
  /* ------------------------------------------------------------------ */
  IAS.iam = function (box) {
    const D = dados(box);
    const re = p => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    const casa = (lista, a) => (lista || []).some(p => re(p).test(a));
    const ui = h('div', '',
      '<div class="ias-row pol"></div><div class="ias-chk"><label><input type="checkbox" class="scp"> Ativar SCP da organização: <span class="scpd"></span></label></div>' +
      '<div class="ias-row"><button type="button" class="ias-btn pri" data-a="go">▶ O agente tenta executar</button></div>' +
      '<div class="ias-scroll"><table class="ias-mx"><thead><tr><th>Ação que o agente tenta</th><th>O que é</th><th>Resultado</th></tr></thead><tbody></tbody></table></div><p class="ias-note nt"></p>');
    box.appendChild(ui);
    ui.querySelector('.scpd').textContent = 'negar ' + (D.scp || []).join(', ');
    let pol = (D.politicas || [])[0];
    (D.politicas || []).forEach((p, k) => {
      const b = h('button', 'ias-btn', p.nome); b.type = 'button'; b.setAttribute('aria-pressed', String(k === 0));
      b.onclick = () => { pol = p; [...ui.querySelectorAll('.pol button')].forEach(x => x.setAttribute('aria-pressed', String(x === b))); limpa(); };
      ui.querySelector('.pol').appendChild(b);
    });
    const tb = ui.querySelector('tbody');
    (D.acoes || []).forEach(x => { const tr = h('tr', '', '<td class="st"></td><td></td><td class="st">–</td>'); tr.children[0].textContent = x.a; tr.children[1].textContent = x.desc; tb.appendChild(tr); });
    function limpa() { [...tb.children].forEach(tr => { tr.className = ''; tr.children[2].textContent = '–'; }); ui.querySelector('.nt').textContent = ''; }
    ui.querySelector('.scp').onchange = limpa;
    ui.querySelector('[data-a=go]').onclick = async () => {
      limpa(); const scp = ui.querySelector('.scp').checked; let perm = 0, perig = 0;
      for (let i = 0; i < D.acoes.length; i++) {
        const x = D.acoes[i], tr = tb.children[i];
        tr.classList.add('run'); if (!reduz()) await espera(320); tr.classList.remove('run');
        let r, c;
        if (scp && casa(D.scp, x.a)) { r = 'negado (SCP)'; c = 'warn'; }
        else if (casa(pol.deny, x.a)) { r = 'negado (explícito)'; c = 'warn'; }
        else if (casa(pol.allow, x.a)) { r = 'permitido'; c = x.perigo ? 'bad' : 'ok'; perm++; if (x.perigo) perig++; }
        else { r = 'negado (implícito)'; c = 'ok'; }
        tr.className = c; tr.children[2].textContent = r;
      }
      ui.querySelector('.nt').innerHTML = perig
        ? '<strong style="color:var(--red)">' + perig + ' ação(ões) perigosa(s) foram permitidas.</strong> Com este crachá, um erro do agente, ou um pacote malicioso no terminal, causaria dano real ou exporia dados pessoais.'
        : 'Nenhuma ação perigosa passou. O agente conseguiu ' + perm + ' de ' + D.acoes.length + ' ações, as necessárias para o trabalho. Repare na ordem de avaliação: negação explícita vence permissão, e o que não foi permitido é negado.';
    };
  };

  /* ------------------------------------------------------------------ */
  /* canary: publicação gradual com alarme e reversão automática         */
  /* ------------------------------------------------------------------ */
  IAS.canary = function (box) {
    const etapas = [0, 10, 25, 50, 100];
    const ui = h('div', '',
      '<div class="ias-traffic"><div class="v1">v1 100%</div><div class="v2" style="width:0">v2</div></div>' +
      '<div class="ias-stages">' + etapas.slice(1).map(e => '<span>' + e + '%</span>').join('') + '</div>' +
      '<div class="ias-kpis"><div class="ias-kpi ok"><span>Erros na v2</span><b class="k-e">0,0%</b></div><div class="ias-kpi"><span>Alarme (limite 2%)</span><b class="k-a">ok</b></div><div class="ias-kpi"><span>Usuários afetados</span><b class="k-u">0</b></div></div>' +
      '<div class="ias-row"><button type="button" class="ias-btn pri" data-a="go">▶ Iniciar deploy da v2</button><button type="button" class="ias-btn" data-a="bug">Injetar defeito na v2</button><button type="button" class="ias-btn" data-a="z">↺</button></div>' +
      '<div class="ias-log"></div>');
    box.appendChild(ui);
    let etapa = 0, erro = 0, bug = false, timer = null, afet = 0, fim = false;
    const log = t => { const d = h('div'); d.textContent = t; ui.querySelector('.ias-log').prepend(d); };
    function pinta() {
      const p = etapas[etapa], v1 = ui.querySelector('.v1'), v2 = ui.querySelector('.v2');
      v1.style.width = (100 - p) + '%'; v1.textContent = 100 - p ? 'v1 ' + (100 - p) + '%' : '';
      v2.style.width = p + '%'; v2.textContent = p ? 'v2 ' + p + '%' : ''; v2.classList.toggle('sick', erro > 2);
      [...ui.querySelectorAll('.ias-stages span')].forEach((s, k) => { s.className = k < etapa ? (erro > 2 && k === etapa - 1 ? 'bad' : 'on') : ''; });
      ui.querySelector('.k-e').textContent = erro.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + '%';
      ui.querySelector('.k-e').parentNode.className = 'ias-kpi ' + (erro > 2 ? 'bad' : 'ok');
      ui.querySelector('.k-a').textContent = erro > 2 ? 'DISPAROU' : 'ok';
      ui.querySelector('.k-a').parentNode.className = 'ias-kpi ' + (erro > 2 ? 'bad' : '');
      ui.querySelector('.k-u').textContent = Math.round(afet).toLocaleString('pt-BR');
    }
    function tick() {
      if (fim) return;
      erro = bug ? Math.min(9, erro + 2.2) : Math.max(0.2, erro * 0.5);
      afet += etapas[etapa] / 100 * (erro / 100) * 4000;
      if (erro > 2) {
        log('Alarme: taxa de erro da v2 em ' + dec(erro, 1) + '%. Reversão automática iniciada.');
        clearInterval(timer); timer = null; fim = true;
        const volta = setInterval(() => { if (etapa > 0) { etapa--; pinta(); } else { clearInterval(volta); log('Reversão concluída: 100% do tráfego na v1. Só ' + Math.round(afet) + ' usuários viram o erro.'); pinta(); } }, 500);
        pinta(); return;
      }
      if (etapa < etapas.length - 1) { etapa++; log('Tráfego da v2 em ' + etapas[etapa] + '%. Observando alarmes…'); }
      else { clearInterval(timer); timer = null; fim = true; log('Deploy concluído: v2 com 100% do tráfego, sem alarmes.'); }
      pinta();
    }
    ui.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'go' && !timer && !fim) { log('Deploy da v2 iniciado no modo canário.'); timer = setInterval(tick, 1600); tick(); }
      if (a.dataset.a === 'bug') { bug = true; log('Defeito injetado na v2 (ex.: consulta lenta que estoura o timeout).'); }
      if (a.dataset.a === 'z') { clearInterval(timer); timer = null; etapa = 0; erro = 0; bug = false; afet = 0; fim = false; ui.querySelector('.ias-log').innerHTML = ''; pinta(); }
    });
    pinta();
  };

  /* ------------------------------------------------------------------ */
  /* rag: busca com e sem filtro por cliente                             */
  /* {pergunta, condo, chunks:[{condo, txt, sc}], resposta}              */
  /* ------------------------------------------------------------------ */
  IAS.rag = function (box) {
    const D = dados(box);
    const ui = h('div', '',
      '<div class="ias-prompt"></div>' +
      '<div class="ias-chk" style="margin-top:8px"><label><input type="checkbox" class="flt" checked> Aplicar filtro <code>condominioId = ' + D.condo + '</code> na busca (feito pela API)</label></div>' +
      '<div class="ias-row"><button type="button" class="ias-btn pri" data-a="go">▶ Executar a busca e responder</button></div>' +
      '<div class="ias-chunks"></div><div class="ias-answer">A resposta aparece aqui.</div>');
    box.appendChild(ui);
    ui.querySelector('.ias-prompt').textContent = 'Morador do ' + D.condo + ' pergunta: “' + D.pergunta + '”';
    const cx = ui.querySelector('.ias-chunks');
    D.chunks.forEach(c => { const d = h('div', 'ias-chunk', '<span class="cd"></span><span class="tx"></span><span class="sc"></span>'); d.querySelector('.cd').textContent = c.condo; d.querySelector('.tx').textContent = c.txt; d.querySelector('.sc').textContent = dec(c.sc, 2); cx.appendChild(d); });
    ui.querySelector('[data-a=go]').onclick = async () => {
      const f = ui.querySelector('.flt').checked, els = [...cx.children], ans = ui.querySelector('.ias-answer');
      els.forEach(e => (e.className = 'ias-chunk')); ans.className = 'ias-answer'; ans.textContent = 'Buscando trechos parecidos com a pergunta…';
      if (!reduz()) await espera(600);
      D.chunks.forEach((c, i) => { if (f && c.condo !== D.condo) els[i].classList.add('out'); });
      if (!reduz()) await espera(600);
      const cand = D.chunks.map((c, i) => ({ c, i })).filter(x => !f || x.c.condo === D.condo).sort((a, b) => b.c.sc - a.c.sc).slice(0, 2);
      for (const x of cand) { els[x.i].classList.add(x.c.condo === D.condo ? 'pick' : 'leak'); if (!reduz()) await espera(450); }
      const vaz = cand.find(x => x.c.condo !== D.condo);
      if (vaz) { ans.className = 'ias-answer leak'; ans.innerHTML = '<strong>Vazamento entre clientes.</strong> O trecho mais parecido era do ' + vaz.c.condo + ', e o modelo respondeu com a regra de outro prédio: “' + vaz.c.txt + '” Nenhuma instrução no prompt teria impedido isso com segurança.'; }
      else { ans.innerHTML = '<strong>Resposta:</strong> ' + D.resposta; }
    };
  };

  /* ==================================================================== */
  /* Componentes acrescentados na segunda rodada de animações             */
  /* ==================================================================== */

  /* controles comuns de passo a passo: legenda + anterior/próximo/apresentar */
  function passoAPasso(box, total, mostra, intervalo) {
    const cap = h('div', 'ias-cap', '<div class="t"><span></span><small></small></div><p></p>');
    const ctl = h('div', 'ias-row',
      '<button type="button" class="ias-btn" data-a="ant">← Anterior</button>' +
      '<button type="button" class="ias-btn pri" data-a="prox">Próximo →</button>' +
      '<button type="button" class="ias-btn" data-a="play">▶ Apresentar</button>' +
      '<button type="button" class="ias-btn" data-a="zero">↺ Recomeçar</button>');
    box.append(cap, ctl);
    let i = -1, timer = null;
    const pare = () => { clearInterval(timer); timer = null; ctl.querySelector('[data-a=play]').textContent = '▶ Apresentar'; };
    function ir(n) {
      i = Math.max(0, Math.min(total - 1, n));
      const r = mostra(i) || {};
      cap.querySelector('.t span').innerHTML = r.t || '';
      cap.querySelector('.t small').textContent = 'passo ' + (i + 1) + ' de ' + total;
      cap.querySelector('p').innerHTML = r.d || '';
      ctl.querySelector('[data-a=ant]').disabled = i <= 0;
      ctl.querySelector('[data-a=prox]').disabled = i >= total - 1;
    }
    ctl.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'play') {
        if (timer) { pare(); return; }
        ir(i >= total - 1 ? 0 : i + 1); a.textContent = '❚❚ Pausar';
        timer = setInterval(() => { if (i >= total - 1) pare(); else ir(i + 1); }, intervalo || 3200);
        return;
      }
      pare();
      if (a.dataset.a === 'ant') ir(i - 1);
      if (a.dataset.a === 'prox') ir(i + 1);
      if (a.dataset.a === 'zero') ir(0);
    });
    cap.querySelector('.t span').textContent = 'Clique em "Próximo" ou "Apresentar" para começar';
    cap.querySelector('.t small').textContent = total + ' passos';
    ctl.querySelector('[data-a=ant]').disabled = true;
    return { ir };
  }
  const COR = { accent: '--accent', blue: '--blue', amber: '--amber', red: '--red', muted: '--muted' };
  // anima um número de a até b chamando f(valor) a cada quadro
  function tween(a, b, dur, f) {
    if (reduz() || document.hidden) { f(b); return; }
    const t0 = performance.now();
    let fim = false;
    const step = now => { if (fim) return; const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); f(a + (b - a) * e); if (k < 1) requestAnimationFrame(step); else fim = true; };
    requestAnimationFrame(step);
    setTimeout(() => { if (!fim) { fim = true; f(b); } }, dur + 80);   // garantia se o navegador pausar os quadros
  }
  // só começa a animar quando o bloco aparece na tela
  function quandoVisivel(el, f) {
    if (!('IntersectionObserver' in window)) { f(); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); f(); } }));
    io.observe(el);
  }

  /* ------------------------------------------------------------------ */
  /* bars: barras comparativas que mudam a cada passo (aceita negativos) */
  /* {unidade, min, max, quadros:[{t, d, itens:[{l, v, cor}]}]}          */
  /* ------------------------------------------------------------------ */
  IAS.bars = function (box) {
    const D = dados(box), Q = D.quadros || [];
    const todos = Q.flatMap(q => q.itens.map(x => x.v));
    const mn = D.min !== undefined ? D.min : Math.min(0, ...todos), mx = D.max !== undefined ? D.max : Math.max(0, ...todos);
    const zero = (0 - mn) / (mx - mn) * 100;
    const area = h('div', 'ias-hbars');
    box.appendChild(area);
    const linhas = {};
    const fmt = v => (D.sinal && v > 0 ? '+' : '') + dec(v, D.dec || 0) + (D.unidade || '');
    passoAPasso(box, Q.length, i => {
      Q[i].itens.forEach(x => {
        let ln = linhas[x.l];
        if (!ln) {
          ln = linhas[x.l] = h('div', 'ias-hbar', '<span class="lb"></span><span class="tr"><span class="z"></span><i></i></span><span class="vl"></span>');
          ln.querySelector('.lb').textContent = x.l; ln.querySelector('.z').style.left = zero + '%';
          ln.dataset.v = 0; area.appendChild(ln);
        }
        const bar = ln.querySelector('i'), de = +ln.dataset.v;
        bar.style.background = 'var(' + (COR[x.cor] || '--accent') + ')';
        ln.dataset.v = x.v; ln.classList.add('vis');
        tween(de, x.v, 800, v => {
          const p = (v - mn) / (mx - mn) * 100;
          bar.style.left = Math.min(p, zero) + '%'; bar.style.width = Math.abs(p - zero) + '%';
          ln.querySelector('.vl').textContent = fmt(v);
        });
      });
      const nomes = Q[i].itens.map(x => x.l);
      Object.keys(linhas).forEach(k => linhas[k].classList.toggle('vis', nomes.includes(k)));
      return Q[i];
    }, 3600);
  };

  /* ------------------------------------------------------------------ */
  /* seq: diagrama de sequência animado                                  */
  /* {atores:[nome], msgs:[{de, para, txt, d, volta}]}                   */
  /* ------------------------------------------------------------------ */
  IAS.seq = function (box) {
    const D = dados(box), A = D.atores || [], M = D.msgs || [];
    const W = 760, top = 46, dy = 40, H = top + M.length * dy + 24, col = W / A.length;
    const X = i => col * i + col / 2;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Diagrama de sequência"><defs><marker id="sq' + (box.dataset.n = Math.random().toString(36).slice(2, 7)) + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:var(--accent)"/></marker></defs>';
    A.forEach((a, i) => {
      s += '<rect x="' + (X(i) - col / 2 + 8) + '" y="4" width="' + (col - 16) + '" height="30" rx="8" style="fill:var(--sunk);stroke:var(--line)"/>' +
        '<text x="' + X(i) + '" y="24" text-anchor="middle" style="fill:var(--fg);font:700 12.5px var(--display)">' + a + '</text>' +
        '<line x1="' + X(i) + '" y1="34" x2="' + X(i) + '" y2="' + (H - 6) + '" style="stroke:var(--line);stroke-dasharray:4 4"/>';
    });
    M.forEach((m, k) => {
      const y = top + k * dy + 16, x1 = X(m.de), x2 = X(m.para), self = m.de === m.para;
      const d = self ? 'M' + x1 + ',' + (y - 6) + ' h40 v12 h-36' : 'M' + (x1 + (x2 > x1 ? 6 : -6)) + ',' + y + ' L' + (x2 + (x2 > x1 ? -8 : 8)) + ',' + y;
      s += '<g class="msg" data-m="' + k + '" style="opacity:0"><path d="' + d + '" style="fill:none;stroke:var(--accent);stroke-width:2' + (m.volta ? ';stroke-dasharray:6 4' : '') + '" marker-end="url(#sq' + box.dataset.n + ')"/>' +
        '<text x="' + (self ? x1 + 48 : (x1 + x2) / 2) + '" y="' + (y - 7) + '" text-anchor="' + (self ? 'start' : 'middle') + '" style="fill:var(--fg);font:12px var(--body)">' + (k + 1) + '. ' + m.txt + '</text></g>';
    });
    s += '</svg>';
    const st = h('div', 'ias-stage', s); box.appendChild(st);
    const gs = [...st.querySelectorAll('.msg')];
    passoAPasso(box, M.length, i => {
      gs.forEach((g, k) => {
        g.style.transition = 'opacity .4s'; g.style.opacity = k < i ? .45 : k === i ? 1 : 0;
        const p = g.querySelector('path');
        if (k === i && !reduz()) { const L = p.getTotalLength(); p.style.transition = 'none'; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.getBoundingClientRect(); p.style.transition = 'stroke-dashoffset .7s ease'; p.style.strokeDashoffset = 0; setTimeout(() => { p.style.strokeDasharray = M[k].volta ? '6 4' : ''; }, 750); }
      });
      return { t: (i + 1) + '. ' + M[i].txt, d: M[i].d };
    }, 3400);
  };

  /* ------------------------------------------------------------------ */
  /* swiss: modelo do queijo suíço de Reason aplicado aos oráculos       */
  /* {camadas:[{nome, pega}]}  pega = probabilidade de deter um defeito  */
  /* ------------------------------------------------------------------ */
  IAS.swiss = function (box) {
    const C = dados(box).camadas || [];
    const ui = h('div', '',
      '<div class="ias-chk cam" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))"></div>' +
      '<canvas width="760" height="300" role="img" aria-label="Defeitos caindo através de camadas de verificação; alguns passam pelos furos"></canvas>' +
      '<div class="ias-kpis"><div class="ias-kpi"><span>Defeitos soltos</span><b class="k-n">0</b></div><div class="ias-kpi bad"><span>Chegaram à produção</span><b class="k-p">0</b></div><div class="ias-kpi"><span>Esperado (teoria)</span><b class="k-t"></b></div></div>' +
      '<div class="ias-row"><button type="button" class="ias-btn pri" data-a="go">Soltar 40 defeitos</button><button type="button" class="ias-btn" data-a="z">↺ Zerar</button></div><p class="ias-note nt"></p>');
    box.appendChild(ui);
    C.forEach((c, k) => { const l = h('label', '', '<input type="checkbox" checked> <span></span>'); l.querySelector('input').dataset.k = k; l.querySelector('span').textContent = c.nome + ' (pega ' + pct(c.pega) + ')'; ui.querySelector('.cam').appendChild(l); });
    const cv = ui.querySelector('canvas'), ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height, y0 = 30, yF = H - 30, gap = (yF - y0) / (C.length + 1);
    const furos = C.map(() => Array.from({ length: 4 }, () => 60 + Math.random() * (W - 220)));
    let gotas = [], soltos = 0, prod = 0, anim = false;
    const ativa = k => ui.querySelector('[data-k="' + k + '"]').checked;
    function teoria() {
      let p = 1; C.forEach((c, k) => { if (ativa(k)) p *= 1 - c.pega; });
      ui.querySelector('.k-t').textContent = pct(p, 1);
      ui.querySelector('.nt').innerHTML = 'Cada camada tem furos: nenhuma pega tudo. A chance de um defeito atravessar todas é o produto das chances de passar por cada uma: <strong>' + pct(p, 1) + '</strong>. Desligue uma camada e veja quanto isso muda.';
    }
    function desenha() {
      const fg = css('--fg'), mu = css('--muted'), ac = css('--accent'), rd = css('--red'), ln = css('--line'), am = css('--amber');
      ctx.clearRect(0, 0, W, H); ctx.textBaseline = 'middle';
      C.forEach((c, k) => {
        const y = y0 + gap * (k + 1);
        ctx.globalAlpha = ativa(k) ? 1 : .25;
        ctx.fillStyle = am; ctx.fillRect(40, y - 7, W - 200, 14);
        ctx.fillStyle = css('--sunk'); furos[k].forEach(x => { ctx.beginPath(); ctx.ellipse(x, y, 16, 6, 0, 0, 7); ctx.fill(); });
        ctx.fillStyle = fg; ctx.font = '600 12px system-ui'; ctx.fillText(c.nome, W - 150, y);
        ctx.globalAlpha = 1;
      });
      ctx.fillStyle = mu; ctx.font = '12px system-ui'; ctx.fillText('código com defeitos', 40, 12); ctx.fillText('produção', 40, H - 10);
      ctx.strokeStyle = ln; ctx.beginPath(); ctx.moveTo(40, yF + 6); ctx.lineTo(W - 160, yF + 6); ctx.stroke();
      gotas.forEach(g => { ctx.fillStyle = g.parou >= 0 ? ac : g.y >= yF ? rd : fg; ctx.globalAlpha = g.parou >= 0 ? Math.max(.25, g.vida) : 1; ctx.beginPath(); ctx.arc(g.x, g.y, 5, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
    }
    function quadro() {
      let viva = false;
      gotas.forEach(g => {
        if (g.parou >= 0) { g.vida -= .01; return; }
        if (g.y >= yF) return;
        viva = true; g.y += 2.6;
        C.forEach((c, k) => {                     // decide uma única vez por camada, de cima para baixo
          const y = y0 + gap * (k + 1);
          if (g.parou >= 0 || g['c' + k] || g.y < y - 8) return;
          g['c' + k] = 1;
          if (ativa(k) && Math.random() < c.pega) { g.parou = k; g.y = y - 10; }
          else g.alvo = furos[k][Math.floor(Math.random() * 4)];
        });
        if (g.alvo !== undefined) g.x += (g.alvo - g.x) * .08;
        if (g.y >= yF && g.parou < 0) { prod++; ui.querySelector('.k-p').textContent = prod; }
      });
      desenha();
      if (viva || gotas.some(g => g.parou >= 0 && g.vida > .25)) requestAnimationFrame(quadro); else anim = false;
    }
    ui.addEventListener('change', () => { teoria(); desenha(); });
    ui.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'z') { gotas = []; soltos = prod = 0; ui.querySelector('.k-n').textContent = 0; ui.querySelector('.k-p').textContent = 0; desenha(); return; }
      for (let i = 0; i < 40; i++) gotas.push({ x: 60 + Math.random() * (W - 240), y: 20 - i * 9, parou: -1, passou: 0, vida: 1 });
      soltos += 40; ui.querySelector('.k-n').textContent = soltos;
      if (!anim) { anim = true; requestAnimationFrame(quadro); }
    });
    teoria(); desenha();
  };

  /* ------------------------------------------------------------------ */
  /* attention: para onde cada palavra "olha" (pesos ilustrativos)       */
  /* {tokens:[...], pesos:{"i":[...]}, notas:{"i":"..."}, inicial}       */
  /* ------------------------------------------------------------------ */
  IAS.attention = function (box) {
    const D = dados(box), T = D.tokens || [];
    const ui = h('div', '', '<div class="ias-att"></div><div class="ias-info"></div>');
    box.appendChild(ui);
    const fila = ui.querySelector('.ias-att');
    T.forEach((t, i) => {
      const b = h('button', 'tok' + (D.pesos[i] ? ' clk' : ''), '<span class="w"></span><span class="tx"></span><span class="pc"></span>');
      b.type = 'button'; b.querySelector('.tx').textContent = t; b.disabled = !D.pesos[i];
      b.onclick = () => sel(i); fila.appendChild(b);
    });
    function sel(i) {
      const p = D.pesos[i];
      [...fila.children].forEach((b, j) => {
        b.classList.toggle('src', j === i);
        b.querySelector('.w').style.height = (j === i ? 0 : p[j] * 100) + '%';
        b.querySelector('.pc').textContent = j === i ? 'foco' : pct(p[j]);
      });
      ui.querySelector('.ias-info').innerHTML = '<b>“' + T[i] + '”</b> ' + (D.notas[i] || '');
    }
    sel(D.inicial || +Object.keys(D.pesos)[0]);
  };

  /* ------------------------------------------------------------------ */
  /* radar: os seis pilares do Well-Architected para cada opção          */
  /* {eixos:[...], opcoes:[{nome, v:[0..5], txt}]}                       */
  /* ------------------------------------------------------------------ */
  IAS.radar = function (box) {
    const D = dados(box), E = D.eixos, O = D.opcoes;
    const cx = 380, cy = 170, R = 125, n = E.length;
    const pt = (k, r) => [cx + r * Math.sin(2 * Math.PI * k / n), cy - r * Math.cos(2 * Math.PI * k / n)];
    let s = '<svg viewBox="0 0 760 340" role="img" aria-label="Gráfico de radar com os seis pilares">';
    for (let lv = 1; lv <= 5; lv++) s += '<polygon points="' + E.map((_, k) => pt(k, R * lv / 5).join(',')).join(' ') + '" style="fill:none;stroke:var(--line)"/>';
    E.forEach((e, k) => { const [x, y] = pt(k, R), [lx, ly] = pt(k, R + 26); s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '" style="stroke:var(--line)"/><text x="' + lx + '" y="' + ly + '" text-anchor="middle" dominant-baseline="middle" style="fill:var(--fg);font:600 12px var(--body)">' + e + '</text>'; });
    s += '<polygon class="pol" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:2.5;fill-opacity:.75"/></svg>';
    const ui = h('div', 'ias-curve', s + '<div class="ias-row ops"></div><div class="ias-info"></div>');
    box.appendChild(ui);
    const pol = ui.querySelector('.pol');
    let atual = O[0].v.slice();
    const pinta = v => pol.setAttribute('points', v.map((x, k) => pt(k, R * x / 5).join(',')).join(' '));
    function vai(j) {
      const de = atual.slice(), para = O[j].v;
      tween(0, 1, 700, t => { atual = de.map((x, k) => x + (para[k] - x) * t); pinta(atual); });
      ui.querySelector('.ias-info').innerHTML = '<b>' + O[j].nome + '.</b> ' + O[j].txt;
      [...ui.querySelectorAll('.ops button')].forEach((b, k) => b.setAttribute('aria-pressed', String(k === j)));
    }
    O.forEach((o, j) => { const b = h('button', 'ias-btn', o.nome); b.type = 'button'; b.onclick = () => vai(j); ui.querySelector('.ops').appendChild(b); });
    pinta(atual); vai(0);
  };

  /* ------------------------------------------------------------------ */
  /* queue: fila SQS com novas tentativas e dead-letter queue            */
  /* ------------------------------------------------------------------ */
  IAS.queue = function (box) {
    const ui = h('div', '',
      '<div class="ias-lanes"><div><span class="ln-t">Fila SQS</span><div class="ln q"></div></div><div><span class="ln-t">Lambda</span><div class="ln f"></div></div><div><span class="ln-t">Processadas</span><div class="ln ok"></div></div><div><span class="ln-t">Fila de erro (DLQ)</span><div class="ln dlq"></div></div></div>' +
      '<div class="ias-chk" style="margin-top:8px"><label><input type="checkbox" class="sem"> Sem fila de erro (como na versão gerada pela IA)</label></div>' +
      '<div class="ias-row"><button type="button" class="ias-btn pri" data-a="ok">Chegam 4 fotos</button><button type="button" class="ias-btn" data-a="bad">Chega uma foto ilegível</button><button type="button" class="ias-btn" data-a="z">↺</button></div>' +
      '<div class="ias-kpis"><div class="ias-kpi ok"><span>Avisos enviados</span><b class="k-ok">0</b></div><div class="ias-kpi warn"><span>Tentativas que falharam</span><b class="k-f">0</b></div><div class="ias-kpi"><span>Alarme da DLQ</span><b class="k-a">ok</b></div></div><p class="ias-note nt"></p>');
    box.appendChild(ui);
    let fila = [], fn = null, n = 1, ok = 0, falhas = 0, timer = null;
    const L = s => ui.querySelector('.ln.' + s);
    const chip = m => { const c = h('span', 'msg' + (m.bad ? ' bad' : ''), '#' + m.id + (m.rc ? ' <small>' + m.rc + '×</small>' : '')); return c; };
    function pinta() {
      L('q').innerHTML = ''; fila.forEach(m => L('q').appendChild(chip(m)));
      L('f').innerHTML = ''; if (fn) L('f').appendChild(chip(fn));
      ui.querySelector('.k-ok').textContent = ok; ui.querySelector('.k-f').textContent = falhas;
    }
    function tick() {
      if (fn) {
        const m = fn; fn = null;
        if (!m.bad) { ok++; const c = chip(m); c.classList.add('done'); L('ok').appendChild(c); }
        else {
          m.rc = (m.rc || 0) + 1; falhas++;
          const sem = ui.querySelector('.sem').checked;
          if (!sem && m.rc >= 3) {
            const c = chip(m); L('dlq').appendChild(c);
            const a = ui.querySelector('.k-a'); a.textContent = 'DISPAROU'; a.parentNode.className = 'ias-kpi bad';
            ui.querySelector('.nt').innerHTML = 'Depois de 3 tentativas, a mensagem #' + m.id + ' foi para a fila de erro e o alarme avisou a equipe. As outras fotos seguiram normalmente.';
          } else if (sem && m.rc >= 8) {
            clearInterval(timer); timer = null; fila.push(m);
            ui.querySelector('.nt').innerHTML = '<strong style="color:var(--red)">Parei a simulação depois de 8 tentativas.</strong> Na AWS, sem fila de erro, a mensagem #' + m.id + ' continuaria voltando até o fim do período de retenção da fila (4 dias, por padrão), gastando uma execução e uma chamada ao Textract a cada volta, sem ninguém saber.';
            pinta(); return;
          } else {
            fila.push(m);
            ui.querySelector('.nt').innerHTML = sem && m.rc >= 3 ? '<strong style="color:var(--red)">Sem fila de erro, a mensagem #' + m.id + ' volta para a fila para sempre:</strong> cada tentativa gasta uma execução da Lambda e uma chamada ao Textract, e ninguém fica sabendo.' : 'A mensagem #' + m.id + ' falhou e voltou para a fila depois do tempo de visibilidade (tentativa ' + m.rc + ').';
          }
        }
      } else if (fila.length) fn = fila.shift();
      pinta();
      if (!fn && !fila.length) { clearInterval(timer); timer = null; }
    }
    const roda = () => { if (!timer) timer = setInterval(tick, reduz() ? 200 : 700); };
    ui.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'ok') { for (let i = 0; i < 4; i++) fila.push({ id: n++ }); roda(); }
      if (a.dataset.a === 'bad') { fila.push({ id: n++, bad: true }); roda(); }
      if (a.dataset.a === 'z') { clearInterval(timer); timer = null; fila = []; fn = null; n = 1; ok = falhas = 0; ['ok', 'dlq'].forEach(s => (L(s).innerHTML = '')); const k = ui.querySelector('.k-a'); k.textContent = 'ok'; k.parentNode.className = 'ias-kpi'; ui.querySelector('.nt').textContent = ''; }
      pinta();
    });
    pinta();
  };

  /* ------------------------------------------------------------------ */
  /* scale: EC2 com Auto Scaling × Lambda diante de um pico de acessos   */
  /* ------------------------------------------------------------------ */
  IAS.scale = function (box) {
    const ui = h('div', '',
      '<div class="ias-row modos"><button type="button" class="ias-btn" data-m="ec2" aria-pressed="true">EC2 + Auto Scaling</button><button type="button" class="ias-btn" data-m="lam">Lambda</button><button type="button" class="ias-btn" data-m="lim">Lambda com limite baixo</button><button type="button" class="ias-btn pri" data-a="play">▶ Rodar o pico</button></div>' +
      '<canvas width="760" height="260" role="img" aria-label="Gráfico da demanda e da capacidade ao longo de uma hora"></canvas>' +
      '<div class="ias-legend"><span><i style="background:var(--fg)"></i>demanda (requisições por segundo)</span><span><i style="background:var(--accent)"></i>capacidade</span><span><i style="background:var(--red)"></i>requisições perdidas</span></div>' +
      '<div class="ias-kpis"><div class="ias-kpi bad"><span>Requisições perdidas</span><b class="k-p">–</b></div><div class="ias-kpi"><span>Capacidade máxima</span><b class="k-c">–</b></div></div><p class="ias-note nt"></p>');
    box.appendChild(ui);
    const cv = ui.querySelector('canvas'), ctx = cv.getContext('2d'), T = 60, MAX = 1000;
    const dem = Array.from({ length: T }, (_, t) => t < 20 ? 120 : t < 24 ? 120 + (t - 19) * 190 : t < 38 ? 900 : t < 44 ? 900 - (t - 37) * 130 : 120);
    let modo = 'ec2';
    function capac(m) {
      const cap = [];
      if (m === 'ec2') { let inst = 2, pend = []; for (let t = 0; t < T; t++) { pend = pend.filter(p => { if (p <= t) { inst++; return false; } return true; }); const c = inst * 150; if (dem[t] > c * .7 && pend.length < 2) pend.push(t + 5); if (dem[t] < c * .3 && inst > 2 && !pend.length) inst--; cap.push(c); } }
      else { for (let t = 0; t < T; t++) cap.push(m === 'lim' ? Math.min(dem[t], 500) : dem[t]); }
      return cap;
    }
    function desenha(ate) {
      const W = cv.width, H = cv.height, x = t => 40 + t / (T - 1) * (W - 60), y = v => H - 26 - v / MAX * (H - 46);
      const cap = capac(modo);
      ctx.clearRect(0, 0, W, H); ctx.font = '11px system-ui'; ctx.fillStyle = css('--muted');
      [0, 250, 500, 750, 1000].forEach(v => { ctx.fillText(v, 4, y(v)); ctx.strokeStyle = css('--line'); ctx.beginPath(); ctx.moveTo(40, y(v)); ctx.lineTo(W - 20, y(v)); ctx.stroke(); });
      ctx.fillText('minuto 0', 40, H - 8); ctx.fillText('minuto 60', W - 80, H - 8);
      ctx.fillStyle = css('--red'); ctx.globalAlpha = .35;
      for (let t = 0; t < Math.min(ate, T - 1); t++) if (dem[t] > cap[t]) { ctx.beginPath(); ctx.moveTo(x(t), y(dem[t])); ctx.lineTo(x(t + 1), y(dem[t + 1])); ctx.lineTo(x(t + 1), y(Math.min(dem[t + 1], cap[t + 1]))); ctx.lineTo(x(t), y(cap[t])); ctx.fill(); }
      ctx.globalAlpha = 1;
      const linha = (arr, cor, w) => { ctx.strokeStyle = cor; ctx.lineWidth = w; ctx.beginPath(); for (let t = 0; t <= Math.min(ate, T - 1); t++) t ? ctx.lineTo(x(t), y(arr[t])) : ctx.moveTo(x(t), y(arr[t])); ctx.stroke(); ctx.lineWidth = 1; };
      linha(dem, css('--fg'), 2); linha(cap, css('--accent'), 2.5);
      if (ate >= T - 1) {
        let perd = 0, tot = 0; dem.forEach((d, t) => { tot += d; perd += Math.max(0, d - cap[t]); });
        ui.querySelector('.k-p').textContent = pct(perd / tot, 1); ui.querySelector('.k-c').textContent = Math.max(...cap) + ' req/s';
        ui.querySelector('.nt').innerHTML = { ec2: 'O Auto Scaling reage, mas cada instância nova leva alguns minutos para ficar pronta. Durante a subida do pico, parte das requisições se perde. Na prática, isso se compensa com capacidade de reserva, escalonamento programado ou filas.', lam: 'A Lambda cria execuções conforme a demanda chega: a capacidade acompanha a curva quase na hora. O custo também acompanha, por isso orçamento e alarmes são obrigatórios. As primeiras execuções podem ter "partida a frio".', lim: 'Com um limite de concorrência baixo (500 aqui), a Lambda protege o custo e os serviços de trás, como o Textract, mas recusa o que passar do limite. Limite é uma decisão de engenharia, não um detalhe.' }[modo];
      } else { ui.querySelector('.k-p').textContent = '…'; ui.querySelector('.k-c').textContent = '…'; ui.querySelector('.nt').textContent = ''; }
    }
    let raf = null;
    function roda() { cancelAnimationFrame(raf); if (reduz()) { desenha(T); return; } const t0 = performance.now(); const f = now => { const a = (now - t0) / 4000 * T; desenha(a); if (a < T) raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); }
    ui.addEventListener('click', e => {
      const m = e.target.closest('[data-m]'), a = e.target.closest('[data-a]');
      if (m) { modo = m.dataset.m; [...ui.querySelectorAll('[data-m]')].forEach(b => b.setAttribute('aria-pressed', String(b === m))); roda(); }
      if (a) roda();
    });
    desenha(0); quandoVisivel(box, roda);
  };

  /* ------------------------------------------------------------------ */
  /* tail: latência de cauda com fan-out (Dean e Barroso, 2013)          */
  /* ------------------------------------------------------------------ */
  IAS.tail = function (box) {
    const ui = h('div', '',
      '<div class="grid2"><div><label class="r">Serviços chamados por requisição <span class="nv"></span></label><input type="range" data-k="n" min="1" max="100" value="10"></div>' +
      '<div><label class="r">Chance de cada serviço estar lento <span class="pv"></span></label><input type="range" data-k="p" min="1" max="50" value="10"></div></div>' +
      '<div class="ias-grid"></div>' +
      '<div class="ias-row"><button type="button" class="ias-btn pri" data-a="1">Uma requisição</button><button type="button" class="ias-btn" data-a="1000">1.000 requisições</button></div>' +
      '<div class="ias-kpis"><div class="ias-kpi warn"><span>Requisição lenta (teoria)</span><b class="k-t"></b></div><div class="ias-kpi"><span>Medido</span><b class="k-m">–</b></div><div class="ias-kpi"><span>Requisições</span><b class="k-n">0</b></div></div><p class="ias-note nt"></p>');
    box.appendChild(ui);
    let N = 0, L = 0;
    const v = k => +ui.querySelector('[data-k=' + k + ']').value;
    function base() {
      const n = v('n'), p = v('p') / 1000;
      ui.querySelector('.nv').textContent = n; ui.querySelector('.pv').textContent = pct(p, 1);
      const g = ui.querySelector('.ias-grid'); g.innerHTML = ''; for (let i = 0; i < n; i++) g.appendChild(h('i'));
      const t = 1 - Math.pow(1 - p, n);
      ui.querySelector('.k-t').textContent = pct(t, 1);
      ui.querySelector('.nt').innerHTML = 'Cada serviço é lento só ' + pct(p, 1) + ' das vezes. Mas a requisição só termina quando <strong>todos</strong> respondem, então basta um lento: 1 − (1 − ' + dec(p, 3) + ')<sup>' + n + '</sup> = <strong>' + pct(t, 1) + '</strong>. No exemplo de Dean e Barroso (2013), com 1% e 100 servidores, 63% das requisições ficam lentas.';
      N = L = 0; ui.querySelector('.k-n').textContent = 0; ui.querySelector('.k-m').textContent = '–';
    }
    ui.addEventListener('input', base);
    ui.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      const n = v('n'), p = v('p') / 1000, reps = +a.dataset.a;
      for (let r = 0; r < reps; r++) {
        let lenta = false; const marc = [];
        for (let i = 0; i < n; i++) { const s = Math.random() < p; marc.push(s); lenta = lenta || s; }
        N++; if (lenta) L++;
        if (reps === 1) [...ui.querySelectorAll('.ias-grid i')].forEach((c, i) => { c.className = marc[i] ? 'slow' : 'fast'; });
      }
      ui.querySelector('.k-n').textContent = N.toLocaleString('pt-BR'); ui.querySelector('.k-m').textContent = pct(L / N, 1);
    });
    base();
  };

  /* ------------------------------------------------------------------ */
  /* brooks: essencial × acidental, e quanto a IA pode reduzir           */
  /* {tarefas:[{nome, acid, txt}]}  acid = fração acidental              */
  /* ------------------------------------------------------------------ */
  IAS.brooks = function (box) {
    const T = dados(box).tarefas || [];
    const ui = h('div', '',
      '<div class="ias-row ts"></div>' +
      '<label class="r" style="margin-top:6px">Quanto a IA elimina do trabalho acidental <span class="rv"></span></label><input type="range" min="0" max="100" step="5" value="70">' +
      '<div class="ias-stack"><span class="lb">Antes</span><div class="sb"><i class="es"></i><i class="ac"></i></div><span class="lb">Com IA</span><div class="sb"><i class="es"></i><i class="ac"></i><i class="gn"></i></div></div>' +
      '<div class="ias-legend"><span><i style="background:var(--accent)"></i>essencial (entender, decidir)</span><span><i style="background:var(--amber)"></i>acidental (escrever, configurar)</span><span><i style="background:var(--line)"></i>tempo economizado</span></div>' +
      '<div class="ias-info"></div>');
    box.appendChild(ui);
    let j = 0;
    function pinta() {
      const t = T[j], r = +ui.querySelector('input').value / 100, a = t.acid, e = 1 - a, novo = e + a * (1 - r);
      ui.querySelector('.rv').textContent = pct(r);
      const [antes, depois] = ui.querySelectorAll('.sb');
      antes.querySelector('.es').style.width = e * 100 + '%'; antes.querySelector('.ac').style.width = a * 100 + '%';
      depois.querySelector('.es').style.width = e * 100 + '%'; depois.querySelector('.ac').style.width = a * (1 - r) * 100 + '%'; depois.querySelector('.gn').style.width = a * r * 100 + '%';
      ui.querySelector('.ias-info').innerHTML = '<b>' + t.nome + ':</b> ' + t.txt + ' Ganho nesta tarefa: <strong>' + pct(1 - novo) + '</strong>. Mesmo que a IA eliminasse todo o acidental, o ganho máximo seria ' + pct(a) + '.';
      [...ui.querySelectorAll('.ts button')].forEach((b, k) => b.setAttribute('aria-pressed', String(k === j)));
    }
    T.forEach((t, k) => { const b = h('button', 'ias-btn', t.nome); b.type = 'button'; b.onclick = () => { j = k; pinta(); }; ui.querySelector('.ts').appendChild(b); });
    ui.querySelector('input').addEventListener('input', pinta);
    pinta();
  };

  /* ------------------------------------------------------------------ */
  /* levels: os dez níveis de automação de Sheridan e Verplank           */
  /* {niveis:[{d, ex, escada, risco}]}                                   */
  /* ------------------------------------------------------------------ */
  IAS.levels = function (box) {
    const N = dados(box).niveis || [];
    const ui = h('div', '',
      '<input type="range" min="1" max="' + N.length + '" value="4" aria-label="Nível de automação">' +
      '<div class="ias-ladder10">' + N.map((_, i) => '<span>' + (i + 1) + '</span>').join('') + '</div>' +
      '<div class="ias-split"><div class="p">Pessoa decide</div><div class="m">Máquina decide</div></div>' +
      '<div class="ias-info"></div>');
    box.appendChild(ui);
    const r = ui.querySelector('input');
    function pinta() {
      const i = +r.value - 1, n = N[i], frac = i / (N.length - 1);
      [...ui.querySelectorAll('.ias-ladder10 span')].forEach((s, k) => { s.className = k === i ? 'on ' + n.risco : k < i ? 'past' : ''; });
      ui.querySelector('.ias-split .p').style.width = (100 - frac * 100) + '%'; ui.querySelector('.ias-split .m').style.width = frac * 100 + '%';
      ui.querySelector('.ias-info').innerHTML = '<b>Nível ' + (i + 1) + ':</b> ' + n.d + '<br><span style="color:var(--muted)">Na engenharia de software:</span> ' + n.ex + (n.escada ? '<br><span style="color:var(--muted)">Na escada de autonomia da aula 1:</span> ' + n.escada : '');
    }
    r.addEventListener('input', pinta); pinta();
  };

  /* ------------------------------------------------------------------ */
  /* goodhart: o que acontece quando a métrica vira meta                 */
  /* {cenarios:[{nome, txt, series:[{l, cor, v:[...]}]}]}                */
  /* ------------------------------------------------------------------ */
  IAS.goodhart = function (box) {
    const C = dados(box).cenarios || [];
    const ui = h('div', '', '<div class="ias-row cs"></div><canvas width="760" height="250" role="img" aria-label="Gráfico de linhas ao longo de 12 sprints"></canvas><div class="ias-legend lg"></div><div class="ias-info"></div>');
    box.appendChild(ui);
    const cv = ui.querySelector('canvas'), ctx = cv.getContext('2d');
    let j = 0, raf = null;
    function desenha(ate) {
      const W = cv.width, H = cv.height, S = C[j].series, n = S[0].v.length, x = t => 50 + t / (n - 1) * (W - 80), y = v => H - 28 - v / 100 * (H - 50);
      ctx.clearRect(0, 0, W, H); ctx.font = '11px system-ui'; ctx.fillStyle = css('--muted'); ctx.strokeStyle = css('--line');
      [0, 50, 100].forEach(v => { ctx.beginPath(); ctx.moveTo(50, y(v)); ctx.lineTo(W - 30, y(v)); ctx.stroke(); });
      for (let t = 0; t < n; t++) ctx.fillText('S' + (t + 1), x(t) - 6, H - 10);
      S.forEach(s => {
        ctx.strokeStyle = css(COR[s.cor] || '--accent'); ctx.lineWidth = 2.5; ctx.beginPath();
        const lim = Math.min(ate, n - 1), ti = Math.floor(lim);
        for (let t = 0; t <= ti; t++) t ? ctx.lineTo(x(t), y(s.v[t])) : ctx.moveTo(x(t), y(s.v[t]));
        if (ti < n - 1) { const f = lim - ti; ctx.lineTo(x(ti + f), y(s.v[ti] + (s.v[ti + 1] - s.v[ti]) * f)); }
        ctx.stroke(); ctx.lineWidth = 1;
      });
    }
    function vai(k) {
      j = k; cancelAnimationFrame(raf);
      ui.querySelector('.lg').innerHTML = C[j].series.map(s => '<span><i style="background:var(' + (COR[s.cor] || '--accent') + ')"></i>' + s.l + '</span>').join('');
      ui.querySelector('.ias-info').innerHTML = '<b>' + C[j].nome + '.</b> ' + C[j].txt;
      [...ui.querySelectorAll('.cs button')].forEach((b, i) => b.setAttribute('aria-pressed', String(i === j)));
      const n = C[j].series[0].v.length;
      if (reduz()) { desenha(n); return; }
      const t0 = performance.now(); const f = now => { const a = (now - t0) / 3000 * n; desenha(a); if (a < n) raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f);
    }
    C.forEach((c, k) => { const b = h('button', 'ias-btn', c.nome); b.type = 'button'; b.onclick = () => vai(k); ui.querySelector('.cs').appendChild(b); });
    desenha(0); quandoVisivel(box, () => vai(0));
  };

  /* ------------------------------------------------------------------ */
  /* escada: autonomia sobe por evidência e desce por incidente          */
  /* {niveis:[{n, nome, d}]}                                             */
  /* ------------------------------------------------------------------ */
  IAS.escada = function (box) {
    const N = dados(box).niveis || [];
    const ui = h('div', 'grid2',
      '<div class="ias-esc">' + N.slice().reverse().map(x => '<div data-n="' + x.n + '"><b>' + x.n + '</b><span>' + x.nome + '</span></div>').join('') + '</div>' +
      '<div><div class="ias-chk"><label><input type="checkbox" class="rev"> A ação é reversível e de baixo impacto</label></div>' +
      '<div class="ias-row" style="flex-direction:column;align-items:stretch"><button type="button" class="ias-btn pri" data-a="up">30 dias com métricas boas e sem incidente ↑</button><button type="button" class="ias-btn" data-a="down">Aconteceu um incidente ↓</button><button type="button" class="ias-btn" data-a="z">↺ Recomeçar no nível 1</button></div>' +
      '<div class="ias-info"></div><div class="ias-log"></div></div>');
    box.appendChild(ui);
    let nv = 1;
    const log = t => { const d = h('div'); d.textContent = t; ui.querySelector('.ias-log').prepend(d); };
    function pinta(msg) {
      [...ui.querySelectorAll('.ias-esc div')].forEach(d => d.classList.toggle('on', +d.dataset.n === nv));
      const x = N.find(y => y.n === nv); ui.querySelector('.ias-info').innerHTML = '<b>Nível ' + nv + ' · ' + x.nome + '.</b> ' + x.d + (msg ? '<br>' + msg : '');
    }
    ui.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      const rev = ui.querySelector('.rev').checked;
      if (a.dataset.a === 'up') {
        if (nv >= 4) { log('Já está no topo.'); pinta(); return; }
        if (nv === 3 && !rev) { log('Pedido para subir ao nível 4 negado: a ação não é reversível.'); pinta('<strong style="color:var(--amber)">Não sobe:</strong> o nível 4 é só para ações reversíveis e de baixo impacto. Para esta ação, o teto é o 3.'); return; }
        nv++; log('Subiu para o nível ' + nv + ' com base em evidência.'); pinta();
      }
      if (a.dataset.a === 'down') { if (nv > 0) nv--; log('Incidente: voltou para o nível ' + nv + '. O postmortem diz o que falta para subir de novo.'); pinta('<strong style="color:var(--red)">Desceu um degrau.</strong> Sem culpados: a pergunta é "que guarda faltou?".'); }
      if (a.dataset.a === 'z') { nv = 1; ui.querySelector('.ias-log').innerHTML = ''; pinta(); }
    });
    pinta();
  };

  /* ---------------------------- inicialização ------------------------ */
  function init() {
    document.querySelectorAll('[data-ias]').forEach(box => {
      if (box.dataset.iasOk) return;
      box.dataset.iasOk = '1';
      const f = IAS[box.dataset.ias];
      if (f) { try { f(box); } catch (e) { console.error('ias: falha em', box.dataset.ias, e); } }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
