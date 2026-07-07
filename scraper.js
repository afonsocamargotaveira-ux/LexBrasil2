import * as cheerio from "cheerio";
import { BASE_URL, HEADERS, ORDENACOES, MAX_PAGINAS_POR_REQUISICAO } from "./constants";

function montarUrl(pagina, abrangencia, termo, numero, ano, tipo, ordenacaoKey) {
  const params = new URLSearchParams();
  params.set("abrangencia", abrangencia);
  params.set("geral", termo);
  params.set("numero", numero || "");
  params.set("ano", ano || "");
  params.set("ordenacao", ORDENACOES[ordenacaoKey] || "relevancia:DESC");
  if (tipo && tipo !== "(Todos os tipos)") {
    params.set("tipo", tipo);
  }
  if (pagina > 1) {
    params.set("pagina", String(pagina));
  }
  return `${BASE_URL}?${params.toString()}`;
}

function textoTag($el) {
  return $el.text().replace(/\s+/g, " ").trim();
}

function parseResultados(html) {
  const $ = cheerio.load(html);
  const itens = [];

  $("h3, h2").each((_, cabecalho) => {
    const $cabecalho = $(cabecalho);
    const linkTag = $cabecalho.find("a[href]").first();
    if (!linkTag.length) return;

    const href = linkTag.attr("href");
    if (!href || !href.includes("/legin/")) return; // não é um card de norma

    const titulo = textoTag(linkTag);

    let container = $cabecalho.closest("li");
    if (!container.length) container = $cabecalho.closest("article, div");
    if (!container.length) container = $cabecalho.parent();

    let ementa = "";
    let situacao = "";

    if (container.length) {
      container.find("*").each((__, filho) => {
        if (ementa && situacao) return;
        const $filho = $(filho);
        // ignora o próprio cabeçalho e qualquer nó que o contenha
        if ($filho.is($cabecalho) || $filho.find($cabecalho).length) return;
        const txt = textoTag($filho);
        if (!ementa && txt.startsWith("Ementa:")) {
          ementa = txt.slice("Ementa:".length).trim();
        } else if (!situacao && txt.startsWith("Situação:")) {
          situacao = txt.slice("Situação:".length).trim();
        }
      });
    }

    let link;
    try {
      link = new URL(href, "https://www.camara.leg.br").toString();
    } catch {
      link = href;
    }

    itens.push({ titulo, link, ementa, situacao });
  });

  // Total de resultados informado pela Câmara (ex.: "de 1 a 20 de 13.921")
  let total = null;
  const bodyText = $("body").text().replace(/\s+/g, " ");
  const m = bodyText.match(/de\s+\d+\s+a\s+\d+\s+de\s+([\d.]+)/);
  if (m) {
    total = parseInt(m[1].replace(/\./g, ""), 10);
  }

  return { itens, total };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function buscarLegislacao({
  abrangencia,
  termo,
  numero,
  ano,
  tipo,
  ordenacaoKey,
  maxPaginas,
}) {
  const paginasSeguras = Math.min(
    Math.max(1, Number(maxPaginas) || 1),
    MAX_PAGINAS_POR_REQUISICAO
  );

  const todos = [];
  let totalInformado = null;

  for (let pagina = 1; pagina <= paginasSeguras; pagina++) {
    const url = montarUrl(pagina, abrangencia, termo, numero, ano, tipo, ordenacaoKey);

    let resp;
    try {
      resp = await fetch(url, { headers: HEADERS });
    } catch (exc) {
      throw new Error(`Falha ao acessar o site da Câmara dos Deputados: ${exc.message}`);
    }

    if (!resp.ok) {
      throw new Error(
        `Falha ao acessar o site da Câmara dos Deputados: HTTP ${resp.status}`
      );
    }

    const html = await resp.text();
    const { itens, total } = parseResultados(html);

    if (totalInformado === null) totalInformado = total;
    if (itens.length === 0) break;

    todos.push(...itens);

    if (totalInformado !== null && todos.length >= totalInformado) break;
    if (pagina < paginasSeguras) await sleep(350); // cortesia com o servidor da Câmara
  }

  return {
    resultados: todos,
    totalInformado,
    limitado: Number(maxPaginas) > MAX_PAGINAS_POR_REQUISICAO,
  };
}
