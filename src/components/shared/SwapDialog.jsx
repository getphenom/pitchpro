import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function SwapDialog({ open, onClose, item, itemType, context, onSwap }) {
  const [alternatives, setAlternatives] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [applied, setApplied] = useState(false);

  const generateAlternatives = async () => {
    if (alternatives) return;
    setLoading(true);

    const typeLabel = {
      meal: "meal or snack",
      drill: "training drill",
      exercise: "mental exercise",
      recovery: "recovery activity",
      nutrition_timing: "post-training nutrition timing",
      stretch: "stretch",
      sleep_tip: "sleep recommendation",
    }[itemType] || "item";

    const itemDesc = typeof item === "string" ? item : (item.name || item.title || item.exercise || item.activity || item.guidance || item.recovery_activity || item.drill_name || "");

    const prompt = `The user wants to swap this ${typeLabel}: "${itemDesc}"
Context: ${context || "athletic/soccer training"}

Provide exactly 3 alternative ${typeLabel}s. Each alternative should be different from the others and from the original. Make them practical and age-appropriate for a young soccer player.

${itemType === "meal" ? "Each alternative should be a meal name with brief foods list and calories." : ""}
${itemType === "drill" ? "Each alternative should be a drill name with duration estimate, category, and brief description." : ""}
${itemType === "exercise" ? "Each alternative should be a mental exercise name with duration and brief description." : ""}
${itemType === "recovery" ? "Each alternative should be a recovery activity name with duration." : ""}`;

    const schema = {
      type: "object",
      properties: {
        alternatives: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              ...(itemType === "meal" ? { foods: { type: "array", items: { type: "string" } }, calories: { type: "number" }, time: { type: "string" } } : {}),
              ...(itemType === "drill" ? { duration: { type: "string" }, category: { type: "string" }, xp: { type: "number" } } : {}),
              ...(itemType === "exercise" ? { duration: { type: "string" } } : {}),
              ...(itemType === "recovery" || itemType === "stretch" ? { duration: { type: "string" } } : {}),
            },
          },
        },
      },
    };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
    });

    setAlternatives(result.alternatives);
    setLoading(false);
  };

  const handleSwap = (alt) => {
    setSelected(alt.name);
    setApplied(true);
    onSwap?.(alt);
    setTimeout(() => {
      onClose();
      setSelected(null);
      setApplied(false);
    }, 500);
  };

  if (!open) return null;

  const itemLabel = typeof item === "string" ? item : (item.name || item.title || item.exercise || item.activity || item.drill_name || "");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full sm:max-w-md max-h-[80vh] rounded-2xl flex flex-col overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              <div>
                <h3 className="font-heading font-bold text-sm">Swap Item</h3>
                <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{itemLabel}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Finding alternatives...</p>
              </div>
            )}

            {!alternatives && !loading && (
              <div className="text-center py-8 space-y-4">
                <RefreshCw className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Get AI-generated alternatives to swap with this item.
                </p>
                <Button onClick={generateAlternatives} className="bg-primary hover:bg-primary/90">
                  <Sparkles className="w-4 h-4 mr-2" /> Find Alternatives
                </Button>
              </div>
            )}

            {alternatives && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Choose an alternative:</p>
                {alternatives.map((alt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleSwap(alt)}
                    disabled={applied}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selected === alt.name
                        ? "bg-primary/15 border-primary ring-1 ring-primary"
                        : "bg-secondary/30 border-border hover:border-primary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{alt.name}</p>
                      {alt.duration && (
                        <span className="text-[10px] text-muted-foreground">{alt.duration}</span>
                      )}
                      {alt.calories && (
                        <span className="text-[10px] text-primary font-medium">{alt.calories} kcal</span>
                      )}
                    </div>
                    {alt.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alt.description}</p>
                    )}
                    {alt.foods && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {alt.foods.map((f, j) => (
                          <span key={j} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md">{f}</span>
                        ))}
                      </div>
                    )}
                    {selected === alt.name && (
                      <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Swapped!
                      </p>
                    )}
                  </motion.button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => { setAlternatives(null); setSelected(null); }}
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Get More Options
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}