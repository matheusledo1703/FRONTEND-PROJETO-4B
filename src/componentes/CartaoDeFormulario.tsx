import type { ReactNode, SyntheticEvent } from "react";

type Props = {
    titulo: string;
    onSubmit: (event: SyntheticEvent) => void;
    coracao?: boolean; // mostra o coração da marca no topo
    dica?: string;
    children: ReactNode;
};

// Moldura de todos os formulários: título, campos e envio
export function CartaoDeFormulario({ titulo, onSubmit, coracao, dica, children }: Props) {
    return (
        <form onSubmit={onSubmit} className="cartao" noValidate>
            {coracao && <img src="/favicon.svg" alt="" className="coracao" />}
            <h1>{titulo}</h1>
            {dica && <p className="dica">{dica}</p>}
            {children}
        </form>
    );
}
