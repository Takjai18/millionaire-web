// src/utils/soundPlayer.js
class SoundPlayer {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
  }

  playTone(freq, type = 'sine', duration = 0.3, startTime = 0) {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  // 確定答案 (Final Answer) 懸疑重音
  playLockIn() {
    this.playTone(130, 'triangle', 0.6);
  }

  // 答對音效 (向上和弦)
  playCorrect() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      this.playTone(freq, 'sine', 0.4, i * 0.12);
    });
  }

  // 答錯音效 (沉重低音)
  playWrong() {
    this.playTone(110, 'sawtooth', 0.6);
    this.playTone(98, 'sawtooth', 0.6, 0.2);
  }

  // 倒數計時 Tick
  playTick() {
    this.playTone(800, 'triangle', 0.05);
  }
}

export const sounds = new SoundPlayer();
