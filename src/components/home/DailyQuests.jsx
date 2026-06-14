import { useState } from "react";
import QuestCard from "@/components/shared/QuestCard";
import ItemDetailDialog from "@/components/shared/ItemDetailDialog";
import { POSITION_LABELS } from "@/lib/gameData";

function generateQuests(profile) {
  const pos = profile.position;
  const level = profile.skill_level;

  const positionDrills = {
    goalkeeper: [
      { title: "Shot Stopping Drill", desc: "Practice diving saves from different angles — 20 reps", icon: "🧤" },
      { title: "Distribution Practice", desc: "Work on goal kicks and throws — 15 minutes", icon: "🦶" },
    ],
    striker: [
      { title: "Finishing Drill", desc: "Practice shots from inside the box — 30 shots", icon: "🎯" },
      { title: "Movement Runs", desc: "Practice runs behind the defence line — 10 reps", icon: "🏃" },
    ],
    winger: [
      { title: "1v1 Dribbling", desc: "Practice beating defenders in 1v1 — 15 attempts", icon: "⚡" },
      { title: "Crossing Practice", desc: "Deliver crosses from wide areas — 20 crosses", icon: "🎯" },
    ],
    center_back: [
      { title: "Heading Practice", desc: "Practice defensive headers from crosses — 20 reps", icon: "💪" },
      { title: "Long Passing Drill", desc: "Play accurate long balls to targets — 20 passes", icon: "🎯" },
    ],
    full_back: [
      { title: "Overlapping Runs", desc: "Practice overlapping and underlapping runs — 10 reps", icon: "🏃" },
      { title: "Defensive 1v1", desc: "Practice jockeying and tackling — 15 minutes", icon: "🛡️" },
    ],
    defensive_mid: [
      { title: "Interception Drill", desc: "Read passes and intercept — 15 minutes", icon: "🛡️" },
      { title: "Ball Recovery", desc: "Win the ball back and transition — 20 reps", icon: "⚔️" },
    ],
    central_mid: [
      { title: "Passing Combinations", desc: "Quick one-two passing patterns — 20 minutes", icon: "🔄" },
      { title: "Box-to-Box Runs", desc: "Shuttle runs with ball control — 10 reps", icon: "🏃" },
    ],
    attacking_mid: [
      { title: "Through Ball Practice", desc: "Play weighted through balls — 20 attempts", icon: "🎯" },
      { title: "Turn & Shoot", desc: "Receive, turn, and finish — 15 reps", icon: "🔄" },
    ],
  };

  const drills = positionDrills[pos] || positionDrills.central_mid;

  return [
    { id: "q1", ...drills[0], description: drills[0].desc, xp: 30, category: "training", completed: false },
    { id: "q2", ...drills[1], description: drills[1].desc, xp: 25, category: "training", completed: false },
    { id: "q3", title: "Hydration Check", description: "Drink at least 1.5L of water today", icon: "💧", xp: 15, category: "hydration", completed: false },
    { id: "q4", title: "Fuel Up", description: "Log all your meals today", icon: "🥗", xp: 20, category: "nutrition", completed: false },
    { id: "q5", title: "Mental Rep", description: "Complete a 5-minute visualization session", icon: "🧠", xp: 20, category: "mental", completed: false },
    { id: "q6", title: "Tactical Study", description: `Study ${POSITION_LABELS[pos]} positioning for 10 min`, icon: "📋", xp: 20, category: "tactical", completed: false },
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