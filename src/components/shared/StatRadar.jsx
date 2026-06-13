import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { STAT_COLORS } from "@/lib/gameData";

export default function StatRadar({ stats = {} }) {
  const data = Object.entries(stats).map(([key, value]) => ({
    stat: key.charAt(0).toUpperCase() + key.slice(1),
    value: value || 50,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="hsl(220 15% 20%)" />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fill: "hsl(220 10% 55%)", fontSize: 11, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name="Stats"
          dataKey="value"
          stroke="hsl(142 71% 45%)"
          fill="hsl(142 71% 45%)"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}