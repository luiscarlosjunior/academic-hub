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

### 🗄️ Modelagem de Dados e SQL — 15 tópicos em três trilhas

Do modelo entidade-relacionamento às consultas avançadas. Todos os exemplos de SQL rodam **de verdade no navegador** (SQLite compilado para WebAssembly via sql.js), sobre o mesmo banco de uma loja virtual (clientes, produtos, pedidos, itens e funcionários). Cada tópico tem um editor “Experimente” e problemas com solução executável.

**Trilha 1 — Modelagem de Dados (5 tópicos)**

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 01 | Bancos de dados e modelos de dados | Animação: o mesmo endereço em três planilhas, e o ACID numa transferência com falha |
| 02 | Modelo Entidade-Relacionamento (MER) | Montagem do diagrama passo a passo, com cardinalidades |
| 03 | Relacionamentos avançados | Do N:N à entidade associativa; auto-relacionamento e especialização |
| 04 | Modelo relacional e mapeamento ER → tabelas | Relação pela lente da teoria; chave estrangeira com verificação ligada |
| 05 | Normalização: 1FN, 2FN, 3FN e FNBC | Decomposição passo a passo e as três anomalias |

**Trilha 2 — SQL: do básico ao intermediário (6 tópicos)**

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 06 | DDL, tipos e restrições de integridade | CREATE TABLE e a recusa de cada tipo de restrição |
| 07 | Consultas básicas: SELECT, filtros e NULL | Pipeline σ (WHERE) e π (SELECT) animado; lógica de três valores |
| 08 | DML e transações | Compra com estoque insuficiente: BEGIN, UPDATE condicional e ROLLBACK |
| 09 | Agregação: GROUP BY e HAVING | Agrupamento em baldes animado |
| 10 | Junções: INNER, LEFT, RIGHT, FULL, CROSS e auto-junção | Os seis tipos de junção sobre as mesmas tabelas |
| 11 | Subconsultas e CTEs | Subconsulta que resolve primeiro e alimenta a consulta externa |

**Trilha 3 — SQL Avançado (4 tópicos)**

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 12 | Funções de janela: OVER, PARTITION BY e frames | ROW_NUMBER por partição, passo a passo |
| 13 | Consultas recursivas e hierarquias | Iteração até o ponto fixo sobre o organograma |
| 14 | Índices, planos de execução e otimização | Busca numa B-tree e leitura de EXPLAIN QUERY PLAN |
| 15 | Transações, isolamento e concorrência | Atualização perdida animada; níveis de isolamento |


### 🏭 Engenharia de Software, Arquitetura e Programação para a Indústria — 13 tópicos em três trilhas

Da engenharia de software à prática de um time profissional: processos, requisitos, testes e qualidade; atributos, estilos e evolução de arquiteturas; e as práticas de programação que separam o projeto acadêmico do código de equipe. Cada tópico traz teoria em níveis crescentes, exemplos, boas práticas, problemas comuns e uma animação controlável.

**Trilha 1 — Engenharia de Software (4 tópicos)**

| # | Tópico | Animação |
|---|--------|----------|
| 01 | Processos de software: cascata, incremental, espiral e ágil | Cascata × entrega incremental, com retrabalho |
| 02 | Requisitos: levantamento, especificação e rastreabilidade | Do adjetivo vago ao requisito testável |
| 03 | Testes de software: pirâmide, tipos e o que um teste prova | Execução da pirâmide, com o defeito que aparece tarde |
| 04 | Qualidade, refatoração e dívida técnica | Juros da dívida sprint a sprint, com e sem refatoração |

**Trilha 2 — Arquitetura de Software (4 tópicos)**

| # | Tópico | Animação |
|---|--------|----------|
| 05 | Atributos de qualidade, trade-offs e ADR | O vencedor muda conforme os pesos dos atributos |
| 06 | Estilos arquiteturais: camadas, hexagonal e monólito modular | Requisição atravessando o núcleo e os adaptadores |
| 07 | Integração: APIs, filas, eventos e mensagens mortas | Evento, falha, retentativa e DLQ |
| 08 | Evolução: documentação C4 e Strangler Fig | Migração gradual do monólito para novos serviços |

**Trilha 3 — Programação: da academia à indústria (5 tópicos)**

| # | Tópico | Animação |
|---|--------|----------|
| 09 | Do projeto acadêmico ao time: Git, branches e revisão de código | Ciclo de branch, pull request e merge |
| 10 | Código legível e robusto: nomes, funções, erros e logs | Pipeline de validação que barra o erro |
| 11 | Testes automatizados e TDD: vermelho, verde, refatorar | Ciclo do TDD com a regra da situação do aluno |
| 12 | Entrega contínua: CI/CD, containers e “pronto para produção” | Pipeline com portões, aprovação manual e falha |
| 13 | Erros frequentes e conceitos do dia a dia | Coletânea com causa e correção, e método para investigar um erro novo (sem animação) |

### 📊 Análise de Dados — 14 tópicos em quatro trilhas

Da estatística básica à regressão paramétrica e não paramétrica, passando por testes de hipótese e técnicas multivariadas e de séries temporais. Todos os exemplos de código são em **Python** (numpy, pandas, scipy, statsmodels e scikit-learn), com a saída real do programa exibida em cada página. Cada tópico traz exemplos do dia a dia, definições com autores, a motivação de uso, uma animação e um quiz.

**Trilha 1 — Fundamentos (5 tópicos)**

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 01 | Estatística básica: população, amostra, variáveis e o acaso | Amostragem da população e Lei dos Grandes Números ao vivo |
| 02 | Estatística descritiva: centro, dispersão e posição | Gangorra média × mediana com outlier e boxplot que acompanha |
| 03 | Distribuições e visualização: normal, binomial e TCL | Explorador de distribuições e média de grupos convergindo para a normal |
| 04 | Correlação: Pearson, Spearman e causalidade | Clique para adicionar pontos e ver r e ρ mudarem |
| 05 | Inferência: intervalo de confiança, p-valor, erros e poder | Intervalos de confiança repetidos, em que se vê quem erra |

**Trilha 2 — Testes de hipótese (2 tópicos)**

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 06 | Testes paramétricos: t de Student, pareado e ANOVA | Sinal sobre ruído do teste t e variação entre × dentro dos grupos |
| 07 | Testes não paramétricos: Mann-Whitney, Wilcoxon, Kruskal-Wallis e qui-quadrado | Conversão de valores em postos e observado × esperado |

**Trilha 3 — Regressão (4 tópicos)**

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 08 | Regressão linear simples: mínimos quadrados, resíduos e R² | Ajuste da reta que converge para a solução de mínimos quadrados |
| 09 | Regressão linear múltipla: controle, dummies e multicolinearidade | Ligar e desligar variáveis com coeficientes e VIF recalculados |
| 10 | Regressão logística: probabilidade, chances e odds ratio | Curva em S com corte de decisão e conversão probabilidade → logit |
| 11 | Regressão não paramétrica: Theil-Sen, LOWESS e kNN | Quatro ajustes sobre os mesmos dados, com remoção de outliers |

**Trilha 4 — Estatística avançada (3 tópicos)**

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 12 | Estatística multivariada: PCA e agrupamento k-means | Rotação até os eixos principais e k-means passo a passo |
| 13 | Séries temporais: tendência, sazonalidade e Holt-Winters | Média móvel ajustável e dispersão Yₜ × Yₜ₋ₖ por defasagem |
| 14 | Reamostragem e validação: bootstrap, permutação e validação cruzada | Histograma bootstrap se formando e sobreajuste por grau de polinômio |

### ⚡ Programação Científica de Alto Desempenho — 14 tópicos

Do que limita a velocidade de um programa à programação de GPUs com CUDA. A trilha segue os livros de Hennessy & Patterson (arquitetura), Kirk & Hwu (*Programming Massively Parallel Processors*), Grama et al. (*Introduction to Parallel Computing*) e as especificações de OpenMP, MPI e CUDA. Os exemplos são em **C** (serial, com saída real) e em **CUDA** (checados por sintaxe; ver a nota de execução em cada página).

| # | Tópico | Laboratório interativo |
|---|--------|------------------------|
| 01 | Fundamentos de desempenho: métricas, medição e as leis de Amdahl e Gustafson | Calculadora de Amdahl com curva de speedup |
| 02 | Arquitetura para HPC: hierarquia de memória, cache e localidade | Mesma soma em dois percursos, com a medição real |
| 03 | Otimização serial em C: layout de dados, vetorização e blocking | Três versões de matmul medidas lado a lado |
| 04 | Memória compartilhada com OpenMP: threads, condições de corrida e escalonamento | Exemplos de redução, false sharing e escalonamento |
| 05 | Passagem de mensagens com MPI: comunicação e decomposição de domínio | Simulação de calor com troca de halos |
| 06 | Modelo de desempenho: intensidade aritmética e roofline | Roofline com controles de intensidade, pico e banda |
| 07 | GPUs e o modelo de programação CUDA: kernels, threads e blocos | Soma de vetores completa com eventos e verificação |
| 08 | Hierarquia de memória da GPU: coalescência, memória compartilhada e bank conflicts | Transposição ingênua × com memória compartilhada |
| 09 | Padrões paralelos em CUDA: redução, scan e histograma | Redução em árvore, scan por bloco e histograma com atomicAdd |
| 10 | Multiplicação de matrizes em CUDA: da versão ingênua ao tiling | Verificação contra a CPU e comparação de tempos |
| 11 | Ocupação, divergência, streams e sobreposição de transferências | Cópia e computação em fatias com dois streams |
| 12 | Simulação científica com stencil: equação do calor em CUDA | Malha 512 × 512 com ping-pong e verificação contra a CPU |
| 13 | Multi-GPU e MPI+CUDA: escalando em cluster | Um processo por GPU, halos pelo host e CUDA-aware MPI |
| 14 | Perfilamento e reprodutibilidade: nsys, ncu e um projeto integrador | Roteiro de otimização e projeto final |

### 📝 Metodologia Científica — 17 tópicos em quatro trilhas

Do que torna um conhecimento científico à publicação e à apresentação do trabalho: método, ética, planejamento, análise de dados, normas ABNT e escrita acadêmica. Cada tópico traz teoria, exemplos, práticas, referências a autores e um quiz. A página da disciplina lista os livros de referência.

| # | Tópico | Trilha |
|---|--------|--------|
| 01 | O que é ciência: conhecimento, método e critérios de validade | Fundamentos |
| 02 | Tipos de pesquisa: abordagem, objetivo e procedimento | Fundamentos |
| 03 | Ética e integridade científica: plágio, consentimento e boas práticas | Fundamentos |
| 04 | Tema, problema, objetivos e justificativa | Planejamento |
| 05 | Hipóteses, variáveis e validade | Planejamento |
| 06 | Revisão de literatura e busca bibliográfica | Planejamento |
| 07 | Métodos: população, amostragem e instrumentos de coleta | Planejamento |
| 08 | Análise de dados: quantitativa, qualitativa e cuidados com a estatística | Dados e normas |
| 09 | Citações e referências segundo a ABNT | Dados e normas |
| 10 | Estrutura do artigo científico: IMRaD e o resumo | Escrita e publicação |
| 11 | Escrita acadêmica: clareza, coesão, voz e revisão | Escrita e publicação |
| 12 | Do manuscrito à publicação: revista, revisão por pares e Lattes | Escrita e publicação |
| 13 | Pesquisa qualitativa: entrevistas, observação e análise temática | Dados e normas |
| 14 | Delineamentos experimentais e quase-experimentais | Planejamento |
| 15 | Ciência aberta, reprodutibilidade e gestão de dados | Fundamentos |
| 16 | Do TCC à defesa: cronograma, orientação e estrutura do trabalho | Escrita e publicação |
| 17 | Apresentação oral e pôster científico | Escrita e publicação |

---|--------|--------|
| 01 | O que é ciência: conhecimento, método e critérios de validade | Fundamentos |
| 02 | Tipos de pesquisa: abordagem, objetivo e procedimento | Fundamentos |
| 03 | Ética e integridade científica: plágio, consentimento e boas práticas | Fundamentos |
| 04 | Tema, problema, objetivos e justificativa | Planejamento |
| 05 | Hipóteses, variáveis e validade | Planejamento |
| 06 | Revisão de literatura e busca bibliográfica | Planejamento |
| 07 | Métodos: população, amostragem e instrumentos de coleta | Planejamento |
| 08 | Análise de dados: quantitativa, qualitativa e cuidados com a estatística | Dados e normas |
| 09 | Citações e referências segundo a ABNT | Dados e normas |
| 10 | Estrutura do artigo científico: IMRaD e o resumo | Escrita e publicação |
| 11 | Escrita acadêmica: clareza, coesão, voz e revisão | Escrita e publicação |
| 12 | Do manuscrito à publicação: revista, revisão por pares e Lattes | Escrita e publicação |


---

### 🧮 Teoria da Computação e Complexidade — 20 tópicos em quatro trilhas

Do que pode ser computado ao que custa computar: linguagens e autômatos, gramáticas, máquinas de Turing, indecidibilidade, classes P, NP e além, até o estado de P versus NP. Cada tópico traz teoria, exemplos, código, uma animação passo a passo, práticas, referências a autores e um quiz. A página da disciplina lista os livros de referência.

| # | Tópico | Trilha |
|---|--------|--------|
| 01 | Alfabetos, cadeias e linguagens | Fundamentos |
| 02 | Algoritmos, problemas e a tese de Church-Turing | Fundamentos |
| 03 | Autômatos finitos determinísticos | Autômatos e gramáticas |
| 04 | Autômatos finitos não determinísticos e a construção por subconjuntos | Autômatos e gramáticas |
| 05 | Expressões regulares e o teorema de Kleene | Autômatos e gramáticas |
| 06 | Lema do bombeamento e minimização de AFD | Autômatos e gramáticas |
| 07 | Gramáticas livres de contexto e árvores de derivação | Autômatos e gramáticas |
| 08 | Autômatos com pilha e a equivalência com GLC | Autômatos e gramáticas |
| 09 | Forma normal de Chomsky, bombeamento para GLC e o algoritmo CYK | Autômatos e gramáticas |
| 10 | Máquinas de Turing | Máquinas de Turing e limites |
| 11 | Variantes de máquinas de Turing e a máquina universal | Máquinas de Turing e limites |
| 12 | Hierarquia de Chomsky e os modelos correspondentes | Máquinas de Turing e limites |
| 13 | Indecidibilidade e o problema da parada | Máquinas de Turing e limites |
| 14 | Reduções, o teorema de Rice e o problema de Post | Máquinas de Turing e limites |
| 15 | Funções recursivas, cálculo lambda e equivalência de modelos | Fundamentos |
| 16 | Medindo recursos: tempo, espaço e notação assintótica | Complexidade |
| 17 | As classes P e NP e os verificadores | Complexidade |
| 18 | NP-completude: Cook-Levin e as reduções de Karp | Complexidade |
| 19 | PSPACE, EXPTIME e o teorema de Savitch | Complexidade |
| 20 | Aleatoriedade, aproximação e o estado de P versus NP | Complexidade |


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
│   ├── modelagem-dados-sql/
│   │   ├── index.html
│   │   └── topicos/01-….html … 15-….html
│   ├── engenharia-software-arquitetura/
│   │   ├── index.html
│   │   └── topicos/01-….html … 13-….html
│   └── estrutura-dados/
│       ├── index.html
│       ├── topicos/                 # uma página completa por tópico (11 páginas)
│       └── exemplos-c/              # programas em C de cada tópico (compiláveis com -Wall -Wextra -pedantic)
│   └── infraestrutura-redes/
│       ├── index.html
│       ├── topicos/                 # uma página completa por tópico (16 páginas)
│       └── exemplos-python/         # programas em Python de cada tópico (só biblioteca padrão, saída real na página)
│   └── programacao-cientifica-hpc/
│       ├── index.html
│       ├── topicos/                 # uma página completa por tópico (14 páginas)
│       ├── exemplos-c/              # programas em C de medição, localidade, blocking, OpenMP, MPI e roofline
│       └── exemplos-cuda/           # programas em CUDA dos tópicos 7 a 13 (compilar com nvcc)
│   └── metodologia-cientifica/
│       ├── index.html
│       └── topicos/                 # uma página completa por tópico (17 páginas)
│   └── teoria-computacao/
│       ├── index.html
│       └── topicos/                 # uma página completa por tópico (20 páginas)
│   └── analise-dados/
│       ├── index.html
│       ├── topicos/                 # uma página completa por tópico (14 páginas)
│       └── exemplos-python/         # programas em Python de cada tópico (numpy, pandas, scipy, statsmodels, scikit-learn)
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
