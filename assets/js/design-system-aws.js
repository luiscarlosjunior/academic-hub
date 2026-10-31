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

  /* ===================================================================
     6. TÓPICOS 10 A 16: rede, dados, serverless, operação, performance,
     governança e projeto integrador. Todos reaproveitam desenhaFluxo.
     =================================================================== */
  function geraVPC(opcao) {
    const errado = opcao === 'errado';
    const nos = [
      { nome: 'Internet', sub: 'usuário' },
      { nome: 'ALB', sub: 'sub-rede pública' },
      { nome: 'App', sub: 'sub-rede privada' },
      { nome: 'Banco', sub: errado ? 'sub-rede pública' : 'sub-rede isolada' }
    ];
    const quadros = [
      { nos, foco: 0, ate: 0, t: 'O tráfego chega pela internet ao Internet Gateway, que liga a VPC à internet.' },
      { nos, foco: 1, ate: 1, t: 'O balanceador (ALB) fica numa sub-rede pública: é o único ponto exposto, com Security Group que aceita só a porta 443.' },
      { nos, foco: 2, ate: 2, t: 'A aplicação fica numa sub-rede privada. Ela aceita tráfego só do Security Group do ALB e não tem IP público.' }
    ];
    if (errado) {
      quadros.push({ nos, foco: 3, ate: 3, erro: 3,
        t: 'Erro de desenho: o banco numa sub-rede pública, com a porta aberta ao mundo. Qualquer origem pode tentar a conexão.' });
    } else {
      quadros.push({ nos, foco: 3, ate: 3,
        t: 'O banco fica numa sub-rede isolada, sem rota para a internet. Só o Security Group da aplicação alcança a porta.' });
    }
    return quadros;
  }

  function geraBanco(opcao) {
    const nos = [
      { nome: 'App', sub: 'aplicação' },
      { nome: 'Primário', sub: 'escrita' },
      { nome: 'Standby', sub: 'Multi-AZ, síncrono' },
      { nome: 'Réplica', sub: 'leitura, assíncrona' }
    ];
    const quadros = [
      { nos, foco: 0, ate: 0, t: 'A aplicação envia a escrita ao primário, o único nó que aceita gravações.' },
      { nos, foco: 1, ate: 1, t: 'O primário replica cada transação de forma síncrona para o standby, em outra zona de disponibilidade, antes de confirmar.' }
    ];
    if (opcao === 'falha') {
      quadros.push({ nos, foco: 1, ate: 1, erro: 1,
        t: 'O primário falha: a zona dele cai e a aplicação perde a conexão de escrita.' });
      quadros.push({ nos, foco: 2, ate: 2,
        t: 'O Multi-AZ promove o standby a primário. O endpoint do banco é atualizado, e a aplicação volta a escrever sem mudança de código.' });
    } else {
      quadros.push({ nos, foco: 3, ate: 3,
        t: 'Leituras podem ir a réplicas. A replicação é assíncrona, então a réplica pode estar alguns instantes atrás do primário.' });
    }
    return quadros;
  }

  function geraServerless(opcao) {
    const frio = opcao === 'frio';
    const nos = [
      { nome: 'Cliente', sub: 'requisição HTTP' },
      { nome: 'API Gateway', sub: 'HTTP API' },
      { nome: 'Lambda', sub: frio ? 'cold start' : 'ambiente quente' },
      { nome: 'DynamoDB', sub: 'leitura e escrita' }
    ];
    return [
      { nos, foco: 0, ate: 0, t: 'O cliente chama uma rota HTTP. Nada precisa estar rodando antes da chamada: o custo existe só quando há invocações.' },
      { nos, foco: 1, ate: 1, t: 'O API Gateway valida o pedido, aplica autenticação e encaminha o evento à função.' },
      { nos, foco: 2, ate: 2, t: frio
          ? 'Sem ambiente pronto, a Lambda cria um (cold start). Essa espera acontece antes do seu código e aparece na latência da primeira chamada.'
          : 'Há um ambiente já inicializado: o handler roda de imediato, e o cliente do banco criado fora do handler é reaproveitado.' },
      { nos, foco: 3, ate: 3, t: 'A função lê ou grava no DynamoDB com uma chave conhecida. Acesso por chave tem latência baixa e previsível.' },
      { nos, foco: 2, ate: 3, t: 'A resposta volta pelo mesmo caminho. O ambiente fica quente por algum tempo e atende as próximas chamadas sem o atraso inicial.' }
    ];
  }

  function geraObservabilidade(opcao) {
    const incidente = opcao === 'incidente';
    const nos = [
      { nome: 'App', sub: 'métricas e logs' },
      { nome: 'CloudWatch', sub: 'métricas e logs' },
      { nome: 'Alarme', sub: 'duas janelas' },
      { nome: 'Notificação', sub: 'SNS e e-mail' },
      { nome: 'Runbook', sub: 'passo a passo' }
    ];
    const quadros = [
      { nos, foco: 0, ate: 0, t: 'A aplicação emite métricas (latência, erros) e logs estruturados. Sem medição não há como decidir nada.' },
      { nos, foco: 1, ate: 1, t: 'O CloudWatch guarda as métricas e permite consultar os logs com Logs Insights.' }
    ];
    if (incidente) {
      quadros.push({ nos, foco: 2, ate: 2, erro: 2, t: 'A taxa de erros 5xx passa de 5% em duas janelas seguidas: o alarme entra em estado de ALARME.' });
      quadros.push({ nos, foco: 3, ate: 3, erro: 2, t: 'A notificação chega ao plantão com o nome do alarme e o link do runbook.' });
      quadros.push({ nos, foco: 4, ate: 4, erro: 2, t: 'O runbook guia o diagnóstico: conferir o último deploy, o cache e a origem antes de qualquer ação.' });
    } else {
      quadros.push({ nos, foco: 2, ate: 2, t: 'O alarme compara a métrica com o limiar e só muda de estado após duas janelas seguidas. Assim, um erro isolado não gera alerta.' });
    }
    return quadros;
  }

  function geraFrontend(opcao) {
    const lento = opcao === 'lento';
    const nos = [
      { nome: 'Código', sub: 'componentes' },
      { nome: 'Build', sub: 'divide em partes' },
      { nome: 'CDN', sub: 'entrega do cache' },
      { nome: 'Navegador', sub: 'renderiza' },
      { nome: 'Medição', sub: 'RUM e Web Vitals' }
    ];
    if (lento) {
      return [
        { nos, foco: 0, ate: 0, t: 'Todos os componentes entram num pacote só, porque nada foi dividido por rota.' },
        { nos, foco: 1, ate: 1, t: 'Sem divisão de código, o navegador baixa o pacote inteiro antes de pintar a primeira tela.' },
        { nos, foco: 2, ate: 2, t: 'A CDN entrega o arquivo, mas ele é grande: o tempo até o maior elemento da tela (LCP) cresce.' },
        { nos, foco: 3, ate: 3, erro: 3, t: 'LCP acima de 2,5 s é classificado como “precisa de melhoria”. O usuário espera olhando para uma tela vazia.' },
        { nos, foco: 4, ate: 4, erro: 3, t: 'O RUM mostra o problema por página e por país, para priorizar a correção.' }
      ];
    }
    return [
      { nos, foco: 0, ate: 0, t: 'Os componentes são organizados por rota, e cada tela declara do que depende.' },
      { nos, foco: 1, ate: 1, t: 'O build divide o código por rota. Tabelas pesadas entram com import() preguiçoso, só quando são exibidas.' },
      { nos, foco: 2, ate: 2, t: 'Arquivos com hash têm cache longo, e o HTML principal continua pequeno.' },
      { nos, foco: 3, ate: 3, t: 'A primeira tela chega com menos bytes: o LCP fica dentro de 2,5 s e o INP abaixo de 200 ms.' },
      { nos, foco: 4, ate: 4, t: 'O RUM confirma a melhoria em dados reais e alimenta o orçamento de performance do time.' }
    ];
  }

  function geraGovernanca(opcao) {
    const nos = [
      { nome: 'Descoberta', sub: 'conhece o DS' },
      { nome: 'Adoção', sub: 'usa o pacote' },
      { nome: 'Contribuição', sub: 'abre RFC' },
      { nome: 'Revisão', sub: 'core team' },
      { nome: 'Release', sub: 'publicada' }
    ];
    if (opcao === 'parado') {
      return [
        { nos, foco: 0, ate: 0, t: 'Times conhecem o design system, mas a documentação não explica como propor mudanças.' },
        { nos, foco: 1, ate: 1, t: 'Os times usam o pacote, porém quando precisam de algo novo, não há caminho claro de contribuição.' },
        { nos, foco: 2, ate: 2, erro: 2, t: 'Nenhuma RFC chega: cada time cria o próprio componente. A adoção estagna e o sistema perde relevância.' }
      ];
    }
    return [
      { nos, foco: 0, ate: 0, t: 'Times descobrem o design system pela documentação publicada e pelo onboarding.' },
      { nos, foco: 1, ate: 1, t: 'Usam o pacote em produtos reais, e a medição de adoção mostra onde estão.' },
      { nos, foco: 2, ate: 2, t: 'Quando falta um componente, o time abre uma RFC com problema, alternativas e impacto.' },
      { nos, foco: 3, ate: 3, t: 'O core team decide em prazo combinado, e a decisão fica registrada.' },
      { nos, foco: 4, ate: 4, t: 'A mudança entra numa versão com changelog, e o ciclo recomeça com mais adoção.' }
    ];
  }

  function geraProjeto() {
    const nos = [
      { nome: 'Requisitos', sub: 'público e marca' },
      { nome: 'Tokens', sub: 'primitivos' },
      { nome: 'Componentes', sub: 'API e a11y' },
      { nome: 'Hospedagem', sub: 'S3 + CF' },
      { nome: 'Pipeline', sub: 'OIDC' },
      { nome: 'Operação', sub: 'SLO e alarme' }
    ];
    return [
      { nos, foco: 0, ate: 0, t: 'Comece pelos requisitos: quem usa o sistema, em quais produtos e com qual marca. Eles decidem o escopo.' },
      { nos, foco: 1, ate: 1, t: 'Defina os tokens primitivos e semânticos. Nenhum componente deve usar cor literal.' },
      { nos, foco: 2, ate: 2, t: 'Construa os componentes com API tipada, estados acessíveis e história no Storybook.' },
      { nos, foco: 3, ate: 3, t: 'Publique a documentação em S3 e CloudFront com OAC, e o domínio no Route 53.' },
      { nos, foco: 4, ate: 4, t: 'Automatize o pipeline com testes, teste visual e deploy por OIDC, com aprovação para produção.' },
      { nos, foco: 5, ate: 5, t: 'Defina SLO, alarmes e runbook. O projeto só está completo quando a operação é observável.' }
    ];
  }

  Object.assign(ANIMACOES, {
    vpc: {
      canvas: 'cvVpc', ctl: 'ctlVpc', cap: 'capVpc',
      desenha: desenhaFluxo, gera: geraVPC, velocidade: 2200,
      opcoes: [
        { v: 'correto', rotulo: 'Desenho correto' },
        { v: 'errado', rotulo: 'Banco em sub-rede pública' }
      ]
    },
    banco: {
      canvas: 'cvBanco', ctl: 'ctlBanco', cap: 'capBanco',
      desenha: desenhaFluxo, gera: geraBanco, velocidade: 2200,
      opcoes: [
        { v: 'normal', rotulo: 'Operação normal' },
        { v: 'falha', rotulo: 'Falha do primário' }
      ]
    },
    serverless: {
      canvas: 'cvServerless', ctl: 'ctlServerless', cap: 'capServerless',
      desenha: desenhaFluxo, gera: geraServerless, velocidade: 2200,
      opcoes: [
        { v: 'quente', rotulo: 'Ambiente quente' },
        { v: 'frio', rotulo: 'Cold start' }
      ]
    },
    observabilidade: {
      canvas: 'cvObservabilidade', ctl: 'ctlObservabilidade', cap: 'capObservabilidade',
      desenha: desenhaFluxo, gera: geraObservabilidade, velocidade: 2200,
      opcoes: [
        { v: 'normal', rotulo: 'Sem incidente' },
        { v: 'incidente', rotulo: 'Taxa de 5xx alta' }
      ]
    },
    frontend: {
      canvas: 'cvFrontend', ctl: 'ctlFrontend', cap: 'capFrontend',
      desenha: desenhaFluxo, gera: geraFrontend, velocidade: 2200,
      opcoes: [
        { v: 'lento', rotulo: 'Pacote único (lento)' },
        { v: 'otimizado', rotulo: 'Dividido por rota' }
      ]
    },
    governanca: {
      canvas: 'cvGovernanca', ctl: 'ctlGovernanca', cap: 'capGovernanca',
      desenha: desenhaFluxo, gera: geraGovernanca, velocidade: 2200,
      opcoes: [
        { v: 'saudavel', rotulo: 'Contribuições fluem' },
        { v: 'parado', rotulo: 'Sem caminho de contribuição' }
      ]
    },
    projeto: {
      canvas: 'cvProjeto', ctl: 'ctlProjeto', cap: 'capProjeto',
      desenha: desenhaFluxo, gera: geraProjeto, velocidade: 2200
    }
  });

  /* ===================================================================
     7. TÓPICO 17: Well-Architected Framework. Os seis pilares e o ciclo
     de revisão, ambos com desenhaFluxo.
     =================================================================== */
  function geraWaPilares() {
    const nos = [
      { nome: 'Operação', sub: 'observar' },
      { nome: 'Segurança', sub: 'proteger' },
      { nome: 'Confiança', sub: 'recuperar' },
      { nome: 'Desempenho', sub: 'dimensionar' },
      { nome: 'Custos', sub: 'pagar o justo' },
      { nome: 'Ambiente', sub: 'reduzir' }
    ];
    const textos = [
      'Excelência operacional: executar e observar o sistema para entregar valor e melhorar continuamente. Pergunta-chave: como saberíamos que o sistema está saudável?',
      'Segurança: proteger dados e sistemas com identidade forte, criptografia e detecção. Pergunta-chave: quem pode fazer o quê, e como perceberíamos um acesso indevido?',
      'Confiabilidade: cumprir a função esperada mesmo diante de falhas, com recuperação testada. Pergunta-chave: o que acontece quando um componente deixa de responder?',
      'Eficiência de desempenho: usar recursos compatíveis com a demanda. Pergunta-chave: o recurso escolhido ainda é adequado para a carga atual?',
      'Otimização de custos: evitar gastos sem retorno, sem perder o valor entregue. Pergunta-chave: estamos pagando por capacidade que ninguém usa?',
      'Sustentabilidade: reduzir o impacto ambiental da carga de trabalho. Pergunta-chave: o consumo de energia e de recursos é o mínimo necessário?'
    ];
    return textos.map((t, k) => ({ nos, foco: k, ate: k, t }));
  }

  function geraWaCiclo(opcao) {
    const so = opcao === 'so-custo';
    const nos = [
      { nome: 'Escopo', sub: 'a carga' },
      { nome: 'Avaliar', sub: so ? 'só custos' : 'seis pilares' },
      { nome: 'Riscos', sub: 'priorizar' },
      { nome: 'Plano', sub: 'dono e prazo' },
      { nome: 'Medir', sub: 'antes e depois' }
    ];
    if (so) {
      return [
        { nos, foco: 0, ate: 0, t: 'Delimita-se a carga de trabalho que será revisada: a aplicação, seus dados e seus usuários.' },
        { nos, foco: 1, ate: 1, t: 'A avaliação se restringe ao pilar de custos, por ser o mais visível na fatura mensal.' },
        { nos, foco: 2, ate: 2, erro: 2, t: 'Sem avaliação de segurança e de confiabilidade, o quadro de riscos fica incompleto. Um vazamento ou uma queda regional não aparecem.' }
      ];
    }
    return [
      { nos, foco: 0, ate: 0, t: 'Delimita-se a carga de trabalho que será revisada: a aplicação, seus dados e seus usuários.' },
      { nos, foco: 1, ate: 1, t: 'Cada um dos seis pilares é avaliado com perguntas objetivas, registrando-se o que foi encontrado.' },
      { nos, foco: 2, ate: 2, t: 'Os achados viram riscos, classificados por impacto e probabilidade, para que o trabalho siga a ordem de prioridade.' },
      { nos, foco: 3, ate: 3, t: 'Cada risco recebe uma ação, um responsável e um prazo. Sem dono, o plano não se executa.' },
      { nos, foco: 4, ate: 4, t: 'A medição compara o estado antes e depois da mudança, o que confirma a melhoria e alimenta a próxima revisão.' }
    ];
  }

  Object.assign(ANIMACOES, {
    wapilares: {
      canvas: 'cvWaPilares', ctl: 'ctlWaPilares', cap: 'capWaPilares',
      desenha: desenhaFluxo, gera: geraWaPilares, velocidade: 2600
    },
    waciclo: {
      canvas: 'cvWaCiclo', ctl: 'ctlWaCiclo', cap: 'capWaCiclo',
      desenha: desenhaFluxo, gera: geraWaCiclo, velocidade: 2400,
      opcoes: [
        { v: 'completo', rotulo: 'Revisão completa' },
        { v: 'so-custo', rotulo: 'Somente custos' }
      ]
    }
  });

  /* ===================================================================
     8. TÓPICO 18: padrões corporativos. Cada padrão é um fluxo de nós
     reaproveitando desenhaFluxo; os estados mudam no sublabel.
     =================================================================== */
  function geraEstrangulador() {
    const nos = (sub, novo) => [
      { nome: 'Cliente', sub: 'navegador' },
      { nome: 'Roteador', sub: 'CloudFront / ALB' },
      { nome: 'Legado', sub: sub },
      { nome: 'Novo', sub: novo }
    ];
    return [
      { nos: nos('100% do tráfego', 'ainda não existe'), foco: 0, ate: 0,
        t: 'Todo o tráfego atravessa o sistema legado. Nenhuma funcionalidade foi movida ainda.' },
      { nos: nos('100% do tráfego', 'pronto, sem tráfego'), foco: 2, ate: 2,
        t: 'Um roteador é colocado na frente do sistema. Ele mantém o comportamento atual, e por isso a mudança é segura.' },
      { nos: nos('70% do tráfego', '30% do tráfego'), foco: 3, ate: 3,
        t: 'Uma funcionalidade é reescrita. Parte das requisições passa a ser atendida pelo novo serviço, e os resultados são comparados.' },
      { nos: nos('desativado', '100% do tráfego'), foco: 3, ate: 3,
        t: 'Concluída a validação, o legado é desativado. O sistema antigo é estrangulado gradualmente, sem uma troca de uma só vez.' }
    ];
  }

  function geraFanout(opcao) {
    const falha = opcao === 'falha';
    const nos = [
      { nome: 'Pedido', sub: 'API' },
      { nome: 'SNS', sub: 'tópico' },
      { nome: 'Fila', sub: 'estoque' },
      { nome: 'Fila', sub: 'faturamento' },
      { nome: 'Fila', sub: 'e-mail' }
    ];
    const quadros = [
      { nos, foco: 0, ate: 0, t: 'O pedido é criado e a API publica um evento no tópico. A API não conhece os consumidores.' },
      { nos, foco: 1, ate: 1, t: 'O tópico replica a mensagem para cada assinante. Cada fila recebe uma cópia independente.' },
      { nos, foco: 2, ate: 2, t: 'Cada consumidor processa no próprio ritmo. Um consumidor lento não atrasa os demais.' }
    ];
    if (falha) {
      quadros.push({ nos, foco: 4, ate: 4, erro: 4,
        t: 'O consumidor de e-mail falha repetidamente. Após o limite de tentativas, a mensagem vai para uma fila de mensagens mortas, para análise.' });
    } else {
      quadros.push({ nos, foco: 4, ate: 4,
        t: 'Todas as filas são processadas. Os serviços não se conhecem e podem ser evoluídos separadamente.' });
    }
    return quadros;
  }

  function geraSaga(opcao) {
    const nos = [
      { nome: 'Reservar', sub: 'estoque' },
      { nome: 'Cobrar', sub: 'pagamento' },
      { nome: 'Emitir', sub: 'nota fiscal' },
      { nome: 'Enviar', sub: 'confirmação' }
    ];
    if (opcao === 'falha-cobranca') {
      return [
        { nos, foco: 0, ate: 0, t: 'A saga começa reservando o estoque. Cada passo é uma transação local, com efeito imediato.' },
        { nos, foco: 1, ate: 1, erro: 1, t: 'A cobrança é recusada. Não há transação global que desfaça a reserva automaticamente.' },
        { nos, foco: 0, ate: 0, erro: 1, t: 'Compensação: a reserva de estoque é liberada por uma ação inversa. O sistema volta a um estado consistente.' }
      ];
    }
    return [
      { nos, foco: 0, ate: 0, t: 'A saga começa reservando o estoque. Cada passo é uma transação local, com efeito imediato.' },
      { nos, foco: 1, ate: 1, t: 'O pagamento é cobrado. Se algum passo seguinte falhar, a cobrança também terá uma compensação.' },
      { nos, foco: 2, ate: 2, t: 'A nota fiscal é emitida pelo serviço fiscal, em sua própria transação local.' },
      { nos, foco: 3, ate: 3, t: 'A confirmação é enviada ao cliente. Todos os passos foram concluídos, sem transação distribuída.' }
    ];
  }

  function geraDisjuntor(opcao) {
    const estavel = opcao === 'estavel';
    const nos = (disj) => [
      { nome: 'Chamada', sub: 'requisição' },
      { nome: 'Disjuntor', sub: disj },
      { nome: 'Serviço', sub: 'externo' },
      { nome: 'Fallback', sub: 'resposta padrão' }
    ];
    if (estavel) {
      return [
        { nos: nos('fechado'), foco: 0, ate: 0, t: 'As chamadas passam normalmente pelo disjuntor, que está fechado.' },
        { nos: nos('fechado'), foco: 2, ate: 2, t: 'O serviço externo responde dentro do tempo limite. O disjuntor registra o sucesso e permanece fechado.' }
      ];
    }
    return [
      { nos: nos('fechado'), foco: 0, ate: 0, t: 'As chamadas passam pelo disjuntor, que está fechado e conta as falhas recentes.' },
      { nos: nos('contando falhas'), foco: 2, ate: 2, erro: 2, t: 'O serviço externo excede o tempo limite com frequência. Ao atingir o limiar de falhas, o disjuntor se prepara para abrir.' },
      { nos: nos('aberto'), foco: 3, ate: 3, erro: 1, t: 'O disjuntor abre. As chamadas não chegam ao serviço, e o fallback responde de imediato, protegendo o sistema.' },
      { nos: nos('meio-aberto'), foco: 1, ate: 1, t: 'Após um intervalo, o disjuntor permite algumas chamadas de teste. Se elas tiverem sucesso, ele volta a fechar.' }
    ];
  }

  Object.assign(ANIMACOES, {
    estrangulador: {
      canvas: 'cvEstrangulador', ctl: 'ctlEstrangulador', cap: 'capEstrangulador',
      desenha: desenhaFluxo, gera: geraEstrangulador, velocidade: 2600
    },
    fanout: {
      canvas: 'cvFanout', ctl: 'ctlFanout', cap: 'capFanout',
      desenha: desenhaFluxo, gera: geraFanout, velocidade: 2200,
      opcoes: [
        { v: 'normal', rotulo: 'Processamento normal' },
        { v: 'falha', rotulo: 'Consumidor com falha' }
      ]
    },
    saga: {
      canvas: 'cvSaga', ctl: 'ctlSaga', cap: 'capSaga',
      desenha: desenhaFluxo, gera: geraSaga, velocidade: 2400,
      opcoes: [
        { v: 'sucesso', rotulo: 'Pedido concluído' },
        { v: 'falha-cobranca', rotulo: 'Cobrança recusada' }
      ]
    },
    disjuntor: {
      canvas: 'cvDisjuntor', ctl: 'ctlDisjuntor', cap: 'capDisjuntor',
      desenha: desenhaFluxo, gera: geraDisjuntor, velocidade: 2400,
      opcoes: [
        { v: 'estavel', rotulo: 'Serviço estável' },
        { v: 'instavel', rotulo: 'Serviço instável' }
      ]
    }
  });

  /* ===================================================================
     9. ANIMAÇÕES DE CONCEITO (uma por tópico, na seção de teoria).
     Um renderizador genérico desenha rótulos, setas e destaques. Cada
     quadro informa quais rótulos estão em destaque, o texto explicativo
     e, opcionalmente, o rótulo que representa um erro.
     =================================================================== */
  const CONCEITOS = {
    '01': { titulo: 'Como as camadas de um design system se relacionam',
      rotulos: ['Princípios', 'Fundamentos', 'Componentes', 'Padrões', 'Documentação'],
      con: [[0, 1], [1, 2], [2, 3], [3, 4]],
      quadros: [
        [[0], 'Os princípios orientam todas as decisões. Sem eles, cada componente vira uma escolha isolada.'],
        [[1], 'Os fundamentos (cores, tipografia e espaçamento) formam a base visual, traduzida em tokens.'],
        [[2], 'Os componentes combinam fundamentos em peças reutilizáveis, com API e estados definidos.'],
        [[3], 'Os padrões compõem componentes para resolver tarefas do usuário, como um formulário de cadastro.'],
        [[4], 'A documentação ensina o uso correto de cada camada. Sem ela, o sistema só existe para quem o criou.']
      ] },
    '02': { titulo: 'Como um token propaga uma mudança',
      rotulos: ['blue.600 (primitivo)', 'action.primary (semântico)', 'Botão (componente)', 'Tema escuro (semântico)'],
      con: [[0, 1], [1, 2], [1, 3]],
      quadros: [
        [[0], 'O primitivo guarda o valor bruto: o azul de referência da marca.'],
        [[1], 'O semântico dá intenção: "ação principal" aponta para o primitivo.'],
        [[2], 'O componente pede apenas o semântico, nunca o valor literal.'],
        [[1, 3], 'Para o tema escuro, o semântico aponta para outro primitivo. O componente não precisa mudar.']
      ] },
    '03': { titulo: 'Os princípios POUR da WCAG 2.2',
      rotulos: ['Perceptível', 'Operável', 'Compreensível', 'Robusto'],
      con: [],
      quadros: [
        [[0], 'Perceptível: a informação chega por mais de um canal, e o texto mantém contraste de pelo menos 4,5:1.'],
        [[1], 'Operável: tudo funciona com teclado, com foco visível e alvos de pelo menos 24 px.'],
        [[2], 'Compreensível: o texto é claro, e as mensagens de erro indicam como corrigir.'],
        [[3], 'Robusto: o componente é interpretado de forma consistente por tecnologias assistivas, graças ao HTML semântico e ao ARIA.']
      ] },
    '04': { titulo: 'Por que o nome com hash permite cache longo',
      rotulos: ['index.html (sem hash)', 'app.3f9c1a.js', 'app.7b21d0.js (nova versão)'],
      con: [[0, 1]],
      quadros: [
        [[0], 'O index.html tem sempre o mesmo nome. Por isso precisa ser revalidado a cada visita.'],
        [[1], 'Após um build, o script recebe um hash no nome. Enquanto o conteúdo não muda, o nome não muda.'],
        [[2], 'Uma nova versão tem outro nome. A borda não entrega o arquivo antigo, e o cache pode durar um ano.']
      ] },
    '05': { titulo: 'O que cada número de versão comunica',
      rotulos: ['1.4.2 (atual)', '1.4.3 (patch)', '1.5.0 (minor)', '2.0.0 (major)'],
      con: [[0, 1], [0, 2], [0, 3]],
      quadros: [
        [[0], 'Ponto de partida: a versão 1.4.2, usada por produtos com o intervalo ^1.4.2.'],
        [[1], 'Patch: correção sem mudança de API. O consumidor recebe a versão automaticamente.'],
        [[2], 'Minor: funcionalidade nova e compatível. Também entra no intervalo ^1.4.2.'],
        [[3], 'Major: quebra de compatibilidade. Fica fora do intervalo ^1.4.2 e exige migração.', 3]
      ] },
    '06': { titulo: 'Por que o pipeline começa pelo mais barato',
      rotulos: ['Lint (segundos)', 'Testes (minutos)', 'Teste visual (minutos)', 'Deploy (minutos)'],
      con: [[0, 1], [1, 2], [2, 3]],
      quadros: [
        [[0], 'O lint é o passo mais barato. Se ele falha, nenhum outro passo é executado.'],
        [[0, 1], 'Os testes unitários só rodam quando o lint passa, economizando tempo de execução.'],
        [[0, 1, 2], 'O teste visual é mais lento, por isso vem depois dos testes rápidos.'],
        [[1], 'Os testes falham: o pipeline para aqui e nada chega ao deploy.', 1]
      ] },
    '07': { titulo: 'A árvore de construtos em CDK',
      rotulos: ['App (raiz)', 'Stack (pilha)', 'Bucket (L2)', 'Distribution (L2)', 'CfnBucket (L1)'],
      con: [[0, 1], [1, 2], [1, 3], [2, 4]],
      quadros: [
        [[0], 'O App é a raiz do programa. Ele pode conter várias stacks.'],
        [[1], 'A Stack é a unidade de deploy. Ela vira uma pilha do CloudFormation.'],
        [[2, 3], 'Os constructos L2 trazem padrões seguros, como o OAC já configurado.'],
        [[4], 'O L1 é a tradução direta do recurso do CloudFormation, sem padrões adicionais.']
      ] },
    '08': { titulo: 'Quem protege o quê na responsabilidade compartilhada',
      rotulos: ['Hardware e data centers (AWS)', 'Rede física (AWS)', 'Serviços gerenciados (AWS)', 'Identidade e acesso (cliente)', 'Dados e criptografia (cliente)', 'Configuração de acesso (cliente)'],
      con: [],
      quadros: [
        [[0, 1, 2], 'Segurança DA nuvem: a AWS protege a infraestrutura e os serviços gerenciados.'],
        [[3, 4, 5], 'Segurança NA nuvem: o cliente configura identidades, dados e opções de acesso.'],
        [[5], 'Um bucket público é um erro de configuração, portanto responsabilidade do cliente.', 5]
      ] },
    '09': { titulo: 'Como distribuir o estudo em quatro semanas',
      rotulos: ['Semana 1: base', 'Semana 2: arquitetura', 'Semana 3: automação', 'Semana 4: simulado'],
      con: [[0, 1], [1, 2], [2, 3]],
      quadros: [
        [[0], 'A semana 1 cria o vocabulário: serviços, responsabilidade compartilhada e custos.'],
        [[1], 'A semana 2 aprofunda a arquitetura: rede, dados e escalabilidade.'],
        [[2], 'A semana 3 cobre automação: pipelines, infraestrutura como código e implantação.'],
        [[3], 'A semana 4 consolida o conteúdo com simulados e com a revisão de cada erro.']
      ] },
    '10': { titulo: 'O que cada tipo de sub-rede permite',
      rotulos: ['Internet', 'Sub-rede pública (IGW)', 'Sub-rede privada (NAT)', 'Sub-rede isolada (sem saída)'],
      con: [[0, 1], [2, 0]],
      quadros: [
        [[1], 'A sub-rede pública tem rota para o Internet Gateway, e por isso recursos podem receber tráfego de fora.'],
        [[2], 'A sub-rede privada sai para a internet pelo NAT. Ela inicia conexões, mas não recebe conexões iniciadas de fora.'],
        [[3], 'A sub-rede isolada não tem rota para a internet. É o lugar adequado para o banco de dados.'],
        [[1], 'Erro comum: um banco numa sub-rede pública fica exposto, mesmo com senha forte.', 1]
      ] },
    '11': { titulo: 'Classes de armazenamento: custo de guardar versus custo de acesso',
      rotulos: ['S3 Standard (acesso frequente)', 'Standard-IA (acesso raro)', 'Glacier Instant (arquivo)', 'Deep Archive (arquivo raro)'],
      con: [],
      quadros: [
        [[0], 'A classe Standard tem o maior custo de guarda e o menor custo de leitura.'],
        [[1], 'A Standard-IA é mais barata para guardar, mas cobra por recuperação.'],
        [[2], 'As classes de arquivo custam menos por GB, com recuperação em minutos.'],
        [[3], 'O Deep Archive guarda ao menor custo, com recuperação mais lenta. Cada classe troca um custo pelo outro.']
      ] },
    '12': { titulo: 'O ciclo de vida de um ambiente Lambda',
      rotulos: ['Evento chega', 'Ambiente criado (cold start)', 'Handler executa', 'Ambiente reutilizado (warm)'],
      con: [[0, 1], [1, 2], [2, 3]],
      quadros: [
        [[0], 'Um evento chega. Se não há ambiente disponível, a plataforma precisa criar um.'],
        [[1], 'A criação do ambiente é o cold start. Essa espera aparece na primeira chamada.'],
        [[2], 'O handler executa. O código carregado fora do handler já fica pronto para as chamadas seguintes.'],
        [[3], 'As chamadas seguintes reutilizam o ambiente quente, com latência menor.']
      ] },
    '13': { titulo: 'SLI, SLO e orçamento de erro',
      rotulos: ['SLI: 99,95% medido', 'SLO: meta de 99,9%', 'Orçamento: 43,2 min/mês', 'Consumido: 30 min'],
      con: [[0, 1], [1, 2], [2, 3]],
      quadros: [
        [[0], 'O SLI é a medida observada: a fração de requisições bem-sucedidas no período.'],
        [[1], 'O SLO é a meta acordada para o SLI, por exemplo 99,9% em 30 dias.'],
        [[2], 'O orçamento de erro é a diferença: 0,1% de 43.200 minutos, ou 43,2 minutos.'],
        [[3], 'Consumidos 30 minutos, restam 13,2. Quando o orçamento acaba, a prioridade passa a ser a estabilidade.']
      ] },
    '14': { titulo: 'Os três Core Web Vitals',
      rotulos: ['LCP (carregamento)', 'INP (interação)', 'CLS (estabilidade)'],
      con: [],
      quadros: [
        [[0], 'O LCP mede quando o maior elemento da tela aparece. Bom até 2,5 s.'],
        [[1], 'O INP mede a latência de uma interação até a próxima pintura. Bom até 200 ms.'],
        [[2], 'O CLS mede deslocamentos inesperados de elementos. Bom até 0,1.'],
        [[0, 1, 2], 'As três são medidas juntas: melhorar uma pode piorar outra, como o carregamento antecipado de scripts pesados.']
      ] },
    '15': { titulo: 'O ciclo de governança de um design system',
      rotulos: ['Proposta (RFC)', 'Revisão pelo core team', 'Decisão registrada', 'Release com changelog', 'Adoção pelos produtos'],
      con: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
      quadros: [
        [[0], 'Uma proposta nasce de um problema real enfrentado por um produto.'],
        [[1], 'O core team avalia as alternativas e o impacto sobre quem usa.'],
        [[2], 'A decisão fica registrada, com o motivo e as alternativas recusadas.'],
        [[3], 'A mudança sai numa versão, com changelog que explica o que fazer.'],
        [[4], 'A adoção revela novos problemas e gera novas propostas. O ciclo se repete.']
      ] },
    '16': { titulo: 'Como a rubrica distribui os pontos',
      rotulos: ['Tokens (15)', 'Componentes e a11y (20)', 'Hospedagem e IaC (15)', 'Pipeline e segurança (20)', 'Operação (15)', 'Documentação e governança (15)'],
      con: [],
      quadros: [
        [[0, 1, 2, 3, 4, 5], 'Os seis pesos somam 100 pontos. Cada área exige uma evidência verificável.'],
        [[1, 3], 'Componentes e pipeline pesam mais, porque são as áreas de maior risco quando mal feitas.'],
        [[4, 5], 'Operação e documentação mostram se outra pessoa consegue manter o projeto.'],
        [[0], 'Nenhuma área pode ficar sem evidência: sem evidência, o nível cai, por melhor que o trabalho pareça.']
      ] },
    '17': { titulo: 'Um trade-off em movimento',
      rotulos: ['Criptografia (+ segurança)', 'Custo (+ gasto)', 'Latência (+ tempo)'],
      con: [[0, 1], [0, 2]],
      quadros: [
        [[0], 'Aumentar a criptografia melhora a segurança dos dados.'],
        [[0, 1], 'Mas a criptografia de todos os dados aumenta o custo de chaves e de processamento.'],
        [[0, 2], 'E introduz uma pequena latência adicional. A decisão é um trade-off explícito, não uma regra fixa.']
      ] },
    '18': { titulo: 'Como a idempotência neutraliza mensagens repetidas',
      rotulos: ['Evento recebido', 'Já processado? (consulta)', 'Processa e registra', 'Ignora repetição'],
      con: [[0, 1], [1, 2], [1, 3]],
      quadros: [
        [[0], 'Um evento pode chegar mais de uma vez, por exemplo após um tempo limite.'],
        [[1], 'O consumidor verifica o identificador do evento num registro de processados.'],
        [[2], 'Se o evento é novo, ele é processado e o identificador é registrado.'],
        [[3], 'Se já foi processado, o evento é ignorado. O resultado final é o mesmo de uma única entrega.']
      ] }
  };

  function quebraTexto(texto, max) {
    const palavras = texto.split(' ');
    const linhas = [];
    let atual = '';
    palavras.forEach(p => {
      const teste = atual ? atual + ' ' + p : p;
      if (teste.length > max && atual) { linhas.push(atual); atual = p; }
      else atual = teste;
    });
    if (atual) linhas.push(atual);
    return linhas;
  }

  function saidaCaixa(dx, dy, bw, bh) {
    const fx = Math.abs(dx) > 1e-6 ? (bw / 2) / Math.abs(dx) : Infinity;
    const fy = Math.abs(dy) > 1e-6 ? (bh / 2) / Math.abs(dy) : Infinity;
    return Math.min(fx, fy);
  }

  function desenhaConceito(ctx, w, h, q) {
    limpa(ctx, w, h);
    const n = q.rotulos.length;
    const cols = n <= 3 ? n : (n === 4 ? 4 : 3);
    const rows = Math.ceil(n / cols);
    const celW = (w - 40) / cols, celH = (h - 24) / rows;
    const bw = Math.min(170, celW - 24), bh = Math.min(72, celH - 24);
    const pos = q.rotulos.map((_, i) => ({
      x: 20 + (i % cols) * celW + (celW - bw) / 2,
      y: 12 + Math.floor(i / cols) * celH + (celH - bh) / 2
    }));
    const destaque = q.d || [];

    (q.con || []).forEach(([a, b]) => {
      const A = pos[a], B = pos[b];
      const ax = A.x + bw / 2, ay = A.y + bh / 2, bx = B.x + bw / 2, by = B.y + bh / 2;
      const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
      const ux = dx / L, uy = dy / L;
      const sa = saidaCaixa(ux, uy, bw, bh) + 3;
      seta(ctx, ax + ux * sa, ay + uy * sa, bx - ux * sa, by - uy * sa,
        destaque.includes(b) ? CORES.verde : CORES.mudo);
    });

    q.rotulos.forEach((r, i) => {
      const s = i === q.erro ? ESTILO.erro : (destaque.includes(i) ? ESTILO.ativo : ESTILO.normal);
      const p = pos[i];
      AH.roundRect(ctx, p.x, p.y, bw, bh, 8);
      ctx.fillStyle = s.fill; ctx.fill();
      ctx.strokeStyle = s.borda; ctx.lineWidth = s.lw; ctx.stroke();
      const linhas = quebraTexto(r, 20);
      const lh = 15, y0 = p.y + bh / 2 - ((linhas.length - 1) * lh) / 2;
      ctx.fillStyle = s.txt;
      ctx.font = '600 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      linhas.forEach((l, k) => ctx.fillText(l, p.x + bw / 2, y0 + k * lh));
    });
  }

  function geraConceito(chave) {
    const c = CONCEITOS[chave];
    return c.quadros.map(([d, t, erro]) => ({
      rotulos: c.rotulos, con: c.con, d, t, erro
    }));
  }

  Object.keys(CONCEITOS).forEach(chave => {
    const n = chave;
    ANIMACOES['con' + n] = {
      canvas: 'cvCon' + n, ctl: 'ctlCon' + n, cap: 'capCon' + n,
      desenha: desenhaConceito, gera: () => geraConceito(n), velocidade: 2400
    };
  });

  function monta(nome) {
    const cfg = ANIMACOES[nome];
    if (!cfg || !document.getElementById(cfg.canvas)) return;
    ED.criaAnimacao(cfg);
  }

  /* Permite que outras disciplinas registrem animações de conceito sem
     copiar o renderizador. spec: { canvas, rotulos, con, quadros }, onde
     canvas é o id do elemento e os controles seguem o prefixo ctl/cap. */
  function criaConceito(nome, spec) {
    CONCEITOS[nome] = spec;
    ANIMACOES[nome] = {
      canvas: spec.canvas,
      ctl: spec.canvas.replace('cv', 'ctl'),
      cap: spec.canvas.replace('cv', 'cap'),
      desenha: desenhaConceito,
      gera: () => geraConceito(nome),
      velocidade: 2400
    };
  }

  global.DSA = { monta, criaConceito };
})(window);
