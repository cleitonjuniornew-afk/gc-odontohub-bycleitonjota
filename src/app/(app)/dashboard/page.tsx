import { GreetingHeader } from "@/features/dashboard/components/greeting-header";
import { QuickStats } from "@/features/dashboard/components/quick-stats";
import { StudyChart } from "@/features/dashboard/components/study-chart";
import { AgendaPreview } from "@/features/dashboard/components/agenda-preview";
import { FocusTasks } from "@/features/dashboard/components/focus-tasks";
import { WeeklyGoalCard } from "@/features/dashboard/components/weekly-goal-card";
import { StreakCard } from "@/features/dashboard/components/streak-card";

export default function DashboardPage() {
  return (
    <div>
      <GreetingHeader />
      <div className="space-y-6">
        <QuickStats />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StudyChart />
          </div>
          <StreakCard />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <FocusTasks />
          <WeeklyGoalCard />
          <AgendaPreview />
        </div>
      </div>
    </div>
  );
}
