import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, BellOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BrowserNotificationPrompt({ profile }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!profile || dismissed || profile.browser_notifications) return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      // Already granted, just update profile
      if (!profile.browser_notifications) {
        base44.entities.PlayerProfile.update(profile.id, { browser_notifications: true });
      }
      return;
    }
    if (Notification.permission === "denied") return;

    // Show prompt after a short delay
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [profile?.id, dismissed]);

  const enableNotifications = async () => {
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        await base44.entities.PlayerProfile.update(profile.id, { browser_notifications: true });
        new Notification("⚽ SoccerPro", {
          body: "Notifications enabled! You'll get reminders for hydration and training.",
          icon: "/favicon.ico",
        });
      }
    } catch (_) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50"
      >
        <div className="rounded-2xl bg-card border-2 border-primary/30 shadow-2xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <p className="font-heading font-bold text-sm">Stay on track</p>
            </div>
            <button
              onClick={() => { setVisible(false); setDismissed(true); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get browser notifications for hydration and training reminders throughout the day.
          </p>
          <div className="flex gap-2">
            <button
              onClick={enableNotifications}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              Enable
            </button>
            <button
              onClick={() => { setVisible(false); setDismissed(true); }}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-muted-foreground text-xs py-2 rounded-lg transition-colors"
            >
              <BellOff className="w-3 h-3 inline mr-1" /> Later
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}