// Recovery exercise library data — used by Fuel hub and Recovery page

export const RECOVERY_TYPES = {
  stretching: { label: "Stretching", icon: "🧘" },
  foam_rolling: { label: "Foam Rolling", icon: "🫧" },
  active_recovery: { label: "Active Recovery", icon: "🏃" },
  sleep: { label: "Sleep", icon: "😴" },
  contrast: { label: "Contrast", icon: "🌡️" },
};

export const RECOVERY_EXERCISES = {
  stretching: [
    { name: "Hamstring Stretch", duration: "30s each leg", target: "Hamstrings", xp: 5 },
    { name: "Quad Stretch", duration: "30s each leg", target: "Quads", xp: 5 },
    { name: "Hip Flexor Stretch", duration: "45s each leg", target: "Hip flexors", xp: 5 },
    { name: "Groin Stretch", duration: "30s", target: "Adductors", xp: 5 },
    { name: "Calf Stretch", duration: "30s each leg", target: "Calves", xp: 5 },
    { name: "Glute Stretch", duration: "30s each side", target: "Glutes", xp: 5 },
    { name: "Lower Back Stretch", duration: "30s", target: "Lower back", xp: 5 },
  ],
  foam_rolling: [
    { name: "Calf Roll", duration: "60s each leg", target: "Calves", xp: 8 },
    { name: "Quad Roll", duration: "60s each leg", target: "Quads", xp: 8 },
    { name: "IT Band Roll", duration: "45s each leg", target: "IT band", xp: 8 },
    { name: "Hamstring Roll", duration: "60s each leg", target: "Hamstrings", xp: 8 },
    { name: "Upper Back Roll", duration: "60s", target: "Thoracic spine", xp: 8 },
    { name: "Glute Roll", duration: "45s each side", target: "Glutes", xp: 8 },
  ],
  active_recovery: [
    { name: "Light Jog", duration: "10-15 min", target: "Full body", xp: 15 },
    { name: "Dynamic Mobility Flow", duration: "10 min", target: "Full body", xp: 15 },
    { name: "Pool Session / Swimming", duration: "20 min", target: "Full body", xp: 20 },
    { name: "Cycling (low resistance)", duration: "15-20 min", target: "Legs", xp: 15 },
    { name: "Yoga for Athletes", duration: "15-20 min", target: "Full body", xp: 20 },
  ],
  sleep: [
    { name: "Consistent Sleep Schedule", duration: "Same time daily", target: "Circadian rhythm", xp: 10 },
    { name: "Screen-Free Wind Down", duration: "30 min before bed", target: "Melatonin", xp: 10 },
    { name: "Cool Dark Room", duration: "All night", target: "Deep sleep", xp: 10 },
    { name: "No Caffeine After 2pm", duration: "All day", target: "Sleep quality", xp: 10 },
    { name: "Pre-Sleep Breathing", duration: "5 min", target: "Nervous system", xp: 10 },
  ],
  contrast: [
    { name: "Contrast Shower", duration: "3x (1min hot / 30s cold)", target: "Circulation", xp: 15 },
    { name: "Ice Bath (if available)", duration: "10-15 min", target: "Inflammation", xp: 20 },
    { name: "Warm Epsom Salt Bath", duration: "15-20 min", target: "Muscle relaxation", xp: 15 },
    { name: "Cold Water Immersion", duration: "5-10 min", target: "Recovery", xp: 15 },
  ],
};