import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ChevronRight, ChevronLeft, CheckCircle2, Brain, Zap, Target, Dumbbell, Apple, ClipboardCheck, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PILLARS, calculateScores, buildAssessmentPrompt } from "@/lib/assessmentData";
import { POSITION_LABELS } from "@/lib/gameData";

const PILLAR_ICONS = {
  physical: Dumbbell,
  technical: Zap,
  tactical: Target,
  mental: Brain,
  nutrition: Apple,
};

export default function PlayerAssessment({ profile, onComplete }) {
  const [currentPillar, setCurrentPillar] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const queryClient = useQueryClient();

  const pillar = PILLARS[currentPillar];
  const isLastPillar = currentPillar === PILLARS.length - 1;

  const saveAssessment = useMutation({
    mutationFn: (data) => base44.entities.Assessment.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assessments"] }),
  });

  const updateProfile = useMutation({
    mutationFn: (data) => base44.entities.PlayerProfile.update(profile.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });

  const getPillarAnswer = (questionId) => {
    return (answers[pillar.key] || {})[questionId];
  };

  const setPillarAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [pillar.key]: {
        ...(prev[pillar.key] || {}),
        [questionId]: value,
      },
    }));
  };

  const allQuestionsAnswered = () => {
    return pillar.questions.every((q) => getPillarAnswer(q.id) != null);
  };

  const handleNext = () => {
    if (isLastPillar) {
      handleGenerate();
    } else {
      setCurrentPillar((prev) => prev + 1);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const scores = calculateScores(answers);

    const prompt = buildAssessmentPrompt(profile, scores, answers);
    const plan = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          physical_plan: {
            type: "object",
            properties: {
              focus: { type: "string" },
              weekly_schedule: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "string" },
                    focus: { type: "string" },
                    drills: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          duration: { type: "string" },
                          description: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
              key_recommendations: { type: "array", items: { type: "string" } },
            },
          },
          technical_plan: {
            type: "object",
            properties: {
              focus: { type: "string" },
              priority_skills: { type: "array", items: { type: "string" } },
              drills: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skill: { type: "string" },
                    name: { type: "string" },
                    duration: { type: "string" },
                    description: { type: "string" },
                    reps: { type: "string" },
                  },
                },
              },
              key_recommendations: { type: "array", items: { type: "string" } },
            },
          },
          tactical_plan: {
            type: "object",
            properties: {
              focus: { type: "string" },
              concepts_to_learn: { type: "array", items: { type: "string" } },
              drills: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    duration: { type: "string" },
                  },
                },
              },
              key_recommendations: { type: "array", items: { type: "string" } },
            },
          },
          mental_plan: {
            type: "object",
            properties: {
              focus: { type: "string" },
              daily_routines: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    duration: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
              pre_game_routine: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    step: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
              key_recommendations: { type: "array", items: { type: "string" } },
            },
          },
          nutrition_plan: {
            type: "object",
            properties: {
              focus: { type: "string" },
              daily_targets: {
                type: "object",
                properties: {
                  water: { type: "string" },
                  meals: { type: "number" },
                  key_foods: { type: "array", items: { type: "string" } },
                },
              },
              pre_game_meal: {
                type: "object",
                properties: {
                  timing: { type: "string" },
                  suggestions: { type: "array", items: { type: "string" } },
                },
              },
              post_game_recovery: {
                type: "object",
                properties: {
                  timing: { type: "string" },
                  suggestions: { type: "array", items: { type: "string" } },
                },
              },
              key_recommendations: { type: "array", items: { type: "string" } },
            },
          },
          idp_summary: { type: "string" },
          ltdp_vision: { type: "string" },
        },
      },
    });

    const today = new Date().toISOString().split("T")[0];
    const scoresPct = calculateScores(answers);

    // Save assessment
    await saveAssessment.mutateAsync({
      player_id: profile.id,
      date: today,
      pillars: {
        physical: { score: scoresPct.physical, answers: answers.physical || {} },
        technical: { score: scoresPct.technical, answers: answers.technical || {} },
        tactical: { score: scoresPct.tactical, answers: answers.tactical || {} },
        mental: { score: scoresPct.mental, answers: answers.mental || {} },
        nutrition: { score: scoresPct.nutrition, answers: answers.nutrition || {} },
      },
      generated_plans: plan,
      status: "completed",
    });

    // Save plans to profile for easy access across sections
    const avgScore = Math.round(
      (scoresPct.physical + scoresPct.technical + scoresPct.tactical + scoresPct.mental + scoresPct.nutrition) / 5
    );

    await updateProfile.mutateAsync({
      assessment_completed: true,
      assessment_date: today,
      assessment_scores: scoresPct,
      assessment_plans: plan,
      last_active_date: today,
    });

    setResults({ scores: scoresPct, plans: plan, avgScore });
    setGenerating(false);
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <Loader2 className="w-14 h-14 animate-spin text-primary" />
          <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground text-center">Analyzing your answers...</p>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Creating personalized plans for Physical, Technical, Tactical, Mental, and Nutrition development.
        </p>
      </div>
    );
  }

  if (results) {
    const { scores, avgScore } = results;
    const scoreColor = avgScore >= 70 ? "#22c55e" : avgScore >= 50 ? "#f59e0b" : avgScore >= 30 ? "#f97316" : "#ef4444";
    return (
      <div className="space-y-5">
        {/* Overall score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-6 text-center"
        >
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3"
            style={{ backgroundColor: scoreColor + "18", border: `3px solid ${scoreColor}40` }}
          >
            <span className="text-2xl font-heading font-bold" style={{ color: scoreColor }}>{avgScore}%</span>
          </div>
          <h3 className="font-heading font-bold text-lg">Your Assessment is Ready</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized plans have been created for all 5 pillars based on your answers.
          </p>
        </motion.div>

        {/* Pillar scores */}
        <div className="grid grid-cols-5 gap-2">
          {PILLARS.map((p) => {
            const score = scores[p.key] || 0;
            const sc = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : score >= 30 ? "#f97316" : "#ef4444";
            return (
              <div key={p.key} className="text-center">
                <span className="text-xl">{p.icon}</span>
                <p
                  className="text-sm font-heading font-bold mt-1"
                  style={{ color: sc }}
                >
                  {score}%
                </p>
                <p className="text-[9px] text-muted-foreground">{p.label}</p>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Your plans are now available in each section — Training, Nutrition, Mental, and Tactics. 
          Come back anytime to retake the assessment.
        </p>

        <Button
          className="w-full"
          onClick={() => {
            if (onComplete) onComplete();
          }}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" /> View My Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Pillar {currentPillar + 1} of {PILLARS.length}</span>
          <span className="text-xs text-primary font-semibold">{Math.round(((currentPillar) / PILLARS.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: `${(currentPillar / PILLARS.length) * 100}%` }}
            animate={{ width: `${((currentPillar + 1) / PILLARS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Pillar header */}
      <motion.div
        key={pillar.key}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={`rounded-xl border bg-gradient-to-br p-5 ${pillar.color}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{pillar.icon}</span>
          <div>
            <h3 className="font-heading font-bold text-lg">{pillar.label} Assessment</h3>
            <p className="text-xs text-muted-foreground">{pillar.questions.length} questions</p>
          </div>
        </div>
      </motion.div>

      {/* Questions */}
      <div className="space-y-4">
        {pillar.questions.map((q, qi) => {
          const Icon = PILLAR_ICONS[pillar.key] || Brain;
          const currentValue = getPillarAnswer(q.id);
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.08 }}
              className="rounded-xl bg-card border border-border p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-medium">{q.text}</p>
              </div>

              {q.type === "scale" ? (
                <div className="flex items-center gap-1">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPillarAnswer(q.id, opt.value)}
                      className={`flex-1 py-2 rounded-lg text-center text-[10px] transition-all ${
                        currentValue === opt.value
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <div className="font-bold text-xs mb-0.5">{opt.value}</div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPillarAnswer(q.id, opt.score)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
                        currentValue === opt.score
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-secondary/30 text-foreground hover:bg-secondary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentPillar > 0 && (
          <Button variant="outline" className="flex-1" onClick={() => setCurrentPillar((prev) => prev - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={handleNext}
          disabled={!allQuestionsAnswered()}
        >
          {isLastPillar ? (
            <>Generate My Plans <Sparkles className="w-4 h-4 ml-1" /></>
          ) : (
            <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
      {!allQuestionsAnswered() && (
        <p className="text-[10px] text-muted-foreground text-center">
          Answer all questions to continue
        </p>
      )}

      {/* Pillar dots */}
      <div className="flex justify-center gap-1.5">
        {PILLARS.map((p, i) => (
          <button
            key={p.key}
            onClick={() => setCurrentPillar(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentPillar ? "bg-primary w-4" : "bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  );
}