import { useState } from "react";
import { Dumbbell, Timer, Map, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import Training from "@/pages/Training";
import Recovery from "@/pages/Recovery";
import Tactics from "@/pages/Tactics";
import CalendarPage from "@/pages/Calendar";

const TABS = [
  { key: "training", label: "Training", icon: Dumbbell },
  { key: "recovery", label: "Recover", icon: Timer },
  { key: "tactics", label: "Tactics", icon: Map },
  { key: "calendar", label: "Calendar", icon: Calendar },
];

export default function Train() {
  const [activeTab, setActiveTab] = useState("training");

  return (
    <div className="min-h-screen bg-background">
      {/* Tab Bar */}
      <div className="sticky top-12 z-30 bg-background/90 backdrop-blur-lg border-b border-border px-4">
        <div className="max-w-2xl mx-auto flex gap-1 py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
      >
        {activeTab === "training" && <Training />}
        {activeTab === "recovery" && <Recovery />}
        {activeTab === "tactics" && <Tactics />}
        {activeTab === "calendar" && <CalendarPage />}
      </motion.div>
    </div>
  );
}