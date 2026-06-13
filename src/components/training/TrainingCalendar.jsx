import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Dumbbell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
export default function TrainingCalendar({ profile, dailyLogs = [] }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));

  const getLogForDay = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dailyLogs.find((log) => log.date === dateStr);
  };

  const getCompletedCount = (log) => {
    if (!log?.training_completed) return 0;
    return log.training_completed.filter((t) => t.completed).length;
  };

  const getTotalDrills = (log) => {
    if (!log?.training_completed?.length) return 0;
    return log.training_completed.length;
  };

  const level = profile?.skill_level || "beginner";

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevWeek}
          className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
          {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}
        </h3>
        <button
          onClick={nextWeek}
          className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day cards */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={format(weekStart, "yyyy-MM-dd")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-2"
          >
            {weekDays.map((day, idx) => {
              const log = getLogForDay(day);
              const completed = getCompletedCount(log);
              const total = getTotalDrills(log);
              const hasActivity = total > 0;
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 transition-all ${
                    isCurrentDay
                      ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                      : hasActivity
                      ? "bg-card border-border"
                      : "bg-card/50 border-border/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Day label */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                      isCurrentDay ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">
                        {format(day, "EEE")}
                      </span>
                      <span className={`text-lg font-heading font-bold ${
                        isCurrentDay ? "text-primary" : "text-foreground"
                      }`}>
                        {format(day, "d")}
                      </span>
                    </div>

                    {/* Activity info */}
                    <div className="flex-1 min-w-0">
                      {hasActivity ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-semibold">
                              {completed}/{total} drills completed
                            </span>
                          </div>
                          {log.training_completed.slice(0, 3).map((t, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              {t.completed ? (
                                <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                              ) : (
                                <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className={`text-xs truncate ${
                                t.completed ? "text-muted-foreground" : "text-foreground/70"
                              }`}>
                                {t.drill_name}
                              </span>
                            </div>
                          ))}
                          {log.training_completed.length > 3 && (
                            <p className="text-[10px] text-muted-foreground">
                              +{log.training_completed.length - 3} more
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                            <Dumbbell className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {isCurrentDay ? "No training logged today" : "Rest day"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* XP earned */}
                    {hasActivity && log.xp_earned_today > 0 && (
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center border border-accent/30">
                          <span className="text-xs font-heading font-bold text-accent">
                            +{log.xp_earned_today}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress bar for active days */}
                  {hasActivity && total > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-green-400 transition-all duration-500"
                          style={{ width: `${(completed / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border border-primary/30 bg-primary/10" />
          Today
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-400" />
          Completed
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </div>
      </div>
    </div>
  );
}