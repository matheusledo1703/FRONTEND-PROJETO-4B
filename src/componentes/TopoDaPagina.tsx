import type { ReactNode } from "react";

type Props = {
    titulo: string;
    subtitulo?: string;
    children?: ReactNode; // botões à direita do título
};

export function TopoDaPagina({ titulo, subtitulo, children }: Props) {
    return (
        <div className="topo">
            <div>
                <h1>{titulo}</h1>
                {subtitulo && <p className="dica">{subtitulo}</p>}
            </div>
            {children}
        </div>
    );
}
