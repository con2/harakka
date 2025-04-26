import React from "react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Illusia. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
