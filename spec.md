# Daily Fitness Tracker

## Current State
New project. No existing code or features.

## Requested Changes (Diff)

### Add
- Daily workout logging: users can log exercises with sets, reps, weight, and duration
- Cardio logging: track cardio sessions (type, duration, distance, calories burned)
- Water intake tracking: log daily water consumption in glasses/ml
- Step count logging: log daily step count
- Dashboard: overview of today's activity, weekly summary stats, progress charts
- Workout history: view past workouts by date
- Custom exercise library: predefined exercises by category (chest, back, legs, arms, core, cardio)
- Goals: set daily/weekly goals for steps, water, calories, workouts

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - Data models: WorkoutLog, ExerciseEntry, CardioLog, WaterLog, StepLog, UserGoals
   - APIs: CRUD for all log types, get logs by date range, get today's summary, set/get goals
   - Predefined exercise categories and names

2. Frontend (React):
   - Bottom navigation: Dashboard, Log Workout, Cardio, Progress
   - Dashboard page: today's summary cards (steps, water, calories, workouts), quick-log actions, weekly chart
   - Log Workout page: exercise picker by category, add sets/reps/weight per exercise, save workout
   - Cardio page: log cardio session (type, duration, distance)
   - Progress page: weekly/monthly stats, streaks, goal completion
   - Water tracker widget: tap to add glasses of water
   - Step counter widget: manual entry for daily steps
