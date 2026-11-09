import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, tratarErro } from "../api/axios";
import { Campo } from "../componentes/Campo";
import { useAuth } from "../contexto/AuthContext";
import type { Usuario } from "../types";
import { errosDoZod, loginSchema } from "../utils";

// O que outras telas mandam para cá
type Estado = { email?: string; de?: string };

export function LoginPage() {
    const navigate = useNavigate();
    const estado = (useLocation().state ?? {}) as Estado;
    const { usuario, entrar } = useAuth();

    const [form, setForm] = useState({ email: estado.email ?? "", senha: "" });
    const [erros, setErros] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Quem já está logado não precisa do login
    if (usuario) return <Navigate to={estado.de ?? "/estatisticas"} replace />;

    function alterar(campo: string, valor: string) {
        setForm({ ...form, [campo]: valor });
        setErros({ ...erros, [campo]: "" });
    }

    async function onFormSubmit(event: SyntheticEvent) {
        event.preventDefault();

        const resultado = loginSchema.safeParse(form);

        if (!resultado.success) {
            setErros(errosDoZod(resultado.error));
            return;
        }

        setLoading(true);

        try {
            const resposta = await api.post<{ token: string; usuario: Usuario }>("/login", form);

            entrar(resposta.data.token, resposta.data.usuario); // salva o token no localStorage
            navigate(estado.de ?? "/estatisticas", { replace: true }); // área logada
        } catch (erro) {
            const { mensagem, campo } = tratarErro(erro);

            if (campo === "email" || campo === "senha") {
                setErros({ [campo]: mensagem });
            } else {
                toast.error(mensagem);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onFormSubmit} className="cartao" noValidate>
            <img src="/favicon.svg" alt="" className="coracao" />
            <h1>Entrar</h1>

            <Campo label="E-mail" name="email" type="email" value={form.email} onChange={alterar} erro={erros.email} />
            <Campo label="Senha" name="senha" type="password" value={form.senha} onChange={alterar} erro={erros.senha} />

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Aguarde..." : "Entrar"}
            </button>

            <p>Ainda não tem conta? <Link to="/cadastro">Criar conta</Link></p>
        </form>
    );
}
