import { z } from "zod";
import type { Registro } from "./types";
import { dataBR, moeda, REGEX_EMAIL } from "./utils";

// Configuração dos 4 CRUDs. A ListaPage e a FormPage leem daqui
// e montam a tela de cada recurso (colunas, campos e validações).

export type Recurso = {
    caminho: string; // rota do front e da API: /categorias
    titulo: string; // "Categorias"
    singular: string; // "categoria"
    novo: string; // "Nova categoria"
    mensagens: { criado: string; editado: string };
    colunas: { titulo: string; valor: (item: Registro) => string; direita?: boolean }[];
    campos: {
        nome: string;
        rotulo: string;
        tipo?: "text" | "number" | "email";
        padrao?: string;
        soNaCriacao?: boolean; // não muda na edição
        opcoes?: { caminho: string; rotulo: (item: Registro) => string }; // relacionamento: vira <select>
    }[];
    schema: z.ZodType;
};

const texto = (item: Registro, campo: string) => String(item[campo] ?? "-");

// Campos numéricos chegam como texto do input: valida e converte
const numero = (mensagem: string) =>
    z
        .string()
        .trim()
        .min(1, mensagem)
        .transform((valor) => Number(valor.replace(",", ".")))
        .refine((valor) => Number.isFinite(valor), mensagem);

const escolha = (mensagem: string) => numero(mensagem).refine((valor) => Number.isInteger(valor) && valor >= 1, mensagem);

const nome = (max: number) => z.string().trim().min(1, "O nome é obrigatório.").max(max, `O nome pode ter no máximo ${max} letras.`);

export const RECURSOS: Record<string, Recurso> = {
    categorias: {
        caminho: "categorias",
        titulo: "Categorias",
        singular: "categoria",
        novo: "Nova categoria",
        mensagens: { criado: "Categoria criada!", editado: "Categoria atualizada!" },
        colunas: [
            { titulo: "Nome", valor: (c) => texto(c, "nome") },
            { titulo: "Criada em", valor: (c) => dataBR(String(c.criadoEm)) }
        ],
        campos: [{ nome: "nome", rotulo: "Nome" }],
        schema: z.object({ nome: nome(80) })
    },

    produtos: {
        caminho: "produtos",
        titulo: "Produtos",
        singular: "produto",
        novo: "Novo produto",
        mensagens: { criado: "Produto cadastrado!", editado: "Produto atualizado!" },
        colunas: [
            { titulo: "Produto", valor: (p) => texto(p, "nome") },
            { titulo: "Categoria", valor: (p) => texto(p, "categoriaNome") },
            { titulo: "Preço", valor: (p) => moeda(Number(p.preco)), direita: true }
        ],
        campos: [
            { nome: "nome", rotulo: "Nome" },
            { nome: "descricao", rotulo: "Descrição (opcional)" },
            { nome: "preco", rotulo: "Preço (R$)", tipo: "number" },
            { nome: "categoriaId", rotulo: "Categoria", opcoes: { caminho: "categorias", rotulo: (c) => texto(c, "nome") } }
        ],
        schema: z.object({
            nome: nome(120),
            descricao: z.string().trim().max(255, "A descrição pode ter no máximo 255 letras."),
            preco: numero("Informe o preço.").refine((valor) => valor >= 0, "O preço não pode ser negativo."),
            categoriaId: escolha("Escolha uma categoria.")
        })
    },

    clientes: {
        caminho: "clientes",
        titulo: "Clientes",
        singular: "cliente",
        novo: "Novo cliente",
        mensagens: { criado: "Cliente cadastrado!", editado: "Cliente atualizado!" },
        colunas: [
            { titulo: "Nome", valor: (c) => texto(c, "nome") },
            { titulo: "E-mail", valor: (c) => texto(c, "email") },
            { titulo: "Telefone", valor: (c) => (c.telefone ? String(c.telefone) : "-") }
        ],
        campos: [
            { nome: "nome", rotulo: "Nome completo" },
            { nome: "email", rotulo: "E-mail", tipo: "email", soNaCriacao: true },
            { nome: "telefone", rotulo: "Telefone (opcional)" }
        ],
        schema: z.object({
            nome: nome(120).min(3, "O nome precisa ter pelo menos 3 letras."),
            email: z.string().trim().min(1, "O e-mail é obrigatório.").regex(REGEX_EMAIL, "Digite um e-mail válido."),
            telefone: z.string().trim().max(20, "O telefone pode ter no máximo 20 caracteres.")
        })
    },

    pedidos: {
        caminho: "pedidos",
        titulo: "Pedidos",
        singular: "pedido",
        novo: "Novo pedido",
        mensagens: { criado: "Pedido registrado!", editado: "Pedido atualizado!" },
        colunas: [
            { titulo: "Pedido", valor: (p) => `#${p.id}` },
            { titulo: "Data", valor: (p) => dataBR(String(p.criadoEm)) },
            { titulo: "Cliente", valor: (p) => texto(p, "clienteNome") },
            { titulo: "Produto", valor: (p) => texto(p, "produtoNome") },
            { titulo: "Qtd.", valor: (p) => texto(p, "quantidade"), direita: true },
            { titulo: "Total", valor: (p) => moeda(Number(p.total)), direita: true }
        ],
        campos: [
            { nome: "clienteId", rotulo: "Cliente", opcoes: { caminho: "clientes", rotulo: (c) => texto(c, "nome") } },
            { nome: "produtoId", rotulo: "Produto", opcoes: { caminho: "produtos", rotulo: (p) => `${texto(p, "nome")} (${moeda(Number(p.preco))})` } },
            { nome: "quantidade", rotulo: "Quantidade", tipo: "number", padrao: "1" }
        ],
        schema: z.object({
            clienteId: escolha("Escolha um cliente."),
            produtoId: escolha("Escolha um produto."),
            quantidade: escolha("A quantidade precisa ser um número inteiro maior que zero.")
        })
    }
};
