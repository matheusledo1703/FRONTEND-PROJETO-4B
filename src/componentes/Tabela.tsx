import type { ReactNode } from "react";

export type Coluna<T> = {
    titulo: string;
    valor: (item: T) => ReactNode;
    direita?: boolean;
};

type Props<T> = {
    colunas: Coluna<T>[];
    itens: T[];
    chave: (item: T) => string | number;
    acoes?: (item: T) => ReactNode; // coluna extra com botões (Editar, Excluir)
};

// Tabela genérica: serve para qualquer lista de itens (CRUDs e resumo estatístico)
export function Tabela<T>({ colunas, itens, chave, acoes }: Props<T>) {
    return (
        <div className="tabela-rolagem">
            <table>
                <thead>
                    <tr>
                        {colunas.map((coluna) => (
                            <th key={coluna.titulo} className={coluna.direita ? "direita" : ""}>{coluna.titulo}</th>
                        ))}
                        {acoes && <th className="direita">Ações</th>}
                    </tr>
                </thead>
                <tbody>
                    {itens.map((item) => (
                        <tr key={chave(item)}>
                            {colunas.map((coluna) => (
                                <td key={coluna.titulo} className={coluna.direita ? "direita" : ""}>{coluna.valor(item)}</td>
                            ))}
                            {acoes && <td className="direita acoes">{acoes(item)}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
