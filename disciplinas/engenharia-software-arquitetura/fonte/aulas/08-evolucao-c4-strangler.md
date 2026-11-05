title: Evolução de sistemas: legado, documentação com o modelo C4 e migração incremental (Strangler Fig)
desc: Aula sobre evolução de sistemas: manutenção e leis de Lehman, código legado com testes de caracterização e costuras, documentação em níveis com o modelo C4, por que reescritas totais falham e a migração incremental pelo padrão Strangler Fig, com exemplos executáveis, animação e testes mapeados.
icon: fa-seedling
favicon: 🏭
topic: es/08-evolucao-c4-strangler
---

## Visão geral {fa-eye}

Esta é a **Aula 8**, que fecha a trilha de Arquitetura. Poucos engenheiros começam um sistema do zero. A maioria herda um sistema existente, com anos de decisões, partes de lógica que ninguém compreende plenamente, documentação desatualizada e clientes que dependem de cada comportamento, inclusive dos defeitos. Nesse contexto, arquitetura é menos sobre desenhar algo novo e mais sobre **evoluir o que existe sem interromper o negócio**.

Ao final da aula você deverá ser capaz de:

- explicar a evolução de software com as leis de Lehman e a classificação de manutenção;
- caracterizar código legado com testes de caracterização e identificar costuras onde a mudança é segura;
- documentar uma arquitetura em quatro níveis com o modelo C4 e verificar a consistência do modelo;
- argumentar, com dados e exemplos, por que reescritas totais costumam falhar;
- planejar uma migração incremental com fachada, roteamento gradual, reversão e critério de conclusão.

> [!info] Pré-requisitos
> Aulas 4 (qualidade e refatoração), 6 (estilos) e 7 (integração). A seção 5 usa a ideia de testes de caracterização da Aula 4.

> [!tip] Como estudar
> Escolha um sistema pequeno que você escreveu no começo do curso e aplique as ideias desta aula como exercício mental: onde estão as costuras? qual é a primeira fatia que você migraria? qual seria o critério para desligar a versão antiga?

:::mapa

## 1. Evolução e manutenção {fa-clock-rotate-left}

### 1.1 Leis de Lehman

Lehman (1980) formulou, a partir de observações de sistemas de grande porte, um conjunto de leis empíricas sobre a evolução de software. Entre elas, a de que um sistema usado no mundo real precisa ser continuamente adaptado, sob pena de se tornar progressivamente menos satisfatório, e a de que a complexidade cresce com a evolução, a menos que haja trabalho deliberado para reduzi-la. As leis não são teoremas, e sim regularidades observadas, mas são um ponto de partida sólido para planejar a manutenção.

### 1.2 Tipos de manutenção

Bennett e Rajlich (2000) propuseram um roteiro para a manutenção e a evolução de software, distinguindo fases de evolução e de servicing. A distinção útil para esta aula é entre três tipos de manutenção: **corretiva** (corrigir defeitos), **adaptativa** (acompanhar mudanças no ambiente, como um novo sistema operacional) e **perfectiva** (melhorar funcionalidades ou desempenho). Um percentual considerável do custo total do software está nas duas últimas, e é nelas que a arquitetura pesa mais.

:::quiz T-08-01 | 1 | evolução
P: Segundo as leis de Lehman (1980), qual afirmação descreve melhor a evolução de sistemas usados no mundo real?
A) Sistemas bem projetados não precisam de manutenção após a entrega.
*B) Sistemas precisam ser continuamente adaptados, e sem trabalho deliberado sua complexidade tende a crescer.
C) A complexidade diminui naturalmente com o tempo de uso.
D) A manutenção é restrita à correção de defeitos.
X: As leis de Lehman descrevem a necessidade de adaptação contínua e o crescimento da complexidade sem intervenção. Manutenção não se limita a corrigir defeitos.
:::

## 2. Código legado e costuras {fa-box-archive}

### 2.1 Definição operacional

Feathers (2004) definiu **código legado** de forma prática: código sem testes, independentemente da idade ou da tecnologia. A definição tem uma consequência direta: para mudar código legado com segurança, primeiro é preciso criar a rede de segurança que os testes representam.

### 2.2 Testes de caracterização

Um **teste de caracterização** registra o comportamento atual, mesmo quando ele parece errado. Ele não diz qual deveria ser o comportamento; diz qual é hoje, para que qualquer mudança seja percebida. Se um sistema cobra 2,5% de juros quando deveria cobrar 2%, o teste registra os 2,5%, e a correção passa a ser uma decisão explícita, separada da refatoração. A técnica foi apresentada na Aula 4 e é o instrumento de entrada de qualquer migração.

### 2.3 Costuras

Feathers também descreve as **costuras** (*seams*): pontos em que é possível alterar o comportamento de um trecho sem editar o código ali. Uma costura pode ser uma injeção de dependência, uma interface extraída ou um parâmetro de configuração. Sem costuras, testar o legado exige mexer nele antes de testá-lo, o que é justamente o que se quer evitar. Encontrar costuras é uma atividade de análise, e costuma revelar a melhor ordem para as mudanças.

:::quiz T-08-02 | 2 | legado
P: Um teste de caracterização de um trecho legado registra que a função cobra 2,5% de juros, embora a especificação diga 2%. O que o teste deve fazer?
A) Falhar até que o valor seja corrigido para 2%.
*B) Registrar o comportamento atual (2,5%), e a correção deve ser tratada como uma decisão separada da refatoração.
C) Ser removido, porque o valor está errado.
D) Mudar automaticamente para 2% durante a refatoração.
X: O teste de caracterização documenta o que o sistema faz hoje. Corrigir o comportamento é uma mudança funcional, que deve ser deliberada e não escondida numa refatoração.
:::

## 3. Documentação com o modelo C4 {fa-magnifying-glass-plus}

Brown (2018) propôs o **modelo C4**, que documenta a arquitetura em quatro níveis de zoom, cada um respondendo a uma pergunta e voltado a um público:

- **Contexto**: o sistema como uma caixa, cercada pelos usuários e pelos sistemas externos com que se relaciona. Público: todos, inclusive quem não é técnico.
- **Contêineres**: as aplicações e os armazenamentos executáveis que compõem o sistema (site, API, banco, fila). Público: desenvolvedores e operadores. Aqui, "contêiner" é uma unidade executável, e não necessariamente um Docker.
- **Componentes**: as partes principais de um contêiner. Público: quem trabalha naquele contêiner.
- **Código**: classes e funções, geralmente melhor deixadas para a própria IDE.

A regra mais útil é **não misturar níveis**. Um diagrama de contexto que mostra tabelas confunde a gestão; um diagrama de componentes que mostra a rede entre datacenters confunde a equipe. Documentação de arquitetura deve morar no repositório e ser revisada com o código. Diagramas escritos como código (Mermaid, PlantUML, ou a própria estrutura de dados de um modelo) são versionados e verificáveis.

A verificação de consistência é o que distingue um modelo de um desenho. O programa a seguir valida um modelo de três contêineres e um sistema externo, verificando relações que citam elementos inexistentes, contêineres sem tecnologia e elementos órfãos.

:::run 08/02-verificador-c4.py

Os erros encontrados são de dois tipos: uma relação que aponta para um elemento que não existe no modelo (um erro de digitação ou de escopo) e um contêiner incompleto. Modelos que passam por esse tipo de verificação continuam úteis por mais tempo, porque o próprio modelo acusa a sua deterioração.

:::quiz T-08-03 | 2 | C4
P: Qual nível do modelo C4 é o mais adequado para apresentar o sistema a um gestor não técnico?
A) Código.
*B) Contexto.
C) Componentes.
D) Qualquer um, desde que contenha as tabelas do banco.
X: O diagrama de contexto mostra o sistema como uma caixa e seus usuários e sistemas externos. Ele responde "o que é e com quem se relaciona", sem detalhes internos.
:::

## 4. Por que reescritas totais costumam falhar {fa-hammer}

A tentação de reescrever tudo é forte: o código antigo é difícil, a tecnologia está ultrapassada, e o projeto novo parece uma folha em branco. Na prática, reescritas grandes costumam atrasar, entregar menos do que o sistema antigo e reproduzir defeitos que o sistema antigo havia aprendido a evitar. Três razões se repetem:

1. O sistema antigo é a única especificação completa do comportamento real, e ninguém conseguiu escrevê-la inteira.
2. Durante a reescrita, o sistema antigo continua recebendo mudanças. A equipe mantém dois sistemas, e o novo alcança o antigo num ritmo que raramente se cumpre.
3. Nenhum valor chega ao usuário até o fim da reescrita, o que torna o projeto vulnerável a cortes de orçamento.

A alternativa estudada por Fowler (2004) é a **figueira estranguladora** (*Strangler Fig*): a figueira cresce ao redor de uma árvore hospedeira até substituí-la, sem derrubá-la de uma vez. A migração segue o mesmo princípio.

:::quiz T-08-04 | 2 | reescrita
P: Qual é a principal razão para que reescritas totais costumem atrasar e reproduzir defeitos antigos?
A) Porque as linguagens novas são sempre mais difíceis de aprender.
*B) Porque o sistema antigo é a única especificação completa do comportamento real, e ele continua mudando durante a reescrita.
C) Porque os clientes não aceitam sistemas novos.
D) Porque a documentação é sempre incorreta.
X: A reescrita precisa reproduzir um comportamento que ninguém especificou por completo, em um alvo que se move. As duas causas juntas explicam o atraso e o retrabalho.
:::

## 5. Strangler Fig: a migração em quatro movimentos {fa-seedling}

O padrão de Fowler (2004) organiza a migração em quatro movimentos:

1. **Interpor uma fachada.** Um roteador ou gateway fica na frente do sistema legado. No início, encaminha tudo para o legado; nada muda para o usuário, mas agora existe um ponto onde as rotas podem ser redirecionadas.
2. **Escolher uma fatia.** Uma funcionalidade com fronteira razoavelmente clara e valor visível, como o catálogo. Evite começar pela parte mais central e arriscada.
3. **Construir e validar a fatia nova.** Implemente-a com testes de contrato que garantam o comportamento do legado. Se possível, coloque a versão nova em produção para uma parcela pequena do tráfego e compare as respostas.
4. **Redirecionar e repetir.** Quando a fatia estiver validada, a fachada envia as rotas para o serviço novo. A fatia do legado é removida após um período de segurança, e o ciclo recomeça.

Duas ideias complementam o padrão. A **camada anticorrupção**, descrita por Evans (2003), é um tradutor entre o legado e o código novo, que impede que o vocabulário e as decisões antigas contaminem o modelo novo. E o **branch by abstraction**, descrito por Fowler (2014), permite introduzir a mudança por trás de uma abstração que as duas implementações compartilham, sem ramificar o código por semanas.

### 5.1 O roteamento da fachada

A essência da fachada é uma tabela de rotas migradas e uma regra de decisão. O exemplo a seguir acrescenta uma terceira dimensão: uma fatia de usuários, sorteada por um hash estável do identificador, que permite migrar a rota gradualmente. A reversão é imediata: basta baixar o percentual a zero.

:::run 08/01-strangler-fachada.py

Os números mostram a migração em ação: com 25% configurado, cerca de um quarto dos usuários é encaminhado ao serviço novo, e a divisão se mantém estável porque o hash é determinístico (o mesmo usuário sempre cai na mesma fatia). Os `assert`s documentam dois detalhes que costumam gerar defeitos: rotas mais específicas precisam ser verificadas antes das gerais, e a fronteira do prefixo exige a barra, para que `/catalogo-antigo` não pertença a `/catalogo`.

:::anim
canvas: cvEstrangulamento
ctl: ctlEstrangulamento
cap: capEstrangulamento
desenha: desenhaEstrangulamento
gera: geraEstrangulamento
velocidade: 2800
:::

:::quiz T-08-05 | 2 | Strangler
P: Por que o roteamento por hash do usuário é útil em uma migração gradual?
A) Porque garante que nenhum usuário veja erros.
*B) Porque mantém cada usuário na mesma versão durante a migração e permite ajustar o percentual com reversão imediata.
C) Porque elimina a necessidade de testes de contrato.
D) Porque dispensa a fachada.
X: A atribuição estável evita que o mesmo usuário alterne entre versões a cada requisição, e a reversão é uma mudança de configuração, não de implantação.
:::

:::quiz T-08-06 | 3 | Strangler
P: Por que a regra de prefixo da fachada deve exigir a barra após o prefixo (`caminho.startswith(prefixo + "/")`)?
A) Porque a barra acelera a comparação de strings.
*B) Para que uma rota como `/catalogo-antigo` não seja encaminhada indevidamente ao serviço de `/catalogo`.
C) Porque o framework web exige barras em todas as rotas.
D) Porque a barra é necessária para o hash estável.
X: Sem a barra, `startswith("/catalogo")` aceitaria qualquer caminho que comece com essas letras. Esse é um defeito sutil de roteamento que a verificação com `assert` expõe.
:::

:::exercicio T-08-E1 | 2 | C4
Um sistema de matrículas tem um site, uma API, um banco relacional, um serviço de e-mail externo e um sistema externo de pagamento. Desenhe (em texto ou como estrutura) os diagramas de contexto e de contêineres, e indique quais informações pertencem a cada nível e quais devem ficar de fora.
:::gabarito
No contexto: o sistema de matrículas como caixa central, com o aluno e a secretaria como usuários, e o serviço de e-mail e o sistema de pagamento como sistemas externos, com as relações de alto nível ("envia confirmação", "processa pagamento"). No nível de contêineres: o site (aplicação web), a API (aplicação), o banco relacional (armazenamento), com tecnologias indicadas, e as relações entre eles ("chama via HTTPS", "lê e grava"). Ficam de fora do nível de contêineres as classes da API e as tabelas do banco, que pertencem aos níveis de componente e de código. Um teste de qualidade: o diagrama de contexto deve ser compreensível por alguém que nunca viu o projeto em um minuto.
:::

:::exercicio T-08-E2 | 3 | Strangler
Uma equipe quer migrar um sistema legado de emissão de boletos. Proponha um plano de migração em quatro fatias, indicando: a fatia inicial e o motivo da escolha, o critério de validação de cada fatia, como garantir que a reversão seja possível e a condição objetiva para desligar o legado.
:::gabarito
Uma fatia inicial adequada é a consulta de boletos (leitura, sem efeito colateral), porque erros nela são menos danosos do que na emissão. Critério de validação: testes de caracterização sobre o legado, testes de contrato entre as versões e comparação de respostas em tráfego-sombra. Reversão: a fachada mantém a rota do legado disponível, e o percentual pode ser baixado a zero sem nova implantação. As fatias seguintes: emissão de boleto em ambiente de homologação; emissão em produção com percentual crescente; cancelamento e baixa, que dependem de estados compartilhados e exigem atenção especial a dados. Condição objetiva para desligar o legado: 100% do tráfego atendido pelo serviço novo por um período acordado (por exemplo, dois ciclos de fechamento financeiro), sem divergências nas comparações, e com os dados de boletos já migrados e com dono definido. A camada anticorrupção protege o modelo novo do vocabulário do legado durante todo o processo.
:::

## 6. Mercado de trabalho {fa-briefcase}

Migrações incrementais são comuns em empresas que operam sistemas antigos e não podem parar, como bancos, operadoras e órgãos públicos. O padrão Strangler Fig é mencionado em relatos de modernização publicados por empresas de tecnologia e em radares de tecnologia de consultorias. Em entrevistas de arquitetura, a pergunta sobre como migrar um sistema legado sem interromper o negócio é recorrente, e as respostas valorizadas combinam fachada, fatias de valor, testes de caracterização e critério de conclusão explícito.

## 7. Erros comuns {fa-triangle-exclamation}

- **Migrar camadas técnicas em vez de fatias de valor.** Migrar primeiro o banco não entrega nada ao usuário e adia o risco para o fim.
- **Migração sem critério de conclusão.** Um legado "quase migrado" há anos é dois sistemas para manter.
- **Dupla escrita de dados.** Enquanto dois sistemas escrevem no mesmo dado sem dono definido, a separação é aparente.
- **Modelo novo que copia o vocabulário do legado.** Sem camada anticorrupção, a migração troca apenas a embalagem.
- **Código morto mantido "por precaução".** Código que ninguém executa é dívida com custo mensal.

## Resumo da aula {fa-square-check}

- Evolução é contínua; as leis de Lehman descrevem a tendência de crescimento da complexidade sem trabalho deliberado.
- Legado é código sem testes; testes de caracterização e costuras tornam a mudança segura.
- O modelo C4 documenta em quatro níveis, cada um com seu público, e os modelos podem ser verificados automaticamente.
- Reescritas totais falham por motivos previsíveis; o Strangler Fig migra por fatias validadas, com reversão.
- Critério de conclusão e propriedade dos dados são tão importantes quanto o código novo.

## Referências {fa-book}

**Acadêmicas e fundacionais**

- BENNETT, K. H.; RAJLICH, V. T. Software maintenance and evolution: a roadmap. In: *Proceedings of ICSE: The Future of Software Engineering*, 2000.
- EVANS, E. *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Boston: Addison-Wesley, 2003.
- FEATHERS, M. *Working Effectively with Legacy Code*. Upper Saddle River: Prentice Hall, 2004.
- FORD, N.; PARSONS, R.; KUA, P. *Building Evolutionary Architectures*. Sebastopol: O'Reilly, 2017.
- LEHMAN, M. M. Programs, life cycles, and laws of software evolution. *Proceedings of the IEEE*, v. 68, n. 9, p. 1060–1076, 1980.
- NYGARD, M. *Documenting Architecture Decisions*. Cognitect Blog, 2011. [cognitect.com/blog/2011/11/15/documenting-architecture-decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.

**Modelagem, padrões e prática**

- BROWN, S. *Software Architecture for Developers*. Leanpub, 2018. Apresenta o modelo C4. [c4model.com](https://c4model.com/)
- FOWLER, M. *StranglerFigApplication*. martinfowler.com, 2004. [martinfowler.com/bliki/StranglerFigApplication.html](https://martinfowler.com/bliki/StranglerFigApplication.html)
- FOWLER, M. *BranchByAbstraction*. martinfowler.com, 2014. [martinfowler.com/bliki/BranchByAbstraction.html](https://martinfowler.com/bliki/BranchByAbstraction.html)
- HUMBLE, J.; FARLEY, D. *Continuous Delivery*. Upper Saddle River: Addison-Wesley, 2010.
