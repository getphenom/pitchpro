import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, subDays, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const BODY_PART_LABELS = {
  ankle: "Ankle", knee: "Knee", hamstring: "Hamstring", quad: "Quad",
  groin: "Groin", hip: "Hip", back: "Back", shoulder: "Shoulder",
  foot: "Foot", calf: "Calf", shin: "Shin", elbow: "Elbow",
  wrist: "Wrist", neck: "Neck", other: "Other",
};

export default function RecoveryPainChart({ profileId }) {
  const { data: injuryLogs = [], isLoading } = useQuery({
    queryKey: ["injury-logs-30d", profileId],
    queryFn: () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
      return base44.entities.InjuryLog.filter({
        player_id: profileId,
        start_date: { $gte: thirtyDaysAgo },
      }, "start_date", 100);
    },
    enabled: !!profileId,
  });

  if (isLoading) return null;

  if (injuryLogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-card border border-border p-6 text-center"
      >
        <Activity className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No injury data in the last 30 days</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Log an injury to start tracking your recovery</p>
      </motion.div>
    );
  }

  // Build chart data — one point per injury log entry
  const chartData = [...injuryLogs]
    .sort((a, b) => (a.start_date < b.start_date ? -1 : 1))
    .map((log) => ({
      date: format(parseISO(log.start_date), "MMM d"),
      pain: log.pain_level,
      progress: log.recovery_progress || 0,
      bodyPart: BODY_PART_LABELS[log.body_part] || log.body_part,
      status: log.status,
      fullDate: log.start_date,
    }));

  const activeCount = injuryLogs.filter((l) => l.status !== "healed").length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs font-semibold mb-1">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold">{entry.value}</span>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground mt-1">
          {payload[0]?.payload?.bodyPart} · {payload[0]?.payload?.status}
        </p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            30-Day Recovery Tracker
          </h3>
        </div>
        {activeCount > 0 && (
          <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-medium">
            {activeCount} active
          </span>
        )}
      </div>

      <div className="w-full" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 16%)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(220 15% 16%)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              domain={[0, 10]}
              tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }}
              tickLine={false}
              axisLine={false}
              label={{ value: "Pain (1-10)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 10, fill: "hsl(220 10% 55%)" } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }}
              tickLine={false}
              axisLine={false}
              label={{ value: "Progress %", angle: 90, position: "insideRight", offset: 10, style: { fontSize: 10, fill: "hsl(220 10% 55%)" } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="pain"
              name="Pain Level"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="progress"
              name="Recovery %"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center rounded-lg bg-secondary/30 p-2">
          <p className="text-lg font-heading font-bold text-red-400">
            {chartData.length > 0 ? Math.max(...chartData.map((d) => d.pain)) : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">Peak Pain</p>
        </div>
        <div className="text-center rounded-lg bg-secondary/30 p-2">
          <p className="text-lg font-heading font-bold text-green-400">
            {chartData.filter((d) => d.status === "healed").length}
          </p>
          <p className="text-[10px] text-muted-foreground">Healed</p>
        </div>
        <div className="text-center rounded-lg bg-secondary/30 p-2">
          <p className="text-lg font-heading font-bold text-primary">
            {chartData.length > 0
              ? Math.round(chartData.reduce((sum, d) => sum + d.progress, 0) / chartData.length)
              : "—"}%
          </p>
          <p className="text-[10px] text-muted-foreground">Avg Progress</p>
        </div>
      </div>
    </motion.div>
  );
}