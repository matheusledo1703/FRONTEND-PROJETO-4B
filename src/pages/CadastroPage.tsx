import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../api/axios";
import { Campo } from "../componentes/Campo";
import { cadastroSchema } from "../utils/validadores";
import type { Erros, UsuarioForm } from "../types/usuario";

const vazio: UsuarioForm = { nome: "", email: "", cpf: "", senha: "", confirmarSenha: "" };

export function CadastroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<UsuarioForm>(vazio);
  const [erros, setErros] = useState<Erros>({});
  const [erroApi, setErroApi] = useState("");

  function alterar(name: string, valor: string) {
    setForm({ ...form, [name]: valor });
  }

  async function enviar(event: SyntheticEvent) {
    event.preventDefault();
    setErroApi("");

    // Validação no front (zod)
    const resultado = cadastroSchema.safeParse(form);
    if (!resultado.success) {
      const novos: Erros = {};
      for (const issue of resultado.error.issues) {
        const campo = issue.path[0] as keyof UsuarioForm;
        if (!novos[campo]) novos[campo] = issue.message;
      }
      setErros(novos);
      return;
    }
    setErros({});

    try {
      await api.post("/users", {
        nome: form.nome,
        email: form.email,
        cpf: form.cpf,
        password: form.senha,
      });
      navigate("/login"); // redireciona para o login após o cadastro
    } catch (error) {
      // Mensagens de erro da API de forma amigável
      if (axios.isAxiosError(error) && error.response) {
        const { campo, mensagem } = error.response.data;
        if (campo) setErros({ [campo]: mensagem });
        else setErroApi(mensagem ?? "Não foi possível concluir o cadastro");
      } else {
        setErroApi("Não foi possível conectar ao servidor. Tente novamente.");
      }
    }
  }

  return (
    <form className="cadastro" onSubmit={enviar}>
      <h1>Criar conta</h1>

      <Campo label="Nome" name="nome" value={form.nome} erro={erros.nome} onChange={alterar} />
      <Campo label="Email" name="email" value={form.email} erro={erros.email} onChange={alterar} />
      <Campo label="CPF" name="cpf" value={form.cpf} erro={erros.cpf} onChange={alterar} />
      <Campo label="Senha" name="senha" type="password" value={form.senha} erro={erros.senha} onChange={alterar} />
      <Campo label="Confirmar senha" name="confirmarSenha" type="password" value={form.confirmarSenha} erro={erros.confirmarSenha} onChange={alterar} />

      {erroApi && <p className="erro">{erroApi}</p>}

      <button type="submit">Cadastrar</button>
      <p>Já tem conta? <Link to="/login">Entrar</Link></p>
    </form>
  );
}
