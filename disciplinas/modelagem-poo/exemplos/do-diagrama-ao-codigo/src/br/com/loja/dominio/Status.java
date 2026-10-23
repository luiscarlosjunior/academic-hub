package br.com.loja.dominio;

/** Vem do diagrama de máquina de estados do Pedido. */
public enum Status {
    ABERTO,
    AGUARDANDO_PAGAMENTO,
    PAGO,
    ENVIADO,
    ENTREGUE,
    CANCELADO
}
