import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CardioSession,
  DailyGoals,
  UserProfile,
  WorkoutEntry,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Queries ──────────────────────────────────────────────────────────────────

export function useWorkoutHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<WorkoutEntry[]>({
    queryKey: ["workoutHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkoutHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCardioHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<CardioSession[]>({
    queryKey: ["cardioHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCardioHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStepHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["stepHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStepHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWaterIntakeHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["waterHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWaterIntakeHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDailyGoals() {
  const { actor, isFetching } = useActor();
  return useQuery<DailyGoals | null>({
    queryKey: ["dailyGoals"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDailyGoals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExerciseLibrary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["exerciseLibrary"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExerciseLibrary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useLogWorkout() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (workout: WorkoutEntry) => {
      if (!actor) throw new Error("Not connected");
      return actor.logWorkout(workout);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["workoutHistory"] });
    },
  });
}

export function useLogCardio() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cardio: CardioSession) => {
      if (!actor) throw new Error("Not connected");
      return actor.logCardio(cardio);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cardioHistory"] });
    },
  });
}

export function useLogSteps() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (steps: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.logSteps(steps);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["stepHistory"] });
    },
  });
}

export function useLogWater() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (glasses: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.logWaterGlasses(glasses);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["waterHistory"] });
    },
  });
}

export function useSetDailyGoals() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goals: DailyGoals) => {
      if (!actor) throw new Error("Not connected");
      return actor.setDailyGoals(goals);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dailyGoals"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
