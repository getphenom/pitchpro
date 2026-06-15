import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import MentalCoachChat from "@/components/agents/MentalCoachChat";
import MentalDetailDialog from "@/components/mental/MentalDetailDialog";

const MENTAL_EXERCISES = [
  { id: "m1", title: "Confidence Builder", description: "Recall 3 great plays you made — visualize them in detail.", duration: "5 min", xp: 20, category: "aspirational", icon: "🏆", steps: ["Close your eyes and take 3 deep breaths", "Picture your best play from the last game", "Replay it in slow motion — see every detail", "Feel the emotion of that moment", "Tell yourself: 'I can do this again'"] },
  { id: "m2", title: "Laser Focus", description: "Pick a spot on the wall and concentrate fully for 2 minutes. Block all distractions.", duration: "5 min", xp: 15, category: "excellence", icon: "🎯", steps: ["Find a quiet place without distractions", "Pick a small spot on the wall", "Focus only on that spot for 2 minutes", "When your mind wanders, gently bring it back", "Notice how sharp your focus feels after"] },
  { id: "m3", title: "Bounce Back", description: "Visualize a mistake, then mentally reset and respond with your best play.", duration: "5 min", xp: 20, category: "relentless", icon: "🔄", steps: ["Recall a time you made a mistake in a game", "Picture yourself taking a deep breath", "Imagine shaking it off — literally shrug your shoulders", "Visualize your next play being your best one", "Repeat: 'One mistake doesn't define me'"] },
  { id: "m4", title: "Pre-Match Visualization", description: "Walk through the match in your mind — see yourself making key plays.", duration: "10 min", xp: 25, category: "readiness", icon: "🎬", steps: ["Find a quiet space before the game", "Close your eyes and imagine the field", "See yourself making successful passes and tackles", "Visualize specific scenarios for your position", "End with a positive outcome"] },
  { id: "m5", title: "Breathing Reset", description: "4-4-6 breathing: inhale 4s, hold 4s, exhale 6s. Repeat 5 times.", duration: "3 min", xp: 10, category: "calm", icon: "🧘", steps: ["Sit or stand comfortably", "Inhale slowly for 4 seconds", "Hold your breath for 4 seconds", "Exhale slowly for 6 seconds", "Repeat 5 times"] },
  { id: "m6", title: "Gratitude Check-In", description: "Write or think about 3 things you're grateful for in soccer and life.", duration: "3 min", xp: 10, category: "positive", icon: "🙏", steps: ["Take out a notebook or open your notes app", "Write down 3 things you're grateful for", "At least one should be soccer-related", "Read them back and smile", "This builds a positive mindset over time"] },
];

export default function MindHub() {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });
  const profile = profiles?.[0];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#B79BFF]" /></div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <MentalDetailDialog
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        exercise={selectedExercise}
        profile={profile}
        allExercises={MENTAL_EXERCISES}
        onSwap={(alt) => setSelectedExercise(alt)}
      />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div>
          <p className="font-heading font-semibold tracking-[0.22em] text-[10px] uppercase text-[#B79BFF]">Mental Game</p>
          <h1 className="text-2xl font-heading font-extrabold mt-0.5">Mind</h1>
          <p className="text-xs text-[#8A8C92] mt-2">
            Train your mind like the pros · the <b className="text-[#B79BFF]">READY</b> framework
          </p>
        </div>

        <h2 className="font-heading font-bold text-[13px] tracking-[0.1em] uppercase text-[#8A8C92] mt-5">Exercises</h2>
        <div className="space-y-2">
          {MENTAL_EXERCISES.map((ex, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedExercise(ex)}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#141419] border border-white/[0.08] cursor-pointer hover:border-[#B79BFF]/30 transition-all"
            >
              <div className="w-[22px] h-[22px] rounded-md border-2 border-[#5E6066] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{ex.title}</p>
                <p className="text-[11px] text-[#8A8C92] mt-0.5">{ex.description}</p>
              </div>
              <span className="font-heading font-bold text-xs text-[#B79BFF]">+{ex.xp}</span>
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl bg-gradient-to-br from-[#B79BFF]/10 to-[#B79BFF]/[0.02] border border-[#B79BFF]/25 p-4">
          <p className="font-heading font-bold text-[10px] tracking-[0.2em] uppercase text-[#B79BFF] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Coach · check-in
          </p>
          <p className="text-sm mt-2 leading-relaxed">How did today feel? A quick note keeps your head as sharp as your feet.</p>
          <MentalCoachChat profile={profile} />
        </div>
      </div>
    </div>
  );
}