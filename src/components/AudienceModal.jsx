import React, { useEffect, useState } from 'react';
import { OPTION_LABELS } from '../constants';

function generateAudiencePercents(correctIndex, tier, hidden = []) {
  const visible = [0, 1, 2, 3].filter((i) => !hidden.includes(i));
  const result = [0, 0, 0, 0];
  if (visible.length === 0) return result;

  const t = Number(tier) || 1;
  let correctShare;
  if (t <= 5) correctShare = 70 + Math.random() * 15;
  else if (t <= 10) correctShare = 48 + Math.random() * 22;
  else correctShare = 28 + Math.random() * 20;

  const hasCorrect = visible.includes(correctIndex);
  if (!hasCorrect) correctShare = 0;

  const others = visible.filter((i) => i !== correctIndex);
  const remaining = hasCorrect ? 100 - correctShare : 100;
  const weights = others.map(() => Math.random() + 0.12);
  const weightSum = weights.reduce((a, b) => a + b, 0) || 1;

  let allocated = 0;
  others.forEach((idx, j) => {
    if (j === others.length - 1) {
      result[idx] = Math.max(0, Math.round(remaining - allocated));
    } else {
      const value = Math.round((weights[j] / weightSum) * remaining);
      result[idx] = value;
      allocated += value;
    }
  });

  if (hasCorrect) {
    const othersTotal = others.reduce((sum, i) => sum + result[i], 0);
    result[correctIndex] = 100 - othersTotal;
  }

  const sum = result.reduce((a, b) => a + b, 0);
  if (sum !== 100 && visible.length) {
    result[visible[0]] += 100 - sum;
  }
  return result.map((n) => Math.max(0, n));
}

export default function AudienceModal({ open, onClose, question, hiddenOptions = [] }) {
  const [percents, setPercents] = useState([0, 0, 0, 0]);
  const [heights, setHeights] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (!open || !question) return undefined;

    const next = generateAudiencePercents(
      question.answer,
      question.tier ?? question.level ?? 1,
      hiddenOptions
    );
    setPercents(next);
    setHeights([0, 0, 0, 0]);

    const frame = requestAnimationFrame(() => {
      setTimeout(() => setHeights(next), 80);
    });
    return () => cancelAnimationFrame(frame);
  }, [open, question, hiddenOptions]);

  if (!open || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <div className="w-full max-w-3xl rounded-2xl border-2 border-amber-400 bg-slate-950/95 p-8 shadow-[0_0_40px_rgba(245,158,11,0.25)]">
        <div className="mb-6 text-center">
          <p className="text-sm font-bold tracking-[0.3em] text-amber-400">LIFELINE</p>
          <h2 className="mt-1 text-3xl font-black">問現場觀眾</h2>
        </div>

        <div className="flex h-72 items-end justify-around gap-4 px-6">
          {OPTION_LABELS.map((label, idx) => {
            const hidden = hiddenOptions.includes(idx);
            return (
              <div key={label} className="flex h-full w-24 flex-col items-center justify-end">
                <span className="mb-2 text-xl font-black text-amber-300">
                  {hidden ? '—' : `${percents[idx]}%`}
                </span>
                <div className="flex h-56 w-16 items-end overflow-hidden rounded-sm border border-blue-900/80 bg-slate-900/80">
                  <div
                    className="poll-bar"
                    style={{ height: hidden ? '0%' : `${heights[idx]}%` }}
                  />
                </div>
                <span className="mt-3 text-2xl font-black text-white">{label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-amber-400 bg-blue-950 px-8 py-2 font-bold tracking-widest text-amber-200 hover:bg-blue-900"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
