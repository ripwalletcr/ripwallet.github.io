// Computes the RIP Wallet business dashboard JSON from normalized Notion
// rows (see shapes below). Used by fetch-notion.mjs.
//
// NormalizedAsesoria:
// {
//   id, title, asesor, fecha (ISO datetime, UTC), sesion (string|null),
//   reserva: "Sí" | "No" | "N/A", pagoCompleto: "Sí" | "No" | "N/A",
//   montoPago: number (CRC), clienteIds: string[]
// }
//
// NormalizedInversion:
// {
//   id, title, status, cierre (ISO date|null),
//   aporteUnico: number (USD), aporteRegular: number (USD), clienteIds: string[]
// }

const TIMEZONE = "America/Costa_Rica";
const MONTHS_WINDOW = 12;

function monthKey(dateIso) {
  const d = new Date(dateIso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function costaRicaHour(dateIso) {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(new Date(dateIso));
  return Number(formatted) % 24;
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function last12Months(referenceDate = new Date()) {
  const months = [];
  for (let i = MONTHS_WINDOW - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - i, 1));
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function buildMonthlyTrend(asesorias, months) {
  const reservadas = asesorias.filter((a) => a.reserva === "Sí");
  return months.map((month) => {
    const inMonth = reservadas.filter((a) => monthKey(a.fecha) === month);
    return {
      month,
      total: inMonth.length,
      pagadas: inMonth.filter((a) => a.pagoCompleto === "Sí").length,
      ingreso: inMonth.reduce((sum, a) => sum + (a.montoPago || 0), 0),
    };
  });
}

function buildSessionBreakdown(asesorias, months) {
  const inWindow = asesorias.filter((a) => months.includes(monthKey(a.fecha)));
  const buckets = new Map();
  for (const a of inWindow) {
    const key = a.sesion || "Sin categoría";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(a);
  }
  return [...buckets.entries()]
    .map(([sesion, items]) => ({
      sesion,
      total: items.length,
      pagadas: items.filter((a) => a.pagoCompleto === "Sí").length,
      ingreso: items.reduce((sum, a) => sum + (a.montoPago || 0), 0),
    }))
    .sort((a, b) => b.total - a.total);
}

function buildInversionesFunnel(asesorias, inversiones, months) {
  return months.map((month) => {
    const clientesAtendidos = asesorias.filter(
      (a) => a.sesion === "Inversiones" && a.pagoCompleto === "Sí" && monthKey(a.fecha) === month,
    ).length;
    const cierresGanados = inversiones.filter(
      (inv) => inv.status === "Ganado" && inv.cierre && monthKey(inv.cierre) === month,
    ).length;
    return { month, clientesAtendidos, cierresGanados };
  });
}

function buildBestTimeToBook(asesorias, months) {
  const reservadas = asesorias.filter((a) => a.reserva === "Sí" && months.includes(monthKey(a.fecha)));
  const hourlyCount = Array.from({ length: 24 }, (_, hour) =>
    reservadas.filter((a) => costaRicaHour(a.fecha) === hour).length,
  );
  const peak = Math.max(...hourlyCount, 0);
  return hourlyCount.map((count) => (peak > 0 ? round(count / peak, 2) : 0));
}

function buildAdvisorPerformance(asesorias, months) {
  const reservadas = asesorias.filter((a) => a.reserva === "Sí" && months.includes(monthKey(a.fecha)));
  const buckets = new Map();
  for (const a of reservadas) {
    if (!a.asesor) continue;
    if (!buckets.has(a.asesor)) buckets.set(a.asesor, []);
    buckets.get(a.asesor).push(a);
  }
  return [...buckets.entries()]
    .map(([asesor, items]) => ({
      asesor,
      total: items.length,
      pagadas: items.filter((a) => a.pagoCompleto === "Sí").length,
      ingreso: items.reduce((sum, a) => sum + (a.montoPago || 0), 0),
    }))
    .sort((a, b) => b.total - a.total);
}

export function buildBusinessDashboard(asesorias, inversiones, { generatedAt, source }) {
  const months = last12Months(new Date(generatedAt));
  const monthlyTrend = buildMonthlyTrend(asesorias, months);
  const inversionesFunnel = buildInversionesFunnel(asesorias, inversiones, months);

  const totalAsesorias = monthlyTrend.reduce((sum, m) => sum + m.total, 0);
  const totalPagadas = monthlyTrend.reduce((sum, m) => sum + m.pagadas, 0);
  const totalIngreso = monthlyTrend.reduce((sum, m) => sum + m.ingreso, 0);
  const totalAtendidos = inversionesFunnel.reduce((sum, m) => sum + m.clientesAtendidos, 0);
  const totalCierres = inversionesFunnel.reduce((sum, m) => sum + m.cierresGanados, 0);

  return {
    generatedAt,
    source,
    windowMonths: MONTHS_WINDOW,
    kpis: {
      totalAsesorias,
      tasaPagoCompleto: totalAsesorias > 0 ? round((totalPagadas / totalAsesorias) * 100, 1) : 0,
      ingresoTotalCRC: totalIngreso,
      inversionesAtendidas: totalAtendidos,
      inversionesCerradas: totalCierres,
      tasaCierreInversiones: totalAtendidos > 0 ? round((totalCierres / totalAtendidos) * 100, 1) : 0,
    },
    monthlyTrend,
    sessionBreakdown: buildSessionBreakdown(asesorias, months),
    inversionesFunnel,
    bestTimeToBook: buildBestTimeToBook(asesorias, months),
    advisorPerformance: buildAdvisorPerformance(asesorias, months),
  };
}
