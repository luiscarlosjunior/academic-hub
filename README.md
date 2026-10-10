# AcademicHub

Hub de estudos **interativo** para as disciplinas de graduação: cada tópico traz a teoria explicada em
linguagem direta, uma **animação que o aluno controla** e um desafio rápido de fixação.

Site 100% estático (HTML + CSS + JavaScript), feito para ser publicado no **GitHub Pages**.
Não há build, não há dependência de Node, não há servidor: basta abrir.

---

## Disciplinas

### 🤖 Inteligência Artificial — 16 tópicos

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 01 | Introdução à Inteligência Artificial | Mundo do aspirador, quadrantes da definição, linha do tempo |
| 02 | Lógica Proposicional e de Primeira Ordem | Gerador de tabela-verdade, resolução por refutação, mundo de quantificadores |
| 03 | Busca Cega (largura e profundidade) | BFS / DFS / custo uniforme / aprofundamento iterativo na mesma árvore |
| 04 | Busca Heurística (melhor custo, gulosa, A*) | Mapa da Romênia passo a passo com g, h e f |
| 05 | Sistemas Simbólicos, Evolucionistas e Probabilísticos | Motor de regras, evolução de frases e calculadora de Bayes |
| 06 | Machine Learning | Gradiente descendente ao vivo, overfitting por grau de polinômio, matriz de confusão |
| 07 | Sistemas de Produção | Motor de inferência com encadeamento para frente e para trás |
| 08 | Sistemas Especialistas Baseados em Regras | Diagnóstico com fatores de certeza e explicação “por quê?” |
| 09 | Processamento de Linguagem Natural | Pipeline de pré-processamento e árvores sintáticas animadas |
| 10 | Sistemas Multiagentes | Bando de boids, Contract Net e dilema do prisioneiro evolutivo |
| 11 | Algoritmos Genéticos e Autômatos Celulares | AG em paisagem multimodal, Jogo da Vida e as 256 regras elementares |
| 12 | Otimização por Enxame de Partículas (PSO) | Enxame sobre Rastrigin, Esfera e Himmelblau |
| 13 | Otimização por Colônia de Formigas (ACO) | Caixeiro-viajante com feromônio e evaporação |
| 14 | Redes Neurais Artificiais | Neurônio interativo, perceptron no XOR e MLP com retropropagação |
| 15 | Processamento Estatístico de Linguagem Natural | Modelo de n-gramas, Naive Bayes e TF-IDF |
| 16 | Lógica Fuzzy | Fuzzificação e controlador Mamdani completo com defuzzificação |

### 📐 Modelagem Orientada a Objetos — 22 tópicos em duas trilhas

A disciplina é dividida em duas trilhas, selecionáveis por abas na página da disciplina:

**Trilha 1 — Modelagem UML (13 tópicos)**

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 00 | Modelagem do Zero: do Requisito ao Modelo | Evolução v1 → v4 do modelo Melodia, com diagramas Mermaid |
| 02 | UML: Visão Geral e Tipos de Diagramas | Catálogo navegável dos 14 diagramas |
| 06 | Relacionamentos entre Classes | Seis relações com UML + Java + ciclo de vida animado |
| 07 | Diagrama de Casos de Uso | Diagrama clicável com «include», «extend» e generalização |
| 08 | Diagrama de Classes | **Editor** de diagrama com geração de código Java |
| 09 | Diagrama de Objetos | Alternância entre classes e instantâneo de instâncias |
| 10 | Diagrama de Atividades | Token percorrendo raias, decisão e bifurcação/junção |
| 11 | Diagrama de Sequência | Mensagens, barras de ativação e pilha de execução |
| 12 | Diagrama de Máquina de Estados | Máquina de um Pedido com eventos, guardas e ações |
| 13 | Diagramas de Componentes e Pacotes | Troca de componente e detector de dependência circular |
| 14 | Diagrama de Implantação | Três topologias: monolito, três camadas e nuvem |
| 17 | Diagramas de Comunicação e Estrutura Composta | Numeração com aninhamento e partes/portas de um elemento |
| 18 | Diagrama de Temporização | Linha do tempo em escala com restrições de duração |

**Trilha 2 — POO em Java (9 tópicos)**

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 01 | Introdução à POO e à Modelagem | Instanciação de objetos a partir de uma classe |
| — | Classes e Objetos em Java | Molde × instância, `new`, identidade e construtores |
| — | Atributos e Operações em Java | Visibilidade, `static`, derivados e comando × consulta |
| 03 | Abstração e Encapsulamento | Duas contas lado a lado: com e sem encapsulamento |
| — | Associação, Agregação e Composição em Java | Album (composição) × Playlist (agregação) no código |
| 04 | Herança e Polimorfismo | Despacho dinâmico passo a passo |
| 05 | Classes Abstratas e Interfaces | “Compilador” que valida a declaração montada |
| 15 | Do Diagrama ao Código | Tradutor UML → Java / C# / Python |
| 16 | Princípios de Projeto (SOLID) | Antes e depois de cada princípio |

**Disciplina — Estrutura de Dados (11 tópicos)**

| # | Tópico | Conteúdo |
|---|--------|----------|
| 01 | Complexidade: tempo, espaço e Big-O | Notação O/Ω/Θ, regras de cálculo, contadores em C, exercícios |
| 02 | Vetores | Memória contígua, vetor dinâmico, operações em C, inversão, rotação, Kadane |
| 03 | Matrizes | Fórmula do índice, percursos, transposta, produto, espiral, rotação in place |
| 04 | Ordenação | Bolha, seleção, inserção, quicksort, merge sort, contagem; anagramas, inversões |
| 05 | Busca | Linear, binária (iterativa e recursiva), lower_bound, busca sobre a resposta |
| 06 | Filas | Buffer circular, fila encadeada, round-robin, fila com duas pilhas |
| 07 | Pilhas | Parênteses, RPN, shunting-yard, pilha com mínimo, pilha monotônica |
| 08 | Tabelas hash | Espalhamento, encadeamento, sondagem linear, redimensionamento |
| 09 | Árvores binárias de busca | Inserção, remoção com sucessor, percursos, validação de BST |
| 10 | Grafos | Lista de adjacências, BFS, DFS, componentes, Dijkstra, topológica |
| 11 | Padrões de resolução de problemas | Roteiro de seis passos e os principais padrões, com código |

**Disciplina — Infraestrutura de Redes (16 tópicos, com casos da indústria em cada um)**

| # | Tópico | Conteúdo |
|---|--------|----------|
| 01 | Modelos em camadas: OSI, TCP/IP e encapsulamento | Sete e quatro camadas, unidades de dados, princípios de projeto e a pilha em animação |
| 02 | Camada física e de enlace | Transmissão, propagação e a razão *a*, CRC-32, ARQ, Go-Back-N e repetição seletiva |
| 03 | Ethernet, switches e VLANs | Quadro e MAC, aprendizado, flood, spanning tree e 802.1Q |
| 04 | Endereçamento IPv4, sub-redes, CIDR e ARP | Máscara, cálculo de sub-redes, envio direto ou gateway e resolução de endereços |
| 05 | Roteamento | Tabela de encaminhamento, vetor de distância e contagem ao infinito, Dijkstra, BGP |
| 06 | Transporte: UDP, TCP, handshake e janela | Portas, handshake de três vias, ACK cumulativo, retransmissão e encerramento |
| 07 | Controle de congestionamento e QoS | Slow start, AIMD, Tahoe × Reno, bufferbloat, DiffServ e balde de fichas |
| 08 | Camada de aplicação: DNS, HTTP e HTTP/3 | Hierarquia e cache do DNS, cabeçalho Host, HTTP/2 e QUIC |
| 09 | Segurança: criptografia, TLS, firewall e VPN | CIA, Diffie-Hellman, certificados, handshake do TLS 1.3, firewall e VPN |
| 10 | NAT, DHCP e IPv6 | NAPT, Discover–Offer–Request–Ack, compressão e EUI-64 |
| 11 | Redes avançadas: SDN, NFV e leaf-spine | Planos de controle e de dados, tabelas de fluxos, oversubscription e ECMP |
| 12 | Redes em cloud e diagnóstico | VPC, rotas, grupos de segurança × ACLs, traceroute e método por camadas |
| 13 | Balanceamento de carga e alta disponibilidade | Camadas 4 e 7, consistent hashing, health checks com histerese, VRRP e anycast |
| 14 | CDN e computação de borda | Cauda pesada de popularidade, cache com TTL e ETag, purga e latência |
| 15 | Observabilidade de rede | Percentis e caudas, orçamento de erro de SLO, IPFIX e detecção de anomalias |
| 16 | Redes para IA e HPC | RDMA, all-reduce em anel, InfiniBand e RoCE, congestionamento de fabric |

---

## Como publicar no GitHub Pages

1. Faça o push deste repositório para o GitHub.
2. Vá em **Settings → Pages**.
3. Em *Source*, escolha **Deploy from a branch**; em *Branch*, escolha `main` e a pasta `/ (root)`.
4. Salve. Em poucos minutos o site estará em
   `https://<seu-usuario>.github.io/academic-hub/`.

Não é necessário nenhum passo de build.

---

## Estrutura do projeto

```
academic-hub/
├── index.html                       # página inicial do hub
├── assets/
│   ├── css/hub.css                  # design system (tema escuro, cards, tabelas, animações)
│   └── js/
│       ├── data.js                  # catálogo de disciplinas e tópicos (fonte única de verdade)
│       ├── hub.js                   # cabeçalho, sumário, progresso, quiz, utilitários de canvas
│       └── disciplina.js            # renderização das páginas de disciplina
├── disciplinas/
│   ├── inteligencia-artificial/
│   │   ├── index.html
│   │   └── topicos/01-….html … 16-….html
│   ├── modelagem-poo/
│   │   ├── index.html
│   │   └── topicos/01-….html … 16-….html
│   └── estrutura-dados/
│       ├── index.html
│       ├── topicos/                 # uma página completa por tópico (11 páginas)
│       └── exemplos-c/              # programas em C de cada tópico (compiláveis com -Wall -Wextra -pedantic)
│   └── infraestrutura-redes/
│       ├── index.html
│       ├── topicos/                 # uma página completa por tópico (16 páginas)
│       └── exemplos-python/         # programas em Python de cada tópico (só biblioteca padrão, saída real na página)
└── simuladores/
    ├── busca-cega-visual.html       # laboratório BFS × DFS em tela cheia
    └── busca-heuristica-visual.html # laboratório gulosa × A* em tela cheia
```

### Decisões de arquitetura

- **`assets/js/data.js` é a fonte única de verdade.** A home, as páginas de disciplina, o sumário lateral
  e a navegação “anterior / próximo” de cada tópico são construídos a partir dele.
- **Cada página de tópico é autocontida:** todo o código da animação vive na própria página. Isso mantém o
  carregamento leve e permite editar um tópico sem risco de afetar os demais.
- **Progresso do aluno** fica em `localStorage`, apenas no navegador dele. Nada é enviado a servidor algum.
- **Acessibilidade:** a folha de estilo respeita `prefers-reduced-motion`; quem tem animações desativadas
  no sistema recebe as páginas sem movimento.

---

## Como acrescentar um novo tópico

1. Acrescente a entrada em `assets/js/data.js`, dentro da disciplina desejada:

   ```js
   { id: '17-meu-topico', titulo: 'Meu Tópico', icone: 'fa-star',
     resumo: 'Uma frase explicando o que o aluno vai aprender.',
     tags: ['Tag'], nivel: 'Intermediário', minutos: 15 }
   ```

2. Crie `disciplinas/<slug>/topicos/17-meu-topico.html` copiando a estrutura de um tópico existente.
   O essencial:

   ```html
   <html lang="pt-BR" data-root="../../../">
   <body data-topic="ia/17-meu-topico">
     <header id="ah-header"></header>
     <section><div id="ah-topic-hero"></div></section>
     <aside><nav id="ah-toc"></nav></aside>
     <main>
       <section id="ideia" data-toc="Título no sumário">…</section>
     </main>
     <div id="ah-topic-nav"></div>
     <footer id="ah-footer"></footer>
   ```

   O `hub.js` monta cabeçalho, hero, sumário, botão de conclusão, navegação e rodapé sozinho.
   Toda `<section>` com `id` e `data-toc` entra automaticamente no sumário lateral.

3. Para acrescentar uma **nova disciplina**, basta um novo objeto em `data.js` e uma cópia de
   `disciplinas/<slug>/index.html` com `data-disciplina="<id>"` no `<body>`.

---

## Componentes disponíveis

Classes do `hub.css` prontas para uso nas páginas:

| Classe | Uso |
|--------|-----|
| `ah-card` · `ah-card-hover` | Cartão padrão, com ou sem elevação no hover |
| `ah-badge` (`-emerald`, `-amber`, `-rose`, `-sky`, `-slate`) | Etiquetas coloridas |
| `ah-callout` (`-info`, `-ok`, `-warn`, `-tip`) | Caixas de destaque com ícone |
| `ah-code` + `.kw .fn .str .num .cm .ty` | Bloco de código com realce de sintaxe manual |
| `ah-table` | Tabela com cabeçalho fixo e hover |
| `ah-stage` | Palco escuro para canvas e SVG |
| `ah-quiz` + `ah-quiz-opt` + `ah-quiz-exp` | Quiz declarativo (o `hub.js` cuida do comportamento) |
| `ah-timeline` | Linha do tempo vertical |
| `ah-progress` | Barra de progresso |
| `ah-reveal` | Aparece ao entrar na viewport |

E do `hub.js`: `AH.canvas(id, draw)` (canvas com retina e resize), `AH.loop(el, step)`
(animação que pausa fora da tela), `AH.roundRect`, `AH.arrow`, `AH.clamp`, `AH.lerp`, `AH.rand`.

---

## Créditos

Material de apoio das disciplinas de graduação, complementar ao repositório
[aulas-graduacao](https://github.com/luiscarlosjunior/aulas-graduacao).
