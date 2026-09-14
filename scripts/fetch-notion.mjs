// Fetches Asesorías and Inversiones data from Notion for the RIP Wallet
// business dashboard, and writes src/data/business-insights.json for the
// /biznus page.
//
// Uses Notion's "data sources" query API (the current API surface as of
// late 2025 — a database can have multiple data sources; these are single-
// source databases so the data source id is what we query directly).
//
// Required env vars:
//   NOTION_TOKEN - an Internal Integration Secret from
//     https://www.notion.so/my-integrations. The integration must be
//     shared with the "Asesorías" and "Inversiones" databases in Notion
//     (··· menu on each database > Connections > add the integration).
//
// Data source ids (fixed for this workspace, not secret):
//   Asesorías:   bed60fef-7efa-46e3-9485-29993602afd7
//   Inversiones: 151b26e6-39ea-8160-a97a-000b739cf6b9
//
// On any failure, this script exits non-zero WITHOUT touching
// src/data/business-insights.json, so the site keeps serving the last good
// snapshot.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildBusinessDashboard } from "./lib/build-business-dashboard.mjs";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2025-09-03";
const ASESORIAS_DATA_SOURCE_ID = "bed60fef-7efa-46e3-9485-29993602afd7";
const INVERSIONES_DATA_SOURCE_ID = "151b26e6-39ea-8160-a97a-000b739cf6b9";
const MONTHS_BACK = 13; // a little slack around the 12-month window

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "business-insights.json");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function queryDataSource(dataSourceId, token, body = {}) {
  const results = [];
  let cursor;
  do {
    const response = await fetch(`${NOTION_API}/data_sources/${dataSourceId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...body, page_size: 100, start_cursor: cursor }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Notion query failed (${response.status}) for ${dataSourceId}: ${text}`);
    }

    const json = await response.json();
    results.push(...json.results);
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  return results;
}

function titleText(prop) {
  return (prop?.title ?? []).map((t) => t.plain_text).join("");
}

function selectName(prop) {
  return prop?.select?.name ?? prop?.status?.name ?? null;
}

function relationIds(prop) {
  return (prop?.relation ?? []).map((r) => r.id);
}

function normalizeAsesoria(page) {
  const p = page.properties;
  return {
    id: page.id,
    title: titleText(p["Asesoría"]),
    asesor: selectName(p["Asesor"]),
    fecha: p["Fecha"]?.date?.start ?? null,
    sesion: selectName(p["Sesión"]),
    reserva: selectName(p["Reserva?"]) ?? "N/A",
    pagoCompleto: selectName(p["Pago completo?"]) ?? "N/A",
    montoPago: p["$Pago"]?.number ?? 0,
    clienteIds: relationIds(p["Cliente"]),
  };
}

function normalizeInversion(page) {
  const p = page.properties;
  return {
    id: page.id,
    title: titleText(p["Inversión"]),
    status: selectName(p["Status"]),
    cierre: p["Cierre"]?.date?.start ?? null,
    aporteUnico: p["Aporte Único"]?.number ?? 0,
    aporteRegular: p["Aporte Regular"]?.number ?? null,
    plazo: p["Plazo"]?.number ?? null,
    clienteIds: relationIds(p["Cliente"]),
  };
}

async function main() {
  const token = requireEnv("NOTION_TOKEN");

  const since = new Date();
  since.setMonth(since.getMonth() - MONTHS_BACK);
  const sinceIso = since.toISOString().slice(0, 10);

  console.log(`Fetching Notion data since ${sinceIso}...`);

  const [asesoriaPages, inversionPages] = await Promise.all([
    queryDataSource(ASESORIAS_DATA_SOURCE_ID, token, {
      filter: { property: "Fecha", date: { on_or_after: sinceIso } },
    }),
    queryDataSource(INVERSIONES_DATA_SOURCE_ID, token, {}),
  ]);

  const asesorias = asesoriaPages.map(normalizeAsesoria).filter((a) => a.fecha);
  const inversiones = inversionPages.map(normalizeInversion);

  if (asesorias.length === 0) {
    throw new Error("Notion returned 0 asesorías — refusing to overwrite existing data.");
  }

  const dashboard = buildBusinessDashboard(asesorias, inversiones, {
    generatedAt: new Date().toISOString(),
    source: "notion",
  });

  await writeFile(OUTPUT_PATH, JSON.stringify(dashboard, null, 2) + "\n", "utf-8");
  console.log(
    `Wrote ${asesorias.length} asesorías and ${inversiones.length} inversiones to ${OUTPUT_PATH}`,
  );
}

main().catch((error) => {
  console.error("fetch-notion failed:", error.message);
  process.exit(1);
});
