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
        {id: "pataka", title: "Pataka", notes: "Flat hand used for many symbolic gestures.", practiceSteps: ["Hold fingers straight and together","Use from the wrist"], animationHint: "mudra_pataka"},
        {id: "tripataka", title: "Tripataka", notes: "Variation with ring finger bent.", practiceSteps: [], animationHint: "mudra_tripataka"}
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
