import { useState } from "react";
import type { SyntheticEvent } from "react";
import { toast } from "react-toastify";
import { api, tratarErro } from "../api/axios";
import { Campo } from "../componentes/Campo";
import { useAuth } from "../contexto/AuthContext";
import type { Usuario } from "../types";
import { edicaoSchema, errosDoZod, formatarCpf, nivelDaSenha } from "../utils";

export function PerfilPage() {
    const { usuario, atualizar } = useAuth(); // dados do usuário vêm do contexto
    const [form, setForm] = useState({
        nome: usuario?.nome ?? "",
        cpf: formatarCpf(usuario?.cpf ?? ""),
        senha: "",
        confirmarSenha: ""
    });
    const [erros, setErros] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    function alterar(campo: string, valor: string) {
        setForm({ ...form, [campo]: campo === "cpf" ? formatarCpf(valor) : valor });
        setErros({ ...erros, [campo]: "" });
    }

    async function onFormSubmit(event: SyntheticEvent) {
        event.preventDefault();

        const resultado = edicaoSchema.safeParse(form);

        if (!resultado.success) {
            setErros(errosDoZod(resultado.error));
            return;
        }

        setLoading(true);

        try {
            // O e-mail não vai no corpo: ele não pode ser alterado
            const resposta = await api.put<Usuario>(`/usuarios/${usuario?.id}`, {
                nome: form.nome,
                cpf: form.cpf,
                senha: form.senha
            });

            atualizar(resposta.data); // o nome novo já aparece no Header
            setForm({ ...form, senha: "", confirmarSenha: "" });
            toast.success("Seus dados foram atualizados!");
        } catch (erro) {
            const { mensagem, campo } = tratarErro(erro);

            if (campo && campo in form) {
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
            <h1>Meu perfil</h1>

            <Campo label="Nome completo" name="nome" value={form.nome} onChange={alterar} erro={erros.nome} />
            <Campo label="E-mail" name="email" value={usuario?.email ?? ""} onChange={() => {}} desabilitado dica="O e-mail não pode ser alterado." />
            <Campo label="CPF" name="cpf" value={form.cpf} onChange={alterar} erro={erros.cpf} />
            <Campo
                label="Senha"
                name="senha"
                type="password"
                value={form.senha}
                onChange={alterar}
                erro={erros.senha}
                dica={form.senha ? `Senha ${nivelDaSenha(form.senha)}` : "Digite a senha que você quer usar (pode ser a mesma de agora)."}
            />
            <Campo label="Repita a senha" name="confirmarSenha" type="password" value={form.confirmarSenha} onChange={alterar} erro={erros.confirmarSenha} />

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Aguarde..." : "Salvar alterações"}
            </button>
        </form>
    );
}
