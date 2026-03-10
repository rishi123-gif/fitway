import { Toaster } from "@/components/ui/sonner";
import { Activity, Dumbbell, LayoutDashboard, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import CardioTab from "./pages/CardioTab";
import DashboardTab from "./pages/DashboardTab";
import ProgressTab from "./pages/ProgressTab";
import WorkoutTab from "./pages/WorkoutTab";

type TabId = "dashboard" | "workout" | "cardio" | "progress";

const tabs: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "workout", label: "Workout", icon: Dumbbell },
  { id: "cardio", label: "Cardio", icon: Activity },
  { id: "progress", label: "Progress", icon: TrendingUp },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="min-h-full"
          >
            {activeTab === "dashboard" && (
              <DashboardTab onNavigate={setActiveTab} />
            )}
            {activeTab === "workout" && <WorkoutTab />}
            {activeTab === "cardio" && <CardioTab />}
            {activeTab === "progress" && <ProgressTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-50">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                data-ocid={`nav.${tab.id}.tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`relative transition-all duration-200 ${isActive ? "scale-110" : ""}`}
                >
                  <Icon className="h-5 w-5" />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-all duration-200 ${
                    isActive ? "opacity-100 font-semibold" : "opacity-60"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <Toaster richColors position="top-center" />
    </div>
  );
}
