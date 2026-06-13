import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles, Bed, Dumbbell, Wind, Thermometer, Droplets, Timer, ChevronDown, ChevronUp, CheckCircle2, BookOpen, Moon, Activity, Footprints, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion, AnimatePresence } from "framer-motion";
import TutorialModal from "@/components/shared/TutorialModal";
import SwapDialog from "@/components/shared/SwapDialog";
import { format } from "date-fns";

const today = format(new Date(), "yyyy-MM-dd");

const RECOVERY_LIBRARY = [
  {
    category: "stretching",
    icon: Wind,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Post-Training Stretching",
    desc: "Key stretches to do after every session",
    exercises: [
      { name: "Hamstring Stretch", duration: "30s each leg", target: "Hamstrings" },
      { name: "Quad Stretch", duration: "30s each leg", target: "Quads" },
      { name: "Hip Flexor Stretch", duration: "45s each leg", target: "Hip flexors" },
      { name: "Groin Stretch", duration: "30s", target: "Adductors" },
      { name: "Calf Stretch", duration: "30s each leg", target: "Calves" },
      { name: "Glute Stretch", duration: "30s each side", target: "Glutes" },
      { name: "Lower Back Stretch", duration: "30s", target: "Lower back" },
    ],
  },
  {
    category: "foam_rolling",
    icon: Dumbbell,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    title: "Foam Rolling / Myofascial Release",
    desc: "Self-massage to release muscle tightness",
    exercises: [
      { name: "Calf Roll", duration: "60s each leg", target: "Calves" },
      { name: "Quad Roll", duration: "60s each leg", target: "Quads" },
      { name: "IT Band Roll", duration: "45s each leg", target: "IT band" },
      { name: "Hamstring Roll", duration: "60s each leg", target: "Hamstrings" },
      { name: "Upper Back Roll", duration: "60s", target: "Thoracic spine" },
      { name: "Glute Roll", duration: "45s each side", target: "Glutes" },
    ],
  },
  {
    category: "active_recovery",
    icon: Activity,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    title: "Active Recovery",
    desc: "Light movement to promote blood flow & healing",
    exercises: [
      { name: "Light Jog", duration: "10-15 min", target: "Full body" },
      { name: "Dynamic Mobility Flow", duration: "10 min", target: "Full body" },
      { name: "Pool Session / Swimming", duration: "20 min", target: "Full body" },
      { name: "Cycling (low resistance)", duration: "15-20 min", target: "Legs" },
      { name: "Yoga for Athletes", duration: "15-20 min", target: "Full body" },
    ],
  },
  {
    category: "sleep",
    icon: Moon,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    title: "Sleep Optimization",
    desc: "Recovery happens during sleep — maximize it",
    exercises: [
      { name: "Consistent Sleep Schedule", duration: "Same time daily", target: "Circadian rhythm" },
      { name: "Screen-Free Wind Down", duration: "30 min before bed", target: "Melatonin" },
      { name: "Cool Dark Room", duration: "All night", target: "Deep sleep" },
      { name: "No Caffeine After 2pm", duration: "All day", target: "Sleep quality" },
      { name: "Pre-Sleep Breathing", duration: "5 min", target: "Nervous system" },
    ],
  },
  {
    category: "contrast",
    icon: Thermometer,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    title: "Contrast Therapy",
    desc: "Hot/cold alternation to speed recovery",
    exercises: [
      { name: "Contrast Shower", duration: "3x (1min hot / 30s cold)", target: "Circulation" },
      { name: "Ice Bath (if available)", duration: "10-15 min", target: "Inflammation" },
      { name: "Warm Epsom Salt Bath", duration: "15-20 min", target: "Muscle relaxation" },
      { name: "Cold Water Immersion", duration: "5-10 min", target: "Recovery" },
    ],
  },
];

export default function Recovery() {
  const [loading, setLoading] = useState(false);
  const [recoveryPlan, setRecoveryPlan] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);
  const [completedExercises, setCompletedExercises] = useState({});
  const [tutorialItem, setTutorialItem] = useState(null);
  const [swapItem, setSwapItem] = useState(null);

  const { data: profiles, isLoading: loadingProfile } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const { data: logs } = useQuery({
    queryKey: ["daily-log", today],
    queryFn: () => base44.entities.DailyLog.filter({ date: today }),
    enabled: !!profile,
  });

  const dailyLog = logs?.[0];

  const { data: injuries = [] } = useQuery({
    queryKey: ["active-injuries", profile?.id],
    queryFn: () =>
      base44.entities.InjuryLog.filter({ player_id: profile.id, status: { $in: ["active", "recovering"] } }),
    enabled: !!profile,
  });

  const generateRecoveryPlan = async () => {
    setLoading(true);

    const hasInjuries = injuries.length > 0;
    const injuryInfo = hasInjuries
      ? `Current injuries: ${injuries.map((i) => `${i.body_part} (${i.injury_type}, pain: ${i.pain_level}/10)`).join(", ")}`
      : "No current injuries";

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a personalized recovery plan for a ${profile.age}-year-old soccer player:
      
Position: ${POSITION_LABELS[profile.position]}
Skill Level: ${profile.skill_level}
Age: ${profile.age}
Training Days/Week: ${profile.weekly_training_days || 5}
Today's Sleep: ${dailyLog?.sleep_hours || "unknown"} hours
Today's Mood: ${dailyLog?.mood || "unknown"}
Today's Training Done: ${dailyLog?.training_completed?.length > 0 ? "Yes" : "No"}
${injuryInfo}

Create a plan with:
1. A daily recovery score (1-100) and one-line summary
2. Sleep recommendations specific to their age (${profile.age} years old needs age-appropriate sleep targets)
3. Nutrition recovery tips (post-training refuel)
4. Active recovery suggestions for rest days
5. Stretching routine (specific to soccer and their position)
6. Mental recovery techniques
7. Weekly recovery schedule template (what to do each day)
8. Warning signs of overtraining to watch for`,
      response_json_schema: {
        type: "object",
        properties: {
          recovery_score: { type: "number" },
          daily_summary: { type: "string" },
          sleep_recommendation: {
            type: "object",
            properties: {
              target_hours: { type: "number" },
              tips: { type: "array", items: { type: "string" } },
            },
          },
          nutrition_recovery: {
            type: "array",
            items: {
              type: "object",
              properties: {
                timing: { type: "string" },
                guidance: { type: "string" },
                examples: { type: "array", items: { type: "string" } },
              },
            },
          },
          active_recovery: {
            type: "array",
            items: {
              type: "object",
              properties: {
                activity: { type: "string" },
                duration: { type: "string" },
                benefit: { type: "string" },
                frequency: { type: "string" },
              },
            },
          },
          stretching_routine: {
            type: "array",
            items: {
              type: "object",
              properties: {
                exercise: { type: "string" },
                duration: { type: "string" },
                target: { type: "string" },
                instructions: { type: "string" },
              },
            },
          },
          mental_recovery: {
            type: "array",
            items: { type: "string" },
          },
          weekly_schedule: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "string" },
                recovery_activity: { type: "string" },
                duration: { type: "string" },
                notes: { type: "string" },
              },
            },
          },
          overtraining_signs: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    });

    setRecoveryPlan(result);
    setLoading(false);
  };

  const toggleExercise = (catIdx, exIdx) => {
    const key = `${catIdx}-${exIdx}`;
    setCompletedExercises((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const injuryWarning = injuries.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
        <TutorialModal
          open={!!tutorialItem}
          onClose={() => setTutorialItem(null)}
          item={tutorialItem}
          context={`This is a recovery exercise for a ${profile.age}-year-old soccer player. Explain proper form, common mistakes, and how it aids recovery.`}
          triggerLabel={tutorialItem?.name || tutorialItem?.exercise || "Recovery Tutorial"}
        />

        <SwapDialog
          open={!!swapItem}
          onClose={() => setSwapItem(null)}
          item={swapItem}
          itemType="recovery"
          context={`${profile.age}-year-old ${POSITION_LABELS[profile.position]}, recovery`}
          onSwap={() => setSwapItem(null)}
        />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-heading font-bold">Recovery</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Train hard, recover smarter
          </p>
        </motion.div>

        {/* Injury Warning */}
        {injuryWarning && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
            <Droplets className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">Active Injuries Detected</p>
              <p className="text-xs text-muted-foreground mt-1">
                Recovery is extra important right now. Prioritize rest and follow injury-specific guidance.
              </p>
            </div>
          </div>
        )}

        {/* Today's Recovery Status */}
        {dailyLog && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-card border border-border p-4"
          >
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground mb-3">
              Today's Recovery Snapshot
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <Bed className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                <p className="font-heading font-bold text-lg">{dailyLog.sleep_hours || "—"}</p>
                <p className="text-[10px] text-muted-foreground">Hours Sleep</p>
              </div>
              <div className="text-center">
                <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="font-heading font-bold text-lg">{Math.floor((dailyLog.water_ml || 0) / 250)}</p>
                <p className="text-[10px] text-muted-foreground">Glasses Water</p>
              </div>
              <div className="text-center">
                <Activity className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="font-heading font-bold text-lg">
                  {dailyLog.mood === "great" || dailyLog.mood === "good" ? "😊" : dailyLog.mood === "tired" || dailyLog.mood === "low" ? "😴" : "😐"}
                </p>
                <p className="text-[10px] text-muted-foreground">Mood</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Recovery Plan */}
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            AI Recovery Coach
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing your profile and building a recovery plan...</p>
            </div>
          ) : recoveryPlan ? (
            <div className="space-y-4">
              {/* Score */}
              <div className="rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/5 border border-teal-500/20 p-5 text-center">
                <p className="text-4xl font-heading font-bold text-teal-400">{recoveryPlan.recovery_score}</p>
                <p className="text-xs text-muted-foreground mt-1">Recovery Score</p>
                <p className="text-sm mt-2">{recoveryPlan.daily_summary}</p>
              </div>

              {/* Sleep */}
              <div className="rounded-xl bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bed className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-semibold text-sm">Sleep Target: {recoveryPlan.sleep_recommendation?.target_hours}h</h4>
                </div>
                {recoveryPlan.sleep_recommendation?.tips?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>

              {/* Nutrition Recovery */}
              <div className="rounded-xl bg-card border border-border p-4">
                <h4 className="font-semibold text-sm mb-3">🥗 Post-Training Nutrition</h4>
                {recoveryPlan.nutrition_recovery?.map((n, i) => (
                  <div key={i} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-border group">
                    <p className="text-xs font-semibold text-primary">{n.timing}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.guidance}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {n.examples?.map((ex, j) => (
                        <span key={j} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md">{ex}</span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSwapItem({ ...n, name: n.timing }); }}
                      className="text-[10px] text-muted-foreground hover:text-teal-400 transition-colors flex items-center gap-0.5 mt-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Swap
                    </button>
                  </div>
                ))}
              </div>

              {/* Stretching Routine */}
              <div className="rounded-xl bg-card border border-border p-4">
                <h4 className="font-semibold text-sm mb-3">🧘 Personalized Stretching Routine</h4>
                {recoveryPlan.stretching_routine?.map((stretch, i) => (
                  <div key={i} className="flex items-start gap-3 mb-2 pb-2 border-b last:border-0 border-border group">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">{stretch.exercise}</p>
                        <span className="text-[10px] text-muted-foreground">{stretch.duration}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{stretch.instructions}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSwapItem({ ...stretch, name: stretch.exercise, duration: stretch.duration }); }}
                        className="text-[10px] text-muted-foreground hover:text-teal-400 transition-colors flex items-center gap-0.5 mt-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Swap
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Schedule */}
              <div className="rounded-xl bg-card border border-border p-4">
                <h4 className="font-semibold text-sm mb-3">📅 Weekly Recovery Schedule</h4>
                {recoveryPlan.weekly_schedule?.map((day, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0 border-border">
                    <span className="text-xs font-semibold w-10 flex-shrink-0">{day.day}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{day.recovery_activity}</p>
                      <p className="text-[10px] text-muted-foreground">{day.notes}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{day.duration}</span>
                  </div>
                ))}
              </div>

              {/* Mental Recovery */}
              <div className="rounded-xl bg-card border border-border p-4">
                <h4 className="font-semibold text-sm mb-3">🧠 Mental Recovery</h4>
                {recoveryPlan.mental_recovery?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <Wind className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>

              {/* Overtraining Signs */}
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <h4 className="font-semibold text-xs mb-2 text-red-400">⚠️ Watch For These Signs</h4>
                {recoveryPlan.overtraining_signs?.map((sign, i) => (
                  <p key={i} className="text-xs text-muted-foreground mb-1">• {sign}</p>
                ))}
              </div>

              <Button variant="outline" className="w-full" onClick={() => setRecoveryPlan(null)}>
                Refresh Plan
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-teal-500/30 bg-teal-500/5 p-6 text-center space-y-3">
              <Timer className="w-10 h-10 text-teal-400 mx-auto" />
              <h4 className="font-heading font-bold">Personalized Recovery Plan</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Get a full recovery protocol based on your profile, training load, and any active injuries.
              </p>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={generateRecoveryPlan}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate My Recovery Plan
              </Button>
            </div>
          )}
        </div>

        {/* Recovery Exercise Library */}
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Recovery Library
          </h3>
          {RECOVERY_LIBRARY.map((cat, ci) => {
            const completed = cat.exercises.filter((_, ei) => completedExercises[`${ci}-${ei}`]).length;
            return (
              <motion.div
                key={ci}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.05 }}
                className="rounded-xl bg-card border border-border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedCat(expandedCat === ci ? null : ci)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center flex-shrink-0`}>
                    <cat.icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{cat.title}</p>
                    <p className="text-xs text-muted-foreground">{cat.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {completed}/{cat.exercises.length} done
                    </p>
                  </div>
                  {expandedCat === ci ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedCat === ci && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-1.5">
                        {cat.exercises.map((ex, ei) => {
                          const key = `${ci}-${ei}`;
                          const done = completedExercises[key];
                          return (
                            <div
                              key={ei}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group ${
                                done
                                  ? "bg-teal-500/10 border-teal-500/20"
                                  : "bg-secondary/30 border-border hover:border-teal-500/30"
                              }`}
                            >
                              <div
                                onClick={() => toggleExercise(ci, ei)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer ${
                                  done ? "bg-teal-500 border-teal-500" : "border-muted-foreground/30"
                                }`}
                              >
                                {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <div
                                onClick={() => setTutorialItem(ex)}
                                className="flex-1 min-w-0"
                              >
                                <p className={`text-sm ${done ? "line-through text-muted-foreground" : "font-medium"}`}>
                                  {ex.name}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <Timer className="w-3 h-3" /> {ex.duration}
                                  <span>·</span>
                                  <Footprints className="w-3 h-3" /> {ex.target}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSwapItem(ex); }}
                                    className="text-[10px] text-muted-foreground hover:text-teal-400 transition-colors flex items-center gap-0.5"
                                  >
                                    <RefreshCw className="w-3 h-3" /> Swap
                                  </button>
                                  <span className="text-[10px] text-muted-foreground group-hover:text-teal-400 transition-colors inline-flex items-center gap-0.5">
                                    <BookOpen className="w-3 h-3" /> Tutorial
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}