import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, Clock, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday, isSameMonth } from "date-fns";
import TutorialModal from "@/components/shared/TutorialModal";
import DrillEquipmentInfo from "@/components/training/DrillEquipmentInfo";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CATEGORY_COLORS = {
  technical: "bg-blue-500/15 border-blue-500/30 text-blue-400",
  physical: "bg-green-500/15 border-green-500/30 text-green-400",
  tactical: "bg-orange-500/15 border-orange-500/30 text-orange-400",
  mental: "bg-purple-500/15 border-purple-500/30 text-purple-400",
  recovery: "bg-teal-500/15 border-teal-500/30 text-teal-400",
};

export default function TrainingSchedule({ profile }) {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tutorialItem, setTutorialItem] = useState(null);

  const { data: plans = [], isLoading: loadingPlan } = useQuery({
    queryKey: ["development-plans", profile?.id],
    queryFn: () => base44.entities.DevelopmentPlan.filter({ player_id: profile.id, status: "active" }, "-created_date", 1),
    enabled: !!profile,
  });

  const activePlan = plans?.[0];

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startingDayIndex = getDay(startOfMonth(currentMonth));

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

  // Map a date to the corresponding week in the plan
  const getPlanForDate = (date) => {
    if (!activePlan?.weekly_goals) return null;
    const planStart = new Date(activePlan.start_date);
    const diffDays = Math.floor((date - planStart) / (1000 * 60 * 60 * 24));
    const weekIdx = Math.floor(diffDays / 7);
    if (weekIdx < 0 || weekIdx >= activePlan.weekly_goals.length) return null;
    const week = activePlan.weekly_goals[weekIdx];
    const dayOfWeek = getDay(date); // 0=Sun, 1=Mon...
    const dayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon-Fri index
    if (dayIdx >= week.daily_goals?.length) return null;
    return { week, weekIdx, dayIdx, dailyGoal: week.daily_goals[dayIdx] };
  };

  const selectedDayPlan = selectedDate ? getPlanForDate(selectedDate) : null;

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TutorialModal
        open={!!tutorialItem}
        onClose={() => setTutorialItem(null)}
        item={tutorialItem}
        context={`This is a training drill from the development plan. Explain proper execution, key coaching points, and progression ideas for a ${profile.age}-year-old soccer player.`}
        triggerLabel={tutorialItem?.drill_name || "Tutorial"}
      />

      {/* Month header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-heading font-bold text-sm">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((day) => (
            <div key={day} className="p-2 text-center">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">{day}</span>
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square border-b border-r border-border bg-secondary/20" />
          ))}
          {daysInMonth.map((date) => {
            const planData = getPlanForDate(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);
            const hasPlan = !!planData;
            const allCompleted = planData?.dailyGoal?.completed;

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
                {hasPlan && (
                  <div className="flex gap-0.5 mt-0.5">
                    {planData.week.daily_goals?.map((dg, di) => {
                      if (di < 5) {
                        return (
                          <div
                            key={di}
                            className={`w-1.5 h-1.5 rounded-full ${
                              dg.completed ? "bg-primary" : "bg-muted-foreground/30"
                            }`}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card border border-primary/20 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">{format(selectedDate, "EEEE, MMMM d")}</h4>
            </div>
            {isToday(selectedDate) && (
              <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">Today</span>
            )}
          </div>

          {selectedDayPlan ? (
            <>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <p className="text-xs font-medium text-primary">Week {selectedDayPlan.week.week_number}: {selectedDayPlan.week.focus}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedDayPlan.week.weekly_objective}</p>
              </div>

              <div className="space-y-2">
                {/* Show all daily goals for this week */}
                {selectedDayPlan.week.daily_goals?.map((dg, di) => {
                  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                  const isThisDay = di === selectedDayPlan.dayIdx;
                  return (
                    <div
                      key={di}
                      onClick={() => toggleDayComplete.mutate({ weekIdx: selectedDayPlan.weekIdx, dayIdx: di })}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        dg.completed
                          ? "bg-primary/10 border-primary/20"
                          : isThisDay
                          ? "bg-secondary/50 border-primary/30"
                          : "bg-secondary/30 border-border hover:border-primary/30"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          dg.completed ? "bg-primary border-primary" : "border-muted-foreground/30"
                        }`}
                      >
                        {dg.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${isThisDay ? "text-primary" : ""}`}>
                            {dayNames[di]}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md border ${CATEGORY_COLORS[dg.category] || "bg-secondary border-border text-muted-foreground"}`}
                          >
                            {dg.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {dg.duration}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-0.5">{dg.drill_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{dg.goal}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setTutorialItem(dg); }}
                            className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
                          >
                            <BookOpen className="w-3 h-3" /> How To
                          </button>
                          <DrillEquipmentInfo drillName={dg.drill_name} profileId={profile?.id} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedDayPlan.week.xp_target && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-accent" />
                  Week XP Target: {selectedDayPlan.week.xp_target}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No plan for this day.</p>
              <p className="text-xs text-muted-foreground mt-1">
                {!activePlan ? "Generate a Development Plan from the IDP tab first." : "This date falls outside your plan's range."}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Legend & Progress */}
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