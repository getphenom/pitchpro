import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, subWeeks } from "date-fns";
import { Loader2, TrendingUp, TrendingDown, Trophy, Target, Zap, Award, AlertTriangle } from "lucide-react";
import { STAT_COLORS, BADGES } from "@/lib/gameData";
import { motion } from "framer-motion";

const STAT_NAMES = ["pace", "shooting", "passing", "dribbling", "defending", "physical", "mental", "tactical"];

export default function WeeklySummary({ profile }) {
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastWeekStart = format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const twoWeeksAgo = format(startOfWeek(subWeeks(new Date(), 2), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: snapshots = [], isLoading: loadingSnaps } = useQuery({
    queryKey: ["stat-snapshots", profile?.id],
    queryFn: () =>
      base44.entities.StatSnapshot.filter({ player_id: profile.id }, "-week_start", 10),
    enabled: !!profile,
  });

  const { data: dailyLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["daily-logs-week", profile?.id, currentWeekStart],
    queryFn: () =>
      base44.entities.DailyLog.filter({ player_id: profile.id }, "-date", 14),
    enabled: !!profile,
  });

  const summary = useMemo(() => {
    const thisWeekSnap = snapshots.find((s) => s.week_start === currentWeekStart);
    const lastWeekSnap = snapshots.find((s) => s.week_start === lastWeekStart);
    const twoWeeksAgoSnap = snapshots.find((s) => s.week_start === twoWeeksAgo);

    // Training stats this week
    const thisWeekLogs = dailyLogs.filter((l) => l.date >= currentWeekStart);
    const lastWeekLogs = dailyLogs.filter((l) => l.date >= lastWeekStart && l.date < currentWeekStart);

    const thisWeekTraining = thisWeekLogs.reduce((sum, l) => sum + l.xp_earned_today, 0);
    const lastWeekTraining = lastWeekLogs.reduce((sum, l) => sum + l.xp_earned_today, 0);
    const thisWeekDrills = thisWeekLogs.reduce((sum, l) => sum + (l.training_completed?.filter((t) => t.completed)?.length || 0), 0);
    const lastWeekDrills = lastWeekLogs.reduce((sum, l) => sum + (l.training_completed?.filter((t) => t.completed)?.length || 0), 0);
    const thisWeekWater = thisWeekLogs.reduce((sum, l) => sum + (l.water_ml || 0), 0);
    const lastWeekWater = lastWeekLogs.reduce((sum, l) => sum + (l.water_ml || 0), 0);
    const thisWeekQuests = thisWeekLogs.reduce((sum, l) => sum + (l.quests_completed?.length || 0), 0);
    const lastWeekQuests = lastWeekLogs.reduce((sum, l) => sum + (l.quests_completed?.length || 0), 0);

    // Stat deltas
    const statDeltas = STAT_NAMES.map((stat) => {
      const current = thisWeekSnap?.stats?.[stat] ?? profile?.stats?.[stat] ?? 50;
      const previous = lastWeekSnap?.stats?.[stat] ?? null;
      const twoAgo = twoWeeksAgoSnap?.stats?.[stat] ?? null;
      return {
        stat,
        label: stat.charAt(0).toUpperCase() + stat.slice(1),
        current,
        previous,
        twoAgo,
        delta: previous !== null ? Math.round(current - previous) : null,
        trend: twoAgo !== null && previous !== null
          ? Math.round(previous - twoAgo)
          : null,
      };
    });

    // Top improvements (biggest positive deltas)
    const improvements = statDeltas
      .filter((s) => s.delta !== null && s.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 3);

    // Areas to improve (negative or zero deltas)
    const areasToImprove = statDeltas
      .filter((s) => s.delta !== null && s.delta <= 0)
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 3);

    // XP progress
    const xpThisWeek = thisWeekSnap?.xp ?? profile?.xp ?? 0;
    const xpLastWeek = lastWeekSnap?.xp ?? 0;

    // Overall grade
    const positiveDeltas = statDeltas.filter((s) => s.delta !== null && s.delta > 0).length;
    const totalCompared = statDeltas.filter((s) => s.delta !== null).length;
    const gradePercent = totalCompared > 0 ? positiveDeltas / totalCompared : 0.5;
    let grade, gradeColor, gradeEmoji;
    if (gradePercent >= 0.75) { grade = "A"; gradeColor = "text-green-400"; gradeEmoji = "🌟"; }
    else if (gradePercent >= 0.5) { grade = "B"; gradeColor = "text-blue-400"; gradeEmoji = "👍"; }
    else if (gradePercent >= 0.25) { grade = "C"; gradeColor = "text-amber-400"; gradeEmoji = "📈"; }
    else { grade = "Needs Work"; gradeColor = "text-red-400"; gradeEmoji = "💪"; }

    // Top badges earned this week
    const badgesEarned = (profile?.badges || []).slice(-3);

    return {
      thisWeekSnap,
      lastWeekSnap,
      statDeltas,
      improvements,
      areasToImprove,
      xpThisWeek,
      xpLastWeek,
      thisWeekTraining,
      lastWeekTraining,
      thisWeekDrills,
      lastWeekDrills,
      thisWeekWater,
      lastWeekWater,
      thisWeekQuests,
      lastWeekQuests,
      grade,
      gradeColor,
      gradeEmoji,
      badgesEarned,
      hasData: !!lastWeekSnap,
    };
  }, [snapshots, dailyLogs, profile, currentWeekStart, lastWeekStart, twoWeeksAgo]);

  if (loadingSnaps || loadingLogs) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary.hasData) {
    return (
      <div className="rounded-xl bg-card border border-dashed border-primary/20 p-6 text-center">
        <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-heading font-bold text-muted-foreground">Weekly Summary Coming Soon</p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete training sessions this week. Your first weekly summary will appear next Monday.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border p-4 space-y-4"
    >
      {/* Header + Grade */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Weekly Summary
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{summary.gradeEmoji}</span>
          <span className={`font-heading font-bold text-lg ${summary.gradeColor}`}>{summary.grade}</span>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-lg bg-secondary/50 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">XP</p>
          <p className="text-sm font-heading font-bold text-accent">+{summary.xpThisWeek - summary.xpLastWeek}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Drills</p>
          <p className="text-sm font-heading font-bold text-foreground">{summary.thisWeekDrills}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Water</p>
          <p className="text-sm font-heading font-bold text-blue-400">{Math.round(summary.thisWeekWater / 1000)}L</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Quests</p>
          <p className="text-sm font-heading font-bold text-green-400">{summary.thisWeekQuests}</p>
        </div>
      </div>

      {/* Top Improvements */}
      {summary.improvements.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            <p className="text-xs font-semibold text-green-400">Biggest Improvements</p>
          </div>
          <div className="space-y-1.5">
            {summary.improvements.map((s) => (
              <div key={s.stat} className="flex items-center justify-between bg-green-500/5 rounded-lg px-3 py-2 border border-green-500/10">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STAT_COLORS[s.stat] }} />
                  <span className="text-xs font-medium capitalize">{s.label}</span>
                </div>
                <span className="text-xs font-heading font-bold text-green-400">+{s.delta}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Areas to Improve */}
      {summary.areasToImprove.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-xs font-semibold text-amber-400">Focus Areas This Week</p>
          </div>
          <div className="space-y-1.5">
            {summary.areasToImprove.map((s) => (
              <div key={s.stat} className="flex items-center justify-between bg-amber-500/5 rounded-lg px-3 py-2 border border-amber-500/10">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STAT_COLORS[s.stat] }} />
                  <span className="text-xs font-medium capitalize">{s.label}</span>
                </div>
                <span className="text-xs font-heading font-bold text-amber-400">
                  {s.delta < 0 ? s.delta : `+${s.delta}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison vs Last Week */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">vs Last Week</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Training XP</span>
            <span className={summary.thisWeekTraining >= summary.lastWeekTraining ? "text-green-400" : "text-red-400"}>
              {summary.thisWeekTraining >= summary.lastWeekTraining ? "↑" : "↓"} {summary.thisWeekTraining} vs {summary.lastWeekTraining}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Drills</span>
            <span className={summary.thisWeekDrills >= summary.lastWeekDrills ? "text-green-400" : "text-red-400"}>
              {summary.thisWeekDrills >= summary.lastWeekDrills ? "↑" : "↓"} {summary.thisWeekDrills} vs {summary.lastWeekDrills}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Water (L)</span>
            <span className={summary.thisWeekWater >= summary.lastWeekWater ? "text-green-400" : "text-red-400"}>
              {summary.thisWeekWater >= summary.lastWeekWater ? "↑" : "↓"} {Math.round(summary.thisWeekWater / 1000)} vs {Math.round(summary.lastWeekWater / 1000)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quests</span>
            <span className={summary.thisWeekQuests >= summary.lastWeekQuests ? "text-green-400" : "text-red-400"}>
              {summary.thisWeekQuests >= summary.lastWeekQuests ? "↑" : "↓"} {summary.thisWeekQuests} vs {summary.lastWeekQuests}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Badges */}
      {summary.badgesEarned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Latest Badges</p>
          <div className="flex gap-2">
            {summary.badgesEarned.map((badgeId) => {
              const badge = BADGES[badgeId];
              if (!badge) return null;
              return (
                <div key={badgeId} className="flex items-center gap-1.5 bg-secondary/50 rounded-lg px-2.5 py-1.5">
                  <span className="text-base">{badge.icon}</span>
                  <span className="text-xs font-medium">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}