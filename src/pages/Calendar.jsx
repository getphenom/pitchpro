import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Clock, Calendar as CalendarIcon, BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from "date-fns";
import DrillDetailDialog from "@/components/training/DrillDetailDialog";
import DrillEquipmentInfo from "@/components/training/DrillEquipmentInfo";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CATEGORY_COLORS = {
  technical: "bg-blue-500/15 border-blue-500/30 text-blue-400",
  physical: "bg-green-500/15 border-green-500/30 text-green-400",
  tactical: "bg-orange-500/15 border-orange-500/30 text-orange-400",
  mental: "bg-purple-500/15 border-purple-500/30 text-purple-400",
  recovery: "bg-teal-500/15 border-teal-500/30 text-teal-400",
};

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDrill, setSelectedDrill] = useState(null);

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });
  const profile = profiles?.[0];

  const { data: plans = [], isLoading: loadingPlan } = useQuery({
    queryKey: ["development-plans", profile?.id],
    queryFn: () => base44.entities.DevelopmentPlan.filter({ player_id: profile?.id, status: "active" }, "-created_date", 1),
    enabled: !!profile,
  });

  const activePlan = plans?.[0];

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startingDayIndex = getDay(startOfMonth(currentMonth));

  const getPlanForDate = (date) => {
    if (!activePlan?.weekly_goals) return null;
    const planStart = new Date(activePlan.start_date);
    const diffDays = Math.floor((date - planStart) / (1000 * 60 * 60 * 24));
    const weekIdx = Math.floor(diffDays / 7);
    if (weekIdx < 0 || weekIdx >= activePlan.weekly_goals.length) return null;
    const week = activePlan.weekly_goals[weekIdx];
    const dayOfWeek = getDay(date);
    const dayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (dayIdx >= week.daily_goals?.length) return null;
    return { week, weekIdx, dayIdx, dailyGoal: week.daily_goals[dayIdx] };
  };

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

  const selectedDayPlan = selectedDate ? getPlanForDate(selectedDate) : null;
  const todayPlan = getPlanForDate(new Date());
  const agendaDate = selectedDayPlan ? selectedDate : new Date();
  const agendaPlan = selectedDayPlan || todayPlan;

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  if (loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Calendar</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Your training plan at a glance — tap any date for details
          </p>
        </div>

        <DrillDetailDialog
          open={!!selectedDrill}
          onClose={() => setSelectedDrill(null)}
          drill={selectedDrill}
          category={selectedDrill?.category || "technical"}
          profile={profile}
          allDrills={[]}
          onSwap={() => {}}
        />

        {/* Month header */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-9 h-9 rounded-xl hover:bg-secondary flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="font-heading font-bold text-base">{format(currentMonth, "MMMM yyyy")}</h3>
          <button onClick={nextMonth} className="w-9 h-9 rounded-xl hover:bg-secondary flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((day) => (
              <div key={day} className="p-3 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">{day}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startingDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border-b border-r border-border bg-secondary/10" />
            ))}
            {daysInMonth.map((date) => {
              const planData = getPlanForDate(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const hasPlan = !!planData;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square border-b border-r border-border p-1.5 flex flex-col items-center justify-center relative transition-colors hover:bg-secondary/40 ${
                    isSelected ? "bg-primary/15 ring-2 ring-primary" : ""
                  } ${isCurrentDay && !isSelected ? "bg-primary/5" : ""}`}
                >
                  <span className={`text-sm font-semibold ${isCurrentDay ? "text-primary" : ""}`}>
                    {format(date, "d")}
                  </span>
                  {hasPlan && (
                    <div className="flex gap-1 mt-1">
                      {planData.week.daily_goals?.slice(0, 5).map((dg, di) => (
                        <div
                          key={di}
                          className={`w-1.5 h-1.5 rounded-full ${
                            dg.completed ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Agenda Section */}
        <div>
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground mb-3">
            {selectedDayPlan ? format(agendaDate, "EEEE, MMMM d") : "Today's Agenda"}
            {!selectedDayPlan && isToday(agendaDate) && (
              <span className="ml-2 text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">Today</span>
            )}
          </h3>

          {agendaPlan ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                <p className="text-xs font-medium text-primary">
                  Week {agendaPlan.week.week_number}: {agendaPlan.week.focus}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{agendaPlan.week.weekly_objective}</p>
              </div>

              {agendaPlan.week.daily_goals?.map((dg, di) => {
                const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                const isTargetDay = selectedDayPlan ? di === agendaPlan.dayIdx : true;
                return (
                  <motion.div
                    key={di}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: di * 0.05 }}
                    onClick={() => {
                      if (dg.drill_name) {
                        setSelectedDrill({
                          name: dg.drill_name,
                          duration: dg.duration,
                          desc: dg.goal,
                          category: dg.category || "technical",
                          xp: agendaPlan.week.xp_target ? Math.round(agendaPlan.week.xp_target / 5) : 20,
                        });
                      }
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      dg.completed
                        ? "bg-primary/10 border-primary/20"
                        : isTargetDay
                        ? "bg-secondary/50 border-primary/30 hover:border-primary/50"
                        : "bg-secondary/30 border-border hover:border-primary/30"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDayComplete.mutate({ weekIdx: agendaPlan.weekIdx, dayIdx: di });
                      }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        dg.completed ? "bg-primary border-primary" : "border-muted-foreground/30 hover:border-primary/50"
                      }`}
                    >
                      {dg.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold">{dayNames[di]}</span>
                        {dg.category && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${CATEGORY_COLORS[dg.category] || "bg-secondary border-border text-muted-foreground"}`}>
                            {dg.category}
                          </span>
                        )}
                        {dg.duration && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {dg.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1">{dg.drill_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{dg.goal}</p>
                      <div className="mt-2">
                        <DrillEquipmentInfo drillName={dg.drill_name} profileId={profile?.id} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {agendaPlan.week.xp_target && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-accent" />
                  Week XP Target: {agendaPlan.week.xp_target}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-card border border-border p-6 text-center space-y-2">
              <CalendarIcon className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">
                {!activePlan
                  ? "No active development plan yet."
                  : "No plan for this day."}
              </p>
              <p className="text-xs text-muted-foreground">
                {!activePlan
                  ? "Generate one from the IDP tab to see your schedule here."
                  : "Try selecting another date on the calendar above."}
              </p>
            </div>
          )}
        </div>

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
    </div>
  );
}