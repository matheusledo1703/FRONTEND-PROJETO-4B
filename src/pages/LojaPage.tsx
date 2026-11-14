import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../api/axios";
import type { Pagina, Registro } from "../types";
import { lerFoto, moeda } from "../utils";

type Item = { id: number; nome: string; descricao: string; preco: number; imagem: string; destaque?: string };

// Vitrine de exemplo: só aparece se a API não responder
const VITRINE: Item[] = [
    { id: 1, nome: "Doce Outono", descricao: "Edição comum", preco: 299.99, imagem: "/imgs/figura1.jpg", destaque: "Mais vendido" },
    { id: 2, nome: "Hatsune Miku Dia da Arte", descricao: "Edição comum", preco: 199.99, imagem: "/imgs/figura2.jpg" },
    { id: 3, nome: "Hatsune Miku Alice no País das Maravilhas", descricao: "Edição limitada", preco: 1500.99, imagem: "/imgs/figura3.jpg", destaque: "Novo" },
    { id: 4, nome: "Quadros em Pixel Art", descricao: "Quadrinho personalizado em pixel art!", preco: 100, imagem: "/imgs/quadroPixelArt.jpg" },
    { id: 5, nome: "Chaveiros", descricao: "Chaveirinhos diversos.", preco: 20, imagem: "/imgs/chaveiros.jpg" },
    { id: 6, nome: "Stands de Acrílico", descricao: "Acrílicos dos seus personagens favoritos!", preco: 40, imagem: "/imgs/standAcrilico.jpg" }
];

// A API não guarda foto: usa a enviada no cadastro (salva no navegador) ou escolhe pelo nome do produto
function imagemDoProduto(nome: string, posicao: number): string {
    const n = nome.toLowerCase();

    if (n.includes("chaveiro")) return "/imgs/chaveiros.jpg";
    if (n.includes("stand")) return "/imgs/standAcrilico.jpg";
    if (n.includes("quadro") || n.includes("poster") || n.includes("pixel")) return "/imgs/quadroPixelArt.jpg";

    return `/imgs/figura${(posicao % 3) + 1}.jpg`;
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
    return (
        <article className="produto">
            {item.destaque && <span className="etiqueta">{item.destaque}</span>}
            <div className="moldura">
                <img src={item.imagem} alt={item.nome} loading="lazy" />
            </div>
            <h3>{item.nome}</h3>
            <p className="dica">{item.descricao}</p>
            <strong className="preco">{moeda(item.preco)}</strong>
            <button
                className="btn btn-primary"
                onClick={() => toast.info("Carrinho em breve! Por enquanto os pedidos são registrados no painel Admin.")}
            >
                Comprar
            </button>
        </article>
    );
}

export function LojaPage() {
    const [produtos, setProdutos] = useState<Item[]>([]);
    const [carregando, setCarregando] = useState(true);

    // A loja é pública: a rota /vitrine da API não exige login e só devolve dados seguros (sem custo).
    // Se a API falhar, mostra a vitrine de exemplo.
    useEffect(() => {
        api.get<Pagina<Registro>>("/vitrine", { params: { pagina: 1, limite: 12 } })
            .then((resposta) => setProdutos(resposta.data.itens.map(doRegistro)))
            .catch(() => setProdutos(VITRINE))
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
                {!carregando && produtos.length === 0 && <p className="dica">Nenhum produto disponível no momento.</p>}

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
