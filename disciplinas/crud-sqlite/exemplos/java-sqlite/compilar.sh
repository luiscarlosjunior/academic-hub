#!/bin/bash
# Compila o projeto e as demonstrações. Use a partir desta pasta.
# Requer o JDK 17 ou mais recente e os JARs em lib/.
set -e
mkdir -p out
javac -encoding UTF-8 -cp "lib/*" -d out $(find src -name "*.java")
echo "compilado em out/"
