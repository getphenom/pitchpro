import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Clock, MapPin, Dumbbell, Brain, Apple, Moon, RefreshCw } from "lucide-react";
import { POSITION_LABELS, LEVEL_TITLES, getLevel } from "@/lib/gameData";
import { motion } from "framer-motion";
import { format, addDays, startOfWeek } from "date-fns";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

const ACTIVITY_ICONS = {
  training: { icon: <Dumbbell className="w-4 h-4" />, bg: "bg-green-500/15 border-green-500/30 text-green-400" },
  nutrition: { icon: <Apple className="w-4 h-4" />, bg: "bg-red-500/15 border-red-500/30 text-red-400" },
  mental: { icon: <Brain className="w-4 h-4" />, bg: "bg-blue-500/15 border-blue-500/30 text-blue-400" },
  rest: { icon: <Moon className="w-4 h-4" />, bg: "bg-purple-500/15 border-purple-500/30 text-purple-400" },
  match: { icon: <MapPin className="w-4 h-4" />, bg: "bg-accent/20 border-accent/40 text-accent" },
};

function ScheduleDay({ day, schedule, index }) {
  const isRest = schedule.type === "rest";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border p-4 ${isRest ? "bg-purple-500/5 border-purple-500/20" : "bg-card border-border"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-heading font-bold text-sm">{day}</h4>
          <p className="text-xs text-muted-foreground">{schedule.focus}</p>
        </div>
        {isRest ? (
          <span className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
            <Moon className="w-3 h-3" /> Rest
          </span>
        ) : (
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
            {schedule.type_label}
          </span>
        )}
      </div>

      {isRest ? (
        <p className="text-xs text-muted-foreground italic">
          Active recovery — light stretching, foam rolling, and hydration focus.
        </p>
      ) : schedule.slots?.length > 0 ? (
        <div className="space-y-1.5">
          {schedule.slots.map((slot, j) => {
            const activity = ACTIVITY_ICONS[slot.type] || ACTIVITY_ICONS.training;
            return (
              <div key={j} className="flex items-start gap-2.5">
                <span className="text-xs font-semibold text-muted-foreground w-14 flex-shrink-0 pt-0.5">
                  {slot.time}
                </span>
                <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 flex-1 ${activity.bg}`}>
                  {activity.icon}
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{slot.activity}</p>
                    {slot.detail && (
                      <p className="text-[10px] opacity-70 mt-0.5">{slot.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </motion.div>
  );
}

export default function TrainingSchedule({ profile }) {
  const [schedule, setSchedule] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const level = profile.skill_level || "beginner";
  const positionLabel = POSITION_LABELS[profile.position] || profile.position;
  const weeklyDays = profile.weekly_training_days || 5;
  const age = profile.age || 14;

  const generateSchedule = async () => {
    setGenerating(true);

    const prompt = `Create a detailed weekly training schedule for a ${age}-year-old soccer player who plays as a ${positionLabel} at ${level} level.

They train ${weeklyDays} days per week. Their preferred foot is ${profile.preferred_foot || "right"}.

Create a day-by-day schedule for a full week (Monday through Sunday). For each day include:
- The day's focus (technical, physical, tactical, mental, rest/recovery, or match)
- Time slots (morning, afternoon, evening) with specific activities
- Each activity should have a name, short description, and approx duration in minutes
- Proper rest and recovery built in (at least ${7 - weeklyDays} rest days)
- Include meals/nutrition timing around training (pre and post-training meals)
- Include sleep targets for each day

Tailor specific drills and exercises to the ${positionLabel} position specifically. 

For ages 10-13: keep volume lower, focus on fun and fundamentals
For ages 14-16: moderate volume, introduce more tactical concepts
For ages 17+: higher intensity, match-like conditions`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          schedule_name: { type: "string" },
          overview: { type: "string" },
          weekly_theme: { type: "string" },
          total_training_hours: { type: "number" },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "string", enum: DAY_NAMES },
                focus: { type: "string" },
                type: { type: "string", enum: ["technical", "physical", "tactical", "mental", "rest", "match", "mixed"] },
                type_label: { type: "string" },
                slots: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string" },
                      type: { type: "string", enum: ["training", "nutrition", "mental", "rest", "match"] },
                      activity: { type: "string" },
                      detail: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    setSchedule(result);
    setGenerating(false);
    setSelectedDay(null);
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <Sparkles className="w-5 h-5 text-accent absolute -top-1 -right-1 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground">Building your personalized schedule...</p>
        <p className="text-xs text-muted-foreground/60 max-w-xs text-center">
          Tailoring training, nutrition, and recovery for a {age}-year-old {positionLabel}
        </p>
      </div>
    );
  }

  if (!schedule) {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">Weekly Training Schedule</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Get a detailed day-by-day schedule built for a {age}-year-old {positionLabel} ({level}). 
              Includes training sessions, meal timing, mental work, and recovery.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3 text-green-400" /> Training</span>
            <span className="flex items-center gap-1"><Apple className="w-3 h-3 text-red-400" /> Meals</span>
            <span className="flex items-center gap-1"><Brain className="w-3 h-3 text-blue-400" /> Mental</span>
            <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-purple-400" /> Recovery</span>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={generateSchedule}>
            <Sparkles className="w-4 h-4 mr-2" /> Generate My Schedule
          </Button>
        </div>

        {/* Quick info */}
        <div className="rounded-xl bg-card border border-border p-4">
          <h4 className="font-heading font-bold text-xs tracking-wider uppercase text-muted-foreground mb-3">
            Your Training Profile
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground">Position</p>
              <p className="text-sm font-semibold">{positionLabel}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground">Level</p>
              <p className="text-sm font-semibold capitalize">{level}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground">Age</p>
              <p className="text-sm font-semibold">{age} years</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground">Training Days</p>
              <p className="text-sm font-semibold">{weeklyDays}/week</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg">{schedule.schedule_name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{schedule.weekly_theme}</p>
          </div>
          <Button variant="outline" size="sm" onClick={generateSchedule}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{schedule.overview}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs text-primary font-medium">
            ~{schedule.total_training_hours || (weeklyDays * 1.5)} training hours
          </span>
          <span className="text-xs text-muted-foreground">
            {schedule.days?.filter(d => d.type === "rest").length || (7 - weeklyDays)} rest days
          </span>
        </div>
      </div>

      {/* Day-by-day schedule */}
      <div className="space-y-2">
        {schedule.days?.map((day, i) => (
          <ScheduleDay key={i} day={day.day} schedule={day} index={i} />
        ))}
      </div>

      <Button variant="outline" className="w-full" onClick={() => setSchedule(null)}>
        Change Schedule Settings
      </Button>
    </div>
  );
}