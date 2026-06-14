import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Search, Calendar, Flame, Clock, Edit3, ChevronRight, Filter, X, Star, Video, Play } from "lucide-react";
import { motion } from "framer-motion";

const INTENSITY_MAP = {
  great: { label: "High Energy", color: "text-green-400", bg: "bg-green-500/10" },
  good: { label: "Good", color: "text-blue-400", bg: "bg-blue-500/10" },
  okay: { label: "Okay", color: "text-amber-400", bg: "bg-amber-500/10" },
  tired: { label: "Low Energy", color: "text-orange-400", bg: "bg-orange-500/10" },
  low: { label: "Very Low", color: "text-red-400", bg: "bg-red-500/10" },
};

export default function TrainingLog({ profile }) {
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["training-log-history", profile?.id],
    queryFn: () => base44.entities.DailyLog.list("-date", 90),
    enabled: !!profile,
  });

  const entries = useMemo(() => {
    const all = [];
    logs.forEach((log) => {
      (log.training_completed || []).forEach((t) => {
        all.push({
          ...t,
          date: t.date || log.date,
          mood: log.mood,
          sleep_hours: log.sleep_hours,
          logDate: log.date,
        });
      });
    });
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [logs]);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.drill_name?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const totalSessions = entries.length;
  const totalXp = entries.reduce((sum, e) => sum + (e.xp_earned || 0), 0);
  const notesCount = entries.filter((e) => e.notes?.trim()).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-xl font-heading font-bold text-primary">{totalSessions}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Sessions</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-xl font-heading font-bold text-accent">{totalXp}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Total XP</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-xl font-heading font-bold text-cyan-400">{notesCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">With Notes</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drills, notes, categories..."
          className="w-full bg-card border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Edit3 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {search ? "No matching sessions found" : "No training sessions logged yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            {search ? "Try a different search term" : "Complete quests on the Home page to start building your log"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, i) => {
            const intensity = INTENSITY_MAP[entry.mood] || null;
            const hasNotes = entry.notes?.trim();
            return (
              <motion.div
                key={`${entry.logDate}-${entry.drill_name}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedEntry(selectedEntry === i ? null : i)}
                className={`rounded-xl border cursor-pointer transition-all ${
                  selectedEntry === i
                    ? "bg-card border-primary/30"
                    : "bg-secondary/30 border-border hover:border-primary/20"
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{entry.drill_name}</h4>
                        {hasNotes && (
                          <Edit3 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {entry.date ? format(new Date(entry.date + "T00:00:00"), "MMM d, yyyy") : "N/A"}
                        {entry.xp_earned > 0 && (
                          <>
                            <span>·</span>
                            <Flame className="w-3 h-3 text-accent" />
                            <span className="text-accent font-medium">{entry.xp_earned} XP</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {intensity && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${intensity.bg} ${intensity.color}`}>
                          {intensity.label}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          selectedEntry === i ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded: notes + video + context */}
                  {selectedEntry === i && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      {entry.video_url && (
                        <div>
                          <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                            <Video className="w-3 h-3" /> Form Clip
                          </p>
                          <video
                            src={entry.video_url}
                            controls
                            className="w-full rounded-lg max-h-56 bg-black"
                            preload="metadata"
                          />
                        </div>
                      )}

                      {hasNotes ? (
                        <div>
                          <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            <Edit3 className="w-3 h-3 inline mr-1" /> Session Notes
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/50 rounded-lg p-2.5">
                            {entry.notes}
                          </p>
                        </div>
                      ) : !entry.video_url ? (
                        <p className="text-xs text-muted-foreground/50 italic">No notes or clips recorded</p>
                      ) : null}

                      {(entry.mood || entry.sleep_hours) && (
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          {entry.mood && (
                            <span className="flex items-center gap-1">
                              Mood:{" "}
                              <span className={INTENSITY_MAP[entry.mood]?.color || ""}>
                                {entry.mood}
                              </span>
                            </span>
                          )}
                          {entry.sleep_hours && (
                            <span className="flex items-center gap-1">
                              Sleep: {entry.sleep_hours}h
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}