"use client"

export default function AnimatedBackground() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-teal-900" />

      {/* Animated flowing shapes */}
      <div className="absolute inset-0">
        {/* Shape 1 - Slow rotation */}
        <div className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] opacity-80 animate-spin-slow">
          <div className="w-full h-full bg-gradient-to-bl from-teal-400/40 via-cyan-500/30 to-transparent rounded-[50%] transform rotate-12" />
        </div>

        {/* Shape 2 - Reverse slow rotation */}
        <div className="absolute -bottom-1/3 -left-1/4 w-[120%] h-[120%] opacity-70 animate-reverse-spin-slow">
          <div className="w-full h-full bg-gradient-to-tr from-slate-800/50 via-gray-700/40 to-transparent rounded-[60%] transform -rotate-6" />
        </div>

        {/* Shape 3 - Floating animation */}
        <div className="absolute top-1/4 right-1/4 w-[80%] h-[80%] opacity-60 animate-float">
          <div className="w-full h-full bg-gradient-to-bl from-teal-300/30 via-cyan-400/25 to-transparent rounded-[45%] transform rotate-45" />
        </div>

        {/* Shape 4 - Pulse animation */}
        <div className="absolute bottom-1/3 left-1/3 w-[70%] h-[70%] opacity-50 animate-pulse-slow">
          <div className="w-full h-full bg-gradient-to-tr from-orange-600/40 via-amber-500/30 to-transparent rounded-[55%] transform -rotate-30" />
        </div>
      </div>

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
    </div>
  )
}
