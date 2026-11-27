export interface Pendencia {
  id: string;
  /** Aba do menu onde o ponto laranja aparece. */
  rota: string;
  texto: string;
  link: string;
}

/** Abas "hub" que agrupam outras rotas (celular): mostram o ponto/aviso das filhas. */
export const ROTAS_DO_HUB: Record<string, string[]> = {
  '/freela': ['/projetos', '/clientes', '/recebimentos', '/servicos'],
  '/financas': [
    '/lancamentos',
    '/assinaturas',
    '/investimentos',
    '/dividas',
    '/contribuicao',
    '/categorias',
  ],
};
