import React from 'react';
import { Phone, Users } from 'lucide-react';

export default function Lifelines({ lifelines, disabled, onFifty, onAudience, onPhone }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onFifty}
        disabled={disabled || !lifelines.fiftyFifty}
        className={`lifeline-btn text-sm font-black ${!lifelines.fiftyFifty ? 'is-used' : ''}`}
        title="五十五十"
      >
        50:50
      </button>
      <button
        type="button"
        onClick={onAudience}
        disabled={disabled || !lifelines.audience}
        className={`lifeline-btn flex items-center justify-center ${!lifelines.audience ? 'is-used' : ''}`}
        title="問現場觀眾"
      >
        <Users size={18} />
      </button>
      <button
        type="button"
        onClick={onPhone}
        disabled={disabled || !lifelines.phone}
        className={`lifeline-btn flex items-center justify-center ${!lifelines.phone ? 'is-used' : ''}`}
        title="打電話問朋友"
      >
        <Phone size={18} />
      </button>
    </div>
  );
}
