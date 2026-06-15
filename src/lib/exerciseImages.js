// Exercise images mapped by name — Unsplash URLs for soccer + fitness
const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=400&h=300&fit=crop`;

export const DRILL_IMAGES = {
  // ── Technical ──
  "Wall Passes": IMG("1579952363873-27f5b3e90a55"),
  "Cone Dribbling": IMG("1517927033932-b3a7cb3e77e0"),
  "Juggling Challenge": IMG("1570498838593-aee4e6fbe3f1"),
  "First Touch Drill": IMG("1560012053519-ccc46b9c6d03"),
  "Skill Moves Combo": IMG("1543326722-3c8da9c9d2bd"),
  "Weak Foot Training": IMG("1431321215622-7a8b24c1c0cb"),
  "Under Pressure": IMG("1574629810360-8efd4f6d4a8d"),
  "Advanced Finishing": IMG("1548112333-21ad38fb4bb2"),
  "Combination Play": IMG("1560089000-1b5a7e8c5ea6"),
  "Match Simulation": IMG("1540747913346-99e43b8fe85d"),
  "Creative Play": IMG("1600675172486-2eb3e2b6e4be"),
  "Position-Specific Mastery": IMG("1540747913346-99e43b8fe85d"),

  // ── Physical ──
  "Agility Ladder": IMG("1526506112240-31c2c10e27e1"),
  "Sprint Intervals": IMG("1552679976-9ca5a2e9c6a2"),
  "Core Circuit": IMG("1571019613454-1cb2f99b2d8b"),
  "HIIT Pitch Workout": IMG("1517836357463-d25dfeac3438"),
  "Speed & Agility": IMG("1461896836934-bd45f8e97dd7"),
  "Strength Circuit": IMG("1534438327276-14e5300c3a48"),
  "Power Training": IMG("1517963878392-8e0cfb2e5e68"),
  "Endurance Run": IMG("1552679976-9ca5a2e9c6a2"),
  "SAQ Complex": IMG("1526506112240-31c2c10e27e1"),
  "Match Fitness Protocol": IMG("1540747913346-99e43b8fe85d"),
  "Explosive Power": IMG("1517836357463-d25dfeac3438"),
  "Recovery Session": IMG("1544367567-0f2fcb009e0b"),

  // ── Tactical ──
  "Position Awareness": IMG("1606103925003-0e0b7b2df3d8"),
  "Formation Basics": IMG("1606103925003-0e0b7b2df3d8"),
  "Video Analysis": IMG("1574717024658-5e2e6e89b5a0"),
  "Set Piece Practice": IMG("1543326722-3c8da9c9d2bd"),
  "Game Reading": IMG("1574717024658-5e2e6e89b5a0"),
  "Pressing Patterns": IMG("1540747913346-99e43b8fe85d"),
  "Counter-Attack Analysis": IMG("1606103925003-0e0b7b2df3d8"),
  "Leadership Play": IMG("1540747913346-99e43b8fe85d"),
};

export const RECOVERY_IMAGES = {
  // ── Stretching ──
  "Hamstring Stretch": IMG("1566241440091-ec10de8db2e4"),
  "Quad Stretch": IMG("1518611012118-6960775db32f"),
  "Hip Flexor Stretch": IMG("1544367567-0f2fcb009e0b"),
  "Groin Stretch": IMG("1562082697-6f7e5f5a3b87"),
  "Calf Stretch": IMG("1571019613454-1cb2f99b2d8b"),
  "Glute Stretch": IMG("1544367567-0f2fcb009e0b"),
  "Lower Back Stretch": IMG("1544367567-0f2fcb009e0b"),

  // ── Foam Rolling ──
  "Calf Roll": IMG("1544367567-0f2fcb009e0b"),
  "Quad Roll": IMG("1544367567-0f2fcb009e0b"),
  "IT Band Roll": IMG("1544367567-0f2fcb009e0b"),
  "Hamstring Roll": IMG("1544367567-0f2fcb009e0b"),
  "Upper Back Roll": IMG("1544367567-0f2fcb009e0b"),
  "Glute Roll": IMG("1544367567-0f2fcb009e0b"),

  // ── Active Recovery ──
  "Light Jog": IMG("1552679976-9ca5a2e9c6a2"),
  "Dynamic Mobility Flow": IMG("1518611012118-6960775db32f"),
  "Pool Session / Swimming": IMG("1560089000-1b5a7e8c5ea6"),
  "Cycling (low resistance)": IMG("1562180208-9a2b0e2a9ba7"),
  "Yoga for Athletes": IMG("1544367567-0f2fcb009e0b"),

  // ── Sleep ──
  "Consistent Sleep Schedule": IMG("1541781774459-f6a3e0b0e5c5"),
  "Screen-Free Wind Down": IMG("1541781774459-f6a3e0b0e5c5"),
  "Cool Dark Room": IMG("1541781774459-f6a3e0b0e5c5"),
  "No Caffeine After 2pm": IMG("1541781774459-f6a3e0b0e5c5"),
  "Pre-Sleep Breathing": IMG("1506126613408-ca1e4f0c2e6e"),

  // ── Contrast Therapy ──
  "Contrast Shower": IMG("1560089000-1b5a7e8c5ea6"),
  "Ice Bath (if available)": IMG("1560089000-1b5a7e8c5ea6"),
  "Warm Epsom Salt Bath": IMG("1544161515-4ab6fde5b5b6"),
  "Cold Water Immersion": IMG("1560089000-1b5a7e8c5ea6"),
};

// Category-level fallback images
export const CATEGORY_COVERS = {
  technical: IMG("1579952363873-27f5b3e90a55"),
  physical: IMG("1517836357463-d25dfeac3438"),
  tactical: IMG("1606103925003-0e0b7b2df3d8"),
  stretching: IMG("1566241440091-ec10de8db2e4"),
  foam_rolling: IMG("1544367567-0f2fcb009e0b"),
  active_recovery: IMG("1518611012118-6960775db32f"),
  sleep: IMG("1541781774459-f6a3e0b0e5c5"),
  contrast: IMG("1560089000-1b5a7e8c5ea6"),
};