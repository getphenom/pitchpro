import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowRight, AlertCircle, Target, Dumbbell } from "lucide-react";
import { STAT_COLORS } from "@/lib/gameData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const STAT_NAMES = ["pace", "shooting", "passing", "dribbling", "defending", "physical", "mental", "tactical"];
const STAT_LABELS = {
  pace: "Pace", shooting: "Shooting", passing: "Passing", dribbling: "Dribbling",
  defending: "Defending", physical: "Physical", mental: "Mental", tactical: "Tactical",
};

// Map each stat to training categories and suggested drill keywords
const STAT_DRILL_MAP = {
  pace: { category: "physical", keywords: ["Sprint", "Speed", "Agility", "HIIT"], icon: "💨" },
  shooting: { category: "technical", keywords: ["Finishing", "Shooting", "Volley"], icon: "🎯" },
  passing: { category: "technical", keywords: ["Pass", "First Touch", "Combination"], icon: "🦶" },
  dribbling: { category: "technical", keywords: ["Dribbling", "Skill", "Weak Foot"], icon: "⚽" },
  defending: { category: "tactical", keywords: ["Defending", "Pressing", "Position"], icon: "🛡️" },
  physical: { category: "physical", keywords: ["Strength", "Core", "Power", "Endurance"], icon: "💪" },
  mental: { category: "mental", keywords: ["Focus", "Breathing", "Visualization"], icon: "🧠" },
  tactical: { category: "tactical", keywords: ["Analysis", "Formation", "Counter"], icon: "📋" },
};

// Training drills from TRAINING_CATEGORIES (subset for gap recommendations)
const GAP_DRILLS = {
  technical: {
    beginner: [
      { name: "Wall Passes", duration: "10 min", xp: 15, target: "passing" },
      { name: "Cone Dribbling", duration: "15 min", xp: 20, target: "dribbling" },
      { name: "Juggling Challenge", duration: "10 min", xp: 15, target: "dribbling" },
    ],
    intermediate: [
      { name: "First Touch Drill", duration: "15 min", xp: 25, target: "passing" },
      { name: "Skill Moves Combo", duration: "15 min", xp: 25, target: "dribbling" },
      { name: "Weak Foot Training", duration: "15 min", xp: 30, target: "dribbling" },
    ],
    advanced: [
      { name: "Advanced Finishing", duration: "20 min", xp: 35, target: "shooting" },
      { name: "Combination Play", duration: "20 min", xp: 35, target: "passing" },
      { name: "Under Pressure", duration: "20 min", xp: 35, target: "dribbling" },
    ],
    elite: [
      { name: "Creative Play", duration: "20 min", xp: 40, target: "dribbling" },
      { name: "Position-Specific Mastery", duration: "25 min", xp: 45, target: "passing" },
      { name: "Match Simulation", duration: "25 min", xp: 45, target: "shooting" },
    ],
  },
  physical: {
    beginner: [
      { name: "Agility Ladder", duration: "10 min", xp: 15, target: "pace" },
      { name: "Sprint Intervals", duration: "15 min", xp: 20, target: "pace" },
      { name: "Core Circuit", duration: "10 min", xp: 15, target: "physical" },
    ],
    intermediate: [
      { name: "HIIT Pitch Workout", duration: "20 min", xp: 30, target: "physical" },
      { name: "Speed & Agility", duration: "15 min", xp: 25, target: "pace" },
      { name: "Strength Circuit", duration: "20 min", xp: 30, target: "physical" },
    ],
    advanced: [
      { name: "Power Training", duration: "25 min", xp: 35, target: "physical" },
      { name: "Endurance Run", duration: "30 min", xp: 35, target: "physical" },
      { name: "SAQ Complex", duration: "20 min", xp: 35, target: "pace" },
    ],
    elite: [
      { name: "Match Fitness Protocol", duration: "35 min", xp: 45, target: "physical" },
      { name: "Explosive Power", duration: "25 min", xp: 40, target: "physical" },
    ],
  },
  tactical: {
    beginner: [
      { name: "Position Awareness", duration: "10 min", xp: 15, target: "tactical" },
      { name: "Formation Basics", duration: "10 min", xp: 15, target: "tactical" },
    ],
    intermediate: [
      { name: "Video Analysis", duration: "15 min", xp: 25, target: "tactical" },
      { name: "Set Piece Practice", duration: "15 min", xp: 20, target: "tactical" },
    ],
    advanced: [
      { name: "Game Reading", duration: "15 min", xp: 30, target: "tactical" },
      { name: "Pressing Patterns", duration: "15 min", xp: 30, target: "defending" },
    ],
    elite: [
      { name: "Counter-Attack Analysis", duration: "20 min", xp: 40, target: "tactical" },
      { name: "Leadership Play", duration: "15 min", xp: 35, target: "defending" },
    ],
  },
};

export default function GapDrillsHighlights({ profile }) {
  const navigate = useNavigate();

  const { data: plans = [], isLoading: loadingPlan } = useQuery({
    queryKey: ["development-plans-gap", profile?.id],
    queryFn: () =>
      base44.entities.DevelopmentPlan.filter(
        { player_id: profile.id, plan_type: "annual", status: "active" },
        "-start_date",
        1
      ),
    enabled: !!profile,
  });

  const gaps = useMemo(() => {
    const plan = plans[0];
    const targets = plan?.skill_targets || {};
    if (Object.keys(targets).length === 0) return [];

    const skillLevel = profile?.skill_level || "beginner";
    const levelKeys = ["beginner", "intermediate", "advanced", "elite"];

    return STAT_NAMES
      .filter((stat) => {
        const current = profile?.stats?.[stat] || 50;
        const target = targets[stat] || 50;
        return current < target;
      })
      .map((stat) => {
        const current = profile?.stats?.[stat] || 50;
        const target = targets[stat] || 50;
        const gap = target - current;
        const mapping = STAT_DRILL_MAP[stat];

        // Find matching drills from the gap drill library
        const matchingDrills = [];
        const catDrills = GAP_DRILLS[mapping.category];
        if (catDrills) {
          // Check current skill level first, then fall back
          const levelDrills = catDrills[skillLevel] || [];
          // Also look at other levels for more options
          Object.values(catDrills).forEach((drills) => {
            drills.forEach((d) => {
              if (d.target === stat && !matchingDrills.find((md) => md.name === d.name)) {
                matchingDrills.push(d);
              }
            });
          });
        }

        return {
          stat,
          label: STAT_LABELS[stat],
          icon: mapping.icon,
          current,
          target,
          gap,
          pct: Math.round((current / target) * 100),
          category: mapping.category,
          drills: matchingDrills.slice(0, 3),
        };
      })
      .sort((a, b) => b.gap - a.gap); // biggest gaps first
  }, [plans, profile]);

  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (gaps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4 space-y-4"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-amber-400">
          Gap to Close
        </h3>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {gaps.length} area{gaps.length > 1 ? "s" : ""} below IDP targets
        </span>
      </div>

      {gaps.map((gapItem) => (
        <div key={gapItem.stat} className="rounded-lg bg-secondary/40 border border-border/50 p-3 space-y-2">
          {/* Stat header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{gapItem.icon}</span>
              <div>
                <span className="text-sm font-semibold">{gapItem.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: STAT_COLORS[gapItem.stat] }}>
                    {gapItem.current}
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <Target className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-amber-400 font-semibold">{gapItem.target}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">—{gapItem.gap} pts gap</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-heading font-bold text-amber-400">{gapItem.pct}%</span>
              <div className="w-16 h-1.5 rounded-full bg-secondary mt-0.5">
                <div
                  className="h-full rounded-full bg-amber-400/60 transition-all"
                  style={{ width: `${gapItem.pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recommended drills */}
          {gapItem.drills.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Recommended Drills
              </p>
              {gapItem.drills.map((drill, i) => (
                <button
                  key={drill.name}
                  onClick={() => navigate(`/train`)}
                  className="w-full flex items-center justify-between rounded-md bg-background/60 hover:bg-background border border-border/50 hover:border-primary/20 px-3 py-2 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-heading text-muted-foreground w-4">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium group-hover:text-primary transition-colors">
                      {drill.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{drill.duration}</span>
                    <span className="text-accent font-semibold">+{drill.xp} XP</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Mental stat fallback - no training drills */}
          {gapItem.drills.length === 0 && gapItem.stat === "mental" && (
            <button
              onClick={() => navigate("/mental")}
              className="w-full flex items-center justify-between rounded-md bg-background/60 hover:bg-background border border-border/50 hover:border-violet-500/20 px-3 py-2 transition-all group"
            >
              <span className="text-xs font-medium group-hover:text-violet-400 transition-colors">
                Open Mental Training
              </span>
              <span className="text-[10px] text-violet-400">🧠 Go →</span>
            </button>
          )}
        </div>
      ))}

      <button
        onClick={() => navigate("/train")}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-xs font-semibold text-primary transition-all"
      >
        <Dumbbell className="w-3.5 h-3.5" />
        Go to Training
      </button>
    </motion.div>
  );
}