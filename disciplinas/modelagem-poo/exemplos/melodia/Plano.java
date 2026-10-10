package melodia;

/** Planos da Melodia. Enum: só existem os valores declarados (tipo rico em vez de texto livre). */
public enum Plano {
    FREE(0.00, true),
    PREMIUM(19.90, false),
    FAMILIA(29.90, false);

    private final double precoMensal;
    private final boolean comAnuncios;

    Plano(double precoMensal, boolean comAnuncios) {
        this.precoMensal = precoMensal;
        this.comAnuncios = comAnuncios;
    }

    public double getPrecoMensal() { return precoMensal; }
    public boolean isComAnuncios() { return comAnuncios; }
}
