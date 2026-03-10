import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  ChevronRight,
  Droplets,
  Dumbbell,
  Footprints,
  LogIn,
  LogOut,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCardioHistory,
  useDailyGoals,
  useLogSteps,
  useLogWater,
  useStepHistory,
  useWaterIntakeHistory,
  useWorkoutHistory,
} from "../hooks/useQueries";

type TabId = "dashboard" | "workout" | "cardio" | "progress";

interface Props {
  onNavigate: (tab: TabId) => void;
}

const DEFAULT_GOALS = {
  stepGoal: BigInt(10000),
  waterGoal: BigInt(8),
  workoutDaysPerWeek: BigInt(4),
  cardioMinutesPerWeek: BigInt(150),
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardTab({ onNavigate }: Props) {
  const {
    login,
    clear,
    identity,
    isLoggingIn,
    isLoginSuccess,
    isInitializing,
  } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: workoutHistory = [] } = useWorkoutHistory();
  const { data: cardioHistory = [] } = useCardioHistory();
  const { data: stepHistory = [] } = useStepHistory();
  const { data: waterHistory = [] } = useWaterIntakeHistory();
  const { data: goals } = useDailyGoals();

  const logStepsMutation = useLogSteps();
  const logWaterMutation = useLogWater();

  const [stepsDialogOpen, setStepsDialogOpen] = useState(false);
  const [stepsInput, setStepsInput] = useState("");

  const effectiveGoals = goals ?? DEFAULT_GOALS;

  // Today's stats
  const todaySteps =
    stepHistory.length > 0 ? Number(stepHistory[stepHistory.length - 1]) : 0;
  const todayWater =
    waterHistory.length > 0 ? Number(waterHistory[waterHistory.length - 1]) : 0;

  // This week workouts
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const workoutsThisWeek = workoutHistory.filter((w) => {
    const ms = Number(w.date) / 1_000_000;
    return now - ms < weekMs;
  }).length;

  // This week cardio minutes
  const cardioThisWeek = cardioHistory.reduce(
    (sum, c) => sum + Number(c.durationMinutes),
    0,
  );

  const stepGoal = Number(effectiveGoals.stepGoal);
  const waterGoal = Number(effectiveGoals.waterGoal);
  const workoutGoal = Number(effectiveGoals.workoutDaysPerWeek);
  const cardioGoal = Number(effectiveGoals.cardioMinutesPerWeek);

  const stepPct = Math.min(100, Math.round((todaySteps / stepGoal) * 100));
  const waterPct = Math.min(100, Math.round((todayWater / waterGoal) * 100));
  const workoutPct = Math.min(
    100,
    Math.round((workoutsThisWeek / workoutGoal) * 100),
  );
  const cardioPct = Math.min(
    100,
    Math.round((cardioThisWeek / cardioGoal) * 100),
  );

  // Weekly activity chart data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayStart = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
    ).getTime();
    const dayEnd = dayStart + 86400000;
    const workoutsDay = workoutHistory.filter((w) => {
      const ms = Number(w.date) / 1_000_000;
      return ms >= dayStart && ms < dayEnd;
    }).length;
    return { day: dayLabel, workouts: workoutsDay };
  });

  const handleLogWater = async () => {
    try {
      const current = BigInt(todayWater);
      await logWaterMutation.mutateAsync(current + BigInt(1));
      toast.success("Water logged! 💧");
    } catch {
      toast.error("Failed to log water");
    }
  };

  const handleLogSteps = async () => {
    const val = Number.parseInt(stepsInput);
    if (!stepsInput || Number.isNaN(val) || val <= 0) {
      toast.error("Enter a valid step count");
      return;
    }
    try {
      await logStepsMutation.mutateAsync(BigInt(val));
      toast.success(`${val.toLocaleString()} steps logged! 👟`);
      setStepsDialogOpen(false);
      setStepsInput("");
    } catch {
      toast.error("Failed to log steps");
    }
  };

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principalStr ? `${principalStr.slice(0, 5)}...` : "";

  const metrics = [
    {
      label: "Steps Today",
      value: todaySteps.toLocaleString(),
      goal: `${stepGoal.toLocaleString()} goal`,
      pct: stepPct,
      icon: Footprints,
      colorClass: "text-steps",
      bgClass: "bg-steps/15",
      barColor: "oklch(0.72 0.19 142)",
    },
    {
      label: "Water Today",
      value: `${todayWater}`,
      goal: `${waterGoal} glasses`,
      pct: waterPct,
      icon: Droplets,
      colorClass: "text-water",
      bgClass: "bg-water/15",
      barColor: "oklch(0.62 0.18 240)",
    },
    {
      label: "Workouts / Week",
      value: `${workoutsThisWeek}`,
      goal: `${workoutGoal} target`,
      pct: workoutPct,
      icon: Dumbbell,
      colorClass: "text-workout",
      bgClass: "bg-workout/15",
      barColor: "oklch(0.72 0.18 50)",
    },
    {
      label: "Cardio / Week",
      value: `${cardioThisWeek}m`,
      goal: `${cardioGoal}m target`,
      pct: cardioPct,
      icon: Activity,
      colorClass: "text-cardio",
      bgClass: "bg-cardio/15",
      barColor: "oklch(0.65 0.2 310)",
    },
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-primary">
            fit.com
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isInitializing ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {shortPrincipal}
              </span>
              <Button
                data-ocid="auth.logout.button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  clear();
                  toast.success("Logged out");
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {principalStr.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Button
              data-ocid="auth.login.button"
              size="sm"
              className="bg-primary text-primary-foreground font-semibold px-4 h-9 text-sm"
              onClick={login}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                "Connecting..."
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Login
                </>
              )}
            </Button>
          )}
        </div>
      </header>

      {/* Not authenticated banner */}
      {!isAuthenticated && !isInitializing && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-3 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 flex items-center justify-between gap-3"
        >
          <div>
            <p className="text-sm font-semibold text-primary">
              Sign in to sync your data
            </p>
            <p className="text-xs text-muted-foreground">
              Your progress is saved on-chain
            </p>
          </div>
          <Button
            data-ocid="auth.login.button"
            size="sm"
            variant="ghost"
            className="text-primary hover:bg-primary/10 shrink-0"
            onClick={login}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="p-4 bg-card border-border flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${m.bgClass}`}>
                    <Icon className={`h-4 w-4 ${m.colorClass}`} />
                  </div>
                  <span className={`text-xs font-medium ${m.colorClass}`}>
                    {m.pct}%
                  </span>
                </div>
                <div>
                  <p
                    className={`font-display font-bold text-2xl ${m.colorClass}`}
                  >
                    {m.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {m.label}
                  </p>
                </div>
                <Progress value={m.pct} className="h-1.5 bg-muted" />
                <p className="text-xs text-muted-foreground">{m.goal}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Quick Log
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Button
            data-ocid="dashboard.log_water.button"
            variant="outline"
            className="h-12 border-border bg-water/15 text-water border-water/30 hover:bg-water/25 font-semibold"
            onClick={handleLogWater}
            disabled={logWaterMutation.isPending || !isAuthenticated}
          >
            <Droplets className="h-4 w-4 mr-2" />
            <span>+ Log Water</span>
          </Button>
          <Button
            data-ocid="dashboard.log_steps.button"
            variant="outline"
            className="h-12 border-border bg-steps/15 text-steps border-steps/30 hover:bg-steps/25 font-semibold"
            onClick={() => {
              if (!isAuthenticated) {
                toast.error("Please login first");
                return;
              }
              setStepsDialogOpen(true);
            }}
          >
            <Footprints className="h-4 w-4 mr-2" />
            <span>+ Log Steps</span>
          </Button>
          <Button
            data-ocid="dashboard.log_workout.button"
            variant="outline"
            className="h-12 border-border bg-workout/15 text-workout border-workout/30 hover:bg-workout/25 font-semibold"
            onClick={() => onNavigate("workout")}
          >
            <Dumbbell className="h-4 w-4 mr-2" />
            <span>+ Log Workout</span>
          </Button>
          <Button
            data-ocid="dashboard.log_cardio.button"
            variant="outline"
            className="h-12 border-border bg-cardio/15 text-cardio border-cardio/30 hover:bg-cardio/25 font-semibold"
            onClick={() => onNavigate("cardio")}
          >
            <Activity className="h-4 w-4 mr-2" />
            <span>+ Log Cardio</span>
          </Button>
        </div>
      </div>

      {/* Water Progress Indicator */}
      <div className="px-4 mb-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-water" />
              <span className="text-sm font-semibold">Water Intake</span>
            </div>
            <span className="font-display font-bold text-lg text-water">
              {todayWater} / {waterGoal}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: waterGoal }, (_, i) => {
              const glassKey = `glass-pos-${i + 1}`;
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: glass position is semantically stable
                <div
                  key={glassKey}
                  className={`flex-1 h-6 rounded transition-all duration-300 ${
                    i < todayWater ? "bg-water" : "bg-muted"
                  }`}
                />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">glasses today</p>
          <Button
            data-ocid="water.increment.button"
            size="sm"
            className="mt-3 w-full bg-water/20 text-water hover:bg-water/30 border-0 font-semibold"
            variant="outline"
            onClick={handleLogWater}
            disabled={logWaterMutation.isPending || !isAuthenticated}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Glass
          </Button>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <div className="px-4 mb-6">
        <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Weekly Workouts
        </h2>
        <Card className="p-4 bg-card border-border">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyData} barSize={20}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "oklch(0.58 0.01 240)" }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.2 0.008 240)",
                  border: "1px solid oklch(0.28 0.01 240)",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "oklch(0.96 0.005 240)",
                }}
                cursor={{ fill: "oklch(0.28 0.01 240)" }}
              />
              <Bar dataKey="workouts" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry) => (
                  <Cell
                    key={`bar-${entry.day}`}
                    fill={
                      entry.workouts > 0
                        ? "oklch(0.72 0.18 50)"
                        : "oklch(0.24 0.01 240)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Steps Dialog */}
      <Dialog open={stepsDialogOpen} onOpenChange={setStepsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Log Steps
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-sm text-muted-foreground mb-2 block">
              How many steps today?
            </Label>
            <Input
              data-ocid="steps.input"
              type="number"
              placeholder="e.g. 8500"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              className="bg-input border-border text-lg font-display font-bold"
              onKeyDown={(e) => e.key === "Enter" && handleLogSteps()}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setStepsDialogOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="steps.submit_button"
              className="bg-primary text-primary-foreground font-semibold"
              onClick={handleLogSteps}
              disabled={logStepsMutation.isPending}
            >
              {logStepsMutation.isPending ? "Saving..." : "Log Steps"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login success banner */}
      {isLoginSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-glow z-50"
          data-ocid="auth.success_state"
        >
          Welcome back! 🎉
        </motion.div>
      )}
    </div>
  );
}
