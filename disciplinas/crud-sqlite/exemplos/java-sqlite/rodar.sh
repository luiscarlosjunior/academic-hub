#!/bin/bash
# Roda a aplicação de console. Passe um arquivo de entrada opcional, ou digite pelo teclado.
#   ./rodar.sh                      -> menu interativo
#   ./rodar.sh < entrada-exemplo.txt
java -cp "out:lib/*" biblioteca.App "$@"
