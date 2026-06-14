// ── Category Progression System ──
// Tracks XP per pillar category from DailyLog data and computes tier levels
// Categories: technical, physical, tactical, mental, nutrition, hydration, recovery

export const CATEGORIES = {
  technical:  { label: "Technical",  icon: "⚽",  color: "#22c55e", border: "border-green-500/20", bg: "from-green-500/20 to-green-600/5" },
  physical:   { label: "Physical",   icon: "💪", color: "#ef4444", border: "border-red-500/20",   bg: "from-red-500/20 to-red-600/5" },
  tactical:   { label: "Tactical",   icon: "📋", color: "#f97316", border: "border-orange-500/20", bg: "from-orange-500/20 to-orange-600/5" },
  mental:     { label: "Mental",     icon: "🧠", color: "#06b6d4", border: "border-cyan-500/20",  bg: "from-cyan-500/20 to-cyan-600/5" },
  nutrition:  { label: "Nutrition",  icon: "🥗", color: "#eab308", border: "border-yellow-500/20", bg: "from-yellow-500/20 to-yellow-600/5" },
  hydration:  { label: "Hydration",  icon: "💧", color: "#3b82f6", border: "border-blue-500/20",  bg: "from-blue-500/20 to-blue-600/5" },
  recovery:   { label: "Recovery",   icon: "🛌", color: "#8b5cf6", border: "border-purple-500/20", bg: "from-purple-500/20 to-purple-600/5" },
};

// Thresholds per tier: [Bronze, Silver, Gold, Elite]
export const CATEGORY_THRESHOLDS = [50, 150, 400, 1000];

export const TIER_LABELS = ["Bronze", "Silver", "Gold", "Elite"];
export const TIER_ICONS = ["🥉", "🥈", "🥇", "💎"];

/**
 * Compute category XP from daily logs.
 * Returns { technical, physical, tactical, mental, nutrition, hydration, recovery }
 */
export function getCategoryXp(dailyLogs = []) {
  const xp = { technical: 0, physical: 0, tactical: 0, mental: 0, nutrition: 0, hydration: 0, recovery: 0 };

  dailyLogs.forEach((log) => {
    // Training drills — each has category and xp_earned
    (log.training_completed || []).forEach((t) => {
      if (!t.completed) return;
      const cat = t.category;
      if (xp[cat] !== undefined) {
        xp[cat] += t.xp_earned || 0;
      }
    });

    // Mental sessions
    if (log.mental_session_done) {
      xp.mental += 20;
    }

    // Nutrition — per completed meal
    (log.meals_logged || []).forEach((m) => {
      if (m.completed) xp.nutrition += 10;
    });

    // Hydration — meeting daily water goal
    if ((log.water_ml || 0) >= 2000) {
      xp.hydration += 10;
    }

    // Recovery — sleep
    if ((log.sleep_hours || 0) >= 7) {
      xp.recovery += 15;
    }
  });

  return xp;
}

/**
 * Get tier index (0-3) for a category XP value.
 * Returns -1 if below Bronze threshold.
 */
export function getCategoryTier(categoryXp) {
  for (let i = CATEGORY_THRESHOLDS.length - 1; i >= 0; i--) {
    if (categoryXp >= CATEGORY_THRESHOLDS[i]) return i;
  }
  return -1;
}

/**
 * Get progress (0-100) towards next tier for a category.
 */
export function getCategoryProgress(categoryXp) {
  const tier = getCategoryTier(categoryXp);
  if (tier >= CATEGORY_THRESHOLDS.length - 1) return 100;

  const currentThreshold = tier >= 0 ? CATEGORY_THRESHOLDS[tier] : 0;
  const nextThreshold = CATEGORY_THRESHOLDS[tier + 1];
  return Math.min(100, ((categoryXp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
}

/**
 * Parse a category badge ID back to { category, tier }.
 * Returns null if it doesn't match the pattern.
 */
export function parseCategoryBadgeId(badgeId) {
  const match = badgeId?.match(/^cat_(.+)_t(\d)$/);
  if (!match) return null;
  return { category: match[1], tier: parseInt(match[2]) };
}

/**
 * Look up a badge by its ID, handling both regular and category badges.
 * Returns badge definition or null.
 */
export function getBadgeById(badgeId) {
  const parsed = parseCategoryBadgeId(badgeId);
  if (parsed) return getCategoryBadge(parsed.category, parsed.tier);
  return null;
}

/**
 * Generate badge ID for a category at a given tier.
 */
export function getCategoryBadgeId(category, tier) {
  return `cat_${category}_t${tier}`;
}

/**
 * Get badge definition for a category tier.
 */
export function getCategoryBadge(category, tier) {
  if (tier < 0 || tier >= TIER_LABELS.length) return null;
  const cat = CATEGORIES[category];
  const id = getCategoryBadgeId(category, tier);
  const tierLabel = TIER_LABELS[tier];
  return {
    id,
    name: `${cat.label} ${tierLabel}`,
    icon: TIER_ICONS[tier],
    desc: `Earn ${CATEGORY_THRESHOLDS[tier]} XP in ${cat.label}`,
    category,
    tier,
    threshold: CATEGORY_THRESHOLDS[tier],
    pillar: category,
  };
}

/**
 * Check all category badges against computed XP.
 * Returns array of newly-earned category badge IDs.
 */
export function checkCategoryBadges(categoryXp, earnedBadges = []) {
  const newlyEarned = [];
  const earned = new Set(earnedBadges);

  Object.keys(CATEGORIES).forEach((cat) => {
    const xp = categoryXp[cat] || 0;
    const tier = getCategoryTier(xp);
    for (let t = 0; t <= tier; t++) {
      const badgeId = getCategoryBadgeId(cat, t);
      if (!earned.has(badgeId)) {
        newlyEarned.push(badgeId);
      }
    }
  });

  return newlyEarned;
}