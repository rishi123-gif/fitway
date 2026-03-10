import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChevronDown, ChevronUp, Dumbbell, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Exercise } from "../backend.d";
import { ExerciseCategory } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLogWorkout, useWorkoutHistory } from "../hooks/useQueries";

const EXERCISE_LIBRARY: { name: string; category: ExerciseCategory }[] = [
  { name: "Bench Press", category: ExerciseCategory.chest },
  { name: "Push-ups", category: ExerciseCategory.chest },
  { name: "Incline Dumbbell Press", category: ExerciseCategory.chest },
  { name: "Cable Fly", category: ExerciseCategory.chest },
  { name: "Pull-ups", category: ExerciseCategory.back },
  { name: "Bent-over Row", category: ExerciseCategory.back },
  { name: "Lat Pulldown", category: ExerciseCategory.back },
  { name: "Deadlift", category: ExerciseCategory.back },
  { name: "Barbell Squat", category: ExerciseCategory.legs },
  { name: "Leg Press", category: ExerciseCategory.legs },
  { name: "Romanian Deadlift", category: ExerciseCategory.legs },
  { name: "Lunges", category: ExerciseCategory.legs },
  { name: "Calf Raises", category: ExerciseCategory.legs },
  { name: "Bicep Curl", category: ExerciseCategory.arms },
  { name: "Tricep Dip", category: ExerciseCategory.arms },
  { name: "Hammer Curl", category: ExerciseCategory.arms },
  { name: "Overhead Press", category: ExerciseCategory.arms },
  { name: "Plank", category: ExerciseCategory.core },
  { name: "Crunches", category: ExerciseCategory.core },
  { name: "Russian Twist", category: ExerciseCategory.core },
  { name: "Leg Raises", category: ExerciseCategory.core },
];

const CATEGORIES: ExerciseCategory[] = [
  ExerciseCategory.chest,
  ExerciseCategory.back,
  ExerciseCategory.legs,
  ExerciseCategory.arms,
  ExerciseCategory.core,
  ExerciseCategory.cardio,
];

const CATEGORY_COLORS: Record<string, string> = {
  chest: "bg-workout/15 text-workout border-workout/30",
  back: "bg-cardio/15 text-cardio border-cardio/30",
  legs: "bg-steps/15 text-steps border-steps/30",
  arms: "bg-water/15 text-water border-water/30",
  core: "bg-primary/15 text-primary border-primary/30",
  cardio: "bg-destructive/15 text-destructive border-destructive/30",
};

interface WorkoutExerciseForm {
  id: string;
  name: string;
  category: ExerciseCategory;
  sets: string;
  reps: string;
  weight: string;
}

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function WorkoutTab() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: workoutHistory = [], isLoading } = useWorkoutHistory();
  const logWorkoutMutation = useLogWorkout();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    ExerciseCategory | "all"
  >("all");
  const [exercises, setExercises] = useState<WorkoutExerciseForm[]>([]);
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null);

  const sortedHistory = [...workoutHistory].sort(
    (a, b) => Number(b.date) - Number(a.date),
  );

  const filteredLibrary =
    selectedCategory === "all"
      ? EXERCISE_LIBRARY
      : EXERCISE_LIBRARY.filter((e) => e.category === selectedCategory);

  const addExercise = (name: string, category: ExerciseCategory) => {
    const already = exercises.find((e) => e.name === name);
    if (already) {
      toast.error("Already added");
      return;
    }
    setExercises((prev) => [
      ...prev,
      {
        id: `${name}-${Date.now()}`,
        name,
        category,
        sets: "3",
        reps: "10",
        weight: "",
      },
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExercise = (
    id: string,
    field: keyof WorkoutExerciseForm,
    value: string,
  ) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const handleSaveWorkout = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    if (exercises.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }
    const mapped: Exercise[] = exercises.map((e) => ({
      name: e.name,
      category: e.category,
      sets: BigInt(Number.parseInt(e.sets) || 1),
      reps: BigInt(Number.parseInt(e.reps) || 1),
      weight: e.weight ? Number.parseFloat(e.weight) : undefined,
    }));
    try {
      await logWorkoutMutation.mutateAsync({
        date: BigInt(Date.now() * 1_000_000),
        exercises: mapped,
      });
      toast.success("Workout saved! 💪");
      setSheetOpen(false);
      setExercises([]);
    } catch {
      toast.error("Failed to save workout");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight">
            Workouts
          </h2>
          <p className="text-xs text-muted-foreground">
            {sortedHistory.length} sessions total
          </p>
        </div>
        <Button
          data-ocid="workout.add.open_modal_button"
          className="bg-primary text-primary-foreground font-semibold h-10 px-4"
          onClick={() => {
            if (!isAuthenticated) {
              toast.error("Please login to log workouts");
              return;
            }
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Log Workout
        </Button>
      </header>

      {/* Workout History */}
      <div className="px-4 flex flex-col gap-3 pb-6">
        {isLoading && (
          <div
            data-ocid="workout.loading_state"
            className="flex flex-col gap-3"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && sortedHistory.length === 0 && (
          <motion.div
            data-ocid="workout.empty_state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="p-6 rounded-2xl bg-workout/15">
              <Dumbbell className="h-10 w-10 text-workout" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-lg">No workouts yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tap "Log Workout" to record your first session
              </p>
            </div>
            <Button
              data-ocid="workout.add.open_modal_button"
              className="bg-primary text-primary-foreground font-semibold"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error("Please login first");
                  return;
                }
                setSheetOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Log Your First Workout
            </Button>
          </motion.div>
        )}

        {!isLoading &&
          sortedHistory.map((workout, i) => {
            const isExpanded = expandedWorkout === i;
            return (
              <motion.div
                key={`${workout.date}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="p-4 bg-card border-border cursor-pointer"
                  data-ocid={`workout.item.${i + 1}`}
                  onClick={() => setExpandedWorkout(isExpanded ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-bold text-sm">
                        {formatDate(workout.date)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {workout.exercises.length} exercise
                        {workout.exercises.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 flex-wrap justify-end max-w-[140px]">
                        {Array.from(
                          new Set(workout.exercises.map((e) => e.category)),
                        )
                          .slice(0, 3)
                          .map((cat) => (
                            <Badge
                              key={cat}
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${CATEGORY_COLORS[cat] ?? ""}`}
                            >
                              {cat}
                            </Badge>
                          ))}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-border flex flex-col gap-2"
                    >
                      {workout.exercises.map((ex, j) => (
                        <div
                          key={`${ex.name}-${j}`}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium">{ex.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {Number(ex.sets)} sets × {Number(ex.reps)} reps
                              {ex.weight ? ` @ ${ex.weight}kg` : ""}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${CATEGORY_COLORS[ex.category] ?? ""}`}
                          >
                            {ex.category}
                          </Badge>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* Log Workout Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="bg-card border-border rounded-t-2xl max-h-[90vh] overflow-y-auto px-4"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="font-display font-bold text-xl">
              New Workout
            </SheetTitle>
          </SheetHeader>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {(["all", ...CATEGORIES] as const).map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Exercise Library */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Tap to Add
            </p>
            <div className="grid grid-cols-2 gap-2">
              {filteredLibrary.map((ex) => {
                const isAdded = exercises.some((e) => e.name === ex.name);
                return (
                  <button
                    type="button"
                    key={ex.name}
                    onClick={() => addExercise(ex.name, ex.category)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      isAdded
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "bg-muted border-border text-foreground hover:border-primary/40"
                    }`}
                  >
                    {ex.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Exercises */}
          {exercises.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Your Exercises ({exercises.length})
              </p>
              <div className="flex flex-col gap-3">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-muted rounded-xl p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{ex.name}</p>
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Sets
                        </Label>
                        <Input
                          type="number"
                          value={ex.sets}
                          onChange={(e) =>
                            updateExercise(ex.id, "sets", e.target.value)
                          }
                          className="h-8 bg-card border-border text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Reps
                        </Label>
                        <Input
                          type="number"
                          value={ex.reps}
                          onChange={(e) =>
                            updateExercise(ex.id, "reps", e.target.value)
                          }
                          className="h-8 bg-card border-border text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          kg
                        </Label>
                        <Input
                          type="number"
                          placeholder="opt."
                          value={ex.weight}
                          onChange={(e) =>
                            updateExercise(ex.id, "weight", e.target.value)
                          }
                          className="h-8 bg-card border-border text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            data-ocid="workout.save.submit_button"
            className="w-full bg-primary text-primary-foreground font-bold text-base h-12 mt-2 mb-4"
            onClick={handleSaveWorkout}
            disabled={logWorkoutMutation.isPending || exercises.length === 0}
          >
            {logWorkoutMutation.isPending
              ? "Saving..."
              : `Save Workout (${exercises.length} exercises)`}
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
