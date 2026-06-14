import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import QuestCard from "@/components/shared/QuestCard";
import ItemDetailDialog from "@/components/shared/ItemDetailDialog";
import { POSITION_LABELS } from "@/lib/gameData";

const today = format(new Date(), "yyyy-MM-dd");

function generateQuests(profile) {
  const pos = profile.position;

  const positionDrills = {
    goalkeeper: [
      { title: "Shot Stopping Drill", desc: "Practice diving saves from different angles — 20 reps", icon: "🧤", drillRef: "Wall Passes", drillCat: "technical" },
      { title: "Distribution Practice", desc: "Work on goal kicks and throws — 15 minutes", icon: "🦶", drillRef: "Cone Dribbling", drillCat: "technical" },
    ],
    striker: [
      { title: "Finishing Drill", desc: "Practice shots from inside the box — 30 shots", icon: "🎯", drillRef: "Advanced Finishing", drillCat: "technical" },
      { title: "Movement Runs", desc: "Practice runs behind the defence line — 10 reps", icon: "🏃", drillRef: "Sprint Intervals", drillCat: "physical" },
    ],
    winger: [
      { title: "1v1 Dribbling", desc: "Practice beating defenders in 1v1 — 15 attempts", icon: "⚡", drillRef: "Skill Moves Combo", drillCat: "technical" },
      { title: "Crossing Practice", desc: "Deliver crosses from wide areas — 20 crosses", icon: "🎯", drillRef: "Weak Foot Training", drillCat: "technical" },
    ],
    center_back: [
      { title: "Heading Practice", desc: "Practice defensive headers from crosses — 20 reps", icon: "💪", drillRef: "Agility Ladder", drillCat: "physical" },
      { title: "Long Passing Drill", desc: "Play accurate long balls to targets — 20 passes", icon: "🎯", drillRef: "Wall Passes", drillCat: "technical" },
    ],
    full_back: [
      { title: "Overlapping Runs", desc: "Practice overlapping and underlapping runs — 10 reps", icon: "🏃", drillRef: "Speed & Agility", drillCat: "physical" },
      { title: "Defensive 1v1", desc: "Practice jockeying and tackling — 15 minutes", icon: "🛡️", drillRef: "Cone Dribbling", drillCat: "technical" },
    ],
    defensive_mid: [
      { title: "Interception Drill", desc: "Read passes and intercept — 15 minutes", icon: "🛡️", drillRef: "First Touch Drill", drillCat: "technical" },
      { title: "Ball Recovery", desc: "Win the ball back and transition — 20 reps", icon: "⚔️", drillRef: "HIIT Pitch Workout", drillCat: "physical" },
    ],
    central_mid: [
      { title: "Passing Combinations", desc: "Quick one-two passing patterns — 20 minutes", icon: "🔄", drillRef: "Combination Play", drillCat: "technical" },
      { title: "Box-to-Box Runs", desc: "Shuttle runs with ball control — 10 reps", icon: "🏃", drillRef: "Endurance Run", drillCat: "physical" },
    ],
    attacking_mid: [
      { title: "Through Ball Practice", desc: "Play weighted through balls — 20 attempts", icon: "🎯", drillRef: "Combination Play", drillCat: "technical" },
      { title: "Turn & Shoot", desc: "Receive, turn, and finish — 15 reps", icon: "🔄", drillRef: "Advanced Finishing", drillCat: "technical" },
    ],
  };

  const drills = positionDrills[pos] || positionDrills.central_mid;

  return [
    { id: "q1", ...drills[0], description: drills[0].desc, xp: 30, category: "training", completed: false, linkType: "training_drill", linkValue: drills[0].drillRef },
    { id: "q2", ...drills[1], description: drills[1].desc, xp: 25, category: "training", completed: false, linkType: "training_drill", linkValue: drills[1].drillRef },
    { id: "q3", title: "Hydration Check", description: "Drink at least 1.5L of water today", icon: "💧", xp: 15, category: "hydration", completed: false, linkType: "hydration" },
    { id: "q4", title: "Fuel Up", description: "Log all your meals today", icon: "🥗", xp: 20, category: "nutrition", completed: false, linkType: "nutrition_meal" },
    { id: "q5", title: "Mental Rep", description: "Complete a 5-minute visualization session", icon: "🧠", xp: 20, category: "mental", completed: false, linkType: "mental_exercise", linkValue: "Pre-Game Visualization" },
    { id: "q6", title: "Tactical Study", description: `Study ${POSITION_LABELS[pos]} positioning for 10 min`, icon: "📋", xp: 20, category: "tactical", completed: false, linkType: "tactical_drill", linkValue: "Simple Rondo",
      suggestedOptions: [
        { name: "Simple Rondo", duration: "10 min", xp: 15, icon: "🔄" },
        { name: "Position Awareness", duration: "10 min", xp: 15, icon: "🧠" },
        { name: "Game Understanding", duration: "10 min", xp: 10, icon: "🧠" },
      ],
    },
  ];
}

export default function DailyQuests({ profile, dailyLog, onQuestComplete }) {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const quests = generateQuests(profile);

  const completedIds = dailyLog?.quests_completed || [];
  const questsWithStatus = quests.map((q) => ({
    ...q,
    completed: completedIds.includes(q.id),
  }));

  // Check for existing tasks today — create PlayerTask records if none
  const { data: todaysTasks = [] } = useQuery({
    queryKey: ["player-tasks-today", today],
    queryFn: () => base44.entities.PlayerTask.filter({ player_id: profile.id, created_date_ts: today }, null, 10),
    enabled: !!profile,
  });

  useEffect(() => {
    if (!profile?.id || todaysTasks.length > 0) return;
    const syncTasks = async () => {
      for (const q of questsWithStatus) {
        try {
          await base44.entities.PlayerTask.create({
            player_id: profile.id,
            title: q.title,
            description: q.description,
            category: q.category,
            source: "daily_quest",
            source_ref: q.id,
            link_type: q.linkType || "general",
            link_value: q.linkValue || null,
            suggested_options: q.suggestedOptions || null,
            icon: q.icon || "📋",
            xp: q.xp,
            status: "active",
            created_date_ts: today,
          });
        } catch (_) { /* ignore duplicates */ }
      }
    };
    syncTasks();
  }, [profile?.id, todaysTasks.length]);

  const totalXp = questsWithStatus.filter((q) => q.completed).reduce((a, q) => a + q.xp, 0);
  const totalPossible = questsWithStatus.reduce((a, q) => a + q.xp, 0);

  return (
    <div className="space-y-3">
      <ItemDetailDialog
        open={!!selectedQuest}
        onClose={() => setSelectedQuest(null)}
        item={selectedQuest}
        onAction={(quest, notes) => onQuestComplete(quest, notes)}
      />
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
          Daily Quests
        </h3>
        <span className="text-xs text-primary font-semibold">{totalXp}/{totalPossible} XP</span>
      </div>
      <div className="space-y-2">
        {questsWithStatus.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onPress={() => setSelectedQuest(quest)}
            onToggle={(q) => onQuestComplete(q)}
          />
        ))}
      </div>
    </div>
  );
}