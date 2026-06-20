import { Home, CalendarCheck, CalendarDays, CalendarRange, Bell, BarChart3, Award, DollarSign, FileText, User } from "lucide-react";

export const INFINITY_PATH = "M30 30 C18 30 18 70 30 70 C42 70 58 30 70 30 C82 30 82 70 70 70 C58 70 42 30 30 30";

export const ROTATING_WORDS = ["comunicados", "vacaciones", "documentos", "permisos", "reportes", "tu equipo"];

export const NAV_ITEMS = [
  { key: "inicio",      label: "Inicio",      icon: Home },
  { key: "vacaciones",        label: "Vacaciones",           icon: CalendarCheck  },
  { key: "solicitudes",       label: "Solicitudes",          icon: CalendarDays   },
  { key: "calendario-equipo", label: "Calendario de equipo", icon: CalendarRange  },
  { key: "comunicados",        label: "Comunicados",          icon: Bell           },
  { key: "encuestas",          label: "Encuestas",            icon: BarChart3      },
  { key: "reconocimientos",   label: "Reconocimientos",      icon: Award          },
  { key: "comisiones",        label: "Comisiones",           icon: DollarSign,    condition: p => p?.commission_eligible && p?.role !== "admin" },
  { key: "documentos",        label: "Documentos",           icon: FileText       },
  { key: "perfil",      label: "Mi perfil",   icon: User },
];

export const VAC_TOTAL = 12;

export const MOTIVATIONAL_MESSAGES = [
  "Cada día es una oportunidad para marcar la diferencia en la vida de alguien.",
  "El buen trabajo en equipo convierte lo difícil en posible.",
  "La atención con calidad empieza con la actitud de cada uno.",
  "Pequeñas mejoras constantes construyen grandes resultados.",
  "Tu dedicación hoy es el bienestar de alguien mañana.",
  "Un equipo que se apoya produce lo mejor en cada paciente.",
  "La excelencia no es un acto puntual, es un hábito.",
  "Cada paciente bien atendido es una misión cumplida.",
  "El cuidado genuino se nota. Gracias por traerlo cada día.",
  "Los detalles son lo que separa lo bueno de lo excepcional.",
  "Trabajar con propósito hace que el esfuerzo valga la pena.",
  "La confianza del paciente se gana con constancia y respeto.",
  "Hoy es un buen día para hacer el trabajo con orgullo.",
  "La comunicación clara es tan importante como la técnica.",
  "Un ambiente positivo es también parte del tratamiento.",
  "El trabajo bien hecho habla por sí solo.",
  "Cada turno es una nueva oportunidad de hacer las cosas con excelencia.",
  "La empatía es la herramienta más poderosa en salud.",
  "El respeto entre colegas se refleja en la calidad del servicio.",
  "Estar presente de verdad marca la diferencia para quienes nos necesitan.",
  "La salud de las personas depende del compromiso de cada uno aquí.",
  "Lo que hacemos importa más de lo que a veces percibimos.",
];

export const TIPOS_PERMISO = ["Permiso médico","Permiso personal","Permiso por duelo","Permiso de estudio","Permiso de paternidad/maternidad","Otro"];

export const TIPOS_REPORTE = ["Daño a instalaciones","Daño a equipos","Incidente de seguridad","Situación de riesgo","Conducta inapropiada","Otro"];

export const RECOGNITION_CATEGORIES = [
  "Trabajo en equipo", "Excelencia en atención", "Iniciativa", "Compañerismo", "Profesionalismo",
];

export const CONFETTI_PARTICLES = [
  { left: "4%",  delay: 0,    dur: 3.8, color: "#C9A24E", size: 8,  rect: true  },
  { left: "10%", delay: 0.6,  dur: 4.5, color: "#1F4A40", size: 6,  rect: false },
  { left: "17%", delay: 1.2,  dur: 3.3, color: "#D4B97A", size: 9,  rect: true  },
  { left: "24%", delay: 0.3,  dur: 4.8, color: "#C9A24E", size: 7,  rect: false },
  { left: "31%", delay: 1.8,  dur: 3.6, color: "#1F4A40", size: 8,  rect: true  },
  { left: "38%", delay: 0.9,  dur: 4.2, color: "#F0EBE0", size: 6,  rect: false },
  { left: "45%", delay: 2.1,  dur: 3.9, color: "#C9A24E", size: 10, rect: true  },
  { left: "52%", delay: 0.5,  dur: 4.6, color: "#D4B97A", size: 7,  rect: true  },
  { left: "59%", delay: 1.5,  dur: 3.3, color: "#1F4A40", size: 8,  rect: false },
  { left: "66%", delay: 0.8,  dur: 4.9, color: "#C9A24E", size: 6,  rect: true  },
  { left: "72%", delay: 2.4,  dur: 3.6, color: "#D4B97A", size: 9,  rect: false },
  { left: "78%", delay: 1.1,  dur: 4.3, color: "#C9A24E", size: 7,  rect: true  },
  { left: "84%", delay: 0.2,  dur: 3.9, color: "#1F4A40", size: 8,  rect: false },
  { left: "90%", delay: 1.7,  dur: 4.6, color: "#D4B97A", size: 6,  rect: true  },
  { left: "96%", delay: 0.7,  dur: 3.3, color: "#C9A24E", size: 10, rect: false },
  { left: "7%",  delay: 2.8,  dur: 4.1, color: "#D4B97A", size: 7,  rect: true  },
  { left: "43%", delay: 3.2,  dur: 3.7, color: "#1F4A40", size: 6,  rect: false },
  { left: "70%", delay: 1.9,  dur: 4.4, color: "#C9A24E", size: 8,  rect: true  },
];
