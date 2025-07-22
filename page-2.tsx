"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X, Brain, ArrowRight, Sparkles, Target, Trophy, Zap, Star, Lightbulb } from "lucide-react"

interface Question {
  question: string
  answer_choices: string[]
}

interface QuestionResponse {
  questions: Question[]
  web_search: string
  user_id: string
}

interface DecisionResponse {
  chosen_option: string
  reason: string
  user_id: string
}

// Bubble component for background animation
const Bubble = ({ size, left, delay, duration }: { size: number; left: number; delay: number; duration: number }) => (
  <div
    className="absolute rounded-full bg-white/20 animate-float"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      left: `${left}%`,
      bottom: "-100px",
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
)

export default function DecisionHelper() {
  const [step, setStep] = useState<"input" | "questions" | "result">("input")
  const [context, setContext] = useState("")
  const [options, setOptions] = useState<string[]>(["", ""])
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [webSearch, setWebSearch] = useState("")
  const [userId, setUserId] = useState("")
  const [decision, setDecision] = useState<DecisionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [apiUrl] = useState("http://localhost:8000")
  const [error, setError] = useState("")

  // Generate bubbles data
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 80 + 30, // 30-110px
    left: Math.random() * 100, // 0-100%
    delay: Math.random() * 20, // 0-20s delay
    duration: Math.random() * 15 + 20, // 20-35s duration
  }))

  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const generateQuestions = async () => {
    setLoading(true)
    setError("")
    try {
      console.log("Making request to:", `${apiUrl}/generate-questions`)
      const response = await fetch(`${apiUrl}/generate-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          context,
          options: options.filter((opt) => opt.trim() !== ""),
        }),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to generate questions: ${response.status} ${response.statusText}`)
      }

      const data: QuestionResponse = await response.json()
      console.log("Success response:", data)
      setQuestions(data.questions)
      setWebSearch(data.web_search)
      setUserId(data.user_id)
      setStep("questions")
    } catch (err) {
      console.error("Request error:", err)
      setError(err instanceof Error ? err.message : "An error occurred while connecting to the server")
    } finally {
      setLoading(false)
    }
  }

  const generateDecision = async () => {
    setLoading(true)
    setError("")
    try {
      const questionAnswerPairs = questions.map((question, index) => ({
        question: question.question,
        answer: answers[index] || "",
      }))

      console.log("Making decision request to:", `${apiUrl}/generate-decision`)
      const response = await fetch(`${apiUrl}/generate-decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          user_id: userId,
          context,
          options: options.filter((opt) => opt.trim() !== ""),
          web_search: webSearch,
          question_answer_pairs: questionAnswerPairs,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Decision error response:", errorText)
        throw new Error(`Failed to generate decision: ${response.status} ${response.statusText}`)
      }

      const data: DecisionResponse = await response.json()
      setDecision(data)
      setStep("result")
    } catch (err) {
      console.error("Decision request error:", err)
      setError(err instanceof Error ? err.message : "An error occurred while generating the decision")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep("input")
    setContext("")
    setOptions(["", ""])
    setQuestions([])
    setAnswers({})
    setWebSearch("")
    setUserId("")
    setDecision(null)
    setError("")
    setCurrentQuestion(0)
  }

  const canProceedToQuestions = context.trim() !== "" && options.filter((opt) => opt.trim() !== "").length >= 2
  const canProceedToDecision = questions.every((_, index) => answers[index])

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

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-pink-500">
      {/* Organic gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large organic shapes */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-20 -right-32 w-80 h-80 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-32 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-600/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-10 -right-20 w-64 h-64 bg-gradient-to-br from-pink-400/40 to-orange-400/40 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>

        {/* Additional flowing gradients */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/50 via-transparent to-pink-500/30"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-purple-600/20 to-orange-400/30"></div>
      </div>

      {/* Animated Bubbles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bubbles.map((bubble) => (
          <Bubble
            key={bubble.id}
            size={bubble.size}
            left={bubble.left}
            delay={bubble.delay}
            duration={bubble.duration}
          />
        ))}

        {/* Additional decorative elements with new colors */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-300/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-300/15 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-10 w-8 h-8 bg-cyan-300/20 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 p-4 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Brain className="w-12 h-12 text-white drop-shadow-lg" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
              </div>
              <h1 className="text-5xl font-bold text-white drop-shadow-lg">Decision Helper</h1>
            </div>
            <p className="text-xl text-white/90 mb-6 drop-shadow-md">
              Smart decisions. Made simple. Delivered with confidence.
            </p>
          </div>

          {/* Input Step */}
          {step === "input" && (
            <Card className="shadow-2xl bg-blue-950/90 backdrop-blur-xl animate-slide-up border-blue-800">
              <CardHeader className="text-center pb-8"></CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="context" className="text-lg font-semibold text-blue-200 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-200" />
                    Decision Context
                  </Label>
                  <Textarea
                    id="context"
                    placeholder="e.g., The best smartphone for photography."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="bg-blue-200 text-blue-950 placeholder-blue-600 text-lg min-h-[120px] border-blue-300"
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-blue-200 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-200" />
                    Your Options
                  </Label>
                  <div className="space-y-4">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-3 group">
                        <div className="flex-1 relative">
                          <Input
                            placeholder={
                              index === 0 ? "iPhone 15 Pro" : index === 1 ? "Samsung Galaxy S25" : `Option ${index + 1}`
                            }
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="bg-blue-200 text-blue-950 placeholder-blue-600 text-lg h-14 pl-12 transition-all duration-300 border-blue-300"
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-950 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                        </div>
                        {options.length > 2 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeOption(index)}
                            className="h-14 w-14 bg-blue-200 border-blue-300 hover:bg-red-100"
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addOption}
                      className="w-full h-14 border-2 border-dashed border-blue-300 bg-transparent transition-all duration-300 text-blue-200 hover:bg-blue-200/10"
                    >
                      <Plus className="w-5 h-5" />
                      Add Another Option
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={generateQuestions}
                  disabled={!canProceedToQuestions || loading}
                  className="w-full h-16 text-xl font-semibold bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 text-blue-950"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing Your Context and Options...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      Process
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Questions Step */}
          {step === "questions" && (
            <div className="space-y-8">
              <Card className="shadow-2xl bg-blue-950/90 backdrop-blur-xl animate-slide-up border-blue-800">
                <CardHeader className="text-center">
                  <div className="w-full bg-blue-800 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {questions.length > 0 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-semibold text-white mb-6 leading-relaxed">
                          {questions[currentQuestion]?.question}
                        </h3>
                      </div>

                      <RadioGroup
                        value={answers[currentQuestion] || ""}
                        onValueChange={(value) => setAnswers({ ...answers, [currentQuestion]: value })}
                        className="space-y-4"
                      >
                        {questions[currentQuestion]?.answer_choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="group">
                            <div className="flex items-center space-x-4 p-4 rounded-xl border border-blue-700 bg-blue-900/50 hover:bg-blue-200 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                              <RadioGroupItem
                                value={choice}
                                id={`q${currentQuestion}-${choiceIndex}`}
                                className="border-blue-400 text-blue-200"
                              />
                              <Label
                                htmlFor={`q${currentQuestion}-${choiceIndex}`}
                                className="cursor-pointer text-blue-200 text-lg leading-relaxed flex-1 group-hover:text-blue-950 transition-colors duration-300"
                              >
                                {choice}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={currentQuestion === 0}
                      className="flex-1 h-12 bg-blue-200 text-blue-950 hover:bg-blue-300 border-blue-300"
                    >
                      Previous
                    </Button>
                    {currentQuestion < questions.length - 1 ? (
                      <Button
                        onClick={nextQuestion}
                        disabled={!answers[currentQuestion]}
                        className="flex-1 h-12 bg-yellow-400 hover:bg-yellow-500 hover:scale-105 text-blue-950"
                      >
                        Next Question
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={generateDecision}
                        disabled={!canProceedToDecision || loading}
                        className="flex-1 h-12 bg-yellow-400 hover:bg-yellow-500 hover:scale-105 text-blue-950"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Trophy className="w-5 h-5" />
                            Get My Decision
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Result Step */}
          {step === "result" && decision && (
            <div className="space-y-8 animate-slide-up">
              <Card className="shadow-2xl bg-blue-950/90 backdrop-blur-xl animate-slide-up border-blue-800">
                <CardHeader className="text-center pb-8">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="relative">
                      <Trophy className="w-16 h-16 text-yellow-400" />
                      <Star className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-blue-200 mb-4">🎉 Your Perfect Choice 🎉</CardTitle>
                  <div className="inline-block">
                    <Badge className="text-4xl px-8 py-3 bg-yellow-400 text-blue-950 font-bold">
                      {decision.chosen_option}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="bg-blue-200/90 backdrop-blur-sm p-8 rounded-2xl border border-blue-300">
                    <h3 className="text-2xl font-semibold mb-4 text-blue-950 flex items-center gap-2">
                      <Lightbulb className="w-8 h-8 text-blue-950" />
                      Why This Is Perfect For You
                    </h3>
                    <p className="text-blue-950 text-lg text-justify">{decision.reason}</p>
                  </div>

                  <Button
                    onClick={resetForm}
                    className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 text-blue-950"
                  >
                    <Sparkles className="w-6 h-6 mr-3" />
                    Make Another Decision
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
