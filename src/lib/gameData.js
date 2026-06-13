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
  streak_14: { name: "Fortnight Force", icon: "⚡", desc: "14-day streak" },
  streak_30: { name: "Iron Will", icon: "🏆", desc: "30-day streak" },
  streak_60: { name: "Unstoppable", icon: "💎", desc: "60-day streak" },
  streak_100: { name: "Centurion", icon: "👑", desc: "100-day streak" },
  hydrated: { name: "Hydrated", icon: "💧", desc: "Hit water goal 5 times" },
  hydration_king: { name: "Hydration King", icon: "🌊", desc: "Hit water goal 20 times" },
  nutrition_pro: { name: "Fuel Master", icon: "🥗", desc: "Logged all meals 7 days" },
  mental_strong: { name: "Mind of Steel", icon: "🧠", desc: "5 mental sessions" },
  mental_elite: { name: "Zen Master", icon: "🧘", desc: "20 mental sessions" },
  level_5: { name: "Rising Star", icon: "⭐", desc: "Reached Level 5" },
  level_10: { name: "Pro Player", icon: "🌟", desc: "Reached Level 10" },
  level_15: { name: "World Class", icon: "🌍", desc: "Reached Level 15" },
  level_20: { name: "GOAT Status", icon: "🐐", desc: "Reached Level 20" },
  first_training: { name: "First Touch", icon: "👟", desc: "Completed first training" },
  training_10: { name: "Training Regular", icon: "🎯", desc: "Completed 10 training drills" },
  training_50: { name: "Training Machine", icon: "🤖", desc: "Completed 50 training drills" },
  training_100: { name: "Relentless", icon: "🚀", desc: "Completed 100 training drills" },
  tactical_mind: { name: "Tactical Mind", icon: "📋", desc: "Completed 10 tactical sessions" },
  perfect_week: { name: "Perfect Week", icon: "💯", desc: "3+ quests & 2L water for 7 days straight" },
  recovery_pro: { name: "Recovery Pro", icon: "🛌", desc: "Logged 7+ hours sleep for 5 days" },
  xp_1000: { name: "XP Hunter", icon: "🎪", desc: "Earned 1,000 total XP" },
  xp_5000: { name: "XP Legend", icon: "✨", desc: "Earned 5,000 total XP" },
  xp_10000: { name: "XP Immortal", icon: "💫", desc: "Earned 10,000 total XP" },
  assessment_done: { name: "Tested & Ready", icon: "📝", desc: "Completed initial assessment" },
  injury_free: { name: "Iron Body", icon: "🛡️", desc: "30 days injury-free streak" },
};

// Badge criteria: (profile, dailyLogs) => boolean
export const BADGE_CRITERIA = {
  first_login: () => true,
  streak_3: (p) => (p.streak_days || 0) >= 3,
  streak_7: (p) => (p.streak_days || 0) >= 7,
  streak_14: (p) => (p.streak_days || 0) >= 14,
  streak_30: (p) => (p.streak_days || 0) >= 30,
  streak_60: (p) => (p.streak_days || 0) >= 60,
  streak_100: (p) => (p.streak_days || 0) >= 100,
  hydrated: (_, logs) => logs.filter(l => (l.water_ml || 0) >= 2000).length >= 5,
  hydration_king: (_, logs) => logs.filter(l => (l.water_ml || 0) >= 2000).length >= 20,
  nutrition_pro: (_, logs) => {
    const recent = logs.slice(0, 7);
    return recent.length >= 7 && recent.every(l => {
      const meals = l.meals_logged || [];
      return meals.length >= 4 && meals.every(m => m.completed);
    });
  },
  mental_strong: (_, logs) => logs.filter(l => l.mental_session_done).length >= 5,
  mental_elite: (_, logs) => logs.filter(l => l.mental_session_done).length >= 20,
  level_5: (p) => getLevel(p.xp || 0) >= 5,
  level_10: (p) => getLevel(p.xp || 0) >= 10,
  level_15: (p) => getLevel(p.xp || 0) >= 15,
  level_20: (p) => getLevel(p.xp || 0) >= 20,
  first_training: (_, logs) => logs.some(l => (l.training_completed || []).some(t => t.completed)),
  training_10: (_, logs) => {
    let count = 0;
    logs.forEach(l => (l.training_completed || []).forEach(t => { if (t.completed) count++; }));
    return count >= 10;
  },
  training_50: (_, logs) => {
    let count = 0;
    logs.forEach(l => (l.training_completed || []).forEach(t => { if (t.completed) count++; }));
    return count >= 50;
  },
  training_100: (_, logs) => {
    let count = 0;
    logs.forEach(l => (l.training_completed || []).forEach(t => { if (t.completed) count++; }));
    return count >= 100;
  },
  tactical_mind: (_, logs) => {
    let count = 0;
    logs.forEach(l => (l.training_completed || []).forEach(t => { if (t.completed && t.category === 'tactical') count++; }));
    return count >= 10;
  },
  perfect_week: (_, logs) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekLogs = logs.filter(l => new Date(l.date + 'T00:00:00') >= weekAgo);
    return weekLogs.length >= 7 && weekLogs.every(l => 
      (l.quests_completed || []).length >= 3 && (l.water_ml || 0) >= 2000
    );
  },
  recovery_pro: (_, logs) => logs.filter(l => (l.sleep_hours || 0) >= 7).length >= 5,
  xp_1000: (p) => (p.xp || 0) >= 1000,
  xp_5000: (p) => (p.xp || 0) >= 5000,
  xp_10000: (p) => (p.xp || 0) >= 10000,
  assessment_done: (p) => p.assessment_completed === true,
  injury_free: () => false, // requires injury log context — placeholder
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