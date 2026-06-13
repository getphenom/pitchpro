import { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { POSITION_LABELS, STAT_COLORS } from "@/lib/gameData";
import { motion } from "framer-motion";
import { Loader2, Shield } from "lucide-react";

const POSITION_SHORT = {
  goalkeeper: "GK", center_back: "CB", full_back: "FB",
  defensive_mid: "CDM", central_mid: "CM", attacking_mid: "CAM",
  winger: "LW/RW", striker: "ST",
};

// ─── All 29 Development Areas ───
const DEV_AREAS = [
  // PHYSICAL (6)
  { key: "fitness_level", label: "Fitness", pillar: "Physical", pillarKey: "physical", icon: "💪", color: "#ec4899" },
  { key: "exercise_frequency", label: "Consistency", pillar: "Physical", pillarKey: "physical", icon: "📅", color: "#ec4899" },
  { key: "speed_self", label: "Speed", pillar: "Physical", pillarKey: "physical", icon: "⚡", color: "#ec4899" },
  { key: "endurance", label: "Endurance", pillar: "Physical", pillarKey: "physical", icon: "🏃", color: "#ec4899" },
  { key: "strength", label: "Strength", pillar: "Physical", pillarKey: "physical", icon: "🏋️", color: "#ec4899" },
  { key: "injuries", label: "Durability", pillar: "Physical", pillarKey: "physical", icon: "🛡️", color: "#ec4899" },

  // TECHNICAL (5)
  { key: "first_touch", label: "1st Touch", pillar: "Technical", pillarKey: "technical", icon: "🦶", color: "#22c55e" },
  { key: "passing_accuracy", label: "Passing", pillar: "Technical", pillarKey: "technical", icon: "🎯", color: "#22c55e" },
  { key: "dribbling", label: "Dribbling", pillar: "Technical", pillarKey: "technical", icon: "🔄", color: "#22c55e" },
  { key: "shooting", label: "Shooting", pillar: "Technical", pillarKey: "technical", icon: "💥", color: "#22c55e" },
  { key: "weak_foot", label: "Weak Foot", pillar: "Technical", pillarKey: "technical", icon: "👣", color: "#22c55e" },

  // TACTICAL (4)
  { key: "game_understanding", label: "Game IQ", pillar: "Tactical", pillarKey: "tactical", icon: "🧩", color: "#f97316" },
  { key: "positioning", label: "Positioning", pillar: "Tactical", pillarKey: "tactical", icon: "📍", color: "#f97316" },
  { key: "decision_making", label: "Decisions", pillar: "Tactical", pillarKey: "tactical", icon: "🤔", color: "#f97316" },
  { key: "watching_pros", label: "Study Habit", pillar: "Tactical", pillarKey: "tactical", icon: "📺", color: "#f97316" },

  // MENTAL (4)
  { key: "confidence", label: "Confidence", pillar: "Mental", pillarKey: "mental", icon: "🦁", color: "#a855f7" },
  { key: "mistake_recovery", label: "Resilience", pillar: "Mental", pillarKey: "mental", icon: "🔄", color: "#a855f7" },
  { key: "focus", label: "Focus", pillar: "Mental", pillarKey: "mental", icon: "🔍", color: "#a855f7" },
  { key: "pressure", label: "Composure", pillar: "Mental", pillarKey: "mental", icon: "🧊", color: "#a855f7" },

  // NUTRITION (4)
  { key: "eating_habits", label: "Diet", pillar: "Nutrition", pillarKey: "nutrition", icon: "🍽️", color: "#14b8a6" },
  { key: "water_intake", label: "Hydration", pillar: "Nutrition", pillarKey: "nutrition", icon: "💧", color: "#14b8a6" },
  { key: "pre_game_meal", label: "Pre-Match", pillar: "Nutrition", pillarKey: "nutrition", icon: "⏰", color: "#14b8a6" },
  { key: "recovery_nutrition", label: "Recovery Fuel", pillar: "Nutrition", pillarKey: "nutrition", icon: "🥤", color: "#14b8a6" },

  // RECOVERY (5)
  { key: "stretching", label: "Stretching", pillar: "Recovery", pillarKey: "recovery", icon: "🧘", color: "#06b6d4" },
  { key: "foam_rolling", label: "Foam Roll", pillar: "Recovery", pillarKey: "recovery", icon: "🫧", color: "#06b6d4" },
  { key: "active_recovery", label: "Active Rec", pillar: "Recovery", pillarKey: "recovery", icon: "🚶", color: "#06b6d4" },
  { key: "sleep", label: "Sleep", pillar: "Recovery", pillarKey: "recovery", icon: "😴", color: "#06b6d4" },
  { key: "contrast", label: "Contrast Tx", pillar: "Recovery", pillarKey: "recovery", icon: "🌡️", color: "#06b6d4" },

  // HYDRATION (1)
  { key: "hydration_daily", label: "H2O Daily", pillar: "Hydration", pillarKey: "hydration", icon: "💦", color: "#3b82f6" },
];

const PILLAR_COLORS = {
  physical: "#ec4899",
  technical: "#22c55e",
  tactical: "#f97316",
  mental: "#a855f7",
  nutrition: "#14b8a6",
  recovery: "#06b6d4",
  hydration: "#3b82f6",
};

const PILLAR_ICONS = {
  physical: "💪",
  technical: "⚽",
  tactical: "📋",
  mental: "🧠",
  nutrition: "🍎",
  recovery: "🛌",
  hydration: "💧",
};

function getScore(area, profile, assessment, dailyLogs) {
  // First: try assessment scores (1-5 scale)
  if (assessment?.pillars?.[area.pillarKey]?.answers?.[area.key]) {
    const raw = assessment.pillars[area.pillarKey].answers[area.key];
    const num = typeof raw === "number" ? raw : parseInt(raw) || 3;
    return Math.round(num * 20); // 1-5 → 20-100 FIFA scale
  }

  // Fallback: profile stats
  if (profile?.stats?.[area.pillarKey] != null) {
    return profile.stats[area.pillarKey];
  }

  // Recovery/hydration from daily logs
  if (area.key === "sleep") {
    const avgSleep = dailyLogs?.reduce((s, l) => s + (l.sleep_hours || 0), 0) / (dailyLogs?.length || 1);
    return Math.min(99, Math.round((avgSleep / 10) * 99));
  }
  if (area.key === "hydration_daily") {
    const avgWater = dailyLogs?.reduce((s, l) => s + (l.water_ml || 0), 0) / (dailyLogs?.length || 1);
    return Math.min(99, Math.round((avgWater / 3000) * 99));
  }
  if (area.key === "stretching" || area.key === "foam_rolling" || area.key === "active_recovery" || area.key === "contrast") {
    // Derive from mental/physical stats as proxy
    const base = profile?.stats?.physical || 50;
    return base;
  }

  return 50; // default
}

export default function FifaPlayerCard() {
  const { data: profiles, isLoading: loadingProfile } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const { data: assessments = [] } = useQuery({
    queryKey: ["assessments", profile?.id],
    queryFn: () => base44.entities.Assessment.filter({ player_id: profile?.id, status: "completed" }, "-date", 1),
    enabled: !!profile,
  });

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ["all-logs-fifa"],
    queryFn: () => base44.entities.DailyLog.list("-date", 30),
    enabled: !!profile,
  });

  const assessment = assessments?.[0];

  const scores = useMemo(() => {
    if (!profile) return {};
    const result = {};
    DEV_AREAS.forEach((area) => {
      result[area.key] = getScore(area, profile, assessment, dailyLogs);
    });
    return result;
  }, [profile, assessment, dailyLogs]);

  const overall = useMemo(() => {
    const vals = Object.values(scores);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 50;
  }, [scores]);

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  // Group areas by pillar
  const grouped = {};
  DEV_AREAS.forEach((a) => {
    if (!grouped[a.pillarKey]) grouped[a.pillarKey] = [];
    grouped[a.pillarKey].push(a);
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      {/* FIFA Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-500/90 via-yellow-600/70 to-amber-700/90 border-2 border-yellow-400/40 shadow-2xl">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Card top — position + rating */}
        <div className="relative z-10 px-5 pt-5 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-1">
                {POSITION_SHORT[profile.position] || "CF"} · {profile.skill_level?.toUpperCase()}
              </p>
              <h2 className="text-2xl font-heading font-black text-white leading-tight tracking-tight">
                {profile.player_name}
              </h2>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="font-heading font-black text-5xl text-white leading-none">{overall}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 -mt-1">{POSITION_SHORT[profile.position]}</p>
            </div>
          </div>
        </div>

        {/* Attributes Grid */}
        <div className="relative z-10 bg-black/40 backdrop-blur-sm mx-3 rounded-2xl p-3 space-y-2.5">
          {Object.entries(grouped).map(([pillarKey, areas]) => {
            const pillarColor = PILLAR_COLORS[pillarKey] || "#fff";
            return (
              <div key={pillarKey}>
                {/* Pillar Header */}
                <div className="flex items-center gap-1.5 mb-1 px-0.5">
                  <span className="text-xs">{PILLAR_ICONS[pillarKey]}</span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: pillarColor }}
                  >
                    {areas[0]?.pillar}
                  </span>
                  <div className="flex-1 h-px ml-1 opacity-20" style={{ backgroundColor: pillarColor }} />
                </div>
                {/* Attributes */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {areas.map((area) => {
                    const score = scores[area.key] || 50;
                    return (
                      <div key={area.key} className="flex items-center justify-between group">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-xs">{area.icon}</span>
                          <span className="text-[11px] text-white/80 font-medium truncate">{area.label}</span>
                        </div>
                        <span
                          className="text-[11px] font-heading font-bold tabular-nums flex-shrink-0 ml-1"
                          style={{ color: score >= 80 ? "#22c55e" : score >= 60 ? "#facc15" : score >= 40 ? "#f97316" : "#ef4444" }}
                        >
                          {score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="relative z-10 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-white/50" />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              Lv.{profile.level || 1}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              {profile.age} YRS
            </span>
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              {profile.preferred_foot?.toUpperCase() || "R"}FT
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}