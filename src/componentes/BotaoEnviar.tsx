type Props = {
    texto: string;
    carregando: boolean;
};

// Botão de enviar que se desliga enquanto a API responde
export function BotaoEnviar({ texto, carregando }: Props) {
    return (
        <button type="submit" className="btn btn-primary" disabled={carregando}>
            {carregando ? "Aguarde..." : texto}
        </button>
    );
}
