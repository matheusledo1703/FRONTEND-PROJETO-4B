import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_URL_DA_API ?? "http://localhost:3000/api"
});

// Manda o token em toda requisição
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Se a API recusar o token (venceu ou é falso), volta para o login.
// Visitante sem token (loja pública) não é redirecionado.
api.interceptors.response.use(
    (resposta) => resposta,
    (erro: unknown) => {
        if (
            axios.isAxiosError(erro) &&
            erro.response?.status === 401 &&
            localStorage.getItem("token") &&
            !erro.config?.url?.endsWith("/login")
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.href = "/login";
        }

        return Promise.reject(erro);
    }
);

// Transforma qualquer erro em uma mensagem amigável.
// A API devolve { erro: "mensagem", campo: "email" }
export function tratarErro(erro: unknown): { mensagem: string; campo?: string } {
    if (!axios.isAxiosError<{ erro?: string; campo?: string }>(erro)) {
        return { mensagem: "Algo deu errado. Tente de novo." };
    }

    if (!erro.response) {
        return { mensagem: "Não foi possível falar com o servidor. A API está rodando?" };
    }

    const corpo = erro.response.data;

    if (corpo?.erro) {
        return { mensagem: corpo.erro, campo: corpo.campo };
    }

    return { mensagem: "O servidor teve um problema. Tente de novo em instantes." };
}
