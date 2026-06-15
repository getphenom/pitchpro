import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { Loader2, Dumbbell, Clock, Flame, Calendar, ChevronRight, Zap, Target, Shield, Footprints, Save, Timer, BookOpen, ClipboardList, Star, Edit3, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { POSITION_LABELS, getLevel } from "@/lib/gameData";
import { getCategoryXp, getCategoryTier, CATEGORY_THRESHOLDS, TIER_LABELS, TIER_ICONS } from "@/lib/categoryProgression";
import { motion } from "framer-motion";
import PullToRefresh from "@/components/shared/PullToRefresh";
import TrainingPlanGenerator from "@/components/training/TrainingPlanGenerator";
import TrainingCalendar from "@/components/training/TrainingCalendar";
import TrainingTemplates from "@/components/training/TrainingTemplates";
import WarmUpGenerator from "@/components/training/WarmUpGenerator";
import TrainingSchedule from "@/components/training/TrainingSchedule";
import DrillDetailDialog from "@/components/training/DrillDetailDialog";
import DrillEquipmentInfo from "@/components/training/DrillEquipmentInfo";
import EquipmentSummary from "@/components/training/EquipmentSummary";
import MaintenanceTracker from "@/components/equipment/MaintenanceTracker";
import FitnessTrainerChat from "@/components/agents/FitnessTrainerChat";
import PlayerAssessment from "@/components/training/PlayerAssessment";
import TrainingLog from "@/components/training/TrainingLog";

const TRAINING_CATEGORIES = {
  technical: {
    icon: "⚽",
    label: "Technical",
    color: "from-green-500/20 to-green-600/5 border-green-500/20",
    drills: {
      beginner: [
        { name: "Wall Passes", duration: "10 min", desc: "Pass against a wall and control the return — 50 reps each foot", xp: 15 },
        { name: "Cone Dribbling", duration: "15 min", desc: "Weave through 8 cones with both feet — 5 sets", xp: 20 },
        { name: "Juggling Challenge", duration: "10 min", desc: "Beat your personal best in ball juggling", xp: 15 },
      ],
      intermediate: [
        { name: "First Touch Drill", duration: "15 min", desc: "Receive and control from different heights/speeds — 40 reps", xp: 25 },
        { name: "Skill Moves Combo", duration: "15 min", desc: "Chain 3 skill moves together at speed — step-overs, roulettes, elasticos", xp: 25 },
        { name: "Weak Foot Training", duration: "15 min", desc: "Passing, shooting, dribbling with weak foot only", xp: 30 },
      ],
      advanced: [
        { name: "Under Pressure", duration: "20 min", desc: "Receive and play with limited touches under pressure", xp: 35 },
        { name: "Advanced Finishing", duration: "20 min", desc: "Volleys, half-volleys, chips, and placed shots", xp: 35 },
        { name: "Combination Play", duration: "20 min", desc: "One-two passing, third man runs, lay-offs", xp: 35 },
      ],
      elite: [
        { name: "Match Simulation", duration: "25 min", desc: "Full-speed technical circuits with fatigue", xp: 45 },
        { name: "Creative Play", duration: "20 min", desc: "No-look passes, back-heels, rabona crosses", xp: 40 },
        { name: "Position-Specific Mastery", duration: "25 min", desc: "Drills tailored to your exact role", xp: 45 },
      ],
    },
  },
  physical: {
    icon: "💪",
    label: "Physical",
    color: "from-red-500/20 to-red-600/5 border-red-500/20",
    drills: {
      beginner: [
        { name: "Agility Ladder", duration: "10 min", desc: "Basic footwork patterns — in-in-out, icky shuffle", xp: 15 },
        { name: "Sprint Intervals", duration: "15 min", desc: "20m sprints x 8 with 45s rest", xp: 20 },
        { name: "Core Circuit", duration: "10 min", desc: "Planks, mountain climbers, leg raises — 3 rounds", xp: 15 },
      ],
      intermediate: [
        { name: "HIIT Pitch Workout", duration: "20 min", desc: "Box jumps, burpees, shuttle runs — 4 rounds", xp: 30 },
        { name: "Speed & Agility", duration: "15 min", desc: "T-drill, pro-agility, 5-10-5 shuttles", xp: 25 },
        { name: "Strength Circuit", duration: "20 min", desc: "Squats, lunges, push-ups, pull-ups — 3 rounds", xp: 30 },
      ],
      advanced: [
        { name: "Power Training", duration: "25 min", desc: "Plyometrics — box jumps, depth jumps, bounds", xp: 35 },
        { name: "Endurance Run", duration: "30 min", desc: "Tempo run at 70-80% max heart rate", xp: 35 },
        { name: "SAQ Complex", duration: "20 min", desc: "Speed, agility, quickness drills with ball", xp: 35 },
      ],
      elite: [
        { name: "Match Fitness Protocol", duration: "35 min", desc: "Game-intensity running patterns with recovery", xp: 45 },
        { name: "Explosive Power", duration: "25 min", desc: "Olympic lift variations, med ball throws", xp: 40 },
        { name: "Recovery Session", duration: "20 min", desc: "Foam rolling, stretching, mobility work", xp: 20 },
      ],
    },
  },
  tactical: {
    icon: "📋",
    label: "Tactical",
    color: "from-orange-500/20 to-orange-600/10 border-orange-500/20",
    drills: {
      beginner: [
        { name: "Position Awareness", duration: "10 min", desc: "Study where your position should be in different phases", xp: 15 },
        { name: "Formation Basics", duration: "10 min", desc: "Learn 4-3-3 and 4-4-2 structures and roles", xp: 15 },
      ],
      intermediate: [
        { name: "Video Analysis", duration: "15 min", desc: "Watch pro player in your position and take notes", xp: 25 },
        { name: "Set Piece Practice", duration: "15 min", desc: "Corners, free kicks — attacking and defending", xp: 20 },
      ],
      advanced: [
        { name: "Game Reading", duration: "15 min", desc: "Watch match footage and predict next passes", xp: 30 },
        { name: "Pressing Patterns", duration: "15 min", desc: "Practice team pressing triggers and recovery", xp: 30 },
      ],
      elite: [
        { name: "Counter-Attack Analysis", duration: "20 min", desc: "Study transitions and decision-making speed", xp: 40 },
        { name: "Leadership Play", duration: "15 min", desc: "Organize team shape, communication drills", xp: 35 },
      ],
    },
  },
};

function DrillCard({ drill, index, onSelect, profile, favorites }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect?.(drill)}
      className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer group relative"
    >
      {favorites?.includes(drill.name) && (
        <Star className="w-3.5 h-3.5 text-accent fill-accent absolute top-3 right-3" />
      )}
      <div className="flex items-start gap-4 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{drill.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{drill.desc}</p>
          <span className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary transition-colors inline-flex items-center gap-0.5">
            <BookOpen className="w-3 h-3" /> Tap for details
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {drill.duration}
          </div>
          <div className="flex items-center gap-1 text-xs text-accent font-semibold">
            <Flame className="w-3 h-3" />
            {drill.xp} XP
          </div>
        </div>
      </div>
      <DrillEquipmentInfo drillName={drill.name} profileId={profile?.id} />
    </motion.div>
  );
}

const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

export default function Training() {
  const [activeTab, setActiveTab] = useState("technical");
  const [showPlan, setShowPlan] = useState(false);
  const [viewMode, setViewMode] = useState("drills");
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("technical");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMyLevel, setShowMyLevel] = useState(false);
  const [drillSearch, setDrillSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const { data: snapshots = [] } = useQuery({
    queryKey: ["stat-snapshots", profile?.id],
    queryFn: () => base44.entities.StatSnapshot.filter({ player_id: profile.id }, "-week_start", 5),
    enabled: !!profile,
  });

  // Auto-snapshot stats for this week
  useEffect(() => {
    if (!profile || !snapshots) return;
    const alreadySnapped = snapshots.some((s) => s.week_start === currentWeekStart);
    if (alreadySnapped) return;
    base44.entities.StatSnapshot.create({
      player_id: profile.id,
      week_start: currentWeekStart,
      stats: profile.stats || {},
      xp: profile.xp || 0,
      level: getLevel(profile.xp || 0),
    }).then(() => queryClient.invalidateQueries({ queryKey: ["stat-snapshots"] }));
  }, [profile?.id, snapshots?.length]);

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ["training-logs"],
    queryFn: () => base44.entities.DailyLog.list("-date", 30),
    enabled: !!profile,
  });

  const { data: allLogs = [] } = useQuery({
    queryKey: ["all-training-logs"],
    queryFn: () => base44.entities.DailyLog.list("-date", 200),
    enabled: !!profile,
  });

  const categoryXp = getCategoryXp(allLogs);

  // Tier → unlocked drill levels (index into ["beginner","intermediate","advanced","elite"])
  const UNLOCKED_LEVELS = ["beginner", "intermediate", "advanced", "elite"];

  const getUnlockedLevelIndex = (category) => {
    const tier = getCategoryTier(categoryXp[category] || 0);
    // tier -1: only beginner (0), tier 0: up to intermediate (1), tier 1: up to advanced (2), tier 2+: all (3)
    return Math.min(tier + 1, 3);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const level = profile.skill_level || "beginner";

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["profiles"] }),
      queryClient.invalidateQueries({ queryKey: ["training-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["all-training-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["stat-snapshots"] }),
    ]);
  };

  return (
    <div className="min-h-screen bg-background">
      <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">Training</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {POSITION_LABELS[profile.position]} · {level.charAt(0).toUpperCase() + level.slice(1)} drills
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-secondary p-0.5">
              <button
                onClick={() => { setViewMode("drills"); setShowPlan(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "drills" && !showPlan
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5 inline mr-1" />
                Drills
              </button>
              <button
                onClick={() => { setViewMode("calendar"); setShowPlan(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "calendar"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Calendar
              </button>
              <button
                onClick={() => { setViewMode("templates"); setShowPlan(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "templates"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Save className="w-3.5 h-3.5 inline mr-1" />
                Templates
              </button>
              <button
                onClick={() => { setViewMode("warmup"); setShowPlan(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "warmup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Timer className="w-3.5 h-3.5 inline mr-1" />
                Warm-Up
              </button>
              <button
                onClick={() => { setViewMode("schedule"); setShowPlan(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "schedule"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Schedule
              </button>
              <button
                onClick={() => { setViewMode("tests"); setShowPlan(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "tests"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 inline mr-1" />
                Tests
              </button>
              <button
                onClick={() => { setViewMode("log"); setShowPlan(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "log"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                Log
              </button>
            </div>
            {viewMode === "drills" && (
              <Button
                variant={showPlan ? "outline" : "default"}
                className={showPlan ? "" : "bg-primary hover:bg-primary/90"}
                size="sm"
                onClick={() => setShowPlan(!showPlan)}
              >
                {showPlan ? "Back" : "⚡ AI Plan"}
              </Button>
            )}
          </div>
        </div>

        <DrillDetailDialog
          open={!!selectedDrill}
          onClose={() => setSelectedDrill(null)}
          drill={selectedDrill}
          category={selectedCategory}
          profile={profile}
          allDrills={TRAINING_CATEGORIES[selectedCategory]?.drills[level] || []}
          onSwap={(alt) => { setSelectedDrill(alt); }}
        />

        {viewMode === "calendar" ? (
          <TrainingCalendar profile={profile} dailyLogs={dailyLogs} />
        ) : viewMode === "templates" ? (
          <TrainingTemplates profile={profile} trainingCategories={TRAINING_CATEGORIES} level={level} />
        ) : viewMode === "warmup" ? (
          <WarmUpGenerator profile={profile} />
        ) : viewMode === "schedule" ? (
          <TrainingSchedule profile={profile} />
        ) : viewMode === "tests" ? (
          <PlayerAssessment profile={profile} />
        ) : viewMode === "log" ? (
          <TrainingLog profile={profile} />
        ) : showPlan ? (
          <TrainingPlanGenerator profile={profile} />
        ) : (
          <>
            <EquipmentSummary profileId={profile?.id} />
            <MaintenanceTracker profile={profile} />
            
            {/* Drill Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={drillSearch}
                onChange={(e) => setDrillSearch(e.target.value)}
                placeholder="Search drills by name..."
                className="w-full bg-card border border-border rounded-lg pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {drillSearch && (
                <button onClick={() => setDrillSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* Filters: My Level + Favorites */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowMyLevel(!showMyLevel); setShowFavorites(false); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    showMyLevel
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Target className="w-3 h-3" />
                  My Level
                  <span className="text-[10px] opacity-70">({level})</span>
                </button>
                <div className="flex rounded-lg bg-secondary p-0.5">
                  <button
                    onClick={() => setShowFavorites(false)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      !showFavorites ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Drills
                  </button>
                  <button
                    onClick={() => { setShowFavorites(true); setShowMyLevel(false); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                      showFavorites ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Star className={`w-3 h-3 ${showFavorites ? "fill-accent text-accent" : ""}`} /> Favorites
                  </button>
                </div>
              </div>
              {showFavorites && (
                <span className="text-[10px] text-muted-foreground">
                  {(profile?.favorite_drills || []).length} saved
                </span>
              )}
            </div>

            {showFavorites ? (
              /* Favorites view — show saved drills across all categories */
              <div className="space-y-2">
                {(() => {
                  const allDrills = [];
                  Object.entries(TRAINING_CATEGORIES).forEach(([catKey, cat]) => {
                    const unlockedIdx = getUnlockedLevelIndex(catKey);
                    const unlockedLevels = UNLOCKED_LEVELS.slice(0, unlockedIdx + 1);
                    unlockedLevels.forEach((lvl) => {
                      if (showMyLevel && lvl !== level) return;
                      (cat.drills[lvl] || []).forEach((drill) => {
                        if (profile?.favorite_drills?.includes(drill.name)) {
                          allDrills.push({ drill, category: catKey });
                        }
                      });
                    });
                  });
                  const filteredFavs = allDrills.filter(({ drill }) => !drillSearch || drill.name.toLowerCase().includes(drillSearch.toLowerCase()));
                  if (allDrills.length === 0) {
                    return (
                      <div className="text-center py-12 space-y-2">
                        <Star className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                        <p className="text-sm text-muted-foreground">No favorites yet</p>
                        <p className="text-xs text-muted-foreground">Tap a drill and click "Save" to add it here</p>
                      </div>
                    );
                  }
                  if (filteredFavs.length === 0) {
                    return (
                      <div className="text-center py-12 space-y-2">
                        <Search className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                        <p className="text-sm text-muted-foreground">No drills match "{drillSearch}"</p>
                      </div>
                    );
                  }
                  return filteredFavs.map(({ drill, category }, i) => (
                    <DrillCard
                      key={`${category}-${drill.name}`}
                      drill={drill}
                      index={i}
                      profile={profile}
                      favorites={profile?.favorite_drills || []}
                      onSelect={(d) => { setSelectedDrill(d); setSelectedCategory(category); }}
                    />
                  ));
                })()}
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-card border border-border rounded-lg p-1 gap-1">
                  {Object.entries(TRAINING_CATEGORIES).map(([key, cat]) => (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="flex-1 text-xs py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-secondary transition-all"
                    >
                      <span className="mr-1">{cat.icon}</span> {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(TRAINING_CATEGORIES).map(([key, cat]) => {
                  const tier = getCategoryTier(categoryXp[key] || 0);
                  const unlockedIndex = getUnlockedLevelIndex(key);
                  const unlockedLevels = UNLOCKED_LEVELS.slice(0, unlockedIndex + 1);
                  
                  // Collect all drills from unlocked levels (or just my level)
                  const allUnlocked = [];
                  unlockedLevels.forEach((lvl) => {
                    if (showMyLevel && lvl !== level) return;
                    (cat.drills[lvl] || []).forEach((d) => allUnlocked.push({ ...d, _level: lvl }));
                  });

                  return (
                  <TabsContent key={key} value={key} className="space-y-3 mt-4">
                    <div className={`rounded-xl border bg-gradient-to-br p-4 ${cat.color}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{cat.label} Training</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {showMyLevel ? `${allUnlocked.length} ${level}-level drills` : `${allUnlocked.length} drills unlocked`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {tier >= 0 ? (
                            <span className="text-xs font-medium" style={{ color: cat.color?.match(/#[a-f0-9]+/i)?.[0] || "#22c55e" }}>
                              {TIER_ICONS[tier]} {TIER_LABELS[tier]}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">No tier</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Locked tier previews */}
                    {UNLOCKED_LEVELS.slice(unlockedIndex + 1).map((lvl, offset) => {
                      const lvlDrills = cat.drills[lvl] || [];
                      if (lvlDrills.length === 0) return null;
                      const nextTierIdx = tier + offset + 1;
                      const neededXp = CATEGORY_THRESHOLDS[nextTierIdx] || CATEGORY_THRESHOLDS[3];
                      const currentXp = categoryXp[key] || 0;
                      const remaining = Math.max(0, neededXp - currentXp);
                      return (
                        <div key={lvl} className="rounded-xl border border-border/50 bg-secondary/20 p-3 opacity-60">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] uppercase tracking-wider font-heading text-muted-foreground">
                              {lvl} Level — Locked
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              {TIER_ICONS[nextTierIdx]} {remaining} XP to unlock
                            </span>
                          </div>
                          <div className="space-y-1">
                            {lvlDrills.map((drill, i) => (
                              <div key={i} className="flex items-center gap-2 py-1">
                                <span className="text-muted-foreground/40 text-xs">🔒</span>
                                <span className="text-xs text-muted-foreground/60">{drill.name}</span>
                                <span className="text-[10px] text-muted-foreground/40 ml-auto">{drill.xp} XP</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <div className="space-y-2">
                      {(() => {
                        const filtered = allUnlocked.filter(d => !drillSearch || d.name.toLowerCase().includes(drillSearch.toLowerCase()) || d.desc.toLowerCase().includes(drillSearch.toLowerCase()));
                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-10 space-y-2">
                              <Search className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                              <p className="text-xs text-muted-foreground">No drills match "{drillSearch}"</p>
                            </div>
                          );
                        }
                        return filtered.map((drill, i) => (
                          <div key={i}>
                            {i === 0 || drill._level !== filtered[i-1]._level ? (
                              <p className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-2 mt-1">
                                {drill._level}
                              </p>
                            ) : null}
                            <DrillCard
                              drill={drill}
                              index={i}
                              profile={profile}
                              favorites={profile?.favorite_drills || []}
                              onSelect={(d) => { setSelectedDrill(d); setSelectedCategory(key); }}
                            />
                          </div>
                        ));
                      })()}
                    </div>
                  </TabsContent>
                )})}
              </Tabs>
            )}
          </>
        )}

        {/* Fitness Trainer Agent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card border border-red-500/20 p-5"
        >
          <FitnessTrainerChat profile={profile} />
        </motion.div>
      </div>
      </PullToRefresh>
    </div>
  );
}