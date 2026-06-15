import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, Zap, Trophy, Flame, Award, Target, Layers, Edit2, LogOut, Sun, Moon, Bell, BellOff, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import XpBar from "@/components/shared/XpBar";
import FifaPlayerCard from "@/components/profile/FifaPlayerCard";
import IdpProgressChart from "@/components/profile/IdpProgressChart";
import TrophyCase from "@/components/profile/TrophyCase";
import { POSITION_LABELS, getLevel, LEVEL_TITLES } from "@/lib/gameData";
import { useTheme } from "@/lib/ThemeProvider";
import { motion } from "framer-motion";

export default function Player() {
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const updateProfile = useMutation({
    mutationFn: (data) => base44.entities.PlayerProfile.update(profile?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setEditing(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const level = getLevel(profile.xp || 0);
  const title = LEVEL_TITLES[level - 1] || "Legend";
  const cmHeight = profile.height_cm || 0;
  const displayFt = Math.floor(cmHeight / 30.48);
  const displayIn = Math.round((cmHeight % 30.48) / 2.54);
  const displayLbs = profile.weight_kg ? Math.round(profile.weight_kg / 0.453592) : null;

  const handleEdit = () => {
    setEditData({
      player_name: profile.player_name,
      age: profile.age,
      position: profile.position,
      skill_level: profile.skill_level,
      height_ft: cmHeight ? String(Math.floor(cmHeight / 30.48)) : "",
      height_in: cmHeight ? String(Math.round((cmHeight % 30.48) / 2.54)) : "",
      weight_lbs: profile.weight_kg ? String(Math.round(profile.weight_kg / 0.453592)) : "",
      preferred_foot: profile.preferred_foot || "right",
      weekly_training_days: profile.weekly_training_days || 5,
    });
    setEditing(true);
  };

  const handleSave = () => {
    const heightCm = (editData.height_ft || editData.height_in)
      ? Math.round((Number(editData.height_ft || 0) * 30.48) + (Number(editData.height_in || 0) * 2.54))
      : undefined;
    const weightKg = editData.weight_lbs ? Math.round(Number(editData.weight_lbs) * 0.453592) : undefined;
    updateProfile.mutate({ ...editData, age: Number(editData.age), height_cm: heightCm, weight_kg: weightKg });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-yellow-600/5 border border-amber-500/20 p-6 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/40 to-amber-500/20 flex items-center justify-center mx-auto mb-4 border border-amber-400/30">
            <Zap className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-heading font-bold">{profile.player_name}</h1>
          <p className="text-sm text-amber-400 font-medium mt-1">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {POSITION_LABELS[profile.position]} · {profile.age} years old
            {displayFt > 0 && ` · ${displayFt}ft ${displayIn}in`}
            {displayLbs && ` · ${displayLbs} lbs`}
          </p>
          <div className="mt-4">
            <XpBar xp={profile.xp || 0} />
          </div>
        </motion.div>

        {/* FIFA Player Card */}
        <FifaPlayerCard />

        {/* IDP Skill Progression Chart */}
        <IdpProgressChart profile={profile} />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-lg font-heading font-bold">{profile.xp || 0}</p>
            <p className="text-[10px] text-muted-foreground">Total XP</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-heading font-bold">{profile.streak_days || 0}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-heading font-bold">{profile.badges?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Badges</p>
          </div>
        </div>

        {/* IDP / LTDP */}
        <Link
          to="/development"
          className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">IDP / LTDP</h3>
            <p className="text-xs text-muted-foreground">Your Individual & Long-Term Development Plan</p>
          </div>
          <Target className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        {/* Trophy Case */}
        <TrophyCase profile={profile} />

        {/* Edit Profile */}
        {editing ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-card border border-border p-5 space-y-4"
          >
            <h3 className="font-heading font-bold text-sm">Edit Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input value={editData.player_name} onChange={(e) => setEditData({ ...editData, player_name: e.target.value })} className="mt-1 bg-secondary" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Age</Label>
                <Input type="number" value={editData.age} onChange={(e) => setEditData({ ...editData, age: e.target.value })} className="mt-1 bg-secondary" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Position</Label>
                <select
                  value={editData.position}
                  onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                  className="w-full mt-1 bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.entries(POSITION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Level</Label>
                <select
                  value={editData.skill_level}
                  onChange={(e) => setEditData({ ...editData, skill_level: e.target.value })}
                  className="w-full mt-1 bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="elite">Elite</option>
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Height</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="relative">
                    <Input type="number" placeholder="ft" value={editData.height_ft} onChange={(e) => setEditData({ ...editData, height_ft: e.target.value })} className="bg-secondary pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ft</span>
                  </div>
                  <div className="relative">
                    <Input type="number" placeholder="in" value={editData.height_in} onChange={(e) => setEditData({ ...editData, height_in: e.target.value })} className="bg-secondary pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Weight (lbs)</Label>
                <Input type="number" value={editData.weight_lbs} onChange={(e) => setEditData({ ...editData, weight_lbs: e.target.value })} className="mt-1 bg-secondary" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSave}>Save</Button>
            </div>
          </motion.div>
        ) : (
          <Button variant="outline" className="w-full" onClick={handleEdit}>
            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        )}

        {/* Notification Settings */}
        <div className="rounded-xl bg-card border border-border p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-bold text-sm">Daily Reminders</h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Browser Alerts</span>
            </div>
            <button
              onClick={async () => {
                if (profile.browser_notifications) {
                  await updateProfile.mutateAsync({ browser_notifications: false });
                } else if ("Notification" in window && Notification.permission === "default") {
                  const result = await Notification.requestPermission();
                  if (result === "granted") {
                    await updateProfile.mutateAsync({ browser_notifications: true });
                    new Notification("⚽ SoccerPro", { body: "Browser notifications enabled!" });
                  }
                } else {
                  await updateProfile.mutateAsync({ browser_notifications: !profile.browser_notifications });
                }
              }}
              className={`relative w-12 h-7 rounded-full transition-colors ${profile.browser_notifications ? "bg-primary" : "bg-secondary"}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${profile.browser_notifications ? "left-6" : "left-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span className="text-sm">Email Reminders</span>
            </div>
            <button
              onClick={() => updateProfile.mutate({ notifications_enabled: !profile.notifications_enabled })}
              className={`relative w-12 h-7 rounded-full transition-colors ${profile.notifications_enabled ? "bg-primary" : "bg-secondary"}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${profile.notifications_enabled ? "left-6" : "left-1"}`} />
            </button>
          </div>

          {profile.notifications_enabled && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  value={profile.notification_email || ""}
                  onChange={(e) => updateProfile.mutate({ notification_email: e.target.value })}
                  placeholder="your@email.com"
                  className="pl-10 bg-secondary text-sm"
                />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Reminders at 9am, 12pm &amp; 7pm</span>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border hover:bg-secondary/50 transition-colors"
        >
          {theme === "dark" ? (
            <><Sun className="w-4 h-4 text-accent" /><span className="text-sm font-medium">Switch to Light Mode</span></>
          ) : (
            <><Moon className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Switch to Dark Mode</span></>
          )}
        </button>

        <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={() => base44.auth.logout()}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}