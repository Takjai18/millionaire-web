export const STORAGE_KEYS = {
  questions: 'millionaire_questions',
  settings: 'millionaire_settings',
};

/** 香港版《百萬富翁》經典 15 關獎金樹；保證線在第 5 及第 10 題。 */
export const CLASSIC_LADDER = [
  { level: 1, amount: '$1,000', isSafe: false },
  { level: 2, amount: '$2,000', isSafe: false },
  { level: 3, amount: '$3,000', isSafe: false },
  { level: 4, amount: '$5,000', isSafe: false },
  { level: 5, amount: '$10,000', isSafe: true },
  { level: 6, amount: '$20,000', isSafe: false },
  { level: 7, amount: '$40,000', isSafe: false },
  { level: 8, amount: '$80,000', isSafe: false },
  { level: 9, amount: '$150,000', isSafe: false },
  { level: 10, amount: '$250,000', isSafe: true },
  { level: 11, amount: '$500,000', isSafe: false },
  { level: 12, amount: '$1,000,000', isSafe: false },
  { level: 13, amount: '$1,500,000', isSafe: false },
  { level: 14, amount: '$2,000,000', isSafe: false },
  { level: 15, amount: '$3,000,000', isSafe: true },
];

export const DEFAULT_SETTINGS = {
  mode: 'classic',
  questionCount: 15,
  ladder: CLASSIC_LADDER,
};

export const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function blankQuestion(tier = 1) {
  return {
    id: Date.now(),
    tier: Math.min(15, Math.max(1, Number(tier) || 1)),
    question: '',
    options: ['', '', '', ''],
    answer: 0,
  };
}

export function resizeLadder(ladder, count) {
  const next = [];
  for (let i = 0; i < count; i += 1) {
    if (ladder[i]) {
      next.push({ ...ladder[i], level: i + 1 });
    } else if (CLASSIC_LADDER[i]) {
      next.push({ ...CLASSIC_LADDER[i], level: i + 1 });
    } else {
      next.push({
        level: i + 1,
        amount: `第 ${i + 1} 關`,
        isSafe: i === count - 1,
      });
    }
  }
  return next;
}

export function getDropAmount(ladder, failAtIndex) {
  for (let i = failAtIndex - 1; i >= 0; i -= 1) {
    if (ladder[i]?.isSafe) return ladder[i].amount;
  }
  return '$0';
}

export function getWalkAwayAmount(ladder, currentIdx) {
  if (currentIdx <= 0) return '$0';
  return ladder[currentIdx - 1]?.amount ?? '$0';
}
