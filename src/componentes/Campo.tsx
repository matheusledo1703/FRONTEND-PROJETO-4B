type Props = {
  label: string;
  name: string;
  value: string;
  type?: string;
  erro?: string;
  onChange: (name: string, valor: string) => void;
};

export function Campo({ label, name, value, type = "text", erro, onChange }: Props) {
  return (
    <div className="campo">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
      {erro && <span className="erro">{erro}</span>}
    </div>
  );
}
