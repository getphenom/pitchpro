import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, UtensilsCrossed, Sparkles, Apple, Beef, Wheat, Fish, Salad, BookOpen, Clock, Flame, Zap, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MealDetailDialog from "@/components/nutrition/MealDetailDialog";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion } from "framer-motion";
import NutritionCoachChat from "@/components/agents/NutritionCoachChat";
import NutritionVsTraining from "@/components/nutrition/NutritionVsTraining";

const MEAL_CATEGORIES = {
  pre_training: {
    label: "Pre-Training",
    icon: "⚡",
    color: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20",
    desc: "Quick energy before you hit the pitch",
    meals: [
      { name: "Banana & Honey Toast", duration: "5 min prep", xp: 10, desc: "Whole wheat toast with sliced banana and a drizzle of honey — fast-digesting carbs for immediate energy.", foods: ["Whole wheat bread", "Banana", "Honey"], calories: 220, tip: "Eat 30-45 minutes before training" },
      { name: "Oatmeal Power Bowl", duration: "10 min prep", xp: 10, desc: "Rolled oats with berries and a dash of cinnamon — steady energy release for longer sessions.", foods: ["Rolled oats", "Mixed berries", "Cinnamon", "Milk or water"], calories: 280, tip: "Eat 60-90 minutes before a game" },
      { name: "Rice Cakes & Nut Butter", duration: "3 min prep", xp: 10, desc: "Light, easy to digest — perfect when you need fuel but don't want a heavy stomach.", foods: ["Rice cakes", "Almond butter", "Sliced strawberries"], calories: 190, tip: "Great last-minute pre-training option" },
    ],
  },
  post_training: {
    label: "Post-Training",
    icon: "💪",
    color: "from-green-500/20 to-green-600/5 border-green-500/20",
    desc: "Recovery meals to rebuild and refuel",
    meals: [
      { name: "Chocolate Milk Recovery", duration: "2 min prep", xp: 10, desc: "The classic athlete recovery drink — perfect carb-to-protein ratio for muscle repair.", foods: ["Chocolate milk (or plant-based)", "Pinch of salt"], calories: 180, tip: "Drink within 30 minutes post-training" },
      { name: "Chicken & Rice Bowl", duration: "20 min prep", xp: 15, desc: "Lean protein with complex carbs — the gold standard for post-training recovery.", foods: ["Grilled chicken breast", "Brown rice", "Steamed broccoli", "Olive oil"], calories: 450, tip: "Eat within 1-2 hours after training" },
      { name: "Egg & Avocado Wrap", duration: "10 min prep", xp: 15, desc: "Protein-packed wrap with healthy fats — quick, satisfying, and great for muscle repair.", foods: ["2 eggs", "Whole wheat tortilla", "Avocado", "Spinach"], calories: 380, tip: "Add hot sauce for extra flavor without extra calories" },
    ],
  },
  breakfast: {
    label: "Breakfast",
    icon: "🌅",
    color: "from-orange-500/20 to-orange-600/5 border-orange-500/20",
    desc: "Start strong every morning",
    meals: [
      { name: "Scrambled Eggs & Toast", duration: "10 min prep", xp: 10, desc: "3 scrambled eggs on whole wheat toast with a side of fruit — protein and carbs to kickstart your day.", foods: ["3 eggs", "Whole wheat toast", "Orange or apple", "Butter or olive oil"], calories: 380, tip: "Don't skip breakfast — your body has been fasting all night" },
      { name: "Greek Yogurt Parfait", duration: "5 min prep", xp: 10, desc: "Layered Greek yogurt with granola and fresh fruit — high protein, gut-friendly, and delicious.", foods: ["Greek yogurt", "Granola", "Mixed berries", "Honey drizzle"], calories: 310, tip: "Choose plain yogurt to avoid added sugars" },
      { name: "Smoothie Bowl", duration: "5 min prep", xp: 10, desc: "Blended frozen fruit with protein powder, topped with nuts and seeds — refreshing and nutrient-dense.", foods: ["Frozen banana", "Frozen berries", "Protein powder", "Almond milk", "Chia seeds"], calories: 340, tip: "Add a handful of spinach — you won't taste it but you'll get the nutrients" },
    ],
  },
  lunch: {
    label: "Lunch",
    icon: "🥗",
    color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    desc: "Midday fuel for afternoon training",
    meals: [
      { name: "Turkey & Cheese Sandwich", duration: "5 min prep", xp: 10, desc: "Lean turkey with cheese, lettuce, and tomato on whole grain bread — balanced and portable.", foods: ["Turkey slices", "Swiss cheese", "Whole grain bread", "Lettuce", "Tomato", "Mustard"], calories: 420, tip: "Pack it the night before for school or travel" },
      { name: "Pasta with Meat Sauce", duration: "25 min prep", xp: 15, desc: "Whole wheat pasta with lean ground beef tomato sauce — carb-loading made delicious.", foods: ["Whole wheat pasta", "Lean ground beef", "Tomato sauce", "Parmesan cheese"], calories: 550, tip: "Make extra for leftovers — it tastes even better the next day" },
    ],
  },
  dinner: {
    label: "Dinner",
    icon: "🍽️",
    color: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
    desc: "Evening nutrition for overnight recovery",
    meals: [
      { name: "Salmon & Sweet Potato", duration: "30 min prep", xp: 15, desc: "Omega-3 rich salmon with roasted sweet potato and asparagus — anti-inflammatory and recovery-boosting.", foods: ["Salmon fillet", "Sweet potato", "Asparagus", "Olive oil", "Lemon"], calories: 520, tip: "Salmon's omega-3s reduce muscle soreness — eat it 2-3 times per week" },
      { name: "Stir-Fry Chicken & Veggies", duration: "20 min prep", xp: 15, desc: "Quick chicken stir-fry with colorful vegetables and brown rice — balanced and fast.", foods: ["Chicken breast", "Bell peppers", "Broccoli", "Carrots", "Brown rice", "Soy sauce"], calories: 480, tip: "Prep your veggies ahead of time for a 10-minute cook" },
    ],
  },
  snacks: {
    label: "Snacks",
    icon: "🍌",
    color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
    desc: "Smart snacks between meals",
    meals: [
      { name: "Trail Mix Power Pack", duration: "2 min prep", xp: 5, desc: "Homemade mix of nuts, dried fruit, and dark chocolate chips — energy on the go.", foods: ["Almonds", "Walnuts", "Dried cranberries", "Dark chocolate chips", "Pumpkin seeds"], calories: 200, tip: "Portion into small bags so you don't overeat" },
      { name: "Apple & Peanut Butter", duration: "1 min prep", xp: 5, desc: "Sliced apple with natural peanut butter — the perfect balance of carbs, healthy fats, and protein.", foods: ["Apple", "Natural peanut butter"], calories: 220, tip: "This is the most popular pro athlete snack for a reason" },
      { name: "Cheese & Crackers", duration: "1 min prep", xp: 5, desc: "Whole grain crackers with cheddar cheese — satisfying and protein-rich.", foods: ["Whole grain crackers", "Cheddar cheese slices", "Grapes (optional)"], calories: 250, tip: "Add grapes for natural sweetness and extra hydration" },
    ],
  },
  hydration: {
    label: "Hydration",
    icon: "💧",
    color: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
    desc: "Stay hydrated for peak performance",
    meals: [
      { name: "Morning Hydration", duration: "2 min", xp: 10, desc: "Start your day with 500ml (17oz) of water before anything else — rehydrate after 8 hours of sleep.", foods: ["500ml water", "Optional: lemon slice"], calories: 0, tip: "Your urine should be pale yellow — dark yellow means you're dehydrated" },
      { name: "During Training", duration: "Ongoing", xp: 10, desc: "Drink 150-250ml every 15-20 minutes during exercise. Don't wait until you're thirsty.", foods: ["Water", "Optional: electrolyte drink for sessions over 60 min"], calories: 0, tip: "For sessions over 60 minutes, add electrolytes to replace what you lose in sweat" },
      { name: "Post-Training Rehydration", duration: "Post-session", xp: 10, desc: "Replace 150% of fluid lost during training — if you lost 1L, drink 1.5L over the next few hours.", foods: ["Water", "Pinch of salt", "Optional: sports drink"], calories: 0, tip: "Weigh yourself before and after training — every 1kg lost = 1L of fluid to replace" },
    ],
  },
};

function MealCard({ meal, index, onSelect, category }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect(meal)}
      className={`rounded-xl border bg-gradient-to-br p-4 cursor-pointer hover:scale-[1.01] transition-all group ${category.color}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{meal.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{meal.desc}</p>
          <span className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary transition-colors inline-flex items-center gap-0.5">
            <BookOpen className="w-3 h-3" /> Tap for recipe & tips
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {meal.duration}
          </div>
          <div className="flex items-center gap-1 text-xs text-accent font-semibold">
            <Flame className="w-3 h-3" />
            {meal.xp} XP
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-3">
        {meal.foods?.slice(0, 3).map((food, j) => (
          <span key={j} className="text-[10px] bg-secondary/60 px-2 py-0.5 rounded-md">{food}</span>
        ))}
        {meal.foods?.length > 3 && (
          <span className="text-[10px] text-muted-foreground">+{meal.foods.length - 3} more</span>
        )}
      </div>
    </motion.div>
  );
}

export default function Nutrition() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pre_training");
  const [showAIPlan, setShowAIPlan] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [currentMeals, setCurrentMeals] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("pre_training");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const generateMealPlan = async () => {
    setLoading(true);
    const prompt = `Create a detailed daily meal plan for a ${profile.age}-year-old soccer player (${POSITION_LABELS[profile.position]}).
Weight: ${profile.weight_kg || "unknown"}kg, Height: ${profile.height_cm || "unknown"}cm.
Skill level: ${profile.skill_level}. Training ${profile.weekly_training_days || 5} days/week.

Provide a full day meal plan (training day and rest day) with:
- Pre-training meal/snack
- Post-training recovery meal/snack
- Breakfast, lunch, dinner, and 2 snacks
- Approximate calories and macros
- Hydration tips

Also provide general nutrition tips for young soccer athletes.
Focus on real, practical foods that a ${profile.age}-year-old would actually eat.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          daily_calories: { type: "number" },
          macros: {
            type: "object",
            properties: {
              protein_g: { type: "number" },
              carbs_g: { type: "number" },
              fat_g: { type: "number" },
            },
          },
          training_day: {
            type: "object",
            properties: {
              meals: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    time: { type: "string" },
                    foods: { type: "array", items: { type: "string" } },
                    calories: { type: "number" },
                    note: { type: "string" },
                  },
                },
              },
            },
          },
          rest_day: {
            type: "object",
            properties: {
              meals: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    time: { type: "string" },
                    foods: { type: "array", items: { type: "string" } },
                    calories: { type: "number" },
                    note: { type: "string" },
                  },
                },
              },
            },
          },
          tips: { type: "array", items: { type: "string" } },
          foods_to_avoid: { type: "array", items: { type: "string" } },
          superfoods: { type: "array", items: { type: "string" } },
        },
      },
    });

    setMealPlan(result);
    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">Complete your profile first to unlock nutrition planning.</p>
      </div>
    </div>
  );

  const mealIcons = ["🌅", "🍳", "🥤", "🥗", "🍌", "🍽️", "🥜", "🌙"];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <MealDetailDialog
          open={!!selectedMeal}
          onClose={() => setSelectedMeal(null)}
          meal={selectedMeal}
          profile={profile}
          allMeals={currentMeals}
          onSwap={(alt) => setSelectedMeal(alt)}
        />

        <div>
          <h1 className="text-2xl font-heading font-bold">Nutrition</h1>
          <p className="text-xs text-muted-foreground mt-1">Fuel your performance</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Creating your meal plan...</p>
          </div>
        ) : showAIPlan && mealPlan ? (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setShowAIPlan(false)} className="text-xs">
              ← Back to Meal Library
            </Button>

            <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/20 p-5">
              <h3 className="font-heading font-bold text-sm">Daily Target</h3>
              <p className="text-2xl font-heading font-bold text-primary mt-1">{mealPlan.daily_calories} kcal</p>
              <div className="flex gap-4 mt-3">
                <div><p className="text-xs text-muted-foreground">Protein</p><p className="text-sm font-semibold">{mealPlan.macros?.protein_g}g</p></div>
                <div><p className="text-xs text-muted-foreground">Carbs</p><p className="text-sm font-semibold">{mealPlan.macros?.carbs_g}g</p></div>
                <div><p className="text-xs text-muted-foreground">Fat</p><p className="text-sm font-semibold">{mealPlan.macros?.fat_g}g</p></div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-secondary">
                <TabsTrigger value="plan" className="flex-1">🏋️ Training Day</TabsTrigger>
                <TabsTrigger value="rest" className="flex-1">😴 Rest Day</TabsTrigger>
                <TabsTrigger value="tips" className="flex-1">💡 Tips</TabsTrigger>
              </TabsList>
              <TabsContent value="plan" className="space-y-3 mt-4">
                {mealPlan.training_day?.meals?.map((meal, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => { setSelectedMeal(meal); setCurrentMeals(mealPlan.training_day?.meals || []); }}
                    className="rounded-xl bg-card border border-border p-4 cursor-pointer hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2"><span className="text-lg">{mealIcons[i] || "🍽️"}</span><h4 className="font-semibold text-sm">{meal.name}</h4></div>
                      <span className="text-xs text-muted-foreground">{meal.time}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">{meal.foods?.map((food, j) => (<span key={j} className="text-xs bg-secondary px-2 py-1 rounded-lg">{food}</span>))}</div>
                    {meal.note && <p className="text-xs text-muted-foreground">{meal.note}</p>}
                    <p className="text-xs text-primary font-medium">{meal.calories} kcal</p>
                  </motion.div>
                ))}
              </TabsContent>
              <TabsContent value="rest" className="space-y-3 mt-4">
                {mealPlan.rest_day?.meals?.map((meal, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => { setSelectedMeal(meal); setCurrentMeals(mealPlan.rest_day?.meals || []); }}
                    className="rounded-xl bg-card border border-border p-4 cursor-pointer hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2"><span className="text-lg">{mealIcons[i] || "🍽️"}</span><h4 className="font-semibold text-sm">{meal.name}</h4></div>
                      <span className="text-xs text-muted-foreground">{meal.time}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">{meal.foods?.map((food, j) => (<span key={j} className="text-xs bg-secondary px-2 py-1 rounded-lg">{food}</span>))}</div>
                    {meal.note && <p className="text-xs text-muted-foreground">{meal.note}</p>}
                    <p className="text-xs text-primary font-medium">{meal.calories} kcal</p>
                  </motion.div>
                ))}
              </TabsContent>
              <TabsContent value="tips" className="space-y-4 mt-4">
                <div className="rounded-xl bg-card border border-border p-4">
                  <h4 className="font-semibold text-sm mb-3">💡 Nutrition Tips</h4>
                  {mealPlan.tips?.map((tip, i) => (<p key={i} className="text-xs text-muted-foreground flex gap-2 mb-2"><span className="text-primary">•</span> {tip}</p>))}
                </div>
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4"><h4 className="font-semibold text-sm mb-2">✅ Superfoods</h4><div className="flex flex-wrap gap-1.5">{mealPlan.superfoods?.map((food, i) => (<span key={i} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-lg">{food}</span>))}</div></div>
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4"><h4 className="font-semibold text-sm mb-2">🚫 Avoid</h4><div className="flex flex-wrap gap-1.5">{mealPlan.foods_to_avoid?.map((food, i) => (<span key={i} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-lg">{food}</span>))}</div></div>
              </TabsContent>
            </Tabs>
            <Button variant="outline" className="w-full" onClick={generateMealPlan}><Sparkles className="w-4 h-4 mr-2" /> Generate New Plan</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" className="text-xs" onClick={async () => { setShowAIPlan(true); if (!mealPlan) await generateMealPlan(); }}>
                <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Meal Plan
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentCategory(v); }}>
              <TabsList className="w-full bg-card border border-border rounded-lg p-1 gap-1 flex-wrap h-auto">
                {Object.entries(MEAL_CATEGORIES).map(([key, cat]) => (
                  <TabsTrigger key={key} value={key}
                    className="flex-1 min-w-[70px] text-xs py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-secondary transition-all">
                    <span className="mr-1">{cat.icon}</span> {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(MEAL_CATEGORIES).map(([key, cat]) => (
                <TabsContent key={key} value={key} className="space-y-3 mt-4">
                  <div className={`rounded-xl border bg-gradient-to-br p-4 ${cat.color}`}>
                    <h3 className="font-semibold text-sm">{cat.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{cat.desc} — {cat.meals.length} options</p>
                  </div>
                  <div className="space-y-2">
                    {cat.meals.map((meal, i) => (
                      <MealCard key={i} meal={meal} index={i} category={cat} onSelect={(m) => { setSelectedMeal(m); setCurrentMeals(cat.meals); setCurrentCategory(key); }} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* Nutrition vs Training Comparison */}
        <NutritionVsTraining profile={profile} />

        {/* Nutrition Coach Agent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card border border-green-500/20 p-5"
        >
          <NutritionCoachChat profile={profile} />
        </motion.div>
      </div>
    </div>
  );
}