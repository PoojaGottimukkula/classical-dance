// Vercel serverless function: returns the syllabus JSON
const SYLLABUS = {
  title: "Bharatanatyam Syllabus (Refined Prototype)",
  description: "Structured theory and practical lessons for learners, from foundations to pro-level repertoire.",
  tiers: [
    {
      id: "foundations",
      title: "Foundations (Angika Suddhi)",
      summary: "Posture, Araimandi (half-sitting), Muzhumandi (full sitting), body alignment and balance.",
      lessons: [
        {
          id: "araimandi",
          title: "Araimandi — Basic Posture",
          notes: "Araimandi is a fundamental half-sitting posture with knees turned out and a straight spine. Keep weight evenly distributed and chin neutral.",
          practiceSteps: [
            "Stand with feet turned out",
            "Bend knees to form a half-sitting position",
            "Keep heels on the ground and weight centered",
            "Hold for 30–60 seconds, repeat 5 times"
          ],
          animationHint: "araimandi_pose"
        },
        {
          id: "muzhumandi",
          title: "Muzhumandi — Full Sitting",
          notes: "Muzhumandi is a deeper squat used in several adavus and performances. Maintain alignment and breathing.",
          practiceSteps: ["Slow descent into full squat","Keep knees apart and back straight","Practice rising and settling smoothly"],
          animationHint: "muzhumandi_pose"
        }
      ]
    },
    {
      id: "adavus",
      title: "Adavu Syllabus",
      summary: "Basic coordinated footwork sequences grouped by 'adavu' types and tempos (kalam).",
      lessons: [
        {id: "tala_adavu", title: "Tala Adavu", notes: "Basic stamping patterns to keep tala (rhythm).", practiceSteps: ["Count tala","Start slowly at 1 kalam","Increase tempo"], animationHint: "adavu_basic"},
        {id: "nattadavu", title: "Natta Adavu", notes: "Combinations moving across the stage.", practiceSteps: ["Mark steps","Sync with hand gestures"], animationHint: "adavu_natta"}
      ]
    },
    {
      id: "mudras",
      title: "Mudra Dictionary",
      summary: "Asamyuta (single-hand) and Samyuta (double-hand) hastas with meanings and common usages.",
      lessons: [
        {id: "pataka", title: "Pataka", notes: "Flat hand with fingers together — base for many gestures.", practiceSteps: ["Hold fingers straight and together","Keep thumb slightly bent"], animationHint: "mudra_pataka"},
        {id: "tripataka", title: "Tripataka", notes: "Pataka with ring finger bent — denotes crown, tree, arrow.", practiceSteps: ["Bend the ring finger while holding others straight"], animationHint: "mudra_tripataka"},
        {id: "ardhapataka", title: "Ardhapataka", notes: "Half-Pataka — little finger bent to form a partial flat hand.", practiceSteps: ["Bend the little finger while keeping other fingers straight"], animationHint: "mudra_ardhapataka"},
        {id: "kartarimukha", title: "Kartarimukha", notes: "Scissor-like hand used for separation, lightning, corner.", practiceSteps: ["Spread index and middle finger like scissors"], animationHint: "mudra_kartarimukha"},
        {id: "mayura", title: "Mayura", notes: "Peacock — ring finger touches thumb creating a beak-like shape.", practiceSteps: ["Touch ring finger tip to thumb"], animationHint: "mudra_mayura"},
        {id: "ardhachandra", title: "Ardhachandra", notes: "Half-moon shape used for moon, crown, or receptacle.", practiceSteps: ["Curve the thumb away from fingers to form a crescent"], animationHint: "mudra_ardhachandra"},
        {id: "arala", title: "Arala", notes: "Bent hand — a gentle bend of index finger to show drinking, picking.", practiceSteps: ["Bend the index finger from the base knuckle"], animationHint: "mudra_arala"},
        {id: "shikhara", title: "Shikhara", notes: "Fist with extended thumb — roof, mountain, or holding objects.", practiceSteps: ["Make a fist and keep thumb extended upright"], animationHint: "mudra_shikhara"},
        {id: "mushti", title: "Mushti", notes: "Closed fist — strength, anger, holding.", practiceSteps: ["Clench a relaxed, firm fist"] , animationHint: "mudra_mushti"},
        {id: "kapitta", title: "Kapitta", notes: "Index and middle finger slightly joined — holding a garland or a flower.", practiceSteps: ["Touch tips of index and middle fingers to thumb lightly"], animationHint: "mudra_kapitta"},
        {id: "katakamukha", title: "Katakamukha", notes: "Three-finger pinch used for holding a bracelet or plucking flowers.", practiceSteps: ["Bring index, middle and thumb together to form a small bowl"], animationHint: "mudra_katakamukha"},
        {id: "suchi", title: "Suchi", notes: "Pointing finger — used for precise indication.", practiceSteps: ["Keep the index finger straight and other fingers closed"], animationHint: "mudra_suchi"},
        {id: "chandrakala", title: "Chandrakala", notes: "Moon's crescent formed by bending the thumb at the base — used for moon, ornament.", practiceSteps: ["Place thumb across the palm creating a crescent gap"], animationHint: "mudra_chandrakala"},
        {id: "padma", title: "Padma (Alapadma)", notes: "Lotus — fingers spread and curved gracefully.", practiceSteps: ["Spread fingers and curl slightly to form a blossom"], animationHint: "mudra_padma"},
        {id: "chatura", title: "Chatura", notes: "Four-fingered shape used for counting or offering.", practiceSteps: ["Extend four fingers together with thumb closed"], animationHint: "mudra_chatura"},
        {id: "bhramara", title: "Bhramara", notes: "Bee — used for small insect or delicate actions.", practiceSteps: ["Touch tip of thumb to tip of middle finger while other fingers curl"], animationHint: "mudra_bhramara"},
        {id: "hamsasya", title: "Hamsasya", notes: "Swan's beak — fine pinching gesture for delicate actions.", practiceSteps: ["Touch tip of thumb to tip of index finger"], animationHint: "mudra_hamsasya"},
        {id: "hamsapaksha", title: "Hamsapaksha", notes: "Swan's wing — used for wings or movement.", practiceSteps: ["Extend little and ring fingers while folding others slightly"], animationHint: "mudra_hamsapaksha"},
        {id: "karkata", title: "Karkata", notes: "Interlocked fingers — used for holding or pulling actions.", practiceSteps: ["Interlock fingers of both hands or curl fingers together"], animationHint: "mudra_karkata"},
        {id: "mrigashirsha", title: "Mrigashirsha", notes: "Deer-head — tip of index and middle finger joined with thumb.", practiceSteps: ["Create a soft hooked shape with index and middle fingers"], animationHint: "mudra_mrigashirsha"},
        {id: "simhamukha", title: "Simhamukha", notes: "Lion face — used for roaring or ferocity.", practiceSteps: ["Open mouth gesture with thumb and fingers forming wide shape"], animationHint: "mudra_simhamukha"},
        {id: "alamkar", title: "Alamkar", notes: "Ornament-holding variations used in decoration gestures.", practiceSteps: ["Practice small decorative finger adjustments"], animationHint: "mudra_alamkar"},
        {id: "srivatsa", title: "Srivatsa", notes: "Conventional decorative variation used in iconography.", practiceSteps: ["Form compound shapes by combining fingers"], animationHint: "mudra_srivatsa"},
        {id: "trishula", title: "Trishula", notes: "Trident-shaped configuration used symbolically.", practiceSteps: ["Form three-pronged shapes using fingers"], animationHint: "mudra_trishula"},
        {id: "kunkuma", title: "Kunkuma", notes: "Applying vermilion — used in worship actions.", practiceSteps: ["Mimic applying a small dot with ring finger"], animationHint: "mudra_kunkuma"},
        {id: "samyuta_example", title: "Example Samyuta (joined) hint", notes: "Double-hand composite shapes are given in the Samyuta section.", practiceSteps: ["Use both hands to form combined gestures"], animationHint: "mudra_samyuta_hint"}
      ]
    },
    {
      id: "abhinaya",
      title: "Abhinaya & Navarasas",
      summary: "Facial expression, eye movements, neck exercises, and the nine rasas used in storytelling.",
      lessons: [
        {id: "navarasa", title: "Navarasa Overview", notes: "The nine emotions: Shringara, Hasya, Karuna, Raudra, Veera, Bhayanaka, Bibhatsa, Adbhuta, Shanta.", practiceSteps: ["Practice each rasa with minimal movement","Record and compare"], animationHint: "expression_idle"}
      ]
    },
    {
      id: "repertoire",
      title: "Repertoire (Margam)",
      summary: "Typical concert structure: Alarippu, Jatiswaram, Shabdam, Varnam, Padam, Tillana.",
      lessons: [
        {id: "alarippu", title: "Alarippu", notes: "Opening invocatory item emphasizing posture and footwork.", practiceSteps: [], animationHint: "alarippu"},
        {id: "tillana", title: "Tillana", notes: "Fast rhythmic finale with strong nritta (pure dance).", practiceSteps: [], animationHint: "tillana"}
      ]
    }
  ]
};

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(SYLLABUS));
}
