import { useState, useEffect, useCallback } from "react";
import { BellRing, X, CheckCircle, ChevronRight, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getWaterGoal } from "@/lib/gameData";

const STORAGE_KEY = "soccer_reminder_dismissed";
const NOTIFY_KEY = "soccer_reminder_notifications";

function getDismissedUntil() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const ts = parseInt(stored, 10);
      if (Date.now() < ts) return ts;
    }
  } catch {}
  return null;
}

function getTimeWindow(hour) {
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17) return "evening";
  return null;
}

const WINDOW_CONFIG = {
  morning: {
    title: "Morning Kick-Off ☀️",
    emoji: "☀️",
    color: "from-sky-500/10 to-sky-600/5 border-sky-500/30",
    iconBg: "bg-sky-500/20",
    iconColor: "text-sky-400",
    headingColor: "text-sky-400",
    btnBg: "bg-sky-600 hover:bg-sky-700",
    message: "Start your day strong! Log your plan and hydrate early.",
  },
  afternoon: {
    title: "Midday Hustle ⚡",
    emoji: "⚡",
    color: "from-orange-500/10 to-orange-600/5 border-orange-500/30",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    headingColor: "text-orange-400",
    btnBg: "bg-orange-600 hover:bg-orange-700",
    message: "Halfway through the day — have you trained yet? Get a session in!",
  },
  evening: {
    title: "Evening Check-In 🌙",
    emoji: "🌙",
    color: "from-amber-500/10 to-amber-600/5 border-amber-500/30",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    headingColor: "text-amber-400",
    btnBg: "bg-amber-600 hover:bg-amber-700",
    message: "Don't forget to finish your daily goals before bed.",
  },
};

export default function DailyReminder({ dailyLog, profile }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [timeWindow, setTimeWindow] = useState(null);

  // Check notification permission on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFY_KEY);
      if (stored === "true" && "Notification" in window) {
        if (Notification.permission === "granted") {
          setNotifyEnabled(true);
        } else if (Notification.permission === "default") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") setNotifyEnabled(true);
          });
        }
      }
    } catch {}
  }, []);

  const sendNotification = useCallback((title, body) => {
    try {
      if (notifyEnabled && Notification.permission === "granted") {
        new Notification(title, { body, icon: "⚽", tag: "daily-reminder" });
      }
    } catch {}
  }, [notifyEnabled]);

  useEffect(() => {
    if (dismissed) return;

    // Check if recently dismissed (within the current time window)
    const dismissedUntil = getDismissedUntil();
    if (dismissedUntil) return;

    const hour = new Date().getHours();
    const window = getTimeWindow(hour);
    if (!window) return;

    setTimeWindow(window);

    const waterGoal = getWaterGoal(profile?.age, profile?.weight_kg);
    const waterLow = !dailyLog || (dailyLog.water_ml || 0) < waterGoal;
    const questsIncomplete = !dailyLog?.quests_completed?.length;
    const noTraining = !dailyLog?.training_completed?.some((t) => t.completed);

    const shouldShow =
      (window === "morning" && waterLow) ||
      (window === "afternoon" && (noTraining || waterLow)) ||
      (window === "evening" && (waterLow || questsIncomplete));

    if (shouldShow) {
      const timer = setTimeout(() => {
        setShow(true);
        // Send browser notification too
        const config = WINDOW_CONFIG[window];
        sendNotification(config.title, config.message);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [dailyLog, dismissed, profile, sendNotification]);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    // Dismiss for 2 hours
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + 2 * 60 * 60 * 1000));
    } catch {}
  };

  const handleSnooze = () => {
    setShow(false);
    // Snooze for 30 minutes
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + 30 * 60 * 1000));
    } catch {}
    setDismissed(true);
    // Re-show after snooze period
    setTimeout(() => setDismissed(false), 30 * 60 * 1000);
  };

  if (!show || !timeWindow) return null;

  const config = WINDOW_CONFIG[timeWindow];
  const waterGoal = getWaterGoal(profile?.age, profile?.weight_kg);
  const waterMl = dailyLog?.water_ml || 0;
  const waterPct = Math.min(100, Math.round((waterMl / waterGoal) * 100));
  const questsDone = dailyLog?.quests_completed?.length || 0;
  const trainingDone = dailyLog?.training_completed?.filter((t) => t.completed)?.length || 0;

  const items = [];
  if (waterPct < 100) items.push({ icon: "💧", text: `${waterPct}% of water goal — drink up!`, done: false });
  if (questsDone === 0) items.push({ icon: "🎯", text: "No quests completed yet today", done: false });
  if (trainingDone === 0) items.push({ icon: "⚽", text: "No training logged — squeeze in a drill!", done: false });
  if (waterPct >= 100) items.push({ icon: "💧", text: "Water goal complete!", done: true });
  if (questsDone > 0) items.push({ icon: "🎯", text: `${questsDone} quest${questsDone > 1 ? "s" : ""} done!`, done: true });
  if (trainingDone > 0) items.push({ icon: "⚽", text: `${trainingDone} drill${trainingDone > 1 ? "s" : ""} completed!`, done: true });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className={`rounded-xl bg-gradient-to-br ${config.color} p-4 overflow-hidden`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${config.iconBg}`}>
            <BellRing className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className={`font-heading font-bold text-sm ${config.headingColor}`}>
                {config.title}
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSnooze}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  title="Snooze 30 min"
                >
                  <BellOff className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-foreground/80">
              Hey {profile?.player_name || "Player"}! {config.message}
            </p>
            <div className="space-y-1.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span
                    className={`text-xs ${
                      item.done ? "text-green-400 line-through" : "text-foreground/70"
                    }`}
                  >
                    {item.text}
                  </span>
                  {item.done && <CheckCircle className="w-3 h-3 text-green-400" />}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleDismiss}
                className={`${config.btnBg} text-white flex-1`}
              >
                I'm on it! <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {/* Enable notifications prompt */}
            {!notifyEnabled && "Notification" in window && Notification.permission === "default" && (
              <button
                onClick={() => {
                  Notification.requestPermission().then((perm) => {
                    if (perm === "granted") {
                      setNotifyEnabled(true);
                      localStorage.setItem(NOTIFY_KEY, "true");
                    }
                  });
                }}
                className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                🔔 Tap to enable browser reminders so you never miss a day
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}