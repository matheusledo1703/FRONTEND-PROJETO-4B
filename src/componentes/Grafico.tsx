import type { ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

type Props = {
    titulo: string;
    pergunta: string; // a pergunta de negócio que o gráfico responde
    conclusao: string; // o que o gráfico mostra
    largo?: boolean;
    children: ReactElement;
};

// Moldura de todos os gráficos: título, pergunta, gráfico e conclusão
export function Grafico({ titulo, pergunta, conclusao, largo, children }: Props) {
    return (
        <figure className={largo ? "grafico largo" : "grafico"}>
            <h3>{titulo}</h3>
            <p className="dica">{pergunta}</p>
            <ResponsiveContainer width="100%" height={280}>{children}</ResponsiveContainer>
            <p className="conclusao">{conclusao}</p>
        </figure>
    );
}
