import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import initialQuestions from './data/initialQuestions.json';
import { sounds } from './utils/soundPlayer';
import {
  CLASSIC_LADDER,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  getDropAmount,
  getWalkAwayAmount,
} from './constants';
import AudienceModal from './components/AudienceModal';
import PhoneModal from './components/PhoneModal';
import AdminModal from './components/AdminModal';
import Lifelines from './components/Lifelines';
import MoneyLadder from './components/MoneyLadder';
import QuestionBox from './components/QuestionBox';

function loadQuestions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.questions);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* keep seed */
  }
  return initialQuestions;
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.settings);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.ladder?.length) {
        return {
          mode: parsed.mode === 'custom' ? 'custom' : 'classic',
          questionCount: parsed.questionCount || parsed.ladder.length,
          ladder: parsed.ladder,
        };
      }
    }
  } catch {
    /* keep default */
  }
  return {
    ...DEFAULT_SETTINGS,
    ladder: CLASSIC_LADDER.map((row) => ({ ...row })),
  };
}

export default function App() {
  const [questions, setQuestions] = useState(loadQuestions);
  const [settings, setSettings] = useState(loadSettings);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [endPrize, setEndPrize] = useState('$0');
  const [muted, setMuted] = useState(false);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    audience: true,
    phone: true,
  });
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [showAudience, setShowAudience] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [confirmWalk, setConfirmWalk] = useState(false);

  const ladder = settings.ladder?.length ? settings.ladder : CLASSIC_LADDER;
  const playCount = Math.min(questions.length, ladder.length);
  const currentQ = questions[currentIdx];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  const resetQuestionState = () => {
    setSelectedOpt(null);
    setRevealed(false);
    setHiddenOptions([]);
  };

  const restartGame = () => {
    setCurrentIdx(0);
    resetQuestionState();
    setGameOver(false);
    setWon(false);
    setEndPrize('$0');
    setConfirmWalk(false);
    setLifelines({ fiftyFifty: true, audience: true, phone: true });
  };

  const toggleMute = () => {
    sounds.muted = !muted;
    setMuted(!muted);
  };

  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || revealed || gameOver || won || !currentQ) return;
    const wrongIndices = currentQ.options
      .map((_, i) => i)
      .filter((i) => i !== currentQ.answer);
    const shuffled = [...wrongIndices].sort(() => 0.5 - Math.random());
    setHiddenOptions(shuffled.slice(0, 2));
    setLifelines((prev) => ({ ...prev, fiftyFifty: false }));
    if (selectedOpt !== null && shuffled.slice(0, 2).includes(selectedOpt)) {
      setSelectedOpt(null);
    }
    sounds.playTone(400, 'sine', 0.2);
  };

  const useAudience = () => {
    if (!lifelines.audience || revealed || gameOver || won) return;
    setLifelines((prev) => ({ ...prev, audience: false }));
    setShowAudience(true);
  };

  const usePhone = () => {
    if (!lifelines.phone || revealed || gameOver || won) return;
    setLifelines((prev) => ({ ...prev, phone: false }));
    setShowPhone(true);
  };

  const handleSelect = (idx) => {
    if (revealed || gameOver || won) return;
    setSelectedOpt(idx);
    sounds.playLockIn();
  };

  const handleConfirm = () => {
    if (selectedOpt === null || revealed || !currentQ) return;
    setRevealed(true);

    if (selectedOpt === currentQ.answer) {
      sounds.playCorrect();
      window.setTimeout(() => {
        if (currentIdx + 1 < playCount) {
          setCurrentIdx((prev) => prev + 1);
          resetQuestionState();
        } else {
          setWon(true);
          setEndPrize(ladder[currentIdx]?.amount ?? ladder.at(-1)?.amount ?? '$0');
        }
      }, 2500);
    } else {
      sounds.playWrong();
      window.setTimeout(() => {
        setGameOver(true);
        setEndPrize(getDropAmount(ladder, currentIdx));
      }, 2500);
    }
  };

  const walkAway = () => {
    setConfirmWalk(false);
    setGameOver(true);
    setEndPrize(getWalkAwayAmount(ladder, currentIdx));
  };

  const handleAdminSave = (nextQuestions, nextSettings) => {
    setQuestions(nextQuestions);
    setSettings(nextSettings);
    restartGame();
  };

  const overlayTitle = useMemo(() => {
    if (won) return '恭喜！';
    return '很遺憾！';
  }, [won]);

  const lockedOut = revealed || gameOver || won || !currentQ;

  return (
    <div className="stage-bg flex h-screen flex-col justify-between p-5 text-white select-none">
      <header className="flex items-center justify-between border-b border-blue-900/50 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-[0.2em] text-amber-400">百萬富翁</h1>
          <p className="text-xs text-slate-400">
            {settings.mode === 'classic' ? '經典 15 關' : `自訂 ${ladder.length} 關`}
          </p>
        </div>

        <Lifelines
          lifelines={lifelines}
          disabled={lockedOut}
          onFifty={useFiftyFifty}
          onAudience={useAudience}
          onPhone={usePhone}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAdmin(true)}
            className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700"
            title="題庫設定"
          >
            <Settings size={20} />
          </button>
          <button type="button" onClick={toggleMute} className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700">
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button type="button" onClick={restartGame} className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700">
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-12 gap-6 py-4">
        <div className="col-span-9 flex flex-col justify-center">
          <QuestionBox
            question={currentQ}
            currentIdx={currentIdx}
            selectedOpt={selectedOpt}
            revealed={revealed}
            hiddenOptions={hiddenOptions}
            onSelect={handleSelect}
            onConfirm={handleConfirm}
          />

          {!lockedOut && currentIdx > 0 && (
            <div className="mt-4 flex justify-center">
              {confirmWalk ? (
                <div className="flex items-center gap-3 text-sm">
                  <span>確定帶走 {getWalkAwayAmount(ladder, currentIdx)}？</span>
                  <button
                    type="button"
                    onClick={walkAway}
                    className="rounded-full bg-amber-500 px-4 py-1 font-bold text-slate-950"
                  >
                    確定
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmWalk(false)}
                    className="rounded-full border border-slate-500 px-4 py-1"
                  >
                    繼續作答
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmWalk(true)}
                  className="text-sm text-slate-400 underline decoration-slate-600 hover:text-amber-300"
                >
                  帶走獎金
                </button>
              )}
            </div>
          )}
        </div>

        <div className="col-span-3 min-h-0">
          <MoneyLadder ladder={ladder} currentIdx={currentIdx} />
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500">
        百萬富翁現場活動專用系統 • 支援自訂題庫與外接投影機
      </footer>

      {(gameOver || won) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-lg rounded-2xl border-2 border-amber-400 bg-slate-950 p-10 text-center shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <p className="text-sm font-bold tracking-[0.3em] text-amber-400">
              {won ? 'GRAND PRIZE' : 'GAME OVER'}
            </p>
            <h2 className="mt-2 text-4xl font-black">{overlayTitle}</h2>
            <p className="mt-4 text-lg text-slate-300">您獲得</p>
            <p className="mt-1 text-5xl font-black text-amber-400">{endPrize}</p>
            {!won && currentQ && (
              <p className="mt-4 text-sm text-slate-400">
                正確答案：{['A', 'B', 'C', 'D'][currentQ.answer]} {currentQ.options[currentQ.answer]}
              </p>
            )}
            <button
              type="button"
              onClick={restartGame}
              className="mt-8 rounded-full bg-amber-500 px-8 py-3 font-black tracking-widest text-slate-950"
            >
              重新開始
            </button>
          </div>
        </div>
      )}

      <AudienceModal
        open={showAudience}
        onClose={() => setShowAudience(false)}
        question={currentQ}
        hiddenOptions={hiddenOptions}
      />
      <PhoneModal open={showPhone} onClose={() => setShowPhone(false)} />
      <AdminModal
        open={showAdmin}
        onClose={() => setShowAdmin(false)}
        questions={questions}
        settings={settings}
        onSave={handleAdminSave}
      />
    </div>
  );
}
