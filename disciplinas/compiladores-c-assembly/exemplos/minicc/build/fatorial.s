# gerado por minicc a partir de programas/fatorial.mini (2 variáveis, 0 dobras de constante)
    .text
    .globl _main
_main:
    push %rbp
    mov  %rsp, %rbp
    sub  $16, %rsp
    mov  $10, %rax
    mov  %rax, -8(%rbp)        # n = ...
    mov  $1, %rax
    mov  %rax, -16(%rbp)        # f = ...
.Lteste0:
    mov  -8(%rbp), %rax        # n
    push %rax
    mov  $1, %rax
    mov  %rax, %rdi
    pop  %rax
    cmp  %rdi, %rax
    setg %al
    movzb %al, %rax
    cmp  $0, %rax
    je   .Lfimlaco0
    mov  -16(%rbp), %rax        # f
    push %rax
    mov  -8(%rbp), %rax        # n
    mov  %rax, %rdi
    pop  %rax
    imul %rdi, %rax
    mov  %rax, -16(%rbp)        # f = ...
    mov  -8(%rbp), %rax        # n
    sub  $1, %rax
    mov  %rax, -8(%rbp)        # n = ...
    jmp  .Lteste0
.Lfimlaco0:
    mov  -16(%rbp), %rax        # f
    mov  %rax, %rsi
    lea  formato(%rip), %rdi
    xor  %eax, %eax
    call _printf
    xor  %eax, %eax
    leave
    ret
    .data
formato:
    .asciz "%ld\n"
