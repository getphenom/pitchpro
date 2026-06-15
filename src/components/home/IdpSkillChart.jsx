import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, subMonths, startOfWeek } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Loader2, Target, TrendingUp, Trophy } from "lucide-react";
import { STAT_COLORS } from "@/lib/gameData";
import { motion } from "framer-motion";

const STAT_NAMES = ["pace", "shooting", "passing", "dribbling", "defending", "physical", "mental", "tactical"];
const STAT_LABELS = {
  pace: "Pace", shooting: "Shooting", passing: "Passing", dribbling: "Dribbling",
  defending: "Defending", physical: "Physical", mental: "Mental", tactical: "Tactical",
};

export default function IdpSkillChart({ profile }) {
  const oneMonthAgo = format(subMonths(new Date(), 1), "yyyy-MM-dd");

  const { data: plans = [], isLoading: loadingPlan } = useQuery({
    queryKey: ["development-plans", profile?.id],
    queryFn: () =>
      base44.entities.DevelopmentPlan.filter(
        { player_id: profile.id, plan_type: "annual", status: "active" },
        "-start_date",
        1
      ),
    enabled: !!profile,
  });

  const { data: snapshots = [], isLoading: loadingSnaps } = useQuery({
    queryKey: ["stat-snapshots-idp", profile?.id],
    queryFn: () =>
      base44.entities.StatSnapshot.filter({ player_id: profile.id }, "-week_start", 10),
    enabled: !!profile,
  });

  const monthlyDelta = useMemo(() => {
    const currentStats = profile?.stats || {};
    const oldestSnap = snapshots
      .filter((s) => s.week_start <= format(new Date(), "yyyy-MM-dd"))
      .sort((a, b) => a.week_start.localeCompare(b.week_start))[0];

    if (!oldestSnap) return STAT_NAMES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    return STAT_NAMES.reduce((acc, stat) => {
      acc[stat] = Math.round((currentStats[stat] || 50) - (oldestSnap.stats?.[stat] || 50));
      return acc;
    }, {});
  }, [profile?.stats, snapshots]);

  const plan = plans[0];
  const targets = plan?.skill_targets || {};

  const chartData = useMemo(() => {
    return STAT_NAMES.map((stat) => ({
      stat: STAT_LABELS[stat],
      current: profile?.stats?.[stat] || 50,
      target: targets[stat] || 50,
      delta: monthlyDelta[stat],
    }));
  }, [profile?.stats, targets, monthlyDelta]);

  const hasTargets = Object.keys(targets).length > 0;

  if (loadingPlan || loadingSnaps) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            IDP Skill Progress
          </h3>
        </div>
        {!hasTargets && (
          <span className="text-[10px] text-muted-foreground italic">No targets set</span>
        )}
      </div>

      {/* Chart: Current vs IDP Target */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
          barCategoryGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 16%)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="stat"
            tick={{ fill: "hsl(220 10% 55%)", fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220 18% 8%)",
              border: "1px solid hsl(220 15% 16%)",
              borderRadius: "12px",
              fontSize: 12,
            }}
            formatter={(value, name) => [value, name === "current" ? "Current" : "IDP Target"]}
          />
          <Bar dataKey="current" radius={[0, 6, 6, 0]} barSize={14} name="current">
            {chartData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={STAT_COLORS[STAT_NAMES[idx]] || "hsl(142 71% 45%)"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
          {hasTargets && (
            <Bar dataKey="target" radius={[0, 6, 6, 0]} barSize={14} fillOpacity={0.25} fill="hsl(220 10% 70%)" name="target" />
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Progress cards */}
      <div className="grid grid-cols-4 gap-2">
        {chartData.map((entry, idx) => {
          const statKey = STAT_NAMES[idx];
          const pct = targets[statKey] ? Math.min(100, Math.round((entry.current / entry.target) * 100)) : null;
          return (
            <div key={statKey} className="rounded-lg bg-secondary/40 p-2 text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground capitalize">{STAT_LABELS[statKey]}</span>
              <p className="text-sm font-heading font-bold" style={{ color: STAT_COLORS[statKey] }}>
                {pct ? `${pct}%` : entry.current}
              </p>
              {entry.delta !== 0 && (
                <p className={`text-[10px] font-medium ${entry.delta > 0 ? "text-green-400" : "text-red-400"}`}>
                  {entry.delta > 0 ? `+${entry.delta}` : entry.delta} mo
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress summary */}
      {hasTargets && (
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-accent" />
            <span className="text-muted-foreground">Overall:</span>
            <span className="font-heading font-bold text-accent">
              {Math.round(
                chartData.reduce((sum, d) => sum + Math.min(100, (d.current / (d.target || 100)) * 100), 0) /
                  chartData.length
              )}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            <span className="text-muted-foreground">30-day gain:</span>
            <span className={`font-heading font-bold ${Object.values(monthlyDelta).reduce((a, b) => a + b, 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {Object.values(monthlyDelta).reduce((a, b) => a + b, 0) >= 0 ? "+" : ""}
              {Object.values(monthlyDelta).reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}