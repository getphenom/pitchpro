import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SwappableDetailDialog from "@/components/shared/SwappableDetailDialog";
import { MEAL_IMAGES } from "@/lib/exerciseImages";

export default function MealDetailDialog({ open, onClose, meal, profile, allMeals = [], onSwap }) {
  const [showRecipe, setShowRecipe] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const queryClient = useQueryClient();

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const current = profile.favorite_drills || []; 
      const mealKey = meal.name;
      const updated = current.includes(mealKey)
        ? current.filter((d) => d !== mealKey)
        : [...current, mealKey];
      return base44.entities.PlayerProfile.update(profile.id, { favorite_drills: updated });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });

  const generateRecipe = async () => {
    if (recipe) { setShowRecipe(!showRecipe); return; }
    setLoadingRecipe(true);
    setShowRecipe(true);

    const foodList = meal.foods?.join(", ") || meal.name;
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a detailed recipe and preparation guide for: "${foodList}".

This is a ${meal.name || "meal"} for a young soccer athlete. Include:
- Simple step-by-step preparation instructions
- Cooking times and methods
- Tips to make it tastier
- Possible ingredient substitutions (what to swap if you don't have something)
- Storage tips if making ahead
- Nutritional quick facts

Keep instructions simple and practical — a ${profile?.age || "teenage"}-year-old should be able to follow them.`,
      response_json_schema: {
        type: "object",
        properties: {
          intro: { type: "string" },
          prep_time: { type: "string" },
          cook_time: { type: "string" },
          steps: { type: "array", items: { type: "object", properties: { step_number: { type: "number" }, instruction: { type: "string" }, tip: { type: "string" } } } },
          substitutions: { type: "array", items: { type: "object", properties: { ingredient: { type: "string" }, alternatives: { type: "array", items: { type: "string" } } } } },
          storage_tip: { type: "string" },
          nutrition_note: { type: "string" },
        },
      },
    });
    setRecipe(result);
    setLoadingRecipe(false);
  };

  if (!open || !meal) return null;

  const alternatives = allMeals.filter((m) => m.name !== meal.name);

  return (
    <SwappableDetailDialog
      open={open}
      onClose={onClose}
      item={{ ...meal, icon: "🍽️", title: meal.name }}
      category="nutrition"
      profile={profile}
      favorites={profile?.favorite_drills || []}
      onToggleFavorite={() => toggleFavorite.mutate()}
      alternatives={alternatives}
      onSwap={(alt) => onSwap?.(alt)}
      extraButtons={
        <div className="flex gap-2 pb-3">
          <button
            onClick={generateRecipe}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${recipe && showRecipe ? "bg-primary/15 text-primary border border-primary/20" : "bg-secondary hover:bg-secondary/80"}`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Recipe & How-To
          </button>
        </div>
      }
    >
      {MEAL_IMAGES[meal.name] && (
        <div className="w-full h-40 rounded-lg overflow-hidden -mt-1">
          <img src={MEAL_IMAGES[meal.name]} alt={meal.name} className="w-full h-full object-cover" />
        </div>
      )}
      {(meal.desc || meal.note) && <p className="text-sm text-muted-foreground leading-relaxed">{meal.desc || meal.note}</p>}

      <div className="flex items-center gap-3 text-xs">
        {(meal.duration || meal.time) && <span className="text-muted-foreground">{meal.duration || meal.time}</span>}
        {meal.calories != null && <span className="text-primary font-semibold">{meal.calories} kcal</span>}
      </div>

      {meal.tip && (
        <div className="rounded-lg bg-accent/10 border border-accent/20 p-2.5">
          <p className="text-xs font-medium text-accent">💡 {meal.tip}</p>
        </div>
      )}

      {meal.foods?.length > 0 && (
        <div>
          <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">Ingredients</h4>
          <div className="flex flex-wrap gap-1">
            {meal.foods.map((food, i) => <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-lg">{food}</span>)}
          </div>
        </div>
      )}

      {/* Recipe Section */}
      <AnimatePresence>
        {showRecipe && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 pt-1">
              {loadingRecipe && (
                <div className="flex items-center justify-center py-4 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Creating recipe guide...</span>
                </div>
              )}
              {recipe && (
                <>
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-3"><p className="text-sm">{recipe.intro}</p></div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-muted-foreground">🕐 Prep: {recipe.prep_time}</span>
                    <span className="text-muted-foreground">🔥 Cook: {recipe.cook_time}</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">Steps</h4>
                    <div className="space-y-1">
                      {recipe.steps?.map((step, i) => (
                        <div key={i} className="rounded-lg bg-secondary/50 border border-border p-2.5">
                          <p className="text-xs"><span className="font-bold text-primary mr-1">{step.step_number}.</span>{step.instruction}</p>
                          {step.tip && <p className="text-[10px] text-accent mt-0.5">💡 {step.tip}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                  {recipe.substitutions?.length > 0 && (
                    <div>
                      <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">🔄 Substitutions</h4>
                      <div className="space-y-1.5">
                        {recipe.substitutions.map((sub, i) => (
                          <div key={i} className="rounded-lg bg-secondary/30 border border-border p-2">
                            <p className="text-xs font-medium">Instead of {sub.ingredient}:</p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {sub.alternatives.map((alt, j) => <span key={j} className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded">{alt}</span>)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {recipe.storage_tip && <div className="rounded-lg bg-accent/10 border border-accent/20 p-2.5"><p className="text-xs font-medium">📦 {recipe.storage_tip}</p></div>}
                  {recipe.nutrition_note && <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2.5"><p className="text-xs font-medium text-green-400">🥗 {recipe.nutrition_note}</p></div>}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SwappableDetailDialog>
  );
}