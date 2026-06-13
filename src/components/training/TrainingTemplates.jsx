import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Save, Copy, Trash2, Clock, Flame, Zap, Play, Bookmark, X, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_ICONS = { technical: "⚽", physical: "💪", tactical: "📋", mental: "🧠", recovery: "🧘" };

export default function TrainingTemplates({ profile, trainingCategories, level }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("browse"); // "browse" | "create" | "view"
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [selectedDrills, setSelectedDrills] = useState([]);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["training-templates", profile?.id],
    queryFn: () => base44.entities.TrainingTemplate.filter({ player_id: profile.id }, "-created_date"),
    enabled: !!profile,
  });

  const saveTemplate = useMutation({
    mutationFn: (data) => base44.entities.TrainingTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-templates"] });
      resetBuilder();
      setMode("browse");
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: (id) => base44.entities.TrainingTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["training-templates"] }),
  });

  const resetBuilder = () => {
    setTemplateName("");
    setTemplateDesc("");
    setSelectedDrills([]);
  };

  // Flatten all drills from all categories to build a pool
  const allDrills = [];
  Object.entries(trainingCategories).forEach(([catKey, cat]) => {
    (cat.drills[level] || []).forEach((drill) => {
      allDrills.push({ ...drill, category: catKey, categoryIcon: cat.icon, categoryLabel: cat.label });
    });
  });

  const toggleDrill = (drill) => {
    const key = `${drill.category}-${drill.name}`;
    const exists = selectedDrills.find((d) => `${d.category}-${d.name}` === key);
    if (exists) {
      setSelectedDrills(selectedDrills.filter((d) => `${d.category}-${d.name}` !== key));
    } else {
      setSelectedDrills([...selectedDrills, drill]);
    }
  };

  const handleSave = () => {
    if (!templateName.trim() || selectedDrills.length === 0) return;
    saveTemplate.mutate({
      player_id: profile.id,
      name: templateName.trim(),
      description: templateDesc.trim(),
      drills: selectedDrills.map((d) => ({
        name: d.name,
        duration: d.duration,
        description: d.desc || d.description,
        category: d.category,
        xp: d.xp,
      })),
    });
  };

  const totalXp = selectedDrills.reduce((sum, d) => sum + (d.xp || 0), 0);
  const totalMin = selectedDrills.reduce((sum, d) => {
    const min = parseInt(d.duration) || 0;
    return sum + min;
  }, 0);

  const loadTemplate = (template) => {
    setActiveTemplate(template);
    setMode("view");
  };

  return (
    <div className="space-y-4">
      {mode === "browse" && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wider">
              My Templates ({templates.length})
            </h3>
            <Button size="sm" onClick={() => setMode("create")} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" /> New Template
            </Button>
          </div>

          {templates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center space-y-3">
              <Bookmark className="w-8 h-8 text-primary/50 mx-auto" />
              <div>
                <p className="font-semibold text-sm">No templates yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save your favorite workout combos to reload them instantly.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setMode("create")}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Create First Template
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((tpl) => (
                <motion.div
                  key={tpl.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => loadTemplate(tpl)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{tpl.name}</h4>
                        {tpl.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tpl.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" /> {tpl.drills?.length || 0} drills
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-accent" />
                            {tpl.drills?.reduce((s, d) => s + (d.xp || 0), 0)} XP
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Builder mode */}
      {mode === "create" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
              Build Template
            </h3>
            <button
              onClick={() => { resetBuilder(); setMode("browse"); }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          {/* Name & Description */}
          <div className="rounded-xl bg-card border border-border p-4 space-y-3">
            <div>
              <Label className="text-xs">Template Name *</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Speed & Agility Circuit"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Description (optional)</Label>
              <Textarea
                value={templateDesc}
                onChange={(e) => setTemplateDesc(e.target.value)}
                placeholder="What this workout focuses on..."
                className="mt-1 h-16"
              />
            </div>
          </div>

          {/* Drill pool */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">
                Select Drills ({selectedDrills.length} picked)
              </Label>
              <span className="text-[10px] text-muted-foreground">
                ~{totalMin} min · {totalXp} XP
              </span>
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {Object.entries(trainingCategories).map(([catKey, cat]) => (
                <div key={catKey}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1.5 font-semibold">
                    {cat.icon} {cat.label}
                  </p>
                  {(cat.drills[level] || []).map((drill, i) => {
                    const key = `${catKey}-${drill.name}`;
                    const isSelected = selectedDrills.some((d) => `${d.category}-${d.name}` === key);
                    return (
                      <label
                        key={i}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                          isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50 border border-transparent"
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleDrill({ ...drill, category: catKey })}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{drill.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{drill.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-shrink-0">
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {drill.duration}</span>
                          <span className="text-accent">{drill.xp} XP</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={!templateName.trim() || selectedDrills.length === 0 || saveTemplate.isPending}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Template ({selectedDrills.length} drills)
          </Button>
        </div>
      )}

      {/* View mode */}
      {mode === "view" && activeTemplate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => { setActiveTemplate(null); setMode("browse"); }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Back to templates
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteTemplate.mutate(activeTemplate.id); setMode("browse"); }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 p-5">
            <h3 className="font-heading font-bold text-lg">{activeTemplate.name}</h3>
            {activeTemplate.description && (
              <p className="text-sm text-muted-foreground mt-1">{activeTemplate.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> {activeTemplate.drills?.length || 0} drills</span>
              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-accent" /> {activeTemplate.drills?.reduce((s, d) => s + (d.xp || 0), 0)} XP</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~{activeTemplate.drills?.reduce((s, d) => s + (parseInt(d.duration) || 0), 0)} min
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {activeTemplate.drills?.map((drill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <span className="text-lg">{CATEGORY_ICONS[drill.category] || "⚽"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{drill.name}</p>
                  <p className="text-xs text-muted-foreground">{drill.description}</p>
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {drill.duration}
                  </span>
                  <span className="text-[10px] text-accent font-semibold">{drill.xp} XP</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}