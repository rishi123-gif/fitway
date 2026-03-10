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
import { Activity, Flame, MapPin, Plus, Timer } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CardioType } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCardioHistory, useLogCardio } from "../hooks/useQueries";

const CARDIO_TYPE_ICONS: Record<CardioType, string> = {
  [CardioType.running]: "🏃",
  [CardioType.cycling]: "🚴",
  [CardioType.swimming]: "🏊",
  [CardioType.walking]: "🚶",
  [CardioType.other]: "⚡",
};

const CARDIO_TYPE_COLORS: Record<CardioType, string> = {
  [CardioType.running]: "bg-workout/15 text-workout border-workout/30",
  [CardioType.cycling]: "bg-steps/15 text-steps border-steps/30",
  [CardioType.swimming]: "bg-water/15 text-water border-water/30",
  [CardioType.walking]: "bg-primary/15 text-primary border-primary/30",
  [CardioType.other]: "bg-cardio/15 text-cardio border-cardio/30",
};

interface CardioFormState {
  type: CardioType;
  duration: string;
  distance: string;
  calories: string;
}

export default function CardioTab() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: cardioHistory = [], isLoading } = useCardioHistory();
  const logCardioMutation = useLogCardio();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<CardioFormState>({
    type: CardioType.running,
    duration: "",
    distance: "",
    calories: "",
  });

  const totalMinutes = cardioHistory.reduce(
    (sum, c) => sum + Number(c.durationMinutes),
    0,
  );

  const handleSaveCardio = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      return;
    }
    const dur = Number.parseInt(form.duration);
    if (!form.duration || Number.isNaN(dur) || dur <= 0) {
      toast.error("Enter a valid duration");
      return;
    }
    try {
      await logCardioMutation.mutateAsync({
        cardioType: form.type,
        durationMinutes: BigInt(dur),
        distanceKm: form.distance
          ? Number.parseFloat(form.distance)
          : undefined,
        caloriesBurned: form.calories
          ? BigInt(Number.parseInt(form.calories))
          : undefined,
      });
      toast.success("Cardio session saved! 🔥");
      setSheetOpen(false);
      setForm({
        type: CardioType.running,
        duration: "",
        distance: "",
        calories: "",
      });
    } catch {
      toast.error("Failed to save cardio");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight">
            Cardio
          </h2>
          <p className="text-xs text-muted-foreground">
            {cardioHistory.length} sessions · {totalMinutes}min total
          </p>
        </div>
        <Button
          data-ocid="cardio.add.open_modal_button"
          className="bg-primary text-primary-foreground font-semibold h-10 px-4"
          onClick={() => {
            if (!isAuthenticated) {
              toast.error("Please login to log cardio");
              return;
            }
            setSheetOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Log Cardio
        </Button>
      </header>

      {/* Stats row */}
      <div className="px-4 grid grid-cols-3 gap-2 mb-4">
        <Card className="p-3 bg-card border-border text-center">
          <Activity className="h-4 w-4 text-cardio mx-auto mb-1" />
          <p className="font-display font-bold text-lg text-cardio">
            {cardioHistory.length}
          </p>
          <p className="text-[10px] text-muted-foreground">Sessions</p>
        </Card>
        <Card className="p-3 bg-card border-border text-center">
          <Timer className="h-4 w-4 text-workout mx-auto mb-1" />
          <p className="font-display font-bold text-lg text-workout">
            {totalMinutes}
          </p>
          <p className="text-[10px] text-muted-foreground">Minutes</p>
        </Card>
        <Card className="p-3 bg-card border-border text-center">
          <Flame className="h-4 w-4 text-steps mx-auto mb-1" />
          <p className="font-display font-bold text-lg text-steps">
            {cardioHistory
              .reduce((sum, c) => sum + Number(c.caloriesBurned ?? 0), 0)
              .toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">Calories</p>
        </Card>
      </div>

      {/* Cardio History */}
      <div className="px-4 flex flex-col gap-3 pb-6">
        {isLoading && (
          <div data-ocid="cardio.loading_state" className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && cardioHistory.length === 0 && (
          <motion.div
            data-ocid="cardio.empty_state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="p-6 rounded-2xl bg-cardio/15">
              <Activity className="h-10 w-10 text-cardio" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-lg">
                No cardio sessions yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Log your first run, ride, or swim
              </p>
            </div>
            <Button
              data-ocid="cardio.add.open_modal_button"
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
              Log First Session
            </Button>
          </motion.div>
        )}

        {!isLoading &&
          [...cardioHistory].reverse().map((session, i) => {
            const emoji = CARDIO_TYPE_ICONS[session.cardioType] ?? "⚡";
            const colorClass = CARDIO_TYPE_COLORS[session.cardioType] ?? "";
            return (
              <motion.div
                key={`${session.cardioType}-${session.durationMinutes}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`cardio.item.${i + 1}`}
              >
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-2xl p-2.5 rounded-xl border ${colorClass}`}
                    >
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-sm capitalize">
                          {session.cardioType}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${colorClass}`}
                        >
                          {Number(session.durationMinutes)}m
                        </Badge>
                      </div>
                      <div className="flex gap-3 mt-0.5">
                        {session.distanceKm !== undefined && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.distanceKm.toFixed(1)}km
                          </p>
                        )}
                        {session.caloriesBurned !== undefined && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {Number(session.caloriesBurned)} kcal
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* Log Cardio Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="bg-card border-border rounded-t-2xl px-4"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="font-display font-bold text-xl">
              Log Cardio
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 pb-6">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Type
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {Object.values(CardioType).map((type) => {
                  const isSelected = form.type === type;
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setForm((f) => ({ ...f, type }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-muted border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="text-lg">{CARDIO_TYPE_ICONS[type]}</span>
                      <span className="text-[10px] font-medium capitalize">
                        {type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Duration (minutes) *
                </Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: e.target.value }))
                  }
                  className="bg-input border-border"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Distance (km)
                </Label>
                <Input
                  type="number"
                  placeholder="5.0"
                  value={form.distance}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, distance: e.target.value }))
                  }
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Calories Burned
              </Label>
              <Input
                type="number"
                placeholder="optional"
                value={form.calories}
                onChange={(e) =>
                  setForm((f) => ({ ...f, calories: e.target.value }))
                }
                className="bg-input border-border"
              />
            </div>

            <Button
              data-ocid="cardio.save.submit_button"
              className="w-full bg-primary text-primary-foreground font-bold text-base h-12 mt-2"
              onClick={handleSaveCardio}
              disabled={logCardioMutation.isPending}
            >
              {logCardioMutation.isPending ? "Saving..." : "Save Session"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
