import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Play, Loader2, ClipboardList, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TacticalTemplates({ profile, tacticalLibrary }) {
  const [showCreate, setShowCreate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [selectedDrills, setSelectedDrills] = useState([]);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["training-templates", profile?.id],
    queryFn: () => base44.entities.TrainingTemplate.filter({ player_id: profile.id }),
    enabled: !!profile,
  });

  const createTemplate = useMutation({
    mutationFn: async () => {
      return base44.entities.TrainingTemplate.create({
        player_id: profile.id,
        name: templateName,
        description: templateDesc,
        drills: selectedDrills,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-templates"] });
      setShowCreate(false);
      setTemplateName("");
      setTemplateDesc("");
      setSelectedDrills([]);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: (id) => base44.entities.TrainingTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["training-templates"] }),
  });

  const allDrills = [];
  Object.entries(tacticalLibrary || {}).forEach(([catKey, cat]) => {
    (cat.drills || []).forEach((drill) => {
      allDrills.push({ ...drill, category: catKey });
    });
  });

  const toggleDrillSelection = (drill) => {
    setSelectedDrills((prev) => {
      const exists = prev.find((d) => d.name === drill.name);
      if (exists) return prev.filter((d) => d.name !== drill.name);
      return [...prev, { name: drill.name, duration: drill.duration, description: drill.desc, category: drill.category || "tactical", xp: drill.xp || 0 }];
    });
  };

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      {/* Create / List toggle */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
          {showCreate ? "New Template" : "Saved Templates"}
        </h3>
        <Button variant={showCreate ? "outline" : "default"} size="sm" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "← Back" : <><Plus className="w-3.5 h-3.5 mr-1" /> New Template</>}
        </Button>
      </div>

      {showCreate ? (
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name (e.g. 'Match Prep Routine')"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <textarea
              value={templateDesc}
              onChange={(e) => setTemplateDesc(e.target.value)}
              placeholder="Optional description..."
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px]"
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-xs text-muted-foreground">Select drills to include:</p>
            {allDrills.map((drill, i) => {
              const selected = selectedDrills.some((d) => d.name === drill.name);
              return (
                <div
                  key={i}
                  onClick={() => toggleDrillSelection(drill)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                    selected ? "bg-orange-500/10 border-orange-500/30" : "bg-secondary/30 border-border hover:border-primary/30"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected ? "bg-orange-500 border-orange-500" : "border-muted-foreground/30"}`}>
                    {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{drill.name}</p>
                    <p className="text-[10px] text-muted-foreground">{drill.duration} · {drill.xp} XP</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            className="w-full"
            disabled={!templateName || selectedDrills.length === 0 || createTemplate.isLoading}
            onClick={() => createTemplate.mutate()}
          >
            {createTemplate.isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {createTemplate.isLoading ? "Saving..." : "Save Template"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <ClipboardList className="w-8 h-8 text-muted-foreground/30 mx-auto" />
              <p className="text-xs text-muted-foreground">No saved templates yet</p>
              <p className="text-[10px] text-muted-foreground">Group your favorite tactical drills into reusable sessions</p>
            </div>
          ) : (
            templates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl bg-card border border-border p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm">{template.name}</h4>
                    {template.description && <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>}
                  </div>
                  <button onClick={() => deleteTemplate.mutate(template.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(template.drills || []).map((drill, di) => (
                    <div key={di} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-secondary/30">
                      <Play className="w-3 h-3 text-orange-400 flex-shrink-0" />
                      <span className="flex-1">{drill.name}</span>
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{drill.duration}</span>
                      <span className="text-accent font-semibold flex items-center gap-1"><Flame className="w-3 h-3" />{drill.xp || 0}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}