"use client"

import type React from "react"

import { Brain, Sparkle } from "lucide-react"
import { useDecision } from "@/lib/decision-context"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { loading } = useDecision()


  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-blue-950 to-blue-950" />

      {/* Animated flowing shapes */}
      <div className="absolute inset-0">
        {/* Shape 1 - Slow rotation */}
        <div className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] opacity-80 animate-spin-slow">
          <div className="w-full h-full bg-gradient-to-bl from-blue-200 via-blue-950 to-transparent rounded-[50%] transform rotate-12" />
        </div>

        {/* Shape 2 - Reverse slow rotation */}
        <div className="absolute -bottom-1/3 -left-1/4 w-[120%] h-[120%] opacity-70 animate-reverse-spin-slow">
          <div className="w-full h-full bg-gradient-to-tr from-blue-200 via-blue-950 to-transparent rounded-[60%] transform -rotate-6" />
        </div>

        {/* Shape 3 - Floating animation */}
        <div className="absolute top-1/4 right-1/4 w-[80%] h-[80%] opacity-60 animate-float">
          <div className="w-full h-full bg-gradient-to-bl from-blue-200 via-blue-950 to-transparent rounded-[45%] transform rotate-45" />
        </div>

        {/* Shape 4 - Pulse animation */}
        <div className="absolute bottom-1/3 left-1/3 w-[70%] h-[70%] opacity-50 animate-pulse-slow">
          <div className="w-full h-full bg-gradient-to-tr from-blue-950 via-blue-200 to-transparent rounded-[55%] transform -rotate-30" />
        </div>
      </div>

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-yellow via-transparent to-yellow" />

       <div className="relative z-10 p-4 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative w-[72px] h-[72px]">
                <Brain className="w-full h-full text-blue-200" />
                <Sparkle className="w-8 h-8 text-yellow-600 absolute -top-4 -right-4 animate-spin" />
              </div>
              <h1 className="text-7xl font-bold text-blue-200 bg-clip-text">Decision Helper</h1>
            </div>
          </div>
          {children}
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div>
            <img src="/loading-animation.gif" alt="Loading..." className="w-32 h-32 mx-auto" />
          </div>
        </div>
      )}

    </div>
  )
}
