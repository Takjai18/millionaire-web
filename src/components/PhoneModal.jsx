import React, { useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';
import { sounds } from '../utils/soundPlayer';

const DURATION = 30;
const RADIUS = 108;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PhoneModal({ open, onClose }) {
  const [remaining, setRemaining] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const prevRemaining = useRef(DURATION);

  useEffect(() => {
    if (!open) {
      setRemaining(DURATION);
      setRunning(false);
      prevRemaining.current = DURATION;
    }
  }, [open]);

  useEffect(() => {
    if (!open || !running) return undefined;
    const id = window.setInterval(() => {
      setRemaining((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, running]);

  useEffect(() => {
    if (!open) return;
    if (remaining < prevRemaining.current) {
      sounds.playTick();
    }
    if (remaining === 0 && prevRemaining.current > 0) {
      setRunning(false);
      sounds.playTone(160, 'sawtooth', 0.8);
    }
    prevRemaining.current = remaining;
  }, [remaining, open]);

  if (!open) return null;

  const progress = remaining / DURATION;
  const urgent = remaining <= 10;
  const ended = remaining <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6">
      <div className="flex min-h-[80vh] w-[min(92vw,56rem)] flex-col items-center justify-center rounded-3xl border-2 border-amber-400 bg-slate-950 px-10 py-12 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
        <div className="mb-2 flex items-center gap-2 text-amber-400">
          <Phone size={22} />
          <p className="text-sm font-bold tracking-[0.35em]">PHONE A FRIEND</p>
        </div>
        <h2 className="mb-8 text-3xl font-black">打電話問朋友</h2>

        <div className="relative mb-8 flex h-64 w-64 items-center justify-center">
          <svg width="256" height="256" className="timer-ring absolute inset-0">
            <circle
              cx="128"
              cy="128"
              r={RADIUS}
              fill="none"
              stroke="#1e293b"
              strokeWidth="12"
            />
            <circle
              cx="128"
              cy="128"
              r={RADIUS}
              fill="none"
              stroke={urgent ? '#f43f5e' : '#f5c542'}
              strokeWidth="12"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span
            className={`text-7xl font-black tabular-nums ${
              ended ? 'text-rose-500' : urgent ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}
          >
            {ended ? '0' : remaining}
          </span>
        </div>

        <p className="mb-6 text-center text-slate-300">
          {ended ? '時間到！請掛線並作答。' : '現場立即致電好友，倒數 30 秒。'}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            disabled={ended || running}
            onClick={() => setRunning(true)}
            className="rounded-full bg-emerald-600 px-6 py-2 font-bold tracking-widest disabled:opacity-40"
          >
            開始
          </button>
          <button
            type="button"
            disabled={!running}
            onClick={() => setRunning(false)}
            className="rounded-full bg-amber-500 px-6 py-2 font-bold tracking-widest text-slate-950 disabled:opacity-40"
          >
            暫停
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setRemaining(DURATION);
            }}
            className="rounded-full border border-slate-500 bg-slate-800 px-6 py-2 font-bold tracking-widest"
          >
            重設
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-amber-400 bg-blue-950 px-6 py-2 font-bold tracking-widest text-amber-200"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
