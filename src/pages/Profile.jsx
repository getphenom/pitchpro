import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Edit2, Save, LogOut, Trophy, Flame, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import XpBar from "@/components/shared/XpBar";
import StatRadar from "@/components/shared/StatRadar";
import TrophyCase from "@/components/profile/TrophyCase";
import { POSITION_LABELS, getLevel, LEVEL_TITLES, STAT_COLORS } from "@/lib/gameData";
import { motion } from "framer-motion";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const updateProfile = useMutation({
    mutationFn: (data) => base44.entities.PlayerProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setEditing(false);
    },
  });

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

    updateProfile.mutate({
      ...editData,
      age: Number(editData.age),
      height_cm: heightCm,
      weight_kg: weightKg,
    });
  };

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
  const stats = profile.stats || {};

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-6 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
            <span className="font-heading font-bold text-3xl text-primary">{level}</span>
          </div>
          <h1 className="text-2xl font-heading font-bold">{profile.player_name}</h1>
          <p className="text-sm text-primary font-medium mt-1">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {POSITION_LABELS[profile.position]} · {profile.age} years old
            {displayFt > 0 && ` · ${displayFt}ft ${displayIn}in`}
            {displayLbs && ` · ${displayLbs} lbs`}
          </p>
          <div className="mt-4">
            <XpBar xp={profile.xp || 0} />
          </div>
        </motion.div>

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

        {/* Stats Radar */}
        <div className="rounded-xl bg-card border border-border p-4">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground mb-2">
            Player Attributes
          </h3>
          <StatRadar stats={stats} />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-lg font-heading font-bold" style={{ color: STAT_COLORS[key] }}>
                  {value}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">{key}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trophy Case — All Badges */}
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
                <Input
                  value={editData.player_name}
                  onChange={(e) => setEditData({ ...editData, player_name: e.target.value })}
                  className="mt-1 bg-secondary"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Age</Label>
                <Input
                  type="number"
                  value={editData.age}
                  onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                  className="mt-1 bg-secondary"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Position</Label>
                <Select value={editData.position} onValueChange={(v) => setEditData({ ...editData, position: v })}>
                  <SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(POSITION_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Level</Label>
                <Select value={editData.skill_level} onValueChange={(v) => setEditData({ ...editData, skill_level: v })}>
                  <SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Height</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="ft"
                      value={editData.height_ft}
                      onChange={(e) => setEditData({ ...editData, height_ft: e.target.value })}
                      className="bg-secondary pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ft</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="in"
                      value={editData.height_in}
                      onChange={(e) => setEditData({ ...editData, height_in: e.target.value })}
                      className="bg-secondary pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Weight (lbs)</Label>
                <Input
                  type="number"
                  value={editData.weight_lbs}
                  onChange={(e) => setEditData({ ...editData, weight_lbs: e.target.value })}
                  className="mt-1 bg-secondary"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button variant="outline" className="w-full" onClick={handleEdit}>
            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        )}

        <Button
          variant="ghost"
          className="w-full text-destructive hover:text-destructive"
          onClick={() => base44.auth.logout()}
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}