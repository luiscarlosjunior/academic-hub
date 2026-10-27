/* =====================================================================
   Depurador passo a passo da ordenação (disciplina Estrutura de Dados)
   Executa, linha a linha, os algoritmos de 04-ordenacao.c e mostra o
   código com a linha atual destacada, as variáveis, a pilha de chamadas
   (quicksort) e o vetor, com uma explicação em cada passo.
   Uso: <div data-depurador data-algoritmo="bolha"></div>
   ===================================================================== */
(function (global) {
  'use strict';

const CODIGO = {
 "17": "static void bolha(int a[], size_t n) {",
 "18": "    for (size_t p = 0; p + 1 < n; p++) {",
 "19": "        int trocou = 0;",
 "20": "        for (size_t j = 0; j + 1 < n - p; j++)",
 "21": "            if (a[j] > a[j + 1]) {",
 "22": "                trocar(&a[j], &a[j + 1]);",
 "23": "                trocou = 1;",
 "24": "            }",
 "25": "        if (!trocou) break;                 /* já ordenado: parada antecipada */",
 "26": "    }",
 "27": "}",
 "31": "static void selecao(int a[], size_t n) {",
 "32": "    for (size_t i = 0; i + 1 < n; i++) {",
 "33": "        size_t menor = i;",
 "34": "        for (size_t j = i + 1; j < n; j++)",
 "35": "            if (a[j] < a[menor]) menor = j;",
 "36": "        trocar(&a[i], &a[menor]);",
 "37": "    }",
 "38": "}",
 "42": "static void insercao(int a[], size_t n) {",
 "43": "    for (size_t i = 1; i < n; i++) {",
 "44": "        int chave = a[i];",
 "45": "        size_t j = i;",
 "46": "        while (j > 0 && a[j - 1] > chave) {",
 "47": "            a[j] = a[j - 1];",
 "48": "            j--;",
 "49": "        }",
 "50": "        a[j] = chave;",
 "51": "    }",
 "52": "}",
 "56": "static void quicksort(int a[], long lo, long hi) {",
 "57": "    if (lo >= hi) return;",
 "58": "    int pivo = a[hi];",
 "59": "    long i = lo;",
 "60": "    for (long j = lo; j < hi; j++)",
 "61": "        if (a[j] < pivo) {",
 "62": "            trocar(&a[i], &a[j]);",
 "63": "            i++;",
 "64": "        }",
 "65": "    trocar(&a[i], &a[hi]);",
 "66": "    quicksort(a, lo, i - 1);",
 "67": "    quicksort(a, i + 1, hi);",
 "68": "}",
 "72": "static void intercalar(int a[], int aux[], size_t lo, size_t mid, size_t hi) {",
 "73": "    size_t i = lo, j = mid, k = lo;",
 "74": "    while (i < mid && j < hi) aux[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];",
 "75": "    while (i < mid) aux[k++] = a[i++];",
 "76": "    while (j < hi) aux[k++] = a[j++];",
 "77": "    memcpy(&a[lo], &aux[lo], (hi - lo) * sizeof *a);",
 "78": "}",
 "79": "",
 "80": "static void merge_rec(int a[], int aux[], size_t lo, size_t hi) {",
 "81": "    if (hi - lo < 2) return;",
 "82": "    size_t mid = lo + (hi - lo) / 2;",
 "83": "    merge_rec(a, aux, lo, mid);",
 "84": "    merge_rec(a, aux, mid, hi);",
 "85": "    intercalar(a, aux, lo, mid, hi);",
 "86": "}",
 "87": "",
 "88": "static int merge_sort(int a[], size_t n) {",
 "89": "    if (n < 2) return 1;",
 "90": "    int *aux = malloc(n * sizeof *aux);      /* O(n) de memória auxiliar */",
 "91": "    if (aux == NULL) return 0;",
 "92": "    merge_rec(a, aux, 0, n);",
 "93": "    free(aux);",
 "94": "    return 1;",
 "95": "}"
};

  const ALGORITMOS = {
    bolha: { nome: 'Bolha (bubble sort)', linhas: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27] },
    selecao: { nome: 'Seleção', linhas: [31, 32, 33, 34, 35, 36, 37, 38] },
    insercao: { nome: 'Inserção', linhas: [42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52] },
    quicksort: { nome: 'Quicksort (Lomuto)', linhas: [56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68] },
    mergesort: { nome: 'Merge sort', linhas: [72, 73, 74, 75, 76, 77, 78, 80, 81, 82, 83, 84, 85, 86, 88, 89, 90, 91, 92, 93, 94, 95] }
  };

  const VETORES = {
    misto: { nome: 'Exemplo: 29 10 14 37 13 5 42 8', valores: [29, 10, 14, 37, 13, 5, 42, 8] },
    ordenado: { nome: 'Já ordenado (melhor caso)', valores: [1, 2, 3, 4, 5, 6, 7, 8] },
    invertido: { nome: 'Invertido (pior caso)', valores: [8, 7, 6, 5, 4, 3, 2, 1] }
  };

  /* Cada estado: l (linha executada), a (vetor), v (variáveis), hl (índices
     comparados), fix (posições já definitivas), piv (pivô), pilha, t (texto) */
  function criaRegistro(a) {
    const S = [], fixo = [];
    let piv = -1;
    const pilha = [];
    const st = (l, v, hl, t) => S.push({
      l, a: a.slice(), v: v || {}, hl: hl || [], fix: fixo.slice(), piv, pilha: pilha.slice(), t
    });
    return { S, fixo, st, setPiv: x => { piv = x; }, pilha };
  }

  function geraBolha(a0) {
    const a = a0.slice(), n = a.length, r = criaRegistro(a), st = r.st, fixo = r.fixo;
    st(17, { n }, [], 'Chamada bolha(a, n). Como a[] é um ponteiro, a ordenação acontece no próprio vetor.');
    for (let p = 0; p + 1 < n; p++) {
      st(18, { p, n }, [], `Passagem p = ${p}. A condição p + 1 < n é ${p + 1} < ${n}: verdadeira, então a passagem acontece.`);
      let trocou = 0;
      st(19, { p, trocou }, [], 'trocou = 0: ainda não houve troca nesta passagem.');
      for (let j = 0; j + 1 < n - p; j++) {
        st(20, { p, j, trocou }, [], `Condição j + 1 < n − p: ${j + 1} < ${n - p} é verdadeira. O sufixo já fixo fica de fora.`);
        const fora = a[j] > a[j + 1];
        st(21, { p, j, 'a[j]': a[j], 'a[j+1]': a[j + 1] }, [j, j + 1],
          `Compara a[${j}] = ${a[j]} com a[${j + 1}] = ${a[j + 1]}: ${fora ? 'estão fora de ordem (o da esquerda é maior).' : 'já estão em ordem.'}`);
        if (fora) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          st(22, { p, j, trocou }, [j, j + 1], `trocar(&a[${j}], &a[${j + 1}]): agora a[${j}] = ${a[j]} e a[${j + 1}] = ${a[j + 1]}. O maior valor avança para a direita.`);
          trocou = 1;
          st(23, { p, j, trocou }, [j, j + 1], 'trocou = 1: a passagem fez pelo menos uma troca.');
        }
      }
      fixo.push(n - 1 - p);
      st(25, { p, trocou }, [], trocou
        ? 'if (!trocou): trocou é 1, a condição é falsa e a passagem seguinte acontece.'
        : 'if (!trocou): trocou é 0, então break interrompe o laço. Sem trocas, o vetor já está ordenado: é o melhor caso, com custo O(n).');
      if (!trocou) break;
    }
    for (let k = 0; k < n; k++) if (!fixo.includes(k)) fixo.push(k);
    st(27, {}, [], 'Fim da função. O vetor está ordenado.');
    return r.S;
  }

  function geraSelecao(a0) {
    const a = a0.slice(), n = a.length, r = criaRegistro(a), st = r.st, fixo = r.fixo;
    st(31, { n }, [], 'Chamada selecao(a, n). A ordenação acontece no próprio vetor.');
    for (let i = 0; i + 1 < n; i++) {
      st(32, { i }, [i], `i = ${i}: vamos colocar o menor valor da parte não ordenada na posição ${i}.`);
      let menor = i;
      st(33, { i, menor }, [i], `menor = ${i}: o candidato inicial é a[${i}] = ${a[i]}.`);
      for (let j = i + 1; j < n; j++) {
        st(34, { i, menor, j }, [menor, j], `j = ${j}: percorre o restante da parte não ordenada.`);
        const ehMenor = a[j] < a[menor];
        st(35, { i, menor, j, 'a[j]': a[j], 'a[menor]': a[menor] }, [menor, j],
          `a[j] = ${a[j]} < a[menor] = ${a[menor]}? ${ehMenor ? 'sim: menor passa a ser j.' : 'não: menor continua o mesmo.'}`);
        if (ehMenor) {
          menor = j;
          st(35, { i, menor, j }, [menor], `menor = ${j}. A comparação acontece sempre, mesmo que o vetor já esteja ordenado.`);
        }
      }
      if (menor !== i) [a[i], a[menor]] = [a[menor], a[i]];
      st(36, { i, menor }, [i, menor], menor === i
        ? `trocar(&a[${i}], &a[${menor}]): o menor já estava na posição ${i}; a troca não muda nada.`
        : `trocar(&a[${i}], &a[${menor}]): o valor ${a[i]} vai para a posição definitiva ${i}. Uma única troca por passagem.`);
      fixo.push(i);
    }
    for (let k = 0; k < n; k++) if (!fixo.includes(k)) fixo.push(k);
    st(38, {}, [], 'Fim da função. O vetor está ordenado. Repare que a seleção fez n(n−1)/2 comparações, inclusive se o vetor já estivesse ordenado.');
    return r.S;
  }

  function geraInsercao(a0) {
    const a = a0.slice(), n = a.length, r = criaRegistro(a), st = r.st, fixo = r.fixo;
    st(42, { n }, [], 'Chamada insercao(a, n). Invariante: a[0..i−1] está sempre ordenado.');
    for (let i = 1; i < n; i++) {
      fixo.length = 0;
      for (let k = 0; k < i; k++) fixo.push(k);
      st(43, { i }, [i], `i = ${i}: o prefixo a[0..${i - 1}] já está ordenado. Vamos encaixar a[${i}].`);
      const chave = a[i];
      st(44, { i, chave }, [i], `chave = a[${i}] = ${chave}. Guardamos o valor porque os deslocamentos vão sobrescrever a[${i}].`);
      let j = i;
      st(45, { i, chave, j }, [j], `j = ${j}: começa no fim da parte ordenada.`);
      for (;;) {
        const cond = j > 0 && a[j - 1] > chave;
        st(46, { i, chave, j, 'a[j-1]': j > 0 ? a[j - 1] : '—' }, j > 0 ? [j - 1] : [],
          `j > 0 && a[j−1] > chave: ${j === 0 ? 'falsa (j = 0), o laço para.' : cond
            ? `verdadeira (${a[j - 1]} > ${chave}): o valor precisa ser deslocado.`
            : `falsa (${a[j - 1]} ≤ ${chave}), o laço para: a chave encontrou o lugar.`}`);
        if (!cond) break;
        a[j] = a[j - 1];
        st(47, { i, chave, j }, [j, j - 1], `a[${j}] = a[${j - 1}]: o valor ${a[j]} desloca uma casa para a direita.`);
        j--;
        st(48, { i, chave, j }, [j], `j−− : j agora vale ${j}.`);
      }
      a[j] = chave;
      st(50, { i, chave, j }, [j], `a[${j}] = chave: ${chave} entra na posição ${j}. Os maiores já foram deslocados.`);
    }
    for (let k = 0; k < n; k++) if (!fixo.includes(k)) fixo.push(k);
    st(52, {}, [], 'Fim da função. Melhor caso (já ordenado): uma comparação por elemento, O(n). Pior caso (invertido): deslocamentos em todo prefixo, O(n²).');
    return r.S;
  }

  function geraQuicksort(a0) {
    const a = a0.slice(), n = a.length, r = criaRegistro(a), st = r.st, fixo = r.fixo, pilha = r.pilha;
    const troca = (x, y) => { [a[x], a[y]] = [a[y], a[x]]; };

    function qs(lo, hi) {
      pilha.push(`quicksort(${lo}, ${hi})`);
      st(56, { lo, hi }, [], `Chamada quicksort(a, ${lo}, ${hi}). Um novo quadro entra na pilha de chamadas.`);
      st(57, { lo, hi }, [], `lo >= hi? ${lo} >= ${hi} é ${lo >= hi ? 'verdadeira: zero ou um elemento, já ordenado. A função retorna.' : 'falsa: há o que ordenar.'}`);
      if (lo >= hi) {
        if (lo === hi) fixo.push(lo);
        pilha.pop();
        return;
      }
      const pivo = a[hi];
      r.setPiv(hi);
      st(58, { lo, hi, pivo }, [hi], `pivo = a[${hi}] = ${pivo}: o último elemento do trecho é o pivô.`);
      let i = lo;
      st(59, { lo, hi, pivo, i }, [i], `i = ${lo}: fronteira. Tudo que estiver antes de i será menor que o pivô.`);
      for (let j = lo; j < hi; j++) {
        st(60, { lo, hi, pivo, i, j }, [j], `j = ${j} < ${hi}: varre o trecho sem contar o pivô.`);
        const menor = a[j] < pivo;
        st(61, { lo, hi, pivo, i, j, 'a[j]': a[j] }, [j],
          `a[j] = ${a[j]} < pivo = ${pivo}? ${menor ? 'sim: o valor pertence à região dos menores.' : 'não: fica do lado dos maiores.'}`);
        if (menor) {
          troca(i, j);
          st(62, { lo, hi, pivo, i, j }, [i, j], `trocar(&a[${i}], &a[${j}]): o menor vai para a fronteira ${i}.`);
          i++;
          st(63, { lo, hi, pivo, i, j }, [i - 1], `i++ : a região dos menores cresce, agora i = ${i}.`);
        }
      }
      troca(i, hi);
      fixo.push(i);
      r.setPiv(-1);
      st(65, { lo, hi, i }, [i], `trocar(&a[${i}], &a[${hi}]): o pivô ${pivo} vai para a posição definitiva ${i}. Ela nunca mais será tocada.`);
      st(66, { lo, hi, i }, [], `quicksort(a, ${lo}, ${i - 1}): ordena a parte dos menores, à esquerda do pivô.`);
      qs(lo, i - 1);
      st(67, { lo, hi, i }, [], `Voltou da chamada da esquerda. Agora quicksort(a, ${i + 1}, ${hi}): ordena a parte dos maiores.`);
      qs(i + 1, hi);
      pilha.pop();
    }

    if (n > 0) qs(0, n - 1);
    for (let k = 0; k < n; k++) if (!fixo.includes(k)) fixo.push(k);
    st(68, {}, [], 'Fim da chamada inicial. Cada pivô ficou na posição final; a pilha de chamadas está vazia e o vetor está ordenado.');
    return r.S;
  }

  function geraMergeSort(a0) {
    const a = a0.slice(), n = a.length, r = criaRegistro(a), fixo = r.fixo, pilha = r.pilha;
    let aux = [];
    const snap = (l, v, hl, t) => { r.st(l, v, hl, t); r.S[r.S.length - 1].aux = aux.slice(); };

    function intercalar(lo, mid, hi) {
      pilha.push(`intercalar(${lo}, ${mid}, ${hi})`);
      let i = lo, j = mid, k = lo;
      snap(73, { lo, mid, hi, i, j, k }, [], `Intercalar [${lo}..${mid - 1}] com [${mid}..${hi - 1}]. i e j começam no início de cada metade; k é a próxima posição de escrita em aux.`);
      while (i < mid && j < hi) {
        const ai = a[i], aj = a[j], pegaEsq = ai <= aj;
        aux[k] = pegaEsq ? ai : aj;
        if (pegaEsq) i++; else j++;
        k++;
        snap(74, { lo, mid, hi, i, j, k, 'a[i]': ai, 'a[j]': aj }, [i - (pegaEsq ? 1 : 0), j - (pegaEsq ? 0 : 1)],
          `a[i] = ${ai} ≤ a[j] = ${aj}? ${pegaEsq ? 'sim: o da esquerda é copiado para aux[' + (k - 1) + '].' : 'não: o da direita é copiado para aux[' + (k - 1) + '].'} Como as metades estão ordenadas, o menor é sempre o próximo.`);
      }
      while (i < mid) {
        aux[k] = a[i];
        i++; k++;
        snap(75, { lo, mid, hi, i, j, k }, [i - 1], `A metade da esquerda sobrou: copia a[${i - 1}] = ${a[i - 1]} para aux[${k - 1}].`);
      }
      while (j < hi) {
        aux[k] = a[j];
        j++; k++;
        snap(76, { lo, mid, hi, i, j, k }, [j - 1], `A metade da direita sobrou: copia a[${j - 1}] = ${a[j - 1]} para aux[${k - 1}].`);
      }
      for (let p = lo; p < hi; p++) a[p] = aux[p];
      snap(77, { lo, mid, hi }, [], `memcpy: copia aux[${lo}..${hi - 1}] de volta para a. Este trecho de a agora está ordenado: [${a.slice(lo, hi).join(', ')}].`);
      pilha.pop();
    }

    function mr(lo, hi) {
      pilha.push(`merge_rec(${lo}, ${hi})`);
      snap(81, { lo, hi }, [], `hi − lo < 2? ${hi - lo} < 2 é ${hi - lo < 2 ? 'verdadeiro: um elemento, já ordenado. A função retorna.' : 'falso: há o que dividir.'}`);
      if (hi - lo < 2) { pilha.pop(); return; }
      const mid = lo + Math.floor((hi - lo) / 2);
      snap(82, { lo, hi, mid }, [], `mid = ${lo} + (${hi} − ${lo}) / 2 = ${mid}: divide [${lo}..${hi - 1}] em [${lo}..${mid - 1}] e [${mid}..${hi - 1}].`);
      snap(83, { lo, hi, mid }, [], `merge_rec(a, aux, ${lo}, ${mid}): ordena a metade da esquerda antes de tudo (recursão).`);
      mr(lo, mid);
      snap(84, { lo, hi, mid }, [], `Voltou da esquerda. Agora merge_rec(a, aux, ${mid}, ${hi}): a metade da direita.`);
      mr(mid, hi);
      snap(85, { lo, hi, mid }, [], `Voltou da direita. As duas metades estão ordenadas: intercalar(a, aux, ${lo}, ${mid}, ${hi}).`);
      intercalar(lo, mid, hi);
      pilha.pop();
    }

    snap(88, { n }, [], 'Chamada merge_sort(a, n). A ordenação acontece no próprio vetor, com uma área auxiliar.');
    snap(89, { n }, [], `n < 2? ${n} < 2 é ${n < 2 ? 'verdadeiro: nada a ordenar, retorna.' : 'falso: há o que ordenar.'}`);
    if (n >= 2) {
      aux = Array(n).fill(null);
      snap(90, { n }, [], `aux = malloc(n × tamanho do int): área auxiliar de ${n} posições. É o custo de memória do merge sort, O(n).`);
      snap(91, { n }, [], 'if (aux == NULL): a alocação funcionou, então o programa continua.');
      mr(0, n);
      aux = [];
      snap(93, { n }, [], 'free(aux): a área auxiliar volta ao sistema. Sem este free haveria vazamento de memória.');
    }
    for (let k = 0; k < n; k++) if (!fixo.includes(k)) fixo.push(k);
    snap(94, {}, [], 'return 1: merge sort concluído. Vetor ordenado. Em qualquer caso, o custo é O(n log n).');
    return r.S;
  }

  const GERADORES = { bolha: geraBolha, selecao: geraSelecao, insercao: geraInsercao, quicksort: geraQuicksort, mergesort: geraMergeSort };

  function escapa(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function valorVar(x) {
    return typeof x === 'number' ? String(x) : escapa(x);
  }

  function monta(el) {
    const algo0 = el.getAttribute('data-algoritmo') || 'bolha';
    const algoOpts = Object.keys(ALGORITMOS).map(k =>
      `<option value="${k}"${k === algo0 ? ' selected' : ''}>${ALGORITMOS[k].nome}</option>`).join('');
    const vetOpts = Object.keys(VETORES).map(k => `<option value="${k}">${VETORES[k].nome}</option>`).join('');
    el.classList.add('dbg');
    el.setAttribute('tabindex', '0');
    el.innerHTML = `
      <div class="dbg-barra">
        <label>Algoritmo <select data-k="algo">${algoOpts}</select></label>
        <label>Vetor <select data-k="vet">${vetOpts}</select></label>
        <label>Velocidade <select data-k="vel">
          <option value="1600">lenta</option><option value="900" selected>normal</option><option value="450">rápida</option>
        </select></label>
      </div>
      <div class="dbg-botoes">
        <button type="button" data-a="ini" title="Voltar ao início" aria-label="Voltar ao início">⏮</button>
        <button type="button" data-a="ant" title="Linha anterior" aria-label="Linha anterior">◀ Anterior</button>
        <button type="button" data-a="play" class="dbg-primario" aria-label="Reproduzir">▶ Reproduzir</button>
        <button type="button" data-a="prox" title="Próxima linha" aria-label="Próxima linha">Próxima ▶</button>
        <button type="button" data-a="fim" title="Ir ao fim" aria-label="Ir ao fim">⏭</button>
        <span class="dbg-passo" data-k="passo"></span>
      </div>
      <div class="dbg-grade">
        <div class="dbg-painel">
          <h4>Código em C</h4>
          <div class="ah-code dbg-codigo" data-k="codigo"></div>
        </div>
        <div class="dbg-painel">
          <h4>Variáveis</h4>
          <table class="dbg-vars" data-k="vars"></table>
          <h4 class="dbg-sub">Pilha de chamadas</h4>
          <ol class="dbg-pilha" data-k="pilha"></ol>
        </div>
      </div>
      <div class="dbg-painel">
        <h4>Vetor</h4>
        <div class="dbg-vetor" data-k="vetor"></div>
      </div>
      <div class="dbg-painel" data-k="auxwrap" hidden>
        <h4>Área auxiliar (aux)</h4>
        <div class="dbg-vetor" data-k="aux"></div>
      </div>
      <div class="dbg-explica" data-k="explica" aria-live="polite"></div>`;

    const q = s => el.querySelector(`[data-k="${s}"]`);
    const sel = { algo: q('algo'), vet: q('vet'), vel: q('vel') };
    let estados = [], i = 0, timer = null;

    function linhasCodigo(algo) {
      return ALGORITMOS[algo].linhas.map(n =>
        `<div class="dbg-linha" data-l="${n}"><span class="dbg-n">${n}</span><span class="dbg-t">${escapa(CODIGO[String(n)])}</span></div>`
      ).join('');
    }

    function reconstroi() {
      const algo = sel.algo.value;
      const vetor = VETORES[sel.vet.value].valores;
      estados = GERADORES[algo](vetor);
      q('codigo').innerHTML = linhasCodigo(algo);
      i = 0;
      para();
      render();
    }

    function render() {
      i = Math.max(0, Math.min(estados.length - 1, i));
      const s = estados[i];
      el.querySelectorAll('.dbg-linha').forEach(x => x.classList.toggle('is-atual', Number(x.dataset.l) === s.l));
      const atual = el.querySelector('.dbg-linha.is-atual');
      if (atual) atual.scrollIntoView({ block: 'nearest' });

      const vars = Object.keys(s.v);
      q('vars').innerHTML = vars.length
        ? vars.map(k => `<tr><td>${escapa(k)}</td><td>${valorVar(s.v[k])}</td></tr>`).join('')
        : '<tr><td colspan="2" class="dbg-vazio">nenhuma variável local neste ponto</td></tr>';

      q('pilha').innerHTML = s.pilha.length
        ? s.pilha.map((f, k) => `<li class="${k === s.pilha.length - 1 ? 'is-topo' : ''}">${escapa(f)}</li>`).join('')
        : '<li class="dbg-vazio">vazia</li>';

      q('vetor').innerHTML = s.a.map((v, k) => {
        const cls = ['dbg-cel'];
        if (s.fix.includes(k)) cls.push('is-fix');
        if (s.hl.includes(k)) cls.push('is-hl');
        if (s.piv === k) cls.push('is-piv');
        return `<div class="${cls.join(' ')}">${v}<small>${k}</small></div>`;
      }).join('');

      const temAux = Array.isArray(s.aux) && s.aux.length > 0;
      q('auxwrap').hidden = !temAux;
      if (temAux) {
        q('aux').innerHTML = s.aux.map((v, k) => {
          const cls = ['dbg-cel'];
          if (v !== null) cls.push('is-fix');
          if (s.v.k === k) cls.push('is-hl');
          return `<div class="${cls.join(' ')}">${v === null ? '&nbsp;' : v}<small>${k}</small></div>`;
        }).join('');
      }
      q('explica').textContent = s.t;
      q('passo').textContent = `Passo ${i + 1} de ${estados.length}`;
    }

    function para() {
      clearInterval(timer);
      timer = null;
      const b = el.querySelector('[data-a="play"]');
      b.textContent = '▶ Reproduzir';
    }

    function reproduz() {
      if (timer) return para();
      if (i >= estados.length - 1) i = 0;
      el.querySelector('[data-a="play"]').textContent = '❚❚ Pausar';
      timer = setInterval(() => {
        if (i >= estados.length - 1) { para(); return; }
        i++;
        render();
      }, Number(sel.vel.value));
      render();
    }

    el.addEventListener('click', e => {
      const b = e.target.closest('button[data-a]');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'play') return reproduz();
      para();
      if (a === 'ini') i = 0;
      if (a === 'ant') i--;
      if (a === 'prox') i++;
      if (a === 'fim') i = estados.length - 1;
      render();
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { para(); i++; render(); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { para(); i--; render(); e.preventDefault(); }
      if (e.key === ' ') { reproduz(); e.preventDefault(); }
    });
    sel.algo.addEventListener('change', reconstroi);
    sel.vet.addEventListener('change', reconstroi);
    sel.vel.addEventListener('change', () => { if (timer) { para(); reproduz(); } });
    reconstroi();
  }

  function injetaEstilo() {
    if (document.getElementById('dbg-estilo')) return;
    const css = `
.dbg{outline:none}
.dbg-barra{display:flex;flex-wrap:wrap;gap:.6rem 1rem;margin-bottom:.8rem;font-size:.82rem;color:var(--ah-muted)}
.dbg-barra label{display:flex;align-items:center;gap:.4rem}
.dbg-barra select{background:var(--ah-surface-2);color:var(--ah-text);border:1px solid var(--ah-border);border-radius:.5rem;padding:.3rem .45rem;font-size:.8rem}
.dbg-botoes{display:flex;flex-wrap:wrap;align-items:center;gap:.45rem;margin-bottom:.9rem}
.dbg-botoes button{padding:.4rem .7rem;border-radius:.55rem;border:1px solid var(--ah-border);background:var(--ah-surface-2);color:var(--ah-text);font-size:.8rem;font-weight:600;cursor:pointer}
.dbg-botoes button:hover{border-color:var(--ah-accent)}
.dbg-botoes .dbg-primario{background:var(--ah-accent);border-color:var(--ah-accent);color:#fff}
.dbg-passo{margin-left:auto;font-family:'Fira Code',monospace;font-size:.75rem;color:var(--ah-muted)}
.dbg-grade{display:grid;grid-template-columns:1.35fr 1fr;gap:1rem}
@media (max-width:760px){.dbg-grade{grid-template-columns:1fr}}
.dbg-painel{background:var(--ah-surface);border:1px solid var(--ah-border);border-radius:.9rem;padding:.85rem;margin-bottom:1rem}
.dbg-painel h4{margin:0 0 .5rem;font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ah-muted);font-weight:700}
.dbg-painel h4.dbg-sub{margin-top:1rem}
.dbg-codigo.ah-code{padding:.45rem 0;max-height:340px;overflow:auto;margin:0}
.dbg-linha{display:flex;gap:.6rem;padding:0 .75rem;line-height:1.7;white-space:pre;font-family:'Fira Code',ui-monospace,monospace;font-size:.8rem}
.dbg-linha .dbg-n{min-width:2.2rem;text-align:right;color:#94a3b8;user-select:none}
.dbg-linha.is-atual{background:rgba(245,158,11,.25);box-shadow:inset 3px 0 0 #f59e0b}
.dbg-vars{width:100%;font-size:.8rem;border-collapse:collapse}
.dbg-vars td{padding:.22rem .3rem;border-bottom:1px solid var(--ah-border);color:var(--ah-text)}
.dbg-vars td:last-child{text-align:right;font-family:'Fira Code',monospace;color:var(--ah-accent);font-weight:600}
.dbg-pilha{margin:.2rem 0 0 1.2rem;font-family:'Fira Code',monospace;font-size:.78rem;color:var(--ah-muted)}
.dbg-pilha li.is-topo{color:var(--ah-text);font-weight:700}
.dbg-vazio{color:var(--ah-muted);font-style:italic}
.dbg-vetor{display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center}
.dbg-cel{min-width:2.9rem;text-align:center;padding:.5rem .3rem .35rem;border-radius:.6rem;border:1px solid var(--ah-border);background:var(--ah-surface-2);color:var(--ah-text);font-family:'Fira Code',monospace;font-weight:700;transition:background .25s,border-color .25s}
.dbg-cel small{display:block;font-weight:400;font-size:.62rem;color:var(--ah-muted);margin-top:.15rem}
.dbg-cel.is-hl{background:rgba(245,158,11,.3);border-color:#f59e0b}
.dbg-cel.is-fix{background:rgba(16,185,129,.22);border-color:#10b981}
.dbg-cel.is-piv{background:rgba(244,63,94,.25);border-color:#f43f5e}
.dbg-explica{border-left:4px solid #f59e0b;padding:.8rem 1rem;background:var(--ah-surface-2);border-radius:.6rem;line-height:1.7;color:var(--ah-text);font-size:.92rem;min-height:3.5rem}
`;
    const s = document.createElement('style');
    s.id = 'dbg-estilo';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function inicia() {
    injetaEstilo();
    document.querySelectorAll('[data-depurador]').forEach(monta);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia);
  else inicia();

  global.DepuradorOrdenacao = { ALGORITMOS, VETORES, GERADORES, monta };
})(window);
