package catalogo;

import reproducao.Player;

/** Ruim: a faixa sabe tocar a si mesma. Agora catalogo depende de reproducao... */
public record Musica(String id, String titulo, int segundos) {

    public String tocarPara(String usuario) {
        return new Player().reproduzir(usuario, this);
    }
}
