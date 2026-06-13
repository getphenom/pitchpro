import { useState, useEffect } from "react";
import { BellRing, X, GlassWater, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getWaterGoal, WATER_GOAL_ML } from "@/lib/gameData";

export default function DailyReminder({ dailyLog, profile }) {
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Check if it's evening (5 PM+) and things are incomplete
    const hour = new Date().getHours();
    if (hour < 17) return;

    const waterGoal = getWaterGoal(profile?.age, profile?.weight_kg);
    const waterLow = !dailyLog || (dailyLog.water_ml || 0) < waterGoal;
    const questsIncomplete = !dailyLog?.quests_completed?.length;
    const noTraining = !dailyLog?.training_completed?.some((t) => t.completed);

    if (waterLow || questsIncomplete || noTraining) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [dailyLog, dismissed, profile]);

  if (!show || dismissed) return null;

  const waterGoal = getWaterGoal(profile?.age, profile?.weight_kg);
  const waterMl = dailyLog?.water_ml || 0;
  const waterPct = Math.min(100, Math.round((waterMl / waterGoal) * 100));
  const questsDone = dailyLog?.quests_completed?.length || 0;
  const trainingDone = dailyLog?.training_completed?.filter((t) => t.completed)?.length || 0;

  const items = [];
  if (waterPct < 100) items.push({ icon: "💧", text: `${waterPct}% of your water goal — drink up!`, done: false });
  if (questsDone === 0) items.push({ icon: "🎯", text: "You haven't completed any quests today", done: false });
  if (trainingDone === 0) items.push({ icon: "⚽", text: "No training logged today — squeeze in a quick drill!", done: false });
  if (waterPct >= 100) items.push({ icon: "💧", text: "Water goal complete!", done: true });
  if (questsDone > 0) items.push({ icon: "🎯", text: `${questsDone} quest${questsDone > 1 ? "s" : ""} completed!`, done: true });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 p-4 overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BellRing className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-bold text-sm text-amber-400">
                Evening Check-In 🌙
              </h4>
              <button
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-foreground/80">
              Hey {profile?.player_name || "Player"}! Don't forget to finish your daily goals before bed.
            </p>
            <div className="space-y-1.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span
                    className={`text-xs ${
                      item.done ? "text-green-400 line-through" : "text-foreground/70"
                    }`}
                  >
                    {item.text}
                  </span>
                  {item.done && <CheckCircle className="w-3 h-3 text-green-400" />}
                </div>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => setDismissed(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white mt-1"
            >
              Got it, I'm on it! <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}