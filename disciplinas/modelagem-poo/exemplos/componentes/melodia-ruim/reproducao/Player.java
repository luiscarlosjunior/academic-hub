package reproducao;

import catalogo.Musica;

/** ...e reproducao depende de catalogo (Musica). Ciclo: catalogo -> reproducao -> catalogo. */
public class Player {

    public String reproduzir(String usuario, Musica m) {
        return "tocando " + m.titulo() + " (" + m.segundos() + " s) para " + usuario;
    }
}
