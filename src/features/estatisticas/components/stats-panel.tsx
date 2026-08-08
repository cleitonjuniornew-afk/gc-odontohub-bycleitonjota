"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, FileText, Image as ImageIcon, ListChecks, GraduationCap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { fadeInUp, staggerContainer } from "@/animations/variants";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";

import { tasksRepository } from "@/repositories/tasks.repository";
import { gradesRepository } from "@/repositories/grades.repository";
import { disciplinesRepository } from "@/repositories/disciplines.repository";
import { libraryRepository } from "@/repositories/library.repository";
import { photosRepository } from "@/repositories/photos.repository";

import type {
  Task,
  Grade,
  Discipline,
  LibraryItem,
  PhotoItem,
} from "@/types";

export function StatsPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);

      try {
        const [
          tasksData,
          gradesData,
          disciplinesData,
          libraryData,
          photosData,
        ] = await Promise.all([
          tasksRepository.list(),
          gradesRepository.list(),
          disciplinesRepository.list(),
          libraryRepository.list(),
          photosRepository.list(),
        ]);

        if (cancelled) return;

        setTasks(tasksData);
        setGrades(gradesData);
        setDisciplines(disciplinesData);
        setLibraryItems(libraryData);
        setPhotos(photosData);
      } catch (error) {
        console.error(
          "Erro ao carregar estatísticas:",
          error
        );

        if (!cancelled) {
          setTasks([]);
          setGrades([]);
          setDisciplines([]);
          setLibraryItems([]);
          setPhotos([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.done).length,
    [tasks]
  );

  const gradesByDiscipline = useMemo(() => {
    return disciplines
      .map((discipline) => {
        const disciplineGrades = grades.filter(
          (grade) =>
            grade.disciplineId === discipline.id &&
            grade.score !== undefined
        );

        if (disciplineGrades.length === 0) {
          return null;
        }

        const weightedTotal = disciplineGrades.reduce(
          (total, grade) =>
            total + (grade.score ?? 0) * grade.weight,
          0
        );

        const totalWeight = disciplineGrades.reduce(
          (total, grade) => total + grade.weight,
          0
        );

        const average =
          totalWeight > 0
            ? weightedTotal / totalWeight
            : 0;

        return {
          disciplina: discipline.name,
          media: Number(average.toFixed(1)),
        };
      })
      .filter(
        (
          item
        ): item is {
          disciplina: string;
          media: number;
        } => item !== null
      );
  }, [disciplines, grades]);

  const materialsByDiscipline = useMemo(() => {
    return disciplines
      .map((discipline) => {
        const count = libraryItems.filter(
          (item) => item.disciplineId === discipline.id
        ).length;

        return {
          disciplina: discipline.name,
          materiais: count,
        };
      })
      .filter((item) => item.materiais > 0);
  }, [disciplines, libraryItems]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <motion.div variants={fadeInUp}>
          <StatCard
            icon={ListChecks}
            label="Tarefas concluídas"
            value={completedTasks}
            accent="primary"
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <StatCard
            icon={GraduationCap}
            label="Avaliações"
            value={grades.length}
            accent="secondary"
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <StatCard
            icon={FileText}
            label="Materiais"
            value={libraryItems.length}
            accent="primary"
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <StatCard
            icon={ImageIcon}
            label="Fotos"
            value={photos.length}
            accent="secondary"
          />
        </motion.div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* MÉDIAS */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
                Médias por disciplina
              </CardTitle>
            </CardHeader>

            {gradesByDiscipline.length === 0 ? (
              <div className="flex h-60 items-center justify-center px-6 text-center text-sm text-text-muted">
                Ainda não existem notas cadastradas
                para gerar este gráfico.
              </div>
            ) : (
              <div className="h-60">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={gradesByDiscipline}
                    margin={{ left: -20, right: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2A2A2A"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="disciplina"
                      stroke="#737373"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={
                        gradesByDiscipline.length > 4
                          ? -25
                          : 0
                      }
                      textAnchor={
                        gradesByDiscipline.length > 4
                          ? "end"
                          : "middle"
                      }
                    />

                    <YAxis
                      stroke="#737373"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 10]}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#181818",
                        border: "1px solid #2A2A2A",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(value) => [
                        `${value}`,
                        "Média",
                      ]}
                    />

                    <Bar
                      dataKey="media"
                      fill="#00BFFF"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>

        {/* MATERIAIS */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-secondary" />
                Materiais por disciplina
              </CardTitle>
            </CardHeader>

            {materialsByDiscipline.length === 0 ? (
              <div className="flex h-60 items-center justify-center px-6 text-center text-sm text-text-muted">
                Ainda não existem materiais vinculados
                às disciplinas.
              </div>
            ) : (
              <div className="h-60">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={materialsByDiscipline}
                    margin={{ left: -20, right: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2A2A2A"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="disciplina"
                      stroke="#737373"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={
                        materialsByDiscipline.length > 4
                          ? -25
                          : 0
                      }
                      textAnchor={
                        materialsByDiscipline.length > 4
                          ? "end"
                          : "middle"
                      }
                    />

                    <YAxis
                      stroke="#737373"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#181818",
                        border: "1px solid #2A2A2A",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(value) => [
                        `${value}`,
                        "Materiais",
                      ]}
                    />

                    <Bar
                      dataKey="materiais"
                      fill="#D4AF37"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
