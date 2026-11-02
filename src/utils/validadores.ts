import { z } from "zod";

export function validarCpf(valor: string): boolean {
  const cpf = valor.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digito = (tamanho: number): number => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10]);
}

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres"),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email inválido"),
    cpf: z.string().refine(validarCpf, "CPF inválido"),
    senha: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres")
      .regex(/[A-Z]/, "Senha precisa de uma letra maiúscula")
      .regex(/[a-z]/, "Senha precisa de uma letra minúscula")
      .regex(/\d/, "Senha precisa de um número")
      .regex(/[^A-Za-z0-9]/, "Senha precisa de um símbolo"),
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });
