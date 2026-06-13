import { getXpProgress, getXpForNextLevel, getLevel, LEVEL_TITLES } from "@/lib/gameData";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

export default function XpBar({ xp = 0, showDetails = true }) {
  const level = getLevel(xp);
  const progress = getXpProgress(xp);
  const nextXp = getXpForNextLevel(xp);
  const title = LEVEL_TITLES[level - 1] || "Legend";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-heading font-bold text-sm">{level}</span>
          </div>
          {showDetails && (
            <div>
              <p className="text-xs text-muted-foreground">Level {level}</p>
              <p className="text-sm font-semibold text-primary">{title}</p>
            </div>
          )}
        </div>
        {showDetails && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="w-3.5 h-3.5 text-accent" />
            <span>{xp} / {nextXp} XP</span>
          </div>
        )}
      </div>
      <div className="relative">
        <Progress value={progress} className="h-2 bg-secondary" />
        <div
          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-primary to-green-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}