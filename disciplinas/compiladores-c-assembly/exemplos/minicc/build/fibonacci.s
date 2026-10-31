# gerado por minicc a partir de programas/fibonacci.mini (4 variáveis, 0 dobras de constante)
    .text
    .globl _main
_main:
    push %rbp
    mov  %rsp, %rbp
    sub  $32, %rsp
    mov  $0, %rax
    mov  %rax, -8(%rbp)        # a = ...
    mov  $1, %rax
    mov  %rax, -16(%rbp)        # b = ...
    mov  $0, %rax
    mov  %rax, -24(%rbp)        # i = ...
.Lteste0:
    mov  -24(%rbp), %rax        # i
    push %rax
    mov  $12, %rax
    mov  %rax, %rdi
    pop  %rax
    cmp  %rdi, %rax
    setl %al
    movzb %al, %rax
    cmp  $0, %rax
    je   .Lfimlaco0
    mov  -8(%rbp), %rax        # a
    mov  %rax, %rsi
    lea  formato(%rip), %rdi
    xor  %eax, %eax
    call _printf
    mov  -8(%rbp), %rax        # a
    push %rax
    mov  -16(%rbp), %rax        # b
    mov  %rax, %rdi
    pop  %rax
    add  %rdi, %rax
    mov  %rax, -32(%rbp)        # t = ...
    mov  -16(%rbp), %rax        # b
    mov  %rax, -8(%rbp)        # a = ...
    mov  -32(%rbp), %rax        # t
    mov  %rax, -16(%rbp)        # b = ...
    mov  -24(%rbp), %rax        # i
    add  $1, %rax
    mov  %rax, -24(%rbp)        # i = ...
    jmp  .Lteste0
.Lfimlaco0:
    xor  %eax, %eax
    leave
    ret
    .data
formato:
    .asciz "%ld\n"
