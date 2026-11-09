export type Usuario = {
  id: number;
  nome: string;
  email: string;
  cpf: string;
};

// Resposta paginada da API
export type Pagina<T> = {
  itens: T[];
  total: number;
  pagina: number;
  limite: number;
  totalDePaginas: number;
};

// Um registro qualquer de um CRUD (categoria, produto, cliente ou pedido)
export type Registro = {
  id: number;
  [campo: string]: string | number | null;
};

// Uma linha do relatório GET /relatorios/vendas
export type Venda = {
  pedidoId: number;
  data: string;
  clienteNome: string;
  produtoNome: string;
  categoriaNome: string;
  precoUnitario: number;
  quantidade: number;
  total: number;
};
