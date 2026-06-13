// ─── Equipment-to-household-alternatives mapping ───
export const EQUIPMENT_ALTERNATIVES = {
  // Balls & training gear
  "Soccer Ball (Size 5)": [
    "A tightly rolled-up towel or t-shirt bundle",
    "Any round ball (basketball, volleyball) for basic drills",
    "A plastic bottle filled with sand for weight + ball feel",
  ],
  "Cone Set (10+)": [
    "Water bottles or plastic cups",
    "Shoes placed as markers",
    "Rolled-up socks or small rocks",
    "Chalk marks on pavement",
  ],
  "Agility Ladder": [
    "Chalk lines drawn on pavement (space them 15 inches apart)",
    "Tape strips on floor (masking/duct tape)",
    "Sticks or broom handles laid parallel",
    "Jump rope laid in zig-zag pattern",
  ],
  "Speed Hurdles": [
    "Stacked books or shoeboxes (start low!)",
    "A broom balanced between two chairs",
    "Jump over a rolled-up yoga mat or towel",
    "PVC pipes on small cones",
  ],
  "Resistance Bands": [
    "A towel held taut between hands for resistance",
    "Bodyweight-only variations (slower tempo = more resistance)",
    "An old bike inner tube (cut for resistance)",
    "Partner provides manual resistance by holding your limbs",
  ],
  "Training Bib/Pinnie": [
    "Any different-colored t-shirt",
    "Tape a colored paper to your shirt",
    "Wear a hoodie vs no hoodie to differentiate teams",
  ],
  "Ball Pump + Needles": [
    "Bike pump with a ball needle adapter",
    "Any local sports store will pump for free",
  ],

  // Footwear
  "Cleats (FG)": [
    "Running shoes on grass (less traction but works for drills)",
    "Turf shoes or indoor shoes — slightly less grip but usable",
    "Any athletic shoe with decent tread",
    "Barefoot on soft grass for touch work",
  ],
  "Turf Shoes": ["Running shoes or indoor shoes", "Flat-soled sneakers with grip"],
  "Indoor Shoes": ["Clean-soled running shoes", "Flat sneakers (non-marking sole)"],
  "Running Shoes": ["Any comfortable athletic shoe", "Sneakers with cushioning"],
  "Slides/Flip-flops": ["Any sandal or slip-on", "Go barefoot indoors"],

  // Protection
  "Shin Guards": [
    "Thick cardboard cut to size + tape around your shin",
    "Magazine or newspaper folded and taped to shin (old-school trick)",
    "Sweatbands or thick socks layered up",
    "Plastic from a cut gallon jug (softened edges)",
  ],
  "Goalkeeper Gloves": [
    "Gardening gloves with grip",
    "Receiver gloves (football)",
    "Bare hands — focus on catching technique over grip",
  ],
  "Mouthguard": ["Boil-and-bite from any pharmacy ($5)", "Not essential for non-contact drills"],
  "Ankle Support": ["Tape your ankle with athletic tape", "Wear high-top shoes for extra support"],
  "Compression Sleeves": ["Long socks pulled up tight", "Any snug-fitting sleeve garment"],

  // Recovery
  "Foam Roller": [
    "A rolling pin wrapped in a towel",
    "A tightly rolled yoga mat",
    "A PVC pipe with a towel wrapped around it",
    "A tennis ball or lacrosse ball for trigger points",
  ],
  "Massage Ball": [
    "A tennis ball, lacrosse ball, or golf ball",
    "A rolled-up sock",
    "The heel of your hand or your knuckles",
  ],
  "Ice Pack": [
    "A bag of frozen vegetables (peas/corn)",
    "Ice cubes in a ziplock bag wrapped in a thin towel",
    "A cold, wet towel (replace when it warms up)",
  ],
  "Resistance Bands (Recovery)": [
    "A towel or bedsheet for assisted stretches",
    "A belt or strap for hamstring/quad stretches",
    "Bodyweight stretches with longer holds",
  ],
  "Yoga Mat": [
    "A thick towel or blanket folded double",
    "Carpeted floor (already cushioned)",
    "A rug or carpet square",
    "Grass outside (free + comfortable)",
  ],

  // Technology
  "Fitness Tracker/Watch": [
    "Phone stopwatch + manually count reps",
    "Count steps with your phone in your pocket",
    "Use a wall clock or kitchen timer",
  ],
  "Heart Rate Monitor": [
    "Talk test: can talk = moderate; can't = intense",
    "Count your pulse on your wrist/neck for 15 seconds × 4",
    "Perceived exertion scale (1-10 how hard it feels)",
  ],
  "GPS Tracker": [
    "Measure distance with Google Maps before you run",
    "Count laps on a known field (1 soccer field lap ≈ 300m)",
    "Use a running app on your phone",
  ],
  "Training App Subscription": [
    "Free YouTube soccer training channels",
    "Free workout timer apps",
    "This app! Everything you need is here",
  ],

  // Nutrition
  "Water Bottle (32oz+)": [
    "Any large bottle (reuse a soda bottle, milk jug)",
    "Multiple smaller cups — drink more frequently",
    "Mark lines on a regular bottle with a marker",
  ],
  "Protein Shaker": [
    "Any jar with a tight lid (mason jar)",
    "A water bottle — shake harder and longer",
    "Blend in a regular blender, pour into any cup",
  ],
  "Snack Container": [
    "Any small tupperware or ziplock bag",
    "A reused yogurt container with lid",
    "Wrap snacks in foil or plastic wrap",
  ],
  "Electrolyte Tablets": [
    "A pinch of salt + squeeze of lemon in water",
    "Coconut water (natural electrolytes)",
    "Diluted sports drink or fruit juice",
    "A banana + water (natural potassium + hydration)",
  ],
};

// ─── What equipment each drill category typically needs ───
export const DRILL_EQUIPMENT = {
  // Technical drills
  "Wall Passes": ["Soccer Ball (Size 5)", "Cleats (FG)"],
  "Cone Dribbling": ["Soccer Ball (Size 5)", "Cone Set (10+)", "Cleats (FG)"],
  "Juggling Challenge": ["Soccer Ball (Size 5)"],
  "First Touch Drill": ["Soccer Ball (Size 5)", "Cone Set (10+)", "Cleats (FG)"],
  "Skill Moves Combo": ["Soccer Ball (Size 5)", "Cone Set (10+)"],
  "Weak Foot Training": ["Soccer Ball (Size 5)", "Cone Set (10+)"],
  "Under Pressure": ["Soccer Ball (Size 5)", "Cone Set (10+)", "Training Bib/Pinnie"],
  "Advanced Finishing": ["Soccer Ball (Size 5)", "Cone Set (10+)"],
  "Combination Play": ["Soccer Ball (Size 5)", "Cone Set (10+)", "Training Bib/Pinnie"],
  "Match Simulation": ["Soccer Ball (Size 5)", "Cone Set (10+)", "Training Bib/Pinnie"],
  "Creative Play": ["Soccer Ball (Size 5)"],
  "Position-Specific Mastery": ["Soccer Ball (Size 5)", "Cone Set (10+)"],

  // Physical drills
  "Agility Ladder": ["Agility Ladder"],
  "Sprint Intervals": ["Cone Set (10+)"],
  "Core Circuit": ["Yoga Mat"],
  "HIIT Pitch Workout": ["Cone Set (10+)", "Water Bottle (32oz+)"],
  "Speed & Agility": ["Agility Ladder", "Cone Set (10+)"],
  "Strength Circuit": ["Resistance Bands", "Yoga Mat"],
  "Power Training": ["Speed Hurdles", "Cone Set (10+)"],
  "Endurance Run": ["Running Shoes", "Water Bottle (32oz+)"],
  "SAQ Complex": ["Agility Ladder", "Speed Hurdles", "Cone Set (10+)"],
  "Match Fitness Protocol": ["Cone Set (10+)", "Water Bottle (32oz+)", "Fitness Tracker/Watch"],
  "Explosive Power": ["Speed Hurdles", "Resistance Bands"],
  "Recovery Session": ["Foam Roller", "Yoga Mat", "Resistance Bands (Recovery)"],

  // Tactical drills
  "Position Awareness": [],
  "Formation Basics": [],
  "Video Analysis": [],
  "Set Piece Practice": ["Soccer Ball (Size 5)", "Cone Set (10+)"],
  "Game Reading": [],
  "Pressing Patterns": ["Soccer Ball (Size 5)", "Cone Set (10+)", "Training Bib/Pinnie"],
  "Counter-Attack Analysis": [],
  "Leadership Play": ["Soccer Ball (Size 5)", "Cone Set (10+)"],
};

// ─── Get owned equipment items from PlayerEquipment record ───
export function getOwnedItems(equipmentRecord) {
  if (!equipmentRecord?.items) return [];
  return equipmentRecord.items.filter((item) => item.owned).map((item) => item.name);
}

// ─── Get missing equipment + alternatives for a drill ───
export function getDrillEquipmentStatus(drillName, ownedItems) {
  const needed = DRILL_EQUIPMENT[drillName] || [];
  const owned = [];
  const missing = [];

  needed.forEach((itemName) => {
    if (ownedItems.includes(itemName)) {
      owned.push(itemName);
    } else {
      const alternatives = EQUIPMENT_ALTERNATIVES[itemName] || ["Try the drill anyway — you can still practice the movement"];
      missing.push({ name: itemName, alternatives });
    }
  });

  return { needed, owned, missing, hasAll: missing.length === 0 };
}

// ─── Build equipment context string for AI prompts ───
export function buildEquipmentContext(ownedItems) {
  if (ownedItems.length === 0) return "The player has no specialized equipment.";
  return `The player owns: ${ownedItems.join(", ")}.`;
}