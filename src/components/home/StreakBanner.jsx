import { Flame, Zap } from "lucide-react";

export default function StreakBanner({ streak = 0 }) {
  if (streak < 1) return null;

  const fireEmojis = streak >= 30 ? "🔥🔥🔥" : streak >= 7 ? "🔥🔥" : "🔥";

  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/20 p-4">
      <div className="flex items-center gap-1">
        <Flame className="w-6 h-6 text-orange-400" />
        <span className="font-heading font-bold text-2xl text-orange-400">{streak}</span>
      </div>
      <div>
        <p className="text-sm font-semibold">Day Streak {fireEmojis}</p>
        <p className="text-xs text-muted-foreground">Keep going — don't break the chain!</p>
      </div>
    </div>
  );
}