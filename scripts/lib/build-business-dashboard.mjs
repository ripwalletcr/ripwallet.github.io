// Computes the RIP Wallet business dashboard JSON from normalized Notion
// rows (see shapes below). Used by fetch-notion.mjs.
//
// Every series is broken out by month so the /biznus page can recompute
// KPIs, tables and charts client-side for whichever window the viewer
// picks (this month / last 3 months / YTD / all) without re-fetching.
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
//   aporteUnico: number (USD), aporteRegular: number (USD),
//   plazo: number|null, clienteIds: string[]
// }

const TIMEZONE = "America/Costa_Rica";
const MONTHS_WINDOW = 13;

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

function lastCompleteMonths(referenceDate, count) {
  const months = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - i, 1));
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function distinctClients(items) {
  const set = new Set();
  for (const item of items) {
    for (const id of item.clienteIds) set.add(id);
  }
  return set.size;
}

function buildAsesoriasByMonth(asesorias, months) {
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

function buildSessionByMonth(asesorias, months) {
  const rows = [];
  for (const month of months) {
    const inMonth = asesorias.filter((a) => monthKey(a.fecha) === month);
    const buckets = new Map();
    for (const a of inMonth) {
      const key = a.sesion || "Sin categoría";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(a);
    }
    for (const [sesion, items] of buckets) {
      rows.push({
        month,
        sesion,
        total: items.length,
        pagadas: items.filter((a) => a.pagoCompleto === "Sí").length,
        ingreso: items.reduce((sum, a) => sum + (a.montoPago || 0), 0),
      });
    }
  }
  return rows;
}

function buildAdvisorByMonth(asesorias, months) {
  const rows = [];
  const reservadas = asesorias.filter((a) => a.reserva === "Sí" && a.asesor);
  for (const month of months) {
    const inMonth = reservadas.filter((a) => monthKey(a.fecha) === month);
    const buckets = new Map();
    for (const a of inMonth) {
      if (!buckets.has(a.asesor)) buckets.set(a.asesor, []);
      buckets.get(a.asesor).push(a);
    }
    for (const [asesor, items] of buckets) {
      rows.push({
        month,
        asesor,
        total: items.length,
        pagadas: items.filter((a) => a.pagoCompleto === "Sí").length,
        ingreso: items.reduce((sum, a) => sum + (a.montoPago || 0), 0),
      });
    }
  }
  return rows;
}

function buildInversionesFunnelByMonth(asesorias, inversiones, months) {
  return months.map((month) => {
    const atendidos = asesorias.filter(
      (a) => a.sesion === "Inversiones" && a.pagoCompleto === "Sí" && monthKey(a.fecha) === month,
    );
    const ganados = inversiones.filter(
      (inv) => inv.status === "Ganado" && inv.cierre && monthKey(inv.cierre) === month,
    );
    return {
      month,
      clientesAtendidos: distinctClients(atendidos),
      cierresGanados: ganados.length,
      cierresGanadosClientesDistintos: distinctClients(ganados),
    };
  });
}

function buildInversionesPlazoAporteByMonth(inversiones, months) {
  return months.map((month) => {
    const ganados = inversiones.filter(
      (inv) => inv.status === "Ganado" && inv.cierre && monthKey(inv.cierre) === month,
    );
    const conPlazo = ganados.filter((inv) => inv.plazo != null);
    const conAporteRegular = ganados.filter((inv) => inv.aporteRegular != null);
    return {
      month,
      plazoSum: conPlazo.reduce((sum, inv) => sum + inv.plazo, 0),
      plazoN: conPlazo.length,
      aporteRegularSum: conAporteRegular.reduce((sum, inv) => sum + inv.aporteRegular, 0),
      aporteRegularN: conAporteRegular.length,
      aporteUnicoSum: ganados.reduce((sum, inv) => sum + (inv.aporteUnico || 0), 0),
    };
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

export function buildBusinessDashboard(asesorias, inversiones, { generatedAt, source }) {
  const months = lastCompleteMonths(new Date(generatedAt), MONTHS_WINDOW);

  const inversionesFunnelByMonth = buildInversionesFunnelByMonth(asesorias, inversiones, months);

  const atendidosAllWindow = asesorias.filter(
    (a) => a.sesion === "Inversiones" && a.pagoCompleto === "Sí" && months.includes(monthKey(a.fecha)),
  );
  const ganadosAllWindow = inversiones.filter(
    (inv) => inv.status === "Ganado" && inv.cierre && months.includes(monthKey(inv.cierre)),
  );
  const inversionesAtendidasDistinct = distinctClients(atendidosAllWindow);
  const inversionesCerradasDistinct = distinctClients(ganadosAllWindow);

  const mesConMasCierres = inversionesFunnelByMonth.reduce(
    (best, m) => (m.cierresGanados > (best?.cierresGanados ?? -1) ? m : best),
    null,
  );

  return {
    generatedAt,
    source,
    months,
    asesoriasByMonth: buildAsesoriasByMonth(asesorias, months),
    sessionByMonth: buildSessionByMonth(asesorias, months),
    advisorByMonth: buildAdvisorByMonth(asesorias, months),
    inversionesFunnelByMonth,
    inversionesPlazoAporteByMonth: buildInversionesPlazoAporteByMonth(inversiones, months),
    bestTimeToBook: buildBestTimeToBook(asesorias, months),
    kpisAllTime: {
      inversionesAtendidasDistinct,
      inversionesCerradasDistinct,
      tasaCierreDistinct:
        inversionesAtendidasDistinct > 0
          ? round((inversionesCerradasDistinct / inversionesAtendidasDistinct) * 100, 1)
          : 0,
      mesConMasCierres: mesConMasCierres
        ? { month: mesConMasCierres.month, cierres: mesConMasCierres.cierresGanados }
        : null,
    },
  };
}
