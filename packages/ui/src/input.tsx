"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = "", ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-bold text-gray-700 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all bg-white text-black placeholder:text-gray-400 font-medium ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-bold ml-1">
          {error}
        </span>
      )}
    </div>
  );
};
