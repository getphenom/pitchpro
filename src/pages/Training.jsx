import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek } from "date-fns";
import { Loader2, Dumbbell, Clock, Flame, Calendar, ChevronRight, Zap, Target, Shield, Footprints, Save, Timer, BookOpen, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { POSITION_LABELS, getLevel } from "@/lib/gameData";
import { motion } from "framer-motion";
import TrainingPlanGenerator from "@/components/training/TrainingPlanGenerator";
import TrainingCalendar from "@/components/training/TrainingCalendar";
import TrainingTemplates from "@/components/training/TrainingTemplates";
import WarmUpGenerator from "@/components/training/WarmUpGenerator";
import TrainingSchedule from "@/components/training/TrainingSchedule";
import TutorialModal from "@/components/shared/TutorialModal";
import DrillEquipmentInfo from "@/components/training/DrillEquipmentInfo";
import EquipmentSummary from "@/components/training/EquipmentSummary";
import FitnessTrainerChat from "@/components/agents/FitnessTrainerChat";
import PlayerAssessment from "@/components/training/PlayerAssessment";

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
    color: "from-orange-500/20 to-orange-600/5 border-orange-500/20",
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

function DrillCard({ drill, index, onTutorial, profile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onTutorial?.(drill)}
      className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{drill.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{drill.desc}</p>
          <span className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary transition-colors inline-flex items-center gap-0.5">
            <BookOpen className="w-3 h-3" /> Tap for tutorial
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
  const [tutorialItem, setTutorialItem] = useState(null);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const level = profile.skill_level || "beginner";

  return (
    <div className="min-h-screen bg-background">
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

        <TutorialModal
          open={!!tutorialItem}
          onClose={() => setTutorialItem(null)}
          item={tutorialItem}
          context={`This is a ${tutorialItem?.category || "training"} drill for a ${profile ? POSITION_LABELS[profile.position] : "soccer player"} at ${level} level.`}
          triggerLabel={tutorialItem?.name || "Tutorial"}
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
        ) : showPlan ? (
          <TrainingPlanGenerator profile={profile} />
        ) : (
          <>
            <EquipmentSummary profileId={profile?.id} />
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-secondary">
                {Object.entries(TRAINING_CATEGORIES).map(([key, cat]) => (
                  <TabsTrigger key={key} value={key} className="flex-1 text-xs">
                    <span className="mr-1">{cat.icon}</span> {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(TRAINING_CATEGORIES).map(([key, cat]) => (
                <TabsContent key={key} value={key} className="space-y-3 mt-4">
                  <div className={`rounded-xl border bg-gradient-to-br p-4 ${cat.color}`}>
                    <h3 className="font-semibold text-sm">{cat.label} Training</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cat.drills[level]?.length || 0} drills for your level
                    </p>
                  </div>
                  <div className="space-y-2">
                    {(cat.drills[level] || []).map((drill, i) => (
                      <DrillCard key={i} drill={drill} index={i} onTutorial={setTutorialItem} profile={profile} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
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
    </div>
  );
}