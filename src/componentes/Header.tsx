import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";

const LINKS_LOGADO = [
    ["/estatisticas", "Painel"],
    ["/pedidos", "Pedidos"],
    ["/produtos", "Produtos"],
    ["/categorias", "Categorias"],
    ["/clientes", "Clientes"]
];

const LINKS_VISITANTE = [
    ["/cadastro", "Cadastro"],
    ["/login", "Entrar"]
];

export function Header() {
    const { usuario, sair } = useAuth();
    const navigate = useNavigate();

    function onSair() {
        sair();
        navigate("/login");
    }

    return (
        <header className="header">
            <Link to="/" className="logo">
                <img src="/favicon.svg" alt="" />
                Heartbeasties
            </Link>

            <nav className="nav">
                {(usuario ? LINKS_LOGADO : LINKS_VISITANTE).map(([para, texto]) => (
                    <NavLink key={para} to={para}>{texto}</NavLink>
                ))}
            </nav>

            {usuario && (
                <div className="nav">
                    <NavLink to="/perfil">Olá, {usuario.nome.split(" ")[0]}</NavLink>
                    <button className="btn btn-secondary btn-pequeno" onClick={onSair}>Sair</button>
                </div>
            )}
        </header>
    );
}
