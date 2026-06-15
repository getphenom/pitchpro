import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, Clock, AlertTriangle, Shield, CheckCircle2, ChevronDown, ChevronUp, Plus, Minus, Shirt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Default max hours per item type (used when not set explicitly)
const DEFAULT_MAX_HOURS = {
  "Cleats (FG)": 120,
  "Turf Shoes": 150,
  "Indoor Shoes": 150,
  "Running Shoes": 200,
  "Slides/Flip-flops": 500,
  "Goalkeeper Gloves": 60,
  "Shin Guards": 200,
  "Mouthguard": 100,
  "Ankle Support": 150,
  "Compression Sleeves": 100,
  "Soccer Ball (Size 5)": 300,
  "Cone Set (10+)": 500,
  "Agility Ladder": 400,
  "Speed Hurdles": 400,
  "Resistance Bands": 200,
  "Training Bib/Pinnie": 200,
  "Ball Pump + Needles": 500,
  "Foam Roller": 300,
  "Massage Ball": 200,
  "Ice Pack": 200,
  "Yoga Mat": 300,
  "Fitness Tracker/Watch": 2000,
  "Heart Rate Monitor": 1000,
  "Water Bottle (32oz+)": 500,
  "Protein Shaker": 300,
  "Snack Container": 300,
};

function getDefaultMaxHours(itemName) {
  return DEFAULT_MAX_HOURS[itemName] || 150;
}

function getUsagePct(item) {
  const max = item.max_hours || getDefaultMaxHours(item.name);
  if (!max || max <= 0) return 0;
  return Math.min((item.usage_hours || 0) / max, 1) * 100;
}

function getStatus(item) {
  const pct = getUsagePct(item);
  if (pct >= 100) return { label: "Replace Now", color: "text-red-400", bg: "bg-red-500", icon: AlertTriangle };
  if (pct >= 75) return { label: "Plan Replacement", color: "text-amber-400", bg: "bg-amber-500", icon: AlertTriangle };
  if (pct >= 50) return { label: "Monitor", color: "text-yellow-400", bg: "bg-yellow-500", icon: Shield };
  return { label: "Good", color: "text-green-400", bg: "bg-green-500", icon: CheckCircle2 };
}

export default function MaintenanceTracker({ profile }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [addHours, setAddHours] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: equipList = [], isLoading } = useQuery({
    queryKey: ["player-equipment", profile?.id],
    queryFn: () => base44.entities.PlayerEquipment.filter({ player_id: profile.id }),
    enabled: !!profile?.id,
  });

  const equipment = equipList[0];
  const ownedItems = (equipment?.items || []).filter((i) => i.owned);

  const handleLogHours = async (itemName, hours) => {
    if (!equipment || hours <= 0) return;
    setSaving(true);
    const updatedItems = equipment.items.map((item) => {
      if (item.name === itemName) {
        const currentHours = item.usage_hours || 0;
        const maxHours = item.max_hours || getDefaultMaxHours(item.name);
        return { ...item, usage_hours: currentHours + hours, max_hours: maxHours };
      }
      return item;
    });
    await base44.entities.PlayerEquipment.update(equipment.id, { items: updatedItems });
    queryClient.invalidateQueries({ queryKey: ["player-equipment"] });
    setAddHours((prev) => ({ ...prev, [itemName]: "" }));
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (ownedItems.length === 0) {
    return null;
  }

  const urgentItems = ownedItems.filter((i) => getUsagePct(i) >= 75);
  const warningItems = ownedItems.filter((i) => {
    const pct = getUsagePct(i);
    return pct >= 50 && pct < 75;
  });

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Gear Maintenance
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {urgentItems.length > 0 && (
            <span className="text-[10px] text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {urgentItems.length} urgent
            </span>
          )}
          {warningItems.length > 0 && (
            <span className="text-[10px] text-amber-400 flex items-center gap-1">
              <Shield className="w-3 h-3" /> {warningItems.length} monitor
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Log hours after each use to track when your gear needs replacing.
              </p>

              {ownedItems.map((item, i) => {
                const pct = getUsagePct(item);
                const status = getStatus(item);
                const maxHours = item.max_hours || getDefaultMaxHours(item.name);
                const hoursUsed = item.usage_hours || 0;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={i}
                    className={`rounded-lg p-3 border transition-all ${
                      pct >= 100
                        ? "bg-red-500/5 border-red-500/20"
                        : pct >= 75
                          ? "bg-amber-500/5 border-amber-500/20"
                          : "bg-secondary/30 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Shirt className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.category?.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                        <span className={`text-[10px] font-medium ${status.color}`}>{status.label}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">
                          {hoursUsed}h used
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {maxHours}h max
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={`h-full rounded-full ${status.bg}`}
                        />
                      </div>
                      {pct >= 100 && (
                        <p className="text-[10px] text-red-400 mt-1 font-medium">
                          Overdue for replacement — exceeded {maxHours}h threshold
                        </p>
                      )}
                      {pct >= 75 && pct < 100 && (
                        <p className="text-[10px] text-amber-400 mt-1">
                          Approaching replacement — {Math.round(maxHours - hoursUsed)}h remaining
                        </p>
                      )}
                    </div>

                    {/* Add hours input */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-secondary rounded-lg">
                        <button
                          onClick={() => {
                            const val = parseInt(addHours[item.name]) || 1;
                            if (val > 0.5) setAddHours((p) => ({ ...p, [item.name]: String(Math.max(0.5, val - 0.5)) }));
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          placeholder="1.5"
                          value={addHours[item.name] || ""}
                          onChange={(e) => setAddHours((p) => ({ ...p, [item.name]: e.target.value }))}
                          className="w-12 text-center text-xs bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => {
                            const val = parseFloat(addHours[item.name]) || 0;
                            setAddHours((p) => ({ ...p, [item.name]: String(val + 0.5) }));
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleLogHours(item.name, parseFloat(addHours[item.name]) || 0)}
                        disabled={saving || !addHours[item.name] || parseFloat(addHours[item.name]) <= 0}
                        className="text-[10px] bg-primary text-primary-foreground rounded-lg px-3 py-1.5 font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
                      >
                        {saving ? "Saving..." : "Log Hours"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}