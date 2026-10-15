/* ------------------------------------------------------------------
   Teoria da Computação e Complexidade: player de passos
   TC.player(elemento, passos) — cada passo é { t: 'legenda', h: 'HTML' }.
   Os controles (anterior, reproduzir, próximo, reiniciar) são criados aqui.
   ------------------------------------------------------------------ */
(function (global) {
  'use strict';

  const TC = {};

  TC.player = function (el, passos) {
    if (!el || !passos || !passos.length) return;
    let i = 0;
    let timer = null;
    const n = passos.length;

    el.classList.add('tc-player');
    el.innerHTML =
      '<div class="tc-frame"></div>' +
      '<p class="tc-legenda"></p>' +
      '<div class="tc-controls">' +
        '<button type="button" data-a="prev">‹ Anterior</button>' +
        '<button type="button" data-a="play">▶ Reproduzir</button>' +
        '<button type="button" data-a="next">Próximo ›</button>' +
        '<button type="button" data-a="reset">↺ Reiniciar</button>' +
      '</div>' +
      '<div class="tc-bar"><span></span></div>';

    const frame = el.querySelector('.tc-frame');
    const legenda = el.querySelector('.tc-legenda');
    const barra = el.querySelector('.tc-bar > span');
    const btnPlay = el.querySelector('[data-a="play"]');
    const btnPrev = el.querySelector('[data-a="prev"]');
    const btnNext = el.querySelector('[data-a="next"]');

    function render() {
      frame.innerHTML = passos[i].h;
      legenda.textContent = 'Passo ' + (i + 1) + ' de ' + n + ' · ' + passos[i].t;
      barra.style.width = ((i + 1) / n * 100) + '%';
      btnPrev.disabled = i === 0;
      btnNext.disabled = i === n - 1;
      if (i === n - 1) stop();
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
      btnPlay.textContent = '▶ Reproduzir';
    }

    function play() {
      if (timer) return stop();
      if (i === n - 1) i = 0;
      btnPlay.textContent = '❚❚ Pausar';
      timer = setInterval(function () {
        if (i < n - 1) { i++; render(); } else { stop(); }
      }, 1600);
    }

    el.addEventListener('click', function (ev) {
      const a = ev.target.getAttribute && ev.target.getAttribute('data-a');
      if (!a) return;
      if (a === 'prev' && i > 0) { stop(); i--; }
      if (a === 'next' && i < n - 1) { stop(); i++; }
      if (a === 'reset') { stop(); i = 0; }
      if (a === 'play') { play(); return; }
      render();
    });

    render();
  };

  global.TC = TC;
})(window);
