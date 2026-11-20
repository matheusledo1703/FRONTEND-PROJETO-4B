import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, tratarErro } from "../api/axios";
import { useAuth } from "../contexto/AuthContext";
import type { Pagina, Registro } from "../types";
import { lerFoto, moeda } from "../utils";

type Item = { id: number; nome: string; descricao: string; preco: number; imagem: string };

// ONDE TROCAR AS IMAGENS DOS PRODUTOS:
// 1) Coloque o arquivo na pasta frontend/public/imgs/
// 2) Ligue a imagem a uma palavra do nome do produto na lista abaixo (a primeira que bater vale).
// Uma foto enviada no cadastro do produto (painel Admin) tem prioridade sobre esta lista.
const IMAGENS_POR_PALAVRA: { palavra: string; imagem: string }[] = [
    { palavra: "cidade", imagem: "/imgs/cidadeNeon.jpg" },
    { palavra: "floresta", imagem: "/imgs/florestaEncantada.png" },
    { palavra: "fantasma", imagem: "/imgs/fantasma.png" },
    { palavra: "coração", imagem: "/imgs/coracaoPixel.png" },
    { palavra: "raposa", imagem: "/imgs/peluciaRaposa.png" },
    { palavra: "coelho", imagem: "/imgs/peluciaCoelho.png" },
    { palavra: "dragão", imagem: "/imgs/dragao.jpg" },
    { palavra: "gato", imagem: "/imgs/gato.jpg" }
];

// Imagens usadas quando nenhuma palavra bate (alternam pela posição do produto)
const IMAGENS_PADRAO = ["/imgs/figura1.jpg", "/imgs/figura2.jpg", "/imgs/figura3.jpg"];

function imagemDoProduto(nome: string, posicao: number): string {
    const minusculo = nome.toLowerCase();
    const achada = IMAGENS_POR_PALAVRA.find(({ palavra }) => minusculo.includes(palavra));

    return achada ? achada.imagem : IMAGENS_PADRAO[posicao % IMAGENS_PADRAO.length];
}

function doRegistro(produto: Registro, posicao: number): Item {
    const nome = String(produto.nome);

    return {
        id: produto.id,
        nome,
        descricao: String(produto.descricao || produto.categoriaNome || ""),
        preco: Number(produto.preco),
        imagem: lerFoto("produtos", produto.id) || imagemDoProduto(nome, posicao)
    };
}

function CartaoDeProduto({ item }: { item: Item }) {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [comprando, setComprando] = useState(false);

    async function comprar() {
        // Visitante: vai para o login e volta para a loja depois
        if (!usuario) {
            toast.info("Entre ou crie uma conta para comprar.");
            navigate("/login", { state: { de: "/" } });
            return;
        }

        setComprando(true);

        try {
            await api.post("/compras", { produtoId: item.id, quantidade: 1 });
            toast.success(`Pedido de "${item.nome}" realizado!`);
        } catch (erro) {
            toast.error(tratarErro(erro).mensagem);
        } finally {
            setComprando(false);
        }
    }

    return (
        <article className="produto">
            <div className="moldura">
                <img src={item.imagem} alt={item.nome} loading="lazy" />
            </div>
            <h3>{item.nome}</h3>
            <p className="dica">{item.descricao}</p>
            <strong className="preco">{moeda(item.preco)}</strong>
            <button className="btn btn-primary" onClick={comprar} disabled={comprando}>
                {comprando ? "Enviando..." : "Comprar"}
            </button>
        </article>
    );
}

export function LojaPage() {
    const [produtos, setProdutos] = useState<Item[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [indisponivel, setIndisponivel] = useState(false);

    // A loja é pública: a rota /vitrine da API não exige login e só devolve dados seguros (sem custo).
    // Só mostra o que está no banco. Se a API ou o banco estiverem fora do ar, avisa que a vitrine está indisponível.
    useEffect(() => {
        api.get<Pagina<Registro>>("/vitrine", { params: { pagina: 1, limite: 12 } })
            .then((resposta) => setProdutos(resposta.data.itens.map(doRegistro)))
            .catch(() => setIndisponivel(true))
            .finally(() => setCarregando(false));
    }, []);

    return (
        <>
            <section className="hero-loja">
                <h1>HEARTBEASTIES</h1>
                <p>Suas compras no precinho de um sonho!</p>
                <a href="#produtos" className="btn btn-secondary">Explorar Figures</a>
            </section>

            <section id="produtos" className="vitrine">
                <h2>Nossos produtos</h2>
                <p className="dica">Direto do nosso estoque.</p>

                {carregando && <p className="dica">Carregando produtos...</p>}
                {indisponivel && <p className="dica">Vitrine indisponível no momento. Tente novamente em instantes.</p>}
                {!carregando && !indisponivel && produtos.length === 0 && <p className="dica">Nenhum produto disponível no momento.</p>}

                <div className="grade-produtos">
                    {produtos.map((item) => <CartaoDeProduto key={item.id} item={item} />)}
                </div>
            </section>

            <section className="faixa-promo">
                💛 Feito com carinho pra colecionadores — frete grátis nas compras acima de R$ 200
            </section>

            <footer className="rodape-loja">
                <p>Feito com <span className="coracao">♥</span> © {new Date().getFullYear()} Heartbeasties</p>
            </footer>
        </>
    );
}
