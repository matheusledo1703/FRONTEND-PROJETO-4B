import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import {
    Bar, BarChart, CartesianGrid, ComposedChart, Line, LineChart,
    ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis
} from "recharts";
import { api, tratarErro } from "../api/axios";
import type { Venda } from "../types";
import { moeda, numero } from "../utils";

// ---------- cálculos de estatística ----------
const soma = (valores: number[]) => valores.reduce((total, valor) => total + valor, 0);
const media = (valores: number[]) => soma(valores) / valores.length;

function mediana(valores: number[]) {
    const ordenado = [...valores].sort((a, b) => a - b);
    const meio = Math.floor(ordenado.length / 2);
    return ordenado.length % 2 ? ordenado[meio] : (ordenado[meio - 1] + ordenado[meio]) / 2;
}

// desvio padrão amostral
const desvioPadrao = (valores: number[]) =>
    valores.length < 2 ? 0 : Math.sqrt(soma(valores.map((v) => (v - media(valores)) ** 2)) / (valores.length - 1));

// Regressão linear: y = inclinacao * x + intercepto, com correlação r de Pearson
function regressao(x: number[], y: number[]) {
    const mx = media(x);
    const my = media(y);
    const sxy = soma(x.map((v, i) => (v - mx) * (y[i] - my)));
    const sxx = soma(x.map((v) => (v - mx) ** 2));
    const syy = soma(y.map((v) => (v - my) ** 2));

    if (sxx === 0 || syy === 0) return null; // todos os valores iguais: não há tendência

    const inclinacao = sxy / sxx;
    return { inclinacao, intercepto: my - inclinacao * mx, r: sxy / Math.sqrt(sxx * syy) };
}

// Soma um valor por grupo: [{ nome: "Figures", valor: 11848.67 }]
function agrupar(vendas: Venda[], grupo: (v: Venda) => string, valor: (v: Venda) => number) {
    const mapa = new Map<string, number>();

    for (const venda of vendas) {
        mapa.set(grupo(venda), (mapa.get(grupo(venda)) ?? 0) + valor(venda));
    }

    return [...mapa.entries()].map(([nome, total]) => ({ nome, valor: Math.round(total * 100) / 100 }));
}

function histograma(valores: number[], faixas = 5) {
    const menor = Math.min(...valores);
    const largura = (Math.max(...valores) - menor) / faixas || 1;
    const lista = Array.from({ length: faixas }, (_, i) => ({
        nome: `${numero(menor + i * largura, 0)} a ${numero(menor + (i + 1) * largura, 0)}`,
        pedidos: 0
    }));

    for (const valor of valores) {
        lista[Math.min(Math.floor((valor - menor) / largura), faixas - 1)].pedidos++;
    }

    return lista;
}

// ---------- tela ----------
const ROSA = "#ff4f8b";
const MENTA = "#12b48b";
const TINTA = "#2a1840";

function Grafico({ titulo, pergunta, conclusao, largo, children }: { titulo: string; pergunta: string; conclusao: string; largo?: boolean; children: ReactElement }) {
    return (
        <figure className={largo ? "grafico largo" : "grafico"}>
            <h3>{titulo}</h3>
            <p className="dica">{pergunta}</p>
            <ResponsiveContainer width="100%" height={280}>{children}</ResponsiveContainer>
            <p className="conclusao">{conclusao}</p>
        </figure>
    );
}

export function EstatisticasPage() {
    const [vendas, setVendas] = useState<Venda[] | null>(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        api.get<Venda[]>("/relatorios/vendas")
            .then((resposta) => setVendas(resposta.data))
            .catch((e: unknown) => setErro(tratarErro(e).mensagem));
    }, []);

    if (erro) return <p className="aviso-erro">{erro}</p>;
    if (!vendas) return <p>Buscando as vendas...</p>;
    if (vendas.length === 0) return <p>Ainda não há vendas. Rode <code>npm run popular</code> no back-end para criar dados de exemplo.</p>;

    const totais = vendas.map((v) => v.total);
    const quantidades = vendas.map((v) => v.quantidade);
    const precos = vendas.map((v) => v.precoUnitario);

    // "2026-07" vira "07/26" (ordena antes de trocar o nome, para ficar na ordem do tempo)
    const porMes = agrupar(vendas, (v) => v.data.slice(0, 7), (v) => v.total)
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((mes) => ({ ...mes, nome: `${mes.nome.slice(5, 7)}/${mes.nome.slice(2, 4)}` }));
    const porProduto = agrupar(vendas, (v) => v.produtoNome, (v) => v.quantidade).sort((a, b) => b.valor - a.valor);
    const porCategoria = agrupar(vendas, (v) => v.categoriaNome, (v) => v.total).sort((a, b) => b.valor - a.valor);
    const faixas = histograma(totais);
    const faixaMaior = faixas.reduce((a, b) => (b.pedidos > a.pedidos ? b : a));
    const melhorMes = porMes.reduce((a, b) => (b.valor > a.valor ? b : a));
    const faturamento = soma(totais);
    const reta = regressao(precos, quantidades);

    const pontos = vendas.map((v) => ({ x: v.precoUnitario, y: v.quantidade }));
    const extremos = [Math.min(...precos), Math.max(...precos)];
    const linhaDaReta = reta ? extremos.map((x) => ({ x, y: reta.inclinacao * x + reta.intercepto })) : [];

    const resumos = [
        { nome: "Valor do pedido", valores: totais, formatar: moeda },
        { nome: "Unidades por pedido", valores: quantidades, formatar: (v: number) => numero(v, 1) }
    ];

    return (
        <>
            <div className="topo">
                <div>
                    <h1>Painel de vendas</h1>
                    <p className="dica">Quanto a loja vendeu, o que mais sai e como os pedidos se comportam.</p>
                </div>
            </div>

            <section className="indicadores">
                <div className="numero destaque"><span>Faturamento total</span><strong>{moeda(faturamento)}</strong><span>{vendas.length} pedidos</span></div>
                <div className="numero"><span>Ticket médio</span><strong>{moeda(media(totais))}</strong><span>por pedido</span></div>
                <div className="numero"><span>Unidades vendidas</span><strong>{numero(soma(quantidades), 0)}</strong><span>em {porProduto.length} produtos</span></div>
                <div className="numero"><span>Produto mais vendido</span><strong>{porProduto[0].nome}</strong><span>{porProduto[0].valor} unidades</span></div>
            </section>

            <div className="graficos">
                <Grafico largo titulo="Faturamento por mês" pergunta="A loja está vendendo mais ou menos com o passar do tempo?" conclusao={`Melhor mês: ${melhorMes.nome}, com ${moeda(melhorMes.valor)}.`}>
                    <LineChart data={porMes}>
                        <CartesianGrid stroke="#e3dcf5" strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis width={105} tickFormatter={moeda} />
                        <Tooltip formatter={(v) => moeda(Number(v))} />
                        <Line dataKey="valor" name="Faturamento" stroke={ROSA} strokeWidth={3} />
                    </LineChart>
                </Grafico>

                <Grafico titulo="Unidades vendidas por produto" pergunta="Quais produtos saem mais?" conclusao={`${porProduto[0].nome} vende mais (${porProduto[0].valor} un.).`}>
                    <BarChart data={porProduto} layout="vertical">
                        <CartesianGrid stroke="#e3dcf5" strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="nome" width={130} />
                        <Tooltip />
                        <Bar dataKey="valor" name="Unidades" fill={ROSA} stroke={TINTA} strokeWidth={2} />
                    </BarChart>
                </Grafico>

                <Grafico titulo="Faturamento por categoria" pergunta="Qual linha de produtos rende mais dinheiro?" conclusao={`${porCategoria[0].nome} lidera: ${numero((porCategoria[0].valor / faturamento) * 100, 0)}% do faturamento.`}>
                    <BarChart data={porCategoria}>
                        <CartesianGrid stroke="#e3dcf5" strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis width={105} tickFormatter={moeda} />
                        <Tooltip formatter={(v) => moeda(Number(v))} />
                        <Bar dataKey="valor" name="Faturamento" fill={MENTA} stroke={TINTA} strokeWidth={2} />
                    </BarChart>
                </Grafico>

                <Grafico titulo="Distribuição do valor dos pedidos (R$)" pergunta="Quanto os clientes costumam gastar em cada pedido?" conclusao={`A maioria dos pedidos (${faixaMaior.pedidos}) fica entre R$ ${faixaMaior.nome.replace(" a ", " e R$ ")}.`}>
                    <BarChart data={faixas} barCategoryGap={0}>
                        <CartesianGrid stroke="#e3dcf5" strokeDasharray="3 3" />
                        <XAxis dataKey="nome" fontSize={11} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="pedidos" name="Pedidos" fill={MENTA} stroke={TINTA} strokeWidth={2} />
                    </BarChart>
                </Grafico>

                <Grafico
                    titulo="Preço × unidades por pedido"
                    pergunta="Produto mais caro vende menos unidades por pedido?"
                    conclusao={reta ? `r = ${numero(reta.r)}: a cada R$ 100 a mais no preço, o pedido tem ${numero(Math.abs(reta.inclinacao * 100), 1)} unidades ${reta.inclinacao < 0 ? "a menos" : "a mais"}.` : "Poucos dados para traçar uma tendência."}
                >
                    <ComposedChart>
                        <CartesianGrid stroke="#e3dcf5" strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="x" name="Preço" domain={["dataMin - 10", "dataMax + 10"]} tickFormatter={moeda} />
                        <YAxis type="number" dataKey="y" name="Unidades" allowDecimals={false} />
                        <Tooltip />
                        <Scatter name="Pedidos" data={pontos} fill={ROSA} stroke={TINTA} />
                        <Line name="Tendência" data={linhaDaReta} dataKey="y" stroke={TINTA} strokeWidth={3} strokeDasharray="8 5" dot={false} legendType="none" />
                    </ComposedChart>
                </Grafico>
            </div>

            <h2>Estatística descritiva</h2>
            <div className="tabela-rolagem">
                <table>
                    <thead>
                        <tr><th>Variável</th><th className="direita">Mínimo</th><th className="direita">Mediana</th><th className="direita">Média</th><th className="direita">Máximo</th><th className="direita">Desvio padrão</th></tr>
                    </thead>
                    <tbody>
                        {resumos.map(({ nome, valores, formatar }) => (
                            <tr key={nome}>
                                <td>{nome}</td>
                                <td className="direita">{formatar(Math.min(...valores))}</td>
                                <td className="direita">{formatar(mediana(valores))}</td>
                                <td className="direita">{formatar(media(valores))}</td>
                                <td className="direita">{formatar(Math.max(...valores))}</td>
                                <td className="direita">{formatar(desvioPadrao(valores))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
