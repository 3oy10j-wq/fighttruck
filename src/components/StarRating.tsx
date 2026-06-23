'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  readOnly?: boolean;
}

export default function StarRating({
  value,
  onChange,
  label,
  readOnly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-900">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => !readOnly && onChange(star)}
            className={`text-3xl transition-colors ${
              star <= displayValue
                ? 'text-yellow-400'
                : 'text-gray-300'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
