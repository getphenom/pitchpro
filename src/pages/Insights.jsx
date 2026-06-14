import { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, differenceInDays } from "date-fns";
import { Loader2, Flame, Droplets, Dumbbell, TrendingUp, Zap, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { getLevel } from "@/lib/gameData";

const today = format(new Date(), "yyyy-MM-dd");
const DAYS = 90;

function getIntensity(value, max, type) {
  if (!value || value <= 0) return 0;
  if (type === "water") {
    const ratio = value / max;
    if (ratio >= 1) return 4;
    if (ratio >= 0.75) return 3;
    if (ratio >= 0.5) return 2;
    return 1;
  }
  if (type === "xp") {
    if (value >= 80) return 4;
    if (value >= 50) return 3;
    if (value >= 25) return 2;
    return 1;
  }
  if (type === "drills") {
    if (value >= 4) return 4;
    if (value >= 3) return 3;
    if (value >= 2) return 2;
    return 1;
  }
  return 0;
}

const INTENSITY_COLORS = {
  training: ["bg-secondary/30", "bg-green-900/30", "bg-green-700/40", "bg-green-600/60", "bg-green-500"],
  hydration: ["bg-secondary/30", "bg-blue-900/30", "bg-blue-700/40", "bg-blue-600/60", "bg-blue-500"],
};

export default function Insights() {
  const { data: profiles, isLoading: loadingProfile } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const startDate = format(subDays(new Date(), DAYS - 1), "yyyy-MM-dd");

  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["insights-logs", startDate],
    queryFn: () => base44.entities.DailyLog.filter({ date: { $gte: startDate } }, "-date", 100),
    enabled: !!profile,
  });

  const dayMap = useMemo(() => {
    const map = {};
    logs.forEach((log) => {
      map[log.date] = log;
    });
    return map;
  }, [logs]);

  const days = useMemo(() => {
    const result = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const log = dayMap[date];
      result.push({
        date,
        dayOfWeek: new Date(date + "T00:00:00").getDay(),
        xp: log?.xp_earned_today || 0,
        waterMl: log?.water_ml || 0,
        drillsCompleted: log?.training_completed?.length || 0,
        questsCompleted: log?.quests_completed?.length || 0,
        hasActivity: !!(log?.xp_earned_today || log?.water_ml || log?.training_completed?.length),
      });
    }
    return result;
  }, [dayMap]);

  // Build weeks grid (columns)
  const weeks = useMemo(() => {
    const w = [];
    let currentWeek = [];
    days.forEach((day) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6 || currentWeek.length === 7) {
        while (currentWeek.length < 7) currentWeek.unshift(null);
        w.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.unshift(null);
      w.push(currentWeek);
    }
    return w;
  }, [days]);

  // Max values for scaling
  const maxXp = Math.max(...days.map((d) => d.xp), 1);
  const maxWater = Math.max(...days.map((d) => d.waterMl), 250);
  const maxDrills = Math.max(...days.map((d) => d.drillsCompleted), 1);

  // Streak stats
  const { currentStreak, longestStreak, totalActiveDays, totalXp, totalWater } = useMemo(() => {
    let cs = 0;
    let ls = 0;
    let active = 0;
    let xpSum = 0;
    let waterSum = 0;

    // Current streak (from today backwards)
    for (let i = 0; i < days.length; i++) {
      if (days[i].hasActivity) {
        cs++;
      } else {
        if (i < days.length - 1) cs = 0;
      }
    }

    // Longest streak
    let temp = 0;
    days.forEach((d) => {
      if (d.hasActivity) {
        temp++;
        if (temp > ls) ls = temp;
        active++;
      } else {
        temp = 0;
      }
      xpSum += d.xp;
      waterSum += d.waterMl;
    });

    return { currentStreak: cs, longestStreak: ls, totalActiveDays: active, totalXp: xpSum, totalWater: waterSum };
  }, [days]);

  // Hydration streak
  const hydrationDays = useMemo(() => {
    let hs = 0;
    let hLongest = 0;
    let temp = 0;
    days.forEach((d) => {
      if (d.waterMl >= 500) {
        temp++;
        if (temp > hLongest) hLongest = temp;
        hs = temp;
      } else {
        temp = 0;
      }
    });
    // Check if current streak is still going (last day had water)
    const last = days[days.length - 1];
    if (!last || last.waterMl < 500) hs = 0;
    else {
      hs = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].waterMl >= 500) hs++;
        else break;
      }
    }
    return { current: hs, longest: hLongest };
  }, [days]);

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loadingProfile || loadingLogs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-heading font-bold">Insights</h1>
          <p className="text-xs text-muted-foreground mt-1">Your 90-day activity at a glance</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Days</span>
            </div>
            <p className="text-2xl font-heading font-bold">{totalActiveDays}<span className="text-sm text-muted-foreground font-normal">/{DAYS}</span></p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{Math.round((totalActiveDays / DAYS) * 100)}% consistency</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total XP</span>
            </div>
            <p className="text-2xl font-heading font-bold text-accent">{totalXp.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Level {getLevel(profile.xp || 0)}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Best Streak</span>
            </div>
            <p className="text-2xl font-heading font-bold">{longestStreak}<span className="text-sm text-muted-foreground font-normal"> days</span></p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Current: {currentStreak} days</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Water</span>
            </div>
            <p className="text-2xl font-heading font-bold">{(totalWater / 1000).toFixed(1)}<span className="text-sm text-muted-foreground font-normal">L</span></p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{hydrationDays.current} day hydration streak</p>
          </div>
        </motion.div>

        {/* Training Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-card border border-border p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-green-400" />
              <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
                Training Activity
              </h3>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-muted-foreground mr-1">Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div key={lvl} className={`w-3 h-3 rounded-sm ${INTENSITY_COLORS.training[lvl]}`} />
              ))}
              <span className="text-[9px] text-muted-foreground ml-1">More</span>
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-0.5 min-w-fit">
              {/* Day labels column */}
              <div className="flex flex-col gap-0.5 mr-1 justify-center">
                {DAY_LABELS.map((label, i) => (
                  <div key={i} className="h-3.5 flex items-center">
                    <span className="text-[8px] text-muted-foreground leading-none">{label}</span>
                  </div>
                ))}
              </div>
              {/* Weeks */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className="w-3.5 h-3.5 rounded-sm" />;
                    const intensity = getIntensity(day.drillsCompleted, maxDrills, "drills");
                    const isToday = day.date === today;
                    return (
                      <div
                        key={di}
                        title={`${format(new Date(day.date + "T00:00:00"), "MMM d")}: ${day.drillsCompleted} drills, ${day.xp} XP`}
                        className={`w-3.5 h-3.5 rounded-sm ${INTENSITY_COLORS.training[intensity]} transition-colors ${
                          isToday ? "ring-1 ring-primary/50" : ""
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] text-muted-foreground">
            <span>{format(subDays(new Date(), DAYS - 1), "MMM d")}</span>
            <span>{format(new Date(), "MMM d, yyyy")}</span>
          </div>
        </motion.div>

        {/* Hydration Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-card border border-border p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
                Hydration
              </h3>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-muted-foreground mr-1">Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div key={lvl} className={`w-3 h-3 rounded-sm ${INTENSITY_COLORS.hydration[lvl]}`} />
              ))}
              <span className="text-[9px] text-muted-foreground ml-1">More</span>
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-0.5 min-w-fit">
              <div className="flex flex-col gap-0.5 mr-1 justify-center">
                {DAY_LABELS.map((label, i) => (
                  <div key={i} className="h-3.5 flex items-center">
                    <span className="text-[8px] text-muted-foreground leading-none">{label}</span>
                  </div>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className="w-3.5 h-3.5 rounded-sm" />;
                    const intensity = getIntensity(day.waterMl, maxWater, "water");
                    const isToday = day.date === today;
                    return (
                      <div
                        key={di}
                        title={`${format(new Date(day.date + "T00:00:00"), "MMM d")}: ${Math.floor(day.waterMl / 250)} glasses`}
                        className={`w-3.5 h-3.5 rounded-sm ${INTENSITY_COLORS.hydration[intensity]} transition-colors ${
                          isToday ? "ring-1 ring-blue-400/50" : ""
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] text-muted-foreground">
            <span>{format(subDays(new Date(), DAYS - 1), "MMM d")}</span>
            <span>{format(new Date(), "MMM d, yyyy")}</span>
          </div>
        </motion.div>

        {/* XP Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-card border border-border p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
                XP Earned
              </h3>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-muted-foreground mr-1">Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div key={lvl} className={`w-3 h-3 rounded-sm ${lvl === 0 ? "bg-secondary/30" : lvl === 1 ? "bg-amber-900/30" : lvl === 2 ? "bg-amber-700/40" : lvl === 3 ? "bg-amber-600/60" : "bg-amber-500"}`} />
              ))}
              <span className="text-[9px] text-muted-foreground ml-1">More</span>
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-0.5 min-w-fit">
              <div className="flex flex-col gap-0.5 mr-1 justify-center">
                {DAY_LABELS.map((label, i) => (
                  <div key={i} className="h-3.5 flex items-center">
                    <span className="text-[8px] text-muted-foreground leading-none">{label}</span>
                  </div>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className="w-3.5 h-3.5 rounded-sm" />;
                    const intensity = getIntensity(day.xp, maxXp, "xp");
                    const isToday = day.date === today;
                    return (
                      <div
                        key={di}
                        title={`${format(new Date(day.date + "T00:00:00"), "MMM d")}: ${day.xp} XP`}
                        className={`w-3.5 h-3.5 rounded-sm ${
                          intensity === 0 ? "bg-secondary/30" : intensity === 1 ? "bg-amber-900/30" : intensity === 2 ? "bg-amber-700/40" : intensity === 3 ? "bg-amber-600/60" : "bg-amber-500"
                        } transition-colors ${isToday ? "ring-1 ring-amber-400/50" : ""}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] text-muted-foreground">
            <span>{format(subDays(new Date(), DAYS - 1), "MMM d")}</span>
            <span>{format(new Date(), "MMM d, yyyy")}</span>
          </div>
        </motion.div>

        {/* Motivation */}
        {totalActiveDays > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20 p-5 text-center"
          >
            <Flame className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="font-heading font-bold text-sm">
              {currentStreak >= 7
                ? `🔥 ${currentStreak} day streak! You're on fire!`
                : longestStreak >= 14
                ? `Your best was ${longestStreak} days — you can beat it!`
                : totalActiveDays >= 60
                ? `You've been active ${Math.round((totalActiveDays / DAYS) * 100)}% of days — incredible consistency!`
                : `Keep showing up. Every day counts.`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalActiveDays} active days out of the last {DAYS}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}