import React from 'react';

export default function MoneyLadder({ ladder, currentIdx }) {
  return (
    <aside className="flex h-full flex-col justify-between rounded-xl border border-blue-900/60 bg-slate-950/70 p-3">
      {[...ladder].reverse().map((item) => {
        const idx = item.level - 1;
        const isCurrent = currentIdx === idx;
        const isPassed = currentIdx > idx;
        let rowClass = 'text-orange-400/80';
        if (isCurrent) rowClass = 'ladder-row is-current px-3 py-1';
        else if (isPassed) rowClass = 'text-amber-200/70 font-medium';
        else if (item.isSafe) rowClass = 'text-white font-bold';

        return (
          <div
            key={item.level}
            className={`flex items-center justify-between px-2 py-0.5 text-sm ${rowClass}`}
          >
            <span className="w-6 tabular-nums">{item.level}</span>
            <span className="tracking-wide">{item.amount}</span>
          </div>
        );
      })}
    </aside>
  );
}
