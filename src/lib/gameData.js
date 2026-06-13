export const POSITION_LABELS = {
  goalkeeper: "Goalkeeper",
  center_back: "Center Back",
  full_back: "Full Back",
  defensive_mid: "Defensive Midfielder",
  central_mid: "Central Midfielder",
  attacking_mid: "Attacking Midfielder",
  winger: "Winger",
  striker: "Striker",
};

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,
  4700, 5700, 6800, 8000, 9500, 11000, 13000, 15000, 17500, 20000,
];

export const getLevel = (xp) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
};

export const getXpForNextLevel = (xp) => {
  const level = getLevel(xp);
  if (level >= LEVEL_THRESHOLDS.length) return xp;
  return LEVEL_THRESHOLDS[level];
};

export const getXpProgress = (xp) => {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 1000;
  return ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
};

export const LEVEL_TITLES = [
  "Rookie", "Trainee", "Rising Star", "Squad Player", "Regular",
  "Key Player", "Star Player", "Captain", "Club Legend", "National Hero",
  "Continental Star", "World Class", "Ballon d'Or Nominee", "Ballon d'Or Winner", "Legend",
  "Icon", "GOAT Contender", "Immortal", "Mythical", "GOAT",
];

export const BADGES = {
  first_login: { name: "Kick Off", icon: "⚽", desc: "Started your journey" },
  streak_3: { name: "Hat Trick", icon: "🔥", desc: "3-day streak" },
  streak_7: { name: "Week Warrior", icon: "💪", desc: "7-day streak" },
  streak_30: { name: "Iron Will", icon: "🏆", desc: "30-day streak" },
  hydrated: { name: "Hydrated", icon: "💧", desc: "Hit water goal 5 times" },
  nutrition_pro: { name: "Fuel Master", icon: "🥗", desc: "Logged all meals 7 days" },
  mental_strong: { name: "Mind of Steel", icon: "🧠", desc: "5 mental sessions" },
  level_5: { name: "Rising Star", icon: "⭐", desc: "Reached Level 5" },
  level_10: { name: "Pro Player", icon: "🌟", desc: "Reached Level 10" },
  first_training: { name: "First Touch", icon: "👟", desc: "Completed first training" },
  tactical_mind: { name: "Tactical Mind", icon: "📋", desc: "Completed 10 tactical sessions" },
};

export const STAT_COLORS = {
  pace: "#22c55e",
  shooting: "#ef4444",
  passing: "#3b82f6",
  dribbling: "#f59e0b",
  defending: "#8b5cf6",
  physical: "#ec4899",
  mental: "#06b6d4",
  tactical: "#f97316",
};

export const MOODS = {
  great: { emoji: "🔥", label: "On Fire" },
  good: { emoji: "😊", label: "Good" },
  okay: { emoji: "😐", label: "Okay" },
  tired: { emoji: "😴", label: "Tired" },
  low: { emoji: "😔", label: "Low" },
};

export const WATER_GOAL_ML = 2500;

export const getWaterGoal = (age, weightKg) => {
  if (age < 13) return 1800;
  if (age < 16) return 2200;
  return weightKg ? Math.round(weightKg * 35) : 2500;
};