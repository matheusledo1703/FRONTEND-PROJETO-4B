import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api, tratarErro } from "../api/axios";
import { BotaoEnviar } from "../componentes/BotaoEnviar";
import { CartaoDeFormulario } from "../componentes/CartaoDeFormulario";
import { Campo } from "../componentes/Campo";
import { CampoFoto } from "../componentes/CampoFoto";
import type { Opcao } from "../componentes/Campo";
import { RECURSOS } from "../recursos";
import type { Recurso } from "../recursos";
import type { Pagina, Registro } from "../types";
import { errosDoZod, guardarFoto, lerFoto } from "../utils";
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

            setForm(Object.fromEntries(recurso.campos.map((campo) => [
                campo.nome,
                campo.tipo === "foto" ? lerFoto(recurso.caminho, resposta.data.id) : String(resposta.data[campo.nome] ?? "")
            ])));
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
            // O schema não tem a foto, então ela não vai para a API: fica salva no navegador, ligada ao id
            const campoFoto = recurso.campos.find((campo) => campo.tipo === "foto");
            let idSalvo: number | string | undefined = id;

            if (editando) {
                await api.put(`/${recurso.caminho}/${id}`, resultado.data);
            } else {
                const resposta = await api.post<Registro>(`/${recurso.caminho}`, resultado.data);
                idSalvo = resposta.data?.id;
            }

            if (campoFoto && idSalvo !== undefined && !guardarFoto(recurso.caminho, idSalvo, form[campoFoto.nome])) {
                toast.warn("O cadastro foi salvo, mas a foto não coube no navegador. Tente uma imagem menor.");
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
        <CartaoDeFormulario titulo={editando ? `Editar ${recurso.singular}` : recurso.novo} onSubmit={onFormSubmit}>

            {recurso.campos.map((campo) => campo.tipo === "foto" ? (
                <CampoFoto
                    key={campo.nome}
                    label={campo.rotulo}
                    name={campo.nome}
                    value={form[campo.nome]}
                    onChange={alterar}
                    erro={erros[campo.nome]}
                    dica="JPG, PNG ou WebP, até 5 MB."
                />
            ) : (
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
                <BotaoEnviar texto="Salvar" carregando={loading} />
                <button type="button" className="btn btn-secondary" onClick={() => navigate(`/${recurso.caminho}`)}>
                    Cancelar
                </button>
            </div>
        </CartaoDeFormulario>
    );
}

export function FormPage() {
    const { recurso } = useParams();
    const configuracao = recurso ? RECURSOS[recurso] : undefined;

    // key: ao trocar de recurso ou de registro, o formulário começa do zero
    const { id } = useParams();
    return configuracao ? <Formulario key={`${configuracao.caminho}-${id}`} recurso={configuracao} /> : <NotFoundPage />;
}
