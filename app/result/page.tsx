"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Sparkle, Lightbulb } from "lucide-react"
import { useDecision } from "@/lib/decision-context"
import { LayoutWrapper } from "@/components/layout-wrapper"

export default function ResultPage() {
  const router = useRouter()
  const { decision, resetForm } = useDecision()

  // Redirect if no decision available
  useEffect(() => {
    if (!decision) {
      // Only redirect if we don't have any saved decision data
      const timer = setTimeout(() => {
        if (!decision) {
          router.push("/")
        }
      }, 100) // Small delay to allow state to load from localStorage

      return () => clearTimeout(timer)
    }
  }, [decision, router])

  const handleReset = () => {
    resetForm()
    router.push("/")
  }

  // Helper function to check if a string is a base64 image
  const isBase64Image = (str: string) => {
    if (typeof str !== "string") return false

    // Check if it's a data URL with base64 image
    const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i
    return base64ImageRegex.test(str)
  }

  // Helper function to check if string looks like base64 text (not an image)
  const isBase64Text = (str: string) => {
    if (typeof str !== "string") return false

    // If it's already a data URL, it's not base64 text
    if (str.startsWith("data:")) return false

    // Check if it looks like base64 encoded text (no spaces, only base64 chars, reasonable length)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    return base64Regex.test(str) && str.length > 20 && str.length % 4 === 0
  }

  // Helper function to decode base64 text
  const decodeBase64Text = (str: string) => {
    try {
      return atob(str)
    } catch (error) {
      console.error("Failed to decode base64:", error)
      return str // Return original if decoding fails
    }
  }

  if (!decision) {
    return null // Will redirect in useEffect
  }

  const isImage = isBase64Image(decision.chosen_option)
  const isEncodedText = !isImage && isBase64Text(decision.chosen_option)
  const displayText = isEncodedText ? decodeBase64Text(decision.chosen_option) : decision.chosen_option

  return (
    <LayoutWrapper>
      <div className="space-y-8 animate-slide-up">
        <Card className="shadow-2xl bg-blue-950 backdrop-blur-xl animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Trophy className="w-12 h-12 text-blue-200" />
                <Sparkle className="w-8 h-8 text-yellow-600 absolute -top-4 -right-5 animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl text-blue-200 mb-4">🎉 Your Perfect Choice 🎉</CardTitle>
            <div className="flex justify-center">
              {isImage ? (
                <div className="bg-yellow-600 p-4 rounded-2xl shadow-lg">
                  <img
                    src={decision.chosen_option || "/placeholder.svg"}
                    alt="Your chosen option"
                    className="max-w-full max-h-96 object-contain rounded-lg"
                    onError={(e) => {
                      console.error("Image failed to load:", decision.chosen_option)
                      // Hide the image if it fails to load
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              ) : (
                <Badge className="text-4xl rounded-none px-4 py-4 bg-yellow-600 text-blue-950 font-bold hover:bg-yellow-600">
                  {displayText}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="bg-blue-200 p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold mb-4 text-blue-950 flex items-center gap-2">
                <Lightbulb className="w-8 h-8 text-blue-950" />
                Why This Is Perfect For You
              </h3>
              <p className="text-blue-950 text-lg text-justify">{decision.reason}</p>
            </div>
            <Button
              onClick={handleReset}
              className="w-full h-16 text-l bg-blue-950 hover:bg-blue-200 text-blue-200 hover:text-blue-950 border transition-all duration-300 transform hover:scale-105"
            >
              Make Another Decision
            </Button>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
