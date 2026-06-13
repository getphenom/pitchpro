import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { POSITION_LABELS, getLevel } from "@/lib/gameData";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Timer, Footprints, ArrowUp, Gauge, Activity, Target, ClipboardCheck,
  Trophy, TrendingUp, TrendingDown, Zap, Siren, Award, Dumbbell, Shirt, ShieldCheck, History, Flame, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TestDetailDialog from "@/components/training/TestDetailDialog";

// ─── Age Group Definitions ───
const AGE_GROUPS = {
  foundation: { min: 10, max: 12, label: "Foundation (U10-U12)", color: "#22c55e" },
  development: { min: 13, max: 15, label: "Development (U13-U15)", color: "#3b82f6" },
  performance: { min: 16, max: 18, label: "Performance (U16-U18)", color: "#f59e0b" },
  elite: { min: 19, max: 99, label: "Elite (U19+)", color: "#ef4444" },
};

function getAgeGroup(age) {
  if (age <= 12) return "foundation";
  if (age <= 15) return "development";
  if (age <= 18) return "performance";
  return "elite";
}

// ─── Fitness Tests by Age Group ───
const FITNESS_TESTS = {
  foundation: [
    { id: "sprint_20m", name: "20m Sprint", unit: "seconds", icon: Timer, affects: "pace", benchmark: [4.5, 4.0, 3.6, 3.3], better: "lower" },
    { id: "agility_t", name: "T-Test Agility", unit: "seconds", icon: Footprints, affects: "physical", benchmark: [14.0, 12.5, 11.5, 10.5], better: "lower" },
    { id: "vertical_jump", name: "Vertical Jump", unit: "inches", icon: ArrowUp, affects: "physical", benchmark: [8, 10, 14, 18], better: "higher" },
    { id: "pushups", name: "Push-ups (1 min)", unit: "reps", icon: Dumbbell, affects: "physical", benchmark: [10, 15, 25, 35], better: "higher" },
    { id: "sit_and_reach", name: "Sit & Reach", unit: "inches", icon: Activity, affects: "physical", benchmark: [2, 4, 6, 8], better: "higher" },
  ],
  development: [
    { id: "sprint_30m", name: "30m Sprint", unit: "seconds", icon: Timer, affects: "pace", benchmark: [5.5, 5.0, 4.5, 4.1], better: "lower" },
    { id: "agility_t", name: "T-Test Agility", unit: "seconds", icon: Footprints, affects: "physical", benchmark: [13.0, 11.5, 10.5, 9.5], better: "lower" },
    { id: "vertical_jump", name: "Vertical Jump", unit: "inches", icon: ArrowUp, affects: "physical", benchmark: [12, 16, 20, 24], better: "higher" },
    { id: "pushups", name: "Push-ups (1 min)", unit: "reps", icon: Dumbbell, affects: "physical", benchmark: [20, 30, 40, 50], better: "higher" },
    { id: "beep_test", name: "Yo-Yo Intermittent L1", unit: "level", icon: Activity, affects: "physical", benchmark: [10, 13, 16, 19], better: "higher" },
    { id: "sit_and_reach", name: "Sit & Reach", unit: "inches", icon: Activity, affects: "physical", benchmark: [4, 6, 8, 10], better: "higher" },
  ],
  performance: [
    { id: "sprint_40yd", name: "40-Yard Dash", unit: "seconds", icon: Timer, affects: "pace", benchmark: [5.8, 5.3, 4.9, 4.6], better: "lower" },
    { id: "agility_505", name: "5-0-5 Agility", unit: "seconds", icon: Footprints, affects: "pace", benchmark: [3.0, 2.7, 2.5, 2.3], better: "lower" },
    { id: "vertical_jump", name: "Vertical Jump", unit: "inches", icon: ArrowUp, affects: "physical", benchmark: [16, 20, 24, 28], better: "higher" },
    { id: "pushups", name: "Push-ups (1 min)", unit: "reps", icon: Dumbbell, affects: "physical", benchmark: [30, 40, 50, 60], better: "higher" },
    { id: "beep_test", name: "Yo-Yo Intermittent L2", unit: "level", icon: Activity, affects: "physical", benchmark: [14, 17, 20, 22], better: "higher" },
    { id: "broad_jump", name: "Standing Broad Jump", unit: "inches", icon: ArrowUp, affects: "physical", benchmark: [60, 70, 80, 90], better: "higher" },
  ],
  elite: [
    { id: "sprint_40yd", name: "40-Yard Dash", unit: "seconds", icon: Timer, affects: "pace", benchmark: [5.5, 5.0, 4.7, 4.4], better: "lower" },
    { id: "agility_505", name: "5-0-5 Agility", unit: "seconds", icon: Footprints, affects: "pace", benchmark: [2.8, 2.5, 2.3, 2.1], better: "lower" },
    { id: "vertical_jump", name: "Vertical Jump", unit: "inches", icon: ArrowUp, affects: "physical", benchmark: [20, 24, 28, 32], better: "higher" },
    { id: "pushups", name: "Push-ups (1 min)", unit: "reps", icon: Dumbbell, affects: "physical", benchmark: [40, 50, 60, 75], better: "higher" },
    { id: "beep_test", name: "Yo-Yo Intermittent L2", unit: "level", icon: Activity, affects: "physical", benchmark: [16, 19, 21, 23], better: "higher" },
    { id: "broad_jump", name: "Standing Broad Jump", unit: "inches", icon: ArrowUp, affects: "physical", benchmark: [72, 82, 92, 100], better: "higher" },
    { id: "bench_press", name: "Bench Press (bodyweight)", unit: "reps", icon: Dumbbell, affects: "physical", benchmark: [5, 8, 12, 16], better: "higher" },
  ],
};

// ─── Position-Specific Skill Tests ───
const SKILL_TESTS = {
  goalkeeper: [
    { id: "gk_handling", name: "Shot Handling", unit: "saves/10", icon: ShieldCheck, affects: "defending", benchmark: [4, 6, 7, 9], better: "higher" },
    { id: "gk_distribution", name: "Distribution Accuracy", unit: "/10", icon: Target, affects: "passing", benchmark: [3, 5, 7, 8], better: "higher" },
    { id: "gk_reactions", name: "Reaction Save Test", unit: "saves/10", icon: Zap, affects: "defending", benchmark: [2, 4, 5, 7], better: "higher" },
    { id: "gk_aerial", name: "Cross Collection", unit: "catches/10", icon: ArrowUp, affects: "physical", benchmark: [3, 5, 6, 8], better: "higher" },
  ],
  center_back: [
    { id: "cb_heading", name: "Heading Accuracy", unit: "/10", icon: Target, affects: "defending", benchmark: [4, 5, 7, 8], better: "higher" },
    { id: "cb_tackling", name: "Standing Tackle Test", unit: "/10", icon: ShieldCheck, affects: "defending", benchmark: [4, 6, 7, 9], better: "higher" },
    { id: "cb_long_pass", name: "Long Passing Accuracy", unit: "/10", icon: Target, affects: "passing", benchmark: [3, 5, 6, 8], better: "higher" },
    { id: "cb_1v1", name: "1v1 Defending", unit: "stops/10", icon: Footprints, affects: "defending", benchmark: [3, 5, 7, 8], better: "higher" },
  ],
  full_back: [
    { id: "fb_crossing", name: "Crossing Accuracy", unit: "/10", icon: Target, affects: "passing", benchmark: [3, 5, 6, 8], better: "higher" },
    { id: "fb_tackling", name: "Slide Tackle Test", unit: "/10", icon: ShieldCheck, affects: "defending", benchmark: [3, 5, 6, 8], better: "higher" },
    { id: "fb_overlap", name: "Overlap Sprint + Cross", unit: "seconds", icon: Timer, affects: "pace", benchmark: [14, 12, 10.5, 9.5], better: "lower" },
    { id: "fb_1v1", name: "1v1 Defending", unit: "stops/10", icon: Footprints, affects: "defending", benchmark: [3, 5, 7, 8], better: "higher" },
  ],
  defensive_mid: [
    { id: "dm_passing", name: "Passing Accuracy Circuit", unit: "/20", icon: Target, affects: "passing", benchmark: [10, 13, 16, 18], better: "higher" },
    { id: "dm_intercept", name: "Interception Reading", unit: "reads/10", icon: ShieldCheck, affects: "tactical", benchmark: [3, 5, 6, 8], better: "higher" },
    { id: "dm_tackling", name: "Tackle & Turn", unit: "/10", icon: Footprints, affects: "defending", benchmark: [4, 5, 7, 8], better: "higher" },
    { id: "dm_shielding", name: "Ball Shielding", unit: "seconds", icon: ShieldCheck, affects: "physical", benchmark: [5, 10, 15, 20], better: "higher" },
  ],
  central_mid: [
    { id: "cm_passing", name: "Passing Accuracy Circuit", unit: "/20", icon: Target, affects: "passing", benchmark: [10, 13, 16, 18], better: "higher" },
    { id: "cm_vision", name: "Vision Test (through balls)", unit: "/10", icon: Activity, affects: "tactical", benchmark: [3, 5, 6, 8], better: "higher" },
    { id: "cm_dribbling", name: "Dribble + Pass Combo", unit: "seconds", icon: Footprints, affects: "dribbling", benchmark: [18, 15, 13, 11], better: "lower" },
    { id: "cm_shooting", name: "Long Shot Accuracy", unit: "/10", icon: Target, affects: "shooting", benchmark: [2, 4, 5, 7], better: "higher" },
  ],
  attacking_mid: [
    { id: "am_creativity", name: "Creative Passing Test", unit: "/10", icon: Target, affects: "passing", benchmark: [3, 5, 7, 8], better: "higher" },
    { id: "am_shooting", name: "Shot Accuracy (18yd box)", unit: "/10", icon: Target, affects: "shooting", benchmark: [3, 5, 6, 8], better: "higher" },
    { id: "am_dribbling", name: "Dribble Through Cones", unit: "seconds", icon: Footprints, affects: "dribbling", benchmark: [16, 13.5, 11.5, 10], better: "lower" },
    { id: "am_vision", name: "Through Ball Accuracy", unit: "/10", icon: Activity, affects: "tactical", benchmark: [3, 5, 6, 8], better: "higher" },
  ],
  winger: [
    { id: "wg_crossing", name: "Crossing Accuracy", unit: "/10", icon: Target, affects: "passing", benchmark: [3, 5, 6, 8], better: "higher" },
    { id: "wg_dribbling", name: "Speed Dribble Test", unit: "seconds", icon: Timer, affects: "dribbling", benchmark: [14, 12, 10.5, 9], better: "lower" },
    { id: "wg_finishing", name: "Cut Inside + Finish", unit: "/10", icon: Target, affects: "shooting", benchmark: [3, 5, 6, 8], better: "higher" },
    { id: "wg_tracking", name: "Recovery Run Test", unit: "seconds", icon: Footprints, affects: "pace", benchmark: [12, 10.5, 9.5, 8.5], better: "lower" },
  ],
  striker: [
    { id: "st_finishing", name: "Finishing Accuracy", unit: "/10", icon: Target, affects: "shooting", benchmark: [3, 5, 6, 8], better: "higher" },
    { id: "st_heading", name: "Heading at Goal", unit: "/10", icon: Target, affects: "shooting", benchmark: [2, 4, 5, 7], better: "higher" },
    { id: "st_1v1", name: "1v1 Finishing", unit: "goals/10", icon: Footprints, affects: "dribbling", benchmark: [2, 3, 5, 6], better: "higher" },
    { id: "st_movement", name: "Off-Ball Movement", unit: "/10", icon: Activity, affects: "tactical", benchmark: [3, 5, 6, 8], better: "higher" },
  ],
};

// Equipment checklist
const EQUIPMENT_CATEGORIES = {
  footwear: { label: "Footwear", emoji: "👟", items: ["Cleats (FG)", "Turf Shoes", "Indoor Shoes", "Running Shoes", "Slides/Flip-flops"] },
  training_gear: { label: "Training Gear", emoji: "🎒", items: ["Soccer Ball (Size 5)", "Cone Set (10+)", "Agility Ladder", "Speed Hurdles", "Resistance Bands", "Training Bib/Pinnie", "Ball Pump + Needles"] },
  protection: { label: "Protection", emoji: "🛡️", items: ["Shin Guards", "Goalkeeper Gloves", "Mouthguard", "Ankle Support", "Compression Sleeves"] },
  recovery: { label: "Recovery", emoji: "🛌", items: ["Foam Roller", "Massage Ball", "Ice Pack", "Resistance Bands (Recovery)", "Yoga Mat"] },
  technology: { label: "Technology", emoji: "⌚", items: ["Fitness Tracker/Watch", "Heart Rate Monitor", "GPS Tracker", "Training App Subscription"] },
  nutrition: { label: "Nutrition", emoji: "🥤", items: ["Water Bottle (32oz+)", "Protein Shaker", "Snack Container", "Electrolyte Tablets"] },
};

// ─── Helper: benchmark score ───
function getBenchmarkScore(test, result) {
  const bench = test.benchmark;
  if (!bench || bench.length < 4) return null;
  // bench = [poor, average, good, excellent]
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

// ─── Components ───

function TestCard({ test, results = [], onLog }) {
  const [open, setOpen] = useState(false);
  const latest = results.sort((a, b) => b.date.localeCompare(a.date))[0];
  const previous = results.sort((a, b) => b.date.localeCompare(a.date))[1];
  const benchmark = latest ? getBenchmarkScore(test, latest.value) : null;
  const trend = latest && previous ? (test.better === "lower" ? previous.value - latest.value : latest.value - previous.value) : null;

  return (
    <>
      <TestDetailDialog
        open={open}
        onClose={() => setOpen(false)}
        test={test}
        results={results}
        onLog={onLog}
      />
      <div
        onClick={() => setOpen(true)}
        className="rounded-xl bg-card border border-border p-4 hover:border-primary/30 cursor-pointer transition-all group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${benchmark ? "" : "bg-secondary"}`}
              style={benchmark ? { backgroundColor: benchmark.color + "18" } : {}}>
              <test.icon className="w-4 h-4" style={{ color: benchmark?.color }} />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate">{test.name}</h4>
              <p className="text-[10px] text-muted-foreground">{test.benchmark[0]}–{test.benchmark[3]} {test.unit}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {benchmark && (
              <span className="text-xs font-heading font-bold px-2 py-1 rounded-md"
                style={{ backgroundColor: benchmark.color + "18", color: benchmark.color }}>
                {benchmark.label}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {latest && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Latest: </span>
                <span className="font-bold">{latest.value} {test.unit}</span>
              </div>
              {trend != null && trend !== 0 && (
                <div className="flex items-center gap-1">
                  {trend > 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                  <span className={trend > 0 ? "text-green-400" : "text-red-400"}>{trend > 0 ? "+" : ""}{Math.abs(trend).toFixed(1)}</span>
                </div>
              )}
              {previous && (
                <span className="text-muted-foreground">Prev: {previous.value}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                Logged {format(new Date(latest.date + "T00:00:00"), "MMM d, yyyy")}
              </p>
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-0.5">
                Tap to log sets
              </span>
            </div>
          </div>
        )}

        {!latest && (
          <div className="mt-3">
            <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
              Tap to start logging
            </span>
          </div>
        )}
      </div>
    </>
  );
}

function EquipmentChecklist({ profile }) {
  const queryClient = useQueryClient();

  const { data: equipList = [], isLoading } = useQuery({
    queryKey: ["player-equipment", profile?.id],
    queryFn: () => base44.entities.PlayerEquipment.filter({ player_id: profile.id }),
    enabled: !!profile,
  });

  const equipment = equipList[0];
  const items = equipment?.items || [];

  const saveEquipment = useMutation({
    mutationFn: async (data) => {
      if (equipment) return base44.entities.PlayerEquipment.update(equipment.id, data);
      return base44.entities.PlayerEquipment.create({ player_id: profile.id, ...data });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["player-equipment"] }),
  });

  const initializeEquipment = () => {
    const allItems = [];
    Object.entries(EQUIPMENT_CATEGORIES).forEach(([catKey, cat]) => {
      cat.items.forEach((itemName) => {
        allItems.push({ name: itemName, category: catKey, owned: false, condition: "not_applicable" });
      });
    });
    saveEquipment.mutate({ items: allItems });
  };

  const toggleOwned = (idx) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], owned: !updated[idx].owned, condition: !updated[idx].owned ? "good" : "not_applicable" };
    saveEquipment.mutate({ items: updated });
  };

  const updateCondition = (idx, condition) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], condition };
    saveEquipment.mutate({ items: updated });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  if (!equipment || items.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <Shirt className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">Track your soccer equipment</p>
        <Button size="sm" onClick={initializeEquipment}>Set Up Equipment List</Button>
      </div>
    );
  }

  const owned = items.filter((i) => i.owned).length;
  const needsReplacement = items.filter((i) => i.condition === "needs_replacement").length;

  // Group by category
  const grouped = {};
  items.forEach((item, idx) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push({ ...item, idx });
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <p className="text-lg font-heading font-bold text-primary">{owned}</p>
          <p className="text-[10px] text-muted-foreground">Owned</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <p className="text-lg font-heading font-bold text-muted-foreground">{items.length - owned}</p>
          <p className="text-[10px] text-muted-foreground">Needed</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <p className="text-lg font-heading font-bold text-red-400">{needsReplacement}</p>
          <p className="text-[10px] text-muted-foreground">Worn</p>
        </div>
      </div>

      {Object.entries(grouped).map(([catKey, catItems]) => {
        const cat = EQUIPMENT_CATEGORIES[catKey];
        if (!cat) return null;
        return (
          <div key={catKey}>
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <span>{cat.emoji}</span> {cat.label}
            </h4>
            <div className="space-y-1">
              {catItems.map((item) => (
                <div key={item.idx}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    item.owned ? "bg-green-500/5 border border-green-500/10" : "bg-card border border-border"
                  }`}
                >
                  <button
                    onClick={() => toggleOwned(item.idx)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.owned ? "bg-green-500 border-green-500" : "border-border"
                    }`}
                  >
                    {item.owned && <ClipboardCheck className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`text-xs flex-1 ${item.owned ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.name}
                  </span>
                  {item.owned && (
                    <select
                      value={item.condition}
                      onChange={(e) => updateCondition(item.idx, e.target.value)}
                      className="text-[10px] bg-secondary border border-border rounded-md px-1.5 py-0.5"
                    >
                      <option value="new">New</option>
                      <option value="good">Good</option>
                      <option value="worn">Worn</option>
                      <option value="needs_replacement">Replace</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PlayerAssessment({ profile }) {
  const [testTab, setTestTab] = useState("fitness");
  const [selectedHistoryTest, setSelectedHistoryTest] = useState(null);
  const queryClient = useQueryClient();

  const ageGroup = getAgeGroup(profile.age);
  const fitnessTests = FITNESS_TESTS[ageGroup] || FITNESS_TESTS.development;
  const skillTests = SKILL_TESTS[profile.position] || [];

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["skill-test-results", profile.id],
    queryFn: () => base44.entities.SkillTestResult.filter({ player_id: profile.id }, "-date", 50),
    enabled: !!profile,
  });

  const logResult = useMutation({
    mutationFn: async ({ test_id, value, affects }) => {
      const allTests = [...fitnessTests, ...skillTests];
      const testDef = allTests.find((t) => t.id === test_id);
      const bench = testDef ? getBenchmarkScore(testDef, value) : null;
      const statScore = bench?.score || 50;
      const today = new Date().toISOString().split("T")[0];

      // Save test result to history
      await base44.entities.SkillTestResult.create({
        player_id: profile.id,
        test_id,
        value,
        date: today,
        stat_score: statScore,
      });

      // Blend into profile stats: 70% current + 30% new
      const updates = {};
      if (affects && profile.stats) {
        const currentStat = profile.stats[affects] || 50;
        const newStat = Math.round(currentStat * 0.7 + statScore * 0.3);
        updates.stats = { ...profile.stats, [affects]: newStat };
      }

      // Award XP for completing a test (15-25 XP based on score)
      const xpEarned = bench ? Math.round(15 + (bench.score / 100) * 10) : 15;
      updates.xp = (profile.xp || 0) + xpEarned;
      updates.level = getLevel(updates.xp);

      // Track streak
      const lastActive = profile.last_active_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastActive === yesterdayStr) {
        updates.streak_days = (profile.streak_days || 0) + 1;
      } else if (lastActive !== today) {
        updates.streak_days = 1;
      }
      updates.last_active_date = today;

      await base44.entities.PlayerProfile.update(profile.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-test-results"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const handleLog = async (test, value) => {
    await logResult.mutateAsync({ test_id: test.id, value, affects: test.affects });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const ageGroupInfo = AGE_GROUPS[ageGroup];
  const fitnessResults = results.filter((r) => fitnessTests.some((t) => t.id === r.test_id));
  const skillResults = results.filter((r) => skillTests.some((t) => t.id === r.test_id));

  return (
    <div className="space-y-5">
      <TestDetailDialog
        open={!!selectedHistoryTest}
        onClose={() => setSelectedHistoryTest(null)}
        test={selectedHistoryTest?.test}
        results={selectedHistoryTest?.testResults || []}
        onLog={handleLog}
      />

      {/* Age Group Banner */}
      <div className="rounded-xl border p-4" style={{ borderColor: ageGroupInfo.color + "30", backgroundColor: ageGroupInfo.color + "08" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: ageGroupInfo.color + "20" }}>
            <Trophy className="w-5 h-5" style={{ color: ageGroupInfo.color }} />
          </div>
          <div>
            <p className="font-heading font-bold text-sm" style={{ color: ageGroupInfo.color }}>{ageGroupInfo.label}</p>
            <p className="text-[10px] text-muted-foreground">{POSITION_LABELS[profile.position]} · Tests for {profile.age} year-olds</p>
          </div>
        </div>
      </div>

      {/* Tab switch */}
      <Tabs value={testTab} onValueChange={setTestTab}>
        <TabsList className="w-full bg-secondary grid grid-cols-4">
          <TabsTrigger value="fitness" className="text-xs">
            <Timer className="w-3.5 h-3.5 mr-1" /> Fitness
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs">
            <Target className="w-3.5 h-3.5 mr-1" /> Skills
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <History className="w-3.5 h-3.5 mr-1" /> History
          </TabsTrigger>
          <TabsTrigger value="equipment" className="text-xs">
            <Shirt className="w-3.5 h-3.5 mr-1" /> Gear
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fitness" className="mt-4 space-y-3">
          {fitnessTests.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">No fitness tests for your age group yet.</p>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{fitnessResults.length} results logged</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ef4444" }} /> Poor
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} /> Avg
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} /> Good
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22c55e" }} /> Exc
                </span>
              </div>
              {fitnessTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  results={fitnessResults.filter((r) => r.test_id === test.id)}
                  onLog={handleLog}
                />
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="skills" className="mt-4 space-y-3">
          {skillTests.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">
              No position-specific tests for {POSITION_LABELS[profile.position]} yet.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {POSITION_LABELS[profile.position]} specific skills · {skillResults.length} results logged
              </p>
              {skillTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  results={skillResults.filter((r) => r.test_id === test.id)}
                  onLog={handleLog}
                />
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <History className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No tests logged yet.</p>
              <p className="text-xs text-muted-foreground">Complete a fitness or skill test to start building your history.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{results.length} total results</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-accent" /> {profile.xp || 0} XP total</span>
              </div>
              <div className="space-y-2">
                {results
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 30)
                  .map((r) => {
                    const allTests = [...fitnessTests, ...skillTests];
                    const testDef = allTests.find((t) => t.id === r.test_id);
                    const bench = testDef ? getBenchmarkScore(testDef, r.value) : null;
                    const testName = testDef?.name || r.test_id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => {
                          if (testDef) setSelectedHistoryTest({ test: testDef, testResults: results.filter((rr) => rr.test_id === r.test_id) });
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 cursor-pointer transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{testName}</p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(r.date + "T00:00:00"), "MMM d, yyyy")}</p>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <div>
                            <p className="text-sm font-heading font-bold">{r.value} <span className="text-[10px] text-muted-foreground font-normal">{testDef?.unit}</span></p>
                            {bench && (
                              <span className="text-[10px] font-medium" style={{ color: bench.color }}>{bench.label}</span>
                            )}
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          <EquipmentChecklist profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}