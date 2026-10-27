package biblioteca;

/**
 * Registro de um livro. Um record é imutável: para mudar um valor, cria-se outro objeto.
 * O id é null antes de a linha ser gravada e recebe o valor gerado pelo banco depois.
 */
public record Livro(Long id, String titulo, int ano, double preco, String isbn) {

    @Override
    public String toString() {
        return String.format("#%s %s (%d) R$ %.2f%s", id, titulo, ano, preco,
                isbn == null ? "" : " ISBN " + isbn);
    }
}
