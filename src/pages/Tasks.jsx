import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Loader2, Target, CheckCircle2, Circle, X, ArrowRight, Star, Filter, Dumbbell, UtensilsCrossed, Brain, Map, Timer, Droplets, Sparkles, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_META = {
  training: { label: "Training", icon: Dumbbell, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  nutrition: { label: "Nutrition", icon: UtensilsCrossed, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  mental: { label: "Mental", icon: Brain, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  tactical: { label: "Tactical", icon: Map, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  recovery: { label: "Recovery", icon: Timer, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  hydration: { label: "Hydration", icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  general: { label: "General", icon: Target, color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
};

const LINK_ROUTES = {
  training_drill: "/training",
  tactical_drill: "/tactics",
  nutrition_meal: "/nutrition",
  mental_exercise: "/mental",
  recovery_routine: "/recovery",
};

export default function Tasks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [dismissing, setDismissing] = useState(null);

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });
  const profile = profiles?.[0];

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["player-tasks", profile?.id],
    queryFn: () => base44.entities.PlayerTask.filter({ player_id: profile.id }, "-created_date_ts", 100),
    enabled: !!profile,
  });

  const completeTask = useMutation({
    mutationFn: async (task) => {
      const data = { status: "completed", completed_date: format(new Date(), "yyyy-MM-dd") };
      await base44.entities.PlayerTask.update(task.id, data);
      if (task.xp > 0 && profile) {
        await base44.entities.PlayerProfile.update(profile.id, { xp: (profile.xp || 0) + task.xp });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["player-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const dismissTask = useMutation({
    mutationFn: (taskId) => base44.entities.PlayerTask.update(taskId, { status: "dismissed" }),
    onMutate: (taskId) => setDismissing(taskId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["player-tasks"] });
      setDismissing(null);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => t.status === "active");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const filtered = filter === "all" ? tasks : filter === "active" ? activeTasks : completedTasks;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Task Log</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {activeTasks.length} active · {completedTasks.length} completed
          </p>
        </div>

        {/* Filter */}
        <div className="flex rounded-lg bg-secondary p-1 gap-1">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Done" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <ListChecks className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">No tasks yet</p>
            <p className="text-xs text-muted-foreground">
              Complete daily quests, talk to coaches, or take assessments — your tasks will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((task, i) => {
                const meta = CATEGORY_META[task.category] || CATEGORY_META.general;
                const isActive = task.status === "active";
                const isDismissing = dismissing === task.id;
                const route = LINK_ROUTES[task.link_type];

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isDismissing ? 0.4 : 1, y: 0, scale: isDismissing ? 0.97 : 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-xl border p-4 transition-all ${
                      isActive
                        ? `${meta.bg} hover:border-primary/30 cursor-pointer`
                        : "bg-card border-border/50 opacity-70"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Complete toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isActive) completeTask.mutate(task);
                        }}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {isActive ? (
                          <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-primary/60 transition-colors" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <span className="text-xl flex-shrink-0">{task.icon || "📋"}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm ${!isActive && "line-through text-muted-foreground"}`}>
                              {task.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>

                            {/* Source & link info */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`text-[10px] uppercase tracking-wider font-medium flex items-center gap-1 ${meta.color}`}>
                                <meta.icon className="w-3 h-3" /> {meta.label}
                              </span>
                              {task.source === "daily_quest" && (
                                <span className="text-[10px] text-muted-foreground">From quest</span>
                              )}
                              {task.source === "coach" && (
                                <span className="text-[10px] text-muted-foreground">Coach suggestion</span>
                              )}
                              {task.source === "assessment" && (
                                <span className="text-[10px] text-muted-foreground">From assessment</span>
                              )}
                            </div>

                            {/* Suggested options */}
                            {task.suggested_options && task.suggested_options.length > 0 && isActive && (
                              <div className="mt-3 space-y-1.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  Choose an option:
                                </p>
                                <div className="grid grid-cols-1 gap-1.5">
                                  {task.suggested_options.map((opt, oi) => (
                                    <button
                                      key={oi}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (route) navigate(route);
                                      }}
                                      className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50 hover:border-primary/30 text-left transition-all"
                                    >
                                      <span className="text-sm">{opt.icon || "⚽"}</span>
                                      <div className="flex-1 min-w-0">
                                        <span className="text-xs font-medium">{opt.name}</span>
                                        <span className="text-[10px] text-muted-foreground ml-2">{opt.duration}</span>
                                      </div>
                                      {opt.xp > 0 && (
                                        <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
                                          <Star className="w-2.5 h-2.5" />{opt.xp}
                                        </span>
                                      )}
                                      <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Direct link */}
                            {route && task.link_value && (!task.suggested_options || task.suggested_options.length === 0) && isActive && (
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(route); }}
                                className="mt-2 flex items-center gap-1.5 text-[10px] text-primary hover:underline"
                              >
                                <ArrowRight className="w-3 h-3" />
                                Go to {task.link_value}
                              </button>
                            )}
                          </div>

                          {/* XP + dismiss */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            {task.xp > 0 && (
                              <div className="flex items-center gap-1 bg-accent/15 border border-accent/20 text-accent px-2 py-0.5 rounded-lg">
                                <Star className="w-3 h-3 fill-accent/30" />
                                <span className="text-[11px] font-bold">{task.xp}</span>
                              </div>
                            )}
                            {isActive && (
                              <button
                                onClick={(e) => { e.stopPropagation(); dismissTask.mutate(task.id); }}
                                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}