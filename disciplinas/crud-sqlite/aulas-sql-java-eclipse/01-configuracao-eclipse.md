# Configuração do Eclipse para o projeto biblioteca-sqlite

Tempo previsto: 15 minutos. Faça isso antes do dia 2 (de preferência no início do dia 1).

## Passo 1: conferir o JDK 17

1. Abra um terminal e rode `java -version`. A saída deve começar com `openjdk version "17`.
2. No Eclipse: **Eclipse > Settings** (macOS) ou **Window > Preferences** (Windows e Linux).
3. Vá em **Java > Installed JREs**. Deve existir um JDK 17 marcado como padrão. Se não existir, clique em **Add...** e aponte para a pasta do JDK.

## Passo 2: importar o projeto

1. **File > Import...**
2. Escolha **General > Existing Projects into Workspace** e clique em **Next**.
3. Em **Select root directory**, clique em **Browse** e escolha a pasta `codigo-fonte`.
4. O projeto `biblioteca-sqlite` aparece marcado. Clique em **Finish**.

Se o Eclipse perguntar sobre o *Java Build Path*, aceite o padrão.

## Passo 3: conferir as bibliotecas

No **Package Explorer**, expanda o projeto. Deve aparecer a seção **JRE System Library [JavaSE-17]** e a pasta **lib** com os dois JARs.

Se os JARs não aparecerem no classpath:

1. Clique com o botão direito no projeto e escolha **Build Path > Configure Build Path...**.
2. Na aba **Libraries**, clique em **Add JARs...** (se o JAR estiver dentro do projeto) ou **Add External JARs...**.
3. Selecione `sqlite-jdbc-3.46.1.0.jar` e `slf4j-api-2.0.13.jar` da pasta `lib`.
4. Clique em **Apply and Close**.

## Passo 4: codificação UTF-8

Os textos têm acentos (“Memórias Póstumas”). Para que eles apareçam certos no console:

1. Clique com o botão direito no projeto e escolha **Properties**.
2. Em **Resource > Text file encoding**, marque **Other** e escolha **UTF-8**.
3. Clique em **Apply and Close**.

## Passo 5: rodar a demonstração

1. Expanda `src/aula` e abra `Dia2Demo.java`.
2. Clique com o botão direito no arquivo e escolha **Run As > Java Application**.
3. No console deve aparecer `== 1. CREATE: inserir um livro`, seguido dos demais passos.
4. Depois de rodar, pressione **F5** no projeto para ver o arquivo `biblioteca_aula.db` aparecer na raiz.

Rode também `exercicio/ExercicioTeste.java`. Com o código completo, a saída deve terminar com `8 de 8 testes passaram.`

## Para o aluno: projeto de exercício

O projeto de exercício é `exercicios/dia2-java-aluno`. Ele é importado da mesma forma: **File > Import > Existing Projects into Workspace**, apontando para essa pasta. Ao rodar `ExercicioTeste` antes de implementar, a saída mostra FALHOU, com a mensagem `TODO: implementar ...`. Isso é esperado.

## Problemas comuns

| Mensagem | Causa | Solução |
|---|---|---|
| `No suitable driver found for jdbc:sqlite:...` | o JAR do SQLite não está no Build Path | refaça o Passo 3 |
| `Driver sqlite-jdbc não encontrado` | o JAR não está no Build Path | refaça o Passo 3 |
| `UnsupportedClassVersionError` | o Eclipse está usando um JDK anterior ao 17 | Passo 1, e depois **Run As > Run Configurations** para conferir o JRE |
| acentos aparecem como `?` ou `Ã` | codificação do arquivo | Passo 4 |
| `database is locked` | outro programa está com o arquivo aberto | feche o outro programa, ou o console SQL, e rode de novo |
| `SLF4J(W): No SLF4J providers were found` | aviso esperado | pode ignorar |

## Outras IDEs

- **VS Code:** instale o *Extension Pack for Java*. Abra a pasta `codigo-fonte`, crie a pasta `.vscode/` e, em `settings.json`, inclua `"java.project.referencedLibraries": ["lib/**/*.jar"]`. Os JARs passam a ser reconhecidos pelo *Java Projects* da barra lateral.
- **NetBeans:** **File > Open Project** e escolha `codigo-fonte`. Depois, clique com o botão direito em **Libraries > Add JAR/Folder** e escolha a pasta `lib`.
