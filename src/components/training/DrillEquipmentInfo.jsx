import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getOwnedItems, getDrillEquipmentStatus, EQUIPMENT_ALTERNATIVES } from "@/lib/equipmentData";
import { CheckCircle2, AlertTriangle, Lightbulb, Shirt, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DrillEquipmentInfo({ drillName, profileId, className = "" }) {
  const [expanded, setExpanded] = useState(false);

  const { data: equipList = [] } = useQuery({
    queryKey: ["player-equipment", profileId],
    queryFn: () => base44.entities.PlayerEquipment.filter({ player_id: profileId }),
    enabled: !!profileId,
  });

  const status = useMemo(() => {
    const equipment = equipList[0];
    const ownedItems = getOwnedItems(equipment);
    return getDrillEquipmentStatus(drillName, ownedItems);
  }, [drillName, equipList]);

  if (status.needed.length === 0) {
    return (
      <div className={`flex items-center gap-1 text-[10px] text-green-400 ${className}`}>
        <CheckCircle2 className="w-3 h-3" />
        No equipment needed
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="flex items-center gap-1 text-[10px] transition-colors hover:text-primary w-full text-left"
        style={{ color: status.hasAll ? "#4ade80" : "#f59e0b" }}
      >
        {status.hasAll ? (
          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
        )}
        <span>{status.hasAll ? `All ${status.needed.length} items ready` : `${status.missing.length} item(s) missing`}</span>
        {expanded ? <ChevronUp className="w-3 h-3 ml-auto flex-shrink-0" /> : <ChevronDown className="w-3 h-3 ml-auto flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-1 pb-1">
              {status.owned.length > 0 && (
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">You have</p>
                  {status.owned.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-green-400">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              )}

              {status.missing.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">You need</p>
                  {status.missing.map((item, i) => (
                    <div key={i} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-2">
                      <p className="text-[10px] font-medium text-amber-400 flex items-center gap-1">
                        <Shirt className="w-3 h-3" /> {item.name}
                      </p>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                          <Lightbulb className="w-2.5 h-2.5 text-accent flex-shrink-0" />
                          Alternatives:
                        </p>
                        {item.alternatives.map((alt, j) => (
                          <p key={j} className="text-[9px] text-muted-foreground pl-4">• {alt}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}