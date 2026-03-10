import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  CheckCircle2,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
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
  useSetDailyGoals,
  useStepHistory,
  useWaterIntakeHistory,
  useWorkoutHistory,
} from "../hooks/useQueries";

const DEFAULT_GOALS = {
  stepGoal: 10000,
  waterGoal: 8,
  workoutDaysPerWeek: 4,
  cardioMinutesPerWeek: 150,
};

export default function ProgressTab() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: goals, isLoading: goalsLoading } = useDailyGoals();
  const { data: workoutHistory = [] } = useWorkoutHistory();
  const { data: cardioHistory = [] } = useCardioHistory();
  const { data: stepHistory = [] } = useStepHistory();
  const { data: waterHistory = [] } = useWaterIntakeHistory();
  const setGoalsMutation = useSetDailyGoals();

  const [stepGoal, setStepGoal] = useState(DEFAULT_GOALS.stepGoal.toString());
  const [waterGoal, setWaterGoal] = useState(
    DEFAULT_GOALS.waterGoal.toString(),
  );
  const [workoutGoal, setWorkoutGoal] = useState(
    DEFAULT_GOALS.workoutDaysPerWeek.toString(),
  );
  const [cardioGoal, setCardioGoal] = useState(
    DEFAULT_GOALS.cardioMinutesPerWeek.toString(),
  );

  useEffect(() => {
    if (goals) {
      setStepGoal(Number(goals.stepGoal).toString());
      setWaterGoal(Number(goals.waterGoal).toString());
      setWorkoutGoal(Number(goals.workoutDaysPerWeek).toString());
      setCardioGoal(Number(goals.cardioMinutesPerWeek).toString());
    }
  }, [goals]);

  const handleSaveGoals = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    try {
      await setGoalsMutation.mutateAsync({
        stepGoal: BigInt(Number.parseInt(stepGoal) || DEFAULT_GOALS.stepGoal),
        waterGoal: BigInt(
          Number.parseInt(waterGoal) || DEFAULT_GOALS.waterGoal,
        ),
        workoutDaysPerWeek: BigInt(
          Number.parseInt(workoutGoal) || DEFAULT_GOALS.workoutDaysPerWeek,
        ),
        cardioMinutesPerWeek: BigInt(
          Number.parseInt(cardioGoal) || DEFAULT_GOALS.cardioMinutesPerWeek,
        ),
      });
      toast.success("Goals updated! 🎯");
    } catch {
      toast.error("Failed to save goals");
    }
  };

  // Stats
  const totalWorkouts = workoutHistory.length;
  const totalCardio = cardioHistory.length;
  const totalCardioMinutes = cardioHistory.reduce(
    (s, c) => s + Number(c.durationMinutes),
    0,
  );

  // Weekly step data (last 7 entries)
  const stepChartData = stepHistory.slice(-7).map((s, i) => ({
    day: `Day ${i + 1}`,
    steps: Number(s),
  }));

  // Weekly water data (last 7 entries)
  const waterChartData = waterHistory.slice(-7).map((w, i) => ({
    day: `Day ${i + 1}`,
    glasses: Number(w),
  }));

  const stats = [
    {
      label: "Total Workouts",
      value: totalWorkouts,
      icon: Dumbbell,
      colorClass: "text-workout",
      bgClass: "bg-workout/15",
    },
    {
      label: "Cardio Sessions",
      value: totalCardio,
      icon: Activity,
      colorClass: "text-cardio",
      bgClass: "bg-cardio/15",
    },
    {
      label: "Cardio Minutes",
      value: totalCardioMinutes,
      icon: Flame,
      colorClass: "text-steps",
      bgClass: "bg-steps/15",
    },
    {
      label: "Water Entries",
      value: waterHistory.length,
      icon: Droplets,
      colorClass: "text-water",
      bgClass: "bg-water/15",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <h2 className="font-display font-extrabold text-2xl tracking-tight">
          Progress
        </h2>
        <p className="text-xs text-muted-foreground">
          Your goals & stats overview
        </p>
      </header>

      {/* Stats Grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="p-4 bg-card border-border">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.bgClass}`}
                >
                  <Icon className={`h-4 w-4 ${stat.colorClass}`} />
                </div>
                <p
                  className={`font-display font-bold text-2xl ${stat.colorClass}`}
                >
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Steps Chart */}
      {stepChartData.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Step History
          </h3>
          <Card className="p-4 bg-card border-border">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={stepChartData} barSize={22}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "oklch(0.58 0.01 240)" }}
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
                  cursor={{ fill: "oklch(0.24 0.01 240)" }}
                />
                <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
                  {stepChartData.map((entry) => (
                    <Cell
                      key={`step-${entry.day}`}
                      fill="oklch(0.72 0.19 142)"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Water Chart */}
      {waterChartData.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Water Intake History
          </h3>
          <Card className="p-4 bg-card border-border">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={waterChartData} barSize={22}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "oklch(0.58 0.01 240)" }}
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
                  cursor={{ fill: "oklch(0.24 0.01 240)" }}
                />
                <Bar dataKey="glasses" radius={[4, 4, 0, 0]}>
                  {waterChartData.map((entry) => (
                    <Cell
                      key={`water-${entry.day}`}
                      fill="oklch(0.62 0.18 240)"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Goals Settings */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider">
            Daily Goals
          </h3>
        </div>

        {goalsLoading ? (
          <div
            data-ocid="goals.loading_state"
            className="h-48 rounded-xl bg-card animate-pulse"
          />
        ) : (
          <Card className="p-4 bg-card border-border">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <Footprints className="h-3 w-3 text-steps" />
                    Steps / Day
                  </Label>
                  <Input
                    type="number"
                    value={stepGoal}
                    onChange={(e) => setStepGoal(e.target.value)}
                    className="bg-input border-border font-display font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-water" />
                    Water Glasses / Day
                  </Label>
                  <Input
                    type="number"
                    value={waterGoal}
                    onChange={(e) => setWaterGoal(e.target.value)}
                    className="bg-input border-border font-display font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <Dumbbell className="h-3 w-3 text-workout" />
                    Workout Days / Week
                  </Label>
                  <Input
                    type="number"
                    value={workoutGoal}
                    onChange={(e) => setWorkoutGoal(e.target.value)}
                    className="bg-input border-border font-display font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <Activity className="h-3 w-3 text-cardio" />
                    Cardio Min / Week
                  </Label>
                  <Input
                    type="number"
                    value={cardioGoal}
                    onChange={(e) => setCardioGoal(e.target.value)}
                    className="bg-input border-border font-display font-bold"
                  />
                </div>
              </div>

              <Button
                data-ocid="goals.save.submit_button"
                className="w-full bg-primary text-primary-foreground font-bold h-11"
                onClick={handleSaveGoals}
                disabled={setGoalsMutation.isPending || !isAuthenticated}
              >
                {setGoalsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Goals
                  </>
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground text-center">
                  Login to save your goals permanently
                </p>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="px-4 pb-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
