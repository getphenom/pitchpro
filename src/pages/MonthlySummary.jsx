import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, startOfMonth, subMonths, differenceInDays } from "date-fns";
import { Loader2, Trophy, TrendingUp, TrendingDown, Target, Sparkles, Zap, Award, AlertCircle, ChevronRight, BarChart3, Activity, Brain, Apple, Moon } from "lucide-react";
import { STAT_COLORS, POSITION_LABELS } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const STAT_NAMES = ["pace", "shooting", "passing", "dribbling", "defending", "physical", "mental", "tactical"];
const STAT_LABELS = { pace: "Pace", shooting: "Shooting", passing: "Passing", dribbling: "Dribbling", defending: "Defending", physical: "Physical", mental: "Mental", tactical: "Tactical" };

const PILLARS = [
  { key: "technical", label: "Technical", icon: "⚽", color: "#22c55e", stats: ["pace", "shooting", "passing", "dribbling"], categories: ["technical"] },
  { key: "physical", label: "Physical", icon: "💪", color: "#ef4444", stats: ["physical"], categories: ["physical"] },
  { key: "tactical", label: "Tactical", icon: "📋", color: "#f97316", stats: ["defending", "tactical"], categories: ["tactical"] },
  { key: "mental", label: "Mental", icon: "🧠", color: "#06b6d4", stats: ["mental"], categories: [] },
  { key: "nutrition", label: "Nutrition", icon: "🥗", color: "#a855f7", stats: [], categories: [] },
  { key: "recovery", label: "Recovery", icon: "🛌", color: "#8b5cf6", stats: [], categories: [] },
];

export default function MonthlySummary() {
  const [insights, setInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const twoMonthsAgo = format(startOfMonth(subMonths(new Date(), 2)), "yyyy-MM-dd");

  const { data: profiles, isLoading: loadingProfile } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });
  const profile = profiles?.[0];

  const { data: snapshots = [], isLoading: loadingSnaps } = useQuery({
    queryKey: ["stat-snapshots-monthly", profile?.id],
    queryFn: () => base44.entities.StatSnapshot.filter({ player_id: profile.id }, "-week_start", 30),
    enabled: !!profile,
  });

  const { data: dailyLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["daily-logs-monthly", profile?.id],
    queryFn: () => base44.entities.DailyLog.filter({ player_id: profile.id }, "-date", 60),
    enabled: !!profile,
  });

  // Filter to this month and last month
  const thisMonthLogs = useMemo(() => dailyLogs.filter((l) => l.date >= monthStart), [dailyLogs, monthStart]);
  const lastMonthLogs = useMemo(() => {
    const lastStart = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
    return dailyLogs.filter((l) => l.date >= lastStart && l.date < monthStart);
  }, [dailyLogs, monthStart]);

  const thisMonthSnaps = useMemo(() => snapshots.filter((s) => s.week_start >= monthStart).sort((a, b) => a.week_start.localeCompare(b.week_start)), [snapshots, monthStart]);
  const lastMonthSnaps = useMemo(() => {
    const lastStart = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
    return snapshots.filter((s) => s.week_start >= lastStart && s.week_start < monthStart).sort((a, b) => a.week_start.localeCompare(b.week_start));
  }, [snapshots, monthStart]);

  // --- Pillar analysis ---
  const pillarAnalysis = useMemo(() => {
    // Stat-based: compare average stats this month vs last month for each pillar
    const statDeltas = {};
    STAT_NAMES.forEach((stat) => {
      const thisVals = thisMonthSnaps.map((s) => s.stats?.[stat] || 50);
      const lastVals = lastMonthSnaps.map((s) => s.stats?.[stat] || 50);
      const thisAvg = thisVals.length > 0 ? thisVals.reduce((a, b) => a + b, 0) / thisVals.length : (profile?.stats?.[stat] || 50);
      const lastAvg = lastVals.length > 0 ? lastVals.reduce((a, b) => a + b, 0) / lastVals.length : thisAvg;
      statDeltas[stat] = { current: Math.round(thisAvg), previous: Math.round(lastAvg), delta: Math.round(thisAvg - lastAvg) };
    });

    // Activity-based: count completed training by category from daily logs
    const categoryCounts = { technical: 0, physical: 0, tactical: 0 };
    const lastCategoryCounts = { technical: 0, physical: 0, tactical: 0 };
    thisMonthLogs.forEach((log) => {
      (log.training_completed || []).filter((t) => t.completed).forEach((t) => {
        if (categoryCounts[t.category] !== undefined) categoryCounts[t.category] += 1;
      });
    });
    lastMonthLogs.forEach((log) => {
      (log.training_completed || []).filter((t) => t.completed).forEach((t) => {
        if (lastCategoryCounts[t.category] !== undefined) lastCategoryCounts[t.category] += 1;
      });
    });

    // Mental / nutrition / recovery from daily logs
    const mentalCount = thisMonthLogs.filter((l) => l.mental_session_done).length;
    const lastMentalCount = lastMonthLogs.filter((l) => l.mental_session_done).length;
    const nutritionCount = thisMonthLogs.filter((l) => l.meals_logged?.some((m) => m.completed)).length;
    const lastNutritionCount = lastMonthLogs.filter((l) => l.meals_logged?.some((m) => m.completed)).length;
    const recoveryCount = thisMonthLogs.filter((l) => l.sleep_hours >= 7).length;
    const lastRecoveryCount = lastMonthLogs.filter((l) => l.sleep_hours >= 7).length;

    // Build pillar scores
    const pillars = PILLARS.map((p) => {
      // Stat contribution (normalized 0-10)
      const statContribs = p.stats.map((s) => statDeltas[s]?.delta || 0);
      const statScore = p.stats.length > 0 ? statContribs.reduce((a, b) => a + b, 0) / p.stats.length : 0;

      // Activity contribution (normalized 0-10)
      let activityScore = 0;
      if (p.key === "mental") {
        activityScore = (mentalCount - lastMentalCount) * 3;
      } else if (p.key === "nutrition") {
        activityScore = (nutritionCount - lastNutritionCount) * 3;
      } else if (p.key === "recovery") {
        activityScore = (recoveryCount - lastRecoveryCount) * 3;
      } else {
        const catContrib = p.categories.reduce((s, c) => s + (categoryCounts[c] || 0), 0);
        const lastCatContrib = p.categories.reduce((s, c) => s + (lastCategoryCounts[c] || 0), 0);
        activityScore = (catContrib - lastCatContrib) * 2;
      }

      const total = Math.round(Math.max(-10, Math.min(10, statScore + activityScore)) * 10) / 10;

      // Current value (0-100)
      const currentStatVals = p.stats.map((s) => statDeltas[s]?.current || 50);
      const currentStatAvg = p.stats.length > 0 ? currentStatVals.reduce((a, b) => a + b, 0) / p.stats.length : null;
      const currentActivity = p.key === "mental" ? (mentalCount > 0 ? 70 : 40)
        : p.key === "nutrition" ? (nutritionCount > 0 ? 70 : 40)
        : p.key === "recovery" ? (recoveryCount > 0 ? 70 : 40)
        : (p.categories.reduce((s, c) => s + (categoryCounts[c] || 0), 0) > 0 ? 70 : 40);
      const currentScore = currentStatAvg !== null ? Math.round((currentStatAvg + currentActivity) / 2) : currentActivity;

      return {
        ...p,
        statDeltas: p.stats.map((s) => ({ stat: s, ...statDeltas[s] })),
        statScore,
        activityScore,
        total,
        currentScore,
        activityCount: p.key === "mental" ? mentalCount
          : p.key === "nutrition" ? nutritionCount
          : p.key === "recovery" ? recoveryCount
          : p.categories.reduce((s, c) => s + (categoryCounts[c] || 0), 0),
      };
    });

    const sorted = [...pillars].sort((a, b) => b.total - a.total);
    return {
      pillars,
      topPillar: sorted[0],
      focusPillar: sorted[sorted.length - 1],
      statDeltas,
      categoryCounts,
      mentalCount,
      nutritionCount,
      recoveryCount,
      thisMonthXP: thisMonthLogs.reduce((s, l) => s + (l.xp_earned_today || 0), 0),
      lastMonthXP: lastMonthLogs.reduce((s, l) => s + (l.xp_earned_today || 0), 0),
      thisMonthDrills: thisMonthLogs.reduce((s, l) => s + (l.training_completed?.filter((t) => t.completed)?.length || 0), 0),
      lastMonthDrills: lastMonthLogs.reduce((s, l) => s + (l.training_completed?.filter((t) => t.completed)?.length || 0), 0),
      activeDays: new Set(thisMonthLogs.map((l) => l.date)).size,
      totalDays: differenceInDays(new Date(), new Date(monthStart + "T00:00:00")) + 1,
    };
  }, [thisMonthLogs, lastMonthLogs, thisMonthSnaps, lastMonthSnaps, profile]);

  const generateInsights = async () => {
    setLoadingAI(true);
    const a = pillarAnalysis;
    const prompt = `Analyze this soccer player's monthly training data and provide a concise, motivational summary:

Player: ${profile?.age}-year-old ${POSITION_LABELS[profile?.position] || "soccer player"}, ${profile?.skill_level} level

Top Pillar: ${a.topPillar?.label} (score: ${a.topPillar?.total > 0 ? "+" : ""}${a.topPillar?.total})
Focus Pillar: ${a.focusPillar?.label} (score: ${a.focusPillar?.total})

XP: ${a.thisMonthXP} this month vs ${a.lastMonthXP} last month
Drills completed: ${a.thisMonthDrills} this month vs ${a.lastMonthDrills} last month
Active days: ${a.activeDays} out of ${a.totalDays}

Pillar details:
${a.pillars.map((p) => `- ${p.label}: score ${p.total > 0 ? "+" : ""}${p.total}, current ${p.currentScore}/100, ${p.activityCount} activities`).join("\n")}

Stat changes this month:
${STAT_NAMES.map((s) => `- ${STAT_LABELS[s]}: ${a.statDeltas[s]?.current} (${a.statDeltas[s]?.delta >= 0 ? "+" : ""}${a.statDeltas[s]?.delta})`).join("\n")}

Provide:
1. A one-sentence celebration of their top pillar
2. A one-sentence actionable suggestion for their focus pillar
3. A fun, short "mission" for next month related to their focus area
4. A motivational grade (A through F) for the month

Write like a supportive soccer coach talking to a young athlete. Keep it short and punchy.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          celebration: { type: "string" },
          focus_suggestion: { type: "string" },
          next_month_mission: { type: "string" },
          grade: { type: "string" },
        },
      },
    });
    setInsights(result);
    setLoadingAI(false);
  };

  if (loadingProfile || loadingSnaps || loadingLogs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!profile) return null;

  const a = pillarAnalysis;
  const monthLabel = format(new Date(), "MMMM yyyy");
  const monthLabelShort = format(new Date(), "MMM yyyy");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold">Monthly Summary</h1>
              <p className="text-xs text-muted-foreground mt-1">{monthLabel}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <Zap className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-lg font-heading font-bold text-accent">{a.thisMonthXP}</p>
            <p className="text-[10px] text-muted-foreground">XP Earned</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <Target className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-heading font-bold text-primary">{a.thisMonthDrills}</p>
            <p className="text-[10px] text-muted-foreground">Drills Done</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <Activity className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-heading font-bold text-blue-400">{a.activeDays}/{a.totalDays}</p>
            <p className="text-[10px] text-muted-foreground">Active Days</p>
          </div>
        </motion.div>

        {/* Top Pillar & Focus Pillar */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="rounded-xl bg-card border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Trophy className="w-4 h-4 text-green-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-green-400">Excelling In</p>
            </div>
            <p className="text-2xl mb-1">{a.topPillar?.icon}</p>
            <p className="font-heading font-bold text-sm">{a.topPillar?.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {a.topPillar?.total > 0 ? "+" : ""}{a.topPillar?.total} trend
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="rounded-xl bg-card border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Focus Area</p>
            </div>
            <p className="text-2xl mb-1">{a.focusPillar?.icon}</p>
            <p className="font-heading font-bold text-sm">{a.focusPillar?.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {a.focusPillar?.total > 0 ? "+" : ""}{a.focusPillar?.total} trend
            </p>
          </motion.div>
        </div>

        {/* Pillar Breakdown */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">Pillar Breakdown</h3>
          </div>
          <div className="space-y-3">
            {a.pillars.map((p) => {
              const barColor = p.total >= 0 ? p.color : "#ef4444";
              const barWidth = Math.min(100, Math.max(5, 50 + p.total * 5));
              return (
                <div key={p.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span>{p.icon}</span>
                      <span className="font-medium">{p.label}</span>
                    </div>
                    <span className="font-heading font-bold" style={{ color: barColor }}>
                      {p.total > 0 ? "+" : ""}{p.total}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, backgroundColor: barColor }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Score: {p.currentScore}/100</span>
                    <span>{p.activityCount} activities</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Stat Changes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">Stat Changes</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {STAT_NAMES.map((stat) => {
              const d = a.statDeltas[stat];
              const isUp = d?.delta > 0;
              const isDown = d?.delta < 0;
              return (
                <div key={stat} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STAT_COLORS[stat] }} />
                    <span className="text-xs capitalize">{STAT_LABELS[stat]}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-heading font-bold">
                    <span>{d?.current}</span>
                    {isUp && <TrendingUp className="w-3 h-3 text-green-400" />}
                    {isDown && <TrendingDown className="w-3 h-3 text-red-400" />}
                    <span className={isUp ? "text-green-400" : isDown ? "text-red-400" : "text-muted-foreground"}>
                      {d?.delta > 0 ? "+" : ""}{d?.delta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Comparison vs Last Month */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl bg-card border border-border p-4">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground mb-3">
            vs {format(subMonths(new Date(), 1), "MMM yyyy")}
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">XP Earned</span>
              <span className={a.thisMonthXP >= a.lastMonthXP ? "text-green-400" : "text-red-400"}>
                {a.thisMonthXP >= a.lastMonthXP ? "↑" : "↓"} {a.thisMonthXP} vs {a.lastMonthXP}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Drills</span>
              <span className={a.thisMonthDrills >= a.lastMonthDrills ? "text-green-400" : "text-red-400"}>
                {a.thisMonthDrills >= a.lastMonthDrills ? "↑" : "↓"} {a.thisMonthDrills} vs {a.lastMonthDrills}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mental Sessions</span>
              <span className={a.mentalCount >= (a.pillarAnalysis?.lastMentalCount || 0) ? "text-green-400" : "text-red-400"}>
                {a.mentalCount} this month
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recovery Days</span>
              <span>{a.recoveryCount} (7h+ sleep)</span>
            </div>
          </div>
        </motion.div>

        {/* AI Coach Insights */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-xl bg-card border border-border p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">Coach Insights</h3>
          </div>

          {loadingAI ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing your month...</p>
            </div>
          ) : insights ? (
            <div className="space-y-3">
              {/* Grade */}
              <div className="text-center py-3">
                <p className="text-4xl font-heading font-bold" style={{ color: insights.grade === "A" ? "#22c55e" : insights.grade === "B" ? "#3b82f6" : insights.grade === "C" ? "#f97316" : "#ef4444" }}>
                  {insights.grade}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Monthly Grade</p>
              </div>
              {/* Celebration */}
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                <div className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{insights.celebration}</p>
                </div>
              </div>
              {/* Focus */}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{insights.focus_suggestion}</p>
                </div>
              </div>
              {/* Mission */}
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{insights.next_month_mission}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs" onClick={() => setInsights(null)}>
                Regenerate
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Get a personalized AI breakdown of your month — what you crushed, what needs work, and your mission for next month.
              </p>
              <Button onClick={generateInsights} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Sparkles className="w-4 h-4 mr-2" /> Analyze My Month
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}