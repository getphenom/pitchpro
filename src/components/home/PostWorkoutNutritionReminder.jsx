import { useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

const NOTIFIED_KEY = "post_workout_notified";

function getNotifiedMap() {
  try {
    const stored = localStorage.getItem(NOTIFIED_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function markNotified(date) {
  try {
    const map = getNotifiedMap();
    map[date] = Date.now();
    // Keep only last 7 days
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const key of Object.keys(map)) {
      if (map[key] < cutoff) delete map[key];
    }
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(map));
  } catch {}
}

export default function PostWorkoutNutritionReminder() {
  const timersRef = useRef({});

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
    staleTime: 5 * 60 * 1000,
  });

  const profile = profiles?.[0];
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: logs } = useQuery({
    queryKey: ["daily-log", today],
    queryFn: () => base44.entities.DailyLog.filter({ date: today }),
    enabled: !!profile,
    refetchInterval: 30 * 1000, // poll every 30s to catch new training logs
  });

  const sendPostWorkoutNotification = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const messages = [
      { title: "🥤 Post-Workout Fuel!", body: "30 min since your training — grab a protein shake or recovery snack!" },
      { title: "🍌 Recovery Time!", body: "Your muscles need fuel. Eat a banana with some nuts or a protein bar!" },
      { title: "💪 Refuel Reminder", body: "Post-training nutrition window is open — hydrate and get some protein in!" },
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    new Notification(msg.title, { body: msg.body, icon: "⚽", tag: "post-workout-nutrition" });
  }, []);

  useEffect(() => {
    if (!logs?.length || !profile) return;

    const dailyLog = logs[0];
    const trainingCompleted = dailyLog?.training_completed || [];
    const newlyCompleted = trainingCompleted.filter((t) => t.completed);

    if (newlyCompleted.length === 0) return;

    const notifiedMap = getNotifiedMap();
    if (notifiedMap[today]) return; // already notified today

    // Schedule notification 30 minutes from now
    const key = today;
    if (timersRef.current[key]) return; // already scheduled

    timersRef.current[key] = setTimeout(() => {
      sendPostWorkoutNotification();
      markNotified(today);
      delete timersRef.current[key];
    }, 30 * 60 * 1000);

    return () => {
      if (timersRef.current[key]) {
        clearTimeout(timersRef.current[key]);
        delete timersRef.current[key];
      }
    };
  }, [logs, profile, today, sendPostWorkoutNotification]);

  return null;
}