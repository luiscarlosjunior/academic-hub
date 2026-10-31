# gerado por minicc a partir de programas/primos.mini (3 variáveis, 0 dobras de constante)
    .text
    .globl _main
_main:
    push %rbp
    mov  %rsp, %rbp
    sub  $32, %rsp
    mov  $2, %rax
    mov  %rax, -8(%rbp)        # n = ...
.Lteste0:
    mov  -8(%rbp), %rax        # n
    push %rax
    mov  $40, %rax
    mov  %rax, %rdi
    pop  %rax
    cmp  %rdi, %rax
    setle %al
    movzb %al, %rax
    cmp  $0, %rax
    je   .Lfimlaco0
    mov  $2, %rax
    mov  %rax, -16(%rbp)        # d = ...
    mov  $1, %rax
    mov  %rax, -24(%rbp)        # primo = ...
.Lteste1:
    mov  -16(%rbp), %rax        # d
    push %rax
    mov  -16(%rbp), %rax        # d
    mov  %rax, %rdi
    pop  %rax
    imul %rdi, %rax
    push %rax
    mov  -8(%rbp), %rax        # n
    mov  %rax, %rdi
    pop  %rax
    cmp  %rdi, %rax
    setle %al
    movzb %al, %rax
    cmp  $0, %rax
    je   .Lfimlaco1
    mov  -8(%rbp), %rax        # n
    push %rax
    mov  -16(%rbp), %rax        # d
    mov  %rax, %rdi
    pop  %rax
    cqo
    idiv %rdi
    mov  %rdx, %rax
    push %rax
    mov  $0, %rax
    mov  %rax, %rdi
    pop  %rax
    cmp  %rdi, %rax
    sete %al
    movzb %al, %rax
    cmp  $0, %rax
    je   .Lsenao2
    mov  $0, %rax
    mov  %rax, -24(%rbp)        # primo = ...
    jmp  .Lfimse2
.Lsenao2:
.Lfimse2:
    mov  -16(%rbp), %rax        # d
    add  $1, %rax
    mov  %rax, -16(%rbp)        # d = ...
    jmp  .Lteste1
.Lfimlaco1:
    mov  -24(%rbp), %rax        # primo
    cmp  $0, %rax
    je   .Lsenao3
    mov  -8(%rbp), %rax        # n
    mov  %rax, %rsi
    lea  formato(%rip), %rdi
    xor  %eax, %eax
    call _printf
    jmp  .Lfimse3
.Lsenao3:
.Lfimse3:
    mov  -8(%rbp), %rax        # n
    add  $1, %rax
    mov  %rax, -8(%rbp)        # n = ...
    jmp  .Lteste0
.Lfimlaco0:
    xor  %eax, %eax
    leave
    ret
    .data
formato:
    .asciz "%ld\n"
