# gerado por minicc a partir de programas/constantes.mini (2 variáveis, 8 dobras de constante)
    .text
    .globl _main
_main:
    push %rbp
    mov  %rsp, %rbp
    sub  $16, %rsp
    mov  $86400, %rax
    mov  %rax, -8(%rbp)        # segundos = ...
    mov  $21, %rax
    mov  %rax, -16(%rbp)        # limite = ...
    mov  -8(%rbp), %rax        # segundos
    imul $7, %rax
    mov  %rax, %rsi
    lea  formato(%rip), %rdi
    xor  %eax, %eax
    call _printf
    mov  $1, %rax
    cmp  $0, %rax
    je   .Lsenao0
    mov  -16(%rbp), %rax        # limite
    mov  %rax, %rsi
    lea  formato(%rip), %rdi
    xor  %eax, %eax
    call _printf
    jmp  .Lfimse0
.Lsenao0:
    mov  $0, %rax
    mov  %rax, %rsi
    lea  formato(%rip), %rdi
    xor  %eax, %eax
    call _printf
.Lfimse0:
    xor  %eax, %eax
    leave
    ret
    .data
formato:
    .asciz "%ld\n"
