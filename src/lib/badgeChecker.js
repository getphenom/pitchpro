import { BADGE_CRITERIA } from "@/lib/gameData";

/**
 * Check all badge criteria against the profile and daily logs.
 * Returns an array of newly-earned badge IDs (not yet in profile.badges).
 */
export function checkBadges(profile, dailyLogs = []) {
  if (!profile) return [];

  const earned = new Set(profile.badges || []);
  const newlyEarned = [];

  for (const [badgeId, checkFn] of Object.entries(BADGE_CRITERIA)) {
    if (earned.has(badgeId)) continue;
    try {
      if (checkFn(profile, dailyLogs)) {
        newlyEarned.push(badgeId);
      }
    } catch {
      // Silently skip criteria that fail (e.g. injury_free without context)
    }
  }

  return newlyEarned;
}