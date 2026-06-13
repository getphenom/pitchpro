import { useState } from "react";
import { Droplets, Beef, ChevronUp, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWaterGoal } from "@/lib/gameData";

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", icon: "🥞" },
  { key: "lunch", label: "Lunch", icon: "🍗" },
  { key: "dinner", label: "Dinner", icon: "🍝" },
  { key: "snack", label: "Snack", icon: "🍎" },
];

export default function FloatingQuickLog({ dailyLog, profile, onWaterUpdate, onMealUpdate }) {
  const [expanded, setExpanded] = useState(false);

  const waterGoal = getWaterGoal(profile?.age, profile?.weight_kg);
  const currentMl = dailyLog?.water_ml || 0;
  const glasses = Math.floor(currentMl / 250);
  const waterPct = Math.min(100, Math.round((currentMl / waterGoal) * 100));

  const meals = dailyLog?.meals_logged || [];
  const mealsDone = meals.filter((m) => m.completed).length;

  const isMealDone = (type) => meals.some((m) => m.type === type && m.completed);

  const addWater = () => {
    const newMl = currentMl + 250;
    onWaterUpdate(newMl);
  };

  const removeWater = () => {
    const newMl = Math.max(0, currentMl - 250);
    onWaterUpdate(newMl);
  };

  const toggleMeal = (type) => {
    const existing = meals.find((m) => m.type === type);
    const rest = meals.filter((m) => m.type !== type);
    if (existing) {
      onMealUpdate([...rest, { type, description: type, completed: !existing.completed }]);
    } else {
      onMealUpdate([...meals, { type, description: type, completed: true }]);
    }
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="bg-card border border-border rounded-t-2xl px-4 pt-4 pb-2 mb-0 overflow-hidden shadow-2xl shadow-black/50"
            >
              {/* Water quick add */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Water</p>
                    <p className="text-[10px] text-muted-foreground">{glasses}/10 glasses</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${waterPct}%` }}
                    />
                  </div>
                  <button
                    onClick={removeWater}
                    disabled={currentMl <= 0}
                    className="w-9 h-9 rounded-lg bg-secondary hover:bg-blue-500/20 flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span className="text-sm font-bold text-muted-foreground">−</span>
                  </button>
                  <button
                    onClick={addWater}
                    className="w-9 h-9 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-colors active:scale-95"
                  >
                    <span className="text-sm font-bold text-blue-400">+</span>
                  </button>
                </div>
              </div>

              {/* Meal quick toggles */}
              <div className="grid grid-cols-4 gap-1.5">
                {MEAL_TYPES.map((meal) => {
                  const done = isMealDone(meal.key);
                  return (
                    <button
                      key={meal.key}
                      onClick={() => toggleMeal(meal.key)}
                      className={`rounded-xl px-2 py-2.5 text-center transition-all active:scale-95 flex flex-col items-center gap-1 ${
                        done
                          ? "bg-green-500/20 border border-green-500/30"
                          : "bg-secondary hover:bg-secondary/70 border border-transparent"
                      }`}
                    >
                      <span className="text-lg">{meal.icon}</span>
                      <span className="text-[10px] font-medium leading-tight">{meal.label}</span>
                      {done && <Check className="w-3 h-3 text-green-400" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed bar */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xl shadow-black/50 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Droplets className={`w-4 h-4 ${waterPct >= 100 ? "text-green-400" : "text-blue-400"}`} />
              <span className="text-xs font-semibold">{glasses}💧</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Beef className={`w-4 h-4 ${mealsDone >= 4 ? "text-green-400" : "text-muted-foreground"}`} />
              <span className="text-xs font-semibold">{mealsDone}/4</span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
          >
            <ChevronUp className="w-4 h-4" />
          </motion.div>
        </button>
      </div>
    </div>
  );
}