import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Target, Droplets, Dumbbell, Brain, Apple, CheckCircle2, ChevronRight } from "lucide-react";
import { STAT_COLORS } from "@/lib/gameData";
import { motion } from "framer-motion";

const STAT_LABELS = {
  pace: "Pace", shooting: "Shooting", passing: "Passing", dribbling: "Dribbling",
  defending: "Defending", physical: "Physical", mental: "Mental", tactical: "Tactical",
};

const STAT_ICONS = {
  pace: "💨", shooting: "🎯", passing: "🦶", dribbling: "⚽",
  defending: "🛡️", physical: "💪", mental: "🧠", tactical: "📋",
};

const today = format(new Date(), "yyyy-MM-dd");

export default function DailyFocus({ profile, dailyLog }) {
  const navigate = useNavigate();

  const { data: plans = [] } = useQuery({
    queryKey: ["development-plans-focus", profile?.id],
    queryFn: () =>
      base44.entities.DevelopmentPlan.filter(
        { player_id: profile.id, plan_type: "annual", status: "active" },
        "-start_date",
        1
      ),
    enabled: !!profile,
  });

  const tasks = useMemo(() => {
    const items = [];
    const plan = plans[0];
    const targets = plan?.skill_targets || {};
    const stats = profile?.stats || {};
    const waterMl = dailyLog?.water_ml || 0;
    const waterGoal = profile.weight_kg
      ? Math.round(profile.weight_kg * 35)
      : 2500;
    const questsDone = dailyLog?.quests_completed?.length || 0;

    // Priority 1: Biggest stat gap
    if (Object.keys(targets).length > 0) {
      let biggestGap = null;
      let biggestGapSize = 0;
      Object.entries(targets).forEach(([stat, target]) => {
        const current = stats[stat] || 50;
        const gap = target - current;
        if (gap > biggestGapSize && gap > 2) {
          biggestGapSize = gap;
          biggestGap = stat;
        }
      });
      if (biggestGap) {
        items.push({
          type: "training",
          icon: STAT_ICONS[biggestGap] || "🎯",
          label: `Work on ${STAT_LABELS[biggestGap]}`,
          detail: `${stats[biggestGap]} → ${targets[biggestGap]} (${biggestGapSize} pts behind)`,
          action: () => navigate("/train"),
          color: STAT_COLORS[biggestGap] || "hsl(142 71% 45%)",
        });
      }
    }

    // Priority 2: Hydration
    if (waterMl < waterGoal * 0.6) {
      const glassesLeft = Math.ceil((waterGoal - waterMl) / 250);
      items.push({
        type: "hydration",
        icon: <Droplets className="w-4 h-4 text-blue-400" />,
        label: `Drink water`,
        detail: `${glassesLeft} more glass${glassesLeft > 1 ? "es" : ""} today (${Math.round(waterMl / 1000)}L / ${Math.round(waterGoal / 1000)}L)`,
        action: null,
        color: "hsl(199 89% 48%)",
      });
    }

    // Priority 3: Complete quests if none done
    if (questsDone === 0 && items.length < 2) {
      items.push({
        type: "quests",
        icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
        label: "Complete your first quest",
        detail: "Switch to Today's Quests and check off one task to get started",
        action: null,
        color: "hsl(142 71% 45%)",
      });
    } else if (questsDone > 0 && questsDone < 3 && items.length < 3) {
      items.push({
        type: "quests",
        icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
        label: "Keep the momentum",
        detail: `${questsDone} quest done — try for 1 more`,
        action: null,
        color: "hsl(142 71% 45%)",
      });
    }

    // Fill remaining with recovery / mental / nutrition
    if (items.length < 3) {
      if (!dailyLog?.mental_session_done) {
        items.push({
          type: "mental",
          icon: <Brain className="w-4 h-4 text-violet-400" />,
          label: "Mental reset",
          detail: "5 min breathing or visualization",
          action: () => navigate("/mental"),
          color: "hsl(280 65% 60%)",
        });
      }
    }
    if (items.length < 3) {
      if (!dailyLog?.meals_logged || dailyLog.meals_logged.length < 2) {
        items.push({
          type: "nutrition",
          icon: <Apple className="w-4 h-4 text-red-400" />,
          label: "Log a meal",
          detail: "Track your nutrition to fuel performance",
          action: () => navigate("/nutrition"),
          color: "hsl(0 84% 60%)",
        });
      }
    }
    if (items.length < 3) {
      items.push({
        type: "training",
        icon: <Dumbbell className="w-4 h-4 text-amber-400" />,
        label: "Get moving",
        detail: `${profile.skill_level} training waiting for you`,
        action: () => navigate("/train"),
        color: "hsl(48 96% 53%)",
      });
    }

    return items.slice(0, 3);
  }, [plans, profile, dailyLog]);

  if (tasks.length === 0) return null;

  const allDone = tasks.every((t) => {
    if (t.type === "training") return false; // always show training suggestion
    if (t.type === "hydration") return (dailyLog?.water_ml || 0) >= (profile.weight_kg ? Math.round(profile.weight_kg * 35) : 2500) * 0.6;
    if (t.type === "quests") return (dailyLog?.quests_completed?.length || 0) >= 3;
    if (t.type === "mental") return dailyLog?.mental_session_done;
    if (t.type === "nutrition") return (dailyLog?.meals_logged?.length || 0) >= 2;
    return false;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="rounded-xl bg-gradient-to-br from-card to-primary/5 border border-primary/20 p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-primary">
          Today's Focus
        </h3>
        {allDone && (
          <span className="text-[10px] text-green-400 ml-auto font-medium">All done! 🎉</span>
        )}
      </div>

      <div className="space-y-2">
        {tasks.map((task, i) => (
          <button
            key={i}
            onClick={task.action || undefined}
            className={`w-full flex items-center gap-3 rounded-lg bg-background/70 border border-border/60 p-3 text-left transition-all ${
              task.action ? "hover:border-primary/30 hover:bg-background cursor-pointer" : "cursor-default"
            }`}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${task.color}15` }}
            >
              {typeof task.icon === "string" ? (
                <span className="text-base">{task.icon}</span>
              ) : (
                task.icon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{task.label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{task.detail}</p>
            </div>
            {task.action && (
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}