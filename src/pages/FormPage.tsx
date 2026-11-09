import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api, tratarErro } from "../api/axios";
import { Campo } from "../componentes/Campo";
import type { Opcao } from "../componentes/Campo";
import { RECURSOS } from "../recursos";
import type { Recurso } from "../recursos";
import type { Pagina, Registro } from "../types";
import { errosDoZod } from "../utils";
import { NotFoundPage } from "./NotFoundPage";

// Cadastro e edição de qualquer recurso (se a rota tem :id, é edição)
function Formulario({ recurso }: { recurso: Recurso }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const editando = id !== undefined;

    const [form, setForm] = useState<Record<string, string>>(
        Object.fromEntries(recurso.campos.map((campo) => [campo.nome, campo.padrao ?? ""]))
    );
    const [erros, setErros] = useState<Record<string, string>>({});
    const [opcoes, setOpcoes] = useState<Record<string, Opcao[]>>({});
    const [loading, setLoading] = useState(false);

    // Carrega as listas dos relacionamentos (ex.: categorias do produto)
    async function carregarOpcoes() {
        for (const campo of recurso.campos) {
            if (!campo.opcoes) continue;

            const resposta = await api.get<Pagina<Registro>>(`/${campo.opcoes.caminho}`, { params: { limite: 100 } });
            const lista = resposta.data.itens.map((item) => ({ valor: item.id, rotulo: campo.opcoes!.rotulo(item) }));

            setOpcoes((atual) => ({ ...atual, [campo.nome]: lista }));
        }
    }

    // Edição: busca o registro e preenche os campos
    async function carregarRegistro() {
        try {
            const resposta = await api.get<Registro>(`/${recurso.caminho}/${id}`);

            setForm(Object.fromEntries(recurso.campos.map((campo) => [campo.nome, String(resposta.data[campo.nome] ?? "")])));
        } catch (e) {
            toast.error(tratarErro(e).mensagem);
            navigate(`/${recurso.caminho}`, { replace: true });
        }
    }

    useEffect(() => {
        carregarOpcoes().catch((e: unknown) => toast.error(tratarErro(e).mensagem));

        if (editando) carregarRegistro();
    }, []);

    function alterar(campo: string, valor: string) {
        setForm({ ...form, [campo]: valor });
        setErros({ ...erros, [campo]: "" });
    }

    async function onFormSubmit(event: SyntheticEvent) {
        event.preventDefault();

        const resultado = recurso.schema.safeParse(form);

        if (!resultado.success) {
            setErros(errosDoZod(resultado.error));
            return;
        }

        setLoading(true);

        try {
            if (editando) {
                await api.put(`/${recurso.caminho}/${id}`, resultado.data);
            } else {
                await api.post(`/${recurso.caminho}`, resultado.data);
            }

            toast.success(editando ? recurso.mensagens.editado : recurso.mensagens.criado);
            navigate(`/${recurso.caminho}`);
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
            <h1>{editando ? `Editar ${recurso.singular}` : recurso.novo}</h1>

            {recurso.campos.map((campo) => (
                <Campo
                    key={campo.nome}
                    label={campo.rotulo}
                    name={campo.nome}
                    type={campo.tipo}
                    value={form[campo.nome]}
                    onChange={alterar}
                    erro={erros[campo.nome]}
                    opcoes={campo.opcoes ? (opcoes[campo.nome] ?? []) : undefined}
                    desabilitado={editando && campo.soNaCriacao}
                    dica={editando && campo.soNaCriacao ? "Não pode ser alterado." : undefined}
                />
            ))}

            <div className="acoes">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Aguarde..." : "Salvar"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(`/${recurso.caminho}`)}>
                    Cancelar
                </button>
            </div>
        </form>
    );
}

export function FormPage() {
    const { recurso } = useParams();
    const configuracao = recurso ? RECURSOS[recurso] : undefined;

    // key: ao trocar de recurso ou de registro, o formulário começa do zero
    const { id } = useParams();
    return configuracao ? <Formulario key={`${configuracao.caminho}-${id}`} recurso={configuracao} /> : <NotFoundPage />;
}
