import { CATEGORIES, getCategoryXp, getCategoryTier, getCategoryProgress, CATEGORY_THRESHOLDS, TIER_LABELS, TIER_ICONS } from "@/lib/categoryProgression";
import { motion } from "framer-motion";
import { Zap, ArrowUp } from "lucide-react";

export default function CategoryProgression({ dailyLogs = [], compact = false }) {
  const categoryXp = getCategoryXp(dailyLogs);

  if (compact) {
    return (
      <div className="space-y-2">
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const xp = categoryXp[key] || 0;
          const tier = getCategoryTier(xp);
          const progress = getCategoryProgress(xp);
          const nextLabel = tier < 3 ? TIER_LABELS[tier + 1] : "MAX";
          const nextThreshold = tier < 3 ? CATEGORY_THRESHOLDS[tier + 1] : null;

          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm w-6 text-center">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-medium">{cat.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {tier >= 0 ? `${TIER_ICONS[tier]} ${tier + 1}/4` : "—"}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-sm">Category Progression</h3>
        <span className="text-[10px] text-muted-foreground">XP per pillar</span>
      </div>

      <div className="space-y-3">
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const xp = categoryXp[key] || 0;
          const tier = getCategoryTier(xp);
          const progress = getCategoryProgress(xp);
          const nextLabel = tier < 3 ? TIER_LABELS[tier + 1] : "MAX";
          const nextThreshold = tier < 3 ? CATEGORY_THRESHOLDS[tier + 1] : null;
          const currentThreshold = tier >= 0 ? CATEGORY_THRESHOLDS[tier] : 0;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              {/* Category header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{cat.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {xp} XP
                      {tier >= 0 && (
                        <span className="ml-1" style={{ color: cat.color }}>
                          · {TIER_ICONS[tier]} {TIER_LABELS[tier]}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {tier >= 0 && tier < 3 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <ArrowUp className="w-3 h-3" />
                    {nextThreshold ? `${nextThreshold - xp} XP to ${nextLabel}` : nextLabel}
                  </span>
                )}
                {tier >= 3 && (
                  <span className="text-[10px] font-medium" style={{ color: cat.color }}>
                    💎 Elite
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tier >= 3 ? 100 : progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full transition-colors"
                  style={{ backgroundColor: cat.color }}
                />
              </div>

              {/* Tier dots */}
              <div className="flex items-center gap-2 mt-1.5">
                {CATEGORY_THRESHOLDS.map((threshold, i) => {
                  const unlocked = xp >= threshold;
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <div
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          unlocked ? "shadow-sm" : "bg-muted"
                        }`}
                        style={unlocked ? { backgroundColor: cat.color } : {}}
                      />
                      <span
                        className={`text-[9px] ${unlocked ? "text-foreground font-medium" : "text-muted-foreground"}`}
                      >
                        {TIER_ICONS[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}