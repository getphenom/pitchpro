import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Clock, Flame } from "lucide-react";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion } from "framer-motion";

export default function TrainingPlanGenerator({ profile }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    const prompt = `Create a personalized weekly soccer training plan for a ${profile.age}-year-old ${POSITION_LABELS[profile.position]} at ${profile.skill_level} level. 
They train ${profile.weekly_training_days || 5} days per week. Preferred foot: ${profile.preferred_foot || "right"}.

Create a detailed plan with specific drills for each day. Include:
- Technical drills specific to their position
- Physical conditioning appropriate for their age
- Tactical awareness exercises
- Recovery/rest days

For each training day, provide 3-4 drills with name, duration, description, and category.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          plan_name: { type: "string" },
          overview: { type: "string" },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "string" },
                focus: { type: "string" },
                is_rest: { type: "boolean" },
                drills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      duration: { type: "string" },
                      description: { type: "string" },
                      category: { type: "string", enum: ["technical", "physical", "tactical", "mental", "recovery"] },
                    },
                  },
                },
              },
            },
          },
          tips: { type: "array", items: { type: "string" } },
        },
      },
    });

    setPlan(result);
    setLoading(false);
  };

  const categoryIcons = {
    technical: "⚽",
    physical: "💪",
    tactical: "📋",
    mental: "🧠",
    recovery: "🧘",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <Sparkles className="w-5 h-5 text-accent absolute -top-1 -right-1 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground">Creating your personalized plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-heading font-bold text-lg">AI Training Plan</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Get a personalized weekly training plan based on your position, age, and skill level.
        </p>
        <Button className="bg-primary hover:bg-primary/90" onClick={generatePlan}>
          <Sparkles className="w-4 h-4 mr-2" /> Generate My Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-5">
        <h3 className="font-heading font-bold text-lg">{plan.plan_name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{plan.overview}</p>
      </div>

      {plan.days?.map((day, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl bg-card border border-border p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">{day.day}</h4>
              <p className="text-xs text-primary">{day.focus}</p>
            </div>
            {day.is_rest && (
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-lg">Rest Day</span>
            )}
          </div>

          {!day.is_rest && day.drills?.map((drill, j) => (
            <div key={j} className="flex items-start gap-3 pl-2 border-l-2 border-primary/20">
              <span className="text-lg mt-0.5">{categoryIcons[drill.category] || "⚽"}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{drill.name}</p>
                <p className="text-xs text-muted-foreground">{drill.description}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {drill.duration}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      ))}

      {plan.tips?.length > 0 && (
        <div className="rounded-xl bg-accent/10 border border-accent/20 p-4">
          <h4 className="font-semibold text-sm text-accent mb-2">💡 Pro Tips</h4>
          <ul className="space-y-1">
            {plan.tips.map((tip, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                <span className="text-accent">•</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={() => setPlan(null)}>
        Generate New Plan
      </Button>
    </div>
  );
}