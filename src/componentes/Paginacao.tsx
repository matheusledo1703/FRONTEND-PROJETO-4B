type Props = {
    pagina: number;
    totalDePaginas: number;
    total: number;
    onMudar: (pagina: number) => void;
};

export function Paginacao({ pagina, totalDePaginas, total, onMudar }: Props) {
    return (
        <div className="paginacao">
            <span>{total} registros</span>
            <div>
                <button className="btn btn-secondary btn-pequeno" disabled={pagina <= 1} onClick={() => onMudar(pagina - 1)}>Anterior</button>
                <span> Página {pagina} de {totalDePaginas} </span>
                <button className="btn btn-secondary btn-pequeno" disabled={pagina >= totalDePaginas} onClick={() => onMudar(pagina + 1)}>Próxima</button>
            </div>
        </div>
    );
}
