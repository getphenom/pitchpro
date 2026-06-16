import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, Clock, Flame, Apple, Droplets, Moon, Heart, Bandage, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { MEAL_IMAGES } from "@/lib/exerciseImages";
import MealDetailDialog from "@/components/nutrition/MealDetailDialog";
import NutritionCoachChat from "@/components/agents/NutritionCoachChat";
import DailyMacroLogger from "@/components/nutrition/DailyMacroLogger";
import MacroChart from "@/components/nutrition/MacroChart";
import NutritionVsTraining from "@/components/nutrition/NutritionVsTraining";
import WaterTracker from "@/components/shared/WaterTracker";
import { RECOVERY_TYPES, RECOVERY_EXERCISES } from "@/lib/recoveryData";
import RecoveryDetailDialog from "@/components/recovery/RecoveryDetailDialog";
import PainPatternAlert from "@/components/injury/PainPatternAlert";

// ─── Nutrition data ───
const TIMING_CONTEXTS = {
  pre_training: { label: "Pre-Training", icon: "⚡", color: "border-yellow-500/20", bg: "from-yellow-500/10 to-transparent", desc: "30-90 min before training" },
  post_training: { label: "Post-Training", icon: "💪", color: "border-green-500/20", bg: "from-green-500/10 to-transparent", desc: "Within 2 hours after" },
  pre_game: { label: "Pre-Game", icon: "🏟️", color: "border-orange-500/20", bg: "from-orange-500/10 to-transparent", desc: "2-3 hours before kickoff" },
  post_game: { label: "Post-Game", icon: "🔄", color: "border-blue-500/20", bg: "from-blue-500/10 to-transparent", desc: "Recovery after match" },
  game_time: { label: "Game-Time", icon: "⚽", color: "border-red-500/20", bg: "from-red-500/10 to-transparent", desc: "During the match" },
};

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", icon: "🌅" },
  { key: "lunch", label: "Lunch", icon: "🥗" },
  { key: "dinner", label: "Dinner", icon: "🍽️" },
  { key: "snack", label: "Snack", icon: "🍌" },
];

const NUTRITION_DATA = {
  pre_training: {
    breakfast: [
      { name: "Banana & Honey Toast", foods: ["Whole wheat toast", "Banana", "Honey"], calories: 220, xp: 10, duration: "5 min", tip: "Eat 30-45 min before", desc: "Fast-digesting carbs for immediate energy." },
      { name: "Oatmeal Power Bowl", foods: ["Rolled oats", "Mixed berries", "Cinnamon"], calories: 280, xp: 10, duration: "10 min", tip: "Eat 60-90 min before", desc: "Steady energy release for longer sessions." },
    ],
    lunch: [], dinner: [],
    snack: [
      { name: "Rice Cakes & Nut Butter", foods: ["Rice cakes", "Almond butter", "Strawberries"], calories: 190, xp: 10, duration: "3 min", tip: "Great last-minute option", desc: "Light, easy to digest pre-training fuel." },
      { name: "Energy Bar", foods: ["Oats", "Dates", "Honey", "Nuts"], calories: 210, xp: 8, duration: "1 min", tip: "No prep, grab and go", desc: "Homemade or quality store-bought bar." },
    ],
  },
  post_training: {
    breakfast: [
      { name: "Scrambled Eggs & Toast", foods: ["3 eggs", "Whole wheat toast", "Orange", "Butter"], calories: 380, xp: 15, duration: "10 min", tip: "Protein within 30 min", desc: "Eggs + carbs to kickstart muscle repair." },
    ],
    lunch: [
      { name: "Chicken & Rice Bowl", foods: ["Grilled chicken", "Brown rice", "Broccoli", "Olive oil"], calories: 450, xp: 15, duration: "20 min", tip: "Eat within 1-2 hours", desc: "Lean protein + complex carbs for recovery." },
      { name: "Turkey & Cheese Sandwich", foods: ["Turkey", "Swiss cheese", "Whole grain bread", "Lettuce"], calories: 420, xp: 12, duration: "5 min", tip: "Pack the night before", desc: "Balanced, portable, and satisfying." },
    ],
    dinner: [
      { name: "Salmon & Sweet Potato", foods: ["Salmon fillet", "Sweet potato", "Asparagus", "Olive oil"], calories: 520, xp: 15, duration: "30 min", tip: "Omega-3s reduce soreness", desc: "Anti-inflammatory recovery dinner." },
      { name: "Stir-Fry Chicken & Veggies", foods: ["Chicken breast", "Bell peppers", "Broccoli", "Brown rice"], calories: 480, xp: 15, duration: "20 min", tip: "Prep veggies ahead", desc: "Colorful, balanced, fast." },
    ],
    snack: [
      { name: "Chocolate Milk Recovery", foods: ["Chocolate milk (or plant-based)", "Pinch of salt"], calories: 180, xp: 10, duration: "2 min", tip: "Drink within 30 min", desc: "Perfect carb-to-protein ratio." },
      { name: "Egg & Avocado Wrap", foods: ["2 eggs", "Whole wheat tortilla", "Avocado", "Spinach"], calories: 380, xp: 12, duration: "10 min", tip: "Add hot sauce for flavor", desc: "Protein-packed with healthy fats." },
    ],
  },
  pre_game: {
    breakfast: [{ name: "Bagel with Peanut Butter", foods: ["Whole wheat bagel", "Peanut butter", "Banana"], calories: 420, xp: 12, duration: "5 min", tip: "Eat 2-3 hours before", desc: "Carb-loaded, moderate protein." }],
    lunch: [{ name: "Pasta with Light Sauce", foods: ["Whole wheat pasta", "Olive oil", "Parmesan", "Grilled chicken (small)"], calories: 500, xp: 15, duration: "25 min", tip: "Easy on the stomach", desc: "Carbs for energy, light protein." }],
    dinner: [],
    snack: [{ name: "Banana & Sports Drink", foods: ["Banana", "Sports drink"], calories: 150, xp: 8, duration: "1 min", tip: "30 min before warm-up", desc: "Quick carbs + electrolytes." }],
  },
  post_game: {
    breakfast: [], lunch: [],
    dinner: [{ name: "Pasta with Meat Sauce", foods: ["Whole wheat pasta", "Lean ground beef", "Tomato sauce", "Parmesan"], calories: 550, xp: 15, duration: "25 min", tip: "Carb reload for next day", desc: "Replenish glycogen stores." }],
    snack: [
      { name: "Trail Mix Power Pack", foods: ["Almonds", "Walnuts", "Dried cranberries", "Dark chocolate"], calories: 200, xp: 8, duration: "2 min", tip: "Protein + healthy fats", desc: "Satisfying recovery snack." },
      { name: "Cheese & Crackers", foods: ["Whole grain crackers", "Cheddar", "Grapes"], calories: 250, xp: 8, duration: "1 min", tip: "Easy post-match refuel", desc: "Protein-rich and hydrating." },
    ],
  },
  game_time: {
    breakfast: [], lunch: [], dinner: [],
    snack: [
      { name: "Orange Slices", foods: ["Oranges"], calories: 60, xp: 5, duration: "Halftime", tip: "Classic halftime fuel", desc: "Hydration + quick sugar boost." },
      { name: "Energy Gel / Gummies", foods: ["Sports gel or gummies", "Water"], calories: 100, xp: 5, duration: "During match", tip: "With water only", desc: "Quick energy without stomach issues." },
    ],
  },
};

const HYD_DATA = {
  pre_training: [
    { name: "Pre-Training Hydration", amount: "500ml (17oz)", timing: "2 hours before", desc: "Start hydrating early — don't wait until you're on the pitch.", xp: 10, tip: "Urine should be pale yellow" },
    { name: "Electrolyte Prep", amount: "250ml (8oz)", timing: "30 min before", desc: "Sports drink or water with a pinch of salt if it's a hot day.", xp: 8, tip: "Especially important in heat" },
  ],
  post_training: [
    { name: "Post-Training Rehydration", amount: "750ml-1L", timing: "Within 30 min", desc: "Replace 150% of fluid lost.", xp: 15, tip: "Add electrolytes for sessions over 60 min" },
    { name: "Recovery Smoothie", amount: "400ml (14oz)", timing: "Within 1 hour", desc: "Banana, milk, protein powder, ice.", xp: 12, tip: "Protein + fluids = faster recovery" },
  ],
};

function NutritionCard({ meal, index, onSelect }) {
  const img = MEAL_IMAGES[meal.name];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      onClick={() => onSelect(meal)}
      className="rounded-xl bg-[#141419] border border-white/[0.08] overflow-hidden cursor-pointer hover:border-[#FFA23D]/30 transition-all group"
    >
      {img && <div className="h-28 overflow-hidden"><img src={img} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>}
      <div className="p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-[#F4F5F2]">{meal.name}</h4>
          <span className="text-[10px] text-[#FFA23D] font-semibold flex items-center gap-0.5"><Flame className="w-3 h-3" /> {meal.xp}</span>
        </div>
        <p className="text-xs text-[#8A8C92]">{meal.desc}</p>
        <div className="flex flex-wrap gap-1">
          {meal.foods?.map((f, j) => <span key={j} className="text-[10px] bg-white/[0.06] px-2 py-0.5 rounded-md text-[#8A8C92]">{f}</span>)}
        </div>
        <p className="text-[10px] text-[#FFA23D] font-medium">{meal.calories} kcal</p>
      </div>
    </motion.div>
  );
}

const FUEL_TABS = [
  { key: "nutrition", label: "Nutrition", icon: Apple },
  { key: "hydration", label: "Hydration", icon: Droplets },
  { key: "sleep", label: "Sleep", icon: Moon },
  { key: "recovery", label: "Recovery", icon: Heart },
  { key: "injury", label: "Injury", icon: Bandage },
];

export default function Fuel() {
  const [tab, setTab] = useState("nutrition");
  const [timing, setTiming] = useState("pre_training");
  const [mealType, setMealType] = useState("breakfast");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedRecovery, setSelectedRecovery] = useState(null);
  const [recoveryType, setRecoveryType] = useState("stretching");
  const navigate = useNavigate();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });
  const profile = profiles?.[0];

  const { data: logs } = useQuery({
    queryKey: ["daily-log-fuel"],
    queryFn: () => base44.entities.DailyLog.filter({ date: new Date().toISOString().slice(0, 10) }),
    enabled: !!profile,
  });
  const dailyLog = logs?.[0];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#FFA23D]" /></div>;
  if (!profile) return null;

  const currentMeals = NUTRITION_DATA[timing]?.[mealType] || [];
  const allMeals = Object.values(NUTRITION_DATA[timing] || {}).flat();
  const recovExercises = RECOVERY_EXERCISES[recoveryType] || [];

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <MealDetailDialog open={!!selectedMeal} onClose={() => setSelectedMeal(null)} meal={selectedMeal} profile={profile} allMeals={allMeals} onSwap={(alt) => setSelectedMeal(alt)} />
      <RecoveryDetailDialog open={!!selectedRecovery} onClose={() => setSelectedRecovery(null)} exercise={selectedRecovery} profile={profile} allExercises={Object.values(RECOVERY_EXERCISES).flat()} onSwap={(alt) => setSelectedRecovery(alt)} />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div>
          <p className="font-heading font-semibold tracking-[0.22em] text-[10px] uppercase text-[#FFA23D]">Fuel & Recovery</p>
          <h1 className="text-2xl font-heading font-extrabold mt-0.5">Fuel</h1>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {FUEL_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border
                ${tab === t.key
                  ? "bg-[#F4F5F2] text-[#0A0A0C] border-[#F4F5F2]"
                  : "bg-[#141419] border-white/[0.08] text-[#8A8C92] hover:text-[#F4F5F2]"}`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Nutrition */}
        {tab === "nutrition" && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(TIMING_CONTEXTS).map((key) => (
                <button key={key} onClick={() => setTiming(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                    ${timing === key ? `${TIMING_CONTEXTS[key].color} bg-gradient-to-br ${TIMING_CONTEXTS[key].bg} text-[#F4F5F2]` : "border-transparent text-[#8A8C92] hover:text-[#F4F5F2] hover:bg-white/[0.05]"}`}>
                  <span>{TIMING_CONTEXTS[key].icon}</span> {TIMING_CONTEXTS[key].label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {MEAL_TYPES.map((mt) => {
                const count = NUTRITION_DATA[timing]?.[mt.key]?.length || 0;
                return (
                  <button key={mt.key} onClick={() => setMealType(mt.key)}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-medium transition-all border
                      ${mealType === mt.key ? "bg-[#FFA23D]/10 border-[#FFA23D]/30 text-[#FFA23D]" : "border-transparent text-[#8A8C92] hover:text-[#F4F5F2] hover:bg-white/[0.05]"}`}>
                    <span className="text-base">{mt.icon}</span><span>{mt.label}</span>
                  </button>
                );
              })}
            </div>
            {currentMeals.length === 0 ? (
              <div className="text-center py-10"><Apple className="w-10 h-10 text-[#8A8C92]/20 mx-auto" /><p className="text-sm text-[#8A8C92] mt-2">No meals for this timing</p></div>
            ) : (
              <div className="space-y-2">
                {currentMeals.map((meal, i) => <NutritionCard key={i} meal={meal} index={i} onSelect={setSelectedMeal} />)}
              </div>
            )}
            <DailyMacroLogger profile={profile} />
            <MacroChart profile={profile} />
            <NutritionVsTraining profile={profile} />
            <NutritionCoachChat profile={profile} />
          </>
        )}

        {/* Hydration */}
        {tab === "hydration" && (
          <div className="space-y-4">
            <WaterTracker currentMl={dailyLog?.water_ml || 0} age={profile.age} weight={profile.weight_kg} onUpdate={async () => {}} simple />
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(HYD_DATA).map((key) => (
                <button key={key} onClick={() => setTiming(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                    ${timing === key ? `border-cyan-500/20 bg-cyan-500/10 text-cyan-400` : "border-transparent text-[#8A8C92] hover:text-[#F4F5F2] hover:bg-white/[0.05]"}`}>
                  <span>{TIMING_CONTEXTS[key]?.icon}</span> {TIMING_CONTEXTS[key]?.label}
                </button>
              ))}
            </div>
            {(HYD_DATA[timing] || []).map((item, i) => (
              <div key={i} className="rounded-xl bg-[#141419] border border-cyan-500/15 p-4">
                <h4 className="font-semibold text-sm">{item.name}</h4>
                <p className="text-xs text-[#8A8C92] mt-0.5">{item.desc}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-md font-medium">{item.amount}</span>
                  <span className="text-[10px] text-[#8A8C92] flex items-center gap-1"><Clock className="w-3 h-3" /> {item.timing}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sleep */}
        {tab === "sleep" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#141419] border border-white/[0.08] p-5 text-center">
              <Moon className="w-10 h-10 text-violet-400 mx-auto mb-3" />
              <p className="font-heading font-extrabold text-3xl text-violet-400">{dailyLog?.sleep_hours || "—"}h</p>
              <p className="text-xs text-[#8A8C92] mt-1">Last night's sleep</p>
              <p className="text-[10px] text-[#8A8C92] mt-3">
                Target for age {profile.age}: {profile.age < 13 ? "9–11" : "8–10"} hours
              </p>
            </div>
            <div className="rounded-xl bg-[#141419] border border-white/[0.08] p-4">
              <h4 className="font-semibold text-sm mb-3">Sleep tips for athletes</h4>
              <div className="space-y-2">
                {["Consistent bedtime — same time every night", "No screens 30–60 min before bed", "Keep your room cool, dark, and quiet", "Avoid caffeine after 2pm", "Light stretching before bed can help"].map((tip, i) => (
                  <p key={i} className="text-xs text-[#8A8C92] flex gap-2"><span className="text-violet-400 font-bold">{i + 1}.</span> {tip}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recovery */}
        {tab === "recovery" && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
              {Object.keys(RECOVERY_EXERCISES).map((key) => (
                <button key={key} onClick={() => setRecoveryType(key)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border
                    ${recoveryType === key ? "bg-[#F4F5F2] text-[#0A0A0C] border-[#F4F5F2]" : "bg-[#141419] border-white/[0.08] text-[#8A8C92] hover:text-[#F4F5F2]"}`}>
                  {RECOVERY_TYPES[key]?.icon} {RECOVERY_TYPES[key]?.label}
                </button>
              ))}
            </div>
            {recovExercises.map((ex, i) => (
              <div key={i} onClick={() => setSelectedRecovery(ex)} className="rounded-xl bg-[#141419] border border-white/[0.08] p-4 cursor-pointer hover:border-[#45E0C0]/30 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{ex.name}</h4>
                  <span className="text-[10px] text-[#45E0C0] font-semibold">+{ex.xp}</span>
                </div>
                <p className="text-xs text-[#8A8C92] mt-1">{ex.duration} · {ex.target}</p>
              </div>
            ))}
          </div>
        )}

        {/* Injury */}
        {tab === "injury" && (
          <div className="space-y-4">
            <PainPatternAlert profile={profile} />
            <div className="rounded-xl bg-[#141419] border border-white/[0.08] p-4">
              <p className="font-semibold text-sm">Injury Log</p>
              <p className="text-xs text-[#8A8C92] mt-1">Track pain, strains, and recovery progress.</p>
              <button onClick={() => navigate("/injury")} className="mt-3 flex items-center gap-1 text-xs text-[#45E0C0] hover:underline">
                View full injury log <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}