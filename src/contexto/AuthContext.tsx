import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Usuario } from "../types";

type Valor = {
    usuario: Usuario | null;
    entrar: (token: string, usuario: Usuario) => void;
    sair: () => void;
    atualizar: (usuario: Usuario) => void;
};

const AuthContext = createContext<Valor | null>(null);

function lerUsuarioSalvo(): Usuario | null {
    try {
        const salvo = localStorage.getItem("usuario");
        return salvo && localStorage.getItem("token") ? (JSON.parse(salvo) as Usuario) : null;
    } catch {
        return null;
    }
}

// Guarda o usuário logado para o app inteiro (Header, Perfil, rotas protegidas)
export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(lerUsuarioSalvo);

    function entrar(token: string, novoUsuario: Usuario) {
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(novoUsuario));
        setUsuario(novoUsuario);
    }

    function sair() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
    }

    function atualizar(novoUsuario: Usuario) {
        localStorage.setItem("usuario", JSON.stringify(novoUsuario));
        setUsuario(novoUsuario);
    }

    return <AuthContext.Provider value={{ usuario, entrar, sair, atualizar }}>{children}</AuthContext.Provider>;
}

export function useAuth(): Valor {
    const valor = useContext(AuthContext);

    if (!valor) throw new Error("useAuth precisa estar dentro do AuthProvider");

    return valor;
}

// Só deixa passar quem está logado; os outros vão para o login
export function RotaProtegida() {
    const { usuario } = useAuth();
    const local = useLocation();

    if (!usuario) {
        return <Navigate to="/login" replace state={{ de: local.pathname }} />;
    }

    return <Outlet />;
}
