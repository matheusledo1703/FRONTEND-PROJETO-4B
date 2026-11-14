import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api, tratarErro } from "../api/axios";
import { Paginacao } from "../componentes/Paginacao";
import { Tabela } from "../componentes/Tabela";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
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
            <TopoDaPagina titulo={recurso.titulo}>
                <Link to={`/${recurso.caminho}/novo`} className="btn btn-primary">{recurso.novo}</Link>
            </TopoDaPagina>

            {erro && <p className="aviso-erro">{erro}</p>}
            {!dados && !erro && <p>Carregando...</p>}
            {dados && dados.total === 0 && <p>Nenhum registro ainda. Cadastre o primeiro!</p>}

            {dados && dados.total > 0 && (
                <>
                    <Tabela
                        colunas={recurso.colunas}
                        itens={dados.itens}
                        chave={(item) => item.id}
                        acoes={(item) => (
                            <>
                                <Link to={`/${recurso.caminho}/${item.id}/editar`} className="btn btn-secondary btn-pequeno">Editar</Link>
                                <button className="btn btn-danger btn-pequeno" onClick={() => excluir(item)}>Excluir</button>
                            </>
                        )}
                    />

                    <Paginacao pagina={pagina} totalDePaginas={dados.totalDePaginas} total={dados.total} onMudar={setPagina} />
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
