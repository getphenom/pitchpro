import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, UtensilsCrossed, Sparkles, Apple, Beef, Wheat, Fish, Salad, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TutorialModal from "@/components/shared/TutorialModal";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion } from "framer-motion";
import NutritionCoachChat from "@/components/agents/NutritionCoachChat";
import NutritionVsTraining from "@/components/nutrition/NutritionVsTraining";

export default function Nutrition() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("plan");
  const [tutorialItem, setTutorialItem] = useState(null);

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

  if (!profile) return null;

  const mealIcons = ["🌅", "🍳", "🥤", "🥗", "🍌", "🍽️", "🥜", "🌙"];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <TutorialModal
          open={!!tutorialItem}
          onClose={() => setTutorialItem(null)}
          item={tutorialItem}
          context={`This is a meal for a ${profile.age}-year-old soccer player. Include preparation instructions, cooking tips, and ingredient substitutions.`}
          triggerLabel={tutorialItem?.name || "How to Prepare"}
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
        ) : !mealPlan ? (
          <div className="space-y-6">
            {/* Quick Tips */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "💧", title: "Hydrate First", desc: "Start your day with 500ml water" },
                { icon: "🍌", title: "Pre-Training", desc: "Eat a banana 30 min before" },
                { icon: "🥛", title: "Recovery", desc: "Protein within 30 min post-training" },
                { icon: "🥗", title: "Eat the Rainbow", desc: "Variety of colored fruits & veggies" },
              ].map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-card border border-border p-4"
                >
                  <span className="text-2xl">{tip.icon}</span>
                  <h4 className="font-semibold text-sm mt-2">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{tip.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                <UtensilsCrossed className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg">Personalized Meal Plan</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Get an AI-generated meal plan based on your age, position, and training load.
              </p>
              <Button className="bg-primary hover:bg-primary/90" onClick={generateMealPlan}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Meal Plan
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Macro overview */}
            <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/20 p-5">
              <h3 className="font-heading font-bold text-sm">Daily Target</h3>
              <p className="text-2xl font-heading font-bold text-primary mt-1">{mealPlan.daily_calories} kcal</p>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-sm font-semibold">{mealPlan.macros?.protein_g}g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-sm font-semibold">{mealPlan.macros?.carbs_g}g</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fat</p>
                  <p className="text-sm font-semibold">{mealPlan.macros?.fat_g}g</p>
                </div>
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
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setTutorialItem(meal)}
                    className="rounded-xl bg-card border border-border p-4 cursor-pointer hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{mealIcons[i] || "🍽️"}</span>
                        <h4 className="font-semibold text-sm">{meal.name}</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">{meal.time}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {meal.foods?.map((food, j) => (
                        <span key={j} className="text-xs bg-secondary px-2 py-1 rounded-lg">{food}</span>
                      ))}
                    </div>
                    {meal.note && <p className="text-xs text-muted-foreground">{meal.note}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-primary font-medium">{meal.calories} kcal</p>
                      <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-0.5">
                        <BookOpen className="w-3 h-3" /> Tap for recipe
                      </span>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="rest" className="space-y-3 mt-4">
                {mealPlan.rest_day?.meals?.map((meal, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setTutorialItem(meal)}
                    className="rounded-xl bg-card border border-border p-4 cursor-pointer hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{mealIcons[i] || "🍽️"}</span>
                        <h4 className="font-semibold text-sm">{meal.name}</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">{meal.time}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {meal.foods?.map((food, j) => (
                        <span key={j} className="text-xs bg-secondary px-2 py-1 rounded-lg">{food}</span>
                      ))}
                    </div>
                    {meal.note && <p className="text-xs text-muted-foreground">{meal.note}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-primary font-medium">{meal.calories} kcal</p>
                      <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-0.5">
                        <BookOpen className="w-3 h-3" /> Tap for recipe
                      </span>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="tips" className="space-y-4 mt-4">
                <div className="rounded-xl bg-card border border-border p-4">
                  <h4 className="font-semibold text-sm mb-3">💡 Nutrition Tips</h4>
                  <ul className="space-y-2">
                    {mealPlan.tips?.map((tip, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                  <h4 className="font-semibold text-sm mb-2">✅ Superfoods</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {mealPlan.superfoods?.map((food, i) => (
                      <span key={i} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-lg">{food}</span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                  <h4 className="font-semibold text-sm mb-2">🚫 Avoid</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {mealPlan.foods_to_avoid?.map((food, i) => (
                      <span key={i} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-lg">{food}</span>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button variant="outline" className="w-full" onClick={() => setMealPlan(null)}>
              Generate New Plan
            </Button>
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