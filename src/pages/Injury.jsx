import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, Plus, Trash2, Activity, ChevronRight, Shield, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, Dumbbell, Zap, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InjuryTrainingNotes from "@/components/injury/InjuryTrainingNotes";

const BODY_PARTS = [
  "ankle", "knee", "hamstring", "quad", "groin", "hip",
  "back", "shoulder", "foot", "calf", "shin", "elbow", "wrist", "neck", "other"
];

const INJURY_TYPES = [
  "soreness", "strain", "sprain", "contusion", "fracture", "tendonitis", "other"
];

const STATUS_OPTIONS = ["active", "recovering", "healed"];

const BODY_PART_ICONS = {
  ankle: "🦶", knee: "🦵", hamstring: "🦿", quad: "🦵", groin: "🦿",
  hip: "🦿", back: "🧍", shoulder: "💪", foot: "🦶", calf: "🦵",
  shin: "🦵", elbow: "💪", wrist: "🤚", neck: "🧍", other: "🤕"
};

const STATUS_STYLES = {
  active: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-500" },
  recovering: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-500" },
  healed: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", dot: "bg-green-500" },
};

const PAIN_LEVELS = {
  1: "Barely there",
  2: "Mild discomfort",
  3: "Noticeable",
  4: "Troublesome",
  5: "Distracting",
  6: "Hard to ignore",
  7: "Dominating",
  8: "Intense",
  9: "Severe",
  10: "Unbearable",
};

const getTrainingRecommendation = (injuries) => {
  if (!injuries?.length) return null;
  const active = injuries.filter((i) => i.status !== "healed");
  if (!active.length) return null;

  const totalPain = active.reduce((sum, i) => sum + (i.pain_level || 0), 0);
  const avgPain = totalPain / active.length;
  const bodyParts = active.map((i) => i.body_part);

  let load = { intensity: "Normal", focus: "", avoid: [], note: "" };

  if (avgPain >= 7) {
    load = { intensity: "Rest Day", focus: "Active recovery only — light stretching and foam rolling", avoid: ["All high-intensity drills", "Sprints", "Heavy lifting"], note: "Prioritize rest and recovery. Resume light training when pain drops below 5." };
  } else if (avgPain >= 5) {
    load = { intensity: "Light", focus: "Technical work at low intensity, passing drills, light ball work", avoid: ["Contact drills", "Sprints", "Plyometrics"], note: "Reduce volume by 50%. Focus on technique, not intensity." };
  } else if (avgPain >= 3) {
    load = { intensity: "Moderate", focus: "Normal technical work, reduce conditioning load", avoid: ["Max effort sprints", "Heavy tackling drills"], note: "Listen to your body. Stop any exercise that increases pain." };
  }

  if (bodyParts.includes("knee") || bodyParts.includes("ankle")) {
    load.avoid = [...new Set([...load.avoid, "Jumping exercises", "Sharp cutting drills"])];
  }
  if (bodyParts.includes("hamstring") || bodyParts.includes("quad")) {
    load.avoid = [...new Set([...load.avoid, "Full-speed sprints", "Explosive starts"])];
  }
  if (bodyParts.includes("back")) {
    load.avoid = [...new Set([...load.avoid, "Heavy deadlifts", "Twisting under load"])];
  }

  return load;
};

export default function Injury() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });
  const profile = profiles?.[0];

  const { data: injuries = [], isLoading } = useQuery({
    queryKey: ["injuries", profile?.id],
    queryFn: () => base44.entities.InjuryLog.filter({ player_id: profile.id }, "-start_date"),
    enabled: !!profile,
  });

  // New injury form state
  const [form, setForm] = useState({
    body_part: "", injury_type: "", pain_level: 5, notes: "",
  });

  const createInjury = useMutation({
    mutationFn: (data) => base44.entities.InjuryLog.create({ player_id: profile.id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["injuries"] });
      setShowForm(false);
      setForm({ body_part: "", injury_type: "", pain_level: 5, notes: "" });
    },
  });

  const updateInjury = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InjuryLog.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["injuries"] }),
  });

  const deleteInjury = useMutation({
    mutationFn: (id) => base44.entities.InjuryLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["injuries"] }),
  });

  const handleSubmit = () => {
    if (!form.body_part || !form.injury_type) return;
    createInjury.mutate({
      ...form,
      start_date: format(new Date(), "yyyy-MM-dd"),
      status: "active",
      recovery_progress: 0,
      training_modifications: "",
    });
  };

  const activeInjuries = injuries.filter((i) => i.status !== "healed");
  const healedInjuries = injuries.filter((i) => i.status === "healed");
  const recommendation = getTrainingRecommendation(injuries);

  if (!profile) {
    navigate("/onboarding");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">Injury Log</h1>
              <p className="text-xs text-muted-foreground">Track & recover stronger</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4 mr-1" /> Log Injury
          </Button>
        </motion.div>

        {/* Training Load Recommendation */}
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-card border border-border p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-heading font-bold text-sm text-amber-400">Training Load Adjusted</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Intensity</p>
                <p className="text-lg font-heading font-bold text-red-400">{recommendation.intensity}</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Focus</p>
                <p className="text-xs text-amber-400">{recommendation.focus}</p>
              </div>
            </div>
            {recommendation.avoid.length > 0 && (
              <div className="rounded-lg bg-card border border-border p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Avoid</p>
                <div className="flex flex-wrap gap-1.5">
                  {recommendation.avoid.map((item, i) => (
                    <span key={i} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">{item}</span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{recommendation.note}</p>
          </motion.div>
        )}

        {/* No injuries state */}
        {injuries.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl bg-card border border-border p-8 text-center space-y-3"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-heading font-bold text-lg">All Clear!</h3>
            <p className="text-sm text-muted-foreground">No injuries logged. Stay healthy and keep training smart.</p>
          </motion.div>
        )}

        {/* New Injury Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl bg-card border border-red-500/20 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm">Log New Injury</h3>
                  <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground text-xs">Cancel</button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Body Part</Label>
                    <Select value={form.body_part} onValueChange={(v) => setForm({ ...form, body_part: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select body part" />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_PARTS.map((p) => (
                          <SelectItem key={p} value={p}>{BODY_PART_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Injury Type</Label>
                    <Select value={form.injury_type} onValueChange={(v) => setForm({ ...form, injury_type: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INJURY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Pain Level: {form.pain_level}/10 — {PAIN_LEVELS[form.pain_level]}</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-green-400 text-xs">1</span>
                      <Slider
                        value={[form.pain_level]}
                        onValueChange={([v]) => setForm({ ...form, pain_level: v })}
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-red-400 text-xs">10</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Notes (optional)</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="How did it happen? Any specific details..."
                      className="mt-1 h-20 text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!form.body_part || !form.injury_type || createInjury.isPending}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {createInjury.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  Log Injury
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active & Recovering Injuries */}
        {activeInjuries.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
              Active Injuries ({activeInjuries.length})
            </h3>
            {activeInjuries.map((injury, idx) => {
              const styles = STATUS_STYLES[injury.status];
              const daysSince = Math.floor((new Date() - new Date(injury.start_date)) / (1000 * 60 * 60 * 24));
              return (
                <motion.div
                  key={injury.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-xl ${styles.bg} border ${styles.border} p-4 space-y-3`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{BODY_PART_ICONS[injury.body_part]}</span>
                      <div>
                        <p className="font-semibold text-sm capitalize">
                          {injury.injury_type} — {injury.body_part}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                          <span className="capitalize">{injury.status}</span>
                          <span>·</span>
                          <Clock className="w-3 h-3" />
                          <span>{daysSince}d ago</span>
                          <span>·</span>
                          <span>Pain: {injury.pain_level}/10</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteInjury.mutate(injury.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Recovery Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Recovery
                      </span>
                      <span className={styles.text}>{injury.recovery_progress || 0}%</span>
                    </div>
                    <Progress value={injury.recovery_progress || 0} className="h-2" />
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2 flex-wrap">
                    {injury.status !== "healed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() =>
                            updateInjury.mutate({
                              id: injury.id,
                              data: { recovery_progress: Math.min(100, (injury.recovery_progress || 0) + 10) },
                            })
                          }
                        >
                          <Activity className="w-3 h-3 mr-1" /> +10% Recovery
                        </Button>
                        {injury.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => updateInjury.mutate({ id: injury.id, data: { status: "recovering" } })}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Start Recovering
                          </Button>
                        )}
                        {injury.status === "recovering" && (injury.recovery_progress || 0) >= 80 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-green-400 border-green-500/30"
                            onClick={() =>
                              updateInjury.mutate({
                                id: injury.id,
                                data: { status: "healed", recovery_progress: 100, recovery_date: format(new Date(), "yyyy-MM-dd") },
                              })
                            }
                          >
                            <Shield className="w-3 h-3 mr-1" /> Mark Healed
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {injury.notes && (
                    <p className="text-xs text-muted-foreground italic">"{injury.notes}"</p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Training Notes History */}
        <InjuryTrainingNotes profile={profile} />

        {/* Healed Injuries */}
        {healedInjuries.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
              Healed ({healedInjuries.length})
            </h3>
            <div className="space-y-2">
              {healedInjuries.slice(0, 5).map((injury) => {
                const days = injury.recovery_date && injury.start_date
                  ? Math.floor((new Date(injury.recovery_date) - new Date(injury.start_date)) / (1000 * 60 * 60 * 24))
                  : null;
                return (
                  <div key={injury.id} className="flex items-center gap-3 rounded-lg bg-card border border-border p-3">
                    <span className="text-lg">{BODY_PART_ICONS[injury.body_part]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium capitalize">{injury.injury_type} — {injury.body_part}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Healed{days ? ` in ${days} days` : ""} · Pain was {injury.pain_level}/10
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}