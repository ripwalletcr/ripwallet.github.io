// Computes the RIP Wallet video-insights dashboard JSON from a flat list of
// normalized videos (see NormalizedVideo shape below). Shared by
// fetch-metricool.mjs (real data) and generate-sample-data.mjs (fake data),
// so both produce output in exactly the same shape the page expects.
//
// NormalizedVideo:
// {
//   network: "tiktok" | "instagram",
//   id: string,
//   url: string,
//   caption: string,
//   publishedAt: string (ISO 8601, UTC),
//   views: number,
//   likes: number,
//   comments: number,
//   shares: number,
//   reach: number,
//   saved: number | null,   // Instagram only
//   engagementRate: number, // fraction, e.g. 0.045 = 4.5%, as returned by Metricool
// }

const TIMEZONE = "America/Costa_Rica";

const TOPIC_BUCKETS = [
  {
    key: "tarjetas_credito",
    label: "Tarjetas de crédito",
    keywords: ["tarjeta de credito", "tarjeta de crédito", "tarjetas de credito", "tdc", "credit card"],
  },
  {
    key: "prestamos_hipoteca",
    label: "Préstamos / hipoteca",
    keywords: ["prestamo", "préstamo", "hipoteca", "credito hipotecario", "crédito hipotecario", "financiamiento"],
  },
  {
    key: "ahorro_gastos_hormiga",
    label: "Ahorro / gastos hormiga",
    keywords: ["ahorro", "ahorrar", "gasto hormiga", "gastos hormiga", "presupuesto"],
  },
  {
    key: "inversiones",
    label: "Inversiones",
    keywords: ["inversion", "inversión", "invertir", "fondo de inversion", "fondo de inversión", "bolsa", "acciones"],
  },
  {
    key: "apps_tech",
    label: "Apps / tech",
    keywords: ["app", "aplicacion", "aplicación", "fintech", "tecnologia", "tecnología"],
  },
  {
    key: "bancos_especificos",
    label: "Bancos específicos",
    keywords: ["bac", "bcr", "banco nacional", "banco popular", "scotiabank", "davivienda", "promerica", "banco cathay", "coopealianza"],
  },
  {
    key: "viajes",
    label: "Viajes",
    keywords: ["viaje", "viajar", "millas", "aerolinea", "aerolínea", "vuelo"],
  },
  {
    key: "personal_humor",
    label: "Personal / humor",
    keywords: ["storytime", "humor", "chiste", "personal", "vlog"],
  },
];
const OTHER_BUCKET = { key: "otros", label: "Otros" };

function classifyTopic(caption) {
  const text = (caption || "").toLowerCase();
  for (const bucket of TOPIC_BUCKETS) {
    if (bucket.keywords.some((kw) => text.includes(kw))) return bucket;
  }
  return OTHER_BUCKET;
}

function isoWeekKey(dateIso) {
  const d = new Date(dateIso);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7; // Monday = 0
  target.setUTCDate(target.getUTCDate() - dayNr + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const weekNumber =
    1 + Math.round(((target - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function costaRicaHour(dateIso) {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(new Date(dateIso));
  return Number(formatted) % 24;
}

function mean(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function sum(numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function byNetwork(videos, network) {
  return videos.filter((v) => v.network === network);
}

function buildKpis(videos) {
  const tiktok = byNetwork(videos, "tiktok");
  const instagram = byNetwork(videos, "instagram");
  return {
    videoCount: videos.length,
    totalViews: sum(videos.map((v) => v.views)),
    avgViewsPerVideo: round(mean(videos.map((v) => v.views)), 0),
    avgEngagementRate: round(mean(videos.map((v) => v.engagementRate)) * 100, 2),
    sharesTotal: {
      tiktok: sum(tiktok.map((v) => v.shares)),
      instagram: sum(instagram.map((v) => v.shares)),
    },
  };
}

function buildWeeklyTrend(videos) {
  const weeks = [...new Set(videos.map((v) => isoWeekKey(v.publishedAt)))].sort();
  const series = { tiktok: [], instagram: [] };
  for (const week of weeks) {
    for (const network of ["tiktok", "instagram"]) {
      const weekVideos = videos.filter(
        (v) => v.network === network && isoWeekKey(v.publishedAt) === week,
      );
      series[network].push(sum(weekVideos.map((v) => v.views)));
    }
  }
  return { weeks, series };
}

function buildTiktokTopics(videos) {
  const tiktok = byNetwork(videos, "tiktok");
  const buckets = new Map();
  for (const video of tiktok) {
    const topic = classifyTopic(video.caption);
    if (!buckets.has(topic.key)) buckets.set(topic.key, { key: topic.key, label: topic.label, videos: [] });
    buckets.get(topic.key).videos.push(video);
  }
  return [...buckets.values()]
    .map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      videoCount: bucket.videos.length,
      avgViews: round(mean(bucket.videos.map((v) => v.views)), 0),
      avgEngagementRate: round(mean(bucket.videos.map((v) => v.engagementRate)) * 100, 2),
      avgShares: round(mean(bucket.videos.map((v) => v.shares)), 1),
    }))
    .sort((a, b) => b.avgViews - a.avgViews);
}

function topByField(videos, field, limit) {
  return [...videos]
    .sort((a, b) => b[field] - a[field])
    .slice(0, limit)
    .map((v) => ({
      id: v.id,
      url: v.url,
      caption: v.caption,
      publishedAt: v.publishedAt,
      views: v.views,
      likes: v.likes,
      comments: v.comments,
      shares: v.shares,
      saved: v.saved,
      engagementRate: round(v.engagementRate * 100, 2),
    }));
}

function buildTopVideos(videos) {
  return {
    tiktokByViews: topByField(byNetwork(videos, "tiktok"), "views", 10),
    instagramByViews: topByField(byNetwork(videos, "instagram"), "views", 10),
    instagramBySaves: topByField(byNetwork(videos, "instagram"), "saved", 10),
  };
}

function buildRemakeCandidates(videos, kpis, limit = 8) {
  const avgByNetwork = {
    tiktok: mean(byNetwork(videos, "tiktok").map((v) => v.views)),
    instagram: mean(byNetwork(videos, "instagram").map((v) => v.views)),
  };
  return videos
    .filter((v) => v.views > avgByNetwork[v.network])
    .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
    .slice(0, limit)
    .map((v) => ({
      network: v.network,
      id: v.id,
      url: v.url,
      caption: v.caption,
      publishedAt: v.publishedAt,
      views: v.views,
      avgViewsForNetwork: round(avgByNetwork[v.network], 0),
    }));
}

function buildNetworkComparison30d(videos) {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = videos.filter((v) => new Date(v.publishedAt).getTime() >= cutoff);
  const result = {};
  for (const network of ["tiktok", "instagram"]) {
    const items = byNetwork(recent, network);
    result[network] = {
      videoCount: items.length,
      totalViews: sum(items.map((v) => v.views)),
      avgViewsPerVideo: round(mean(items.map((v) => v.views)), 0),
      avgShares: round(mean(items.map((v) => v.shares)), 1),
      avgEngagementRate: round(mean(items.map((v) => v.engagementRate)) * 100, 2),
    };
  }
  return result;
}

function buildBestTimeToPost(videos) {
  const result = {};
  for (const network of ["tiktok", "instagram"]) {
    const items = byNetwork(videos, network);
    const hourlyAvg = Array.from({ length: 24 }, (_, hour) => {
      const inHour = items.filter((v) => costaRicaHour(v.publishedAt) === hour);
      return mean(inHour.map((v) => v.views));
    });
    const peak = Math.max(...hourlyAvg, 0);
    result[network] = hourlyAvg.map((value) => (peak > 0 ? round(value / peak, 2) : 0));
  }
  return result;
}

const CONTENT_IDEAS = [
  "Serie 'Mito o realidad' sobre tarjetas de crédito, respondiendo creencias comunes en 30-45 segundos.",
  "Comparativo rápido entre 2 apps o bancos para una misma operación (ej: transferencia, cambio de moneda).",
  "Reacciones a comentarios/preguntas de la audiencia sobre deudas o ahorro (formato Q&A).",
  "'Un día en la vida' aplicando un hábito financiero específico (ahorro automático, presupuesto, etc.).",
  "Errores comunes al pedir un préstamo o hipoteca, con ejemplos concretos en colones.",
  "Historias reales (anonimizadas) de gastos hormiga y cuánto suman al año.",
];

export function buildDashboard(videos, { generatedAt, source }) {
  const kpis = buildKpis(videos);
  return {
    generatedAt,
    source,
    videoCount: videos.length,
    kpis,
    weeklyTrend: buildWeeklyTrend(videos),
    tiktokTopics: buildTiktokTopics(videos),
    topVideos: buildTopVideos(videos),
    remakeCandidates: buildRemakeCandidates(videos, kpis),
    networkComparison30d: buildNetworkComparison30d(videos),
    bestTimeToPost: buildBestTimeToPost(videos),
    contentIdeas: CONTENT_IDEAS,
  };
}
