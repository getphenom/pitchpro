import { useState } from "react";
import { getWaterGoal } from "@/lib/gameData";
import { motion } from "framer-motion";
import { Activity, Moon, Droplets, Zap, ChevronDown, ChevronUp } from "lucide-react";

function calculateReadiness(dailyLog, profile) {
  if (!dailyLog) return { score: 50, label: "No Data", color: "text-muted-foreground", bg: "bg-muted", desc: "Log some data today to get your readiness score." };

  // Sleep score (0-100): ideal 8+ hours, 0 if missing
  const sleep = dailyLog.sleep_hours || 0;
  const sleepScore = Math.min(100, Math.round((sleep / 8) * 100));

  // Water score (0-100): percent of daily goal
  const waterGoal = getWaterGoal(profile?.age, profile?.weight_kg);
  const water = dailyLog.water_ml || 0;
  const waterScore = Math.min(100, Math.round((water / waterGoal) * 100));

  // Training load: count completed drills, ideal is 3-5
  const completedDrills = (dailyLog.training_completed || []).filter((t) => t.completed).length;
  const trainingScore = completedDrills === 0 ? 50 : Math.min(100, Math.round((completedDrills / 4) * 100));

  // Weighted average: sleep 40%, water 30%, training 30%
  const score = Math.round(sleepScore * 0.4 + waterScore * 0.3 + trainingScore * 0.3);

  // Recommendation based on score
  let label, color, bg, desc;
  if (score >= 80) {
    label = "Go Hard!";
    color = "text-green-400";
    bg = "bg-gradient-to-br from-green-500/20 to-green-600/5 border-green-500/30";
    desc = "You're well-rested and hydrated. Push your limits today!";
  } else if (score >= 60) {
    label = "Steady Work";
    color = "text-blue-400";
    bg = "bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/30";
    desc = "You're in decent shape. A solid training session will do.";
  } else if (score >= 40) {
    label = "Take It Easy";
    color = "text-amber-400";
    bg = "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/30";
    desc = "A bit off today. Focus on technique, not intensity.";
  } else {
    label = "Rest Day";
    color = "text-red-400";
    bg = "bg-gradient-to-br from-red-500/20 to-red-600/5 border-red-500/30";
    desc = "Your body needs recovery. Light stretching only.";
  }

  return { score, label, color, bg, desc, details: { sleepScore, waterScore, trainingScore, sleep, water, waterGoal, completedDrills } };
}

export default function ReadinessScore({ dailyLog, profile }) {
  const { score, label, color, bg, desc, details } = calculateReadiness(dailyLog, profile);
  const [expanded, setExpanded] = useState(false);

  const arcAngle = (score / 100) * 180;
  const radius = 56;
  const center = 64;
  const endX = center + radius * Math.cos((180 - arcAngle) * (Math.PI / 180));
  const endY = center - radius * Math.sin((180 - arcAngle) * (Math.PI / 180));
  const arcPath = `M ${center - radius} ${center} A ${radius} ${radius} 0 ${arcAngle > 90 ? 1 : 0} 1 ${endX} ${endY}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${bg}`}
    >
      <div className="flex items-center gap-4">
        {/* Gauge */}
        <div className="relative w-[128px] h-[72px] flex-shrink-0">
          <svg viewBox="0 8 128 72" className="w-full h-full">
            {/* Background arc */}
            <path
              d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-secondary"
            />
            {/* Filled arc */}
            <motion.path
              d={arcPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: score / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={color}
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <p className={`text-2xl font-heading font-bold ${color}`}>{score}</p>
          </div>
        </div>

        {/* Label & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${color}`} />
            <h3 className="font-heading font-bold text-xs tracking-wider uppercase text-muted-foreground">
              Readiness Score
            </h3>
          </div>
          <p className={`text-lg font-heading font-bold mt-1 ${color}`}>{label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
        </div>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 mt-3 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? "Hide" : "See"} breakdown
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && details && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 space-y-2 overflow-hidden"
        >
          <DetailRow
            icon={<Moon className="w-3.5 h-3.5 text-indigo-400" />}
            label="Sleep"
            value={details.sleep > 0 ? `${details.sleep}h` : "Not logged"}
            score={details.sleepScore}
            color="indigo"
          />
          <DetailRow
            icon={<Droplets className="w-3.5 h-3.5 text-blue-400" />}
            label="Hydration"
            value={`${details.water}ml / ${details.waterGoal}ml`}
            score={details.waterScore}
            color="blue"
          />
          <DetailRow
            icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
            label="Training"
            value={`${details.completedDrills} drills`}
            score={details.trainingScore}
            color="amber"
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function DetailRow({ icon, label, value, score, color }) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <span className="text-xs flex-1">{label}</span>
      <span className="text-[10px] text-muted-foreground">{value}</span>
      <div className="w-16 bg-secondary rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color === "indigo" ? "#818cf8" : color === "blue" ? "#60a5fa" : "#fbbf24" }}
        />
      </div>
      <span className="text-[10px] font-semibold w-7 text-right" style={{ color: color === "indigo" ? "#818cf8" : color === "blue" ? "#60a5fa" : "#fbbf24" }}>{score}%</span>
    </div>
  );
}