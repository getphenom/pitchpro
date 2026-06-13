import { useState, useMemo, useEffect } from "react";
import { startOfWeek, format, subWeeks } from "date-fns";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { STAT_COLORS } from "@/lib/gameData";
import { motion, AnimatePresence } from "framer-motion";

const STAT_NAMES = ["pace", "shooting", "passing", "dribbling", "defending", "physical", "mental", "tactical"];

export default function WeeklyProgress({ currentStats = {}, snapshots = [] }) {
  const [compareIndex, setCompareIndex] = useState(0); // 0 = latest previous, etc.

  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const previousSnapshots = useMemo(() => {
    const currentKey = format(currentWeekStart, "yyyy-MM-dd");
    return snapshots
      .filter((s) => s.week_start < currentKey)
      .sort((a, b) => b.week_start.localeCompare(a.week_start));
  }, [snapshots, currentWeekStart]);

  const compareSnapshot = previousSnapshots[compareIndex] || null;

  const radarData = useMemo(() => {
    return STAT_NAMES.map((stat) => ({
      stat: stat.charAt(0).toUpperCase() + stat.slice(1),
      Current: currentStats[stat] || 50,
      Previous: compareSnapshot?.stats?.[stat] || 0,
      fullMark: 100,
    }));
  }, [currentStats, compareSnapshot]);

  const deltas = useMemo(() => {
    return STAT_NAMES.map((stat) => {
      const current = currentStats[stat] || 50;
      const previous = compareSnapshot?.stats?.[stat];
      if (previous === undefined || previous === null) return { stat, delta: null };
      return {
        stat,
        delta: Math.round(current - previous),
        current,
        previous,
      };
    });
  }, [currentStats, compareSnapshot]);

  const canGoNext = compareIndex > 0;
  const canGoPrev = compareIndex < previousSnapshots.length - 1;

  return (
    <div className="space-y-4">
      {/* Radar comparison */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
            <PolarGrid stroke="hsl(220 15% 20%)" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fill: "hsl(220 10% 55%)", fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Current"
              dataKey="Current"
              stroke="hsl(142 71% 45%)"
              fill="hsl(142 71% 45%)"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            {compareSnapshot && (
              <Radar
                name="Previous"
                dataKey="Previous"
                stroke="hsl(220 10% 45%)"
                fill="hsl(220 10% 45%)"
                fillOpacity={0.15}
                strokeWidth={1.5}
                strokeDasharray="5 3"
              />
            )}
            {compareSnapshot && <Legend />}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Week selector */}
      {previousSnapshots.length > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCompareIndex((i) => i + 1)}
            disabled={!canGoPrev}
            className="w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center disabled:opacity-30 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <span className="text-xs text-muted-foreground">vs.</span>
            <p className="text-sm font-semibold">
              {format(new Date(compareSnapshot.week_start + "T00:00:00"), "MMM d")} week
            </p>
          </div>
          <button
            onClick={() => setCompareIndex((i) => Math.max(0, i - 1))}
            disabled={!canGoNext}
            className="w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center disabled:opacity-30 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delta grid */}
      {compareSnapshot && (
        <AnimatePresence mode="wait">
          <motion.div
            key={compareSnapshot.week_start}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-4 gap-2"
          >
            {deltas.map(({ stat, delta }) => {
              const isPositive = delta > 0;
              const isNegative = delta < 0;

              return (
                <div
                  key={stat}
                  className={`rounded-lg border p-2 text-center transition-all ${
                    delta === null
                      ? "bg-card/50 border-border/50"
                      : isPositive
                      ? "bg-green-500/10 border-green-500/20"
                      : isNegative
                      ? "bg-red-500/10 border-red-500/20"
                      : "bg-card border-border"
                  }`}
                >
                  <p
                    className="text-[10px] text-muted-foreground capitalize mb-0.5"
                  >
                    {stat}
                  </p>
                  <div className="flex items-center justify-center gap-0.5">
                    {delta === null ? (
                      <Minus className="w-3 h-3 text-muted-foreground" />
                    ) : isPositive ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : isNegative ? (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    ) : (
                      <Minus className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span
                      className="text-xs font-heading font-bold"
                      style={{ color: STAT_COLORS[stat] }}
                    >
                      {delta !== null ? (delta > 0 ? `+${delta}` : delta) : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Empty state */}
      {previousSnapshots.length === 0 && (
        <div className="text-center py-3">
          <p className="text-xs text-muted-foreground">
            Complete training quests this week to start tracking your growth. Snapshots are saved every Monday.
          </p>
        </div>
      )}
    </div>
  );
}