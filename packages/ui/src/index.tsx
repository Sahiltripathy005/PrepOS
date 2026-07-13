import * as React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-600 text-white rounded">
      {children}
    </button>
  );
}
