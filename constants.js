// -----------------------------------------------------------------------
// Constantes compartilhadas entre o frontend e as rotas de API
// -----------------------------------------------------------------------

export const BASE_URL = "https://www.camara.leg.br/legislacao/busca";
export const RESULTADOS_POR_PAGINA = 20; // tamanho de página observado no site da Câmara

export const CORES = {
  verdeEscuro: "#072E21",
  verde: "#0B4A35",
  dourado: "#C4A860",
  branco: "#FFFFFF",
  cinzaClaro: "#E9EFEC",
  fundo: "#F4F7F5",
};

export const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
};

export const TIPOS_FEDERAL = [
  "(Todos os tipos)",
  "Constituição",
  "Constituição. ADCT",
  "Emenda Constitucional",
  "Lei Complementar",
  "Lei Delegada",
  "Lei Ordinária",
  "Lei",
  "Lei Sem Número",
  "Decreto Legislativo",
  "Decreto Legislativo do Congresso Nacional",
  "Decreto-Lei",
  "Decreto",
  "Decreto Sem Número",
  "Decreto do Conselho de Ministros",
  "Medida Provisória",
  "Mensagem",
  "Mensagem Sem Número",
  "Regulamento",
  "Resolução da Câmara dos Deputados",
  "Resolução do Congresso Nacional",
  "Resolução do Senado Federal",
  "Resolução da Assembléia Nacional Constituinte",
  "Ato do Presidente da Mesa",
  "Ato do Presidente da Mesa Sem Número",
  "Ato Declaratório do Presidente da Mesa",
  "Ato Conjunto das Mesas da Câmara dos Deputados e do Senado Federal",
  "Carta Imperial",
  "Carta Régia Sem Número",
  "Carta de Lei Sem Número",
];

export const TIPOS_INTERNA = [
  "(Todos os tipos)",
  "Ato da Mesa",
  "Ato da Mesa Sem Número",
  "Ato Conjunto das Mesas da Câmara dos Deputados e do Senado Federal",
  "Ato da Presidência",
  "Ato da Presidência Sem Número",
  "Ato do Presidente",
  "Ato do Presidente Sem Número",
  "Ato Declaratório do Presidente da Mesa",
  "Comunicado",
  "Comunicado Sem Número",
  "Instrução Normativa",
  "Instrução de Serviço",
  "Norma Interna",
  "Ordem de Serviço",
  "Portaria",
  "Resolução da Câmara dos Deputados",
];

export const ORDENACOES = {
  "Mais relevantes": "relevancia:DESC",
  "Mais recentes": "data:DESC",
  "Mais antigas": "data:ASC",
};

// Teto de segurança para o número de páginas buscadas em uma única
// requisição de API (evita que a função serverless estoure o tempo
// limite de execução da Vercel).
export const MAX_PAGINAS_POR_REQUISICAO = 15;
