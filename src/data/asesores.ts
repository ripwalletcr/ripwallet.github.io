import kevinImg from "../images/kevin.jpg";
import jostinImg from "../images/jostin_final.jpg";
import eduardoImg from "../images/eduardo.jpeg";
import angelaImg from "../images/angela.jpg";

export type Servicio = "finanzas" | "parejas" | "inversiones";

export type Asesor = {
  slug: string; // coincide con el prefijo de los redirects (/kevin/finanzas)
  name: string;
  img?: ImageMetadata; // sin foto => se muestran las iniciales
  imgPosition?: string;
  accent: "yellow" | "red" | "blue" | "teal";
  servicios: Servicio[];
  disponible?: boolean; // false => tarjeta deshabilitada, sin enlace a la agenda
};

// Mismo orden y colores de borde que /equipo.
export const asesores: Asesor[] = [
  {
    slug: "kevin",
    name: "Kevin",
    img: kevinImg,
    accent: "yellow",
    servicios: ["finanzas", "parejas", "inversiones"],
    disponible: false,
  },
  {
    slug: "jostin",
    name: "Jostin",
    img: jostinImg,
    accent: "red",
    servicios: ["finanzas", "parejas", "inversiones"],
  },
  {
    slug: "eduardo",
    name: "Eduardo",
    img: eduardoImg,
    accent: "blue",
    servicios: ["finanzas", "parejas"],
  },
  {
    // TODO: agregar la descripción de Ángela en src/content/rediseno/equipo.html.
    slug: "angela",
    name: "Ángela",
    img: angelaImg,
    accent: "teal",
    servicios: ["finanzas", "inversiones"],
  },
];
