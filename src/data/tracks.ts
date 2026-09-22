export type TrackId = 'ruby' | 'rails' | 'leetcode';

export interface Track {
  id: TrackId;
  name: string;
  tagline: string;
  /** What someone can do after finishing it — the promise, not the syllabus. */
  outcome: string;
  accent: string;
}

export const TRACKS: Track[] = [
  {
    id: 'ruby',
    name: 'Ruby',
    tagline: 'The language, from blocks to metaprogramming',
    outcome: 'Read any Ruby codebase and know why it was written that way.',
    accent: 'var(--down)',
  },
  {
    id: 'rails',
    name: 'Ruby on Rails',
    tagline: 'The framework, and the conventions behind it',
    outcome: 'Ship a Rails app you would be willing to maintain.',
    accent: 'var(--amber)',
  },
  {
    id: 'leetcode',
    name: 'Algorithms',
    tagline: 'Interview problems, worked until the pattern is obvious',
    outcome: 'Recognise the shape of a problem before you start typing.',
    accent: 'var(--accent)',
  },
];

export const trackById = (id: string) => TRACKS.find((t) => t.id === id);
