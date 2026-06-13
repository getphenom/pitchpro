import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Trophy, User, Target, Ruler } from "lucide-react";

const STEPS = ["welcome", "basics", "position", "physical"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    player_name: "",
    age: "",
    position: "",
    skill_level: "",
    preferred_foot: "right",
    height_ft: "",
    height_in: "",
    weight_lbs: "",
    weekly_training_days: 5,
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const canProceed = () => {
    if (step === 1) return form.player_name && form.age;
    if (step === 2) return form.position && form.skill_level;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    const heightCm = (form.height_ft || form.height_in)
      ? Math.round((Number(form.height_ft || 0) * 30.48) + (Number(form.height_in || 0) * 2.54))
      : undefined;
    const weightKg = form.weight_lbs ? Math.round(Number(form.weight_lbs) * 0.453592) : undefined;

    const profileData = {
      ...form,
      age: Number(form.age),
      height_cm: heightCm,
      weight_kg: weightKg,
      xp: 50,
      level: 1,
      streak_days: 0,
      badges: ["first_login"],
      stats: {
        pace: 50, shooting: 50, passing: 50, dribbling: 50,
        defending: 50, physical: 50, mental: 50, tactical: 50,
      },
    };
    await base44.entities.PlayerProfile.create(profileData);
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-secondary"}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto animate-float">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-heading font-bold tracking-tight">
                  Your Pro Journey<br />
                  <span className="text-primary">Starts Now</span>
                </h1>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Train like a pro. Eat like a pro. Think like a pro. Every day brings you closer to greatness.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-heading font-bold">About You</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Player Name</Label>
                    <Input
                      placeholder="Enter your name"
                      value={form.player_name}
                      onChange={(e) => update("player_name", e.target.value)}
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Age</Label>
                    <Input
                      type="number"
                      placeholder="10+"
                      min={10}
                      value={form.age}
                      onChange={(e) => update("age", e.target.value)}
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-heading font-bold">Your Game</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Primary Position</Label>
                    <Select value={form.position} onValueChange={(v) => update("position", v)}>
                      <SelectTrigger className="mt-1 bg-secondary border-border">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(POSITION_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Skill Level</Label>
                    <Select value={form.skill_level} onValueChange={(v) => update("skill_level", v)}>
                      <SelectTrigger className="mt-1 bg-secondary border-border">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (Just starting)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (3-6 years)</SelectItem>
                        <SelectItem value="elite">Elite (6+ years competitive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Preferred Foot</Label>
                    <Select value={form.preferred_foot} onValueChange={(v) => update("preferred_foot", v)}>
                      <SelectTrigger className="mt-1 bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-heading font-bold">Physical Info</h2>
                </div>
                <p className="text-xs text-muted-foreground">Optional — helps personalize nutrition & hydration</p>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Height</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="5"
                          min={1}
                          max={7}
                          value={form.height_ft}
                          onChange={(e) => update("height_ft", e.target.value)}
                          className="bg-secondary border-border pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ft</span>
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="6"
                          min={0}
                          max={11}
                          value={form.height_in}
                          onChange={(e) => update("height_in", e.target.value)}
                          className="bg-secondary border-border pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Weight (lbs)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 120"
                      value={form.weight_lbs}
                      onChange={(e) => update("weight_lbs", e.target.value)}
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Training Days / Week</Label>
                    <Select value={String(form.weekly_training_days)} onValueChange={(v) => update("weekly_training_days", Number(v))}>
                      <SelectTrigger className="mt-1 bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7].map((d) => (
                          <SelectItem key={d} value={String(d)}>{d} days</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? "Creating..." : "Let's Go! ⚡"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}