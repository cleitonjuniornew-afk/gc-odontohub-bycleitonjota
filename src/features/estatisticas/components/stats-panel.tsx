"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { FileText, Image as ImageIcon, ListChecks, Flame } from "lucide-react";
import { studyHoursSeries, gradesSeries, libraryItems, photos, tasks, streak } from "@/lib/mock-data";

export function StatsPanel() {
  return (
    <div className="space-y-6">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Tarefas concluídas" value={tasks.filter((t) => t.done).length} accent="primary" />
        <StatCard icon={FileText} label="PDFs e slides" value={libraryItems.length} accent="secondary" />
        <StatCard icon={ImageIcon} label="Fotos registradas" value={photos.length} accent="success" />
        <StatCard icon={Flame} label="Dias consecutivos" value={streak.current} accent="warning" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4.5 w-4.5 text-primary" /> Horas estudadas</CardTitle>
            </CardHeader>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyHoursSeries} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                  <XAxis dataKey="day" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#181818", border: "1px solid #2A2A2A", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="horas" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4.5 w-4.5 text-secondary" /> Médias por disciplina</CardTitle>
            </CardHeader>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradesSeries} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                  <XAxis dataKey="disciplina" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: "#181818", border: "1px solid #2A2A2A", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="media" fill="#00BFFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
