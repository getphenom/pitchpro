import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function PainPatternAlert({ profile }) {
  const navigate = useNavigate();

  const { data: alerts = [] } = useQuery({
    queryKey: ["pain-pattern-alerts", profile?.id],
    queryFn: () =>
      base44.entities.PlayerTask.filter({
        player_id: profile.id,
        source: "pain_pattern",
        status: "active",
      }, "-created_date_ts", 5),
    enabled: !!profile?.id,
  });

  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const bodyPartLabel = (alert.link_value || "unknown")
          .charAt(0)
          .toUpperCase() + (alert.link_value || "unknown").slice(1).replace(/_/g, " ");

        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-red-500/10 border-2 border-red-500/40 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-bold text-sm text-red-400">
                  Persistent Pain Alert
                </h4>
                <p className="text-xs text-red-300/80 mt-1">
                  You've logged pain in your <strong>{bodyPartLabel}</strong> for 3 days in a row. This could indicate an underlying issue.
                </p>
                <p className="text-xs text-red-300/60 mt-1">
                  Consider consulting a trainer or physiotherapist before training again.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate("/injury")}
                className="flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Shield className="w-3.5 h-3.5" />
                View Injury Log
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={async () => {
                  await base44.entities.PlayerTask.update(alert.id, { status: "dismissed" });
                }}
                className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}