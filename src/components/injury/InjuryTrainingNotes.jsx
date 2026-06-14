import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Loader2, FileText, Calendar, Dumbbell, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function InjuryTrainingNotes({ profile }) {
  const { data: dailyLogs = [], isLoading } = useQuery({
    queryKey: ["all-daily-logs-notes", profile?.id],
    queryFn: () => base44.entities.DailyLog.filter({ player_id: profile.id }, "-date", 60),
    enabled: !!profile,
  });

  // Extract all training entries that have notes
  const trainingNotes = dailyLogs
    .flatMap((log) => {
      const training = log.training_completed || [];
      return training
        .filter((t) => t.notes && t.notes.trim())
        .map((t) => ({
          ...t,
          date: log.date,
          logId: log.id,
        }));
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (trainingNotes.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-400" /> Training Notes History
      </h3>
      <p className="text-xs text-muted-foreground -mt-2">
        Review your session notes to spot patterns linking training feel to injuries
      </p>
      <div className="space-y-2">
        {trainingNotes.slice(0, 15).map((note, i) => (
          <div
            key={`${note.logId}-${i}`}
            className="rounded-lg bg-card border border-border p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-semibold">{note.drill_name}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {format(new Date(note.date), "MMM d, yyyy")}
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              "{note.notes}"
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">{note.xp_earned || 0} XP</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}