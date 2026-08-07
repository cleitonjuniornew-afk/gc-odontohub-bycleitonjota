"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fadeInUp } from "@/animations/variants";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { studyHoursSeries } from "@/lib/mock-data";

export function StudyChart() {
  return (
    <motion.div variants={fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4.5 w-4.5 text-primary" /> Horas estudadas
          </CardTitle>
          <span className="text-xs text-text-muted">últimos 7 dias</span>
        </CardHeader>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={studyHoursSeries} margin={{ left: -20, top: 8 }}>
              <defs>
                <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <XAxis dataKey="day" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#181818", border: "1px solid #2A2A2A", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "#A3A3A3" }}
              />
              <Area type="monotone" dataKey="horas" stroke="#D4AF37" strokeWidth={2} fill="url(#colorHoras)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
