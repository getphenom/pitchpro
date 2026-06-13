import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Clock, Move, Timer, BookOpen } from "lucide-react";
import TutorialModal from "@/components/shared/TutorialModal";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion } from "framer-motion";

const POSITION_WARMUP = {
  goalkeeper: {
    focus: "Reaction speed, shoulder mobility, and explosive diving",
    stretches: [
      { name: "Shoulder Circles", duration: "45s", desc: "Slow, controlled arm circles forward and backward to loosen rotator cuffs" },
      { name: "Hip Openers", duration: "45s", desc: "Deep lateral lunges, holding each side to open hips for diving" },
      { name: "Wrist Rolls", duration: "30s", desc: "Rotate wrists both directions — crucial for catching and parrying" },
      { name: "Spinal Twists", duration: "30s", desc: "Seated torso twists to mobilize spine for quick direction changes" },
      { name: "Cat-Cow Flow", duration: "40s", desc: "Arching and rounding spine on all fours for full back mobility" },
    ],
    drills: [
      { name: "Reaction Catches", duration: "2 min", desc: "Partner throws tennis balls at varying heights — react and catch" },
      { name: "Side Shuffle & Dive", duration: "2 min", desc: "Lateral shuffle across goal line, dive to cones at each post" },
      { name: "High Ball Claims", duration: "1.5 min", desc: "Jump and claim imaginary crosses, land safely on both feet" },
      { name: "Quick Feet & Set", duration: "2 min", desc: "Fast feet through mini hurdles, then set into ready position" },
    ],
  },
  center_back: {
    focus: "Lower body power, heading prep, and lateral agility",
    stretches: [
      { name: "Dynamic Lunges", duration: "45s", desc: "Walking lunges with torso twist — activate glutes and core together" },
      { name: "Leg Swings", duration: "40s", desc: "Forward/back and lateral swings to open hips and hamstrings" },
      { name: "Neck Rolls", duration: "30s", desc: "Gentle neck mobility for heading preparation" },
      { name: "Ankle Rotations", duration: "30s", desc: "Roll each ankle — critical for hard tackles and quick pivots" },
      { name: "Groin Stretch", duration: "45s", desc: "Butterfly stretch and standing groin openers for slide tackle range" },
    ],
    drills: [
      { name: "Heading Prep", duration: "1.5 min", desc: "Light self-toss headers focusing on timing and neck engagement" },
      { name: "Defensive Shuffles", duration: "2 min", desc: "Lateral defensive slides between cones with body positioning" },
      { name: "Short Pass & Move", duration: "2 min", desc: "Partner passing with movement — simulate building from the back" },
      { name: "Jump & Land", duration: "2 min", desc: "Standing vertical jumps land softly — prep for aerial duels" },
    ],
  },
  full_back: {
    focus: "Speed endurance, hip mobility, and crossing prep",
    stretches: [
      { name: "Dynamic Hamstring Sweeps", duration: "45s", desc: "Sweep arms down to ground while walking — loosen hamstrings" },
      { name: "Hip Flexor Stretch", duration: "40s", desc: "Kneeling hip flexor stretch with arm reach — open front of hip" },
      { name: "Lateral Lunges", duration: "40s", desc: "Side-to-side deep lunges to open adductors for wide stance" },
      { name: "Calf Raises", duration: "30s", desc: "Dynamic calf pumps on a step — prep for explosive sprints" },
      { name: "Torso Rotations", duration: "35s", desc: "Standing twists with arms wide — mobilize spine for crosses" },
    ],
    drills: [
      { name: "Overlap Runs", duration: "2 min", desc: "Light jog overlapping outside cones — simulate attacking runs" },
      { name: "Crossing Motion", duration: "2 min", desc: "Swing crosses into a target without full power — technique focus" },
      { name: "Recovery Sprints", duration: "2 min", desc: "Jog forward, sprint backward — simulate tracking back" },
      { name: "One-Two Pass & Go", duration: "1.5 min", desc: "Wall pass at half speed, then overlap — build rhythm" },
    ],
  },
  defensive_mid: {
    focus: "Core stability, passing range, and interception positioning",
    stretches: [
      { name: "World's Greatest Stretch", duration: "50s", desc: "Lunge with elbow drop, then rotate up — full body mobility" },
      { name: "Glute Bridges", duration: "40s", desc: "Dynamic bridges to activate posterior chain for shielding" },
      { name: "Side Plank Rotation", duration: "35s", desc: "Rotating side planks for oblique and core engagement" },
      { name: "Standing Quad Stretch", duration: "30s", desc: "Alternating heel-to-glute holds while walking" },
      { name: "Thoracic Rotations", duration: "35s", desc: "On all fours, rotate one arm up — mobilize upper back for passing range" },
    ],
    drills: [
      { name: "Passing Ladder", duration: "2 min", desc: "Short-medium-long passing progression with a partner" },
      { name: "Interception Reads", duration: "1.5 min", desc: "Partner attempts passes — step in and cut them out" },
      { name: "Turn & Switch Play", duration: "2 min", desc: "Receive, turn away from pressure, switch to opposite side" },
      { name: "Shield & Release", duration: "2 min", desc: "Hold off gentle pressure, then spin away and pass" },
    ],
  },
  central_mid: {
    focus: "Agility, first touch, and 360° awareness",
    stretches: [
      { name: "A-Skips", duration: "40s", desc: "High knee marching with coordinated arm drive" },
      { name: "Hurdle Walk-Overs", duration: "45s", desc: "Step over imaginary hurdles forward and sideways" },
      { name: "Torso Twist Lunges", duration: "40s", desc: "Lunge forward then twist toward front leg — core and hips" },
      { name: "Inchworms", duration: "35s", desc: "Walk hands out to plank, then feet to hands — full posterior chain" },
      { name: "Arm Circles", duration: "30s", desc: "Large and small circles both directions for shoulder mobility" },
    ],
    drills: [
      { name: "Rondo Circle", duration: "2 min", desc: "Light keep-away with quick passes — first touch focus" },
      { name: "Check & Receive", duration: "2 min", desc: "Drop into space, receive on the half-turn, play back" },
      { name: "Dribble Through Gates", duration: "1.5 min", desc: "Navigate tight cone gates with both feet at increasing speed" },
      { name: "Directional First Touch", duration: "2 min", desc: "Receive from different angles, take first touch away from pressure" },
    ],
  },
  attacking_mid: {
    focus: "Explosive movement, balance, and shooting prep",
    stretches: [
      { name: "Leg Cradles", duration: "40s", desc: "Pull knee to chest then externally rotate hip — dynamic hip mobility" },
      { name: "Walking Knee Hugs", duration: "35s", desc: "Hug knee to chest alternating while walking tall" },
      { name: "Side Bends", duration: "30s", desc: "Lateral torso bends — loosen obliques for body feints" },
      { name: "Ankle Mobiliy Drill", duration: "40s", desc: "Knee-to-wall dorsiflexion for sharper cuts and changes of direction" },
      { name: "Shoulder Dislocates", duration: "35s", desc: "Hold a stick/band wide and pass overhead and back — shoulder mobility" },
    ],
    drills: [
      { name: "Cone Weave & Shoot", duration: "2.5 min", desc: "Dribble through cones, then light shot at target — build rhythm" },
      { name: "Body Feints", duration: "1.5 min", desc: "Practice step-overs and shoulder drops at walking pace" },
      { name: "One-Touch Wall Work", duration: "2 min", desc: "Rapid one-touch passes against a wall — 30s each foot" },
      { name: "Sharp Turn Series", duration: "1.5 min", desc: "Quick 180° turns at each cone — inside cut, outside cut, drag back" },
    ],
  },
  winger: {
    focus: "Sprint activation, ankle mobility, and crossing technique",
    stretches: [
      { name: "High Knees", duration: "35s", desc: "Bounding high knees with arm drive — prime fast-twitch fibers" },
      { name: "Butt Kicks", duration: "35s", desc: "Heels to glutes at quick tempo to warm hamstrings" },
      { name: "Open the Gate", duration: "40s", desc: "Lift knee and externally rotate hip out — hip mobility for cutting" },
      { name: "Close the Gate", duration: "40s", desc: "Lift knee and internally rotate hip in — balance the hip complex" },
      { name: "Calf Pumps", duration: "30s", desc: "Rapid toe raises on the spot — prep calves for sprinting and jumping" },
    ],
    drills: [
      { name: "Sprint Build-Ups", duration: "2 min", desc: "Gradually accelerate to 70% over 20m, 4 reps — find your stride" },
      { name: "Cone Cuts", duration: "2 min", desc: "Sharp 45° cuts around cones at increasing speed" },
      { name: "Cross & Finish", duration: "2 min", desc: "Dribble wide, deliver low cross toward target, then finish a return" },
      { name: "Feint & Explode", duration: "1.5 min", desc: "Body feint at a cone, then explosive sprint past — beat your man" },
    ],
  },
  striker: {
    focus: "Explosive power, finishing movement, and hold-up strength",
    stretches: [
      { name: "Forward Lunges", duration: "45s", desc: "Deep forward lunges with overhead reach — open hips and shoulders" },
      { name: "Sumo Squat Stretch", duration: "40s", desc: "Wide stance, press knees out with elbows — adductor activation" },
      { name: "Scorpions", duration: "35s", desc: "Lie face down, tap opposite hand to opposite foot — full body spiral" },
      { name: "Kneeling Hip Flexor", duration: "40s", desc: "Deep hip flexor stretch — critical for shooting power" },
      { name: "Wrist & Forearm", duration: "30s", desc: "Wrist flexor/extensor stretches — prep for hand-offs and shielding" },
    ],
    drills: [
      { name: "Finishing Circuit", duration: "2.5 min", desc: "Light shots from different angles — inside foot, laces, placed" },
      { name: "Hold-Up Play", duration: "2 min", desc: "Receive ball with back to goal, shield, lay off to imaginary teammate" },
      { name: "Curved Run & Shoot", duration: "2 min", desc: "Make bending runs into the box then finish — timing focus" },
      { name: "Quick Release", duration: "1.5 min", desc: "One-touch finishes from varying service — react and redirect" },
    ],
  },
};

const PHASES = [
  { label: "Activation", icon: "🔥", desc: "Prime muscles" },
  { label: "Dynamic Stretch", icon: "🧘", desc: "Mobilize joints" },
  { label: "Position Drills", icon: "⚽", desc: "Sport-specific" },
];

export default function WarmUpGenerator({ profile }) {
  const [generating, setGenerating] = useState(false);
  const [routine, setRoutine] = useState(null);
  const [tutorialItem, setTutorialItem] = useState(null);

  const position = profile?.position || "central_mid";
  const warmup = POSITION_WARMUP[position] || POSITION_WARMUP.central_mid;
  const positionLabel = POSITION_LABELS[position] || position;

  const generate = async () => {
    setGenerating(true);

    // Build prompt for AI to customize if they want extra variation
    const prompt = `Create a personalized 10-minute soccer warm-up routine for a ${profile.age}-year-old ${positionLabel} at ${profile.skill_level} level.

Position-specific focus: ${warmup.focus}

The warm-up must follow this structure:
Phase 1 (3-4 min): General activation — jogging, dynamic movements
Phase 2 (2-3 min): Dynamic stretches targeting ${positionLabel}-specific muscle groups
Phase 3 (4-5 min): Light position-specific drills

Return a structured warm-up with timed segments.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          focus: { type: "string" },
          phases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phase_name: { type: "string" },
                phase_desc: { type: "string" },
                exercises: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      duration: { type: "string" },
                      description: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    setRoutine(result);
    setGenerating(false);
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <Sparkles className="w-5 h-5 text-accent absolute -top-1 -right-1 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground">Building your {positionLabel} warm-up...</p>
      </div>
    );
  }

  // Default view: show position info + generate button
  if (!routine) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-br from-orange-500/15 to-red-500/5 border border-orange-500/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Timer className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">10-Min Warm-Up</h3>
              <p className="text-xs text-muted-foreground">
                Position-specific for {positionLabel}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Get a dynamic warm-up routine tailored to your position. Includes activation, 
            targeted stretches, and light {positionLabel.toLowerCase()}-specific drills 
            to get you game-ready in 10 minutes.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {PHASES.map((p) => (
              <span
                key={p.label}
                className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded-lg"
              >
                {p.icon} {p.label}
              </span>
            ))}
          </div>
          <Button
            className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
            onClick={generate}
          >
            <Sparkles className="w-4 h-4 mr-2" /> Generate My Warm-Up
          </Button>
        </div>

        {/* Pre-defined quick reference */}
        <div className="rounded-xl bg-card border border-border p-4">
          <h4 className="font-heading font-bold text-xs tracking-wider uppercase text-muted-foreground mb-3">
            {positionLabel} Focus &mdash; {warmup.focus}
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Dynamic Stretches</p>
              <div className="space-y-1">
                {warmup.stretches.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-primary">•</span>
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">({s.duration})</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Position Drills</p>
              <div className="space-y-1">
                {warmup.drills.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-accent">•</span>
                    <span className="font-medium">{d.name}</span>
                    <span className="text-muted-foreground">({d.duration})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generated routine view
  return (
    <div className="space-y-4">
      <TutorialModal
        open={!!tutorialItem}
        onClose={() => setTutorialItem(null)}
        item={tutorialItem}
        context={`This is a warm-up exercise for a ${positionLabel}. It's part of a 10-minute pre-training warm-up routine.`}
        triggerLabel={tutorialItem?.name || "Tutorial"}
      />

      <div className="rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/5 border border-orange-500/20 p-5">
        <h3 className="font-heading font-bold text-lg">{routine.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{routine.focus}</p>
        <div className="flex items-center gap-2 mt-2">
          <Timer className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-orange-400 font-medium">10-minute routine</span>
        </div>
      </div>

      {routine.phases?.map((phase, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl bg-card border border-border p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <span className="text-sm">{i === 0 ? "🔥" : i === 1 ? "🧘" : "⚽"}</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm">{phase.phase_name}</h4>
              <p className="text-xs text-muted-foreground">{phase.phase_desc}</p>
            </div>
          </div>

          <div className="space-y-2 pl-2">
            {phase.exercises?.map((ex, j) => (
              <div
                key={j}
                className="flex items-start gap-3 pl-3 border-l-2 border-primary/20 py-1"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{j + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{ex.name}</p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="w-3 h-3" /> {ex.duration}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ex.description}</p>
                  <button
                    onClick={() => setTutorialItem(ex)}
                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 mt-1"
                  >
                    <BookOpen className="w-3 h-3" /> How To
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <Button variant="outline" className="w-full" onClick={() => setRoutine(null)}>
        Generate New Warm-Up
      </Button>
    </div>
  );
}