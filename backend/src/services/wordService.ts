const WORD_POOL = [
  "apple", "banjo", "cactus", "dragon", "easel",
  "flame", "guitar", "hammer", "igloo", "jigsaw",
  "kitten", "ladder", "mushroom", "notebook", "ostrich",
  "puzzle", "rocket", "sunset", "tunnel", "umbrella",
  "volcano", "waffle", "anchor", "basket", "castle",
  "donkey", "engine", "fossil", "gondola", "helmet",
  "island", "jacket", "kettle", "lantern", "mitten",
  "napkin", "orange", "penguin", "quiver", "ribbon",
  "saddle", "turtle", "unicorn", "violin", "wagon",
  "yahtzee", "zebra", "acorn", "beetle", "carrot"
];

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function selectWord(code: string, round: number): string {
  const seed = `${code.toUpperCase()}-${round}`;
  const index = fnv1a(seed) % WORD_POOL.length;
  return WORD_POOL[index];
}

export function listWords(): string[] {
  return [...WORD_POOL];
}
