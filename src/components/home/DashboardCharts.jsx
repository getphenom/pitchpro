import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, subWeeks, addWeeks } from "date-fns";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend, Cell } from "recharts";
import { Loader2, TrendingUp, BarChart3, Activity, ChevronDown, Zap, Target, Brain, Dumbbell, Apple, Moon, Map } from "lucide-react";
import { STAT_COLORS } from "@/lib/gameData";
import { motion } from "framer-motion";

const STAT_NAMES = ["pace", "shooting", "passing", "dribbling", "defending", "physical", "mental", "tactical"];
const STAT_LABELS_CAP = { pace: "Pace", shooting: "Shooting", passing: "Passing", dribbling: "Dribbling", defending: "Defending", physical: "Physical", mental: "Mental", tactical: "Tactical" };

const PILLARS = [
  { key: "technical", label: "Technical", icon: "⚽", color: "#22c55e" },
  { key: "physical", label: "Physical", icon: "💪", color: "#ef4444" },
  { key: "tactical", label: "Tactical", icon: "📋", color: "#f97316" },
  { key: "mental", label: "Mental", icon: "🧠", color: "#06b6d4" },
  { key: "nutrition", label: "Nutrition", icon: "🥗", color: "#a855f7" },
  { key: "recovery", label: "Recovery", icon: "🛌", color: "#8b5cf6" },
];

function ChartCard({ title, icon, children, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + "18" }}>
          {icon}
        </div>
        <h3 className="font-heading font-bold text-xs tracking-wider uppercase text-muted-foreground">{title}</h3>
      </div>
      <div className="px-2 pb-3">{children}</div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardCharts({ profile }) {
  const [activeChart, setActiveChart] = useState("xp");
  const [selectedStat, setSelectedStat] = useState("pace");

  const { data: snapshots = [], isLoading: loadingSnaps } = useQuery({
    queryKey: ["stat-snapshots", profile?.id],
    queryFn: () => base44.entities.StatSnapshot.filter({ player_id: profile.id }, "week_start", 30),
    enabled: !!profile,
  });

  const { data: dailyLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["daily-logs-charts", profile?.id],
    queryFn: () => base44.entities.DailyLog.filter({ player_id: profile.id }, "-date", 60),
    enabled: !!profile,
  });

  // --- Weekly XP Data ---
  const xpData = useMemo(() => {
    if (!dailyLogs.length) return [];
    const sorted = [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date));
    const weeks = {};
    sorted.forEach((log) => {
      const ws = format(startOfWeek(new Date(log.date + "T00:00:00"), { weekStartsOn: 1 }), "MMM d");
      weeks[ws] = (weeks[ws] || 0) + (log.xp_earned_today || 0);
    });
    return Object.entries(weeks).slice(-8).map(([week, xp], i) => ({
      week: i === Object.entries(weeks).slice(-8).length - 1 ? "This week" : week,
      xp,
      label: week,
    }));
  }, [dailyLogs]);

  // --- Stat Trend Data ---
  const statTrendData = useMemo(() => {
    if (!snapshots.length) return [];
    return [...snapshots]
      .sort((a, b) => a.week_start.localeCompare(b.week_start))
      .slice(-10)
      .map((s) => ({
        week: format(new Date(s.week_start + "T00:00:00"), "MMM d"),
        ...Object.fromEntries(STAT_NAMES.map((st) => [st, s.stats?.[st] || 50])),
      }));
  }, [snapshots]);

  // --- Pillar Consistency Data ---
  const pillarData = useMemo(() => {
    if (!dailyLogs.length) return [];
    const sorted = [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date));
    const weeks = {};
    sorted.forEach((log) => {
      const ws = format(startOfWeek(new Date(log.date + "T00:00:00"), { weekStartsOn: 1 }), "MMM d");
      if (!weeks[ws]) {
        weeks[ws] = { technical: 0, physical: 0, tactical: 0, mental: 0, nutrition: 0, recovery: 0 };
      }
      const training = log.training_completed || [];
      const categories = new Set(training.filter((t) => t.completed).map((t) => t.category));
      categories.forEach((cat) => {
        if (cat && weeks[ws][cat] !== undefined) weeks[ws][cat] += 1;
      });
      if (log.mental_session_done) weeks[ws].mental += 1;
      if (log.meals_logged?.some((m) => m.completed)) weeks[ws].nutrition += 1;
      if (log.sleep_hours >= 7) weeks[ws].recovery += 1;
    });
    return Object.entries(weeks).slice(-6).map(([week, data]) => ({
      week,
      ...data,
    }));
  }, [dailyLogs]);

  // --- Average stats ---
  const avgStats = useMemo(() => {
    if (!snapshots.length) return [];
    return STAT_NAMES.map((stat) => {
      const vals = snapshots.map((s) => s.stats?.[stat] || 50);
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      return { stat, value: profile?.stats?.[stat] || avg, avg, color: STAT_COLORS[stat] };
    });
  }, [snapshots, profile]);

  if (loadingSnaps || loadingLogs) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const tabs = [
    { key: "xp", label: "XP", icon: <Zap className="w-3.5 h-3.5" />, accent: STAT_COLORS.pace },
    { key: "stats", label: "Stats", icon: <Activity className="w-3.5 h-3.5" />, accent: STAT_COLORS.physical },
    { key: "pillars", label: "Pillars", icon: <Target className="w-3.5 h-3.5" />, accent: STAT_COLORS.tactical },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
          Performance Charts
        </h3>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-lg bg-secondary p-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveChart(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-all flex-1 justify-center ${
              activeChart === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* XP Chart */}
      {activeChart === "xp" && (
        <ChartCard title="Weekly XP Earned" icon={<Zap className="w-4 h-4" style={{ color: STAT_COLORS.pace }} />} accent={STAT_COLORS.pace}>
          {xpData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Complete training to see XP data.</p>
          ) : (
            <div className="pt-2">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={xpData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 16%)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="xp" name="XP" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {xpData.map((entry, i) => (
                      <Cell key={i} fill={i === xpData.length - 1 ? "hsl(142 71% 45%)" : "hsl(142 71% 45% / 0.3)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {xpData.length > 0 && (
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Total: {xpData.reduce((s, d) => s + d.xp, 0)} XP</span>
                  <span>Avg/wk: {Math.round(xpData.reduce((s, d) => s + d.xp, 0) / xpData.length)} XP</span>
                </div>
              )}
            </div>
          )}
        </ChartCard>
      )}

      {/* Stats Trend Chart */}
      {activeChart === "stats" && (
        <ChartCard title="Stat Progression" icon={<Activity className="w-4 h-4" style={{ color: STAT_COLORS.physical }} />} accent={STAT_COLORS.physical}>
          {statTrendData.length < 2 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Need at least 2 weekly snapshots to show trends.</p>
          ) : (
            <div className="pt-2 space-y-3">
              {/* Stat selector */}
              <div className="flex flex-wrap gap-1.5">
                {STAT_NAMES.map((stat) => (
                  <button
                    key={stat}
                    onClick={() => setSelectedStat(stat)}
                    className="text-[10px] px-2 py-1 rounded-md font-medium transition-all"
                    style={{
                      backgroundColor: selectedStat === stat ? STAT_COLORS[stat] + "30" : "transparent",
                      color: selectedStat === stat ? STAT_COLORS[stat] : "hsl(220 10% 55%)",
                      border: `1px solid ${selectedStat === stat ? STAT_COLORS[stat] + "40" : "transparent"}`,
                    }}
                  >
                    {STAT_LABELS_CAP[stat]}
                  </button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={statTrendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id={`grad-${selectedStat}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STAT_COLORS[selectedStat]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={STAT_COLORS[selectedStat]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 16%)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
                  <YAxis domain={[20, 100]} tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={selectedStat}
                    name={STAT_LABELS_CAP[selectedStat]}
                    stroke={STAT_COLORS[selectedStat]}
                    strokeWidth={2}
                    fill={`url(#grad-${selectedStat})`}
                    dot={{ r: 3, fill: STAT_COLORS[selectedStat], strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: STAT_COLORS[selectedStat], stroke: "hsl(var(--card))", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              {statTrendData.length >= 2 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {STAT_LABELS_CAP[selectedStat]}: {statTrendData[0]?.[selectedStat]} → {statTrendData[statTrendData.length - 1]?.[selectedStat]}
                  </span>
                  <span style={{ color: STAT_COLORS[selectedStat] }}>
                    {statTrendData[statTrendData.length - 1]?.[selectedStat] - statTrendData[0]?.[selectedStat] >= 0 ? "↑" : "↓"}
                    {" "}{statTrendData[statTrendData.length - 1]?.[selectedStat] - statTrendData[0]?.[selectedStat] > 0 ? "+" : ""}
                    {statTrendData[statTrendData.length - 1]?.[selectedStat] - statTrendData[0]?.[selectedStat]}
                  </span>
                </div>
              )}
            </div>
          )}
        </ChartCard>
      )}

      {/* Pillars Consistency Chart */}
      {activeChart === "pillars" && (
        <ChartCard title="Pillar Consistency" icon={<Target className="w-4 h-4" style={{ color: STAT_COLORS.tactical }} />} accent={STAT_COLORS.tactical}>
          {pillarData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Complete training across pillars to see consistency data.</p>
          ) : (
            <div className="pt-2 space-y-3">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pillarData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 16%)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {PILLARS.map((pillar) => (
                    <Bar key={pillar.key} dataKey={pillar.key} name={pillar.label} stackId="a" fill={pillar.color} maxBarSize={32} radius={0} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              {/* Pillar legend */}
              <div className="grid grid-cols-3 gap-1.5">
                {PILLARS.map((pillar) => {
                  const total = pillarData.reduce((s, w) => s + (w[pillar.key] || 0), 0);
                  return (
                    <div key={pillar.key} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pillar.color }} />
                      <span className="text-muted-foreground">{pillar.icon} {pillar.label}</span>
                      <span className="font-semibold ml-auto">{total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ChartCard>
      )}
    </div>
  );
}