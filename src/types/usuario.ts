export type UsuarioForm = {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
};

export type Erros = Partial<Record<keyof UsuarioForm, string>>;
