import { useRef, useState } from "react";
import { prepararFoto } from "../utils";

type Props = {
    label: string;
    name: string;
    value: string; // foto atual (texto da imagem) ou vazio
    onChange: (name: string, valor: string) => void;
    erro?: string;
    dica?: string;
};

// Campo de envio de foto: escolher arquivo, ver a prévia e remover
export function CampoFoto({ label, name, value, onChange, erro, dica }: Props) {
    const entrada = useRef<HTMLInputElement>(null);
    const [erroLocal, setErroLocal] = useState("");
    const mensagem = erro || erroLocal;

    async function onEscolher(arquivo: File | undefined) {
        if (!arquivo) return;

        try {
            onChange(name, await prepararFoto(arquivo));
            setErroLocal("");
        } catch (e) {
            setErroLocal(e instanceof Error ? e.message : "Não foi possível usar essa imagem.");
        }

        if (entrada.current) entrada.current.value = ""; // permite escolher o mesmo arquivo de novo
    }

    function remover() {
        onChange(name, "");
        setErroLocal("");
    }

    return (
        <div className={mensagem ? "campo campo-erro campo-foto" : "campo campo-foto"}>
            <label htmlFor={name}>{label}</label>

            {value && (
                <div className="moldura moldura-previa">
                    <img src={value} alt="Prévia da foto" />
                </div>
            )}

            <div className="acoes">
                <label className="btn btn-secondary btn-pequeno" htmlFor={name}>
                    {value ? "Trocar foto" : "Escolher foto"}
                </label>
                {value && (
                    <button type="button" className="btn btn-danger btn-pequeno" onClick={remover}>
                        Remover
                    </button>
                )}
            </div>

            <input
                ref={entrada}
                id={name}
                type="file"
                accept="image/*"
                className="entrada-arquivo"
                onChange={(ev) => onEscolher(ev.target.files?.[0])}
            />

            {mensagem ? <span className="erro" role="alert">{mensagem}</span> : dica && <span className="dica">{dica}</span>}
        </div>
    );
}
