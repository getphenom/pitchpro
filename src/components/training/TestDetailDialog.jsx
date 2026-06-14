import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2, X, Clock, TrendingUp, TrendingDown, Plus, Trash2, CheckCircle2, Circle, Dumbbell, BookOpen, ChevronDown, ChevronUp, Info, Lightbulb, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TEST_HOW_TO } from "@/lib/testData";

const DEFAULT_SETS = [{ reps: "", weight: "", done: false }];

export default function TestDetailDialog({ open, onClose, test, results = [], onLog }) {
  const [sets, setSets] = useState(DEFAULT_SETS);
  const [logging, setLogging] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);

  const history = [...results].sort((a, b) => b.date.localeCompare(a.date));
  const latest = history[0];
  const previous = history[1];
  const benchmark = latest ? getBenchmarkScore(test, latest.value) : null;
  const trend = latest && previous
    ? (test.better === "lower" ? previous.value - latest.value : latest.value - previous.value)
    : null;

  const howTo = TEST_HOW_TO[test.name] || null;

  const addSet = () => setSets([...sets, { reps: "", weight: "", done: false }]);
  const removeSet = (i) => {
    if (sets.length <= 1) return;
    setSets(sets.filter((_, idx) => idx !== i));
  };
  const updateSet = (i, field, value) => {
    const updated = [...sets];
    updated[i] = { ...updated[i], [field]: value };
    setSets(updated);
  };
  const toggleSetDone = (i) => {
    const updated = [...sets];
    updated[i] = { ...updated[i], done: !updated[i].done };
    setSets(updated);
  };

  const handleSubmit = async () => {
    let totalValue = 0;
    let hasData = false;
    sets.forEach((s) => {
      const reps = parseFloat(s.reps) || 0;
      const weight = parseFloat(s.weight) || 0;
      if (reps > 0) hasData = true;
      totalValue += weight > 0 ? reps * weight : reps;
    });
    if (!hasData) return;
    setLogging(true);
    await onLog(test, totalValue);
    setSets(DEFAULT_SETS);
    setLogging(false);
    onClose();
  };

  if (!open) return null;

  const TestIcon = test.icon || Dumbbell;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full sm:max-w-md max-h-[85vh] rounded-2xl flex flex-col overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <TestIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm">{test.name}</h3>
                <p className="text-[10px] text-muted-foreground">
                  Record in {test.unit} · Benchmarks: {test.benchmark?.[0]}–{test.benchmark?.[3]} {test.unit}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* What this test measures */}
            {howTo && (
              <div className="rounded-xl bg-primary/5 border border-primary/15 p-3.5">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary mb-1">
                      What This Measures
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{howTo.what_it_measures}</p>
                    {howTo.affects && (
                      <p className="text-[10px] text-primary/80 mt-1.5 font-medium">
                        Affects your <strong>{howTo.affects}</strong> stat
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Latest result banner */}
            {latest && benchmark && (
              <div className="rounded-xl p-4" style={{ backgroundColor: benchmark.color + "12", border: `1px solid ${benchmark.color}30` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Latest Result</p>
                    <p className="text-2xl font-heading font-bold mt-0.5">
                      {latest.value} <span className="text-sm text-muted-foreground font-normal">{test.unit}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(latest.date + "T00:00:00"), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className="text-sm font-heading font-bold px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: benchmark.color + "20", color: benchmark.color }}
                    >
                      {benchmark.label}
                    </span>
                    {trend != null && trend !== 0 && (
                      <div className="flex items-center justify-end gap-1 mt-1.5">
                        {trend > 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                        <span className={`text-[10px] font-medium ${trend > 0 ? "text-green-400" : "text-red-400"}`}>
                          {trend > 0 ? "+" : ""}{Math.abs(trend).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* How to perform — expandable tutorial */}
            {howTo && (
              <div>
                <button
                  onClick={() => setShowHowTo(!showHowTo)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">How to perform this test</span>
                  </div>
                  {showHowTo ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                <AnimatePresence>
                  {showHowTo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-3">
                        {/* Step-by-step */}
                        <div>
                          <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-2 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" /> Step-by-Step
                          </h4>
                          <div className="space-y-1">
                            {howTo.instructions?.map((inst, i) => (
                              <div key={i} className="rounded-lg bg-secondary/30 border border-border overflow-hidden">
                                <button
                                  onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                                  className="w-full flex items-center gap-2.5 p-2.5 text-left hover:bg-secondary transition-colors"
                                >
                                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                                  </div>
                                  <span className="text-xs flex-1">{inst.step}</span>
                                  {expandedStep === i ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                                </button>
                                {expandedStep === i && inst.detail && (
                                  <div className="px-2.5 pb-2.5">
                                    <p className="text-xs text-muted-foreground pl-7.5">{inst.detail}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Scoring guide */}
                        {howTo.scoring && (
                          <div className="rounded-lg bg-accent/5 border border-accent/15 p-3">
                            <p className="text-[10px] font-heading font-bold tracking-wider uppercase text-accent mb-1">Scoring Guide</p>
                            <p className="text-xs text-muted-foreground">{howTo.scoring}</p>
                          </div>
                        )}

                        {/* Common mistakes */}
                        {howTo.common_mistakes?.length > 0 && (
                          <div>
                            <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-destructive mb-2 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Common Mistakes
                            </h4>
                            <div className="space-y-1">
                              {howTo.common_mistakes.map((mistake, i) => (
                                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                                  <span className="text-destructive font-bold text-[10px] flex-shrink-0">✕</span>
                                  <p className="text-[10px] text-muted-foreground">{mistake}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Log Sets */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-heading font-bold text-xs tracking-wider uppercase text-muted-foreground">
                  Log Sets
                </h4>
                <button
                  onClick={addSet}
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add Set
                </button>
              </div>
              <div className="space-y-2">
                {sets.map((set, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                      set.done ? "bg-green-500/5 border-green-500/20" : "bg-secondary/30 border-border"
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground w-5 flex-shrink-0">#{i + 1}</span>
                    <input
                      type="number"
                      step="any"
                      value={set.reps}
                      onChange={(e) => updateSet(i, "reps", e.target.value)}
                      placeholder="Reps"
                      className="w-16 bg-background border border-border rounded-md px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Dumbbell className="w-3 h-3" />
                    </div>
                    <input
                      type="number"
                      step="any"
                      value={set.weight}
                      onChange={(e) => updateSet(i, "weight", e.target.value)}
                      placeholder="lbs"
                      className="w-14 bg-background border border-border rounded-md px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={() => toggleSetDone(i)}
                      className={`flex-shrink-0 ${set.done ? "text-green-400" : "text-muted-foreground hover:text-green-400"}`}
                    >
                      {set.done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => removeSet(i)}
                      className="text-muted-foreground hover:text-red-400 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {sets.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Result will be: total (reps × weight) across all sets
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={logging || sets.every((s) => !s.reps)}
            >
              {logging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              {logging ? "Saving..." : "Submit Result"}
            </Button>

            {/* History */}
            {history.length > 1 && (
              <div>
                <h4 className="font-heading font-bold text-xs tracking-wider uppercase text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> History ({history.length})
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {history.slice(0, 10).map((r) => {
                    const b = getBenchmarkScore(test, r.value);
                    return (
                      <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: b?.color || "#6b7280" }}
                        />
                        <span className="text-xs font-medium flex-1">
                          {r.value} {test.unit}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {format(new Date(r.date + "T00:00:00"), "MMM d")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function getBenchmarkScore(test, result) {
  const bench = test.benchmark;
  if (!bench || bench.length < 4) return null;
  if (test.better === "lower") {
    if (result <= bench[3]) return { tier: "excellent", label: "Excellent", color: "#22c55e", score: 90 };
    if (result <= bench[2]) return { tier: "good", label: "Good", color: "#3b82f6", score: 70 };
    if (result <= bench[1]) return { tier: "average", label: "Average", color: "#f59e0b", score: 50 };
    return { tier: "poor", label: "Needs Work", color: "#ef4444", score: 30 };
  } else {
    if (result >= bench[3]) return { tier: "excellent", label: "Excellent", color: "#22c55e", score: 90 };
    if (result >= bench[2]) return { tier: "good", label: "Good", color: "#3b82f6", score: 70 };
    if (result >= bench[1]) return { tier: "average", label: "Average", color: "#f59e0b", score: 50 };
    return { tier: "poor", label: "Needs Work", color: "#ef4444", score: 30 };
  }
}