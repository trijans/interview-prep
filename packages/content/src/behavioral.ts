import type { BehavioralCategory } from './types';

export const BEHAVIORAL: BehavioralCategory[] = [
  {
    "name": "Introduction",
    "questions": [
      "Tell me about yourself.",
      "Why do you want to work here?",
      "Why are you leaving your current role?"
    ]
  },
  {
    "name": "Ownership & Leadership",
    "questions": [
      "Tell me about a time you took ownership of something outside your responsibilities.",
      "Describe a project you led from start to finish.",
      "Tell me about a time you made a decision without complete information."
    ]
  },
  {
    "name": "Conflict & Collaboration",
    "questions": [
      "Tell me about a time you disagreed with your manager.",
      "Describe a conflict with a teammate and how you resolved it.",
      "Tell me about a time you influenced others without having authority."
    ]
  },
  {
    "name": "Failure & Growth",
    "questions": [
      "Tell me about a time you failed.",
      "Describe the hardest feedback you have received and what you did with it.",
      "Tell me about a mistake you made that affected users or customers."
    ]
  },
  {
    "name": "Delivery & Pressure",
    "questions": [
      "Tell me about a time you missed a deadline.",
      "Describe a time you had to juggle competing priorities.",
      "Tell me about a time you had to deliver with very limited resources."
    ]
  },
  {
    "name": "Impact & Customer",
    "questions": [
      "What is the most impactful project you have worked on?",
      "Tell me about a time you went above and beyond for a customer.",
      "Tell me about a time you used data to change a decision."
    ]
  },
  {
    "name": "AI & ML projects",
    "questions": [
      "Tell me about a model or AI feature you shipped to production. How did you measure its impact?",
      "Describe a time a model looked good offline but disappointed in production. What did you do?",
      "Tell me about a time you decided not to use machine learning or an LLM for a problem.",
      "Describe how you explained a model’s behavior or limitations to non-technical stakeholders.",
      "Tell me about a time you found a fairness, privacy or safety issue in an AI system. How did you handle it?"
    ]
  },
  {
    "name": "Innovation & Simplification",
    "questions": [
      "Tell me about a time you improved a process or system.",
      "Describe a creative solution to a hard technical problem.",
      "Tell me about a time you simplified something complex."
    ]
  }
];
