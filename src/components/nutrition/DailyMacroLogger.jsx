import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Beef, Wheat, Droplets, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const today = format(new Date(), "yyyy-MM-dd");

export default function DailyMacroLogger({ profile }) {
  const queryClient = useQueryClient();
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["daily-log", today],
    queryFn: () => base44.entities.DailyLog.filter({ date: today }),
    enabled: !!profile,
  });

  const dailyLog = logs?.[0];

  useEffect(() => {
    if (dailyLog) {
      setProtein(dailyLog.protein_g > 0 ? String(dailyLog.protein_g) : "");
      setCarbs(dailyLog.carbs_g > 0 ? String(dailyLog.carbs_g) : "");
      setFat(dailyLog.fat_g > 0 ? String(dailyLog.fat_g) : "");
    }
  }, [dailyLog?.id]);

  const saveMacros = useMutation({
    mutationFn: async () => {
      const data = {
        protein_g: Number(protein) || 0,
        carbs_g: Number(carbs) || 0,
        fat_g: Number(fat) || 0,
      };
      if (dailyLog) {
        return base44.entities.DailyLog.update(dailyLog.id, data);
      } else {
        return base44.entities.DailyLog.create({ player_id: profile.id, date: today, ...data });
      }
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["daily-log", today] });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["daily-log"] });
      queryClient.invalidateQueries({ queryKey: ["macro-logs"] });
    },
  });

  if (isLoading) return null;

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <h4 className="text-xs font-heading font-bold tracking-wider uppercase text-muted-foreground mb-3">
        Today's Macros
      </h4>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-red-400">
            <Beef className="w-3 h-3" /> Protein
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="h-8 text-xs text-center"
            />
            <span className="text-[10px] text-muted-foreground">g</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-amber-400">
            <Wheat className="w-3 h-3" /> Carbs
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              className="h-8 text-xs text-center"
            />
            <span className="text-[10px] text-muted-foreground">g</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-blue-400">
            <Droplets className="w-3 h-3" /> Fat
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="h-8 text-xs text-center"
            />
            <span className="text-[10px] text-muted-foreground">g</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => saveMacros.mutate()}
        disabled={saveMacros.isPending}
        className={`w-full mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          saved
            ? "bg-primary/20 text-primary"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        }`}
      >
        {saveMacros.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : saved ? (
          <>✓ Saved</>
        ) : (
          <>
            <Save className="w-3.5 h-3.5" /> Log Macros
          </>
        )}
      </button>
    </div>
  );
}