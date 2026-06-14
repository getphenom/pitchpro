import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Droplets, Beef, ChevronUp, Check, Minus, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWaterGoal } from "@/lib/gameData";

const today = format(new Date(), "yyyy-MM-dd");

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", icon: "🥞" },
  { key: "lunch", label: "Lunch", icon: "🍗" },
  { key: "dinner", label: "Dinner", icon: "🍝" },
  { key: "snack", label: "Snack", icon: "🍎" },
];

export default function QuickLogWidget() {
  const [showMeals, setShowMeals] = useState(false);
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });
  const profile = profiles?.[0];

  const { data: logs } = useQuery({
    queryKey: ["daily-log-quick", today],
    queryFn: () => base44.entities.DailyLog.filter({ date: today }),
    enabled: !!profile,
  });
  const dailyLog = logs?.[0];

  const updateLog = useMutation({
    mutationFn: async (data) => {
      if (dailyLog) {
        return base44.entities.DailyLog.update(dailyLog.id, data);
      }
      return base44.entities.DailyLog.create({ player_id: profile.id, date: today, ...data });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-log-quick"] });
      queryClient.invalidateQueries({ queryKey: ["daily-log"] });
    },
  });

  if (!profile || !dailyLog) return null;

  const waterGoal = getWaterGoal(profile?.age, profile?.weight_kg);
  const currentMl = dailyLog?.water_ml || 0;
  const glasses = Math.floor(currentMl / 250);
  const waterPct = Math.min(100, Math.round((currentMl / waterGoal) * 100));

  const meals = dailyLog?.meals_logged || [];
  const mealsDone = meals.filter((m) => m.completed).length;

  const isMealDone = (type) => meals.some((m) => m.type === type && m.completed);

  const addWater = () => updateLog.mutate({ water_ml: currentMl + 250 });
  const removeWater = () => updateLog.mutate({ water_ml: Math.max(0, currentMl - 250) });

  const toggleMeal = (type) => {
    const existing = meals.find((m) => m.type === type);
    const rest = meals.filter((m) => m.type !== type);
    if (existing) {
      updateLog.mutate({ meals_logged: [...rest, { ...existing, completed: !existing.completed }] });
    } else {
      updateLog.mutate({ meals_logged: [...meals, { type, description: type, completed: true }] });
    }
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto space-y-2">
        {/* Meal quick-toggles */}
        <AnimatePresence>
          {showMeals && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border rounded-2xl p-3 shadow-2xl shadow-black/50">
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map((meal) => {
                    const done = isMealDone(meal.key);
                    return (
                      <button
                        key={meal.key}
                        onClick={() => toggleMeal(meal.key)}
                        className={`rounded-xl px-2 py-3 text-center transition-all active:scale-95 flex flex-col items-center gap-1 ${
                          done
                            ? "bg-green-500/15 border border-green-500/30"
                            : "bg-secondary border border-transparent hover:border-border"
                        }`}
                      >
                        <span className="text-xl">{meal.icon}</span>
                        <span className="text-[10px] font-medium leading-tight">{meal.label}</span>
                        {done && <Check className="w-3 h-3 text-green-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main bar */}
        <div className="bg-card border border-border rounded-2xl px-3 py-2.5 shadow-2xl shadow-black/50 flex items-center gap-2">
          {/* Water */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Droplets className={`w-4 h-4 flex-shrink-0 ${waterPct >= 100 ? "text-green-400" : "text-blue-400"}`} />
            <button
              onClick={removeWater}
              disabled={currentMl <= 0}
              className="w-8 h-8 rounded-lg bg-secondary hover:bg-blue-500/15 flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex-shrink-0"
            >
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 text-center">{glasses} glass{glasses !== 1 ? "es" : ""}</p>
            </div>
            <button
              onClick={addWater}
              className="w-8 h-8 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 flex items-center justify-center transition-colors active:scale-95 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-border flex-shrink-0" />

          {/* Meals toggle */}
          <button
            onClick={() => setShowMeals(!showMeals)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95 flex-shrink-0 ${
              showMeals ? "bg-green-500/10" : "hover:bg-secondary"
            }`}
          >
            <Beef className={`w-4 h-4 ${mealsDone >= 4 ? "text-green-400" : "text-muted-foreground"}`} />
            <span className="text-xs font-semibold">{mealsDone}/4</span>
            <motion.div
              animate={{ rotate: showMeals ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.div>
          </button>
        </div>
      </div>
    </div>
  );
}