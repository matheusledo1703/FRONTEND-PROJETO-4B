import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, tratarErro } from "../api/axios";
import { BotaoEnviar } from "../componentes/BotaoEnviar";
import { CartaoDeFormulario } from "../componentes/CartaoDeFormulario";
import { Campo } from "../componentes/Campo";
import { cadastroSchema, errosDoZod, formatarCpf, nivelDaSenha } from "../utils";

export function CadastroPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ nome: "", email: "", cpf: "", senha: "", confirmarSenha: "" });
    const [erros, setErros] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    function alterar(campo: string, valor: string) {
        setForm({ ...form, [campo]: campo === "cpf" ? formatarCpf(valor) : valor });
        setErros({ ...erros, [campo]: "" });
    }

    async function onFormSubmit(event: SyntheticEvent) {
        event.preventDefault();

        // 1) valida no front
        const resultado = cadastroSchema.safeParse(form);

        if (!resultado.success) {
            setErros(errosDoZod(resultado.error));
            return;
        }

        // 2) envia para a API (a confirmação de senha fica só no front)
        setLoading(true);

        try {
            await api.post("/usuarios", { nome: form.nome, email: form.email, cpf: form.cpf, senha: form.senha });

            toast.success("Conta criada! Agora é só entrar.");
            navigate("/login", { state: { email: form.email } });
        } catch (erro) {
            // 3) erro da API: com campo vai embaixo do campo, sem campo vai em um aviso
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
        <CartaoDeFormulario titulo="Criar conta" dica="Todos os campos são obrigatórios." onSubmit={onFormSubmit} coracao>

            <Campo label="Nome completo" name="nome" value={form.nome} onChange={alterar} erro={erros.nome} />
            <Campo label="E-mail" name="email" type="email" value={form.email} onChange={alterar} erro={erros.email} />
            <Campo label="CPF" name="cpf" value={form.cpf} onChange={alterar} erro={erros.cpf} />
            <Campo
                label="Senha"
                name="senha"
                type="password"
                value={form.senha}
                onChange={alterar}
                erro={erros.senha}
                dica={form.senha ? `Senha ${nivelDaSenha(form.senha)}` : "8 caracteres ou mais, misturando minúscula, maiúscula, número e símbolo."}
            />
            <Campo label="Repita a senha" name="confirmarSenha" type="password" value={form.confirmarSenha} onChange={alterar} erro={erros.confirmarSenha} />

            <BotaoEnviar texto="Criar conta" carregando={loading} />

            <p>Já tem conta? <Link to="/login">Entrar</Link></p>
        </CartaoDeFormulario>
    );
}
