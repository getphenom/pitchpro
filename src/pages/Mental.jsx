import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Brain, Sparkles, Eye, Heart, Shield, Target, Timer, Play, BookOpen } from "lucide-react";
import MentalDetailDialog from "@/components/mental/MentalDetailDialog";
import { Button } from "@/components/ui/button";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion } from "framer-motion";
import MentalCoachChat from "@/components/agents/MentalCoachChat";

const MENTAL_EXERCISES = [
  {
    id: "visualization",
    title: "Game Visualization",
    icon: "👁️",
    duration: "5 min",
    xp: 20,
    color: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
    description: "Close your eyes and visualize yourself performing perfectly in a match. See every touch, every run, every decision.",
    steps: [
      "Find a quiet place and sit comfortably",
      "Close your eyes and take 5 deep breaths",
      "Picture yourself on the pitch in your position",
      "Visualize receiving the ball with a perfect first touch",
      "See yourself making the right decision every time",
      "Imagine the crowd cheering after a great play",
      "Take 3 deep breaths and open your eyes",
    ],
  },
  {
    id: "breathing",
    title: "Pre-Game Breathing",
    icon: "🌬️",
    duration: "3 min",
    xp: 15,
    color: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
    description: "Box breathing technique used by elite athletes to calm nerves and sharpen focus before matches.",
    steps: [
      "Breathe in slowly for 4 seconds",
      "Hold your breath for 4 seconds",
      "Breathe out slowly for 4 seconds",
      "Hold empty for 4 seconds",
      "Repeat 6 times",
    ],
  },
  {
    id: "confidence",
    title: "Confidence Builder",
    icon: "💪",
    duration: "5 min",
    xp: 20,
    color: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
    description: "Build unshakeable self-belief through positive affirmations and memory recall.",
    steps: [
      "Think of 3 great plays you made recently",
      "Replay each one in vivid detail",
      "Say to yourself: 'I am capable of greatness'",
      "Think of a player you admire — you have their qualities",
      "Set one clear intention for your next training/game",
    ],
  },
  {
    id: "focus",
    title: "Laser Focus",
    icon: "🎯",
    duration: "4 min",
    xp: 15,
    color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
    description: "Train your brain to maintain concentration for 90 minutes.",
    steps: [
      "Pick a spot on the wall and stare at it",
      "Focus only on that spot for 60 seconds",
      "If your mind wanders, gently bring it back",
      "Rest for 15 seconds",
      "Repeat 3 more times",
      "Notice how your focus improves each round",
    ],
  },
  {
    id: "resilience",
    title: "Bounce Back",
    icon: "🔄",
    duration: "5 min",
    xp: 20,
    color: "from-red-500/20 to-red-600/5 border-red-500/20",
    description: "Mental toughness training — how to recover from mistakes during a game.",
    steps: [
      "Think of a recent mistake or bad game",
      "Accept it happened — don't judge yourself",
      "Ask: 'What did I learn from this?'",
      "Imagine yourself handling it perfectly next time",
      "Repeat: 'Mistakes make me stronger'",
      "Let it go — your next touch is what matters",
    ],
  },
];

export default function Mental() {
  const [activeExercise, setActiveExercise] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [customAdvice, setCustomAdvice] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const getPersonalAdvice = async () => {
    setLoadingAdvice(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Give personalized mental performance advice for a ${profile.age}-year-old ${POSITION_LABELS[profile.position]} at ${profile.skill_level} level.

Include:
1. A motivational message specific to their position
2. Pre-game mental routine (step by step)
3. How to handle pressure moments in their position
4. Recovery mindset after a bad game
5. Goal-setting advice

Make it relatable and inspiring for a young player.`,
      response_json_schema: {
        type: "object",
        properties: {
          motivation: { type: "string" },
          pre_game_routine: { type: "array", items: { type: "string" } },
          pressure_tips: { type: "array", items: { type: "string" } },
          recovery_mindset: { type: "array", items: { type: "string" } },
          goals: { type: "array", items: { type: "string" } },
        },
      },
    });
    setCustomAdvice(result);
    setLoadingAdvice(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  if (activeExercise) {
    const ex = MENTAL_EXERCISES.find((e) => e.id === activeExercise);
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <Button variant="ghost" onClick={() => { setActiveExercise(null); setCurrentStep(0); }}>
            ← Back
          </Button>

          <div className="text-center space-y-3">
            <span className="text-5xl">{ex.icon}</span>
            <h2 className="font-heading font-bold text-xl">{ex.title}</h2>
            <p className="text-sm text-muted-foreground">{ex.description}</p>
          </div>

          <div className="space-y-3">
            {ex.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all
                  ${i === currentStep ? "bg-primary/10 border-primary/30" : i < currentStep ? "bg-card border-primary/20" : "bg-card border-border"}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                  ${i < currentStep ? "bg-primary text-primary-foreground" : i === currentStep ? "bg-primary/30 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <p className={`text-sm ${i <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                  {step}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
            {currentStep < ex.steps.length - 1 ? (
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => setCurrentStep(currentStep + 1)}>
                Next Step
              </Button>
            ) : (
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => { setActiveExercise(null); setCurrentStep(0); }}
              >
                Complete ✨ (+{ex.xp} XP)
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <MentalDetailDialog
          open={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
          exercise={selectedExercise}
          profile={profile}
          allExercises={MENTAL_EXERCISES}
          onSwap={(alt) => setSelectedExercise(alt)}
        />

        <div>
          <h1 className="text-2xl font-heading font-bold">Mental Game</h1>
          <p className="text-xs text-muted-foreground mt-1">Train your mind like the pros</p>
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Exercises
          </h3>
          {MENTAL_EXERCISES.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedExercise(ex)}
              className={`rounded-xl border bg-gradient-to-br p-4 cursor-pointer hover:scale-[1.01] transition-all group ${ex.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ex.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{ex.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{ex.description.slice(0, 80)}...</p>
                  <span className="text-[10px] text-muted-foreground mt-0.5 group-hover:text-primary transition-colors inline-flex items-center gap-0.5">
                    <BookOpen className="w-3 h-3" /> Tap for step-by-step
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground">{ex.duration}</span>
                  <span className="text-xs text-accent font-semibold">+{ex.xp} XP</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Personalized Advice */}
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Personal Coaching
          </h3>

          {loadingAdvice ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : customAdvice ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/20 p-5">
                <h4 className="font-semibold text-sm mb-2">💬 Your Motivation</h4>
                <p className="text-sm text-foreground/90">{customAdvice.motivation}</p>
              </div>

              <div className="rounded-xl bg-card border border-border p-4">
                <h4 className="font-semibold text-sm mb-3">🧘 Pre-Game Routine</h4>
                {customAdvice.pre_game_routine?.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-xs text-primary font-bold">{i + 1}.</span>
                    <p className="text-xs text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-card border border-border p-4">
                <h4 className="font-semibold text-sm mb-3">⚡ Handling Pressure</h4>
                {customAdvice.pressure_tips?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-primary">•</span>
                    <p className="text-xs text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full" onClick={() => setCustomAdvice(null)}>
                Get New Advice
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-cyan-500/30 bg-cyan-500/5 p-6 text-center space-y-3">
              <Brain className="w-10 h-10 text-cyan-400 mx-auto" />
              <h4 className="font-heading font-bold">AI Mental Coach</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Get personalized mental performance advice for your position and level.
              </p>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={getPersonalAdvice}>
                <Sparkles className="w-4 h-4 mr-2" /> Get Personal Advice
              </Button>
            </div>
          )}
        </div>

        {/* Mental Coach Agent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card border border-cyan-500/20 p-5"
        >
          <MentalCoachChat profile={profile} />
        </motion.div>
      </div>
    </div>
  );
}