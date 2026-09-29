// Curated offline questions. Translate presentation only; answer indices and entry IDs are stable.
export type QuizQuestion = {
  answers: string[];
  correct: number;
  entryId: string;
  prompt: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    entryId: "battleship",
    prompt: "A mechanic asks for a battleship. What are they probably hanging?",
    answers: ["An old-work metal box", "A cable tray", "A disconnect"],
    correct: 0,
  },
  {
    entryId: "smurf-tube",
    prompt: "What is the proper name for smurf tube?",
    answers: ["FMC", "ENT", "RMC"],
    correct: 1,
  },
  {
    entryId: "ticker",
    prompt: "Which tool might your crew call a ticker or beep stick?",
    answers: ["Clamp meter", "Circuit tracer", "Non-contact voltage tester"],
    correct: 2,
  },
  {
    entryId: "dogleg",
    prompt: "What does a dogleg describe?",
    answers: ["A twisted offset", "A long sweep", "A four-point saddle"],
    correct: 0,
  },
];


