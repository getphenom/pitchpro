import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Search, Clock, Flame, Edit3, Video, ChevronDown, ChevronUp, BookOpen, Calendar, Activity } from "lucide-react";

const INTENSITY_LEVELS = {
  high: { label: "High", color: "text-red-400 bg-red-500/10" },
  medium: { label: "Medium", color: "text-yellow-400 bg-yellow-500/10" },
  low: { label: "Low", color: "text-green-400 bg-green-500/10" },
};

export default function TacticalLog({ profile }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const { data: allLogs = [], isLoading } = useQuery({
    queryKey: ["all-training-logs", profile?.id],
    queryFn: () => base44.entities.DailyLog.filter({ player_id: profile.id }, "-date", 200),
    enabled: !!profile,
  });

  const tacticalSessions = useMemo(() => {
    const sessions = [];
    allLogs.forEach((log) => {
      (log.training_completed || []).forEach((entry) => {
        if (!entry.category || entry.category === "tactical" || ["possession", "defending", "transitions", "set_pieces", "game_scenarios"].includes(entry.category)) {
          sessions.push({ ...entry, date: log.date, logId: log.id, mood: log.mood, sleep_hours: log.sleep_hours });
        }
      });
    });
    return sessions.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [allLogs]);

  const filtered = useMemo(() => {
    if (!search) return tacticalSessions;
    const q = search.toLowerCase();
    return tacticalSessions.filter(
      (s) => s.drill_name?.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q)
    );
  }, [tacticalSessions, search]);

  const totalSessions = tacticalSessions.length;
  const totalXp = tacticalSessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0);
  const sessionsWithNotes = tacticalSessions.filter((s) => s.notes).length;

  if (isLoading) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-card border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-400" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">Tactical Session Log</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">{totalSessions} sessions</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center rounded-lg bg-secondary/30 p-2">
          <p className="text-lg font-heading font-bold text-orange-400">{totalSessions}</p>
          <p className="text-[10px] text-muted-foreground">Sessions</p>
        </div>
        <div className="text-center rounded-lg bg-secondary/30 p-2">
          <p className="text-lg font-heading font-bold text-accent">{totalXp}</p>
          <p className="text-[10px] text-muted-foreground">Total XP</p>
        </div>
        <div className="text-center rounded-lg bg-secondary/30 p-2">
          <p className="text-lg font-heading font-bold text-green-400">{sessionsWithNotes}</p>
          <p className="text-[10px] text-muted-foreground">With Notes</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tactical sessions..."
          className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Session list */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto" />
          <p className="text-xs text-muted-foreground">{search ? "No sessions match your search" : "No tactical sessions logged yet"}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filtered.map((session, i) => {
            const isOpen = expanded === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="rounded-lg bg-secondary/30 border border-border overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.drill_name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(session.date), "MMM d, yyyy")}
                      {session.category && <><span>·</span><span className="capitalize">{session.category}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {session.xp_earned > 0 && (
                      <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> {session.xp_earned}
                      </span>
                    )}
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border pt-3">
                    {session.notes && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1"><Edit3 className="w-3 h-3" /> Notes</p>
                        <p className="text-xs text-muted-foreground">{session.notes}</p>
                      </div>
                    )}
                    {session.video_url && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1"><Video className="w-3 h-3" /> Video</p>
                        <video src={session.video_url} controls className="w-full rounded-lg max-h-48" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      {session.mood && <span>Mood: {session.mood}</span>}
                      {session.sleep_hours != null && <span>Sleep: {session.sleep_hours}h</span>}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}