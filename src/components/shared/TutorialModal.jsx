import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, X, Sparkles, BookOpen, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function TutorialModal({ open, onClose, item, context, triggerLabel }) {
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);

  const generateTutorial = async () => {
    if (tutorial) return;
    setLoading(true);

    const prompt = `Create a detailed, step-by-step tutorial for: "${item.name || item}".

Context: ${context}

Include:
- A brief intro (1 sentence about why this matters)
- What you need (equipment/ingredients if applicable)
- 4-6 detailed steps with clear instructions
- Key tips for proper form/technique
- Common mistakes to avoid
- A summary tip

Write for a young athlete (age 10-18). Use simple, encouraging language.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          intro: { type: "string" },
          what_you_need: { type: "array", items: { type: "string" } },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_number: { type: "number" },
                title: { type: "string" },
                instruction: { type: "string" },
                tip: { type: "string" },
              },
            },
          },
          common_mistakes: { type: "array", items: { type: "string" } },
          final_tip: { type: "string" },
        },
      },
    });

    setTutorial(result);
    setLoading(false);
  };

  if (!open) return null;

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
          className="bg-card w-full sm:max-w-lg max-h-[85vh] rounded-2xl flex flex-col overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm">{triggerLabel || item?.name || "How To"}</h3>
                <p className="text-[10px] text-muted-foreground">Step-by-step tutorial</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Creating your tutorial...</p>
              </div>
            )}

            {!tutorial && !loading && (
              <div className="text-center py-8 space-y-4">
                <Sparkles className="w-10 h-10 text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Get a detailed AI-generated tutorial with step-by-step instructions, tips, and common mistakes to avoid.
                </p>
                <Button onClick={generateTutorial} className="bg-primary hover:bg-primary/90">
                  <Sparkles className="w-4 h-4 mr-2" /> Generate Tutorial
                </Button>
              </div>
            )}

            {tutorial && (
              <>
                {/* Intro */}
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
                  <p className="text-sm">{tutorial.intro}</p>
                </div>

                {/* What you need */}
                {tutorial.what_you_need?.length > 0 && (
                  <div>
                    <h4 className="font-heading font-bold text-xs tracking-wider uppercase text-muted-foreground mb-2">
                      What You Need
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {tutorial.what_you_need.map((item, i) => (
                        <span
                          key={i}
                          className="text-xs bg-secondary rounded-full px-2.5 py-1"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Steps */}
                <div>
                  <h4 className="font-heading font-bold text-xs tracking-wider uppercase text-muted-foreground mb-2">
                    Step-by-Step
                  </h4>
                  <div className="space-y-1.5">
                    {tutorial.steps?.map((step, i) => (
                      <div key={i} className="rounded-lg bg-card border border-border overflow-hidden">
                        <button
                          onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/50 transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">{step.step_number}</span>
                          </div>
                          <span className="text-sm font-medium flex-1">{step.title}</span>
                          {expandedStep === i ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        {expandedStep === i && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="px-3 pb-3 space-y-2"
                          >
                            <p className="text-sm text-muted-foreground pl-9">{step.instruction}</p>
                            {step.tip && (
                              <div className="ml-9 flex items-start gap-1.5 bg-accent/10 border border-accent/20 rounded-lg p-2">
                                <Sparkles className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-accent">{step.tip}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common mistakes */}
                {tutorial.common_mistakes?.length > 0 && (
                  <div>
                    <h4 className="font-heading font-bold text-xs tracking-wider uppercase text-destructive mb-2 flex items-center gap-1.5">
                      <X className="w-3 h-3" /> Common Mistakes
                    </h4>
                    <div className="space-y-1.5">
                      {tutorial.common_mistakes.map((mistake, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-destructive font-bold flex-shrink-0">✕</span>
                          {mistake}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final tip */}
                {tutorial.final_tip && (
                  <div className="rounded-xl bg-accent/10 border border-accent/20 p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      <p className="text-sm font-medium text-accent">{tutorial.final_tip}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}