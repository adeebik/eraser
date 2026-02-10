"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "pastel-red" | "pastel-orange";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const Button = ({ 
  children, 
  className = "", 
  variant = "primary",
  onClick,
  type = "button"
}: ButtonProps) => {
  const baseStyles = "px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 border-b-4 border-r-4 cursor-pointer";
  
  const variants = {
    primary: "bg-black text-white border-gray-800",
    secondary: "bg-white text-black border-gray-200",
    "pastel-red": "bg-[#FFB7B7] text-[#8B0000] border-[#FF8A8A] hover:bg-[#FFC4C4]",
    "pastel-orange": "bg-[#FFD8B1] text-[#A0522D] border-[#FFC88A] hover:bg-[#FFE4C4]",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
