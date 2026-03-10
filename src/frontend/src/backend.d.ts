import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    weight?: number;
    name: string;
    reps: bigint;
    sets: bigint;
    category: ExerciseCategory;
}
export interface CardioSession {
    cardioType: CardioType;
    distanceKm?: number;
    durationMinutes: bigint;
    caloriesBurned?: bigint;
}
export type Time = bigint;
export interface DailyGoals {
    workoutDaysPerWeek: bigint;
    stepGoal: bigint;
    cardioMinutesPerWeek: bigint;
    waterGoal: bigint;
}
export interface WorkoutEntry {
    date: Time;
    exercises: Array<Exercise>;
}
export interface UserProfile {
    name: string;
}
export enum CardioType {
    swimming = "swimming",
    other = "other",
    walking = "walking",
    cycling = "cycling",
    running = "running"
}
export enum ExerciseCategory {
    arms = "arms",
    back = "back",
    core = "core",
    chest = "chest",
    legs = "legs",
    cardio = "cardio"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCardioHistory(): Promise<Array<CardioSession>>;
    getDailyGoals(): Promise<DailyGoals | null>;
    getExerciseLibrary(): Promise<Array<Exercise>>;
    getStepHistory(): Promise<Array<bigint>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWaterIntakeHistory(): Promise<Array<bigint>>;
    getWorkoutHistory(): Promise<Array<WorkoutEntry>>;
    isCallerAdmin(): Promise<boolean>;
    logCardio(cardio: CardioSession): Promise<void>;
    logSteps(steps: bigint): Promise<void>;
    logWaterGlasses(glasses: bigint): Promise<void>;
    logWorkout(workout: WorkoutEntry): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setDailyGoals(goals: DailyGoals): Promise<void>;
}
