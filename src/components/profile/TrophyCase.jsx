import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BADGES, getLevel, BADGE_CRITERIA } from "@/lib/gameData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Trophy, Lock, TrendingUp, Sparkles, Award } from "lucide-react";

const PROGRESS_HINTS = {
  streak_3: { hint: "3-day streak", goal: 3, metric: (p) => p.streak_days || 0 },
  streak_7: { hint: "7-day streak", goal: 7, metric: (p) => p.streak_days || 0 },
  streak_14: { hint: "14-day streak", goal: 14, metric: (p) => p.streak_days || 0 },
  streak_30: { hint: "30-day streak", goal: 30, metric: (p) => p.streak_days || 0 },
  streak_60: { hint: "60-day streak", goal: 60, metric: (p) => p.streak_days || 0 },
  streak_100: { hint: "100-day streak", goal: 100, metric: (p) => p.streak_days || 0 },
  level_5: { hint: "Reach Level 5", goal: 5, metric: (p) => getLevel(p.xp || 0) },
  level_10: { hint: "Reach Level 10", goal: 10, metric: (p) => getLevel(p.xp || 0) },
  level_15: { hint: "Reach Level 15", goal: 15, metric: (p) => getLevel(p.xp || 0) },
  level_20: { hint: "Reach Level 20", goal: 20, metric: (p) => getLevel(p.xp || 0) },
  xp_1000: { hint: "Earn 1,000 XP", goal: 1000, metric: (p) => p.xp || 0 },
  xp_5000: { hint: "Earn 5,000 XP", goal: 5000, metric: (p) => p.xp || 0 },
  xp_10000: { hint: "Earn 10,000 XP", goal: 10000, metric: (p) => p.xp || 0 },
};

export default function TrophyCase({ profile }) {
  const [selectedBadgeId, setSelectedBadgeId] = useState(null);
  const earnedIds = profile.badges || [];
  const earnedCount = earnedIds.length;
  const totalCount = Object.keys(BADGES).length;

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ["daily-logs-all"],
    queryFn: () => base44.entities.DailyLog.filter({ player_id: profile.id }, "-date", 200),
    enabled: !!profile?.id,
  });

  const selectedBadge = BADGES[selectedBadgeId];
  const isSelectedEarned = earnedIds.includes(selectedBadgeId);
  const selectedHint = PROGRESS_HINTS[selectedBadgeId];
  const selectedProgress = selectedHint ? Math.min(Math.round((selectedHint.metric(profile) / selectedHint.goal) * 100), 100) : 0;

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
          const criteriaFn = BADGE_CRITERIA[id];
          const progHint = PROGRESS_HINTS[id];
          const progress = progHint ? Math.min(Math.round((progHint.metric(profile) / progHint.goal) * 100), 99) : 0;

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * Object.keys(BADGES).indexOf(id) + 0.1 }}
              onClick={() => setSelectedBadgeId(id)}
              className={`relative rounded-xl border p-3 flex items-center gap-3 transition-all cursor-pointer ${
                earned
                  ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50"
                  : "bg-secondary/50 border-border opacity-75 hover:opacity-100"
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
                  {earned ? badge.desc : progHint?.hint || badge.desc}
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

      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadgeId} onOpenChange={(open) => !open && setSelectedBadgeId(null)}>
        <DialogContent className="sm:max-w-sm">
          {selectedBadge && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                    isSelectedEarned
                      ? "bg-primary/20 animate-glow"
                      : "bg-muted grayscale"
                  }`}>
                    {selectedBadge.icon}
                  </div>
                  <div className="text-left">
                    <DialogTitle className="font-heading text-lg">
                      {selectedBadge.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {isSelectedEarned ? selectedBadge.desc : "Locked"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status */}
                <div className={`rounded-xl p-4 ${
                  isSelectedEarned
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-secondary/50 border border-border"
                }`}>
                  {isSelectedEarned ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-accent">Badge Earned!</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span>{selectedHint?.hint || selectedBadge.desc}</span>
                      </div>
                      {selectedHint && (
                        <div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-primary/50 transition-all"
                              style={{ width: `${selectedProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {selectedHint.metric(profile)} / {selectedHint.goal} — {selectedProgress}%
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Context Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center rounded-lg bg-secondary/50 p-2">
                    <p className="text-lg font-heading font-bold text-primary">{profile.streak_days || 0}</p>
                    <p className="text-[9px] text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="text-center rounded-lg bg-secondary/50 p-2">
                    <p className="text-lg font-heading font-bold text-primary">{getLevel(profile.xp || 0)}</p>
                    <p className="text-[9px] text-muted-foreground">Level</p>
                  </div>
                  <div className="text-center rounded-lg bg-secondary/50 p-2">
                    <p className="text-lg font-heading font-bold text-primary">{profile.xp || 0}</p>
                    <p className="text-[9px] text-muted-foreground">Total XP</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}