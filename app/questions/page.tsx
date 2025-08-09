"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, ArrowLeft, Trophy, RotateCcw } from "lucide-react"
import { useDecision } from "@/lib/decision-context"
import { LayoutWrapper } from "@/components/layout-wrapper"

export default function QuestionsPage() {
  const router = useRouter()
  const { questions, answers, loading, setAnswers, generateDecision, undoAnswer } = useDecision()

  const [currentQuestion, setCurrentQuestion] = useState(0)

  // Redirect if no questions available
  useEffect(() => {
    if (questions.length === 0 && !loading) {
      // Only redirect if we don't have any saved questions data
      const timer = setTimeout(() => {
        if (questions.length === 0) {
          router.push("/")
        }
      }, 100) // Small delay to allow state to load from localStorage

      return () => clearTimeout(timer)
    }
  }, [questions, loading, router])

  const handleGenerateDecision = async () => {
    await generateDecision()
    router.push("/result")
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleUndoCurrentAnswer = () => {
    undoAnswer(currentQuestion)
  }

  if (questions.length === 0) {
    return null // Will redirect in useEffect
  }

  const totalQuestions = questions.length

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        <Card className="shadow-2xl bg-blue-950 backdrop-blur-xl animate-slide-up">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between">
              <div className="flex ">
                <p className="text-blue-200 text-lg font-medium">
                  Question {currentQuestion + 1} of {totalQuestions}
                </p>
              </div>
              <div className="flex ">
                {answers[currentQuestion] && (
                  <Button
                    size="sm"
                    onClick={handleUndoCurrentAnswer}
                    className="bg-blue-200 text-blue-950 hover:bg-red-100 hover:text-red-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Undo
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-blue-200 mb-6 leading-relaxed">
                  {questions[currentQuestion]?.question}
                </h3>
              </div>
              <RadioGroup
                value={answers[currentQuestion] || ""}
                onValueChange={(value) => {
                  const newAnswers = { ...answers, [currentQuestion]: value }
                  setAnswers(newAnswers)

                  // Remove focus from any active element to prevent hover state issues on mobile
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur()
                  }

                  // Auto-advance to next question after a short delay (but not on last question)
                  if (currentQuestion < questions.length - 1) {
                    setTimeout(() => {
                      setCurrentQuestion(currentQuestion + 1)
                    }, 300)
                  }
                }}
                className="space-y-4"
              >
                {questions[currentQuestion]?.answer_choices.map((choice, choiceIndex) => (
                  <div key={choiceIndex} className="group">
                    <div
                      className={`flex items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                        answers[currentQuestion] === choice
                          ? "bg-yellow-600 text-blue-950"
                          : "bg-blue-950 text-blue-200 hover:bg-blue-200 hover:text-blue-950 active:bg-blue-200 active:text-blue-950"
                      }`}
                      onClick={() => {
                        const newAnswers = { ...answers, [currentQuestion]: choice }
                        setAnswers(newAnswers)

                        // Remove focus to prevent hover state issues
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur()
                        }

                        // Auto-advance to next question
                        if (currentQuestion < questions.length - 1) {
                          setTimeout(() => {
                            setCurrentQuestion(currentQuestion + 1)
                          }, 300)
                        }
                      }}
                    >
                      <RadioGroupItem value={choice} id={`q${currentQuestion}-${choiceIndex}`} className="sr-only" />
                      <Label
                        htmlFor={`q${currentQuestion}-${choiceIndex}`}
                        className="cursor-pointer text-lg leading-relaxed flex-1 transition-colors duration-300 w-full pointer-events-none"
                      >
                        {choice}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="flex-1 h-12 bg-blue-200 text-blue-950 hover:bg-blue-950 hover:text-blue-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {currentQuestion < questions.length - 1 ? (
                <Button
                  variant="outline"
                  onClick={nextQuestion}
                  className="flex-1 h-12 bg-blue-200 text-blue-950 hover:bg-blue-950 hover:text-blue-200"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleGenerateDecision}
                  disabled={Object.keys(answers).length === 0 || loading}
                  className="flex-1 h-12 text-blue-950 bg-yellow-600 hover:bg-yellow-600 hover:scale-105"
                >
                  {loading ? (
                    <>Analyzing...</>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Get My Decision
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
