import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { CheckCircle2, AlertCircle, Lightbulb, ChevronDown, ChevronUp, Backpack } from "lucide-react";
import { useState } from "react";
import { DRILL_EQUIPMENT, EQUIPMENT_ALTERNATIVES } from "@/lib/equipmentData";

// Position-specific essential gear that every player should have
const POSITION_GEAR = {
  goalkeeper: ["Goalkeeper Gloves", "Shin Guards", "Cleats (FG)"],
  center_back: ["Soccer Ball (Size 5)", "Shin Guards", "Cleats (FG)"],
  full_back: ["Soccer Ball (Size 5)", "Shin Guards", "Cleats (FG)"],
  defensive_mid: ["Soccer Ball (Size 5)", "Shin Guards", "Cleats (FG)"],
  central_mid: ["Soccer Ball (Size 5)", "Shin Guards", "Cleats (FG)"],
  attacking_mid: ["Soccer Ball (Size 5)", "Shin Guards", "Cleats (FG)"],
  winger: ["Soccer Ball (Size 5)", "Shin Guards", "Cleats (FG)"],
  striker: ["Soccer Ball (Size 5)", "Shin Guards", "Cleats (FG)"],
};

const CORE_GEAR = ["Water Bottle (32oz+)"];

export default function SessionGearChecklist({ profile }) {
  const [expanded, setExpanded] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: equipment } = useQuery({
    queryKey: ["player-equipment", profile?.id],
    queryFn: () => base44.entities.PlayerEquipment.filter({ player_id: profile.id }),
    enabled: !!profile?.id,
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ["today-daily-log", profile?.id, today],
    queryFn: () => base44.entities.DailyLog.filter({ player_id: profile.id, date: today }),
    enabled: !!profile?.id,
  });

  const { data: todayTasks = [] } = useQuery({
    queryKey: ["today-tasks", profile?.id, today],
    queryFn: () => base44.entities.PlayerTask.filter({ player_id: profile.id, created_date_ts: today, status: "active" }),
    enabled: !!profile?.id,
  });

  const eqRecord = equipment?.[0];
  const ownedItems = eqRecord?.items?.filter((i) => i.owned).map((i) => i.name) || [];

  // Gather drill names from today's log and tasks
  const sessionDrills = new Set();

  todayLogs.forEach((log) => {
    (log.training_completed || []).forEach((t) => {
      if (t.drill_name) sessionDrills.add(t.drill_name);
    });
  });

  todayTasks.forEach((task) => {
    if (task.link_type === "training_drill" && task.link_value) {
      sessionDrills.add(task.link_value);
    }
  });

  // Aggregate all needed equipment from session drills
  const allNeeded = new Set();
  sessionDrills.forEach((drillName) => {
    const needed = DRILL_EQUIPMENT[drillName] || [];
    needed.forEach((item) => allNeeded.add(item));
  });

  // Add position essentials + core gear
  const positionGear = POSITION_GEAR[profile?.position] || POSITION_GEAR.central_mid;
  positionGear.forEach((item) => allNeeded.add(item));
  CORE_GEAR.forEach((item) => allNeeded.add(item));

  const gearList = Array.from(allNeeded).sort().map((itemName) => {
    const isOwned = ownedItems.includes(itemName);
    const alternatives = EQUIPMENT_ALTERNATIVES[itemName] || [];
    return { name: itemName, owned: isOwned, alternatives };
  });

  const ownedCount = gearList.filter((g) => g.owned).length;
  const missingCount = gearList.filter((g) => !g.owned).length;

  return (
    <div className="rounded-xl bg-card border border-primary/20 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Backpack className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Session Gear Checklist
          </h3>
          <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
            {ownedCount}/{gearList.length} ready
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {gearList.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No drills planned for today yet. Your checklist will appear here when you add training.
            </p>
          ) : (
            gearList.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                {item.owned ? (
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${item.owned ? "text-foreground" : "text-amber-400"}`}>
                    {item.name}
                  </p>
                  {!item.owned && item.alternatives.length > 0 && (
                    <div className="flex items-start gap-1 mt-0.5">
                      <Lightbulb className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-muted-foreground line-clamp-2">
                        {item.alternatives[0]}
                      </p>
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${item.owned ? "bg-primary/10 text-primary" : "bg-amber-400/10 text-amber-400"}`}>
                  {item.owned ? "Got it" : "Need"}
                </span>
              </div>
            ))
          )}

          {missingCount > 0 && (
            <p className="text-[10px] text-muted-foreground pt-1">
              💡 Tap an item to see household alternatives in your full equipment list.
            </p>
          )}
        </div>
      )}
    </div>
  );
}