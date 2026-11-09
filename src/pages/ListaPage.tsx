import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api, tratarErro } from "../api/axios";
import { RECURSOS } from "../recursos";
import type { Recurso } from "../recursos";
import type { Pagina, Registro } from "../types";
import { NotFoundPage } from "./NotFoundPage";

// Lista paginada de qualquer recurso (categorias, produtos, clientes, pedidos)
function Lista({ recurso }: { recurso: Recurso }) {
    const [pagina, setPagina] = useState(1);
    const [dados, setDados] = useState<Pagina<Registro> | null>(null);
    const [erro, setErro] = useState("");

    async function carregar() {
        try {
            const resposta = await api.get<Pagina<Registro>>(`/${recurso.caminho}`, { params: { pagina, limite: 10 } });

            // excluiu o último item da última página: volta uma página
            if (resposta.data.itens.length === 0 && pagina > 1) {
                setPagina(pagina - 1);
                return;
            }

            setDados(resposta.data);
            setErro("");
        } catch (e) {
            setErro(tratarErro(e).mensagem);
        }
    }

    async function excluir(item: Registro) {
        if (!window.confirm(`Excluir este registro (${recurso.singular} #${item.id})? Não dá para desfazer.`)) return;

        try {
            await api.delete(`/${recurso.caminho}/${item.id}`);
            toast.success("Excluído com sucesso!");
            carregar();
        } catch (e) {
            toast.error(tratarErro(e).mensagem);
        }
    }

    useEffect(() => {
        carregar();
    }, [pagina]);

    return (
        <>
            <div className="topo">
                <h1>{recurso.titulo}</h1>
                <Link to={`/${recurso.caminho}/novo`} className="btn btn-primary">{recurso.novo}</Link>
            </div>

            {erro && <p className="aviso-erro">{erro}</p>}
            {!dados && !erro && <p>Carregando...</p>}
            {dados && dados.total === 0 && <p>Nenhum registro ainda. Cadastre o primeiro!</p>}

            {dados && dados.total > 0 && (
                <>
                    <div className="tabela-rolagem">
                        <table>
                            <thead>
                                <tr>
                                    {recurso.colunas.map((coluna) => (
                                        <th key={coluna.titulo} className={coluna.direita ? "direita" : ""}>{coluna.titulo}</th>
                                    ))}
                                    <th className="direita">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dados.itens.map((item) => (
                                    <tr key={item.id}>
                                        {recurso.colunas.map((coluna) => (
                                            <td key={coluna.titulo} className={coluna.direita ? "direita" : ""}>{coluna.valor(item)}</td>
                                        ))}
                                        <td className="direita acoes">
                                            <Link to={`/${recurso.caminho}/${item.id}/editar`} className="btn btn-secondary btn-pequeno">Editar</Link>
                                            <button className="btn btn-danger btn-pequeno" onClick={() => excluir(item)}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="paginacao">
                        <span>{dados.total} registros</span>
                        <div>
                            <button className="btn btn-secondary btn-pequeno" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
                            <span> Página {pagina} de {dados.totalDePaginas} </span>
                            <button className="btn btn-secondary btn-pequeno" disabled={pagina >= dados.totalDePaginas} onClick={() => setPagina(pagina + 1)}>Próxima</button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export function ListaPage() {
    const { recurso } = useParams();
    const configuracao = recurso ? RECURSOS[recurso] : undefined;

    // key: ao trocar de recurso, a lista começa do zero
    return configuracao ? <Lista key={configuracao.caminho} recurso={configuracao} /> : <NotFoundPage />;
}
