package app;

import assinatura.AssinaturaAtiva;
import catalogo.CatalogoMemoria;
import catalogo.Musica;
import reproducao.Player;

/** Ponto de montagem (composition root): só aqui os componentes são ligados entre si. */
public class Main {

    public static void main(String[] args) {
        CatalogoMemoria catalogo = new CatalogoMemoria(
                new Musica("m1", "Aquarela", 200),
                new Musica("m2", "Garota", 180));
        AssinaturaAtiva assinaturas = new AssinaturaAtiva("ana");
        Player player = new Player(catalogo, assinaturas);

        System.out.println(player.tocar("ana", "m1"));
        System.out.println(player.tocar("bruno", "m2"));
        System.out.println(player.tocar("ana", "m9"));
    }
}
