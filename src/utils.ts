import { z } from "zod";

// ---------- formatação ----------
export const moeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const numero = (valor: number, casas = 2) => valor.toLocaleString("pt-BR", { maximumFractionDigits: casas });
export const dataBR = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

// ---------- CPF ----------
export function formatarCpf(valor: string): string {
    return valor
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function cpfValido(valor: string): boolean {
    const cpf = valor.replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    const digito = (tamanho: number) => {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };

    return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10]);
}

// ---------- senha (mesma regra do back-end) ----------
// 8+ caracteres e pelo menos 3 tipos: minúscula, maiúscula, número, símbolo
export function nivelDaSenha(senha: string): "fraca" | "média" | "forte" {
    if (senha.length < 8) return "fraca";

    const tipos = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((regex) => regex.test(senha)).length;

    if (tipos <= 2) return "fraca";
    return tipos === 3 ? "média" : "forte";
}

// ---------- validações (zod) ----------
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const nome = z.string().trim().min(1, "O nome é obrigatório.").min(3, "O nome precisa ter pelo menos 3 letras.").max(120, "O nome pode ter no máximo 120 letras.");
const email = z.string().trim().min(1, "O e-mail é obrigatório.").regex(REGEX_EMAIL, "Digite um e-mail válido.");
const cpf = z.string().min(1, "O CPF é obrigatório.").refine(cpfValido, "CPF inválido.");
const senha = z
    .string()
    .min(1, "A senha é obrigatória.")
    .refine((valor) => nivelDaSenha(valor) !== "fraca", "Senha fraca. Use 8 caracteres ou mais, misturando pelo menos 3 destes: minúscula, maiúscula, número e símbolo.");
const confirmarSenha = z.string().min(1, "Repita a senha.");

const senhasIguais = { message: "As senhas não conferem.", path: ["confirmarSenha"] };

// Edição do usuário: sem e-mail, porque ele não pode mudar
export const edicaoSchema = z
    .object({ nome, cpf, senha, confirmarSenha })
    .refine((dados) => dados.senha === dados.confirmarSenha, senhasIguais);

export const loginSchema = z.object({
    email,
    senha: z.string().min(1, "A senha é obrigatória.")
});

// { campo: "mensagem" } com a primeira mensagem de cada campo
export function errosDoZod(erro: z.ZodError): Record<string, string> {
    const erros: Record<string, string> = {};

    for (const problema of erro.issues) {
        const campo = String(problema.path[0]);
        if (!(campo in erros)) erros[campo] = problema.message;
    }

    return erros;
}

// ---------- foto do produto ----------
// A API não guarda foto: a imagem é reduzida aqui e fica salva neste navegador, ligada ao id do registro.
const TAMANHO_MAXIMO_DA_FOTO = 5 * 1024 * 1024; // 5 MB

export function lerFoto(caminho: string, id: number | string): string {
    try {
        return localStorage.getItem(`foto:${caminho}:${id}`) ?? "";
    } catch {
        return "";
    }
}

// Sem foto (texto vazio) remove a que existia. Devolve false se o navegador não tiver espaço.
export function guardarFoto(caminho: string, id: number | string, foto: string): boolean {
    try {
        if (foto) {
            localStorage.setItem(`foto:${caminho}:${id}`, foto);
        } else {
            localStorage.removeItem(`foto:${caminho}:${id}`);
        }

        return true;
    } catch {
        return false;
    }
}

// Valida o arquivo e devolve a foto reduzida (JPEG de até 640px) como texto, pronta para guardar e mostrar
export async function prepararFoto(arquivo: File): Promise<string> {
    if (!arquivo.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem (JPG, PNG ou WebP).");
    if (arquivo.size > TAMANHO_MAXIMO_DA_FOTO) throw new Error("A foto pode ter no máximo 5 MB.");

    const imagem = await createImageBitmap(arquivo).catch(() => {
        throw new Error("Não foi possível ler essa imagem.");
    });

    const escala = Math.min(1, 640 / Math.max(imagem.width, imagem.height));
    const tela = document.createElement("canvas");
    tela.width = Math.round(imagem.width * escala);
    tela.height = Math.round(imagem.height * escala);

    const contexto = tela.getContext("2d");
    if (!contexto) throw new Error("Não foi possível processar essa imagem.");

    // fundo branco: PNG com transparência não fica preto ao virar JPEG
    contexto.fillStyle = "#FFFFFF";
    contexto.fillRect(0, 0, tela.width, tela.height);
    contexto.drawImage(imagem, 0, 0, tela.width, tela.height);
    imagem.close();

    return tela.toDataURL("image/jpeg", 0.82);
}
