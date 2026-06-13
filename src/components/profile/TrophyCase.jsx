import { BADGES, getLevel } from "@/lib/gameData";
import { motion } from "framer-motion";
import { Trophy, Lock, TrendingUp } from "lucide-react";

const BADGE_CRITERIA = {
  first_login: { check: (profile) => true, hint: "Start your soccer journey" },
  streak_3: { check: (profile) => (profile.streak_days || 0) >= 3, hint: "Maintain a 3-day activity streak", progress: (p) => Math.min(Math.round(((p.streak_days || 0) / 3) * 100), 99) },
  streak_7: { check: (profile) => (profile.streak_days || 0) >= 7, hint: "Maintain a 7-day activity streak", progress: (p) => Math.min(Math.round(((p.streak_days || 0) / 7) * 100), 99) },
  streak_30: { check: (profile) => (profile.streak_days || 0) >= 30, hint: "Maintain a 30-day activity streak", progress: (p) => Math.min(Math.round(((p.streak_days || 0) / 30) * 100), 99) },
  hydrated: { check: () => false, hint: "Hit water goal 5 times" },
  nutrition_pro: { check: () => false, hint: "Log all meals for 7 days straight" },
  mental_strong: { check: () => false, hint: "Complete 5 mental training sessions" },
  level_5: { check: (profile) => getLevel(profile.xp || 0) >= 5, hint: "Reach Level 5", progress: (p) => Math.min(Math.round((getLevel(p.xp || 0) / 5) * 100), 99) },
  level_10: { check: (profile) => getLevel(profile.xp || 0) >= 10, hint: "Reach Level 10", progress: (p) => Math.min(Math.round((getLevel(p.xp || 0) / 10) * 100), 99) },
  first_training: { check: () => false, hint: "Complete your first training session" },
  tactical_mind: { check: () => false, hint: "Complete 10 tactical training sessions" },
};

export default function TrophyCase({ profile }) {
  const earnedIds = profile.badges || [];
  const earnedCount = earnedIds.length;
  const totalCount = Object.keys(BADGES).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Trophy Case
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="font-semibold text-foreground">{earnedCount}</span>
          <span>/ {totalCount} unlocked</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(earnedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
        />
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(BADGES).map(([id, badge]) => {
          const earned = earnedIds.includes(id);
          const criteria = BADGE_CRITERIA[id];
          const progress = criteria?.progress ? criteria.progress(profile) : 0;

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * Object.keys(BADGES).indexOf(id) + 0.1 }}
              className={`relative rounded-xl border p-3 flex items-center gap-3 transition-all ${
                earned
                  ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30"
                  : "bg-secondary/50 border-border opacity-75"
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${
                  earned
                    ? "bg-primary/20 animate-glow"
                    : "bg-muted grayscale"
                }`}
              >
                {badge.icon}
              </div>

              {/* Badge Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-semibold truncate ${earned ? "" : "text-muted-foreground"}`}>
                    {badge.name}
                  </p>
                  {!earned && <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                  {earned ? badge.desc : criteria?.hint || badge.desc}
                </p>

                {/* Progress bar for in-progress badges */}
                {!earned && progress > 0 && (
                  <div className="mt-1.5">
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className="h-1 rounded-full bg-primary/50"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{progress}% complete</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}