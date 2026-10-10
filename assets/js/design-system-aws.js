/* =====================================================================
   Design System em AWS — animações da aula
   Usada pelas páginas de tópico em disciplinas/design-system-aws/topicos/.
   Depende de assets/js/hub.js (canvas, setas e retângulos arredondados)
   e de assets/js/estrutura-dados.js (motor ED.criaAnimacao: quadros + controles).
   Expõe tudo em window.DSA.
   ===================================================================== */
(function (global) {
  'use strict';

  const CORES = {
    txt: '#e2e8f0', mudo: '#64748b',
    amarelo: '#f59e0b', verde: '#10b981', rosa: '#f43f5e', azul: '#38bdf8'
  };

  const ESTILO = {
    normal: { fill: '#1e293b', borda: 'rgba(148,163,184,.45)', txt: CORES.txt, lw: 1.5 },
    ativo:  { fill: 'rgba(245,158,11,.30)', borda: CORES.amarelo, txt: '#fef3c7', lw: 2.5 },
    ok:     { fill: 'rgba(16,185,129,.28)', borda: CORES.verde, txt: '#d1fae5', lw: 2 },
    erro:   { fill: 'rgba(244,63,94,.28)', borda: CORES.rosa, txt: '#ffe4e6', lw: 2.5 },
    apag:   { fill: '#0f172a', borda: 'rgba(100,116,139,.25)', txt: '#475569', lw: 1 }
  };

  /* ===================================================================
     Primitivas de desenho
     =================================================================== */
  function limpa(ctx, w, h) {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);
  }

  function caixa(ctx, x, y, w, h, s, texto, sub) {
    AH.roundRect(ctx, x, y, w, h, 8);
    ctx.fillStyle = s.fill; ctx.fill();
    ctx.strokeStyle = s.borda; ctx.lineWidth = s.lw; ctx.stroke();
    ctx.fillStyle = s.txt;
    ctx.font = '600 12px "Fira Code", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(texto, x + w / 2, sub ? y + h / 2 - 9 : y + h / 2);
    if (sub) {
      ctx.fillStyle = CORES.mudo;
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.fillText(sub, x + w / 2, y + h / 2 + 10);
    }
  }

  function rotulo(ctx, texto, x, y, cor) {
    ctx.fillStyle = cor || CORES.mudo;
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, x, y);
  }

  function seta(ctx, x1, y1, x2, y2, cor) {
    AH.arrow(ctx, x1, y1, x2, y2, cor || CORES.mudo, true);
  }

  /* ===================================================================
     1. HIERARQUIA ATÔMICA (Brad Frost)
     Os níveis são construídos de baixo para cima: átomos → páginas.
     =================================================================== */
  const NIVEIS = [
    { nome: 'Átomos', itens: ['Botão', 'Input', 'Ícone', 'Rótulo'],
      t: 'Átomos são as menores peças com significado próprio: um botão, um campo, um ícone. Quase nunca são usados sozinhos.' },
    { nome: 'Moléculas', itens: ['Campo de busca', 'Item de menu'],
      t: 'Moléculas combinam átomos num grupo simples. O campo de busca junta um input e um botão.' },
    { nome: 'Organismos', itens: ['Cabeçalho do site'],
      t: 'Organismos são seções completas e reutilizáveis. Logotipo, menu e busca formam o cabeçalho.' },
    { nome: 'Templates', itens: ['Layout de painel'],
      t: 'Templates definem a estrutura da página, sem conteúdo real. Mostram onde cada organismo vai.' },
    { nome: 'Páginas', itens: ['Painel de vendas'],
      t: 'Páginas trazem dados reais para o template. Testar páginas revela problemas que os átomos isolados escondem.' }
  ];

  function geraAtomico() {
    return NIVEIS.map((n, k) => ({ k, t: n.t }));
  }

  function desenhaAtomico(ctx, w, h, q) {
    limpa(ctx, w, h);
    const alt = (h - 24) / NIVEIS.length;
    NIVEIS.forEach((n, j) => {
      const y = 12 + j * alt;
      const s = j < q.k ? ESTILO.ok : (j === q.k ? ESTILO.ativo : ESTILO.apag);
      rotulo(ctx, n.nome, 14, y + alt / 2, j === q.k ? CORES.amarelo : CORES.mudo);
      const x0 = 150, area = w - x0 - 14;
      const bw = Math.min(120, area / n.itens.length - 10);
      n.itens.forEach((item, i) => caixa(ctx, x0 + i * (bw + 10), y + 6, bw, alt - 12, s, item));
    });
  }

  /* ===================================================================
     2. TOKENS: fonte → transformação → saídas por plataforma
     =================================================================== */
  const SAIDAS = [
    { id: 'css', nome: 'CSS vars', sub: 'web' },
    { id: 'swift', nome: 'Swift', sub: 'iOS' },
    { id: 'xml', nome: 'Android XML', sub: 'colors.xml' },
    { id: 'cssEscuro', nome: 'Tema escuro', sub: 'data-theme' }
  ];

  function geraTokens() {
    return [
      { foco: 'fonte', ativos: ['fonte'],
        t: 'Fonte única: o tokens.json guarda os primitivos (azul.600, 16) e as referências semânticas (cor.acao.primaria → azul.600).' },
      { foco: 'transf', ativos: ['fonte', 'transf'],
        t: 'O Style Dictionary lê as referências e resolve o valor final de cada token antes de gerar os arquivos.' },
      { foco: 'css', ativos: ['fonte', 'transf', 'css'],
        t: 'Saída web: variáveis CSS que os componentes e o Tailwind consomem.' },
      { foco: 'swift', ativos: ['fonte', 'transf', 'css', 'swift', 'xml'],
        t: 'Saída iOS (Swift) e Android (XML): os mesmos tokens, sem redigitar nenhum valor.' },
      { foco: 'cssEscuro', ativos: ['fonte', 'transf', 'css', 'swift', 'xml', 'cssEscuro'],
        t: 'Tema escuro: a semântica passa a apontar para outros primitivos. Os componentes não mudam.' }
    ];
  }

  function desenhaTokens(ctx, w, h, q) {
    limpa(ctx, w, h);
    const cy = h / 2, bh = 70;
    const bwF = w * 0.22, xF = 12;
    const xT = w * 0.38, bwT = w * 0.2;
    const xO = w * 0.68, bwO = w * 0.3;
    const ativo = id => q.ativos.includes(id);
    const est = id => (q.foco === id ? ESTILO.ativo : (ativo(id) ? ESTILO.ok : ESTILO.apag));

    caixa(ctx, xF, cy - bh / 2, bwF, bh, est('fonte'), 'tokens.json', 'primitivos');
    caixa(ctx, xT, cy - bh / 2, bwT, bh, est('transf'), 'Style Dictionary', 'transformação');
    seta(ctx, xF + bwF + 4, cy, xT - 4, cy, ativo('transf') ? CORES.verde : CORES.mudo);

    const alt = (h - 24) / SAIDAS.length;
    SAIDAS.forEach((o, i) => {
      const y = 12 + i * alt;
      const cyO = y + (alt - 10) / 2;
      if (ativo(o.id)) seta(ctx, xT + bwT + 4, cy, xO - 4, cyO, CORES.verde);
      caixa(ctx, xO, y + 4, bwO, alt - 10, est(o.id), o.nome, o.sub);
    });
  }

  /* ===================================================================
     3. FLUXO GENÉRICO: nós em sequência (CDN, publicação, OIDC, CDK, pipeline)
     Cada quadro traz: nos (nome/sub), foco (nó atual), ate (setas já
     percorridas) e erro (nó que falhou, opcional).
     =================================================================== */
  function desenhaFluxo(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.nos.length, gap = 18;
    const bw = Math.min(150, (w - 20) / n - gap), bh = 74;
    const passo = n > 1 ? (w - 20 - bw) / (n - 1) : 0;
    const cy = (h - bh) / 2;
    const xs = q.nos.map((_, i) => 10 + i * passo);

    for (let i = 0; i < n - 1; i++) {
      const cor = i < q.ate ? CORES.verde : CORES.mudo;
      seta(ctx, xs[i] + bw + 3, cy + bh / 2, xs[i + 1] - 3, cy + bh / 2, cor);
    }
    q.nos.forEach((no, i) => {
      let s;
      if (i === q.erro) s = ESTILO.erro;
      else if (i === q.foco) s = ESTILO.ativo;
      else if (i <= q.ate) s = ESTILO.ok;
      else s = ESTILO.apag;
      caixa(ctx, xs[i], cy, bw, bh, s, no.nome, no.sub);
    });
  }

  const FLUXO_NOS_CDN = [
    { nome: 'Usuário', sub: 'navegador' },
    { nome: 'Route 53', sub: 'DNS / alias' },
    { nome: 'CloudFront', sub: 'borda' },
    { nome: 'S3', sub: 'bucket privado' }
  ];

  function geraCDN() {
    const cf = sub => FLUXO_NOS_CDN.map((n, i) => (i === 2 ? { nome: n.nome, sub } : n));
    return [
      { nos: FLUXO_NOS_CDN, foco: 0, ate: 0,
        t: '1) O usuário abre o site. O navegador pergunta ao DNS qual endereço atende o domínio.' },
      { nos: FLUXO_NOS_CDN, foco: 1, ate: 1,
        t: '2) O Route 53 responde com um alias apontando para a distribuição do CloudFront.' },
      { nos: cf('MISS'), foco: 2, ate: 2,
        t: '3) Cache MISS: a borda ainda não tem o arquivo, então o CloudFront precisa buscá-lo na origem.' },
      { nos: cf('MISS'), foco: 3, ate: 3,
        t: '4) O CloudFront busca no S3 pelo OAC. O bucket é privado e só aceita pedidos assinados pela distribuição.' },
      { nos: cf('guardado'), foco: 2, ate: 2,
        t: '5) O arquivo volta, fica guardado na borda pelo TTL e é entregue ao usuário.' },
      { nos: cf('HIT'), foco: 2, ate: 2,
        t: '6) Segunda visita: cache HIT. A borda responde sozinha, o S3 nem é consultado e a latência cai.' }
    ];
  }

  function geraPublicacao(opcao) {
    const versao = { patch: '1.4.3', minor: '1.5.0', major: '2.0.0' }[opcao] || '1.4.3';
    const consumidor = opcao === 'major' ? 'segue em 1.4.2' : 'recebe ' + versao;
    const nos = [
      { nome: 'Dev', sub: 'commit' },
      { nome: 'Pull request', sub: 'revisão' },
      { nome: 'CI', sub: 'testes + lint' },
      { nome: 'CodeArtifact', sub: 'v' + versao },
      { nome: 'Consumidor', sub: consumidor }
    ];
    const finais = {
      patch: 'Patch 1.4.3 entra sozinho em ^1.4.2: correção compatível, sem ação do consumidor.',
      minor: 'Minor 1.5.0 também entra em ^1.4.2: nova função compatível, sem quebrar o código.',
      major: 'Major 2.0.0 não entra no intervalo ^1.4.2. O consumidor só migra quando decidir, lendo o changelog.'
    };
    return [
      { nos, foco: 0, ate: 0, t: 'O desenvolvedor faz commit numa branch. Nada é publicado ainda.' },
      { nos, foco: 1, ate: 1, t: 'O pull request passa por revisão de código e de acessibilidade.' },
      { nos, foco: 2, ate: 2, t: 'A CI roda lint, testes e teste visual. Só o que passa segue adiante.' },
      { nos, foco: 3, ate: 3, t: 'O pipeline publica a versão ' + versao + ' no CodeArtifact. Versões publicadas não mudam.' },
      { nos, foco: 4, ate: 4, t: finais[opcao] || finais.patch }
    ];
  }

  function geraOIDC(opcao) {
    const main = opcao !== 'feature';
    const nos = [
      { nome: 'GitHub Actions', sub: 'job deploy' },
      { nome: 'Token OIDC', sub: main ? 'branch main' : 'branch feature-x' },
      { nome: 'AWS STS', sub: 'valida trust policy' },
      { nome: 'Credenciais', sub: 'válidas por 1 h' },
      { nome: 'S3 + CloudFront', sub: 'sync e invalidação' }
    ];
    const quadros = [
      { nos, foco: 0, ate: 0, t: 'O job pede um token OIDC ao GitHub. Nenhuma access key de longa duração fica guardada no repositório.' },
      { nos, foco: 1, ate: 1, t: 'O token traz o claim sub, com o repositório e a branch que originaram o job.' }
    ];
    if (main) {
      quadros.push({ nos, foco: 2, ate: 2, t: 'O STS confere a trust policy e aceita o sub da branch main.' });
      quadros.push({ nos, foco: 3, ate: 3, t: 'O STS devolve credenciais temporárias, que expiram sozinhas.' });
      quadros.push({ nos, foco: 4, ate: 4, t: 'O deploy copia os arquivos para o S3 e invalida o cache do CloudFront.' });
    } else {
      quadros.push({ nos, foco: 2, ate: 2, erro: 2,
        t: 'A trust policy só aceita a branch main. Para feature-x, o STS nega com AccessDenied e nenhuma credencial é emitida.' });
    }
    return quadros;
  }

  function geraCDK() {
    const nos = [
      { nome: 'TypeScript', sub: 'stack.ts' },
      { nome: 'cdk synth', sub: 'gera template' },
      { nome: 'CloudFormation', sub: 'cria recursos' },
      { nome: 'Recursos AWS', sub: 'bucket, CDN, OAC' }
    ];
    return [
      { nos, foco: 0, ate: 0, t: 'O código descreve a pilha: bucket privado, distribuição e política. Ele é a fonte da verdade.' },
      { nos, foco: 1, ate: 1, t: 'cdk synth transforma o código num template CloudFormation (cdk.out/*.template.json), sem tocar na AWS.' },
      { nos, foco: 2, ate: 2, t: 'cdk diff mostra o que vai mudar em relação à pilha atual. Depois, cdk deploy aplica.' },
      { nos, foco: 3, ate: 3, t: 'O CloudFormation cria os recursos na ordem das dependências: o bucket antes da política que o referencia.' }
    ];
  }

  function geraPipeline(opcao) {
    const etapas = [
      { nome: 'Lint', t: 'Lint: estilo e erros óbvios. Falha rápida, antes de gastar tempo com testes.' },
      { nome: 'Testes', t: 'Testes unitários dos componentes, com verificação de acessibilidade.' },
      { nome: 'Build', t: 'O build gera os pacotes e o site estático do Storybook.' },
      { nome: 'Visual', t: 'Teste visual compara capturas com a referência. Diferença não aprovada reprova.' },
      { nome: 'Staging', t: 'Deploy em staging: ambiente de testes na AWS, igual a produção.' },
      { nome: 'Aprovação', t: 'Gate manual: uma pessoa revisa e aprova a promoção.' },
      { nome: 'Produção', t: 'Deploy em produção: sync no S3 e invalidação do CloudFront.' }
    ];
    const quadros = [];
    for (let s = 0; s < etapas.length; s++) {
      const nos = etapas.map(e => ({ nome: e.nome, sub: '' }));
      if (opcao === 'falha' && s === 3) {
        quadros.push({ nos, foco: 3, ate: 3, erro: 3,
          t: 'Teste visual reprovou: o botão mudou de cor sem aprovação. O pipeline para aqui; corrija e reexecute.' });
        break;
      }
      quadros.push({ nos, foco: s, ate: s, t: etapas[s].t });
    }
    return quadros;
  }

  /* ===================================================================
     4. FIREWALL (WAF): pedidos avaliados um a um
     =================================================================== */
  const PEDIDOS = {
    normal: [
      { req: 'GET /', v: 'ok', t: 'Página inicial: nenhuma regra dispara. O WAF deixa passar.' },
      { req: 'GET /assets/app.js', v: 'ok', t: 'Arquivo estático comum: passa sem custo de origem, pois vem do cache.' },
      { req: 'GET /docs/botao', v: 'ok', t: 'Documentação do componente: passa normalmente.' },
      { req: 'GET /api/tokens', v: 'ok', t: 'Consulta legítima à API: tudo dentro do limite de taxa.' }
    ],
    ataque: [
      { req: 'GET /', v: 'ok', t: 'Tráfego normal: passa.' },
      { req: 'GET /?q=<script>', v: 'bloq', rotulo: 'BLOQUEADO · XSS', t: 'A regra gerenciada de XSS reconhece script embutido na URL e bloqueia.' },
      { req: 'GET /../../etc/passwd', v: 'bloq', rotulo: 'BLOQUEADO · path', t: 'Tentativa de path traversal: bloqueada antes de chegar ao S3.' },
      { req: 'POST /login (500× em 1 min)', v: 'limite', rotulo: 'LIMITE DE TAXA', t: 'Rajada de tentativas de login: a regra de rate-limit por IP corta o excesso.' },
      { req: 'GET /assets/app.js', v: 'ok', t: 'Depois do ataque, o tráfego legítimo continua passando.' }
    ]
  };

  function geraWAF(opcao) {
    const lista = PEDIDOS[opcao] || PEDIDOS.normal;
    return lista.map((p, k) => ({ k, linhas: lista.slice(0, k + 1), t: p.t }));
  }

  function desenhaWAF(ctx, w, h, q) {
    limpa(ctx, w, h);
    rotulo(ctx, 'Internet  →  WAF (regras gerenciadas + rate-limit)  →  CloudFront / S3', 14, 22, CORES.azul);
    const alt = 40;
    q.linhas.forEach((p, i) => {
      const y = 46 + i * alt;
      const atual = i === q.linhas.length - 1;
      const s = atual ? ESTILO.ativo : ESTILO.normal;
      AH.roundRect(ctx, 14, y, w - 28, alt - 8, 8);
      ctx.fillStyle = s.fill; ctx.fill();
      ctx.strokeStyle = s.borda; ctx.lineWidth = s.lw; ctx.stroke();
      ctx.fillStyle = CORES.txt;
      ctx.font = '12px "Fira Code", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(p.req, 28, y + (alt - 8) / 2);
      const bloqueado = p.v !== 'ok';
      ctx.fillStyle = bloqueado ? CORES.rosa : CORES.verde;
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(bloqueado ? p.rotulo : 'PERMITIDO', w - 28, y + (alt - 8) / 2);
    });
  }

  /* ===================================================================
     Registro das animações: cada página chama DSA.monta('nome')
     =================================================================== */
  /* ===================================================================
     5. CONTRASTE WCAG: razão de luminância entre texto e fundo
     L = 0,2126·R + 0,7152·G + 0,0722·B (valores linearizados)
     razão = (L maior + 0,05) / (L menor + 0,05)
     =================================================================== */
  function luminancia(hex) {
    const canais = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
  }

  function razaoContraste(a, b) {
    const la = luminancia(a), lb = luminancia(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  const PARES_CONTRASTE = [
    { fg: '#1e293b', bg: '#ffffff', nome: 'Texto escuro sobre branco' },
    { fg: '#767676', bg: '#ffffff', nome: 'Cinza médio sobre branco' },
    { fg: '#94a3b8', bg: '#ffffff', nome: 'Cinza claro sobre branco' },
    { fg: '#ffffff', bg: '#2563eb', nome: 'Botão primário: branco sobre azul' },
    { fg: '#ffffff', bg: '#60a5fa', nome: 'Branco sobre azul claro' },
    { fg: '#fde68a', bg: '#fbbf24', nome: 'Amarelo sobre amarelo' }
  ];

  function geraContraste(opcao) {
    const limite = opcao === 'grande' ? 3 : 4.5;
    return PARES_CONTRASTE.map(p => {
      const r = razaoContraste(p.fg, p.bg);
      const ok = r >= limite;
      const txt = r.toFixed(2).replace('.', ',');
      return {
        fg: p.fg, bg: p.bg, r, limite, ok,
        t: p.nome + ': razão ' + txt + ':1. ' + (ok ? 'Passa' : 'Reprova') + ' no limite de ' + String(limite).replace('.', ',') + ':1.'
      };
    });
  }

  function desenhaContraste(ctx, w, h, q) {
    limpa(ctx, w, h);
    AH.roundRect(ctx, 14, 14, w - 28, h * 0.5, 10);
    ctx.fillStyle = q.bg; ctx.fill();
    ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = q.fg;
    ctx.font = '600 22px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Exemplo de texto', w / 2, 14 + h * 0.25);

    const y = h * 0.62, larg = w - 56, maxR = 7;
    rotulo(ctx, 'Razão de contraste (0 a 7)', 28, y - 22, CORES.mudo);
    AH.roundRect(ctx, 28, y, larg, 18, 6);
    ctx.fillStyle = '#0f172a'; ctx.fill();
    const cor = q.ok ? CORES.verde : CORES.rosa;
    AH.roundRect(ctx, 28, y, larg * Math.min(q.r, maxR) / maxR, 18, 6);
    ctx.fillStyle = cor; ctx.fill();
    const xL = 28 + larg * q.limite / maxR;
    ctx.strokeStyle = CORES.amarelo; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(xL, y - 6); ctx.lineTo(xL, y + 24); ctx.stroke();
    rotulo(ctx, 'limite ' + String(q.limite).replace('.', ',') + ':1', xL + 6, y + 40, CORES.amarelo);
    ctx.fillStyle = cor;
    ctx.font = '600 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText((q.ok ? 'PASSA' : 'REPROVA') + ' · ' + q.r.toFixed(2).replace('.', ',') + ':1', w - 28, y + 72);
  }

  const ANIMACOES = {
    contraste: {
      canvas: 'cvContraste', ctl: 'ctlContraste', cap: 'capContraste',
      desenha: desenhaContraste, gera: geraContraste, velocidade: 2200,
      opcoes: [
        { v: 'texto', rotulo: 'Texto normal (4,5:1)' },
        { v: 'grande', rotulo: 'Texto grande (3:1)' }
      ]
    },
    atomico: {
      canvas: 'cvAtomico', ctl: 'ctlAtomico', cap: 'capAtomico',
      desenha: desenhaAtomico, gera: geraAtomico, velocidade: 1900
    },
    tokens: {
      canvas: 'cvTokens', ctl: 'ctlTokens', cap: 'capTokens',
      desenha: desenhaTokens, gera: geraTokens, velocidade: 2200
    },
    cdn: {
      canvas: 'cvCdn', ctl: 'ctlCdn', cap: 'capCdn',
      desenha: desenhaFluxo, gera: geraCDN, velocidade: 2200
    },
    publicacao: {
      canvas: 'cvPublicacao', ctl: 'ctlPublicacao', cap: 'capPublicacao',
      desenha: desenhaFluxo, gera: geraPublicacao, velocidade: 2000,
      opcoes: [
        { v: 'patch', rotulo: 'Correção (patch)' },
        { v: 'minor', rotulo: 'Nova função (minor)' },
        { v: 'major', rotulo: 'Quebra de API (major)' }
      ]
    },
    oidc: {
      canvas: 'cvOidc', ctl: 'ctlOidc', cap: 'capOidc',
      desenha: desenhaFluxo, gera: geraOIDC, velocidade: 2000,
      opcoes: [
        { v: 'main', rotulo: 'Branch main (permitida)' },
        { v: 'feature', rotulo: 'Branch feature-x (negada)' }
      ]
    },
    cdk: {
      canvas: 'cvCdk', ctl: 'ctlCdk', cap: 'capCdk',
      desenha: desenhaFluxo, gera: geraCDK, velocidade: 2000
    },
    pipeline: {
      canvas: 'cvPipeline', ctl: 'ctlPipeline', cap: 'capPipeline',
      desenha: desenhaFluxo, gera: geraPipeline, velocidade: 1500,
      opcoes: [
        { v: 'ok', rotulo: 'Tudo passa' },
        { v: 'falha', rotulo: 'Teste visual reprova' }
      ]
    },
    waf: {
      canvas: 'cvWaf', ctl: 'ctlWaf', cap: 'capWaf',
      desenha: desenhaWAF, gera: geraWAF, velocidade: 1800,
      opcoes: [
        { v: 'normal', rotulo: 'Tráfego normal' },
        { v: 'ataque', rotulo: 'Tráfego com ataque' }
      ]
    }
  };

  function monta(nome) {
    const cfg = ANIMACOES[nome];
    if (!cfg || !document.getElementById(cfg.canvas)) return;
    ED.criaAnimacao(cfg);
  }

  global.DSA = { monta };
})(window);
