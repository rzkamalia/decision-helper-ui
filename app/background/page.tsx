"use client"

import { useState } from "react"
import AnimatedBackground from "@/components/animated-background"

export default function BackgroundPage() {
  const [isAnimated, setIsAnimated] = useState(false)

  return (
    <div className="relative w-full h-screen">
      {isAnimated ? (
        <AnimatedBackground />
      ) : (
        <div className="relative w-full h-screen overflow-hidden">
          {/* Static version */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-teal-900" />

          <div className="absolute inset-0">
            <div className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] opacity-80">
              <div className="w-full h-full bg-gradient-to-bl from-teal-400/40 via-cyan-500/30 to-transparent rounded-[50%] transform rotate-12" />
            </div>

            <div className="absolute -bottom-1/3 -left-1/4 w-[120%] h-[120%] opacity-70">
              <div className="w-full h-full bg-gradient-to-tr from-slate-800/50 via-gray-700/40 to-transparent rounded-[60%] transform -rotate-6" />
            </div>

            <div className="absolute top-1/4 right-1/4 w-[80%] h-[80%] opacity-60">
              <div className="w-full h-full bg-gradient-to-bl from-teal-300/30 via-cyan-400/25 to-transparent rounded-[45%] transform rotate-45" />
            </div>

            <div className="absolute bottom-1/3 left-1/3 w-[70%] h-[70%] opacity-50">
              <div className="w-full h-full bg-gradient-to-tr from-orange-600/40 via-amber-500/30 to-transparent rounded-[55%] transform -rotate-30" />
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsAnimated(!isAnimated)}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white border border-white/30 hover:bg-white/30 transition-colors"
      >
        {isAnimated ? "Static" : "Animated"}
      </button>
    </div>
  )
}
