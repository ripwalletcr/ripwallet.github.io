// Comparativa de opciones de inversión disponibles para personas en Costa Rica.
// Fuente: prospectos, fichas e informes de cada fondo (ago 2026) y sitios oficiales,
// complementados con reviews públicas para brokers y planes internacionales.
// Los campos en null significan "sin dato confirmado" y se muestran como "Por confirmar" en la página.

export type Grupo = "activo" | "pasivo" | "otras";
export type Nivel = "alto" | "medio" | "bajo";

export interface Rubro {
  /** Calificación del rubro. En comisiones, "bajo" es lo mejor. */
  nivel: Nivel;
  resumen: string;
  detalles: string[];
}

/**
 * Supuestos para proyectar una inversión con los costos propios de cada herramienta.
 * La página los muestra como valores editables.
 */
export interface Proyeccion {
  /** Rendimiento anual esperado antes de comisiones, en %. */
  rendimiento: number;
  /** Costo de transferencia por cada aporte, en dólares. */
  transferencia: number;
  /** Costo de plataforma por cada aporte (comisión por orden), en dólares. */
  plataforma: number;
  /** Comisión de administración anual, en %. */
  administracion: number;
  /** "saldo" (lo normal) o "aportes" si la comisión se cobra sobre lo aportado. */
  base?: "saldo" | "aportes";
  /** Si la comisión de administración solo se cobra los primeros N años. */
  aniosAdministracion?: number;
  /** Comisión de administración según el plazo del plan: [años, %]. Reemplaza a `administracion`. */
  administracionPorPlazo?: [number, number][];
  /** Costo fijo por año (cargo de póliza), en dólares. */
  costoAnual?: number;
  /** Costo único de apertura, en dólares. */
  costoInicial?: number;
  /**
   * Planes que apartan parte de los aportes en "unidades de establecimiento" (UE): no se invierten
   * y pagan por adelantado la comisión de administración de todo el plazo.
   */
  establecimiento?: {
    /** % del aporte del año 1 que va a UE, por cada año de plazo (15 años x 4,95% = 74,25%). */
    anio1: number;
    /** % del aporte del año 2 que va a UE, por cada año de plazo. */
    anio2: number;
    /** % del aporte único que va a UE. */
    aporteUnico: number;
    /** Comisión anual sobre el monto del aporte único durante los primeros `aniosAporteUnico` años. */
    administracionAporteUnico: number;
    aniosAporteUnico: number;
    /** Comisión anual sobre el valor del aporte único a partir de entonces. */
    administracionAporteUnicoDespues: number;
  };
  /** Explicación corta de los supuestos que no salen de un documento oficial. */
  nota?: string;
}

/** Rendimiento neto histórico de un fondo, tomado de sus informes mensuales. */
export interface Historico {
  /** Rendimiento neto anual por periodo, en %. */
  periodos: [string, number][];
  /** Promedio anual compuesto de los periodos, en %. */
  promedio: number;
  nota?: string;
}

export interface OpcionInversion {
  id: string;
  nombre: string;
  entidad: string;
  /** Logo cuadrado de la entidad, ruta dentro de public/. */
  logo: string;
  grupo: Grupo;
  tipo: string;
  /** Monto mínimo para empezar, en la moneda de `monedaMinimo` (dólares por defecto). */
  minimo: number | null;
  monedaMinimo?: "USD" | "CRC";
  /** true si el mínimo es un aporte mensual obligatorio (planes de ahorro). */
  minimoMensual?: boolean;
  respaldo: Rubro;
  flexibilidad: Rubro;
  /** Entidad que custodia los activos del fondo (fondos locales). */
  custodia?: string;
  comisiones: {
    nivel: Nivel;
    /** Una línea con lo más importante, para la tarjeta. */
    resumen: string;
    transferencia: string | null;
    plataforma: string | null;
    administracion: string | null;
  };
  proyeccion: Proyeccion;
  /** Solo fondos locales. Un texto explica por qué no hay historia suficiente. */
  historico?: Historico | string;
  idealPara: string;
  url: string;
}

const LOGO_BAC = "/images/tarjetas/icono-bac-icono.webp";

// Periodos de los informes de BAC SAFI con corte al 31 de agosto de 2026.
const PERIODOS = ["2022", "2023", "2024", "2025", "Últ. 12 meses"];
const historico = (valores: number[], promedio: number, nota?: string): Historico => ({
  periodos: PERIODOS.map((p, i) => [p, valores[i]]),
  promedio,
  nota,
});
const NOTA_LIQUIDOS = "Promedio de los rendimientos de 30 días de cada año.";

export const actualizado = "Octubre 4, 2026";

export const grupos: Record<Grupo, { titulo: string; descripcion: string }> = {
  activo: {
    titulo: "Brokers",
    descripcion: "La persona escoge y compra sus propios ETFs o acciones.",
  },
  pasivo: {
    titulo: "Fondos de inversión",
    descripcion: "Una administradora local invierte por la persona. Regulados por SUGEVAL.",
  },
  otras: {
    titulo: "Otras opciones del mercado",
    descripcion:
      "Planes de ahorro internacionales con plazo fijo que suelen ofrecer asesores independientes.",
  },
};

// Supuestos compartidos de la proyección.
const ETF_SP500 = 0.03; // Costo anual de un ETF del S&P 500 como VOO.
const WIRE_LOCAL = 35; // Envío internacional desde un banco local: entre $25 y $50.
// El custodio de los fondos locales pertenece al mismo grupo que los administra: respaldo medio.
const RESPALDO_SUGEVAL = (grupo: string): Rubro => ({
  nivel: "medio",
  resumen: `Regulado por SUGEVAL, grupo ${grupo}`,
  detalles: [
    "Fondo regulado por SUGEVAL",
    "El patrimonio del fondo está separado del de la administradora",
    "Sin garantía de capital: el valor de la participación sube y baja",
  ],
});

export const opciones: OpcionInversion[] = [
  // Activo: brokers
  {
    id: "ibkr",
    nombre: "Interactive Brokers",
    entidad: "Interactive Brokers LLC (EE.UU.)",
    logo: "/images/inversiones/icono-ibkr.webp",
    grupo: "activo",
    tipo: "Broker",
    minimo: 0,
    respaldo: {
      nivel: "alto",
      resumen: "Regulado en EE.UU. con protección SIPC",
      detalles: [
        "Regulado por la SEC y FINRA",
        "Protección SIPC hasta $500.000 (incluye $250.000 en efectivo)",
        "Empresa que cotiza en Nasdaq (IBKR)",
      ],
    },
    flexibilidad: {
      nivel: "alto",
      resumen: "Acceso a 150+ mercados del mundo",
      detalles: [
        "Acciones, ETFs, bonos, opciones y futuros",
        "Fracciones de acciones e inversiones recurrentes",
        "Plataforma más técnica: requiere acompañamiento al inicio",
      ],
    },
    comisiones: {
      nivel: "bajo",
      resumen: "$25 a $50 por envío del banco y $1 por orden",
      transferencia: "El banco local cobra entre $25 y $50 por cada envío. 1 retiro gratis al mes, luego ~$10",
      plataforma: "Sin mantenimiento ni inactividad. Compra-venta desde $0,005 por acción (mín. $1 por orden)",
      administracion: "No aplica: la persona administra",
    },
    proyeccion: {
      rendimiento: 8,
      transferencia: WIRE_LOCAL,
      plataforma: 1,
      administracion: ETF_SP500,
      nota: "Transferencia: el banco local cobra entre $25 y $50 por envío; ajústalo según el banco. Administración: costo de un ETF como VOO.",
    },
    idealPara: "Quien quiere el costo más bajo y control total de su portafolio",
    url: "https://www.interactivebrokers.com",
  },
  {
    id: "etoro",
    nombre: "eToro",
    entidad: "eToro (Seychelles) Ltd",
    logo: "/images/inversiones/icono-etoro.webp",
    grupo: "activo",
    tipo: "Broker",
    minimo: 50,
    respaldo: {
      nivel: "medio",
      resumen: "Entidad offshore, grupo que cotiza en bolsa",
      detalles: [
        "Clientes de Latinoamérica operan con la entidad regulada por la FSA de Seychelles",
        "Sin protección tipo SIPC para esta entidad",
        "El grupo eToro cotiza en Nasdaq (ETOR) desde 2025",
      ],
    },
    flexibilidad: {
      nivel: "alto",
      resumen: "App sencilla con muchas herramientas",
      detalles: [
        "Acciones, ETFs, cripto, CopyTrader y Smart Portfolios",
        "Fracciones de acciones desde montos pequeños",
        "Depósitos con tarjeta de débito en dólares",
      ],
    },
    comisiones: {
      nivel: "bajo",
      resumen: "Depósito con tarjeta sin costo y $5 por retiro",
      transferencia: "Retiro de $5 desde la cuenta en dólares",
      plataforma: "Sin inactividad desde mayo 2026. Spread en cripto y CFDs; confirmar costo por orden en acciones",
      administracion: "No aplica: la persona administra",
    },
    proyeccion: {
      rendimiento: 8,
      transferencia: 0,
      plataforma: 0,
      administracion: ETF_SP500,
      nota: "Transferencia: depósito con tarjeta de débito en dólares. Administración: costo de un ETF como VOO.",
    },
    idealPara: "Quien empieza con montos pequeños y quiere una app fácil",
    url: "https://www.etoro.com",
  },
  {
    id: "schwab",
    nombre: "Charles Schwab International",
    entidad: "Charles Schwab & Co. (EE.UU.)",
    logo: "/images/inversiones/icono-schwab.webp",
    grupo: "activo",
    tipo: "Broker",
    minimo: null,
    respaldo: {
      nivel: "alto",
      resumen: "Uno de los brokers más grandes del mundo",
      detalles: [
        "Regulado por la SEC y FINRA",
        "Protección SIPC hasta $500.000 más cobertura adicional",
        "Empresa que cotiza en NYSE (SCHW)",
      ],
    },
    flexibilidad: {
      nivel: "alto",
      resumen: "Mercado de EE.UU. completo",
      detalles: [
        "Acciones, ETFs, fondos mutuos, bonos y opciones",
        "Plataforma thinkorswim para perfiles avanzados",
        "Elegibilidad y mínimo de apertura dependen del país: confirmar para Costa Rica",
      ],
    },
    comisiones: {
      nivel: "bajo",
      resumen: "$25 a $50 por envío del banco, $0 por orden",
      transferencia: "El banco local cobra entre $25 y $50 por cada envío. Transferencia saliente de $25",
      plataforma: "$0 en acciones y ETFs de EE.UU. en línea, sin mantenimiento",
      administracion: "No aplica: la persona administra",
    },
    proyeccion: {
      rendimiento: 8,
      transferencia: WIRE_LOCAL,
      plataforma: 0,
      administracion: ETF_SP500,
      nota: "Transferencia: el banco local cobra entre $25 y $50 por envío; ajústalo según el banco. Administración: costo de un ETF como VOO.",
    },
    idealPara: "Quien tiene un monto inicial alto y busca un broker tradicional",
    url: "https://international.schwab.com",
  },

  // Pasivo: fondos de inversión locales
  {
    id: "bn-etf500",
    nombre: "BN ETF500",
    entidad: "BN Sociedad Administradora de Fondos de Inversión",
    logo: "/images/tarjetas/icono-bn-icon.webp",
    grupo: "pasivo",
    tipo: "Fondo indexado al S&P 500",
    minimo: 100,
    respaldo: RESPALDO_SUGEVAL("Banco Nacional"),
    flexibilidad: {
      nivel: "alto",
      resumen: "Aportes desde $1 y sin comisión de salida",
      detalles: [
        "Invierte en ETFs que replican el S&P 500 (VOO, SPY5 y similares)",
        "Aportes y retiros desde $1 en la app del BN, saldo mínimo de $100",
        "Retiros en 3 días hábiles (T+3), permanencia recomendada de 5 años",
      ],
    },
    custodia: "Banco Nacional de Costa Rica",
    comisiones: {
      nivel: "medio",
      resumen: "1% anual sobre el neto, sin entrada ni salida",
      transferencia: "Sin comisión de entrada ni de salida",
      plataforma: "Sin costo (app del BN)",
      administracion: "1% anual sobre el activo neto (aportes + rendimientos)",
    },
    proyeccion: { rendimiento: 8, transferencia: 0, plataforma: 0, administracion: 1 },
    historico: "Fondo autorizado en enero 2025: todavía no tiene 5 años de historia.",
    idealPara: "Quien quiere el S&P 500 desde un banco local y aportar poco a poco",
    url: "https://www.bnfondos.com/bn-etf500",
  },
  {
    id: "bac-millennium",
    nombre: "Millennium BAC",
    entidad: "BAC San José SAFI",
    logo: LOGO_BAC,
    grupo: "pasivo",
    tipo: "Fondo de crecimiento en acciones",
    minimo: 250,
    respaldo: RESPALDO_SUGEVAL("BAC"),
    flexibilidad: {
      nivel: "medio",
      resumen: "Acciones internacionales, aportes desde $100",
      detalles: [
        "92% renta variable: 63% EE.UU., resto Europa, Asia y emergentes",
        "Aportes y retiros desde $100, retiros en 3 días hábiles",
        "Perfil moderado, permanencia recomendada de 5 años",
      ],
    },
    custodia: "Banco BAC San José y BAC San José Puesto de Bolsa",
    comisiones: {
      nivel: "medio",
      resumen: "1,50% anual sobre el neto, sin entrada ni salida",
      transferencia: "Sin comisión de entrada ni de salida",
      plataforma: "Sin costo (banca en línea y app de BAC)",
      administracion: "1,50% anual sobre el activo neto (aportes + rendimientos). Máximo permitido 4%",
    },
    proyeccion: { rendimiento: 8, transferencia: 0, plataforma: 0, administracion: 1.5 },
    historico: historico([-17.03, 16.19, 11.54, 17.05, 17.12], 8.07),
    idealPara: "Clientes de BAC que quieren acciones globales sin abrir un broker",
    url: "https://www.baccredomatic.com/es-cr/personas/inversiones",
  },
  {
    id: "bac-posible",
    nombre: "Posible BAC",
    entidad: "BAC San José SAFI",
    logo: LOGO_BAC,
    grupo: "pasivo",
    tipo: "Fondo de crecimiento mixto",
    minimo: 50,
    respaldo: RESPALDO_SUGEVAL("BAC"),
    flexibilidad: {
      nivel: "alto",
      resumen: "El más accesible de BAC: aportes desde $10",
      detalles: [
        "Mixto: 55% renta fija, 29% acciones, resto efectivo y alternativos",
        "Aportes y retiros desde $10, retiros en 5 días hábiles",
        "Perfil conservador, en dólares",
      ],
    },
    custodia: "Banco BAC San José y BAC San José Puesto de Bolsa",
    comisiones: {
      nivel: "medio",
      resumen: "1,25% anual sobre el neto, sin entrada ni salida",
      transferencia: "Sin comisión de entrada ni de salida",
      plataforma: "Sin costo (banca en línea y app de BAC)",
      administracion: "1,25% anual sobre el activo neto (aportes + rendimientos)",
    },
    proyeccion: { rendimiento: 6, transferencia: 0, plataforma: 0, administracion: 1.25 },
    historico: historico([-12.23, 9.34, 5.63, 12.44, 8.59], 4.36),
    idealPara: "Perfiles conservadores que quieren empezar con poco",
    url: "https://www.baccredomatic.com/es-cr/personas/inversiones",
  },
  {
    id: "acobo-conexion",
    nombre: "Fondo Conexión",
    entidad: "ACOBO Vista SFI",
    logo: "/images/inversiones/icono-acobo.webp",
    grupo: "pasivo",
    tipo: "Fondo en ETFs del S&P 500",
    minimo: 250,
    respaldo: RESPALDO_SUGEVAL("ACOBO"),
    flexibilidad: {
      nivel: "medio",
      resumen: "Aportes desde $25 con la periodicidad que se quiera",
      detalles: [
        "Invierte en ETFs ligados al S&P 500",
        "Retiros en hasta 10 días naturales (T+10), saldo mínimo de $250",
        "Permanencia recomendada de 3 años",
      ],
    },
    custodia: "ACOBO Puesto de Bolsa",
    comisiones: {
      nivel: "alto",
      resumen: "2% anual sobre el neto, sin entrada ni salida",
      transferencia: "Sin comisión de entrada ni de salida",
      plataforma: "Sin costo",
      administracion: "2% anual sobre el activo neto (aportes + rendimientos). Máximo permitido 5%",
    },
    proyeccion: { rendimiento: 8, transferencia: 0, plataforma: 0, administracion: 2 },
    historico: "Opera desde 2023: rendimientos por año por confirmar con el informe del fondo.",
    idealPara: "Quien ya trabaja con ACOBO y quiere aportes automáticos pequeños",
    url: "https://www.acobo.com/invierta/",
  },
  {
    id: "bac-impulso-d",
    nombre: "Impulso D BAC",
    entidad: "BAC San José SAFI",
    logo: LOGO_BAC,
    grupo: "pasivo",
    tipo: "Fondo de mercado de dinero en dólares",
    minimo: 250,
    respaldo: RESPALDO_SUGEVAL("BAC"),
    flexibilidad: {
      nivel: "alto",
      resumen: "Liquidez al día siguiente",
      detalles: [
        "Renta fija de corto plazo, local e internacional",
        "Aportes y retiros desde $1, dinero disponible en 1 día hábil",
        "Para fondo de emergencia, no para jubilación",
      ],
    },
    custodia: "Banco BAC San José y BAC San José Puesto de Bolsa",
    comisiones: {
      nivel: "medio",
      resumen: "0,85% anual sobre el neto, sin entrada ni salida",
      transferencia: "Sin comisión de entrada ni de salida",
      plataforma: "Sin costo (banca en línea y app de BAC)",
      administracion: "0,85% anual sobre el activo neto (aportes + rendimientos)",
    },
    proyeccion: { rendimiento: 3.7, transferencia: 0, plataforma: 0, administracion: 0.85 },
    historico: historico([1.13, 3.32, 3.67, 3.28, 2.98], 2.87, NOTA_LIQUIDOS),
    idealPara: "Fondo de emergencia en dólares",
    url: "https://www.baccredomatic.com/es-cr/personas/inversiones",
  },
  {
    id: "bac-impulso-c",
    nombre: "Impulso C BAC",
    entidad: "BAC San José SAFI",
    logo: LOGO_BAC,
    grupo: "pasivo",
    tipo: "Fondo de mercado de dinero en colones",
    minimo: 150000,
    monedaMinimo: "CRC",
    respaldo: RESPALDO_SUGEVAL("BAC"),
    flexibilidad: {
      nivel: "alto",
      resumen: "Liquidez al día siguiente, en colones",
      detalles: [
        "Renta fija local de corto plazo",
        "Aportes y retiros desde ₡1, dinero disponible en 1 día hábil",
        "Para fondo de emergencia, no para jubilación",
      ],
    },
    custodia: "Banco BAC San José y BAC San José Puesto de Bolsa",
    comisiones: {
      nivel: "medio",
      resumen: "1,20% anual sobre el neto, sin entrada ni salida",
      transferencia: "Sin comisión de entrada ni de salida",
      plataforma: "Sin costo (banca en línea y app de BAC)",
      administracion: "1,20% anual sobre el activo neto (aportes + rendimientos)",
    },
    proyeccion: { rendimiento: 3.8, transferencia: 0, plataforma: 0, administracion: 1.2 },
    historico: historico([2.22, 6.08, 3.72, 2.8, 2.59], 3.47, NOTA_LIQUIDOS),
    idealPara: "Fondo de emergencia en colones",
    url: "https://www.baccredomatic.com/es-cr/personas/inversiones",
  },
  {
    id: "bac-proposito",
    nombre: "Propósito BAC",
    entidad: "BAC San José SAFI",
    logo: LOGO_BAC,
    grupo: "pasivo",
    tipo: "Fondo de ingreso en colones",
    minimo: 150000,
    monedaMinimo: "CRC",
    respaldo: RESPALDO_SUGEVAL("BAC"),
    flexibilidad: {
      nivel: "medio",
      resumen: "Paga rendimientos todos los meses",
      detalles: [
        "Bonos locales soberanos y corporativos en colones",
        "Aportes desde ₡1, retiros desde ₡50.000 en 5 días hábiles",
        "Distribuye rendimientos mensualmente",
      ],
    },
    custodia: "Banco BAC San José y BAC San José Puesto de Bolsa",
    comisiones: {
      nivel: "medio",
      resumen: "1% anual sobre el neto, sin entrada ni salida",
      transferencia: "Sin comisión de entrada ni de salida",
      plataforma: "Sin costo (banca en línea y app de BAC)",
      administracion: "1% anual sobre el activo neto (aportes + rendimientos)",
    },
    proyeccion: { rendimiento: 6, transferencia: 0, plataforma: 0, administracion: 1 },
    historico: historico([-3.76, 11.97, 5.68, 4.03, 5.43], 4.55, "Rendimiento total: incluye los beneficios distribuidos."),
    idealPara: "Quien busca un ingreso mensual en colones",
    url: "https://www.baccredomatic.com/es-cr/personas/inversiones",
  },
  {
    id: "bac-sin-fronteras",
    nombre: "Sin Fronteras BAC",
    entidad: "BAC San José SAFI",
    logo: LOGO_BAC,
    grupo: "pasivo",
    tipo: "Fondo cerrado de ingreso en dólares",
    minimo: null,
    respaldo: RESPALDO_SUGEVAL("BAC"),
    flexibilidad: {
      nivel: "bajo",
      resumen: "Fondo cerrado: se compra y vende en bolsa",
      detalles: [
        "Bonos soberanos y corporativos de Latinoamérica",
        "Paga rendimientos cada trimestre",
        "Para salir hay que vender en el mercado secundario por medio del puesto de bolsa",
      ],
    },
    custodia: "Banco BAC San José y BAC San José Puesto de Bolsa",
    comisiones: {
      nivel: "medio",
      resumen: "1,25% anual sobre el neto, más el puesto de bolsa",
      transferencia: "Comisión del puesto de bolsa al comprar y vender: confirmar",
      plataforma: "Sin costo (BAC Puesto de Bolsa)",
      administracion: "1,25% anual sobre el activo neto (aportes + rendimientos)",
    },
    proyeccion: { rendimiento: 7, transferencia: 0, plataforma: 0, administracion: 1.25 },
    historico: historico([-2.01, 10.07, 1.62, 13.4, 6.21], 5.71, "Rendimiento total: incluye los beneficios distribuidos."),
    idealPara: "Quien busca un ingreso trimestral en dólares y no necesita liquidez",
    url: "https://www.baccredomatic.com/es-cr/personas/inversiones",
  },

  // Otras opciones: planes de ahorro internacionales
  {
    id: "investors-trust",
    nombre: "Investors Trust",
    entidad: "Investors Trust Assurance SPC (Islas Caimán)",
    logo: "/images/inversiones/icono-investors-trust.webp",
    grupo: "otras",
    tipo: "Plan de inversión con seguro",
    minimo: null,
    minimoMensual: true,
    respaldo: {
      nivel: "medio",
      resumen: "Aseguradora regulada en Islas Caimán",
      detalles: [
        "Regulada por CIMA (Cayman Islands Monetary Authority)",
        "Sin fondo de garantía al inversionista",
        ],
    },
    flexibilidad: {
      nivel: "bajo",
      resumen: "Contrato a plazo con penalidad por salida",
      detalles: [
        "Plan con envoltura de seguro y plazo definido",
        "Retirarse antes del plazo implica cargos de rescate",
        "Los fondos disponibles los define la aseguradora",
      ],
    },
    comisiones: {
      nivel: "alto",
      resumen: "~1,9% anual los primeros años, póliza y rescate",
      transferencia: "Cargo por rescate anticipado durante los primeros años",
      plataforma: "Cargo de póliza anual (~$180 en algunos planes)",
      administracion: "~1,2% a 1,9% anual los primeros 8 a 10 años, más el costo de cada fondo",
    },
    proyeccion: {
      rendimiento: 8,
      transferencia: 0,
      plataforma: 0,
      administracion: 1.9,
      aniosAdministracion: 10,
      costoAnual: 180,
      nota: "Estimado con base en reviews públicas: 1,9% anual los primeros 10 años y $180 de póliza al año. No incluye el costo de los fondos.",
    },
    idealPara: "Revisar con cuidado: costos altos y poca liquidez",
    url: "https://www.investors-trust.com",
  },
  {
    id: "dominion",
    nombre: "Dominion My Savings Strategy",
    entidad: "Dominion Capital Strategies (Guernsey)",
    logo: "/images/inversiones/icono-dominion.webp",
    grupo: "otras",
    tipo: "Plan de ahorro a plazo",
    minimo: 250,
    minimoMensual: true,
    respaldo: {
      nivel: "alto",
      resumen: "Regulado por la GFSC, Guernsey",
      detalles: [
        "Regulado por la Guernsey Financial Services Commission",
        "Cuentas segregadas en custodia de Bank of New York Mellon",
        ],
    },
    flexibilidad: {
      nivel: "bajo",
      resumen: "Plazo de 5 a 20 años con aporte mensual",
      detalles: [
        "Aporte mínimo de $250 al mes o aporte único desde $1.500",
        "Rescates parciales, aportes omitidos y cambios de fondo sin costo",
        "En un plan a 15 años, el 74% de los aportes del primer año y el 19% del segundo no se invierten: pagan por adelantado las comisiones de todo el plazo",
        "Si se retira antes del plazo pierde esa parte: en un plan a 20 años, el primer año solo se puede retirar ~1% del valor",
      ],
    },
    custodia: "Bank of New York Mellon",
    comisiones: {
      nivel: "medio",
      resumen: "1,15% a 2,65% anual sobre aportes, pagado por adelantado",
      transferencia: "Tarjeta o transferencia bancaria",
      plataforma: "Apertura de $25",
      administracion:
        "Solo sobre los aportes: 2,65% anual (plazo de 5 años) a 1,15% (15 a 20 años). Se paga por adelantado: en un plan a 15 años, el 74% de los aportes del primer año y el 19% del segundo no se invierten. Aporte único: 7,8% no se invierte, 1,60% anual sobre el monto los primeros 5 años y luego 1% anual sobre su valor",
    },
    proyeccion: {
      rendimiento: 8,
      transferencia: 0,
      plataforma: 0,
      administracion: 1.15,
      base: "aportes",
      costoInicial: 25,
      establecimiento: {
        anio1: 4.95,
        anio2: 1.2375,
        aporteUnico: 7.8,
        administracionAporteUnico: 1.6,
        aniosAporteUnico: 5,
        administracionAporteUnicoDespues: 1,
      },
      administracionPorPlazo: [
        [5, 2.65],
        [6, 2.15],
        [7, 1.85],
        [8, 1.65],
        [9, 1.5],
        [10, 1.35],
        [11, 1.23],
        [12, 1.17],
        [13, 1.16],
        [14, 1.16],
        [15, 1.15],
      ],
      nota: "Modelo según las ilustraciones de Dominion: los aportes del primer y segundo año pagan por adelantado la comisión de todo el plazo y no se invierten. El valor es el que se puede retirar. No incluye el costo de los fondos.",
    },
    idealPara:
      "Quien quiere automatizar su inversión en un portafolio pasivo y diversificado escogiendo sus propios fondos (algo que los fondos de Costa Rica no permiten), aunque pague más comisión",
    url: "https://dominion-cs.com",
  },
];
