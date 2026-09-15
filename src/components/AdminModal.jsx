import React, { useEffect, useRef, useState } from 'react';
import initialQuestions from '../data/initialQuestions.json';
import {
  CLASSIC_LADDER,
  OPTION_LABELS,
  blankQuestion,
  resizeLadder,
} from '../constants';

function cloneQuestions(list) {
  return list.map((q) => ({
    ...q,
    options: [...(q.options || ['', '', '', ''])],
  }));
}

function cloneSettings(settings) {
  return {
    ...settings,
    ladder: (settings.ladder || CLASSIC_LADDER).map((row) => ({ ...row })),
  };
}

function normalizeImportedQuestions(raw) {
  if (!Array.isArray(raw)) return null;
  const cleaned = raw
    .map((item, idx) => {
      if (!item || typeof item !== 'object') return null;
      const options = Array.isArray(item.options)
        ? [...item.options, '', '', '', ''].slice(0, 4)
        : ['', '', '', ''];
      const answer = Number(item.answer);
      return {
        id: item.id ?? Date.now() + idx,
        tier: Number(item.tier ?? item.level ?? idx + 1) || idx + 1,
        question: String(item.question ?? ''),
        options,
        answer: Number.isFinite(answer) ? Math.min(3, Math.max(0, answer)) : 0,
      };
    })
    .filter(Boolean);
  return cleaned.length ? cleaned : null;
}

export default function AdminModal({ open, onClose, questions, settings, onSave }) {
  const fileRef = useRef(null);
  const [draftQ, setDraftQ] = useState([]);
  const [draftS, setDraftS] = useState(settings);
  const [form, setForm] = useState(blankQuestion());
  const [editIndex, setEditIndex] = useState(-1);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!open) return;
    setDraftQ(cloneQuestions(questions));
    setDraftS(cloneSettings(settings));
    setForm(blankQuestion((questions?.length || 0) + 1));
    setEditIndex(-1);
    setNotice('');
  }, [open, questions, settings]);

  if (!open) return null;

  const showNotice = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2500);
  };

  const updateFormField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateOption = (idx, value) => {
    setForm((prev) => {
      const options = [...prev.options];
      options[idx] = value;
      return { ...prev, options };
    });
  };

  const resetForm = (tier = draftQ.length + 1) => {
    setForm(blankQuestion(tier));
    setEditIndex(-1);
  };

  const saveFormToDraft = () => {
    if (!form.question.trim() || form.options.some((o) => !String(o).trim())) {
      showNotice('請填寫題目及四個選項。');
      return;
    }
    const payload = {
      ...form,
      id: form.id || Date.now(),
      question: form.question.trim(),
      options: form.options.map((o) => String(o).trim()),
      answer: Number(form.answer) || 0,
      tier: Math.min(15, Math.max(1, Number(form.tier) || draftQ.length + 1)),
    };
    const nextList =
      editIndex >= 0
        ? draftQ.map((q, i) => (i === editIndex ? payload : q))
        : [...draftQ, payload];
    setDraftQ(nextList);
    resetForm(nextList.length + 1);
    showNotice(editIndex >= 0 ? '已更新題目。' : '已新增題目。');
  };

  const startEdit = (idx) => {
    const q = draftQ[idx];
    setEditIndex(idx);
    setForm({
      ...q,
      options: [...q.options, '', '', '', ''].slice(0, 4),
    });
  };

  const deleteQuestion = (idx) => {
    if (!window.confirm('確定刪除此題？')) return;
    setDraftQ((prev) => prev.filter((_, i) => i !== idx));
    if (editIndex === idx) resetForm();
  };

  const exportJson = () => {
    const payload = { questions: draftQ, settings: draftS };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'millionaire-questions.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotice('已匯出 JSON。');
  };

  const importJson = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const list = Array.isArray(parsed)
          ? parsed
          : parsed.questions || parsed.questionBank;
        const cleaned = normalizeImportedQuestions(list);
        if (!cleaned) {
          showNotice('JSON 格式不正確。');
          return;
        }
        setDraftQ(cleaned);
        if (parsed && !Array.isArray(parsed) && parsed.settings) {
          const incoming = parsed.settings;
          const count = Number(incoming.questionCount) || cleaned.length;
          setDraftS({
            mode: incoming.mode === 'custom' ? 'custom' : 'classic',
            questionCount: incoming.mode === 'custom' ? count : 15,
            ladder:
              incoming.mode === 'custom'
                ? resizeLadder(incoming.ladder || CLASSIC_LADDER, count)
                : CLASSIC_LADDER.map((row) => ({ ...row })),
          });
        }
        resetForm(cleaned.length + 1);
        showNotice(`已匯入 ${cleaned.length} 題。`);
      } catch {
        showNotice('無法讀取 JSON 檔。');
      }
    };
    reader.readAsText(file);
  };

  const setMode = (mode) => {
    if (mode === 'classic') {
      setDraftS({
        mode: 'classic',
        questionCount: 15,
        ladder: CLASSIC_LADDER.map((row) => ({ ...row })),
      });
      return;
    }
    const count =
      draftS.mode === 'classic'
        ? 10
        : Math.min(15, Math.max(5, draftS.questionCount || 10));
    setDraftS({
      mode: 'custom',
      questionCount: count,
      ladder: resizeLadder(draftS.ladder, count),
    });
  };

  const setCustomCount = (count) => {
    const n = Math.min(15, Math.max(5, Number(count) || 8));
    setDraftS((prev) => ({
      ...prev,
      mode: 'custom',
      questionCount: n,
      ladder: resizeLadder(prev.ladder, n),
    }));
  };

  const updateLadderRow = (idx, key, value) => {
    setDraftS((prev) => {
      const ladder = prev.ladder.map((row, i) =>
        i === idx ? { ...row, [key]: value } : row
      );
      return { ...prev, ladder };
    });
  };

  const applyAndClose = () => {
    if (!draftQ.length) {
      showNotice('題庫不能為空。');
      return;
    }
    onSave(draftQ, draftS);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border-2 border-amber-400 bg-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
        <header className="flex items-center justify-between border-b border-blue-900/60 px-6 py-4">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-amber-400">HOST CONTROL</p>
            <h2 className="text-2xl font-black">題庫與賽制設定</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700"
          >
            關閉
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-0 overflow-hidden">
          <section className="col-span-5 overflow-y-auto border-r border-slate-800 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-amber-300">題庫（{draftQ.length} 題）</h3>
              <button
                type="button"
                onClick={() => {
                  setDraftQ(cloneQuestions(initialQuestions));
                  resetForm(initialQuestions.length + 1);
                  showNotice('已還原預設題庫。');
                }}
                className="text-xs text-slate-400 underline"
              >
                還原預設
              </button>
            </div>
            <ul className="space-y-2">
              {draftQ.map((q, idx) => (
                <li
                  key={q.id ?? idx}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    editIndex === idx
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-slate-800 bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(idx)}
                      className="flex-1 text-left"
                    >
                      <span className="mr-2 text-amber-400">Q{idx + 1}</span>
                      {q.question || '（空白題目）'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(idx)}
                      className="text-xs text-rose-400"
                    >
                      刪除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="col-span-7 overflow-y-auto p-5">
            <h3 className="mb-3 font-bold text-amber-300">
              {editIndex >= 0 ? `編輯第 ${editIndex + 1} 題` : '新增題目'}
            </h3>
            <label className="mb-3 block text-sm">
              題目
              <textarea
                value={form.question}
                onChange={(e) => updateFormField('question', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                rows={2}
              />
            </label>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {OPTION_LABELS.map((label, idx) => (
                <label key={label} className="text-sm">
                  {label}
                  <input
                    value={form.options[idx] || ''}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                  />
                </label>
              ))}
            </div>
            <div className="mb-4 flex gap-4">
              <label className="text-sm">
                正確答案
                <select
                  value={form.answer}
                  onChange={(e) => updateFormField('answer', Number(e.target.value))}
                  className="ml-2 rounded-lg border border-slate-700 bg-slate-900 p-2"
                >
                  {OPTION_LABELS.map((label, idx) => (
                    <option key={label} value={idx}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                關卡 / 難度
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={form.tier}
                  onChange={(e) => updateFormField('tier', Number(e.target.value))}
                  className="ml-2 w-20 rounded-lg border border-slate-700 bg-slate-900 p-2"
                />
              </label>
            </div>
            <div className="mb-6 flex gap-2">
              <button
                type="button"
                onClick={saveFormToDraft}
                className="rounded-full bg-amber-500 px-5 py-2 text-sm font-black text-slate-950"
              >
                {editIndex >= 0 ? '更新題目' : '新增題目'}
              </button>
              <button
                type="button"
                onClick={() => resetForm()}
                className="rounded-full border border-slate-600 px-5 py-2 text-sm"
              >
                清空表單
              </button>
            </div>

            <h3 className="mb-3 font-bold text-amber-300">賽制</h3>
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setMode('classic')}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  draftS.mode === 'classic'
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-600'
                }`}
              >
                經典 15 關
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  draftS.mode === 'custom'
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-600'
                }`}
              >
                自訂關卡
              </button>
            </div>

            {draftS.mode === 'custom' && (
              <div className="mb-4 space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <label className="text-sm">
                  題數（5–15）
                  <input
                    type="number"
                    min={5}
                    max={15}
                    value={draftS.questionCount}
                    onChange={(e) => setCustomCount(e.target.value)}
                    className="ml-2 w-20 rounded-lg border border-slate-700 bg-slate-950 p-2"
                  />
                </label>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-400">
                      <tr>
                        <th className="py-1">關</th>
                        <th>顯示名稱（可填「恩典獎」）</th>
                        <th>保證線</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftS.ladder.map((row, idx) => (
                        <tr key={row.level} className="border-t border-slate-800">
                          <td className="py-1 pr-2">{row.level}</td>
                          <td>
                            <input
                              value={row.amount}
                              onChange={(e) =>
                                updateLadderRow(idx, 'amount', e.target.value)
                              }
                              className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={!!row.isSafe}
                              onChange={(e) =>
                                updateLadderRow(idx, 'isSafe', e.target.checked)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {draftQ.length < draftS.ladder.length && (
              <p className="mb-3 text-xs text-amber-300">
                目前題數少於關卡數，比賽會在最後一題結束並頒發該關獎金。
              </p>
            )}
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-900/60 px-6 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportJson}
              className="rounded-full border border-blue-400 px-4 py-2 text-sm font-bold text-blue-200"
            >
              匯出 JSON
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-blue-400 px-4 py-2 text-sm font-bold text-blue-200"
            >
              匯入 JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importJson(file);
                e.target.value = '';
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            {notice && <span className="text-sm text-amber-300">{notice}</span>}
            <button
              type="button"
              onClick={applyAndClose}
              className="rounded-full bg-amber-500 px-6 py-2 font-black text-slate-950"
            >
              儲存並套用
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
