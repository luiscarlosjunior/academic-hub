title: Git, branches, integração e revisão de código
desc: Aula de controle de versão e colaboração: o modelo de commits e referências do Git, fluxos de branches (Gitflow, GitHub Flow, trunk-based), commits que explicam o porquê, pull requests e revisão de código, com um exemplo que executa o Git de verdade.
icon: fa-code-branch
favicon: 🏭
topic: es/09-git-revisao-de-codigo
---

## Visão geral {fa-eye}

Esta é a **Aula 9**, a primeira da trilha de Programação para a Indústria. Na faculdade, um projeto costuma ser de uma pessoa ou de um grupo que se reúne no fim do semestre. Na indústria, dezenas de pessoas alteram o mesmo sistema toda semana, e a diferença entre um time produtivo e um caótico está, em grande parte, na forma como o código é versionado e revisado.

Ao final da aula você deverá ser capaz de:

- explicar o modelo interno do Git (commits, árvore de diretórios, referências e branches) o suficiente para raciocinar sobre qualquer operação;
- escolher um fluxo de branches adequado ao tamanho e à cadência de entrega da equipe;
- escrever commits que documentam o porquê da mudança e separar refatoração de mudança de comportamento;
- abrir um pull request que facilita a revisão e conduzir uma revisão construtiva;
- recuperar trabalho perdido e evitar os erros que quebram a integração ou vazam segredos.

> [!info] Pré-requisitos
> Linha de comando básica e a ideia de arquivo e diretório. O exemplo desta aula executa `git` no seu computador; é preciso tê-lo instalado.

> [!tip] Como estudar
> Pratique em um repositório descartável. Para cada seção, faça a operação no terminal antes de ler a explicação, e depois confira no `git log --graph`. Errar em um repositório de teste é a forma mais barata de aprender o Git.

:::mapa

## 1. O modelo do Git {fa-diagram-project}

### 1.1 Commits e árvores

O Git guarda o histórico de um projeto como um grafo acíclico de **commits**. Cada commit é um instantâneo completo da árvore de diretórios no momento da gravação, identificado por um hash criptográfico do seu conteúdo e dos seus pais. Chacon e Straub (2014), no livro *Pro Git*, explicam esse modelo com clareza, e a leitura é recomendada integralmente. Como o histórico é uma estrutura de hashes, alterar um commit antigo altera todos os que vêm depois dele, o que dá ao histórico sua integridade.

### 1.2 Referências e branches

Uma **branch** não é uma cópia do código. É uma referência com nome que aponta para um commit, e que avança a cada novo commit feito nela. Uma **tag** é uma referência fixa a um commit. O `HEAD` é a referência que indica onde você está. Essa simplicidade é o que torna as branches baratas: criar uma é criar um ponteiro.

### 1.3 Merge e rebase

A integração de duas linhas pode ser feita de duas formas. No **merge**, o Git cria um commit com dois pais, preservando a história das duas linhas. No **rebase**, os commits de uma branch são reaplicados sobre outra base, produzindo um histórico linear. Ambos são válidos; a escolha depende da política da equipe. A regra de ouro do rebase é nunca reescrever commits que já foram publicados e são usados por outras pessoas.

:::quiz T-09-01 | 1 | modelo
P: No modelo interno do Git, o que é uma branch?
A) Uma cópia completa e separada de todos os arquivos do projeto.
*B) Uma referência com nome que aponta para um commit e avança a cada novo commit feito nela.
C) Um servidor remoto onde o código fica guardado.
D) Um arquivo de configuração com as credenciais do repositório.
X: Como uma branch é apenas um ponteiro, criá-la é barato. O custo real de uma branch aparece quando ela vive muito tempo sem integrar.
:::

:::quiz T-09-02 | 2 | merge e rebase
P: Por que não se deve fazer rebase de commits que já foram publicados em uma branch compartilhada?
A) Porque o rebase apaga os arquivos do projeto.
*B) Porque o rebase cria novos commits com outros hashes, e quem já tem os commits antigos terá históricos divergentes.
C) Porque o rebase desativa a revisão de código.
D) Porque o rebase só funciona em branches locais.
X: O rebase reescreve a história. Para outras pessoas, os commits antigos desaparecem e os novos parecem duplicados, o que gera conflitos e confusão.
:::

## 2. Fluxos de branches {fa-code-branch}

Três fluxos aparecem com frequência, e o critério que importa é o **tempo entre escrever o código e integrá-lo**:

- **Gitflow**, proposto por Driessen (2010), usa branches permanentes `main` e `develop`, além de branches de funcionalidade, de lançamento e de correção. Serve a produtos com versões formais e ciclos longos, mas multiplica as branches e favorece integração tardia.
- **GitHub Flow**, descrito pelo próprio GitHub, usa uma única branch principal sempre implantável e branches curtas para cada mudança, integradas por pull request. É simples e eficiente para equipes que entregam continuamente.
- **Trunk-based development**, documentado em trunkbaseddevelopment.com, integra todos na linha principal várias vezes ao dia, com branches de horas e funcionalidades escondidas por chaves de configuração. Exige testes automatizados fortes e é a base da entrega contínua da Aula 12.

Forsgren, Humble e Kim (2018) reportam, a partir de pesquisas do programa DORA, que equipes que integram com frequência e mantêm branches curtas tendem a apresentar melhor desempenho de entrega. Essa associação é uma das bases da preferência por branches de vida curta.

:::quiz T-09-03 | 2 | fluxos
P: Qual é o critério mais importante para escolher o tamanho e o tempo de vida das branches?
A) O número de desenvolvedores da equipe.
*B) O tempo entre escrever o código e integrá-lo à linha principal.
C) A cor do quadro de tarefas.
D) O tipo de linguagem de programação.
X: Quanto mais tempo uma branch vive separada, maior o custo de integração e mais tarde os conflitos aparecem. O tempo de integração é o indicador que orienta a escolha.
:::

## 3. Commits que explicam o porquê {fa-pen-nib}

Um commit deve ser uma unidade lógica de mudança, que pode ser revertida sem afetar o restante. O diff mostra **o que** mudou; a mensagem deve explicar **por que**. Quem lê o histórico daqui a um ano vê o código, mas não a intenção, a menos que a mensagem a registre.

A convenção **Conventional Commits** organiza a primeira linha com um tipo e um resumo curto (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`), o que facilita a leitura do histórico e a geração automática de notas de versão. Um hábito de alto valor é separar **refatoração** de **mudança de comportamento** em commits diferentes: quando um teste quebra, o histórico mostra qual das duas causou a falha.

:::quiz T-09-04 | 2 | commits
P: Um commit reorganiza um módulo sem mudar o comportamento e, no mesmo commit, altera uma regra de cálculo. Qual é o problema principal?
A) O commit fica grande demais para o histórico.
*B) Se um teste quebrar, não fica claro se a falha veio da refatoração ou da mudança de regra, e a reversão de uma das mudanças fica mais difícil.
C) O Git não permite dois tipos de mudança no mesmo commit.
D) A mensagem do commit deve ser sempre em inglês.
X: Separar refatoração de mudança funcional mantém o histórico legível e a reversão precisa. Ao misturar as duas, o diagnóstico e a reversão ficam comprometidos.
:::

## 4. Laboratório: o ciclo completo no Git {fa-terminal}

O exemplo a seguir executa operações reais do Git em um repositório temporário: cria um commit na `main`, uma branch de funcionalidade com outro commit, um commit novo na `main` e, por fim, o merge. A saída é o grafo produzido pelo próprio Git.

:::run 09/01-grafo-git.py

A leitura do grafo é uma habilidade útil. Cada linha `*` é um commit; as barras mostram a bifurcação e a junção. O merge de `feature/filtro-preco` aparece como um commit com dois pais, e as duas linhas de trabalho permanecem visíveis no histórico.

### 4.1 Animação: branch, pull request e merge

A animação acompanha uma funcionalidade nascendo de um commit estável da `main`, ganhando commits pequenos, passando pela revisão e sendo integrada, enquanto a `main` continua recebendo trabalho de outras pessoas.

:::anim
canvas: cvGit
ctl: ctlGit
cap: capGit
desenha: desenhaGit
gera: geraGit
velocidade: 3000
:::

> [!tip] Comandos que você deve dominar
> `git switch -c nome` cria e troca de branch; `git status` mostra o estado da árvore; `git diff --staged` mostra o que está prestes a ser commitado; `git add -p` permite escolher trechos antes de cada commit; `git log --graph --oneline --all` mostra o grafo; `git reflog` mostra onde o `HEAD` esteve (é a sua rede de segurança).

:::quiz T-09-05 | 2 | operações
P: Você apagou um arquivo por engano e depois fez um commit. Qual é a forma mais segura de recuperar o trabalho se o commit ainda não foi publicado?
A) Recriar o arquivo manualmente a partir da memória.
*B) Usar `git reflog` para localizar o estado anterior e recuperar o arquivo a partir dele.
C) Apagar o repositório e clonar de novo, perdendo o histórico.
D) Executar `git push --force` para sobrescrever o remoto.
X: O reflog registra as posições anteriores do `HEAD`. Enquanto o commit não for publicado, o histórico local é a fonte para desfazer o erro sem perder nada.
:::

## 5. Pull requests e revisão de código {fa-magnifying-glass-chart}

### 5.1 O pull request

Um pull request é o pedido formal para integrar uma branch. Ele é o lugar onde acontecem a revisão, a execução dos testes automáticos e a discussão, que ficam registradas. Um bom pull request é **pequeno**, **descrito** e **fácil de revisar**. O Google (Sadowski et al., 2018) descreveu sua prática de revisão de código e indicou que as equipes valorizam mudanças pequenas e focadas; Bacchelli e Bird (2013) investigaram expectativas e desafios da revisão moderna, e Cohen (2006) reuniu evidências de que a eficácia da revisão cai quando a quantidade de código revisado por sessão cresce.

Uma descrição útil responde a quatro perguntas: o que muda, por que muda, como testar e onde olhar com atenção.

### 5.2 O tamanho do pull request

O programa a seguir analisa um conjunto de pull requests fictícios, classifica-os segundo um limite de referência e compara o número de comentários da revisão entre os grupos. Os dados são ilustrativos, mas o padrão que eles mostram é o descrito na literatura: revisões de mudanças grandes tendem a ser mais superficiais.

:::run 09/02-tamanho-revisao.py

O limite de 400 linhas é uma convenção de referência, não uma regra universal. O ponto da análise é a associação entre tamanho e atenção, e a conclusão prática é dividir o trabalho em partes revisáveis.

### 5.3 A postura de quem revisa

Do lado do revisor, o objetivo é melhorar o código e ensinar, e não demonstrar superioridade. Perguntas que pedem explicação costumam funcionar melhor do que ordens: "o que acontece se a lista estiver vazia?" é mais produtivo do que "troque isso". Separe o que é bloqueante do que é sugestão. Critique o código, nunca a pessoa.

Para quem recebe a revisão, o sinal de maturidade é responder com clareza, aceitar o que faz sentido e explicar, com dados, o que não faz. Discordar é normal; o importante é que a decisão final fique registrada.

:::quiz T-09-06 | 2 | revisão
P: Qual comentário de revisão tende a ser mais produtivo?
A) "Troque isso por outro método."
*B) "O que acontece se a lista estiver vazia nesse ponto?"
C) "Esse código é ruim."
D) "Não aprovo."
X: Perguntas abrem a discussão técnica e fazem o autor pensar no caso. Ordens fecham a discussão, e críticas pessoais geram defesa, não melhoria.
:::

:::exercicio T-09-E1 | 2 | fluxos
Uma equipe de quatro pessoas entrega uma vez por mês e trabalha em branches que vivem de duas a três semanas. Relate os riscos dessa prática e proponha uma mudança de fluxo, justificando-a pelo critério da seção 2.
:::gabarito
Os riscos: conflitos grandes e tardios na integração; divergência entre o que cada pessoa acredita que está na linha principal; revisões de mudanças grandes e, portanto, mais superficiais; e atraso no feedback dos testes, que só rodam no fim. A mudança proposta: adotar o GitHub Flow, com branches de no máximo um ou dois dias, integração diária na `main` e pull requests pequenos, acompanhados de uma revisão no mesmo dia. A justificativa é o critério do tempo de integração: reduzir a vida da branch reduz o custo de integração e antecipa conflitos. Para que a `main` continue sempre implantável, os testes devem rodar a cada pull request, e as funcionalidades incompletas podem ficar atrás de chaves de configuração.
:::

:::exercicio T-09-E2 | 3 | revisão
Você recebe um pull request de 1.500 linhas que mistura uma refatoração de módulo, a correção de um bug de cálculo e a atualização de três dependências. Escreva o comentário de revisão que você enviaria, explicando o problema e propondo a divisão.
:::gabarito
Um comentário bem construído: reconhece o esforço, explica que o tamanho e a mistura de mudanças dificultam a revisão e o diagnóstico de possíveis falhas, e propõe uma sequência de pull requests menores: (1) a atualização de dependências, com os testes passando; (2) a refatoração, com os testes de caracterização mostrando comportamento idêntico; (3) a correção de bug, com um teste que falhava antes e passa depois. Pode-se também pedir que a descrição de cada parte diga por que aquela mudança é necessária. A formulação deve ser uma sugestão com justificativa, e não uma ordem, e a autora ou o autor deve poder responder com argumentos.
:::

## 6. Mercado de trabalho {fa-briefcase}

Na indústria, a revisão de código é uma prática central de engenharia, e muitas organizações publicam seus guias de revisão. O guia do Google, por exemplo, orienta a aprovação de mudanças que melhorem a saúde do código e descreve expectativas para revisores e autores. O domínio do Git é pré-requisito para qualquer equipe, e a capacidade de explicar um histórico e de recuperar trabalho é valorizada em entrevistas. Plataformas como GitHub e GitLab tornaram os pull requests o centro do fluxo, com proteção da branch principal, exigência de revisão e de testes verdes.

## 7. Erros comuns {fa-triangle-exclamation}

- **Commit "ajustes" com quarenta arquivos.** Trabalho acumulado sem commits intermediários impede a revisão e a reversão.
- **Branch de semanas.** Integração tardia produz conflitos grandes e revisões superficiais.
- **Segredo no repositório.** Senhas e chaves commitadas devem ser consideradas comprometidas, mesmo após remoção do histórico.
- **Force push na branch principal.** Reescreve a história compartilhada e causa divergências para toda a equipe.
- **Revisão carimbo.** Aprovar sem ler reduz a revisão a um ritual.

## Resumo da aula {fa-square-check}

- O Git é um grafo de commits com referências; branches são ponteiros, e por isso são baratas.
- Merge preserva a história; rebase a reescreve, e não deve ser usado em commits publicados.
- O critério que escolhe o fluxo é o tempo até a integração: quanto menor, melhor.
- Commits devem ser unidades lógicas com mensagens que explicam o porquê.
- Pull requests pequenos e revisões construtivas são a principal defesa contra defeitos e contra a degradação do código.

## Referências {fa-book}

**Acadêmicas**

- BACCHELLI, A.; BIRD, C. Expectations, outcomes, and challenges of modern code review. In: *Proceedings of ICSE*, 2013.
- COHEN, J. *Best Kept Secrets of Peer Code Review*. Austin: SmartBear Software, 2006.
- FORSGREN, N.; HUMBLE, J.; KIM, G. *Accelerate: The Science of Lean Software and DevOps*. Portland: IT Revolution, 2018.
- SADOWSKI, C. et al. Modern code review: a case study at Google. In: *Proceedings of ICSE SEIP*, 2018.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.

**Prática e mercado**

- CHACON, S.; STRAUB, B. *Pro Git*. 2. ed. Apress, 2014. [git-scm.com/book](https://git-scm.com/book/en/v2)
- CONVENTIONAL COMMITS. *Conventional Commits 1.0.0*. [conventionalcommits.org](https://www.conventionalcommits.org/)
- DRIESSEN, V. *A successful Git branching model*. nvie.com, 2010. [nvie.com](https://nvie.com/posts/a-successful-git-branching-model/)
- GOOGLE. *Engineering Practices Documentation: code review*. [google.github.io/eng-practices](https://google.github.io/eng-practices/)
- TRUNK-BASED DEVELOPMENT. [trunkbaseddevelopment.com](https://trunkbaseddevelopment.com/)
- GITHUB. *GitHub flow*. [docs.github.com](https://docs.github.com/en/get-started/using-github/github-flow)
