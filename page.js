"use client";

import { useState } from "react";
import {
  TIPOS_FEDERAL,
  TIPOS_INTERNA,
  ORDENACOES,
  RESULTADOS_POR_PAGINA,
  MAX_PAGINAS_POR_REQUISICAO,
} from "../lib/constants";

const ORDENACAO_KEYS = Object.keys(ORDENACOES);

export default function Home() {
  const [abrangencia, setAbrangencia] = useState("Legislação Federal");
  const [termo, setTermo] = useState("");
  const [numero, setNumero] = useState("");
  const [ano, setAno] = useState("");
  const [tipo, setTipo] = useState("(Todos os tipos)");
  const [ordenacaoKey, setOrdenacaoKey] = useState(ORDENACAO_KEYS[0]);
  const [buscarTudo, setBuscarTudo] = useState(false);
  const [limiteSeguranca, setLimiteSeguranca] = useState(2000);
  const [maxPaginasSlider, setMaxPaginasSlider] = useState(5);

  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultados, setResultados] = useState(null);
  const [totalInformado, setTotalInformado] = useState(null);
  const [avisoLimite, setAvisoLimite] = useState(false);
  const [paramsBusca, setParamsBusca] = useState(null);

  const listaTipos = abrangencia === "Legislação Federal" ? TIPOS_FEDERAL : TIPOS_INTERNA;

  const maxPaginasCalculado = buscarTudo
    ? Math.ceil(limiteSeguranca / RESULTADOS_POR_PAGINA)
    : maxPaginasSlider;

  function handleAbrangenciaChange(valor) {
    setAbrangencia(valor);
    setTipo("(Todos os tipos)");
  }

  async function handleBuscar(e) {
    e.preventDefault();
    setErro("");

    const termoLimpo = termo.trim();
    if (!termoLimpo) {
      setErro("Informe ao menos um termo de busca.");
      return;
    }
    if ((termoLimpo.match(/"/g) || []).length % 2 !== 0) {
      setErro('Há aspas não fechadas no termo de busca. Verifique o uso de "aspas".');
      return;
    }

    setLoading(true);
    setResultados(null);
    try {
      const resp = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abrangencia,
          termo: termoLimpo,
          numero: numero.trim(),
          ano: ano.trim(),
          tipo,
          ordenacaoKey,
          maxPaginas: maxPaginasCalculado,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErro(data.erro || "Ocorreu um erro ao consultar a base de legislação.");
        return;
      }
      setResultados(data.resultados);
      setTotalInformado(data.totalInformado);
      setAvisoLimite(Boolean(data.limitado));
      setParamsBusca({
        abrangencia,
        termo: termoLimpo,
        numero: numero.trim(),
        ano: ano.trim(),
        tipo,
      });
    } catch (exc) {
      setErro(`Falha de conexão: ${exc.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportar() {
    if (!resultados || !paramsBusca) return;
    setExportando(true);
    try {
      const resp = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultados, paramsBusca }),
      });
      if (!resp.ok) {
        setErro("Falha ao gerar o documento Word.");
        return;
      }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const carimbo = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
      a.href = url;
      a.download = `LexBrasil_resultado_${carimbo}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (exc) {
      setErro(`Falha ao exportar: ${exc.message}`);
    } finally {
      setExportando(false);
    }
  }

  return (
    <>
      <header className="lex-header">
        <img src="/lexbrasil_logo.jpg" alt="LexBrasil" className="lex-logo" />
        <div>
          <p className="lex-header-title">LexBrasil</p>
          <p className="lex-header-sub">
            Pesquisa de Legislação Federal e Interna · Câmara dos Deputados
          </p>
        </div>
      </header>

      <div className="lex-layout">
        <aside className="lex-sidebar">
          <h3>🔎 Parâmetros da busca</h3>
          <form onSubmit={handleBuscar}>
            <div className="lex-field">
              <label>Abrangência</label>
              <div className="lex-radio-group">
                <label>
                  <input
                    type="radio"
                    name="abrangencia"
                    checked={abrangencia === "Legislação Federal"}
                    onChange={() => handleAbrangenciaChange("Legislação Federal")}
                  />
                  Legislação Federal
                </label>
                <label>
                  <input
                    type="radio"
                    name="abrangencia"
                    checked={abrangencia === "Legislação Interna"}
                    onChange={() => handleAbrangenciaChange("Legislação Interna")}
                  />
                  Legislação Interna
                </label>
              </div>
              <p className="lex-help">
                Legislação Federal: leis, decretos, medidas provisórias etc. Legislação
                Interna: normas internas da Câmara dos Deputados.
              </p>
            </div>

            <div className="lex-field">
              <label>Termo(s) de busca</label>
              <input
                type="text"
                placeholder='ex.: autis*  ou  "trabalho escravo"'
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
              />
              <p className="lex-help">
                Use * ao final do radical para abranger variações da palavra (ex.: autis*
                recupera autismo, autista, autistas). Use aspas para buscar a expressão
                exata (ex.: &quot;trabalho escravo&quot;).
              </p>
            </div>

            <div className="lex-row">
              <div className="lex-field">
                <label>Número (opcional)</label>
                <input
                  type="text"
                  placeholder="ex.: 8069"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                />
              </div>
              <div className="lex-field">
                <label>Ano (opcional)</label>
                <input
                  type="text"
                  placeholder="ex.: 1990"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                />
              </div>
            </div>

            <div className="lex-field">
              <label>Tipo de norma (opcional)</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {listaTipos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="lex-field">
              <label>Ordenar por</label>
              <select value={ordenacaoKey} onChange={(e) => setOrdenacaoKey(e.target.value)}>
                {ORDENACAO_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div className="lex-field">
              <label className="lex-checkbox">
                <input
                  type="checkbox"
                  checked={buscarTudo}
                  onChange={(e) => setBuscarTudo(e.target.checked)}
                />
                Buscar TODOS os resultados encontrados
              </label>
              <p className="lex-help">
                Ignora o limite de páginas abaixo e percorre o buscador da Câmara até
                acabarem os resultados (respeitando o teto de segurança definido a
                seguir).
              </p>
            </div>

            {buscarTudo ? (
              <div className="lex-field">
                <label>Teto de segurança (nº máx. de normas)</label>
                <input
                  type="number"
                  min={RESULTADOS_POR_PAGINA}
                  max={20000}
                  step={100}
                  value={limiteSeguranca}
                  onChange={(e) => setLimiteSeguranca(Number(e.target.value))}
                />
                <p className="lex-slider-caption">
                  Buscará até {maxPaginasCalculado * RESULTADOS_POR_PAGINA} normas (ou
                  menos, se o resultado total for menor).
                </p>
              </div>
            ) : (
              <div className="lex-field">
                <label>Máximo de páginas a buscar</label>
                <input
                  type="range"
                  min={1}
                  max={MAX_PAGINAS_POR_REQUISICAO}
                  value={maxPaginasSlider}
                  onChange={(e) => setMaxPaginasSlider(Number(e.target.value))}
                />
                <p className="lex-slider-caption">
                  {maxPaginasSlider} página(s) · até{" "}
                  {maxPaginasSlider * RESULTADOS_POR_PAGINA} normas serão recuperadas.
                </p>
              </div>
            )}

            <button type="submit" className="lex-btn" disabled={loading}>
              {loading ? "Pesquisando…" : "Pesquisar"}
            </button>
          </form>
        </aside>

        <main className="lex-main">
          {erro && <div className="lex-alert lex-alert-error">{erro}</div>}

          {loading && (
            <p className="lex-spinner-text">
              Consultando a base de legislação da Câmara dos Deputados…
            </p>
          )}

          {!loading && resultados === null && !erro && (
            <div className="lex-alert lex-alert-info">
              Preencha os parâmetros no menu à esquerda e clique em <strong>Pesquisar</strong>{" "}
              para consultar a legislação federal ou interna da Câmara dos Deputados.
            </div>
          )}

          {!loading && resultados !== null && resultados.length === 0 && (
            <div className="lex-alert lex-alert-warning">
              Nenhuma norma encontrada para os critérios informados.
            </div>
          )}

          {!loading && resultados !== null && resultados.length > 0 && (
            <>
              <div className="lex-alert lex-alert-success">
                {resultados.length} normas recuperadas
                {totalInformado ? ` de um total de ${totalInformado} encontradas no site da Câmara.` : "."}
                {avisoLimite && (
                  <>
                    {" "}
                    O número de páginas foi limitado a {MAX_PAGINAS_POR_REQUISICAO} por
                    requisição para respeitar o tempo de execução da função serverless.
                  </>
                )}
              </div>

              <button
                className="lex-download-btn"
                onClick={handleExportar}
                disabled={exportando}
              >
                {exportando ? "Gerando documento…" : "⬇️ Baixar resultados em Word (.docx)"}
              </button>

              {resultados.map((item, i) => (
                <div className="lex-card" key={`${item.link}-${i}`}>
                  <h4>{item.titulo}</h4>
                  <div className="lex-ementa">{item.ementa || "(ementa não disponível)"}</div>
                  <div className="lex-meta">
                    {item.situacao && <span className="lex-badge">{item.situacao}</span>}
                    <a href={item.link} target="_blank" rel="noreferrer">
                      Ver norma completa ↗
                    </a>
                  </div>
                </div>
              ))}
            </>
          )}
        </main>
      </div>

      <p className="lex-footer">
        LexBrasil consulta dados públicos disponibilizados pela Câmara dos Deputados em
        camara.leg.br/legislacao. Ferramenta não oficial, sem vínculo com a Câmara dos
        Deputados.
      </p>
    </>
  );
}
