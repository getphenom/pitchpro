import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Shirt, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EquipmentSummary({ profileId, compact = false }) {
  const navigate = useNavigate();

  const { data: equipList = [] } = useQuery({
    queryKey: ["player-equipment", profileId],
    queryFn: () => base44.entities.PlayerEquipment.filter({ player_id: profileId }),
    enabled: !!profileId,
  });

  const equipment = equipList[0];
  const items = equipment?.items || [];
  const owned = items.filter((i) => i.owned);
  const missing = items.filter((i) => !i.owned);
  const worn = owned.filter((i) => i.condition === "needs_replacement" || i.condition === "worn");

  if (!equipment || items.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={() => navigate("/training")}
        className="w-full flex items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-left"
      >
        <Shirt className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-xs flex-1">
          <span className="text-primary font-semibold">{owned.length}</span>/{items.length} gear items owned
          {worn.length > 0 && <span className="text-red-400 ml-1">({worn.length} worn)</span>}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shirt className="w-4 h-4 text-primary" />
          <h4 className="font-heading font-bold text-xs tracking-wider uppercase text-muted-foreground">Your Gear</h4>
        </div>
        <span className="text-xs font-heading font-bold text-primary">{owned.length}/{items.length}</span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>{owned.length - worn.length} ready</span>
        </div>
        {worn.length > 0 && (
          <div className="flex items-center gap-1 text-red-400">
            <AlertTriangle className="w-3 h-3" />
            <span>{worn.length} worn</span>
          </div>
        )}
        {missing.length > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>{missing.length} missing</span>
          </div>
        )}
      </div>

      {missing.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground">Missing — drills will show alternatives:</p>
          <div className="flex flex-wrap gap-1">
            {missing.slice(0, 5).map((item, i) => (
              <span key={i} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{item.name}</span>
            ))}
            {missing.length > 5 && (
              <span className="text-[10px] text-muted-foreground">+{missing.length - 5} more</span>
            )}
          </div>
          <button
            onClick={() => navigate("/training")}
            className="text-[10px] text-primary hover:underline"
          >
            Update equipment →
          </button>
        </div>
      )}
    </div>
  );
}