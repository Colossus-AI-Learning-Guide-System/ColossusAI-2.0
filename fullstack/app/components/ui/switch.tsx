"use client";

import * as React from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, className }) => {
  return (
    <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full shadow-inner"></div>
      <div className="absolute w-5 h-5 bg-white rounded-full shadow transition-transform transform translate-x-1"></div>
    </label>
  );
};

export { Switch }; 