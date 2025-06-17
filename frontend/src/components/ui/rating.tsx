import StarRatings from "react-star-ratings";

interface StarRatingProps {
  rating: number;
  onChange?: (newRating: number) => void;
  starDimension?: string;
  readOnly?: boolean;
}

const Rating: React.FC<StarRatingProps> = ({
  rating,
  onChange,
  starDimension = "16px",
  readOnly = false,
}) => {
  return (
    <div className="flex items-center">
      <StarRatings
        rating={rating}
        starRatedColor="#facc15" // Tailwind's yellow-400
        starEmptyColor="#e5e7eb" // Tailwind's gray-200
        starHoverColor="#facc15"
        changeRating={readOnly ? undefined : onChange}
        numberOfStars={5}
        name="rating"
        starDimension={starDimension}
        starSpacing="4px"
        svgIconViewBox="0 0 32 32"
        svgIconPath="M16 1.6l4.9 9.9 10.9 1.6-7.9 7.7 1.9 10.9-9.8-5.2-9.8 5.2 1.9-10.9-7.9-7.7 10.9-1.6L16 1.6z"
      />
    </div>
  );
};

export default Rating;
