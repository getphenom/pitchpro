import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Brain, ChevronRight, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STAT_COLORS, POSITION_LABELS } from "@/lib/gameData";
import { motion } from "framer-motion";

export default function PerformanceFeedback({ profile, snapshots, dailyLog }) {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateFeedback = async () => {
    setLoading(true);

    const stats = profile.stats || {};
    const prevSnapshot = snapshots?.length > 1 ? snapshots[1] : null;
    const prevStats = prevSnapshot?.stats || {};
    const trainingToday = dailyLog?.training_completed || [];
    const completedCategories = trainingToday.filter((t) => t.completed).map((t) => t.category);

    // Calculate stat deltas
    const statEntries = Object.entries(STAT_COLORS);
    const statDeltas = Object.fromEntries(
      statEntries.map(([k]) => [k, prevStats[k] ? (stats[k] || 50) - prevStats[k] : 0])
    );

    // Find weakest and most improved stats
    const sorted = [...statEntries].sort((a, b) => (stats[b[0]] || 50) - (stats[a[0]] || 50));
    const weakest = sorted[sorted.length - 1]?.[0] || "tactical";
    const strongest = sorted[0]?.[0] || "physical";
    const mostImproved = Object.entries(statDeltas).sort((a, b) => b[1] - a[1])[0]?.[0] || "tactical";
    const mostDeclined = Object.entries(statDeltas).sort((a, b) => a[1] - b[1])[0]?.[0] || "tactical";

    const prompt = `Act as a soccer performance coach. Analyze this player and give 3 specific drill recommendations with personalized tips.

PLAYER:
- Name: ${profile.player_name}
- Age: ${profile.age}
- Position: ${POSITION_LABELS[profile.position]}
- Skill Level: ${profile.skill_level}
- Level: ${profile.level || 1}, XP: ${profile.xp || 0}

CURRENT STATS (1-100):
${statEntries.map(([k]) => `- ${k}: ${stats[k] || 50}`).join("\n")}

STAT CHANGES THIS WEEK:
${statEntries.map(([k]) => `- ${k}: ${statDeltas[k] >= 0 ? "+" : ""}${statDeltas[k]}`).join("\n")}

TRAINING COMPLETED TODAY: ${completedCategories.length > 0 ? completedCategories.join(", ") : "None yet"}
WEAKEST STAT: ${weakest} (${stats[weakest] || 50})
STRONGEST STAT: ${strongest} (${stats[strongest] || 50})
MOST IMPROVED: ${mostImproved}
NEEDS WORK: ${mostDeclined}

Give 3 drill recommendations. Each focused on a different weak area based on the stats above. For each drill, provide:
- A specific drill name (real soccer drill, not generic)
- Which stat it targets
- Duration recommendation
- A personalized tip based on their position and current level
- Why this drill matters for THEM specifically (reference their actual stats)

Make tips actionable and specific — no generic advice. Format as JSON.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string", description: "One-line performance summary" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  drill_name: { type: "string" },
                  targets_stat: { type: "string" },
                  duration: { type: "string" },
                  tip: { type: "string" },
                  why: { type: "string" },
                },
              },
            },
          },
        },
      });
      setFeedback(result);
    } catch (e) {
      // silent fail
    }
    setLoading(false);
  };

  if (!feedback && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-card border border-border p-5 text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-sm">Performance Feedback</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Get AI-recommended drills based on your recent tactical stats and training.
          </p>
        </div>
        <Button
          onClick={generateFeedback}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
        >
          <Brain className="w-4 h-4 mr-2" /> Analyze My Performance
        </Button>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-card border border-border p-6 flex flex-col items-center gap-3"
      >
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <p className="text-xs text-muted-foreground">Analyzing your stats and performance...</p>
      </motion.div>
    );
  }

  if (!feedback) return null;

  const statIcon = (stat) => {
    const icons = {
      pace: "⚡", shooting: "🎯", passing: "🎯", dribbling: "🦶",
      defending: "🛡️", physical: "💪", mental: "🧠", tactical: "📋",
    };
    return icons[stat] || "⚽";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-700/5 border border-purple-500/20 p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-purple-400" />
        <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-purple-400">
          Performance Feedback
        </h3>
      </div>

      {feedback.summary && (
        <p className="text-sm text-foreground/80 leading-relaxed">{feedback.summary}</p>
      )}

      <div className="space-y-3">
        {feedback.recommendations?.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-lg bg-card border border-border p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{statIcon(rec.targets_stat)}</span>
                <div>
                  <h4 className="font-semibold text-sm">{rec.drill_name}</h4>
                  <p className="text-[10px] text-muted-foreground">
                    Targets: <span className="capitalize font-medium" style={{ color: STAT_COLORS[rec.targets_stat] }}>
                      {rec.targets_stat}
                    </span> · {rec.duration}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-foreground/80 pl-8">{rec.tip}</p>
            <p className="text-[10px] text-muted-foreground italic pl-8">{rec.why}</p>
          </motion.div>
        ))}
      </div>

      <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={generateFeedback}>
        Refresh Analysis
      </Button>
    </motion.div>
  );
}