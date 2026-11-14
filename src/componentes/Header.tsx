import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";

const LINKS_ADMIN = [
    ["/estatisticas", "Painel"],
    ["/pedidos", "Pedidos"],
    ["/produtos", "Produtos"],
    ["/categorias", "Categorias"],
    ["/clientes", "Clientes"]
];

export function Header() {
    const { usuario, sair } = useAuth();
    const navigate = useNavigate();
    const naLoja = useLocation().pathname === "/";

    function onSair() {
        sair();
        navigate("/");
    }

    // Loja: menu simples + só o botão Admin (sem login, o Admin leva à tela de Entrar)
    if (naLoja) {
        return (
            <header className="header">
                <Link to="/" className="logo">
                    <img src="/coracao-marrom.svg" alt="" />
                    Heartbeasties
                </Link>

                <nav className="nav">
                    <a href="#produtos">Produtos</a>
                    <Link to="/admin" className="btn btn-primary btn-pequeno">Admin</Link>
                </nav>
            </header>
        );
    }

    return (
        <header className="header">
            <Link to="/" className="logo">
                <img src="/coracao-marrom.svg" alt="" />
                Heartbeasties
            </Link>

            <nav className="nav">
                {usuario
                    ? LINKS_ADMIN.map(([para, texto]) => <NavLink key={para} to={para}>{texto}</NavLink>)
                    : [["/login", "Entrar"]].map(([para, texto]) => <NavLink key={para} to={para}>{texto}</NavLink>)}
            </nav>

            <div className="nav">
                <Link to="/">Ver loja</Link>
                {usuario && (
                    <>
                        <NavLink to="/perfil">Olá, {usuario.nome.split(" ")[0]}</NavLink>
                        <button className="btn btn-secondary btn-pequeno" onClick={onSair}>Sair</button>
                    </>
                )}
            </div>
        </header>
    );
}
