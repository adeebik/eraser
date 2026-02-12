"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "pastel-red" | "pastel-orange" | "pastel-green";
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
  const baseStyles = "inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 border-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] gap-2";
  
  const variants = {
    primary: "bg-black text-white border-black hover:bg-gray-800",
    secondary: "bg-[#f3f4f6] text-[#1f2937] border-black hover:bg-gray-200",
    "pastel-red": "bg-[#fee2e2] text-[#991b1b] border-black hover:bg-[#fecaca]",
    "pastel-orange": "bg-[#ffedd5] text-[#9a3412] border-black hover:bg-[#fed7aa]",
    "pastel-green": "bg-white text-[#166534] border-black hover:bg-[#f0fdf4]",
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
