import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, addDays, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Dumbbell, Calendar as CalendarIcon, Sparkles, BookOpen, ExternalLink, Brain, UtensilsCrossed, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TutorialModal from "@/components/shared/TutorialModal";
import DrillEquipmentInfo from "@/components/training/DrillEquipmentInfo";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const CATEGORY_COLORS = {
  technical: "bg-blue-500/15 border-blue-500/30 text-blue-400",
  physical: "bg-green-500/15 border-green-500/30 text-green-400",
  tactical: "bg-orange-500/15 border-orange-500/30 text-orange-400",
  mental: "bg-purple-500/15 border-purple-500/30 text-purple-400",
  recovery: "bg-teal-500/15 border-teal-500/30 text-teal-400",
  nutrition: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  hydration: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
};

const CATEGORY_ROUTES = {
  technical: null,   // stays on training
  physical: null,
  tactical: null,
  mental: "/mental",
  nutrition: "/nutrition",
  recovery: "/recovery",
  hydration: "/nutrition",
  general: null,
};

const CATEGORY_ICONS = {
  technical: Dumbbell,
  physical: Dumbbell,
  tactical: Dumbbell,
  mental: Brain,
  nutrition: UtensilsCrossed,
  recovery: Heart,
  hydration: UtensilsCrossed,
  general: Dumbbell,
};

export default function TrainingPlanner({ profile, dailyLogs = [] }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState("month"); // "month" | "week"
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(null);
  const [tutorialItem, setTutorialItem] = useState(null);

  const { data: plans = [], isLoading: loadingPlan } = useQuery({
    queryKey: ["development-plans", profile?.id],
    queryFn: () => base44.entities.DevelopmentPlan.filter({ player_id: profile.id, status: "active" }, "-created_date", 1),
    enabled: !!profile,
  });

  const activePlan = plans?.[0];

  const getLogForDay = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dailyLogs.find((log) => log.date === dateStr);
  };

  const getCompletedCount = (log) => {
    if (!log?.training_completed) return 0;
    return log.training_completed.filter((t) => t.completed).length;
  };

  const getTotalDrills = (log) => {
    return log?.training_completed?.length || 0;
  };

  // Plan helpers
  const getPlanForDate = (date) => {
    if (!activePlan?.weekly_goals) return null;
    const planStart = new Date(activePlan.start_date);
    const diffDays = Math.floor((date - planStart) / (1000 * 60 * 60 * 24));
    const weekIdx = Math.floor(diffDays / 7);
    if (weekIdx < 0 || weekIdx >= activePlan.weekly_goals.length) return null;
    const week = activePlan.weekly_goals[weekIdx];
    const dayOfWeek = getDay(date);
    const dayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (dayIdx >= (week.daily_goals?.length || 0)) return null;
    return { week, weekIdx, dayIdx, dailyGoal: week.daily_goals[dayIdx] };
  };

  // Month view days
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);
  const startingDayIndex = getDay(startOfMonth(currentMonth));

  // Week view days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));

  const toggleDayComplete = useMutation({
    mutationFn: async ({ weekIdx, dayIdx }) => {
      if (!activePlan) return;
      const updatedWeeks = [...activePlan.weekly_goals];
      const day = updatedWeeks[weekIdx].daily_goals[dayIdx];
      day.completed = !day.completed;
      return base44.entities.DevelopmentPlan.update(activePlan.id, { weekly_goals: updatedWeeks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-plans"] });
    },
  });

  const selectedDatePlan = selectedDate ? getPlanForDate(selectedDate) : null;
  const selectedDateLog = selectedDate ? getLogForDay(selectedDate) : null;

  const renderDayCard = (date, planData, logData) => {
    const isCurrentDay = isToday(date);
    const hasActivity = logData && getTotalDrills(logData) > 0;
    const completed = getCompletedCount(logData);
    const total = getTotalDrills(logData);

    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-card border border-primary/20 p-4 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">{format(date, "EEEE, MMMM d")}</h4>
          </div>
          {isCurrentDay && (
            <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">Today</span>
          )}
        </div>

        {/* Plan goals */}
        {planData && (
          <div>
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mb-3">
              <p className="text-xs font-medium text-primary">Week {planData.week.week_number}: {planData.week.focus}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{planData.week.weekly_objective}</p>
            </div>

            <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> This Week's Plan
            </h4>
            <div className="space-y-2">
              {planData.week.daily_goals?.map((dg, di) => {
                const isThisDay = di === planData.dayIdx;
                const route = CATEGORY_ROUTES[dg.category];
                const CategoryIcon = CATEGORY_ICONS[dg.category] || Dumbbell;

                const handleClick = () => {
                  if (route) {
                    navigate(route);
                  } else {
                    toggleDayComplete.mutate({ weekIdx: planData.weekIdx, dayIdx: di });
                  }
                };

                return (
                  <div
                    key={di}
                    onClick={handleClick}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      dg.completed
                        ? "bg-primary/10 border-primary/20"
                        : isThisDay
                        ? "bg-secondary/50 border-primary/30"
                        : "bg-secondary/30 border-border hover:border-primary/30"
                    } ${route ? "hover:border-primary/50" : ""}`}
                  >
                    {route ? (
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ExternalLink className="w-3 h-3 text-primary" />
                      </div>
                    ) : (
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleDayComplete.mutate({ weekIdx: planData.weekIdx, dayIdx: di }); }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          dg.completed ? "bg-primary border-primary" : "border-muted-foreground/30"
                        }`}
                      >
                        {dg.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${isThisDay ? "text-primary" : ""}`}>
                          {DAY_NAMES[di]}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${CATEGORY_COLORS[dg.category] || "bg-secondary border-border text-muted-foreground"}`}>
                          {dg.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {dg.duration}
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
                        {dg.drill_name}
                        {route && (
                          <span className="text-[10px] text-primary flex items-center gap-0.5 shrink-0">
                            <CategoryIcon className="w-3 h-3" />
                            Go to {dg.category.charAt(0).toUpperCase() + dg.category.slice(1)}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{dg.goal}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setTutorialItem(dg); }}
                          className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
                        >
                          <BookOpen className="w-3 h-3" /> How To
                        </button>
                        {!route && <DrillEquipmentInfo drillName={dg.drill_name} profileId={profile?.id} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {planData.week.xp_target && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                <Sparkles className="w-3 h-3 text-accent" />
                Week XP Target: {planData.week.xp_target}
              </div>
            )}
          </div>
        )}

        {/* Training activity log */}
        {hasActivity ? (
          <div>
            <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-2 flex items-center gap-1">
              <Dumbbell className="w-3 h-3" /> Completed ({completed}/{total})
            </h4>
            <div className="space-y-1.5">
              {logData.training_completed.map((t, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
                  {t.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm flex-1">{t.drill_name}</span>
                  {t.xp_earned > 0 && (
                    <span className="text-[10px] text-accent font-medium">+{t.xp_earned}XP</span>
                  )}
                </div>
              ))}
              {logData.xp_earned_today > 0 && (
                <div className="flex items-center justify-end gap-1.5 text-xs">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span className="font-heading font-bold text-accent">+{logData.xp_earned_today} XP today</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">No training logged for this day.</p>
          </div>
        )}

        {!planData && !hasActivity && (
          <div className="text-center py-4">
            <Dumbbell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No plan or activity for this day.</p>
            {!activePlan && (
              <p className="text-xs text-muted-foreground mt-1">Generate a Development Plan first to see scheduled drills.</p>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <TutorialModal
        open={!!tutorialItem}
        onClose={() => setTutorialItem(null)}
        item={tutorialItem}
        context={`This is a training drill from the development plan. Explain proper execution, key coaching points, and progression ideas for a ${profile?.age}-year-old soccer player.`}
        triggerLabel={tutorialItem?.drill_name || "Tutorial"}
      />

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg bg-secondary p-0.5">
          <button
            onClick={() => { setViewMode("week"); setSelectedDate(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === "week" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => { setViewMode("month"); setSelectedDate(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === "month" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Month
          </button>
        </div>

        {viewMode === "month" ? (
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-heading font-bold text-sm">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-heading font-bold text-sm text-muted-foreground">
              {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}
            </h3>
            <button onClick={nextWeek} className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((day) => (
              <div key={day} className="p-2 text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{day}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startingDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border-b border-r border-border bg-secondary/20" />
            ))}
            {daysInMonth.map((date) => {
              const planData = getPlanForDate(date);
              const logData = getLogForDay(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const hasData = !!planData || (logData && getTotalDrills(logData) > 0);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(isSelected ? null : date)}
                  className={`aspect-square border-b border-r border-border p-1 flex flex-col items-center justify-center relative transition-colors hover:bg-secondary/50 ${
                    isSelected ? "bg-primary/10 ring-1 ring-primary" : ""
                  } ${isCurrentDay ? "bg-primary/5" : ""}`}
                >
                  <span className={`text-xs font-medium ${isCurrentDay ? "text-primary font-bold" : ""}`}>
                    {format(date, "d")}
                  </span>
                  {hasData && (
                    <div className="flex gap-0.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${planData ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      {logData && getCompletedCount(logData) > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dot Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Scheduled drill</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span>Completed activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary/10 ring-1 ring-primary/30" />
          <span>Selected</span>
        </div>
      </div>

      {/* Week View */}
      {viewMode === "week" && (
        <AnimatePresence mode="wait">
          <motion.div
            key={format(weekStart, "yyyy-MM-dd")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-2"
          >
            {weekDays.map((day) => {
              const planData = getPlanForDate(day);
              const log = getLogForDay(day);
              const completed = getCompletedCount(log);
              const total = getTotalDrills(log);
              const hasActivity = total > 0;
              const isCurrentDay = isToday(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    isCurrentDay
                      ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                      : hasActivity
                      ? "bg-card border-border hover:border-primary/30"
                      : "bg-card/50 border-border/50 hover:border-primary/20"
                  } ${isSelected ? "ring-1 ring-primary" : ""}`}
                >
                  <div className="flex items-center gap-4">
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

                    <div className="flex-1 min-w-0">
                      {/* Plan summary */}
                      {planData?.dailyGoal && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <BookOpen className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary truncate">
                            {planData.dailyGoal.drill_name}
                          </span>
                          {planData.dailyGoal.completed && (
                            <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                      )}

                      {/* Activity summary */}
                      {hasActivity ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-semibold">
                              {completed}/{total} drills completed
                            </span>
                          </div>
                          {log.training_completed.slice(0, 2).map((t, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              {t.completed ? (
                                <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                              ) : (
                                <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className="text-xs truncate text-muted-foreground">{t.drill_name}</span>
                            </div>
                          ))}
                          {log.training_completed.length > 2 && (
                            <p className="text-[10px] text-muted-foreground">+{log.training_completed.length - 2} more</p>
                          )}
                        </div>
                      ) : !planData && (
                        <p className="text-sm text-muted-foreground">
                          {isCurrentDay ? "No training logged today" : "Rest day"}
                        </p>
                      )}
                    </div>

                    {hasActivity && log.xp_earned_today > 0 && (
                      <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center border border-accent/30 flex-shrink-0">
                        <span className="text-xs font-heading font-bold text-accent">+{log.xp_earned_today}</span>
                      </div>
                    )}
                  </div>

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
      )}

      {/* Selected day detail */}
      <AnimatePresence>
        {selectedDate && renderDayCard(selectedDate, selectedDatePlan, selectedDateLog)}
      </AnimatePresence>

      {/* Plan Progress */}
      {activePlan?.weekly_goals && (
        <div className="rounded-xl bg-card border border-border p-4">
          <h4 className="font-heading font-bold text-xs tracking-wider uppercase text-muted-foreground mb-3">
            Plan Progress
          </h4>
          <div className="space-y-2">
            {activePlan.weekly_goals.slice(0, 6).map((week, wi) => {
              const completed = week.daily_goals?.filter((d) => d.completed).length || 0;
              const total = week.daily_goals?.length || 5;
              return (
                <div key={wi} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-16 flex-shrink-0">Week {week.week_number}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(completed / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{completed}/{total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}