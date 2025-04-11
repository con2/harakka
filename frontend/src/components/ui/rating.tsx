import React, { useState } from "react";

interface RatingProps {
  value: number; // Average rating value to display
  onChange?: (value: number) => void; // Optional callback to handle changes
  readOnly?: boolean;
}

const Rating: React.FC<RatingProps> = ({ value, onChange, readOnly = false }) => {
  const [hoverValue, setHoverValue] = useState<number>(0); // Value when hovering
  const maxRating = 5; // Max stars for the rating

  const handleMouseEnter = (rating: number) => {
    if (!readOnly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(0);
    }
  };

  const handleClick = (rating: number) => {
    if (onChange && !readOnly) {
      onChange(rating);
    }
  };

  return (
    <div className="flex space-x-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverValue || value);
        return (
          <svg
            key={starValue}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFilled ? "currentColor" : "none"}
            stroke="currentColor"
            className={`w-6 h-6 cursor-pointer ${isFilled ? "text-yellow-400" : "text-gray-300"}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          >
            <path
              fillRule="evenodd"
              d="M12 17.278l4.046 2.508-1.081-4.85 3.742-3.35-4.912-.426L12 2.1l-2.795 8.06-4.912.426 3.742 3.35-1.081 4.85L12 17.278z"
              clipRule="evenodd"
            />
          </svg>
        );
      })}
    </div>
  );
};

export default Rating;
