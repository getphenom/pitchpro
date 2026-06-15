import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, UtensilsCrossed, Sparkles, Clock, Flame, BookOpen, Droplets, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import MealDetailDialog from "@/components/nutrition/MealDetailDialog";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion } from "framer-motion";
import NutritionCoachChat from "@/components/agents/NutritionCoachChat";
import NutritionVsTraining from "@/components/nutrition/NutritionVsTraining";
import DailyMacroLogger from "@/components/nutrition/DailyMacroLogger";
import MacroChart from "@/components/nutrition/MacroChart";
import { MEAL_IMAGES } from "@/lib/exerciseImages";

// ─── Timing contexts with nutrition + hydration for each ───
const TIMING_CONTEXTS = {
  pre_training: {
    label: "Pre-Training",
    icon: "⚡",
    color: "border-yellow-500/20",
    bg: "from-yellow-500/10 to-transparent",
    desc: "30-90 min before training",
  },
  post_training: {
    label: "Post-Training",
    icon: "💪",
    color: "border-green-500/20",
    bg: "from-green-500/10 to-transparent",
    desc: "Within 2 hours after",
  },
  pre_game: {
    label: "Pre-Game",
    icon: "🏟️",
    color: "border-orange-500/20",
    bg: "from-orange-500/10 to-transparent",
    desc: "2-3 hours before kickoff",
  },
  post_game: {
    label: "Post-Game",
    icon: "🔄",
    color: "border-blue-500/20",
    bg: "from-blue-500/10 to-transparent",
    desc: "Recovery after match",
  },
  game_time: {
    label: "Game-Time",
    icon: "⚽",
    color: "border-red-500/20",
    bg: "from-red-500/10 to-transparent",
    desc: "During the match",
  },
};

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", icon: "🌅" },
  { key: "lunch", label: "Lunch", icon: "🥗" },
  { key: "dinner", label: "Dinner", icon: "🍽️" },
  { key: "snack", label: "Snack", icon: "🍌" },
];

// ─── Nutrition data: organized by timing → meal_type → meals ───
const NUTRITION_DATA = {
  pre_training: {
    breakfast: [
      { name: "Banana & Honey Toast", foods: ["Whole wheat toast", "Banana", "Honey"], calories: 220, xp: 10, duration: "5 min", tip: "Eat 30-45 min before", desc: "Fast-digesting carbs for immediate energy." },
      { name: "Oatmeal Power Bowl", foods: ["Rolled oats", "Mixed berries", "Cinnamon"], calories: 280, xp: 10, duration: "10 min", tip: "Eat 60-90 min before", desc: "Steady energy release for longer sessions." },
    ],
    lunch: [],
    dinner: [],
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
    breakfast: [
      { name: "Bagel with Peanut Butter", foods: ["Whole wheat bagel", "Peanut butter", "Banana"], calories: 420, xp: 12, duration: "5 min", tip: "Eat 2-3 hours before", desc: "Carb-loaded, moderate protein." },
    ],
    lunch: [
      { name: "Pasta with Light Sauce", foods: ["Whole wheat pasta", "Olive oil", "Parmesan", "Grilled chicken (small)"], calories: 500, xp: 15, duration: "25 min", tip: "Easy on the stomach", desc: "Carbs for energy, light protein." },
    ],
    dinner: [],
    snack: [
      { name: "Banana & Sports Drink", foods: ["Banana", "Sports drink"], calories: 150, xp: 8, duration: "1 min", tip: "30 min before warm-up", desc: "Quick carbs + electrolytes." },
    ],
  },
  post_game: {
    breakfast: [],
    lunch: [],
    dinner: [
      { name: "Pasta with Meat Sauce", foods: ["Whole wheat pasta", "Lean ground beef", "Tomato sauce", "Parmesan"], calories: 550, xp: 15, duration: "25 min", tip: "Carb reload for next day", desc: "Replenish glycogen stores." },
    ],
    snack: [
      { name: "Trail Mix Power Pack", foods: ["Almonds", "Walnuts", "Dried cranberries", "Dark chocolate"], calories: 200, xp: 8, duration: "2 min", tip: "Protein + healthy fats", desc: "Satisfying recovery snack." },
      { name: "Cheese & Crackers", foods: ["Whole grain crackers", "Cheddar", "Grapes"], calories: 250, xp: 8, duration: "1 min", tip: "Easy post-match refuel", desc: "Protein-rich and hydrating." },
    ],
  },
  game_time: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [
      { name: "Orange Slices", foods: ["Oranges"], calories: 60, xp: 5, duration: "Halftime", tip: "Classic halftime fuel", desc: "Hydration + quick sugar boost." },
      { name: "Energy Gel / Gummies", foods: ["Sports gel or gummies", "Water"], calories: 100, xp: 5, duration: "During match", tip: "With water only", desc: "Quick energy without stomach issues." },
    ],
  },
};

// ─── Hydration data: organized by timing ───
const HYDRATION_DATA = {
  pre_training: [
    { name: "Pre-Training Hydration", amount: "500ml (17oz)", timing: "2 hours before", desc: "Start hydrating early — don't wait until you're on the pitch. Water with optional lemon.", xp: 10, tip: "Urine should be pale yellow" },
    { name: "Electrolyte Prep", amount: "250ml (8oz)", timing: "30 min before", desc: "Sports drink or water with a pinch of salt if it's a hot day or intense session.", xp: 8, tip: "Especially important in heat" },
  ],
  post_training: [
    { name: "Post-Training Rehydration", amount: "750ml-1L (25-34oz)", timing: "Within 30 min", desc: "Replace 150% of fluid lost. Weigh yourself before/after — every 1kg lost = 1L to replace.", xp: 15, tip: "Add electrolytes for sessions over 60 min" },
    { name: "Recovery Smoothie", amount: "400ml (14oz)", timing: "Within 1 hour", desc: "Blend banana, milk, protein powder, and ice — hydration + recovery in one.", xp: 12, tip: "Protein + fluids = faster recovery" },
  ],
  pre_game: [
    { name: "Pre-Game Hydration", amount: "500-600ml (17-20oz)", timing: "2-3 hours before", desc: "Slow, steady drinking. Don't chug — sip over 30-60 minutes.", xp: 10, tip: "Stop 45 min before to avoid bathroom breaks" },
    { name: "Top-Up Before Warm-Up", amount: "200-300ml (7-10oz)", timing: "15 min before warm-up", desc: "Final top-up with water or sports drink.", xp: 8, tip: "Small sips only" },
  ],
  post_game: [
    { name: "Post-Match Rehydration", amount: "1-1.5L (34-50oz)", timing: "Immediately after", desc: "Replace fluids aggressively. Chocolate milk or recovery drink works great.", xp: 15, tip: "Weigh yourself to calculate exact needs" },
    { name: "Continued Hydration", amount: "500ml (17oz)", timing: "Every hour for 3 hours", desc: "Keep drinking even after the initial rehydration. Your body keeps losing fluid.", xp: 10, tip: "Electrolyte drinks better than plain water now" },
  ],
  game_time: [
    { name: "During Match Hydration", amount: "150-250ml (5-8oz)", timing: "Every 15-20 min", desc: "Small amounts frequently. Don't wait until you're thirsty — that's already too late.", xp: 10, tip: "Use halftime to drink 250-400ml" },
    { name: "Hot Weather Protocol", amount: "200-300ml (7-10oz)", timing: "Every 10-15 min", desc: "Increase frequency in heat. Add electrolytes if sweating heavily.", xp: 10, tip: "Cold fluids absorb faster" },
  ],
};

// ─── Components ───
function NutritionCard({ meal, index, onSelect }) {
  const img = MEAL_IMAGES[meal.name];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onSelect(meal)}
      className="rounded-xl bg-card border border-border overflow-hidden cursor-pointer hover:border-primary/30 transition-all group"
    >
      {img && (
        <div className="h-28 overflow-hidden">
          <img src={img} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className={`flex items-start gap-3 ${img ? 'p-3' : 'p-3.5'}`}>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Apple className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{meal.name}</h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-3 h-3" /> {meal.duration}</span>
              <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5"><Flame className="w-3 h-3" /> {meal.xp}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{meal.desc}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {meal.foods?.map((food, j) => (
              <span key={j} className="text-[10px] bg-secondary/60 px-2 py-0.5 rounded-md">{food}</span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-primary font-medium">{meal.calories} kcal</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <BookOpen className="w-3 h-3" /> Details
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HydrationCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl bg-card border border-cyan-500/15 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
          <Droplets className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{item.name}</h4>
            <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5 flex-shrink-0">
              <Flame className="w-3 h-3" /> {item.xp}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-md font-medium">{item.amount}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {item.timing}
            </span>
          </div>
          {item.tip && (
            <p className="text-[10px] text-muted-foreground mt-1.5 italic">💡 {item.tip}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Nutrition() {
  const [pillar, setPillar] = useState("nutrition"); // "nutrition" | "hydration"
  const [timing, setTiming] = useState("pre_training");
  const [mealType, setMealType] = useState("breakfast");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);
  const [showAIPlan, setShowAIPlan] = useState(false);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const generateMealPlan = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a daily meal plan for a ${profile.age}-year-old soccer player (${POSITION_LABELS[profile.position]}). Weight: ${profile.weight_kg || "?"}kg, Height: ${profile.height_cm || "?"}cm. Training ${profile.weekly_training_days || 5} days/week. Provide pre-training, post-training, pre-game, post-game, and game-time nutrition + hydration for each meal type.`,
      response_json_schema: {
        type: "object",
        properties: {
          daily_calories: { type: "number" },
          macros: { type: "object", properties: { protein_g: { type: "number" }, carbs_g: { type: "number" }, fat_g: { type: "number" } } },
          training_day: { type: "object", properties: { meals: { type: "array", items: { type: "object", properties: { name: { type: "string" }, time: { type: "string" }, foods: { type: "array", items: { type: "string" } }, calories: { type: "number" }, note: { type: "string" } } } } } },
          hydration: { type: "array", items: { type: "object", properties: { name: { type: "string" }, amount: { type: "string" }, timing: { type: "string" }, tip: { type: "string" } } } },
          tips: { type: "array", items: { type: "string" } },
        },
      },
    });
    setMealPlan(result);
    setLoading(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">Complete your profile first to unlock nutrition planning.</p>
      </div>
    </div>
  );

  // Get meals for current timing + meal type
  const currentNutritionMeals = NUTRITION_DATA[timing]?.[mealType] || [];
  const allNutritionMeals = Object.values(NUTRITION_DATA[timing] || {}).flat();
  const currentHydrationItems = HYDRATION_DATA[timing] || [];

  const timingKeys = Object.keys(TIMING_CONTEXTS);
  const timingCtx = TIMING_CONTEXTS[timing];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <MealDetailDialog
          open={!!selectedMeal}
          onClose={() => setSelectedMeal(null)}
          meal={selectedMeal}
          profile={profile}
          allMeals={allNutritionMeals}
          onSwap={(alt) => setSelectedMeal(alt)}
        />

        <div>
          <h1 className="text-2xl font-heading font-bold">Fuel</h1>
          <p className="text-xs text-muted-foreground mt-1">Eat & drink for peak performance</p>
        </div>

        {showAIPlan && mealPlan ? (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setShowAIPlan(false)} className="text-xs">← Back</Button>
            <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/20 p-5">
              <h3 className="font-heading font-bold text-sm">Daily Target</h3>
              <p className="text-2xl font-heading font-bold text-primary mt-1">{mealPlan.daily_calories} kcal</p>
              <div className="flex gap-4 mt-3">
                <div><p className="text-xs text-muted-foreground">Protein</p><p className="text-sm font-semibold">{mealPlan.macros?.protein_g}g</p></div>
                <div><p className="text-xs text-muted-foreground">Carbs</p><p className="text-sm font-semibold">{mealPlan.macros?.carbs_g}g</p></div>
                <div><p className="text-xs text-muted-foreground">Fat</p><p className="text-sm font-semibold">{mealPlan.macros?.fat_g}g</p></div>
              </div>
            </div>
            <div className="space-y-3">
              {mealPlan.training_day?.meals?.map((meal, i) => (
                <div key={i} onClick={() => setSelectedMeal(meal)} className="rounded-xl bg-card border border-border p-4 cursor-pointer hover:border-primary/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{meal.name}</h4>
                    <span className="text-xs text-muted-foreground">{meal.time}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">{meal.foods?.map((f, j) => <span key={j} className="text-xs bg-secondary px-2 py-1 rounded-lg">{f}</span>)}</div>
                  <p className="text-xs text-primary font-medium">{meal.calories} kcal</p>
                </div>
              ))}
            </div>
            {mealPlan.hydration?.length > 0 && (
              <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/20 p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-1.5"><Droplets className="w-4 h-4 text-cyan-400" /> Hydration Plan</h4>
                {mealPlan.hydration.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-xs font-medium flex-1">{h.name}</span>
                    <span className="text-[10px] text-muted-foreground">{h.amount}</span>
                    <span className="text-[10px] text-muted-foreground">{h.timing}</span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={generateMealPlan}><Sparkles className="w-4 h-4 mr-2" /> Regenerate</Button>
          </div>
        ) : (
          <>
            {/* Pillar toggle: Nutrition | Hydration */}
            <div className="flex rounded-xl bg-secondary p-1">
              <button
                onClick={() => setPillar("nutrition")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pillar === "nutrition" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Apple className="w-4 h-4" /> Nutrition
              </button>
              <button
                onClick={() => setPillar("hydration")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pillar === "hydration" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Droplets className="w-4 h-4" /> Hydration
              </button>
            </div>

            {/* Timing tabs */}
            <div className="flex flex-wrap gap-1.5">
              {timingKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setTiming(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    timing === key
                      ? `${TIMING_CONTEXTS[key].color} bg-gradient-to-br ${TIMING_CONTEXTS[key].bg} text-foreground`
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <span>{TIMING_CONTEXTS[key].icon}</span> {TIMING_CONTEXTS[key].label}
                </button>
              ))}
            </div>

            {/* Timing context description */}
            <div className={`rounded-xl border bg-gradient-to-br p-3 ${timingCtx.color} ${timingCtx.bg}`}>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <span>{timingCtx.icon}</span> {timingCtx.label}
                <span className="text-xs font-normal text-muted-foreground">— {timingCtx.desc}</span>
              </p>
            </div>

            {pillar === "nutrition" ? (
              <>
                {/* Meal type tabs */}
                <div className="flex gap-2">
                  {MEAL_TYPES.map((mt) => {
                    const count = NUTRITION_DATA[timing]?.[mt.key]?.length || 0;
                    return (
                      <button
                        key={mt.key}
                        onClick={() => setMealType(mt.key)}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-medium transition-all border ${
                          mealType === mt.key
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        <span className="text-base">{mt.icon}</span>
                        <span>{mt.label}</span>
                        <span className={`text-[10px] ${mealType === mt.key ? "text-primary" : "text-muted-foreground"}`}>
                          {count > 0 ? `${count} items` : "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Meal cards */}
                {currentNutritionMeals.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <Apple className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                    <p className="text-sm text-muted-foreground">No {MEAL_TYPES.find(m => m.key === mealType)?.label} meals for {TIMING_CONTEXTS[timing].label}</p>
                    <p className="text-xs text-muted-foreground">Try a different meal type or timing</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentNutritionMeals.map((meal, i) => (
                      <NutritionCard key={i} meal={meal} index={i} onSelect={(m) => setSelectedMeal(m)} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Hydration cards */
              currentHydrationItems.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Droplets className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                  <p className="text-sm text-muted-foreground">No hydration items for {TIMING_CONTEXTS[timing].label}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentHydrationItems.map((item, i) => (
                    <HydrationCard key={i} item={item} index={i} />
                  ))}
                </div>
              )
            )}

            {/* AI Plan button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={async () => { setShowAIPlan(true); if (!mealPlan) await generateMealPlan(); }}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Meal Plan
            </Button>
          </>
        )}

        {/* Daily Macro Logger */}
        <DailyMacroLogger profile={profile} />

        {/* Macro Intake Chart */}
        <MacroChart profile={profile} />

        {/* Nutrition vs Training Comparison */}
        <NutritionVsTraining profile={profile} />

        {/* Nutrition Coach Agent */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-card border border-green-500/20 p-5">
          <NutritionCoachChat profile={profile} />
        </motion.div>
      </div>
    </div>
  );
}