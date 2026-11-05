title: Estilos arquiteturais: camadas, arquitetura hexagonal, monólito modular e microsserviços
desc: Aula de estilos arquiteturais: arquitetura em camadas, portas e adaptadores (hexagonal), regra de dependência com verificação automática, monólito modular e microsserviços, com exemplos executáveis, animação e testes mapeados.
icon: fa-layer-group
favicon: 🏭
topic: es/06-estilos-camadas-hexagonal
---

## Visão geral {fa-eye}

Esta é a **Aula 6**. Um **estilo arquitetural** é um padrão recorrente de organização de um sistema: quais partes existem, como se comunicam e onde ficam as regras. Cada estilo resolve um conjunto de problemas e cria outros. Não há estilo universalmente correto; há o estilo cujos custos a equipe consegue pagar, e a escolha deve ser justificada pelos atributos de qualidade da Aula 5.

Ao final da aula você deverá ser capaz de:

- descrever a arquitetura em camadas, seus benefícios e a forma típica como ela se degrada;
- explicar a arquitetura hexagonal em termos de portas, adaptadores e inversão de dependência, e demonstrar sua vantagem em testes;
- verificar automaticamente a regra de dependência e detectar ciclos no grafo de dependências;
- comparar monólito, monólito modular e microsserviços com critérios explícitos;
- reconhecer as violações mais comuns de cada estilo.

> [!info] Pré-requisitos
> Aulas 3 (testes) e 5 (atributos e trade-offs). Os exemplos usam Python e o módulo `ast` da biblioteca padrão.

> [!tip] Como estudar
> Desenhe, no papel, a direção de cada seta de dependência de um projeto que você conhece. Depois use o verificador da seção 5 como se fosse um revisor automático: a maioria das violações aparece ali, antes de chegar à code review.

:::mapa

## 1. Estilos e a regra de dependência {fa-diagram-project}

Garlan e Shaw (1994) catalogaram estilos arquiteturais como padrões de organização com regras de composição. Richards (2015) organizou os estilos mais usados em sistemas de negócio e descreveu seus custos típicos. A ideia que une os estilos desta aula é uma só: **as dependências de código devem apontar para as regras de negócio**, e não para os detalhes técnicos como banco, interface gráfica ou framework.

Martin (2017), em *Clean Architecture*, formula essa ideia como a **regra de dependência**: o código-fonte só pode depender de elementos mais internos, e os elementos internos não conhecem os externos. Quando essa regra é respeitada, trocar um banco, um framework web ou um provedor de e-mail não exige alterar as regras de negócio.

:::quiz T-06-01 | 1 | regra de dependência
P: Segundo a regra de dependência (Martin, 2017), qual afirmação é verdadeira?
A) As regras de negócio devem importar o framework web para acessar as requisições.
*B) O código de um círculo interno não pode depender de nada que esteja em um círculo externo.
C) Os círculos externos devem conter as regras de negócio, para facilitar a alteração.
D) A regra só vale para sistemas distribuídos.
X: A regra de dependência aponta para dentro. Os círculos externos (interface, banco, frameworks) conhecem os internos, e não o contrário.
:::

## 2. Arquitetura em camadas {fa-layer-group}

### 2.1 Estrutura

O estilo mais difundido organiza o sistema em camadas horizontais. Em aplicações web, uma convenção comum tem quatro: **apresentação** (recebe requisições e devolve respostas), **aplicação** (coordena casos de uso), **domínio** (regras de negócio e conceitos centrais) e **infraestrutura** (banco, filas, APIs externas). Em geral, cada camada só se comunica com a imediatamente abaixo.

### 2.2 Benefícios e degradação

A principal vantagem é a simplicidade mental: qualquer pessoa consegue seguir o caminho de uma requisição. Richards (2015) observa que a arquitetura em camadas é uma escolha de partida razoável para muitos sistemas de negócio, justamente por essa simplicidade.

Sua fraqueza é a **degradação por atalhos**. Quando a camada de domínio precisa de algo da infraestrutura, como um número de protocolo gerado no banco, a tentação é chamar o banco diretamente. Depois de alguns atalhos, a camada de domínio depende da infraestrutura, e testá-la sem banco deixa de ser possível. O fenômeno mais grave é o **vazamento de camadas**, em que o controlador monta consultas SQL ou a regra de desconto mora em uma tela.

:::quiz T-06-02 | 2 | camadas
P: Qual é a forma mais comum de degradação de uma arquitetura em camadas?
A) Aumento excessivo do número de camadas.
*B) Atalhos que permitem a uma camada depender diretamente de uma camada inferior não adjacente ou da infraestrutura, quebrando o isolamento.
C) Substituição de todas as camadas por microsserviços.
D) Uso de frameworks populares.
X: O vazamento acontece quando a regra de comunicação entre camadas é violada, geralmente por conveniência. A consequência é a perda de testabilidade e de isolamento.
:::

## 3. Arquitetura hexagonal {fa-hexagon-nodes}

### 3.1 Portas e adaptadores

Cockburn (2005) propôs a **arquitetura hexagonal**, também chamada de *ports and adapters*, para resolver o vazamento de camadas de forma mais direta. O núcleo do sistema contém as regras de negócio e não conhece o mundo externo. Ao redor dele existem **portas**, que são interfaces definidas pelo próprio núcleo, e **adaptadores**, que traduzem entre o mundo externo e as portas.

- **Portas de entrada** são os casos de uso que o mundo externo pode chamar, como "criar pedido".
- **Portas de saída** são as necessidades do núcleo, como "salvar pedido" ou "enviar notificação", expressas como interfaces.
- **Adaptadores primários** traduzem uma requisição HTTP, um comando de terminal ou uma mensagem de fila em uma chamada à porta de entrada.
- **Adaptadores secundários** implementam as portas de saída com tecnologias concretas, como SQL, SMTP ou um cliente de fila.

### 3.2 Inversão de dependência

A consequência central é a **inversão de dependência**. O núcleo declara a interface de que precisa; o adaptador de banco depende dessa interface, e não o contrário. As setas de dependência de código passam a apontar sempre para dentro. O princípio foi formulado por Martin (1996) e incorporado depois aos princípios SOLID; a disciplina de Modelagem Orientada a Objetos o trata em detalhe.

O benefício prático é a testabilidade. Como o núcleo depende apenas de uma interface, um adaptador em memória substitui o banco nos testes, e as regras são verificadas sem servidor, sem rede e sem banco. O exemplo a seguir demonstra isso.

:::run 06/01-nucleo-com-porta.py

Observe que `ServicoPedidos` não importa nada de banco. O teste `test_total_e_salvo_na_porta` verifica o resultado de negócio (o total) e o efeito na porta (o pedido foi salvo), sem nenhuma infraestrutura.

:::anim
canvas: cvHexagonal
ctl: ctlHexagonal
cap: capHexagonal
desenha: desenhaHexagonal
gera: geraHexagonal
velocidade: 3000
:::

:::quiz T-06-03 | 2 | hexagonal
P: Na arquitetura hexagonal, quem define a interface de acesso ao banco de dados?
A) O próprio banco de dados, por meio do seu driver.
B) O adaptador de infraestrutura, que escolhe a tecnologia.
*C) O núcleo do domínio, como uma porta de saída.
D) O framework web, durante a inicialização.
X: O núcleo declara o que precisa e o adaptador implementa. Essa inversão é o que mantém as setas de dependência apontando para dentro.
:::

:::quiz T-06-04 | 3 | testabilidade
P: Por que a arquitetura hexagonal torna os testes do núcleo mais rápidos e confiáveis?
A) Porque o núcleo é escrito em uma linguagem mais rápida.
*B) Porque o núcleo depende de uma interface, e um adaptador em memória pode substituir o banco nos testes.
C) Porque os testes são executados em paralelo por padrão.
D) Porque o banco é desnecessário para qualquer sistema.
X: A substituição de dependências externas por adaptadores de teste elimina a latência, a indeterminação e a configuração de ambiente dos testes das regras.
:::

## 4. Monólito modular e microsserviços {fa-cubes}

### 4.1 Monólito e monólito modular

Um **monólito** é um sistema implantado como uma única unidade. Isso, por si só, não é defeito: um monólito bem organizado é simples de implantar, testar, depurar e operar, e é uma escolha razoável para a maioria das equipes pequenas. O problema costuma ser outro: um monólito sem fronteiras internas, em que qualquer classe chama qualquer outra e todas acessam as mesmas tabelas. Fowler (2015), em *MonolithFirst*, argumenta que a maioria dos sistemas bem-sucedidos começou como monólito, e que começar com microsserviços costuma ser um erro por causa do custo de fronteiras ainda não compreendidas.

O **monólito modular** mantém a implantação única, mas organiza o código em módulos com responsabilidades claras e interfaces públicas pequenas. Parnas (1972) argumentou que um sistema deve ser decomposto segundo as decisões que podem mudar, escondendo cada decisão atrás de uma fronteira. Um módulo não acessa as tabelas de outro diretamente; ele pede ao outro módulo o que precisa. Essa organização prepara a extração de serviços, se ela for necessária um dia.

### 4.2 Microsserviços

Lewis e Fowler (2014) descreveram microsserviços como serviços pequenos, independentes, implantados separadamente e organizados em torno de capacidades de negócio. Newman (2021) enfatiza que cada serviço deve poder mudar e ser implantado sem coordenar com os demais. O ganho é a independência de escala, de tecnologia e de implantação entre equipes. O custo é alto e frequentemente subestimado: cada chamada entre serviços vira uma chamada de rede, com latência, falhas parciais e necessidade de tratamento de erro; transações antes atômicas exigem coordenação; e é preciso operar, monitorar e versionar muitos componentes.

A Lei de Conway (1968) lembra que a arquitetura tende a copiar a estrutura de comunicação da organização que a constrói. Microsserviços fazem sentido quando há um motivo concreto, como cargas muito diferentes entre partes do sistema ou equipes grandes que precisam de autonomia.

:::quiz T-06-05 | 2 | estilos
P: Uma equipe de quatro pessoas mantém um sistema de vendas sem necessidade de escalar partes isoladamente. Qual estilo tende a ser a escolha mais sensata?
A) Microsserviços, para facilitar escalabilidade futura.
*B) Monólito modular, com fronteiras claras entre módulos.
C) Um serviço por tabela do banco de dados.
D) Sistema distribuído com um broker de mensagens para cada função.
X: O monólito modular dá organização e fronteiras sem o custo operacional de uma rede de serviços. Microsserviços exigem um motivo concreto, que neste cenário não existe.
:::

:::quiz T-06-06 | 3 | microsserviços
P: Segundo a Lei de Conway, o que a arquitetura de um sistema tende a refletir?
A) A tecnologia mais recente disponível no momento.
*B) A estrutura de comunicação da organização que o constrói.
C) A quantidade de linhas de código do sistema.
D) O desempenho esperado de cada serviço.
X: Conway (1968) observou que sistemas espelham a comunicação das organizações. Ignorar essa relação costuma gerar fronteiras que não correspondem às equipes.
:::

## 5. Verificando a regra de dependência {fa-magnifying-glass}

Uma regra de arquitetura que depende de acordo verbal se degrada. A alternativa é **verificá-la automaticamente**, como uma pré-condição do build. O programa a seguir lê as declarações `import` de cada módulo com o `ast`, sem executá-los, aplica a regra "o domínio não importa infraestrutura nem interface" e procura ciclos no grafo de dependências.

:::run 06/02-regra-dependencia.py

A saída mostra a violação (o módulo de regras importa a infraestrutura) e um ciclo (domínio, regras, infraestrutura e de volta ao domínio). Ciclos são especialmente nocivos: nenhum dos módulos envolvidos pode ser compreendido, compilado ou testado isoladamente.

> [!tip] Em projetos reais
> Ferramentas como `import-linter` (Python) e ArchUnit (Java) expressam essas regras em configuração e as aplicam automaticamente, com o mesmo princípio de análise estática usado acima.

:::quiz T-06-07 | 2 | verificação
P: No verificador, o que significa encontrar um ciclo no grafo de dependências?
A) Que o sistema usa um padrão de projeto conhecido.
*B) Que módulos dependem uns dos outros em círculo, tornando-os difíceis de compreender, testar e modificar isoladamente.
C) Que a aplicação está pronta para produção.
D) Que há um erro de sintaxe em algum módulo.
X: Ciclos acoplam fortemente os módulos envolvidos. Eles são um sinal de fronteiras mal definidas e uma das violações mais difíceis de corrigir depois.
:::

:::exercicio T-06-E1 | 2 | hexagonal
Um controlador HTTP de um sistema de matrículas calcula a mensalidade, consulta diretamente o banco com SQL e envia o e-mail de confirmação. Redesenhe a responsabilidade em portas e adaptadores: liste o núcleo, as portas de entrada e de saída e os adaptadores, e explique quais testes deixam de depender de infraestrutura.
:::gabarito
O núcleo recebe a regra de cálculo da mensalidade e a orquestração da matrícula (verificar vagas, calcular, registrar). Portas de entrada: "matricular aluno". Portas de saída: "repositório de matrículas" (salvar e consultar) e "notificador" (enviar confirmação). Adaptadores: o controlador HTTP (primário), que traduz a requisição em comando; um adaptador SQL para o repositório (secundário); e um adaptador de e-mail (secundário). Os testes que deixam de depender de infraestrutura são os da regra de mensalidade e da orquestração da matrícula, que passam a usar repositórios e notificadores em memória. O controlador continua precisando de um teste de integração, pois ele é a fronteira com o mundo externo, mas esse teste é um de poucos, e não o único meio de verificar a regra.
:::

:::exercicio T-06-E2 | 3 | estilos
Uma startup começou com dez microsserviços para um produto com trezentos usuários. Argumente, com base nesta aula e na Aula 5, o que deveria ter sido considerado antes dessa decisão e proponha um plano de correção que não exija uma reescrita total.
:::gabarito
Antes da decisão, deveriam ter sido considerados: o cenário de atributo que justificaria a separação (qual carga, que equipes, que autonomia), o custo operacional de operar dez serviços com trezentos usuários, e o risco de fronteiras mal definidas, que são difíceis de corrigir depois. A Lei de Conway também indica que dez serviços exigem uma organização de equipes que talvez não exista. Um plano de correção incremental: (1) identificar os módulos com fronteiras naturais e acoplamento baixo; (2) consolidar serviços pequenos em um monólito modular, mantendo interfaces públicas; (3) aplicar verificação automática da regra de dependência; (4) registrar a decisão em ADR, com condições objetivas para reabrir a separação, como carga ou tamanho de equipe. A consolidação é feita por partes, com testes de caracterização (Aula 4), e não por uma reescrita de uma vez.
:::

## 6. Mercado de trabalho {fa-briefcase}

Na prática, a arquitetura em camadas e a hexagonal convivem em projetos profissionais: frameworks web como Spring, Django e ASP.NET incentivam camadas, e equipes que valorizam testabilidade costumam isolar o núcleo com portas. Monólitos modulares são adotados por organizações de diferentes portes, e a discussão sobre voltar de microsserviços para monólitos modulares tem exemplos publicados por empresas de tecnologia, o que mostra que a escolha é reversível e depende do contexto. A competência valorizada é a capacidade de justificar o estilo pelos atributos de qualidade, e de reconhecer quando a estrutura atual já não serve.

## 7. Erros comuns {fa-triangle-exclamation}

- **Regra de negócio no controlador.** A tela vira o lugar da regra, e a regra não pode ser testada sem a tela.
- **Módulo que lê a tabela de outro módulo.** A fronteira existe no diagrama, mas não no código.
- **Interface para cada classe.** Uma porta tem valor quando há uma fronteira real (banco, rede, serviço externo).
- **Microsserviços por moda.** Sem cenário que justifique, o custo operacional supera o benefício.
- **Dependências sem verificação.** Regras que só existem em documentação são violadas com o tempo.

## Resumo da aula {fa-square-check}

- A regra de dependência manda apontar as dependências para as regras de negócio.
- Camadas são simples e úteis, mas degradam por atalhos que quebram o isolamento.
- A arquitetura hexagonal inverte a dependência: o núcleo define portas, os adaptadores as implementam, e os testes substituem o banco por um adaptador em memória.
- Monólito modular costuma ser a melhor escolha inicial; microsserviços exigem motivo concreto e custo operacional assumido.
- A regra de dependência pode e deve ser verificada automaticamente.

## Referências {fa-book}

**Acadêmicas e fundacionais**

- CONWAY, M. E. How do committees invent? *Datamation*, v. 14, n. 4, p. 28–31, 1968.
- GARLAN, D.; SHAW, M. *An Introduction to Software Architecture*. CMU-CS-94-166, 1994.
- PARNAS, D. L. On the criteria to be used in decomposing systems into modules. *Communications of the ACM*, v. 15, n. 12, p. 1053–1058, 1972.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.
- EVANS, E. *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Boston: Addison-Wesley, 2003.

**Estilos, padrões e prática**

- COCKBURN, A. Hexagonal architecture (Ports and Adapters). 2005. [alistair.cockburn.us](https://alistair.cockburn.us/hexagonal-architecture/)
- FOWLER, M. *MonolithFirst*. martinfowler.com, 2015. [martinfowler.com/bliki/MonolithFirst.html](https://martinfowler.com/bliki/MonolithFirst.html)
- LEWIS, J.; FOWLER, M. *Microservices*. martinfowler.com, 2014. [martinfowler.com/articles/microservices.html](https://martinfowler.com/articles/microservices.html)
- MARTIN, R. C. *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Upper Saddle River: Prentice Hall, 2017.
- MARTIN, R. C. The Dependency Inversion Principle. *C++ Report*, 1996.
- NEWMAN, S. *Building Microservices*. 2. ed. Sebastopol: O'Reilly, 2021.
- RICHARDS, M. *Software Architecture Patterns*. Sebastopol: O'Reilly, 2015. [oreilly.com](https://www.oreilly.com/library/view/software-architecture-patterns/9781491924242/)
- RICHARDSON, C. *Microservices Patterns*. Shelter Island: Manning, 2018.
- IMPORT-LINTER. Documentação. [import-linter.readthedocs.io](https://import-linter.readthedocs.io/)
