import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BADGES, getLevel, BADGE_CRITERIA, STAT_COLORS } from "@/lib/gameData";
import { getCategoryBadge, getCategoryXp } from "@/lib/categoryProgression";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Trophy, Lock, TrendingUp, Sparkles, Award } from "lucide-react";

const PILLAR_LABELS = {
  pace: "Pace", shooting: "Shooting", passing: "Passing", dribbling: "Dribbling",
  defending: "Defending", physical: "Physical", mental: "Mental", tactical: "Tactical",
};

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
  // Pillar progress hints
  pace_60: { hint: "Pace to 60", goal: 60, metric: (p) => p.stats?.pace || 0 },
  pace_75: { hint: "Pace to 75", goal: 75, metric: (p) => p.stats?.pace || 0 },
  pace_90: { hint: "Pace to 90", goal: 90, metric: (p) => p.stats?.pace || 0 },
  pace_99: { hint: "Pace to 99", goal: 99, metric: (p) => p.stats?.pace || 0 },
  shooting_60: { hint: "Shooting to 60", goal: 60, metric: (p) => p.stats?.shooting || 0 },
  shooting_75: { hint: "Shooting to 75", goal: 75, metric: (p) => p.stats?.shooting || 0 },
  shooting_90: { hint: "Shooting to 90", goal: 90, metric: (p) => p.stats?.shooting || 0 },
  shooting_99: { hint: "Shooting to 99", goal: 99, metric: (p) => p.stats?.shooting || 0 },
  passing_60: { hint: "Passing to 60", goal: 60, metric: (p) => p.stats?.passing || 0 },
  passing_75: { hint: "Passing to 75", goal: 75, metric: (p) => p.stats?.passing || 0 },
  passing_90: { hint: "Passing to 90", goal: 90, metric: (p) => p.stats?.passing || 0 },
  passing_99: { hint: "Passing to 99", goal: 99, metric: (p) => p.stats?.passing || 0 },
  dribbling_60: { hint: "Dribbling to 60", goal: 60, metric: (p) => p.stats?.dribbling || 0 },
  dribbling_75: { hint: "Dribbling to 75", goal: 75, metric: (p) => p.stats?.dribbling || 0 },
  dribbling_90: { hint: "Dribbling to 90", goal: 90, metric: (p) => p.stats?.dribbling || 0 },
  dribbling_99: { hint: "Dribbling to 99", goal: 99, metric: (p) => p.stats?.dribbling || 0 },
  defending_60: { hint: "Defending to 60", goal: 60, metric: (p) => p.stats?.defending || 0 },
  defending_75: { hint: "Defending to 75", goal: 75, metric: (p) => p.stats?.defending || 0 },
  defending_90: { hint: "Defending to 90", goal: 90, metric: (p) => p.stats?.defending || 0 },
  defending_99: { hint: "Defending to 99", goal: 99, metric: (p) => p.stats?.defending || 0 },
  physical_60: { hint: "Physical to 60", goal: 60, metric: (p) => p.stats?.physical || 0 },
  physical_75: { hint: "Physical to 75", goal: 75, metric: (p) => p.stats?.physical || 0 },
  physical_90: { hint: "Physical to 90", goal: 90, metric: (p) => p.stats?.physical || 0 },
  physical_99: { hint: "Physical to 99", goal: 99, metric: (p) => p.stats?.physical || 0 },
  mental_60: { hint: "Mental to 60", goal: 60, metric: (p) => p.stats?.mental || 0 },
  mental_75: { hint: "Mental to 75", goal: 75, metric: (p) => p.stats?.mental || 0 },
  mental_90: { hint: "Mental to 90", goal: 90, metric: (p) => p.stats?.mental || 0 },
  mental_99: { hint: "Mental to 99", goal: 99, metric: (p) => p.stats?.mental || 0 },
  tactical_60: { hint: "Tactical to 60", goal: 60, metric: (p) => p.stats?.tactical || 0 },
  tactical_75: { hint: "Tactical to 75", goal: 75, metric: (p) => p.stats?.tactical || 0 },
  tactical_90: { hint: "Tactical to 90", goal: 90, metric: (p) => p.stats?.tactical || 0 },
  tactical_99: { hint: "Tactical to 99", goal: 99, metric: (p) => p.stats?.tactical || 0 },
};

export default function TrophyCase({ profile }) {
  const [selectedBadgeId, setSelectedBadgeId] = useState(null);
  const [filter, setFilter] = useState("all");
  const earnedIds = profile.badges || [];

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ["daily-logs-all"],
    queryFn: () => base44.entities.DailyLog.filter({ player_id: profile.id }, "-date", 200),
    enabled: !!profile?.id,
  });

  const categoryXp = useMemo(() => getCategoryXp(dailyLogs), [dailyLogs]);

  // Build all category badge entries
  const categoryBadges = useMemo(() => {
    const badges = [];
    const categories = ["technical", "physical", "tactical", "mental", "nutrition", "hydration", "recovery"];
    categories.forEach((cat) => {
      [0, 1, 2, 3].forEach((tier) => {
        const badge = getCategoryBadge(cat, tier);
        if (badge) badges.push([badge.id, badge]);
      });
    });
    return badges;
  }, []);

  // Merge regular + category badges
  const allBadgeEntries = useMemo(() => {
    return [...Object.entries(BADGES), ...categoryBadges];
  }, [categoryBadges]);

  const totalCount = allBadgeEntries.length;
  const earnedCount = earnedIds.length;

  const isPillarBadge = (id) => {
    if (BADGES[id]?.pillar) return true;
    if (id?.startsWith("cat_")) return true;
    return false;
  };

  const filteredBadges = useMemo(() => {
    return allBadgeEntries.filter(([id]) => {
      if (filter === "pillars") return isPillarBadge(id);
      if (filter === "milestones") return !isPillarBadge(id);
      return true;
    });
  }, [filter, allBadgeEntries]);

  const filterCounts = useMemo(() => ({
    all: allBadgeEntries.length,
    pillars: allBadgeEntries.filter(([id]) => isPillarBadge(id)).length,
    milestones: allBadgeEntries.filter(([id]) => !isPillarBadge(id)).length,
  }), [allBadgeEntries]);

  const earnedInFilter = useMemo(() => {
    return filteredBadges.filter(([id]) => earnedIds.includes(id)).length;
  }, [filteredBadges, earnedIds]);

  const selectedBadge = BADGES[selectedBadgeId] || (categoryBadges.find(([id]) => id === selectedBadgeId)?.[1]);
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

      {/* Filter Tabs */}
      <div className="flex rounded-lg bg-secondary p-0.5">
        {[
          { key: "all", label: "All", count: filterCounts.all },
          { key: "pillars", label: "Pillar Stats", count: filterCounts.pillars },
          { key: "milestones", label: "Milestones", count: filterCounts.milestones },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${
              filter === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label} <span className="opacity-50">({earnedIds.filter(id => key === "all" ? true : key === "pillars" ? isPillarBadge(id) : !isPillarBadge(id)).length}/{count})</span>
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filteredBadges.map(([id, badge]) => {
          const earned = earnedIds.includes(id);
          const isCat = id?.startsWith("cat_");
          const progHint = PROGRESS_HINTS[id];
          let progress = 0;
          let progLabel = "";
          
          if (isCat) {
            const catXp = categoryXp[badge.category] || 0;
            progress = Math.min(Math.round((catXp / badge.threshold) * 100), 99);
            progLabel = `${catXp} / ${badge.threshold} XP`;
          } else if (progHint) {
            progress = Math.min(Math.round((progHint.metric(profile) / progHint.goal) * 100), 99);
          }

          const pillarColor = badge.pillar ? STAT_COLORS[badge.pillar] : null;

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.02 * filteredBadges.findIndex(([fid]) => fid === id) + 0.05 }}
              onClick={() => setSelectedBadgeId(id)}
              className={`relative rounded-xl border p-3 flex items-center gap-3 transition-all cursor-pointer ${
                earned && pillarColor
                  ? "hover:opacity-90"
                  : earned
                    ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50"
                    : "bg-secondary/50 border-border opacity-75 hover:opacity-100"
              }`}
              style={earned && pillarColor ? {
                background: `linear-gradient(135deg, ${pillarColor}18, ${pillarColor}06)`,
                borderColor: `${pillarColor}40`,
              } : {}}
            >
              {/* Badge Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${
                  earned && pillarColor
                    ? ""
                    : earned
                      ? "bg-primary/20 animate-glow"
                      : "bg-muted grayscale"
                }`}
                style={earned && pillarColor ? {
                  background: `${pillarColor}28`,
                  boxShadow: `0 0 10px ${pillarColor}35`,
                } : {}}
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
                    isSelectedEarned && selectedBadge.pillar
                      ? ""
                      : isSelectedEarned
                        ? "bg-primary/20 animate-glow"
                        : "bg-muted grayscale"
                  }`}
                  style={isSelectedEarned && selectedBadge.pillar && STAT_COLORS[selectedBadge.pillar] ? {
                    background: `${STAT_COLORS[selectedBadge.pillar]}25`,
                    boxShadow: `0 0 15px ${STAT_COLORS[selectedBadge.pillar]}40`,
                  } : {}}
                  >
                    {selectedBadge.icon}
                  </div>
                  <div className="text-left">
                   <DialogTitle className="font-heading text-lg">
                     {selectedBadge.name}
                   </DialogTitle>
                   <DialogDescription className="text-xs">
                     {selectedBadge.pillar 
                       ? `${PILLAR_LABELS[selectedBadge.pillar] || selectedBadge.category?.charAt(0).toUpperCase() + selectedBadge.category?.slice(1)} · Tier ${selectedBadge.tier}` 
                       : (isSelectedEarned ? selectedBadge.desc : "Locked")}
                   </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status */}
                <div className={`rounded-xl p-4 ${
                  isSelectedEarned
                    ? selectedBadge.pillar ? "" : "bg-primary/10 border border-primary/20"
                    : "bg-secondary/50 border border-border"
                }`}
                style={isSelectedEarned && selectedBadge.pillar && STAT_COLORS[selectedBadge.pillar] ? {
                  background: `${STAT_COLORS[selectedBadge.pillar]}15`,
                  borderColor: `${STAT_COLORS[selectedBadge.pillar]}30`,
                  borderWidth: "1px",
                  borderStyle: "solid",
                } : {}}
                >
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
                {selectedBadge.pillar ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center rounded-lg bg-secondary/50 p-2">
                      <p className="text-lg font-heading font-bold" style={{ color: STAT_COLORS[selectedBadge.pillar] || "#22c55e" }}>
                        {selectedBadge.category
                          ? (categoryXp[selectedBadge.category] || 0)
                          : (profile.stats?.[selectedBadge.pillar] || 0)}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {selectedBadge.category ? "Category XP" : `${PILLAR_LABELS[selectedBadge.pillar]} Rating`}
                      </p>
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
                ) : (
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
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}