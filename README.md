# LexBrasil — versão Next.js (Vercel)

Esta é a versão do LexBrasil convertida do Streamlit original para **Next.js
14 (App Router)**, pronta para deploy na Vercel. Streamlit precisa de um
servidor Python de longa duração e não roda nativamente na Vercel (que é
serverless); por isso o app foi reescrito em JavaScript, mantendo a mesma
identidade visual (verde escuro `#072E21`, verde `#0B4A35`, dourado
`#C4A860`, fundo `#F4F7F5`, tipografia serifada) e as mesmas funcionalidades.

## O que foi convertido

| Original (Streamlit/Python)          | Versão Vercel (Next.js)                          |
|---------------------------------------|---------------------------------------------------|
| `app.py` (uma única página Streamlit) | `app/page.js` (React, client component) + estilos em `app/globals.css` |
| `st.cache_data` + scraping com `requests`/`BeautifulSoup` | Rota de API `app/api/search/route.js`, usando `fetch` + `cheerio` |
| Geração do `.docx` com `python-docx`  | Rota de API `app/api/export/route.js`, usando o pacote `docx` (Node) |
| `lexbrasil_logo.jpg`                  | `public/lexbrasil_logo.jpg` |
| `.streamlit/config.toml` (tema)       | Variáveis CSS em `app/globals.css` |

A lógica de negócio (parâmetros de busca, sintaxe `*` e `"aspas"`, tipos de
norma por abrangência, geração do documento com capa, ementa, situação e
link) foi preservada fielmente.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Deploy na Vercel

### Opção A — via GitHub (recomendado)
1. Crie um repositório no GitHub e envie esta pasta para ele.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. A Vercel detecta o Next.js automaticamente — não é preciso configurar
   nada (build command, output etc. já vêm corretos).
4. Clique em **Deploy**.

### Opção B — via CLI
```bash
npm install -g vercel
vercel        # deploy de preview
vercel --prod # deploy de produção
```

## ⚠️ Limitação importante: timeout das funções serverless

O site da Câmara é consultado página por página (20 normas por página) com
uma pequena pausa entre requisições, exatamente como no app original. Isso
funciona bem localmente, mas **funções serverless da Vercel têm um tempo
máximo de execução**:

- **Plano Hobby (grátis):** 10 segundos por padrão (até 60s configurável em
  alguns casos, mas normalmente limitado).
- **Plano Pro:** até 60s por padrão, configurável até 300s (5 min) via
  `maxDuration`.

Por isso:
- A rota `app/api/search/route.js` já define `export const maxDuration = 60;`
  (efetivo apenas em planos que suportam esse valor).
- Por segurança, o número de páginas buscadas **por requisição** é limitado
  a `MAX_PAGINAS_POR_REQUISICAO = 15` (definido em `lib/constants.js`),
  evitando que a função estoure o tempo limite e falhe sem retornar nada.
  Se o usuário pedir mais páginas do que isso, a busca é truncada e um aviso
  aparece na tela.
- Se você precisar buscar volumes muito grandes de normas (milhares), o
  ideal é migrar essa função para um job em background (ex.: Vercel Cron +
  fila, ou uma função com maior timeout no plano Pro/Enterprise) em vez de
  uma chamada síncrona de API.

Você pode ajustar `MAX_PAGINAS_POR_REQUISICAO` em `lib/constants.js`
conforme o plano da Vercel que for usar.

## Estrutura do projeto

```
app/
  layout.js            # layout raiz (metadata, fontes)
  page.js              # página única: formulário + resultados
  globals.css          # tema visual (verde escuro/branco/dourado)
  api/
    search/route.js    # faz o scraping do site da Câmara
    export/route.js    # gera o .docx em memória e devolve como download
lib/
  constants.js         # tipos de norma, ordenações, cores, URLs
  scraper.js           # lógica de montagem de URL e parsing do HTML
public/
  lexbrasil_logo.jpg
```

## Observações técnicas (herdadas do app original)

- O app consulta diretamente `https://www.camara.leg.br/legislacao/busca`,
  reaproveitando a mesma sintaxe de busca do site oficial (parâmetro
  `geral`), o que preserva o suporte a asterisco (extensão de radical) e
  aspas (expressão exata).
- Como o app faz *web scraping* de uma página pública, mudanças no layout
  do site da Câmara podem exigir ajustes nos seletores da função
  `parseResultados` em `lib/scraper.js`.
- Esta é uma ferramenta não oficial e não possui vínculo com a Câmara dos
  Deputados.
