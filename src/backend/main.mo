import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserProfile = {
    name : Text;
  };

  type ExerciseCategory = {
    #chest;
    #back;
    #legs;
    #arms;
    #core;
    #cardio;
  };

  type Exercise = {
    name : Text;
    category : ExerciseCategory;
    sets : Nat;
    reps : Nat;
    weight : ?Float; // Kgs, optional
  };

  type CardioType = {
    #running;
    #cycling;
    #swimming;
    #walking;
    #other;
  };

  type CardioSession = {
    cardioType : CardioType;
    durationMinutes : Nat;
    distanceKm : ?Float;
    caloriesBurned : ?Nat;
  };

  type DailyGoals = {
    stepGoal : Nat;
    waterGoal : Nat; // glasses
    workoutDaysPerWeek : Nat;
    cardioMinutesPerWeek : Nat;
  };

  type WorkoutEntry = {
    date : Time.Time; // Use timestamp
    exercises : [Exercise];
  };

  type DailyLog = {
    date : Time.Time;
    waterGlasses : Nat;
    steps : Nat;
    workouts : [WorkoutEntry];
    cardio : [CardioSession];
  };

  module DailyLog {
    public func compare(dailyLog1 : DailyLog, dailyLog2 : DailyLog) : Order.Order {
      Int.compare(dailyLog1.date, dailyLog2.date);
    };
  };

  let dailyLogs = Map.empty<Principal, List.List<DailyLog>>();
  let userGoals = Map.empty<Principal, DailyGoals>();
  let authorizedProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ********* User Profile ***********

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    authorizedProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    authorizedProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    authorizedProfiles.get(user);
  };

  // ********** Daily Log Operations **********

  public shared ({ caller }) func logWorkout(workout : WorkoutEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log workouts");
    };

    let today = Time.now();

    let newEntry = {
      date = today;
      waterGlasses = 0;
      steps = 0;
      workouts = [workout];
      cardio = [];
    };

    let updatedLogs = switch (dailyLogs.get(caller)) {
      case (null) {
        List.fromArray<DailyLog>([newEntry]);
      };
      case (?logs) {
        let existing = logs.toArray();
        if (existing.size() > 0 and existing[0].date == today) {
          let updatedEntry = {
            existing[0] with workouts = existing[0].workouts.concat([workout]);
          };
          let rest = if (existing.size() > 1) { existing.sliceToArray(1, existing.size()) } else { [] };
          List.fromArray<DailyLog>([updatedEntry].concat(rest));
        } else {
          List.fromArray<DailyLog>([newEntry]);
        };
      };
    };

    dailyLogs.add(caller, updatedLogs);
  };

  public shared ({ caller }) func logCardio(cardio : CardioSession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log cardio sessions");
    };

    let today = Time.now();

    let newEntry = {
      date = today;
      waterGlasses = 0;
      steps = 0;
      workouts = [];
      cardio = [cardio];
    };

    let updatedLogs = switch (dailyLogs.get(caller)) {
      case (null) {
        List.fromArray<DailyLog>([newEntry]);
      };
      case (?logs) {
        let existing = logs.toArray();
        if (existing.size() > 0 and existing[0].date == today) {
          let updatedEntry = {
            existing[0] with cardio = existing[0].cardio.concat([cardio]);
          };
          let rest = if (existing.size() > 1) { existing.sliceToArray(1, existing.size()) } else { [] };
          List.fromArray<DailyLog>([updatedEntry].concat(rest));
        } else {
          List.fromArray<DailyLog>([newEntry]);
        };
      };
    };

    dailyLogs.add(caller, updatedLogs);
  };

  public shared ({ caller }) func logWaterGlasses(glasses : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log water intake");
    };

    let today = Time.now();

    let newEntry = {
      date = today;
      waterGlasses = glasses;
      steps = 0;
      workouts = [];
      cardio = [];
    };

    let updatedLogs = switch (dailyLogs.get(caller)) {
      case (null) {
        List.fromArray<DailyLog>([newEntry]);
      };
      case (?logs) {
        let existing = logs.toArray();
        if (existing.size() > 0 and existing[0].date == today) {
          let updatedEntry = { existing[0] with waterGlasses = glasses };
          let rest = if (existing.size() > 1) { existing.sliceToArray(1, existing.size()) } else { [] };
          List.fromArray<DailyLog>([updatedEntry].concat(rest));
        } else {
          List.fromArray<DailyLog>([newEntry]);
        };
      };
    };

    dailyLogs.add(caller, updatedLogs);
  };

  public shared ({ caller }) func logSteps(steps : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log steps");
    };

    let today = Time.now();

    let newEntry = {
      date = today;
      waterGlasses = 0;
      steps;
      workouts = [];
      cardio = [];
    };

    let updatedLogs = switch (dailyLogs.get(caller)) {
      case (null) {
        List.fromArray<DailyLog>([newEntry]);
      };
      case (?logs) {
        let existing = logs.toArray();
        if (existing.size() > 0 and existing[0].date == today) {
          let updatedEntry = { existing[0] with steps };
          let rest = if (existing.size() > 1) { existing.sliceToArray(1, existing.size()) } else { [] };
          List.fromArray<DailyLog>([updatedEntry].concat(rest));
        } else {
          List.fromArray<DailyLog>([newEntry]);
        };
      };
    };

    dailyLogs.add(caller, updatedLogs);
  };

  // *********** User Goals ************

  public shared ({ caller }) func setDailyGoals(goals : DailyGoals) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set goals");
    };
    userGoals.add(caller, goals);
  };

  public query ({ caller }) func getDailyGoals() : async ?DailyGoals {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view goals");
    };
    userGoals.get(caller);
  };

  // *********** Fetch Data ************

  public query ({ caller }) func getWorkoutHistory() : async [WorkoutEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workout history");
    };
    switch (dailyLogs.get(caller)) {
      case (null) { [] };
      case (?logs) {
        logs.reverse().sort().toArray().flatMap(
          func(entry) { entry.workouts.values() }
        );
      };
    };
  };

  public query ({ caller }) func getCardioHistory() : async [CardioSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cardio history");
    };
    switch (dailyLogs.get(caller)) {
      case (null) { [] };
      case (?logs) {
        logs.reverse().sort().toArray().flatMap(
          func(entry) { entry.cardio.values() }
        );
      };
    };
  };

  public query ({ caller }) func getWaterIntakeHistory() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view water intake history");
    };
    switch (dailyLogs.get(caller)) {
      case (null) { [] };
      case (?logs) {
        logs.reverse().sort().map<DailyLog, Nat>(func(entry) { entry.waterGlasses }).toArray();
      };
    };
  };

  public query ({ caller }) func getStepHistory() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view step history");
    };
    switch (dailyLogs.get(caller)) {
      case (null) { [] };
      case (?logs) {
        logs.reverse().sort().map<DailyLog, Nat>(func(entry) { entry.steps }).toArray();
      };
    };
  };

  // *********** Predefined Exercise Library ************

  public query ({ caller }) func getExerciseLibrary() : async [Exercise] {
    [
      {
        name = "Bench Press";
        category = #chest;
        sets = 0;
        reps = 0;
        weight = null;
      },
      {
        name = "Squat";
        category = #legs;
        sets = 0;
        reps = 0;
        weight = null;
      },
      {
        name = "Deadlift";
        category = #back;
        sets = 0;
        reps = 0;
        weight = null;
      },
      {
        name = "Bicep Curl";
        category = #arms;
        sets = 0;
        reps = 0;
        weight = null;
      },
      {
        name = "Plank";
        category = #core;
        sets = 0;
        reps = 0;
        weight = null;
      },
      {
        name = "Running";
        category = #cardio;
        sets = 0;
        reps = 0;
        weight = null;
      },
    ];
  };
};
