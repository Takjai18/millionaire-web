import React from 'react';
import { OPTION_LABELS } from '../constants';

export default function QuestionBox({
  question,
  currentIdx,
  selectedOpt,
  revealed,
  hiddenOptions,
  onSelect,
  onConfirm,
}) {
  if (!question) {
    return (
      <div className="diamond-outer">
        <div className="diamond-inner px-10 py-10 text-center text-slate-400">
          請先在設定中匯入題庫
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="question-rail">
        <div className="diamond-outer">
          <div className="diamond-inner px-12 py-8 text-center">
            <span className="mb-2 block text-sm font-bold tracking-[0.35em] text-amber-400">
              QUESTION {currentIdx + 1}
            </span>
            <p className="text-2xl font-bold leading-snug md:text-3xl">{question.question}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {question.options.map((opt, idx) => {
          const isHidden = hiddenOptions.includes(idx);
          const isSelected = selectedOpt === idx;
          const isCorrect = question.answer === idx;
          let state = '';
          if (isHidden) state = 'is-hidden is-disabled';
          else if (revealed && isCorrect) state = 'is-correct';
          else if (revealed && isSelected && !isCorrect) state = 'is-wrong';
          else if (isSelected) state = 'is-selected';
          if (revealed) state += ' is-disabled';

          return (
            <button
              key={idx}
              type="button"
              disabled={isHidden || revealed}
              onClick={() => onSelect(idx)}
              className={`option-outer ${state}`}
            >
              <div className="option-inner flex min-h-16 items-center gap-3 px-8 py-3 text-left">
                {!isHidden && (
                  <>
                    <span className="text-xl font-black text-amber-400">{OPTION_LABELS[idx]}:</span>
                    <span className="flex-1 text-lg">{opt}</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedOpt !== null && !revealed && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onConfirm}
            className="final-pulse rounded-full bg-amber-500 px-10 py-3 text-lg font-black tracking-[0.2em] text-slate-950"
          >
            最後答案？ FINAL ANSWER
          </button>
        </div>
      )}
    </div>
  );
}
