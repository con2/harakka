import React from "react";

const ItemsLoader: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div
        className="spinner-border animate-spin inline-block w-16 h-16 border-4 border-solid border-blue-600 border-t-transparent rounded-full"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default ItemsLoader;
