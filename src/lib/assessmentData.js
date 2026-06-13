export const PILLARS = [
  {
    key: "physical",
    label: "Physical",
    icon: "💪",
    color: "from-red-500/20 to-red-600/5 border-red-500/20",
    questions: [
      {
        id: "fitness_level",
        text: "How would you rate your current fitness level?",
        type: "scale",
        options: [
          { value: 1, label: "Just starting" },
          { value: 2, label: "Some activity" },
          { value: 3, label: "Moderately fit" },
          { value: 4, label: "Very fit" },
          { value: 5, label: "Elite athlete" },
        ],
      },
      {
        id: "exercise_frequency",
        text: "How many days per week do you exercise?",
        type: "scale",
        options: [
          { value: 1, label: "0-1 days" },
          { value: 2, label: "2 days" },
          { value: 3, label: "3-4 days" },
          { value: 4, label: "5 days" },
          { value: 5, label: "6-7 days" },
        ],
      },
      {
        id: "speed_self",
        text: "How fast do you think you are compared to teammates?",
        type: "scale",
        options: [
          { value: 1, label: "Slowest" },
          { value: 2, label: "Below average" },
          { value: 3, label: "Average" },
          { value: 4, label: "Above average" },
          { value: 5, label: "Fastest" },
        ],
      },
      {
        id: "endurance",
        text: "Can you play a full 90-minute match without getting too tired?",
        type: "scale",
        options: [
          { value: 1, label: "Can't do 30 min" },
          { value: 2, label: "Struggle at 45 min" },
          { value: 3, label: "Manage 60-70 min" },
          { value: 4, label: "Okay for 90 min" },
          { value: 5, label: "Full 90+ easily" },
        ],
      },
      {
        id: "strength",
        text: "How confident are you in physical duels (shoulder-to-shoulder, headers)?",
        type: "scale",
        options: [
          { value: 1, label: "Get pushed off easily" },
          { value: 2, label: "Struggle sometimes" },
          { value: 3, label: "Hold my own" },
          { value: 4, label: "Usually win" },
          { value: 5, label: "Dominant" },
        ],
      },
      {
        id: "injuries",
        text: "Do you have any current injuries or pain that limits you?",
        type: "single",
        options: [
          { value: 1, label: "Yes, major injury", score: 1 },
          { value: 2, label: "Yes, some nagging pain", score: 2 },
          { value: 3, label: "Minor tightness occasionally", score: 3 },
          { value: 4, label: "Very rarely", score: 4 },
          { value: 5, label: "No, I feel great", score: 5 },
        ],
      },
    ],
  },
  {
    key: "technical",
    label: "Technical",
    icon: "⚽",
    color: "from-green-500/20 to-green-600/5 border-green-500/20",
    questions: [
      {
        id: "first_touch",
        text: "How clean is your first touch when receiving a pass?",
        type: "scale",
        options: [
          { value: 1, label: "It bounces away often" },
          { value: 2, label: "Inconsistent" },
          { value: 3, label: "Pretty reliable" },
          { value: 4, label: "Very clean" },
          { value: 5, label: "Always under control" },
        ],
      },
      {
        id: "passing_accuracy",
        text: "How accurate is your passing over 15+ yards?",
        type: "scale",
        options: [
          { value: 1, label: "Miss often" },
          { value: 2, label: "About half hit" },
          { value: 3, label: "Most find target" },
          { value: 4, label: "Very accurate" },
          { value: 5, label: "Pinpoint" },
        ],
      },
      {
        id: "dribbling",
        text: "How comfortable are you dribbling past defenders?",
        type: "scale",
        options: [
          { value: 1, label: "I avoid it" },
          { value: 2, label: "Try but lose it" },
          { value: 3, label: "Can beat some" },
          { value: 4, label: "Often successful" },
          { value: 5, label: "My strength" },
        ],
      },
      {
        id: "shooting",
        text: "How good is your finishing in front of goal?",
        type: "scale",
        options: [
          { value: 1, label: "Rarely score" },
          { value: 2, label: "Hit target sometimes" },
          { value: 3, label: "Decent finisher" },
          { value: 4, label: "Clinical" },
          { value: 5, label: "Natural scorer" },
        ],
      },
      {
        id: "weak_foot",
        text: "How comfortable are you using your weak foot?",
        type: "scale",
        options: [
          { value: 1, label: "Never use it" },
          { value: 2, label: "Only for simple passes" },
          { value: 3, label: "Can pass and shoot" },
          { value: 4, label: "Quite comfortable" },
          { value: 5, label: "Almost two-footed" },
        ],
      },
    ],
  },
  {
    key: "tactical",
    label: "Tactical",
    icon: "📋",
    color: "from-orange-500/20 to-orange-600/5 border-orange-500/20",
    questions: [
      {
        id: "game_understanding",
        text: "Do you understand different formations and your role in them?",
        type: "scale",
        options: [
          { value: 1, label: "Not at all" },
          { value: 2, label: "Know the basics" },
          { value: 3, label: "Understand most" },
          { value: 4, label: "Good understanding" },
          { value: 5, label: "I read the game well" },
        ],
      },
      {
        id: "positioning",
        text: "Do you know where to be on the field in different phases (attack, defend, transition)?",
        type: "scale",
        options: [
          { value: 1, label: "I get confused" },
          { value: 2, label: "Sometimes lost" },
          { value: 3, label: "Usually in position" },
          { value: 4, label: "Rarely out of place" },
          { value: 5, label: "Always where I should be" },
        ],
      },
      {
        id: "decision_making",
        text: "How good are your decisions under pressure?",
        type: "scale",
        options: [
          { value: 1, label: "I panic" },
          { value: 2, label: "Often make wrong choice" },
          { value: 3, label: "Decent decisions" },
          { value: 4, label: "Usually smart" },
          { value: 5, label: "Calm and correct" },
        ],
      },
      {
        id: "watching_pros",
        text: "How often do you watch pro soccer and analyze players in your position?",
        type: "scale",
        options: [
          { value: 1, label: "Never" },
          { value: 2, label: "Rarely" },
          { value: 3, label: "Sometimes" },
          { value: 4, label: "Often" },
          { value: 5, label: "All the time" },
        ],
      },
    ],
  },
  {
    key: "mental",
    label: "Mental",
    icon: "🧠",
    color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
    questions: [
      {
        id: "confidence",
        text: "How confident are you before a match?",
        type: "scale",
        options: [
          { value: 1, label: "Very nervous" },
          { value: 2, label: "Somewhat anxious" },
          { value: 3, label: "Neutral" },
          { value: 4, label: "Fairly confident" },
          { value: 5, label: "Extremely confident" },
        ],
      },
      {
        id: "mistake_recovery",
        text: "How quickly do you recover after making a mistake?",
        type: "scale",
        options: [
          { value: 1, label: "It ruins my game" },
          { value: 2, label: "Takes a while" },
          { value: 3, label: "Shake it off eventually" },
          { value: 4, label: "Reset quickly" },
          { value: 5, label: "Next play mentality" },
        ],
      },
      {
        id: "focus",
        text: "Can you stay focused for a full 90 minutes?",
        type: "scale",
        options: [
          { value: 1, label: "I drift off a lot" },
          { value: 2, label: "Lose focus sometimes" },
          { value: 3, label: "Mostly focused" },
          { value: 4, label: "Very locked in" },
          { value: 5, label: "Laser focus" },
        ],
      },
      {
        id: "pressure",
        text: "How do you handle high-pressure situations (PK, last-minute play)?",
        type: "scale",
        options: [
          { value: 1, label: "I crumble" },
          { value: 2, label: "Get very tense" },
          { value: 3, label: "I manage okay" },
          { value: 4, label: "I step up" },
          { value: 5, label: "I thrive on it" },
        ],
      },
    ],
  },
  {
    key: "nutrition",
    label: "Nutrition",
    icon: "🍎",
    color: "from-teal-500/20 to-teal-600/5 border-teal-500/20",
    questions: [
      {
        id: "eating_habits",
        text: "How would you describe your daily eating habits?",
        type: "single",
        options: [
          { value: 1, label: "Lots of junk food", score: 1 },
          { value: 2, label: "Mix of healthy and junk", score: 2 },
          { value: 3, label: "Mostly balanced meals", score: 3 },
          { value: 4, label: "Eat clean most days", score: 4 },
          { value: 5, label: "Strict athlete diet", score: 5 },
        ],
      },
      {
        id: "water_intake",
        text: "How much water do you drink daily?",
        type: "scale",
        options: [
          { value: 1, label: "Barely any" },
          { value: 2, label: "1-2 glasses" },
          { value: 3, label: "3-4 glasses" },
          { value: 4, label: "5-6 glasses" },
          { value: 5, label: "7+ glasses" },
        ],
      },
      {
        id: "pre_game_meal",
        text: "Do you eat properly before games/training?",
        type: "scale",
        options: [
          { value: 1, label: "I eat whatever" },
          { value: 2, label: "Sometimes think about it" },
          { value: 3, label: "Try to eat well" },
          { value: 4, label: "Usually prep properly" },
          { value: 5, label: "Always plan my fuel" },
        ],
      },
      {
        id: "recovery_nutrition",
        text: "Do you eat/drink anything specific for recovery after exercise?",
        type: "scale",
        options: [
          { value: 1, label: "Never" },
          { value: 2, label: "Rarely" },
          { value: 3, label: "Sometimes" },
          { value: 4, label: "Usually" },
          { value: 5, label: "Always have recovery fuel" },
        ],
      },
    ],
  },
];

export function calculateScores(answers) {
  const scores = {};
  PILLARS.forEach((pillar) => {
    const pillarAnswers = answers[pillar.key] || {};
    const questions = pillar.questions;
    let total = 0;
    let count = 0;
    questions.forEach((q) => {
      const val = pillarAnswers[q.id];
      if (val != null) {
        total += typeof val === "number" ? val : (parseInt(val) || 0);
        count++;
      }
    });
    scores[pillar.key] = count > 0 ? Math.round((total / (count * 5)) * 100) : 0;
  });
  return scores;
}

export function buildAssessmentPrompt(profile, scores, answers) {
  const positionLabel = {
    goalkeeper: "Goalkeeper", center_back: "Center Back", full_back: "Full Back",
    defensive_mid: "Defensive Midfielder", central_mid: "Central Midfielder",
    attacking_mid: "Attacking Midfielder", winger: "Winger", striker: "Striker"
  }[profile.position] || profile.position;

  let prompt = `Create a comprehensive soccer development plan for a ${profile.age}-year-old ${positionLabel} at ${profile.skill_level} level.

ASSESSMENT RESULTS (scores out of 100):
- Physical: ${scores.physical}/100
- Technical: ${scores.technical}/100  
- Tactical: ${scores.tactical}/100
- Mental: ${scores.mental}/100
- Nutrition: ${scores.nutrition}/100

Raw answers: ${JSON.stringify(answers)}

Create the following plans specifically tailored to their scores and level (lower scores need more foundational work, higher scores need advanced refinement):

1. PHYSICAL PLAN: Weekly training schedule with specific drills for speed, strength, endurance, and agility
2. TECHNICAL PLAN: Skill development focus areas with drills for first touch, passing, dribbling, shooting, weak foot
3. TACTICAL PLAN: Game understanding exercises, positioning work, and decision-making drills
4. MENTAL PLAN: Confidence building, focus training, pressure management, and mistake recovery routines
5. NUTRITION PLAN: Daily meal guidance, hydration targets, pre/post game fueling

Also provide:
- An IDP (Individual Development Plan) summary — a focused 1-paragraph statement of their top 3 development priorities
- An LTDP (Long-Term Development Plan) vision — a 1-paragraph vision for where they can be in 12-24 months

Be specific and actionable. Make drills age-appropriate. Include time estimates.`;

  return prompt;
}