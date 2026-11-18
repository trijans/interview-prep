/** Shared content types. A future backend can import these to stay in sync with the UI. */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type CompanyCode = 'G' | 'A' | 'M' | 'MS' | 'AP' | 'B';

export interface Problem {
  /** Stable id. LeetCode number for coding problems, 'ai-…' slug for ML coding. */
  id: string;
  title: string;
  /** LeetCode slug, when the problem lives on LeetCode. */
  leetcodeSlug?: string;
  difficulty: Difficulty;
  /** Pattern (coding) or topic (ML coding). */
  pattern: string;
  companies: CompanyCode[];
  summary?: string;
  timeComplexity: string;
  spaceComplexity: string;
  /** Progressive hints, revealed one at a time. */
  hints: string[];
}

export interface Flashcard { q: string; a: string }
export interface FlashcardTopic { name: string; cards: Flashcard[] }
export interface FlashcardDeck { id: 'swe' | 'ai'; name: string; topics: FlashcardTopic[] }

export interface BehavioralCategory { name: string; questions: string[] }

export interface Pattern { name: string; signal: string; template: string; problems: string[] }

export type ComponentType = 'client' | 'lb' | 'service' | 'cache' | 'db' | 'queue' | 'storage' | 'cdn' | 'worker' | 'model';
export interface DesignNode { label: string; type: ComponentType; x: number; y: number; info: string }
export interface FlowStep { from: string; to: string; text: string }
export interface Flow { name: string; steps: FlowStep[] }
export interface Design {
  id: string;
  name: string;
  track: 'swe' | 'ai';
  nodes: Record<string, DesignNode>;
  edges: [string, string][];
  flows: Flow[];
  requirements: { functional: string[]; nonFunctional: string[] };
  estimates: string[];
  api: string[];
  deepDives: { title: string; body: string }[];
  /** Optional interactive extra shown under the design. */
  extra?: 'token-bucket';
}

export interface Concept { title: string; body: string }
