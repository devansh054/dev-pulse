"use client";

import React from "react";

export default function TestAnimationPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Animation Test</h1>
        
        <div className="text-6xl font-bold mb-4">
          <span className="inline-flex relative">
            {/* Geometric separator line */}
            <div 
              className="absolute -left-8 top-1/2 w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-green-400"
              style={{
                animation: `geometric-separator 3s ease-in-out infinite`
              }}
            />

            {"DEVELOPER".split("").map((letter, index) => (
              <span
                key={index}
                className="inline-block font-bold tracking-wider cursor-pointer"
                style={{
                  animation: `sleek-showcase 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
                  animationDelay: `${index * 0.2}s`,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = "paused";
                  e.currentTarget.style.transform = "scale(1.15)";
                  e.currentTarget.style.color = "#84cc16";
                  e.currentTarget.style.textShadow = "0 0 30px rgba(132, 204, 22, 1), 0 0 60px rgba(132, 204, 22, 0.5)";
                  e.currentTarget.style.transition = "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = "running";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.color = "";
                  e.currentTarget.style.textShadow = "";
                  e.currentTarget.style.transition = "";
                }}
              >
                {letter}
              </span>
            ))}

            {/* Trailing geometric separator */}
            <div 
              className="absolute -right-8 top-1/2 w-6 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400"
              style={{ 
                animation: `geometric-separator 3s ease-in-out infinite`,
                animationDelay: "1s" 
              }}
            />
          </span>
          <span className="ml-2">INTELLIGENCE</span>
        </div>
        
        <p className="text-lg text-gray-400">Direct animation test - bypassing auth context</p>
      </div>
    </div>
  );
}
