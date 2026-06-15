import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, startOfWeek } from "date-fns";
import XpBar from "@/components/shared/XpBar";
import WaterTracker from "@/components/shared/WaterTracker";
import DailyQuests from "@/components/home/DailyQuests";
import StreakBanner from "@/components/home/StreakBanner";
import WeeklyProgress from "@/components/shared/WeeklyProgress";
import PerformanceFeedback from "@/components/home/PerformanceFeedback";
import DailyReminder from "@/components/home/DailyReminder";

import ReadinessScore from "@/components/home/ReadinessScore";
import WeeklySummary from "@/components/home/WeeklySummary";
import DashboardCharts from "@/components/home/DashboardCharts";
import IdpSkillChart from "@/components/home/IdpSkillChart";
import GapDrillsHighlights from "@/components/home/GapDrillsHighlights";
import { POSITION_LABELS, BADGES, getLevel, LEVEL_TITLES } from "@/lib/gameData";
import { checkBadges } from "@/lib/badgeChecker";
import { getCategoryBadge, getBadgeById } from "@/lib/categoryProgression";
import CategoryProgression from "@/components/shared/CategoryProgression";
import { Loader2, Trophy, TrendingUp, Sparkles, LayoutDashboard, ListChecks, CalendarPlus } from "lucide-react";
import { motion } from "framer-motion";
import PullToRefresh from "@/components/shared/PullToRefresh";
import PainPatternAlert from "@/components/injury/PainPatternAlert";
import BrowserNotificationPrompt from "@/components/shared/BrowserNotificationPrompt";

const today = format(new Date(), "yyyy-MM-dd");
const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: loadingProfile } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const { data: logs, isLoading: loadingLog } = useQuery({
    queryKey: ["daily-log", today],
    queryFn: () => base44.entities.DailyLog.filter({ date: today }),
    enabled: !!profile,
  });

  const dailyLog = logs?.[0];

  const { data: snapshots = [], refetch: refetchSnapshots } = useQuery({
    queryKey: ["stat-snapshots", profile?.id],
    queryFn: () =>
      base44.entities.StatSnapshot.filter(
        { player_id: profile.id },
        "-week_start",
        20
      ),
    enabled: !!profile,
  });

  const { data: allLogs = [] } = useQuery({
    queryKey: ["all-daily-logs"],
    queryFn: () => base44.entities.DailyLog.list("-date", 200),
    enabled: !!profile,
  });

  const [view, setView] = useState("summary");
  const [newBadges, setNewBadges] = useState([]);

  // Auto-snapshot current stats for this week
  useEffect(() => {
    if (!profile || !snapshots) return;
    const alreadySnapped = snapshots.some((s) => s.week_start === currentWeekStart);
    if (alreadySnapped) return;
    base44.entities.StatSnapshot.create({
      player_id: profile.id,
      week_start: currentWeekStart,
      stats: profile.stats || {},
      xp: profile.xp || 0,
      level: getLevel(profile.xp || 0),
    }).then(() => refetchSnapshots());
  }, [profile?.id, snapshots?.length]);

  const updateLog = useMutation({
    mutationFn: async (data) => {
      if (dailyLog) {
        return base44.entities.DailyLog.update(dailyLog.id, data);
      } else {
        return base44.entities.DailyLog.create({ player_id: profile.id, date: today, ...data });
      }
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["daily-log", today] });
      const previousLogs = queryClient.getQueryData(["daily-log", today]);
      const optimisticLog = { ...dailyLog, ...newData };
      queryClient.setQueryData(["daily-log", today], [optimisticLog]);
      return { previousLogs };
    },
    onError: (_err, _newData, context) => {
      queryClient.setQueryData(["daily-log", today], context.previousLogs);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-log"] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data) => base44.entities.PlayerProfile.update(profile.id, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["profiles"] });
      const previousProfiles = queryClient.getQueryData(["profiles"]);
      queryClient.setQueryData(["profiles"], [{ ...profile, ...newData }]);
      return { previousProfiles };
    },
    onError: (_err, _newData, context) => {
      queryClient.setQueryData(["profiles"], context.previousProfiles);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });

  const handleQuestComplete = async (quest, notes = "") => {
    const currentCompleted = dailyLog?.quests_completed || [];
    const isCompleted = currentCompleted.includes(quest.id);

    const newCompleted = isCompleted
      ? currentCompleted.filter((id) => id !== quest.id)
      : [...currentCompleted, quest.id];
    const xpDelta = isCompleted ? -quest.xp : quest.xp;
    const newXp = (dailyLog?.xp_earned_today || 0) + xpDelta;

    // Build updated training_completed with notes
    const currentTraining = dailyLog?.training_completed || [];
    let newTraining = [...currentTraining];
    if (quest.category === "training") {
      if (isCompleted) {
        newTraining = newTraining.filter((t) => t.drill_name !== quest.title);
      } else {
        newTraining.push({
          category: quest.category,
          drill_name: quest.title,
          completed: true,
          xp_earned: quest.xp,
          notes: notes,
          date: today,
        });
      }
    }

    await updateLog.mutateAsync({
      quests_completed: newCompleted,
      xp_earned_today: Math.max(0, newXp),
      ...(quest.category === "training" ? { training_completed: newTraining } : {}),
    });

    const updatedProfile = {
      xp: Math.max(0, (profile.xp || 0) + xpDelta),
      level: getLevel(Math.max(0, (profile.xp || 0) + xpDelta)),
      last_active_date: today,
    };

    // Check for new badges
    const badges = checkBadges({ ...profile, ...updatedProfile }, allLogs);
    if (badges.length > 0) {
      updatedProfile.badges = [...new Set([...(profile.badges || []), ...badges])];
      setNewBadges(badges);
      setTimeout(() => setNewBadges([]), 5000);
    }

    await updateProfile.mutateAsync(updatedProfile);
  };

  const [exporting, setExporting] = useState(false);

  const handleExportCalendar = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke("exportCalendarEvents", {}, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/calendar;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `soccer-quests-${today}.ics`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // silent
    }
    setExporting(false);
  };

  const handleWaterUpdate = async (ml) => {
    await updateLog.mutateAsync({ water_ml: ml });
  };

  const handleMealUpdate = async (meals) => {
    await updateLog.mutateAsync({ meals_logged: meals });
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    navigate("/onboarding");
    return null;
  }

  const level = getLevel(profile.xp || 0);
  const title = LEVEL_TITLES[level - 1] || "Legend";

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["daily-log"] }),
      queryClient.invalidateQueries({ queryKey: ["profiles"] }),
      queryClient.invalidateQueries({ queryKey: ["stat-snapshots"] }),
    ]);
  };

  return (
    <div className="min-h-screen bg-background">
      <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Welcome back</p>
            <h1 className="text-2xl font-heading font-bold mt-1">{profile.player_name}</h1>
            <p className="text-xs text-primary font-medium mt-0.5">
              {POSITION_LABELS[profile.position]} · {title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCalendar}
              disabled={exporting}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors bg-secondary/50 hover:bg-secondary rounded-lg px-2.5 py-1.5"
              title="Export today's quests to your calendar"
            >
              <CalendarPlus className={`w-3.5 h-3.5 ${exporting ? 'animate-spin' : ''}`} />
              Export
            </button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
              <span className="font-heading font-bold text-xl text-primary">{level}</span>
            </div>
          </div>
        </motion.div>

        {/* Pain Pattern Alert */}
        <PainPatternAlert profile={profile} />

        {/* XP Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <XpBar xp={profile.xp || 0} />
        </motion.div>

        {/* Streak */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StreakBanner streak={profile.streak_days || 0} />
        </motion.div>

        {/* View Toggle */}
        <div className="flex rounded-xl bg-secondary p-1 gap-1">
          <button
            onClick={() => setView("summary")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              view === "summary"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Summary
          </button>
          <button
            onClick={() => setView("quests")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              view === "quests"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" /> Today's Quests
          </button>
        </div>

        {/* New Badge Celebration */}
        {newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 border border-accent/40 p-4 flex items-center gap-3"
          >
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            <div>
              <p className="text-sm font-heading font-bold">Badge{newBadges.length > 1 ? 's' : ''} Unlocked!</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {newBadges.map(id => {
                  const b = BADGES[id] || getBadgeById(id);
                  return b ? (
                    <span key={id} className="text-xs bg-accent/20 rounded-full px-2 py-0.5">
                      {b.icon} {b.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* === SUMMARY VIEW === */}
        {view === "summary" && (
          <>
            <DailyReminder dailyLog={dailyLog} profile={profile} />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="rounded-xl bg-card border border-border p-3 text-center">
                <p className="text-2xl font-heading font-bold text-primary">{dailyLog?.quests_completed?.length || 0}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Quests Done</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-3 text-center">
                <p className="text-2xl font-heading font-bold text-blue-400">{Math.floor((dailyLog?.water_ml || 0) / 250)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Glasses</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-3 text-center">
                <p className="text-2xl font-heading font-bold text-accent">{dailyLog?.xp_earned_today || 0}</p>
                <p className="text-[10px] text-muted-foreground mt-1">XP Today</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
              <ReadinessScore dailyLog={dailyLog} profile={profile} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <WaterTracker
                currentMl={dailyLog?.water_ml || 0}
                age={profile.age}
                weight={profile.weight_kg}
                onUpdate={handleWaterUpdate}
              />
            </motion.div>

            <PerformanceFeedback profile={profile} snapshots={snapshots} dailyLog={dailyLog} />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <IdpSkillChart profile={profile} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
            >
              <GapDrillsHighlights profile={profile} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-xl bg-card border border-border p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
                  Weekly Progress
                </h3>
              </div>
              <WeeklyProgress
                currentStats={profile.stats || {}}
                snapshots={snapshots}
              />
            </motion.div>

            <DashboardCharts profile={profile} />

            <WeeklySummary profile={profile} />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <CategoryProgression dailyLogs={allLogs} />
            </motion.div>

            {profile.badges?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground mb-3">
              Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badgeId) => {
                const badge = BADGES[badgeId] || getBadgeById(badgeId);
                if (!badge) return null;
                return (
                  <div
                    key={badgeId}
                    className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2"
                  >
                    <span className="text-lg">{badge.icon}</span>
                    <div>
                      <p className="text-xs font-semibold">{badge.name}</p>
                      <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
          </>
        )}

        {/* === QUESTS VIEW === */}
        {view === "quests" && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="rounded-xl bg-card border border-border p-3 text-center">
                <p className="text-2xl font-heading font-bold text-primary">{dailyLog?.quests_completed?.length || 0}/6</p>
                <p className="text-[10px] text-muted-foreground mt-1">Completed</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-3 text-center">
                <p className="text-2xl font-heading font-bold text-accent">{dailyLog?.xp_earned_today || 0}</p>
                <p className="text-[10px] text-muted-foreground mt-1">XP Today</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-3 text-center">
                <p className="text-2xl font-heading font-bold text-blue-400">{Math.floor((dailyLog?.water_ml || 0) / 250)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Glasses</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <WaterTracker
                currentMl={dailyLog?.water_ml || 0}
                age={profile.age}
                weight={profile.weight_kg}
                onUpdate={handleWaterUpdate}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <DailyQuests
                profile={profile}
                dailyLog={dailyLog}
                onQuestComplete={handleQuestComplete}
              />
            </motion.div>

            <DailyReminder dailyLog={dailyLog} profile={profile} />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <ReadinessScore dailyLog={dailyLog} profile={profile} />
            </motion.div>
          </>
        )}
      </div>


      </PullToRefresh>

      <BrowserNotificationPrompt profile={profile} />
    </div>
  );
}