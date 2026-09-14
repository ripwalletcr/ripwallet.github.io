// Generates a realistic fake dataset and writes src/data/video-insights.json,
// so the Videos tab on /biznus can be built and reviewed before Metricool
// credentials are available. Uses the exact same buildDashboard() function
// that fetch-metricool.mjs uses, so the page never has to know which source
// produced the data.
//
// Run with: pnpm run insights:sample
// Replace with real data any time by running: pnpm run insights:fetch

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildDashboard } from "./lib/build-dashboard.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "video-insights.json");

const SAMPLE_CAPTIONS = [
  "3 errores que cometes con tu tarjeta de credito y no lo sabes",
  "Como salir de una deuda de prestamo personal en Costa Rica",
  "El gasto hormiga que te esta robando 50 mil colones al mes",
  "Fondos de inversion en Costa Rica: por donde empezar",
  "Las apps que uso para controlar mis finanzas",
  "BAC vs Banco Nacional: cual conviene mas para tu cuenta",
  "Como ahorrar para tu proximo viaje sin sufrir",
  "Storytime: la vez que casi pierdo todos mis ahorros",
  "Hipoteca a 20 vs 30 años: cual te conviene",
  "Lo que nadie te dice de las tarjetas de credito",
  "3 apps de bancos que deberias tener ahora mismo",
  "Como negociar tu prestamo hipotecario",
  "Inversiones para principiantes en Costa Rica",
  "El error de gastos hormiga mas comun",
  "Scotiabank y sus tarjetas: vale la pena?",
  "Como planear un viaje sin arruinar tus finanzas",
  "Mi rutina de ahorro semanal",
  "Reaccionando a comentarios sobre deudas",
];

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) & 0x7fffffff;
    return value / 0x7fffffff;
  };
}

const rand = seededRandom(42);

function randomInt(min, max) {
  return Math.floor(min + rand() * (max - min + 1));
}

function pick(list) {
  return list[randomInt(0, list.length - 1)];
}

function randomPublishedAt(monthsBack) {
  const now = Date.now();
  const past = now - monthsBack * 30 * 24 * 60 * 60 * 1000;
  const timestamp = past + rand() * (now - past);
  const date = new Date(timestamp);
  date.setUTCHours(randomInt(11, 23), randomInt(0, 59), 0, 0); // biased toward afternoon/evening posting
  return date.toISOString();
}

function generateTiktokVideo(index) {
  const views = randomInt(800, 60000);
  return {
    network: "tiktok",
    id: `sample-tt-${index}`,
    url: `https://www.tiktok.com/@ripwallet.cr/video/sample${index}`,
    caption: pick(SAMPLE_CAPTIONS),
    publishedAt: randomPublishedAt(6),
    views,
    likes: Math.round(views * (0.03 + rand() * 0.05)),
    comments: Math.round(views * (0.002 + rand() * 0.006)),
    shares: Math.round(views * (0.004 + rand() * 0.012)),
    reach: Math.round(views * (0.9 + rand() * 0.3)),
    saved: null,
    engagementRate: 0.02 + rand() * 0.08,
  };
}

function generateInstagramVideo(index) {
  const views = randomInt(500, 35000);
  return {
    network: "instagram",
    id: `sample-ig-${index}`,
    url: `https://www.instagram.com/reel/sample${index}`,
    caption: pick(SAMPLE_CAPTIONS),
    publishedAt: randomPublishedAt(6),
    views,
    likes: Math.round(views * (0.02 + rand() * 0.04)),
    comments: Math.round(views * (0.001 + rand() * 0.004)),
    shares: Math.round(views * (0.003 + rand() * 0.01)),
    reach: Math.round(views * (0.85 + rand() * 0.35)),
    saved: Math.round(views * (0.005 + rand() * 0.02)),
    engagementRate: 0.015 + rand() * 0.06,
  };
}

async function main() {
  const videos = [
    ...Array.from({ length: 55 }, (_, i) => generateTiktokVideo(i)),
    ...Array.from({ length: 40 }, (_, i) => generateInstagramVideo(i)),
  ];

  const dashboard = buildDashboard(videos, {
    generatedAt: new Date().toISOString(),
    source: "sample",
  });

  await writeFile(OUTPUT_PATH, JSON.stringify(dashboard, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${videos.length} sample videos to ${OUTPUT_PATH}`);
}

main();
