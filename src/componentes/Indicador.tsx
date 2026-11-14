type Props = {
    titulo: string;
    valor: string;
    detalhe: string;
    destaque?: boolean;
};

// Cartão com um número grande do painel (faturamento, ticket médio...)
export function Indicador({ titulo, valor, detalhe, destaque }: Props) {
    return (
        <div className={destaque ? "numero destaque" : "numero"}>
            <span>{titulo}</span>
            <strong>{valor}</strong>
            <span>{detalhe}</span>
        </div>
    );
}
