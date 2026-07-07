import { NextResponse } from "next/server";
import { buscarLegislacao } from "../../../lib/scraper";

export const runtime = "nodejs";
export const maxDuration = 60; // segundos (requer plano Vercel Pro para valores > 10s)

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  const {
    abrangencia,
    termo,
    numero = "",
    ano = "",
    tipo = "(Todos os tipos)",
    ordenacaoKey = "Mais relevantes",
    maxPaginas = 5,
  } = body || {};

  if (!abrangencia || !termo || !String(termo).trim()) {
    return NextResponse.json(
      { erro: "Informe abrangência e ao menos um termo de busca." },
      { status: 400 }
    );
  }

  const termoLimpo = String(termo).trim();
  if ((termoLimpo.match(/"/g) || []).length % 2 !== 0) {
    return NextResponse.json(
      { erro: 'Há aspas não fechadas no termo de busca. Verifique o uso de "aspas".' },
      { status: 400 }
    );
  }

  try {
    const { resultados, totalInformado, limitado } = await buscarLegislacao({
      abrangencia,
      termo: termoLimpo,
      numero: String(numero).trim(),
      ano: String(ano).trim(),
      tipo,
      ordenacaoKey,
      maxPaginas,
    });

    return NextResponse.json({
      resultados,
      totalInformado,
      limitado,
    });
  } catch (exc) {
    return NextResponse.json({ erro: exc.message }, { status: 502 });
  }
}
