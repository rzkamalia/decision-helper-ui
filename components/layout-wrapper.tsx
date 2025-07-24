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
    <div className="min-h-screen bg-blue-200 relative overflow-hidden">
      <div className="relative z-10 p-4 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Brain className="w-12 h-12 text-blue-950" />
                <Sparkle className="w-8 h-8 text-yellow-600 absolute -top-4 -right-4 animate-spin" />
              </div>
              <h1 className="text-7xl font-bold text-blue-950 bg-clip-text">Decision Helper</h1>
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
