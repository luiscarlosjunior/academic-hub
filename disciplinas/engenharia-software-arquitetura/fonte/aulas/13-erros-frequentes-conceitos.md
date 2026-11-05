title: Erros frequentes e conceitos do dia a dia: o que dá errado, por quê e como resolver
desc: Aula-coletânea sobre os erros mais comuns de quem programa: erros de Python com a mensagem real, erros de lógica, ponto flutuante, codificação, condições de corrida, N+1 medido em banco, injeção de SQL, erros de Git e de segurança, além dos conceitos do dia a dia e um método de investigação, com exemplos executados.
icon: fa-bug
favicon: 🏭
topic: es/13-erros-frequentes-conceitos
---

## Visão geral {fa-eye}

Esta é a **Aula 13**, uma coletânea de erros. Quase todo programador passa mais tempo lendo erros do que escrevendo código novo, e a diferença entre quem avança rápido e quem fica preso costuma estar em reconhecer um erro conhecido em segundos. Esta aula reúne os erros que aparecem com mais frequência em estudos com iniciantes, em guias técnicos e em relatos de produção. Para cada um, mostramos a **mensagem real**, a **causa**, a **correção** e a **prevenção**.

Ao final da aula você deverá ser capaz de:

- ler e interpretar as mensagens de erro mais comuns de Python;
- reconhecer erros de lógica, de precisão numérica e de codificação, e corrigi-los;
- explicar condições de corrida e o problema N+1 com medições reais;
- identificar injeção de SQL e outros riscos de segurança, e aplicar as correções padrão;
- diagnosticar problemas de Git e aplicar o método de investigação em quatro passos.

> [!info] Pré-requisitos
> Python básico e noções de SQL. Os exemplos usam apenas a biblioteca padrão, incluindo `sqlite3` e `decimal`.

> [!warn] Sobre as fontes e a frequência
> Nem todo item desta aula tem o mesmo grau de evidência. Há dados medidos em estudos com estudantes (Altadmri e Brown, 2015; Pritchard, 2016), dados de incidentes em nuvem e o OWASP Top 10. Há também listas de guias e tutoriais, que são experiência compartilhada, e não contagens. Não encontramos um ranking oficial de perguntas do Stack Overflow por tipo de erro; por isso, nenhuma frequência específica desse site é afirmada aqui.

:::mapa

## 1. Como ler um erro {fa-magnifying-glass}

Uma mensagem de erro tem três partes: o **tipo** (`AttributeError`), o **texto** (que diz o que foi tentado) e a **pilha** (as linhas do seu código e das bibliotecas que levaram ao erro). A regra prática é procurar a **primeira linha de código seu** na pilha, porque as linhas de biblioteca costumam ser consequência. Quando a mensagem menciona um valor, pergunte de onde ele veio.

O primeiro exemplo provoca os erros mais comuns de Python de propósito, e exibe o tipo e a mensagem exata que a linguagem produz. Leia cada mensagem como se fosse a primeira vez que a viu.

:::run 13/01-erros-python.py

Repare em três mensagens. `'NoneType' object has no attribute 'upper'` diz que a variável vale `None`, e a pergunta seguinte é de onde ele veio. `can only concatenate str (not "int") to str` diz que um texto foi somado a um número, o que quase sempre significa que um dado de entrada chegou como texto. `name 'variavel_inexistente' is not defined` aponta para um nome que nunca foi criado, geralmente por erro de digitação ou de escopo.

:::quiz T-13-01 | 1 | leitura de erros
P: Em um traceback, qual linha deve ser examinada primeiro, para localizar um erro causado pelo próprio código?
A) A última linha, que contém a mensagem de erro.
*B) A primeira linha de código do próprio projeto na pilha, porque as linhas de biblioteca costumam ser consequência.
C) A primeira linha do arquivo de biblioteca.
D) Nenhuma; o erro deve ser ignorado se a biblioteca for confiável.
X: A mensagem informa o tipo do erro, mas a causa costuma estar na primeira linha do seu código. As linhas de biblioteca mostram o caminho até a falha, não a origem.
:::

## 2. Erros de lógica {fa-brain}

Erros de lógica são os mais caros, porque o programa roda sem nenhuma mensagem. Quem os resolve é quem sabe o que o programa deveria fazer. Os mais frequentes são:

- **Off-by-one**: o laço percorre uma posição a mais ou a menos. O exemplo a seguir mostra o caso clássico de `range(len(v) + 1)`, que chega ao índice fora da lista.
- **Argumento padrão mutável**: o valor padrão de um parâmetro é criado uma única vez, quando a função é definida, e compartilhado entre chamadas. É um dos erros mais surpreendentes de Python, e está documentado no tutorial oficial da linguagem.

:::run 13/03-off-by-one-e-default.py

Na segunda parte, a segunda chamada devolve `[1, 2]` quando se esperaria `[2]`. O estado persistiu entre chamadas por causa do objeto padrão. A correção é usar `None` como sentinela e criar a lista dentro da função.

> [!tip] Técnica para erros de lógica
> Escreva um caso com a entrada mais simples possível e o resultado esperado calculado à mão. Se o programa diverge da conta, o problema está entre os dois. É a mesma ideia do teste de unidade da Aula 3.

:::quiz T-13-02 | 2 | lógica
P: Um laço percorre `range(len(v) + 1)` sobre uma lista `v`. Qual é o resultado mais provável?
A) O laço percorre exatamente todos os elementos sem erro.
*B) O último índice acessado está fora da lista, e ocorre `IndexError`.
C) O laço nunca executa.
D) A lista é modificada automaticamente.
X: `range(n)` produz os índices de 0 a n − 1. Somar 1 ao tamanho inclui um índice que não existe, o clássico off-by-one.
:::

:::quiz T-13-03 | 2 | lógica
P: Uma função tem `def f(item, lista=[])`. Após duas chamadas `f(1)` e `f(2)`, o que a segunda devolve?
A) `[2]`, porque cada chamada cria uma lista nova.
*B) `[1, 2]`, porque o valor padrão é criado uma única vez e compartilhado.
C) Um erro de tipo.
D) `None`.
X: O objeto padrão é avaliado na definição da função. Mutações nele persistem entre chamadas. A correção padrão é `lista=None` e criação dentro da função.
:::

## 3. Ponto flutuante e dinheiro {fa-calculator}

`0.1 + 0.2` produz `0.30000000000000004`. A causa não é do Python: o padrão IEEE 754, usado por praticamente todas as linguagens, armazena números em binário, e a maioria das frações decimais não tem representação exata nesse formato. Goldberg (1991) apresentou essa análise em um artigo clássico da área, ainda a referência para o tema. Os erros se acumulam em somas repetidas.

Para valores monetários, a solução é usar `decimal.Decimal` criado a partir de **texto**, e não de float: criar um `Decimal` a partir de um float carrega o erro do float.

:::run 13/02-ponto-flutuante.py

A saída mostra três fatos: o erro existe; `isclose` compara com tolerância; e `Decimal(0.1)` já nasce com a expansão binária do float, enquanto `Decimal("0.1")` é exato. A soma de dez vezes 0,1 com float dá `1.0`, mas a comparação com um valor de precisão finita é frágil. Em sistemas de pagamento, o padrão é trabalhar com `Decimal` ou com inteiros em centavos.

:::quiz T-13-04 | 2 | ponto flutuante
P: Para representar o preço de um produto e calcular impostos, qual é a abordagem mais adequada?
A) `float`, porque é mais rápido.
*B) `Decimal` criado a partir de texto, ou inteiros em centavos.
C) `float` arredondado com `round` apenas na exibição.
D) Strings, sem conversão.
X: Valores monetários exigem aritmética decimal exata. Criar `Decimal` a partir de float reintroduz o erro binário, e arredondar só na exibição não corrige as somas intermediárias.
:::

## 4. Codificação de texto {fa-font}

Acentos são bytes diferentes conforme a codificação. Quando um arquivo salvo em uma codificação é lido como outra, o resultado é texto corrompido, com caracteres como "SÃ£o". Quando o programa tenta decodificar bytes que não formam UTF-8 válido, aparece `UnicodeDecodeError`. Spolsky (2003) explicou o problema com clareza em um texto que se tornou referência para desenvolvedores. O exemplo mostra os dois casos.

:::run 13/07-codificacao.py

A regra é declarar a codificação em toda leitura e escrita de texto. Quando o arquivo vem de uma fonte com codificação desconhecida, descubra-a antes de adivinhar (um editor de texto costuma mostrar a codificação), e use `errors="replace"` apenas como recuperação consciente, porque ele substitui bytes sem avisar.

:::quiz T-13-05 | 2 | codificação
P: Um arquivo de texto com acentos foi salvo em latin-1 e lido como UTF-8, e a leitura falha com `UnicodeDecodeError`. Qual é a correção adequada?
A) Usar `errors="ignore"` para descartar os bytes problemáticos.
*B) Descobrir a codificação real do arquivo e informá-la na leitura, por exemplo `encoding="latin-1"`.
C) Converter o arquivo para PDF antes de ler.
D) Trocar todos os acentos por letras sem acento.
X: Informar a codificação correta preserva os caracteres. `errors="ignore"` e substituições silenciosas perdem informação sem avisar.
:::

## 5. Condições de corrida {fa-code-compare}

Uma **condição de corrida** ocorre quando o resultado de um programa depende da ordem em que operações concorrentes se intercalam. O padrão mais comum é o *check-then-act*: o programa verifica uma condição e age com base nela, mas outra execução muda a condição entre a verificação e a ação. Um saldo que fica negativo apesar da verificação é o sintoma clássico.

O exemplo a seguir reproduz a intercalação de forma **determinística**, para que o defeito apareça sempre, e não apenas em algumas execuções. Duas verificações de saque ocorrem antes de qualquer débito, como aconteceria com duas threads.

:::run 13/04-condicao-corrida.py

A primeira parte mostra o defeito: dois saques de 80 sobre saldo 100 resultam em −60, porque ambas as verificações viram saldo suficiente. A segunda parte mostra a seção protegida, em que a verificação e o débito formam uma única operação. Uma honestidade metodológica é necessária: nesta segunda parte, as chamadas são sequenciais, e a proteção real contra concorrência exige uma trava (`threading.Lock`) ou uma operação atômica no banco. O ponto ilustrado é a estrutura da correção, que é tornar verificação e ação indivisíveis.

:::quiz T-13-06 | 3 | concorrência
P: Qual é a correção estrutural para um padrão check-then-act com dois clientes concorrentes?
A) Aumentar o número de servidores para reduzir a chance de coincidência.
*B) Tornar a verificação e a ação uma operação indivisível, por trava, operação atômica ou atualização condicional no banco.
C) Repetir a verificação várias vezes antes de agir.
D) Usar `float` para o saldo, porque é mais preciso.
X: Repetir a verificação não elimina a janela entre verificar e agir. A correção é impedir que outra operação intercale entre as duas etapas.
:::

## 6. N+1: consultas que crescem com os dados {fa-database}

O problema N+1 aparece quando uma consulta busca N registros e, depois, uma consulta extra é feita para cada um deles. Com 10 registros, parecem 11 consultas rápidas; com 10.000, são 10.001 consultas, e a página que parecia instantânea passa a levar segundos. Muitos ORMs carregam relações de forma preguiçosa, o que torna o problema silencioso, porque o acesso a uma relação dentro de um laço dispara uma consulta por iteração.

O exemplo mede o problema de forma real: o `sqlite3` registra cada instrução executada, e o programa compara a versão de uma consulta por autor com a versão de junção única.

:::run 13/05-n-mais-1.py

Os números são exatos: 51 consultas para listar 50 autores, contra uma única consulta com junção. A diferença cresce linearmente com o número de autores. A correção, em ORMs, é pedir a relação de forma explícita (carregamento antecipado, como `selectinload` no SQLAlchemy, `select_related` e `prefetch_related` no Django). A detecção deve ocorrer durante o desenvolvimento, contando consultas por página.

:::quiz T-13-07 | 2 | N+1
P: Uma página lista 20 pedidos e, para cada um, consulta o cliente em outra consulta. Quantas consultas são feitas no total, no padrão N+1?
A) 1.
*B) 21.
C) 20.
D) 400.
X: Uma consulta para os 20 pedidos mais uma para cada um dos 20 clientes resultam em 21 consultas. O total cresce com N, e não permanece constante.
:::

## 7. Injeção de SQL {fa-shield-halved}

A injeção de SQL ocorre quando a entrada do usuário é montada diretamente no texto da consulta, e passa a alterar a sua lógica. A categoria *Injection* do OWASP Top 10 (OWASP, 2021) ocupa lugar de destaque entre os riscos de aplicações web, e o problema é conhecido há décadas. Halfond, Viegas e Orso (2006) classificaram ataques de injeção e contramedidas. A correção padrão é a consulta parametrizada, em que o driver trata o valor como dado.

:::run 13/06-injecao-sql.py

A consulta montada por concatenação devolve todos os clientes, porque o texto digitado fecha a cláusula de comparação e acrescenta uma condição verdadeira. A consulta parametrizada trata a mesma entrada como um nome literal, e não encontra nenhum registro.

:::quiz T-13-08 | 2 | segurança
P: Qual prática elimina a injeção de SQL em uma consulta que recebe um nome digitado pelo usuário?
A) Remover aspas simples da entrada antes de montar a consulta.
*B) Usar uma consulta parametrizada, passando o valor como parâmetro separado do texto SQL.
C) Limitar o tamanho da entrada a dez caracteres.
D) Ocultar a consulta do usuário no código-fonte.
X: A parametrização separa código e dado. Filtros de texto são frágeis, porque sempre existe uma forma de contorná-los; a separação elimina a classe de ataque.
:::

## 8. Git: erros recorrentes e como desfazê-los {fa-code-branch}

Relatos de erros de Git se repetem: commits na branch errada, arquivos apagados sem querer, conflitos grandes por branches longas e senhas commitadas. A maioria é recuperável, porque o Git guarda o histórico de referências por um bom tempo. O recurso mais útil é o `reflog`, que mostra onde o `HEAD` esteve. A tabela a seguir reúne os casos mais comuns.

| Erro | Como identificar | Como desfazer |
|---|---|---|
| Commit feito na `main` por engano (não publicado) | `git log` mostra o commit | `git branch feature/x` para guardar o commit; depois, na `main`, `git reset --hard origin/main` |
| Commit com arquivos demais | commit local, não publicado | `git reset --soft HEAD~1` mantém as mudanças staged |
| Arquivo apagado sem querer | `git status` mostra "deleted" | `git restore arquivo` |
| Trabalho perdido após um reset | o commit não aparece no `git log` | `git reflog` localiza o estado; `git reset --hard <id>` volta a ele |
| Senha commitada | aparece no histórico | trocar a credencial primeiro; depois remover do histórico com ferramenta própria |
| Conflito de merge | marcadores `<<<<<<<` no arquivo | escolher o trecho correto, remover os marcadores, `git add` e `git commit` |

Regras que evitam a maioria dos problemas: criar a branch antes de começar, fazer commits pequenos, nunca usar `push --force` em branch compartilhada e guardar trabalho pendente com `git stash` antes de trocar de branch.

:::quiz T-13-09 | 2 | Git
P: Você fez um reset que parece ter perdido um commit importante, que não aparece no `git log`. Qual é o primeiro comando a executar?
A) `git push --force` para recuperar a versão do servidor.
*B) `git reflog`, que registra as posições anteriores do `HEAD` e permite localizar o commit.
C) Apagar o repositório e clonar de novo.
D) `git commit --amend` para criar um commit novo.
X: O reflog preserva o rastro das referências. O commit geralmente ainda existe; é preciso localizá-lo antes de qualquer ação destrutiva.
:::

## 9. Conceitos do dia a dia {fa-book-open}

Estes são os conceitos que mais aparecem quando um programa sai da sala de aula, com o problema típico e a forma de resolver:

- **Ambiente virtual e dependências.** Um espaço isolado com as bibliotecas do projeto, em versões fixas. *Problema:* "funciona na minha máquina". *Solução:* um ambiente por projeto (`python -m venv .venv`) e um arquivo de dependências versionado.
- **Interpretador errado.** O `pip` instalou o pacote em um Python e o programa roda com outro. *Solução:* usar `python -m pip install` e conferir qual interpretador está em uso.
- **Variáveis de ambiente.** Configurações fora do código. *Problema:* `KeyError` ou `None` ao ler uma configuração ausente. *Solução:* leitura com valor padrão seguro, ou falha clara quando a configuração é obrigatória.
- **Status HTTP.** 2xx indica sucesso; 4xx indica que o cliente errou (400, 401, 403, 404, 422); 5xx indica falha do servidor (500). *Solução:* se for 4xx, procure o problema na requisição; se for 5xx, procure nos logs do servidor.
- **JSON e contratos.** A API muda um tipo ou um campo opcional some. *Solução:* validar a entrada na borda (Aula 10) e tratar campos ausentes com `get`.
- **Cache.** O sistema mostra dado antigo. *Solução:* definir tempo de validade e invalidar quando o dado muda. Quando um dado "some" ou "volta", desconfie do cache antes do código.
- **Fuso horário.** Comparar datas locais com datas em UTC produz erros sazonais. *Solução:* armazenar em UTC e converter apenas para exibição.
- **Código assíncrono.** O resultado ainda não existe quando o código o usa. *Solução:* confirmar que o resultado está pronto antes de usá-lo, e não bloquear a interface com operações longas.

## 10. Método para investigar um erro novo {fa-route}

Quando o erro não está nesta aula, siga quatro passos, nessa ordem:

1. **Leia a mensagem inteira.** Tipo, texto, arquivo e linha. A maior parte das respostas está ali.
2. **Reproduza com o caso mínimo.** Reduza a entrada e o código até o menor exemplo que ainda falha. Esse passo sozinho resolve muitos problemas.
3. **Forme uma hipótese e teste uma coisa de cada vez.** Confirme com um `print` ou um ponto de parada, e só depois mude o código.
4. **Pesquise com o texto exato.** Copie a mensagem entre aspas, sem o nome do seu arquivo. Os resultados costumam trazer a causa comum.

Para pedir ajuda, leve três coisas: a mensagem completa, o código mínimo que reproduz o problema e o que você já tentou. Uma pergunta com exemplo pequeno é respondida mais rápido, e a formulação ajuda quem pergunta a pensar no problema.

:::exercicio T-13-E1 | 2 | diagnóstico
Um programa de cálculo de média devolve `TypeError: unsupported operand type(s) for +: 'int' and 'str'` ao somar as notas lidas de um arquivo CSV. Descreva as hipóteses mais prováveis, o caso mínimo que você usaria para confirmar a causa e a correção.
:::gabarito
Hipóteses: as notas foram lidas como texto (um arquivo CSV entrega sempre strings, e a conversão para número foi esquecida ou feita de forma incompleta); há um cabeçalho ou uma linha vazia sendo somada como texto; ou um separador decimal com vírgula impede a conversão. O caso mínimo: uma linha do arquivo com uma única nota e a execução do trecho de conversão, com `print(type(valor))` para cada campo. A correção: converter os campos numéricos logo na leitura (`float(valor.replace(",", "."))`), ignorar o cabeçalho e tratar linhas vazias, e validar os tipos na borda, como na Aula 10. A confirmação deve mostrar que o tipo de cada nota é `str` antes da conversão e `float` depois.
:::

:::exercicio T-13-E2 | 3 | segurança e produção
Uma página de relatório carrega em 0,3 s com 50 registros de teste e leva 40 s em produção, com 20.000 registros. Descreva a hipótese mais provável, indique a medição que a confirma e proponha a correção, incluindo como evitar a regressão.
:::gabarito
A hipótese mais provável é o problema N+1: o código acessa uma relação dentro de um laço, e uma consulta é feita por registro. Com 50 registros, o custo é pequeno e imperceptível; com 20.000, o número de consultas cresce proporcionalmente. A medição de confirmação é contar as consultas executadas por requisição (com o log do banco ou um contador como o da Aula 13), e verificar que o número é aproximadamente igual ao número de registros mais um. A correção é pedir a relação de forma antecipada (uma consulta com junção ou uma consulta batida com `IN`). Para evitar a regressão, um teste deve afirmar que o número de consultas por requisição não depende do número de registros, usando um conjunto de dados maior no teste. A conclusão importante é que um teste com poucos dados não detecta esse tipo de defeito, e o tamanho do conjunto de teste faz parte da qualidade do teste.
:::

## Resumo da aula {fa-square-check}

- Leia o erro inteiro e procure a primeira linha de código seu na pilha.
- Erros de lógica se corrigem com casos mínimos e contas feitas à mão.
- Dinheiro não se representa com `float`; texto se decodifica com a codificação declarada.
- Condições de corrida se eliminam tornando verificação e ação indivisíveis.
- Consultas se parametrizam, relações se carregam juntas e erros de Git quase sempre são recuperáveis pelo reflog.

## Referências {fa-book}

**Acadêmicas e fundacionais**

- ALTADMRI, A.; BROWN, N. C. C. 37 million compilations: investigating novice programming mistakes on large-scale student data. In: *Proceedings of SIGCSE*, 2015. [ar5iv.labs.arxiv.org/html/1509.07238](https://ar5iv.labs.arxiv.org/html/1509.07238)
- GOLDBERG, D. What every computer scientist should know about floating-point arithmetic. *ACM Computing Surveys*, v. 23, n. 1, p. 5–48, 1991.
- HALFOND, W. G. J.; VIEGAS, J.; ORSO, A. A classification of SQL injection attacks and countermeasures. In: *Proceedings of the IEEE International Symposium on Secure Software Engineering*, 2006.
- HERLIHY, M.; SHAVIT, N. *The Art of Multiprocessor Programming*. Burlington: Morgan Kaufmann, 2008.
- KERNIGHAN, B. W.; PIKE, R. *The Practice of Programming*. Reading: Addison-Wesley, 1999.
- PRITCHARD, D. Novice programming mistakes. *Never Work in Theory*, 2016. [neverworkintheory.org](https://neverworkintheory.org/2016/06/09/novice-programming-mistakes.html)
- CHATTERJEE, P. et al. Finding help with programming errors: an exploratory study of novice software engineers' focus in Stack Overflow posts. *Journal of Systems and Software*, 2020. DOI [10.1016/j.jss.2019.110454](https://doi.org/10.1016/j.jss.2019.110454). Consultado por resumos, não na íntegra.

**Prática, normas e mercado**

- OWASP. *OWASP Top 10:2021*. [owasp.org/Top10](https://owasp.org/Top10/)
- OWASP. *SQL Injection Prevention Cheat Sheet*. [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- PYTHON SOFTWARE FOUNDATION. *Floating Point Arithmetic: Issues and Limitations*. [docs.python.org/3/tutorial/floatingpoint.html](https://docs.python.org/3/tutorial/floatingpoint.html)
- PYTHON SOFTWARE FOUNDATION. *decimal — Decimal fixed-point and floating-point arithmetic*. [docs.python.org/3/library/decimal.html](https://docs.python.org/3/library/decimal.html)
- PYTHON SOFTWARE FOUNDATION. *Unicode HOWTO*. [docs.python.org/3/howto/unicode.html](https://docs.python.org/3/howto/unicode.html)
- SPOLSKY, J. *The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets*. 2003. [joelonsoftware.com](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/)
- SQLALCHEMY. *Relationship Loading Techniques*. [docs.sqlalchemy.org](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html)
- GIT. *git-reflog documentation*. [git-scm.com/docs/git-reflog](https://git-scm.com/docs/git-reflog)
