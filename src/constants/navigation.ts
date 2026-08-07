import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  ListTodo,
  BookOpen,
  Library,
  Images,
  Layers,
  Stethoscope,
  Users,
  GraduationCap,
  BarChart3,
  Sparkles,
  Trophy,
  Target,
  History,
  Download,
  DatabaseBackup,
  Settings,
  Bell,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  future?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agenda", href: "/agenda", icon: CalendarDays },
  { label: "Planejamento", href: "/planejamento", icon: ListTodo },
  { label: "Disciplinas", href: "/disciplinas", icon: BookOpen },
  { label: "Biblioteca", href: "/biblioteca", icon: Library },
  { label: "Fotos", href: "/fotos", icon: Images },
  { label: "Flashcards", href: "/flashcards", icon: Layers, future: true },
  { label: "Casos Clínicos", href: "/casos-clinicos", icon: Stethoscope },
  { label: "Pacientes", href: "/pacientes", icon: Users },
  { label: "Notas", href: "/notas", icon: GraduationCap },
  { label: "Estatísticas", href: "/estatisticas", icon: BarChart3 },
  { label: "IA", href: "/ia", icon: Sparkles, future: true },
];

export const SECONDARY_NAV: NavItem[] = [
  { label: "Conquistas", href: "/conquistas", icon: Trophy, future: true },
  { label: "Objetivos", href: "/objetivos", icon: Target },
  { label: "Histórico", href: "/historico", icon: History },
  { label: "Downloads", href: "/downloads", icon: Download },
  { label: "Backup", href: "/backup", icon: DatabaseBackup, future: true },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export const NOTIFICATIONS_ICON = Bell;
