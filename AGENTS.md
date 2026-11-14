# AGENTS.md — Heartbeasties (front-end)

Instruções para agentes de IA (Claude Code, Codex, Copilot etc.) que trabalham neste repositório.

## O projeto
Front-end do Heartbeasties: React + TypeScript (TSX) + Vite. Conversa com a API por HTTP (`VITE_URL_DA_API`, padrão `http://localhost:3000/api`).
Telas: loja pública (`/`, lista os produtos da rota pública `/vitrine` da API, sem login; só o painel Admin exige login), login (só admin; cliente não tem conta), perfil, 4 CRUDs (categorias, produtos, clientes, pedidos) e painel de estatísticas.

## Estrutura (mantenha simples, sem pastas novas)
- `src/pages/` páginas (uma por rota). Funções só daquela página ficam no próprio arquivo.
- `src/componentes/` componentes genéricos e reutilizáveis (`Campo`, `Tabela`, `Paginacao`, `CartaoDeFormulario`, `Grafico`...).
- `src/contexto/AuthContext.tsx` usuário logado, token e rota protegida.
- `src/api/axios.ts` conexão com a API e `tratarErro`.
- `src/recursos.ts` configuração dos 4 CRUDs. `src/utils.ts` CPF, senha, formatação e schemas zod. `src/types/index.ts` tipos.

## Regras de código
- TypeScript estrito: **proibido `any`**, `as any` e `@ts-ignore`. Tipar props e respostas da API.
- Nomes em português, como o resto do projeto. Aspas duplas, 4 espaços, ponto e vírgula.
- Componente novo só quando for reutilizado ou deixar a página mais legível. Sem excesso de arquivos.
- Validação de formulário sempre com zod (`utils.ts` ou `recursos.ts`). Erros da API passam por `tratarErro`.
- Rodar `npx tsc -b` antes de dizer que terminou.

## Guardrails (limites do agente)
- **NÃO alterar nada do back-end.** A pasta `../backend` é somente leitura para agentes.
- **NÃO ler, imprimir, copiar ou pedir o conteúdo de `.env`** (nem `../backend/**/.env`). Use só `.env.example`. Nunca coloque senha, token ou segredo no código, em logs ou em commits.
- Não rodar comandos destrutivos (`rm -rf`, `git push --force`, `git reset --hard`) sem o usuário pedir.
- Não instalar dependências novas sem avisar o motivo.
- Não commitar nem dar push por conta própria.
- Se a tarefa exigir mudança na API, parar e avisar o usuário em vez de editar o back-end.

## Skills do projeto (`.claude/skills/`) e bloqueios (`.claude/settings.json`)
1. `novo-crud` — acrescentar um CRUD novo em `recursos.ts`.
2. `validar-formulario` — criar ou ajustar validações (CPF, senha, e-mail) com zod.
3. `novo-componente` — criar componente genérico seguindo o padrão do projeto.
