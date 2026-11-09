export type Opcao = { valor: number; rotulo: string };

type Props = {
    label: string;
    name: string;
    value: string;
    onChange: (name: string, valor: string) => void;
    type?: string;
    erro?: string;
    dica?: string;
    desabilitado?: boolean;
    opcoes?: Opcao[]; // se existir, vira uma lista de escolha (<select>)
};

// Campo de formulário: serve para input e select, com mensagem de erro
export function Campo({ label, name, value, onChange, type = "text", erro, dica, desabilitado, opcoes }: Props) {
    return (
        <div className={erro ? "campo campo-erro" : "campo"}>
            <label htmlFor={name}>{label}</label>

            {opcoes ? (
                <select id={name} value={value} disabled={desabilitado} onChange={(ev) => onChange(name, ev.target.value)}>
                    <option value="">Escolha...</option>
                    {opcoes.map((opcao) => (
                        <option key={opcao.valor} value={opcao.valor}>
                            {opcao.rotulo}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    id={name}
                    type={type}
                    value={value}
                    disabled={desabilitado}
                    step={type === "number" ? "any" : undefined}
                    onChange={(ev) => onChange(name, ev.target.value)}
                />
            )}

            {erro ? <span className="erro" role="alert">{erro}</span> : dica && <span className="dica">{dica}</span>}
        </div>
    );
}
