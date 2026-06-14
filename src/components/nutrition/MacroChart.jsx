import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, addWeeks, subDays, parseISO, isWithinInterval } from "date-fns";
import { Loader2, TrendingUp, Beef, Wheat, Droplets, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MACRO_COLORS = {
  protein: { bg: "bg-red-500", label: "Protein", icon: Beef, color: "#ef4444" },
  carbs: { bg: "bg-amber-500", label: "Carbs", icon: Wheat, color: "#f59e0b" },
  fat: { bg: "bg-blue-500", label: "Fat", icon: Droplets, color: "#3b82f6" },
};

function WeeklyBar({ macros, maxValue }) {
  return (
    <div className="flex items-end gap-1 h-28">
      {["protein", "carbs", "fat"].map((key) => {
        const cfg = MACRO_COLORS[key];
        const val = macros[key] || 0;
        const pct = maxValue > 0 ? (val / maxValue) * 100 : 0;
        return (
          <div key={key} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] font-mono font-semibold text-muted-foreground">{Math.round(val)}</span>
            <div className="w-full rounded-t-md transition-all duration-500" style={{
              height: `${Math.max(pct, 2)}%`,
              backgroundColor: cfg.color,
              minHeight: val > 0 ? 8 : 2,
            }} />
          </div>
        );
      })}
    </div>
  );
}

export default function MacroChart({ profile }) {
  const [expanded, setExpanded] = useState(false);
  const [targetTab, setTargetTab] = useState("weekly");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["macro-logs", profile?.id],
    queryFn: () => base44.entities.DailyLog.filter(
      { player_id: profile.id },
      "-date",
      90
    ),
    enabled: !!profile?.id,
  });

  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  const recentLogs = useMemo(() =>
    logs.filter((l) => {
      const d = parseISO(l.date);
      return isWithinInterval(d, { start: thirtyDaysAgo, end: today });
    }).sort((a, b) => a.date.localeCompare(b.date)),
  [logs]);

  // Group by ISO week
  const weeklyData = useMemo(() => {
    const weeks = {};
    recentLogs.forEach((log) => {
      const d = parseISO(log.date);
      const weekKey = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
      if (!weeks[weekKey]) weeks[weekKey] = { protein: 0, carbs: 0, fat: 0, count: 0 };
      weeks[weekKey].protein += log.protein_g || 0;
      weeks[weekKey].carbs += log.carbs_g || 0;
      weeks[weekKey].fat += log.fat_g || 0;
      weeks[weekKey].count += 1;
    });

    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, data]) => ({
        week: format(parseISO(week), "MMM d"),
        protein: Math.round((data.protein / Math.max(data.count, 1)) * 10) / 10,
        carbs: Math.round((data.carbs / Math.max(data.count, 1)) * 10) / 10,
        fat: Math.round((data.fat / Math.max(data.count, 1)) * 10) / 10,
        totalDays: data.count,
      }));
  }, [recentLogs]);

  // Daily data (last 14 days for daily view)
  const dailyData = useMemo(() =>
    recentLogs.slice(-14).map((log) => ({
      date: format(parseISO(log.date), "MMM d"),
      protein: log.protein_g || 0,
      carbs: log.carbs_g || 0,
      fat: log.fat_g || 0,
    })),
  [recentLogs]);

  // Calculate 30-day averages
  const averages = useMemo(() => {
    const totalDays = recentLogs.length || 1;
    return {
      protein: Math.round(recentLogs.reduce((s, l) => s + (l.protein_g || 0), 0) / totalDays),
      carbs: Math.round(recentLogs.reduce((s, l) => s + (l.carbs_g || 0), 0) / totalDays),
      fat: Math.round(recentLogs.reduce((s, l) => s + (l.fat_g || 0), 0) / totalDays),
    };
  }, [recentLogs]);

  const maxWeekly = Math.max(...weeklyData.map((w) => Math.max(w.protein, w.carbs, w.fat)), 1);
  const maxDaily = Math.max(...dailyData.map((d) => Math.max(d.protein, d.carbs, d.fat)), 1);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!recentLogs.length) {
    return (
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Macro Intake (30 Days)
          </h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">
          No macro data yet. Log your protein, carbs, and fat intake daily to see your trends here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Macro Intake (30 Days)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {["protein", "carbs", "fat"].map((key) => {
              const Icon = MACRO_COLORS[key].icon;
              return (
                <div key={key} className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Icon className="w-3 h-3" style={{ color: MACRO_COLORS[key].color }} />
                  {averages[key]}
                </div>
              );
            })}
            <span className="text-[9px] text-muted-foreground/60 mx-1">g/day avg</span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              <Tabs value={targetTab} onValueChange={setTargetTab}>
                <TabsList className="w-full bg-secondary h-8">
                  <TabsTrigger value="weekly" className="flex-1 text-[10px]">Weekly Avg</TabsTrigger>
                  <TabsTrigger value="daily" className="flex-1 text-[10px]">Daily (14d)</TabsTrigger>
                </TabsList>

                <TabsContent value="weekly" className="mt-3 space-y-3">
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 text-[10px]">
                    {["protein", "carbs", "fat"].map((key) => {
                      const Icon = MACRO_COLORS[key].icon;
                      return (
                        <div key={key} className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MACRO_COLORS[key].color }} />
                          <Icon className="w-3 h-3" style={{ color: MACRO_COLORS[key].color }} />
                          <span className="text-muted-foreground">{MACRO_COLORS[key].label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weekly bars */}
                  <div className="space-y-2">
                    {weeklyData.map((week, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground w-12 text-right flex-shrink-0">
                          {week.week}
                          <span className="block text-[8px] opacity-50">{week.totalDays}d</span>
                        </span>
                        <div className="flex-1">
                          <WeeklyBar macros={week} maxValue={maxWeekly} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 30-day average summary */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    {["protein", "carbs", "fat"].map((key) => {
                      const Icon = MACRO_COLORS[key].icon;
                      return (
                        <div key={key} className="rounded-lg bg-secondary/30 p-2.5 text-center">
                          <Icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: MACRO_COLORS[key].color }} />
                          <p className="text-sm font-heading font-bold" style={{ color: MACRO_COLORS[key].color }}>
                            {averages[key]}
                          </p>
                          <p className="text-[9px] text-muted-foreground">g/day avg</p>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="daily" className="mt-3 space-y-2">
                  {dailyData.map((day, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground w-12 text-right flex-shrink-0">{day.date}</span>
                      <div className="flex-1 flex items-end gap-1 h-14">
                        {["protein", "carbs", "fat"].map((key) => {
                          const cfg = MACRO_COLORS[key];
                          const val = day[key] || 0;
                          const pct = maxDaily > 0 ? (val / maxDaily) * 100 : 0;
                          return (
                            <div key={key} className="flex-1 flex flex-col items-center gap-0.5">
                              <span className="text-[8px] font-mono text-muted-foreground">{Math.round(val)}</span>
                              <div className="w-full rounded-t-sm" style={{
                                height: `${Math.max(pct, 2)}%`,
                                backgroundColor: cfg.color,
                                minHeight: val > 0 ? 6 : 1,
                              }} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {dailyData.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No daily data in the last 14 days.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}