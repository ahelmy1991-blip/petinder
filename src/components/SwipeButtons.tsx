"use client";

interface SwipeButtonsProps {
  onLike: () => void;
  onPass: () => void;
  disabled?: boolean;
}

export default function SwipeButtons({ onLike, onPass, disabled }: SwipeButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-8 py-4">
      <button
        onClick={onPass}
        disabled={disabled}
        aria-label="Pass"
        className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-pass text-pass text-3xl
                   flex items-center justify-center
                   hover:bg-pass hover:text-white hover:scale-110
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200 active:scale-95"
      >
        ✕
      </button>

      <button
        onClick={onLike}
        disabled={disabled}
        aria-label="Like"
        className="w-20 h-20 rounded-full bg-white shadow-xl border-2 border-like text-like text-4xl
                   flex items-center justify-center
                   hover:bg-like hover:text-white hover:scale-110
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200 active:scale-95"
      >
        ♥
      </button>

      <div className="w-16 h-16 flex items-center justify-center text-gray-300 text-sm text-center leading-tight">
        ← → keys
      </div>
    </div>
  );
}
