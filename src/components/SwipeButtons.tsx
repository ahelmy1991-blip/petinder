"use client";

interface Props {
  onLike: () => void;
  onPass: () => void;
  onSuperLike?: () => void;
  disabled?: boolean;
}

export default function SwipeButtons({ onLike, onPass, onSuperLike, disabled }: Props) {
  return (
    <div className="flex items-center justify-center gap-5 py-3">
      {/* NOPE */}
      <button
        onClick={onPass}
        disabled={disabled}
        aria-label="Pass"
        className="group relative w-14 h-14 rounded-full bg-white shadow-lg border border-gray-100
                   flex items-center justify-center
                   hover:border-red-300 hover:shadow-red-100 hover:shadow-xl hover:scale-110
                   active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200"
      >
        <svg className="w-6 h-6 text-red-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      {/* SUPER LIKE (star) */}
      {onSuperLike && (
        <button
          onClick={onSuperLike}
          disabled={disabled}
          aria-label="Super Like"
          className="group w-12 h-12 rounded-full bg-white shadow-md border border-gray-100
                     flex items-center justify-center
                     hover:border-blue-300 hover:shadow-blue-100 hover:shadow-xl hover:scale-110
                     active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      )}

      {/* LIKE */}
      <button
        onClick={onLike}
        disabled={disabled}
        aria-label="Like"
        className="group relative w-16 h-16 rounded-full bg-white shadow-lg border border-gray-100
                   flex items-center justify-center
                   hover:border-green-300 hover:shadow-green-100 hover:shadow-xl hover:scale-110
                   active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200"
      >
        <svg className="w-8 h-8 text-green-400 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>
  );
}
