import { Droplets, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWaterGoal } from "@/lib/gameData";

export default function WaterTracker({ currentMl = 0, age = 15, weight = 60, onUpdate }) {
  const goal = getWaterGoal(age, weight);
  const percentage = Math.min((currentMl / goal) * 100, 100);
  const glasses = Math.floor(currentMl / 250);

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-sm">Hydration</h3>
        </div>
        <span className="text-xs text-muted-foreground">{glasses} glasses</span>
      </div>

      <div className="relative w-full h-32 mb-4 flex items-end justify-center">
        <div className="relative w-20 h-28 rounded-b-2xl rounded-t-lg border-2 border-blue-400/40 overflow-hidden bg-secondary/50">
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-700 ease-out"
            style={{ height: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-foreground drop-shadow-lg">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mb-3">
        {currentMl} / {goal} ml
      </p>

      <div className="flex items-center justify-center gap-3">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full w-9 h-9 p-0"
          onClick={() => onUpdate?.(Math.max(0, currentMl - 250))}
          disabled={currentMl <= 0}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4"
          onClick={() => onUpdate?.(currentMl + 250)}
        >
          <Plus className="w-4 h-4 mr-1" /> 250ml
        </Button>
      </div>
    </div>
  );
}