import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Circle, ChevronRight, Dumbbell, Droplets, Utensils, Brain, Sparkles } from "lucide-react";
import { POSITION_LABELS } from "@/lib/gameData";

const today = new Date().toISOString().split("T")[0];

function generateRoadmapItems(profile, dailyLog) {
  const pos = profile?.position || "central_mid";
  const completedIds = dailyLog?.quests_completed || [];
  const waterMl = dailyLog?.water_ml || 0;
  const meals = dailyLog?.meals_logged || [];
  const mentalDone = dailyLog?.mental_session_done;

  const positionDrills = {
    goalkeeper: [
      { title: "Shot Stopping Drill", desc: "Diving saves from different angles — 20 reps", drillRef: "Wall Passes", drillCat: "technical" },
      { title: "Distribution Practice", desc: "Goal kicks and throws — 15 minutes", drillRef: "Cone Dribbling", drillCat: "technical" },
    ],
    striker: [
      { title: "Finishing Drill", desc: "Shots from inside the box — 30 shots", drillRef: "Advanced Finishing", drillCat: "technical" },
      { title: "Movement Runs", desc: "Runs behind the defence line — 10 reps", drillRef: "Sprint Intervals", drillCat: "physical" },
    ],
    winger: [
      { title: "1v1 Dribbling", desc: "Beat defenders in 1v1 — 15 attempts", drillRef: "Skill Moves Combo", drillCat: "technical" },
      { title: "Crossing Practice", desc: "Deliver crosses from wide areas — 20 crosses", drillRef: "Weak Foot Training", drillCat: "technical" },
    ],
    center_back: [
      { title: "Heading Practice", desc: "Defensive headers from crosses — 20 reps", drillRef: "Agility Ladder", drillCat: "physical" },
      { title: "Long Passing Drill", desc: "Accurate long balls to targets — 20 passes", drillRef: "Wall Passes", drillCat: "technical" },
    ],
    full_back: [
      { title: "Overlapping Runs", desc: "Overlap and underlap runs — 10 reps", drillRef: "Speed & Agility", drillCat: "physical" },
      { title: "Defensive 1v1", desc: "Jockeying and tackling — 15 minutes", drillRef: "Cone Dribbling", drillCat: "technical" },
    ],
    defensive_mid: [
      { title: "Interception Drill", desc: "Read passes and intercept — 15 minutes", drillRef: "First Touch Drill", drillCat: "technical" },
      { title: "Ball Recovery", desc: "Win ball back and transition — 20 reps", drillRef: "HIIT Pitch Workout", drillCat: "physical" },
    ],
    central_mid: [
      { title: "Passing Combinations", desc: "Quick one-two passing — 20 minutes", drillRef: "Combination Play", drillCat: "technical" },
      { title: "Box-to-Box Runs", desc: "Shuttle runs with ball — 10 reps", drillRef: "Endurance Run", drillCat: "physical" },
    ],
    attacking_mid: [
      { title: "Through Ball Practice", desc: "Weighted through balls — 20 attempts", drillRef: "Combination Play", drillCat: "technical" },
      { title: "Turn & Shoot", desc: "Receive, turn, and finish — 15 reps", drillRef: "Advanced Finishing", drillCat: "technical" },
    ],
  };

  const drills = positionDrills[pos] || positionDrills.central_mid;

  // Sections
  const sections = [];

  // ⚽ Training
  sections.push({
    id: "training",
    icon: Dumbbell,
    label: "Training",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-500/20",
    items: [
      { id: "q1", title: drills[0].title, desc: drills[0].desc, xp: 30, drillRef: drills[0].drillRef, icon: "⚽", done: completedIds.includes("q1") },
      { id: "q2", title: drills[1].title, desc: drills[1].desc, xp: 25, drillRef: drills[1].drillRef, icon: "🏃", done: completedIds.includes("q2") },
    ],
  });

  // 💧 Hydration
  const waterGoal = profile?.weight_kg ? Math.round(profile.weight_kg * 35) : 2500;
  const glassesDrunk = Math.floor(waterMl / 250);
  const glassesGoal = Math.ceil(waterGoal / 250);
  sections.push({
    id: "hydration",
    icon: Droplets,
    label: "Hydration",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-500/20",
    items: [{ id: "q3", title: "Drink Water", desc: `${glassesDrunk}/${glassesGoal} glasses (${Math.round(waterMl / 1000)}L / ${Math.round(waterGoal / 1000)}L)`, xp: 15, icon: "💧", done: completedIds.includes("q3"), progress: { current: glassesDrunk, total: glassesGoal } }],
  });

  // 🍽️ Meals
  const mealTypes = ["breakfast", "lunch", "dinner"];
  const mealItems = mealTypes.map((type, i) => {
    const meal = meals.find((m) => m.type === type);
    return {
      id: `meal_${type}`,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      desc: meal?.completed ? (meal?.description || "Done ✓") : "Tap to log what you ate",
      xp: i === 0 ? 10 : 5,
      icon: type === "breakfast" ? "🌅" : type === "lunch" ? "🌞" : "🌙",
      done: !!meal?.completed,
      mealType: type,
      navTo: "/nutrition",
    };
  });
  const mealsDone = mealItems.filter((m) => m.done).length;
  sections.push({
    id: "nutrition",
    icon: Utensils,
    label: `Meals (${mealsDone}/3)`,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-500/20",
    items: mealItems,
  });

  // 🧠 Mind
  sections.push({
    id: "mental",
    icon: Brain,
    label: "Mind",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-500/20",
    items: [
      { id: "q5", title: "Mental Rep", desc: "5-minute visualization session", xp: 20, icon: "🧠", done: completedIds.includes("q5") },
      { id: "q6", title: "Tactical Study", desc: `Study ${POSITION_LABELS[pos]} positioning — 10 min`, xp: 20, icon: "📋", done: completedIds.includes("q6") },
    ],
  });

  return sections;
}

export default function TodaysRoadmap({ profile, dailyLog, onQuestComplete }) {
  const navigate = useNavigate();
  const sections = generateRoadmapItems(profile, dailyLog);
  const totalDone = sections.reduce((sum, s) => sum + s.items.filter((i) => i.done).length, 0);
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const allDone = totalDone === totalItems;

  const handleItemToggle = (item, sectionId) => {
    if (sectionId === "nutrition") {
      // Meal toggle — need to update meals_logged
      const meals = dailyLog?.meals_logged || [];
      const existing = meals.find((m) => m.type === item.mealType);
      let newMeals;
      if (item.done) {
        newMeals = meals.map((m) => m.type === item.mealType ? { ...m, completed: false } : m);
      } else if (existing) {
        newMeals = meals.map((m) => m.type === item.mealType ? { ...m, completed: true } : m);
      } else {
        newMeals = [...meals, { type: item.mealType, description: "", completed: true }];
      }
      onQuestComplete({ id: `meal_${item.mealType}`, category: "nutrition", title: `${item.mealType} logged`, xp: item.xp, meals_logged: newMeals });
    } else {
      onQuestComplete({ id: item.id, category: sectionId, title: item.title, xp: item.xp });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-primary/20 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-3 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-primary">
            Today's Roadmap
          </h3>
        </div>
        {allDone && (
          <span className="text-[10px] font-medium text-green-400">All done! 🎉</span>
        )}
        {!allDone && (
          <span className="text-[10px] text-muted-foreground">{totalDone}/{totalItems} done</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(totalDone / totalItems) * 100}%` }}
        />
      </div>

      {/* Sections */}
      <div className="divide-y divide-border/30">
        {sections.map((section) => (
          <div key={section.id} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <section.icon className={`w-4 h-4 ${section.color}`} />
              <span className={`text-xs font-semibold ${section.color}`}>{section.label}</span>
            </div>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2.5 rounded-lg p-2 transition-all ${
                    item.done ? "opacity-50" : "hover:bg-secondary/40"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleItemToggle(item, section.id)}
                    className="flex-shrink-0"
                  >
                    {item.done ? (
                      <Check className="w-4.5 h-4.5 text-primary" />
                    ) : (
                      <Circle className="w-4.5 h-4.5 text-muted-foreground/30 hover:text-primary/50 transition-colors" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex items-center gap-2.5">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.done ? "line-through text-muted-foreground" : ""}`}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.desc}
                      </p>
                    </div>

                    {/* XP or Progress */}
                    {item.progress ? (
                      <span className="text-[10px] font-medium text-blue-400 flex-shrink-0">
                        {item.progress.current}/{item.progress.total}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-accent flex-shrink-0">
                        +{item.xp}
                      </span>
                    )}
                  </div>

                  {/* Navigate — for training drills or meal logging */}
                  {(item.drillRef || item.navTo) && (
                    <button
                      onClick={() => navigate(item.drillRef ? "/train" : item.navTo)}
                      className="flex-shrink-0 text-muted-foreground/40 hover:text-primary transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}