"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function HamburgerMenu({ isOpen, onClick, className }: HamburgerMenuProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col justify-center items-center w-8 h-8 space-y-1.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md",
        className
      )}
      aria-label="Toggle navigation menu"
      aria-expanded={isOpen}
    >
      <span
        className={cn(
          "block h-1 w-6 bg-black transition-all duration-300 ease-in-out rounded-full",
          isOpen && "rotate-45 translate-y-2"
        )}
      />
      <span
        className={cn(
          "block h-1 w-6 bg-black transition-all duration-300 ease-in-out rounded-full",
          isOpen && "opacity-0"
        )}
      />
      <span
        className={cn(
          "block h-1 w-6 bg-black transition-all duration-300 ease-in-out rounded-full",
          isOpen && "-rotate-45 -translate-y-2"
        )}
      />
    </button>
  );
}
