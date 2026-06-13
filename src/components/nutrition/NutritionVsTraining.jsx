import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, subDays, parseISO } from "date-fns";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp, Droplets, UtensilsCrossed, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function NutritionVsTraining({ profile }) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), 29 - i);
    return format(d, "yyyy-MM-dd");
  });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["daily-logs-month", profile?.id],
    queryFn: async () => {
      const results = [];
      // Fetch in batches (Base44 filter doesn't do date ranges natively, so we fetch all recent)
      const all = await base44.entities.DailyLog.filter(
        { player_id: profile.id },
        "-date",
        40
      );
      return all;
    },
    enabled: !!profile,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Build chart data: last 30 days, fill gaps with zeros
  const chartData = last30Days.map((date) => {
    const log = logs.find((l) => l.date === date);
    const waterL = log?.water_ml || 0;
    const mealsDone = (log?.meals_logged || []).filter((m) => m.completed).length;
    const trainingXp = log?.xp_earned_today || 0;
    const trainingDrills = (log?.training_completed || []).filter((t) => t.completed).length;

    return {
      date: format(parseISO(date), "MMM d"),
      fullDate: date,
      waterL: Math.round(waterL / 100) / 10, // convert ml to liters
      mealsDone,
      trainingXp,
      trainingDrills,
    };
  });

  // Only show last 14 days for cleaner chart
  const displayData = chartData.slice(-14);

  // Calculate correlation insight
  const highHydrationDays = chartData.filter((d) => d.waterL >= 1.5);
  const lowHydrationDays = chartData.filter((d) => d.waterL < 1.5 && d.waterL > 0);
  const avgXpHigh = highHydrationDays.length
    ? Math.round(highHydrationDays.reduce((s, d) => s + d.trainingXp, 0) / highHydrationDays.length)
    : 0;
  const avgXpLow = lowHydrationDays.length
    ? Math.round(lowHydrationDays.reduce((s, d) => s + d.trainingXp, 0) / lowHydrationDays.length)
    : 0;

  const hasData = chartData.some((d) => d.waterL > 0 || d.trainingXp > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border p-4 space-y-4"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
          Nutrition vs Training
        </h3>
        <span className="text-[10px] text-muted-foreground ml-auto">Last 14 days</span>
      </div>

      {!hasData ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Log your water, meals, and training to see the connection between nutrition and performance.
          </p>
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: "L / Count", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: "XP", angle: 90, position: "insideRight", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                  formatter={(value, name) => {
                    const labels = {
                      waterL: "Water (L)",
                      mealsDone: "Meals Done",
                      trainingXp: "Training XP",
                      trainingDrills: "Drills",
                    };
                    return [value, labels[name] || name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "10px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  yAxisId="left"
                  dataKey="waterL"
                  name="Water (L)"
                  fill="hsl(199 89% 48%)"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mealsDone"
                  name="Meals"
                  stroke="hsl(142 71% 45%)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(142 71% 45%)" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="trainingXp"
                  name="Training XP"
                  stroke="hsl(48 96% 53%)"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: "hsl(48 96% 53%)" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Insight */}
          {avgXpHigh > 0 && avgXpLow > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-center">
                <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Well Hydrated Days</p>
                <p className="text-sm font-heading font-bold text-blue-400">{avgXpHigh} XP avg</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                <UtensilsCrossed className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Under Hydrated Days</p>
                <p className="text-sm font-heading font-bold text-amber-400">{avgXpLow} XP avg</p>
              </div>
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
                <Zap className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Boost</p>
                <p className="text-sm font-heading font-bold text-green-400">
                  +{avgXpHigh - avgXpLow > 0 ? avgXpHigh - avgXpLow : 0} XP
                </p>
              </div>
            </div>
          )}

          {avgXpHigh > avgXpLow && (
            <p className="text-xs text-green-400 text-center">
              💡 Better hydration correlates with {Math.round(((avgXpHigh - avgXpLow) / Math.max(avgXpLow, 1)) * 100)}% higher training output. Keep it up!
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}