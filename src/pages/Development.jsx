import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Target, ChevronDown, ChevronUp, Calendar, Flag, BookOpen, CheckCircle2, Clock, Award, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion, AnimatePresence } from "framer-motion";
import TutorialModal from "@/components/shared/TutorialModal";

export default function Development() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [activeTab, setActiveTab] = useState("plan");
  const [tutorialItem, setTutorialItem] = useState(null);

  const { data: profiles, isLoading: loadingProfile } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ["development-plans", profile?.id],
    queryFn: () => base44.entities.DevelopmentPlan.filter({ player_id: profile.id }, "-created_date"),
    enabled: !!profile,
  });

  const activePlan = plans?.[0];

  const generatePlan = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const oneYear = new Date();
    oneYear.setFullYear(oneYear.getFullYear() + 1);
    const endDate = oneYear.toISOString().split("T")[0];

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive year-long soccer Individual Development Plan (IDP) / Long-Term Development Plan (LTDP) for:
      
Player: ${profile.player_name}
Age: ${profile.age}
Position: ${POSITION_LABELS[profile.position]}
Skill Level: ${profile.skill_level}
Preferred Foot: ${profile.preferred_foot || "right"}
Current Stats: ${JSON.stringify(profile.stats || {})}
Training Days/Week: ${profile.weekly_training_days || 5}

Plan duration: ${today} to ${endDate} (1 year)

Create a detailed, structured development plan appropriate for this player's age and level. Include:

1. A long-term vision statement
2. 4 phases (mesocycles) of ~3 months each:
   - Phase 1: Foundation building (months 1-3)
   - Phase 2: Skill development & intensity (months 4-6)
   - Phase 3: Peak performance & refinement (months 7-9)
   - Phase 4: Mastery & consolidation (months 10-12)
   Each phase needs: name, focus, 3-4 goals, 3 milestones with metrics, 4-5 key skills to develop, training focus description

3. Weekly goals for the first 12 weeks (sample microcycles). For each week: week_number, focus area, weekly_objective, xp_target, and 5 daily goals (one for each training day Mon-Fri) each with: day, goal description, drill_name, category, and duration

4. Monthly checkpoints (12 months): name, 3 review questions, expected progress description

5. Skill targets by end of plan (ratings 1-100): pace, shooting, passing, dribbling, defending, physical, mental, tactical. Make these slightly higher than current stats but realistic.

6. Coaching notes with general guidance for this player

Make drills EXACTLY age-appropriate for a ${profile.age}-year-old. Use realistic drill names and durations. For younger players (10-13), emphasize fun, fundamentals, and small-sided games. For teens (14-17), add more tactical and physical elements. For advanced/elite, include high-performance concepts.`,
      model: "gemini_3_flash",
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          long_term_vision: { type: "string" },
          phases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                phase_number: { type: "number" },
                focus: { type: "string" },
                goals: { type: "array", items: { type: "string" } },
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { name: { type: "string" }, metric: { type: "string" } },
                  },
                },
                key_skills: { type: "array", items: { type: "string" } },
                training_focus: { type: "string" },
              },
            },
          },
          weekly_goals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                week_number: { type: "number" },
                focus: { type: "string" },
                weekly_objective: { type: "string" },
                xp_target: { type: "number" },
                daily_goals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "string" },
                      goal: { type: "string" },
                      drill_name: { type: "string" },
                      category: { type: "string" },
                      duration: { type: "string" },
                    },
                  },
                },
              },
            },
          },
          monthly_checkpoints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "number" },
                name: { type: "string" },
                review_questions: { type: "array", items: { type: "string" } },
                expected_progress: { type: "string" },
              },
            },
          },
          skill_targets: {
            type: "object",
            properties: {
              pace: { type: "number" },
              shooting: { type: "number" },
              passing: { type: "number" },
              dribbling: { type: "number" },
              defending: { type: "number" },
              physical: { type: "number" },
              mental: { type: "number" },
              tactical: { type: "number" },
            },
          },
          coaching_notes: { type: "string" },
        },
      },
    });

    // Calculate phase dates
    const phaseDuration = 91; // ~3 months
    const phasesWithDates = result.phases.map((phase, i) => {
      const phaseStart = new Date(today);
      phaseStart.setDate(phaseStart.getDate() + i * phaseDuration);
      const phaseEnd = new Date(phaseStart);
      phaseEnd.setDate(phaseEnd.getDate() + phaseDuration - 1);
      return {
        ...phase,
        start_date: phaseStart.toISOString().split("T")[0],
        end_date: phaseEnd.toISOString().split("T")[0],
      };
    });

    const planData = {
      player_id: profile.id,
      plan_type: "annual",
      start_date: today,
      end_date: endDate,
      position: profile.position,
      age: profile.age,
      skill_level: profile.skill_level,
      long_term_vision: result.long_term_vision,
      phases: phasesWithDates,
      weekly_goals: result.weekly_goals,
      monthly_checkpoints: result.monthly_checkpoints,
      skill_targets: result.skill_targets,
      coaching_notes: result.coaching_notes,
      status: "active",
    };

    await base44.entities.DevelopmentPlan.create(planData);
    queryClient.invalidateQueries({ queryKey: ["development-plans"] });
    setLoading(false);
  };

  const toggleDayComplete = async (weekIdx, dayIdx) => {
    if (!activePlan) return;
    const updatedWeeks = [...activePlan.weekly_goals];
    const day = updatedWeeks[weekIdx].daily_goals[dayIdx];
    day.completed = !day.completed;
    await base44.entities.DevelopmentPlan.update(activePlan.id, { weekly_goals: updatedWeeks });
    queryClient.invalidateQueries({ queryKey: ["development-plans"] });
  };

  const categoryColors = {
    technical: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    physical: "text-green-400 bg-green-500/10 border-green-500/20",
    tactical: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    mental: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    recovery: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  };

  const categoryIcons = {
    technical: "⚽",
    physical: "💪",
    tactical: "📋",
    mental: "🧠",
    recovery: "🧘",
  };

  if (loadingProfile || loadingPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
        <TutorialModal
          open={!!tutorialItem}
          onClose={() => setTutorialItem(null)}
          item={tutorialItem}
          context={`This is a development drill for a ${profile.age}-year-old ${POSITION_LABELS[profile.position]}. Provide detailed coaching points, setup instructions, and progression ideas.`}
          triggerLabel={tutorialItem?.drill_name || "Tutorial"}
        />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-heading font-bold">Development Plan</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Your personalized IDP & LTDP as a {POSITION_LABELS[profile.position]}
          </p>
        </motion.div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Building your year-long development plan...</p>
          </div>
        )}

        {!loading && !activePlan && (
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg">Your IDP & LTDP</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Generate a full year-long development plan with daily goals, weekly targets, skill progression phases, and monthly checkpoints — all tailored to your position and age.
            </p>
            <Button className="bg-primary hover:bg-primary/90" onClick={generatePlan}>
              <Sparkles className="w-4 h-4 mr-2" /> Generate My Plan
            </Button>
          </div>
        )}

        {activePlan && (
          <>
            {/* Vision */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-bold text-sm">Long-Term Vision</h3>
              </div>
              <p className="text-sm">{activePlan.long_term_vision}</p>
            </motion.div>

            {/* Skill Targets */}
            {activePlan.skill_targets && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-card border border-border p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
                    End-of-Year Skill Targets
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(activePlan.skill_targets).map(([skill, target]) => {
                    const current = profile.stats?.[skill] || 50;
                    const diff = target - current;
                    return (
                      <div key={skill} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <span className="text-xs capitalize">{skill}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">{current}</span>
                          <span className="text-[10px] text-muted-foreground">→</span>
                          <span className="text-xs font-bold text-primary">{target}</span>
                          <span className={`text-[10px] ${diff > 0 ? "text-green-400" : "text-muted-foreground"}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-secondary rounded-xl p-1">
              {[
                { key: "plan", label: "Phases" },
                { key: "weekly", label: "Weekly Goals" },
                { key: "monthly", label: "Checkpoints" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Phases Tab */}
            {activeTab === "plan" && (
              <div className="space-y-3">
                {activePlan.phases?.map((phase, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl bg-card border border-border overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <span className="font-heading font-bold text-sm text-primary">{phase.phase_number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{phase.name}</p>
                        <p className="text-xs text-muted-foreground">{phase.focus}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {phase.start_date} → {phase.end_date}
                        </p>
                      </div>
                      {expandedPhase === i ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedPhase === i && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {/* Training focus */}
                            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                              <p className="text-xs font-medium text-primary mb-1">Training Focus</p>
                              <p className="text-xs text-muted-foreground">{phase.training_focus}</p>
                            </div>

                            {/* Goals */}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">🎯 Phase Goals</p>
                              {phase.goals?.map((goal, g) => (
                                <div key={g} className="flex items-start gap-2 mb-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                  <p className="text-xs">{goal}</p>
                                </div>
                              ))}
                            </div>

                            {/* Milestones */}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">🏆 Milestones</p>
                              {phase.milestones?.map((ms, m) => (
                                <div key={m} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 mb-1">
                                  <div className="flex items-center gap-2">
                                    <Flag className="w-3 h-3 text-accent" />
                                    <p className="text-xs">{ms.name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Key Skills */}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">🔑 Key Skills</p>
                              <div className="flex flex-wrap gap-1.5">
                                {phase.key_skills?.map((skill, s) => (
                                  <span key={s} className="text-xs bg-secondary px-2 py-1 rounded-lg">{skill}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Weekly Goals Tab */}
            {activeTab === "weekly" && (
              <div className="space-y-3">
                {activePlan.weekly_goals?.length > 0 ? (
                  activePlan.weekly_goals.map((week, wi) => {
                    const completedDays = week.daily_goals?.filter((d) => d.completed).length || 0;
                    const totalDays = week.daily_goals?.length || 5;
                    return (
                      <motion.div
                        key={wi}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: wi * 0.03 }}
                        className="rounded-xl bg-card border border-border overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedWeek(expandedWeek === wi ? null : wi)}
                          className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">Week {week.week_number}</p>
                            <p className="text-xs text-muted-foreground">{week.focus}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden max-w-[100px]">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${(completedDays / totalDays) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {completedDays}/{totalDays}
                              </span>
                            </div>
                          </div>
                          {expandedWeek === wi ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedWeek === wi && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-2">
                                <p className="text-xs font-medium text-primary mb-1">
                                  🎯 {week.weekly_objective}
                                </p>
                                {week.daily_goals?.map((day, di) => (
                                  <div
                                    key={di}
                                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                      day.completed
                                        ? "bg-primary/10 border-primary/20"
                                        : "bg-secondary/30 border-border hover:border-primary/30"
                                    }`}
                                    onClick={() => toggleDayComplete(wi, di)}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                        day.completed
                                          ? "bg-primary border-primary"
                                          : "border-muted-foreground/30"
                                      }`}
                                    >
                                      {day.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold">{day.day}</span>
                                        <span
                                          className={`text-[10px] px-1.5 py-0.5 rounded-md border ${categoryColors[day.category] || "text-muted-foreground bg-secondary border-border"}`}
                                        >
                                          {categoryIcons[day.category]} {day.category}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> {day.duration}
                                        </span>
                                      </div>
                                      <p className="text-sm font-medium mt-0.5">{day.drill_name}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">{day.goal}</p>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setTutorialItem(day); }}
                                        className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 mt-1"
                                      >
                                        <BookOpen className="w-3 h-3" /> How To
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {week.xp_target && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                    <Zap className="w-3 h-3 text-accent" />
                                    XP Target: {week.xp_target}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No weekly goals generated yet.
                  </div>
                )}
              </div>
            )}

            {/* Monthly Checkpoints Tab */}
            {activeTab === "monthly" && (
              <div className="space-y-3">
                {activePlan.monthly_checkpoints?.map((cp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-xl p-4 border ${
                      cp.completed
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{cp.month}</span>
                        </div>
                        <h4 className="font-semibold text-sm">{cp.name}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{cp.expected_progress}</p>
                    <div className="space-y-1.5">
                      {cp.review_questions?.map((q, qi) => (
                        <div key={qi} className="flex items-start gap-2">
                          <span className="text-[10px] text-primary font-bold mt-0.5">Q{qi + 1}</span>
                          <p className="text-xs text-muted-foreground">{q}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Coaching Notes */}
            {activePlan.coaching_notes && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-card border border-border p-4"
              >
                <h3 className="font-heading font-bold text-sm mb-2">📝 Coaching Notes</h3>
                <p className="text-xs text-muted-foreground">{activePlan.coaching_notes}</p>
              </motion.div>
            )}

            {/* Regenerate */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (activePlan) base44.entities.DevelopmentPlan.delete(activePlan.id).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["development-plans"] });
                });
              }}
            >
              Generate New Plan
            </Button>
          </>
        )}
      </div>
    </div>
  );
}