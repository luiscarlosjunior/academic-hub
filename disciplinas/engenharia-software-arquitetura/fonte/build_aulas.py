#!/usr/bin/env python3
"""Gerador das aulas de Engenharia de Software, Arquitetura e Programação.

Lê aulas/NN-slug.md e grava disciplinas/engenharia-software-arquitetura/topicos/NN-slug.html.
Sintaxe suportada (além de Markdown básico: títulos, listas, tabelas, código, negrito, itálico, links):

  ---                         cabeçalho com metadados (title, desc, icon, topic)
  ## Título {fa-icone}       seção (vira item do sumário)
  > [!info] Título            destaque (info | tip | warn | ok)
  :::run caminho.py           executa exemplos/caminho.py e mostra código + saída REAL
  :::mapa                     insere o mapa de todos os testes da página
  :::quiz ID | dif | tema     teste de múltipla escolha (linhas P:, A), *B) correta, X: explicação)
  :::exercicio ID | dif | tema    exercício discursivo; ':::gabarito' separa a resolução
  :::anim                     animação (chaves: canvas, ctl, cap, desenha, gera, velocidade, opcoes)
  :::                         fecha um bloco
"""
import html
import os
import re
import subprocess
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
AULAS = os.path.join(BASE, 'aulas')
EXEMPLOS = os.path.join(BASE, 'exemplos')
DESTINO = os.path.join(BASE, '..', 'topicos')

TESTES = []      # registro de todos os testes da página
ANIMS = []       # animações a registrar no script final
MAPA_TOKEN = '\x01MAPA\x01'

ICONES = {
    'quiz': 'fa-circle-question', 'exercicio': 'fa-pen-ruler',
}


def inline(s):
    codigos = []

    def guarda(m):
        codigos.append(m.group(1))
        return '\x00%d\x00' % (len(codigos) - 1)

    s = re.sub(r'`([^`]+)`', guarda, s)
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<![\w*])\*([^*\n]+?)\*(?![\w*])', r'<em>\1</em>', s)
    s = re.sub(r'\[([^\]]+)\]\((https?://[^)\s]+)\)',
               r'<a href="\2" target="_blank" rel="noopener" class="text-sky-400 hover:underline">\1</a>', s)
    s = re.sub(r'\x00(\d+)\x00',
               lambda m: '<code>' + html.escape(codigos[int(m.group(1))], quote=False) + '</code>', s)
    return s


def bloco_run(caminho):
    """Executa o exemplo com Python isolado e devolve código + saída real."""
    arq = os.path.join(EXEMPLOS, caminho)
    with open(arq, encoding='utf-8') as f:
        codigo = f.read()
    r = subprocess.run([sys.executable, '-I', arq], capture_output=True, text=True, timeout=20)
    saida = r.stdout + (('\n[stderr]\n' + r.stderr) if r.stderr.strip() else '')
    saida = saida.rstrip('\n')
    return (
        '<div class="ah-card p-4 mt-4">'
        '<p class="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">'
        '<i class="fa-brands fa-python mr-1"></i>Exemplo executável · ' + html.escape(caminho) + '</p>'
        '<pre class="ah-code"><code>' + html.escape(codigo.rstrip('\n')) + '</code></pre>'
        '<p class="text-xs uppercase tracking-wider text-emerald-400 font-bold mt-3 mb-2">'
        '<i class="fa-solid fa-terminal mr-1"></i>Saída real (python3 ' + str(r.returncode and 'erro' or 'ok') + ')</p>'
        '<pre class="ah-code"><code>' + html.escape(saida) + '</code></pre></div>'
    )


def renderiza(linhas, sec_ref):
    out = []
    par = []
    i = 0

    def fecha_par():
        if par:
            out.append('<p>' + inline(' '.join(x.strip() for x in par)) + '</p>')
            par.clear()

    while i < len(linhas):
        ln = linhas[i]
        s = ln.rstrip()
        t = s.strip()

        if t.startswith('```'):
            fecha_par()
            buf = []
            i += 1
            while i < len(linhas) and not linhas[i].strip().startswith('```'):
                buf.append(linhas[i])
                i += 1
            i += 1
            out.append('<pre class="ah-code"><code>' + html.escape('\n'.join(buf)) + '</code></pre>')
            continue

        if t.startswith(':::run '):
            fecha_par()
            out.append(bloco_run(t[len(':::run '):].strip()))
            i += 1
            continue

        if t == ':::mapa':
            fecha_par()
            out.append(MAPA_TOKEN)
            i += 1
            continue

        if t.startswith(':::quiz '):
            fecha_par()
            partes = [p.strip() for p in t[len(':::quiz '):].split('|')]
            tid, dif, tema = partes[0], partes[1] if len(partes) > 1 else '2', partes[2] if len(partes) > 2 else ''
            perg, opcoes, correta, expl = '', [], None, ''
            i += 1
            while i < len(linhas) and linhas[i].strip() != ':::':
                l2 = linhas[i].strip()
                if l2.startswith('P:'):
                    perg = l2[2:].strip()
                elif re.match(r'^\*?[A-Z]\)', l2):
                    marca = l2.startswith('*')
                    txt = re.sub(r'^\*?[A-Z]\)\s*', '', l2)
                    if marca:
                        correta = len(opcoes)
                    opcoes.append(txt)
                elif l2.startswith('X:'):
                    expl = l2[2:].strip()
                i += 1
            i += 1
            assert correta is not None, 'quiz ' + tid + ' sem resposta marcada com *'
            TESTES.append({'id': tid, 'tipo': 'Teste de múltipla escolha', 'tema': tema, 'dif': dif, 'sec': sec_ref[0]})
            out.append(
                '<div class="ah-quiz ah-card p-5 mt-4" data-answer="%d">' % correta +
                '<p class="ah-quiz-q text-sm text-white font-semibold mb-3">'
                '<span class="ah-badge ah-badge-slate mr-2">' + html.escape(tid) + '</span>' + inline(perg) + '</p>' +
                ''.join('<button class="ah-quiz-opt">' + inline(o) + '</button>' for o in opcoes) +
                '<p class="ah-quiz-exp text-xs text-emerald-300 mt-3">' + inline(expl) + '</p></div>'
            )
            continue

        if t.startswith(':::exercicio '):
            fecha_par()
            partes = [p.strip() for p in t[len(':::exercicio '):].split('|')]
            tid, dif, tema = partes[0], partes[1] if len(partes) > 1 else '2', partes[2] if len(partes) > 2 else ''
            TESTES.append({'id': tid, 'tipo': 'Exercício discursivo', 'tema': tema, 'dif': dif, 'sec': sec_ref[0]})
            i += 1
            enunc, gab = [], []
            alvo = enunc
            while i < len(linhas) and linhas[i].strip() != ':::':
                if linhas[i].strip() == ':::gabarito':
                    alvo = gab
                else:
                    alvo.append(linhas[i])
                i += 1
            i += 1
            out.append(
                '<div class="ah-card p-5 mt-4"><p class="text-sm text-white font-semibold mb-2">'
                '<span class="ah-badge ah-badge-slate mr-2">' + html.escape(tid) + '</span>Exercício · dificuldade ' +
                html.escape(dif) + '/3</p><div class="ah-prose">' + ''.join(renderiza(enunc, sec_ref)) + '</div>' +
                '<details class="mt-3"><summary class="cursor-pointer text-sm text-emerald-300 font-semibold">'
                'Ver gabarito</summary><div class="ah-prose mt-3">' + ''.join(renderiza(gab, sec_ref)) + '</div></details></div>'
            )
            continue

        if t == ':::anim':
            fecha_par()
            cfg = {}
            i += 1
            while i < len(linhas) and linhas[i].strip() != ':::':
                if ':' in linhas[i]:
                    k, v = linhas[i].strip().split(':', 1)
                    cfg[k.strip()] = v.strip()
                i += 1
            i += 1
            ANIMS.append(cfg)
            out.append(
                '<div class="ah-stage" style="height:300px"><canvas id="%s" style="height:300px"></canvas></div>'
                '<div id="%s" class="mt-4"></div>'
                '<div id="%s" class="ah-card p-4 mt-3 text-sm text-slate-300 leading-relaxed min-h-[4.5rem]"></div>'
                % (cfg['canvas'], cfg['ctl'], cfg['cap'])
            )
            continue

        if t.startswith('## '):
            fecha_par()
            sec_ref[0] = re.sub(r'\s*\{fa-[\w-]+\}\s*$', '', t[3:]).strip()
            out.append('\x02SECAO\x02' + t[3:])
            i += 1
            continue

        if t.startswith('### '):
            fecha_par()
            out.append('<h3 class="ah-h3 mt-6">' + inline(t[4:]) + '</h3>')
            i += 1
            continue

        if t.startswith('>'):
            fecha_par()
            m = re.match(r'>\s*\[!(info|tip|warn|ok)\]\s*(.*)', t)
            tipo, titulo = ('info', '')
            corpo = []
            if m:
                tipo, titulo = m.group(1), m.group(2)
            else:
                corpo.append(t[1:].strip())
            i += 1
            while i < len(linhas) and linhas[i].strip().startswith('>'):
                corpo.append(linhas[i].strip()[1:].strip())
                i += 1
            ico = {'info': 'fa-circle-info', 'tip': 'fa-lightbulb', 'warn': 'fa-triangle-exclamation', 'ok': 'fa-circle-check'}[tipo]
            cab = '<strong>' + inline(titulo) + '</strong> ' if titulo else ''
            out.append('<div class="ah-callout ah-callout-%s mt-5"><i class="fa-solid %s"></i><div>%s%s</div></div>'
                       % (tipo, ico, cab, inline(' '.join(corpo))))
            continue

        if t.startswith('|'):
            fecha_par()
            linhas_tab = []
            while i < len(linhas) and linhas[i].strip().startswith('|'):
                linhas_tab.append(linhas[i].strip())
                i += 1
            cab = [c.strip() for c in linhas_tab[0].strip('|').split('|')]
            corpo = [[c.strip() for c in r.strip('|').split('|')] for r in linhas_tab[2:]]
            h = '<div class="overflow-x-auto ah-card mt-4"><table class="ah-table"><thead><tr>'
            h += ''.join('<th>' + inline(c) + '</th>' for c in cab) + '</tr></thead><tbody>'
            for r in corpo:
                h += '<tr>' + ''.join('<td>' + inline(c) + '</td>' for c in r) + '</tr>'
            out.append(h + '</tbody></table></div>')
            continue

        if re.match(r'^\s*- ', ln):
            fecha_par()
            itens = []
            while i < len(linhas) and re.match(r'^\s*- ', linhas[i]):
                itens.append(re.sub(r'^\s*- ', '', linhas[i]))
                i += 1
                while i < len(linhas) and linhas[i].startswith('  ') and linhas[i].strip() and not re.match(r'^\s*- ', linhas[i]):
                    itens[-1] += ' ' + linhas[i].strip()
                    i += 1
            out.append('<ul>' + ''.join('<li>' + inline(x) + '</li>' for x in itens) + '</ul>')
            continue

        if re.match(r'^\d+\. ', t):
            fecha_par()
            itens = []
            while i < len(linhas) and re.match(r'^\d+\. ', linhas[i].strip()):
                itens.append(re.sub(r'^\d+\. ', '', linhas[i].strip()))
                i += 1
            out.append('<ol>' + ''.join('<li>' + inline(x) + '</li>' for x in itens) + '</ol>')
            continue

        if not t:
            fecha_par()
            i += 1
            continue

        par.append(ln)
        i += 1

    fecha_par()
    return out


def monta(md_path):
    with open(md_path, encoding='utf-8') as f:
        texto = f.read()
    partes = texto.split('\n---\n', 1)
    meta = {}
    for ln in partes[0].splitlines():
        if ':' in ln and ln.strip() and not ln.startswith(' '):
            k, v = ln.split(':', 1)
            meta[k.strip()] = v.strip()
    corpo = partes[1].splitlines() if len(partes) > 1 else []

    TESTES.clear()
    ANIMS.clear()
    sec_ref = ['Visão geral']
    # Renderiza primeiro para coletar seções e testes; depois monta as seções
    bruto = renderiza(corpo, sec_ref)

    secoes = []  # (titulo, icone, slug, html)
    atual = None
    pre = []
    for item in bruto:
        if item.startswith('\x02SECAO\x02'):
            resto = item[len('\x02SECAO\x02'):]
            m = re.match(r'^(.*?)\s*\{(fa-[\w-]+)\}\s*$', resto)
            titulo, icone = (m.group(1), m.group(2)) if m else (resto, 'fa-book-open')
            slug = re.sub(r'[^a-z0-9]+', '-', titulo.lower()
                          .replace('á', 'a').replace('â', 'a').replace('ã', 'a').replace('à', 'a')
                          .replace('é', 'e').replace('ê', 'e').replace('í', 'i').replace('ó', 'o')
                          .replace('ô', 'o').replace('õ', 'o').replace('ú', 'u').replace('ç', 'c')).strip('-')
            atual = {'titulo': titulo, 'icone': icone, 'slug': slug, 'html': []}
            secoes.append(atual)
        elif atual is None:
            pre.append(item)
        else:
            atual['html'].append(item)

    corpo_html = ''
    for s in secoes:
        corpo_html += (
            '<section id="%s" data-toc="%s" class="ah-card p-6 sm:p-8 ah-reveal">'
            '<h2 class="ah-h2 mb-3"><i class="fa-solid %s text-emerald-400 mr-2"></i>%s</h2>'
            '<div class="ah-prose">%s</div></section>\n'
            % (s['slug'], html.escape(s['titulo'], quote=True), s['icone'], inline(s['titulo']), '\n'.join(s['html']))
        )

    # mapa de testes
    linhas_mapa = []
    if TESTES:
        linhas_mapa.append('<div class="overflow-x-auto ah-card mt-4"><table class="ah-table"><thead><tr>'
                           '<th>ID</th><th>Tipo</th><th>Tema</th><th>Dificuldade</th><th>Seção</th></tr></thead><tbody>')
        for t in TESTES:
            linhas_mapa.append('<tr><td>%s</td><td>%s</td><td>%s</td><td>%s/3</td><td>%s</td></tr>'
                               % (html.escape(t['id']), html.escape(t['tipo']), inline(t['tema']),
                                  html.escape(t['dif']), html.escape(t['sec'])))
        linhas_mapa.append('</tbody></table></div>')
        linhas_mapa.append('<p class="text-sm text-slate-400 mt-3">Total: %d testes (%d de múltipla escolha, %d discursivos).</p>'
                           % (len(TESTES), sum(1 for t in TESTES if 'múltipla' in t['tipo']),
                              sum(1 for t in TESTES if 'Exercício' in t['tipo'])))
    corpo_html = corpo_html.replace(MAPA_TOKEN, ''.join(linhas_mapa))

    # animações
    script_anims = ''
    tem_anim = bool(ANIMS)
    for a in ANIMS:
        opc = ''
        if 'opcoes' in a:
            pares = [p.strip() for p in a['opcoes'].split(';') if p.strip()]
            opc = ',\n      opcoes: [' + ', '.join("{ v: '%s', rotulo: '%s' }" % tuple(x.strip() for x in p.split('=', 1))
                                                 for p in pares) + ']'
        script_anims += (
            "  ED.criaAnimacao({\n    canvas: '%s', ctl: '%s', cap: '%s',\n    desenha: ENG.%s, gera: ENG.%s, velocidade: %s%s\n  });\n"
            % (a['canvas'], a['ctl'], a['cap'], a['desenha'], a['gera'], a.get('velocidade', '2600'), opc)
        )

    titulo = meta.get('title', 'Aula')
    desc = meta.get('desc', '')
    icone_doc = meta.get('favicon', '🏭')
    topic = meta['topic']
    scripts = '<script src="../../../assets/js/data.js"></script>\n<script src="../../../assets/js/hub.js"></script>\n'
    if tem_anim:
        scripts += ('<script src="../../../assets/js/estrutura-dados.js"></script>\n'
                    '<script src="../../../assets/js/engenharia.js"></script>\n<script>\n(function () {\n  \'use strict\';\n\n'
                    + script_anims + '})();\n</script>\n')

    pagina = f'''<!DOCTYPE html>
<html lang="pt-BR" data-root="../../../">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(titulo)} · Engenharia de Software, Arquitetura e Programação · AcademicHub</title>
<meta name="description" content="{html.escape(desc, quote=True)}">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../../assets/css/hub.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>{icone_doc}</text></svg>">
</head>
<body class="min-h-full flex flex-col" data-topic="{html.escape(topic)}">

<header id="ah-header" class="bg-slate-800/80 backdrop-blur border-b border-slate-700/80 sticky top-0 z-50"></header>

<section class="ah-grid-bg border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="ah-topic-hero"></div>
</section>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 w-full">

  <aside class="lg:col-span-3 order-2 lg:order-1 ah-no-print">
    <div class="lg:sticky lg:top-20">
      <p class="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2 px-3">Nesta página</p>
      <nav id="ah-toc" class="space-y-0.5"></nav>
    </div>
  </aside>

  <main class="lg:col-span-9 order-1 lg:order-2 space-y-8 min-w-0">

{corpo_html}
  </main>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full ah-no-print" id="ah-topic-nav"></div>

<footer id="ah-footer" class="border-t border-slate-800 bg-slate-900/60"></footer>

{scripts}</body>
</html>
'''
    return meta, pagina


def main():
    arquivos = sys.argv[1:] or sorted(f for f in os.listdir(AULAS) if f.endswith('.md'))
    for nome in arquivos:
        caminho = nome if os.path.isabs(nome) else os.path.join(AULAS, nome)
        meta, pagina = monta(caminho)
        destino = os.path.join(DESTINO, os.path.basename(caminho).replace('.md', '.html'))
        with open(destino, 'w', encoding='utf-8') as f:
            f.write(pagina)
        print('ok', os.path.basename(destino), 'testes:', len(TESTES), 'animacoes:', len(ANIMS))


if __name__ == '__main__':
    main()
