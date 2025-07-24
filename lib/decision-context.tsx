"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Question {
  question: string
  answer_choices: string[]
}

interface DecisionResponse {
  chosen_option: string
  reason: string
  user_id: string
}

interface DecisionContextType {
  // State
  context: string
  options: string[]
  questions: Question[]
  answers: Record<number, string>
  webSearch: string
  userId: string
  decision: DecisionResponse | null
  loading: boolean
  error: string
  apiUrl: string

  // Actions
  setContext: (context: string) => void
  setOptions: (options: string[]) => void
  setQuestions: (questions: Question[]) => void
  setAnswers: (answers: Record<number, string>) => void
  setWebSearch: (webSearch: string) => void
  setUserId: (userId: string) => void
  setDecision: (decision: DecisionResponse | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  resetForm: () => void
  addOption: () => void
  removeOption: (index: number) => void
  updateOption: (index: number, value: string) => void
  generateQuestions: () => Promise<void>
  generateDecision: () => Promise<void>
}

const DecisionContext = createContext<DecisionContextType | undefined>(undefined)

const STORAGE_KEY = "decision-helper-state"

export function DecisionProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState("")
  const [options, setOptions] = useState<string[]>(["", ""])
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [webSearch, setWebSearch] = useState("")
  const [userId, setUserId] = useState("")
  const [decision, setDecision] = useState<DecisionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [apiUrl] = useState("http://localhost:8000")

  const [isInitialized, setIsInitialized] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY)
        if (savedState) {
          const parsedState = JSON.parse(savedState)
          setContext(parsedState.context || "")
          setOptions(parsedState.options || ["", ""])
          setQuestions(parsedState.questions || [])
          setAnswers(parsedState.answers || {})
          setWebSearch(parsedState.webSearch || "")
          setUserId(parsedState.userId || "")
          setDecision(parsedState.decision || null)
        }
      } catch (error) {
        console.error("Error loading state from localStorage:", error)
      }
      setIsInitialized(true)
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      const stateToSave = {
        context,
        options,
        questions,
        answers,
        webSearch,
        userId,
        decision,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    }
  }, [context, options, questions, answers, webSearch, userId, decision, isInitialized])
  
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

      const data = await response.json()
      console.log("Success response:", data)
      setQuestions(data.questions)
      setWebSearch(data.web_search)
      setUserId(data.user_id)
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

      const data = await response.json()
      setDecision(data)
    } catch (err) {
      console.error("Decision request error:", err)
      setError(err instanceof Error ? err.message : "An error occurred while generating the decision")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setContext("")
    setOptions(["", ""])
    setQuestions([])
    setAnswers({})
    setWebSearch("")
    setUserId("")
    setDecision(null)
    setError("")
  }

  return (
    <DecisionContext.Provider
      value={{
        context,
        options,
        questions,
        answers,
        webSearch,
        userId,
        decision,
        loading,
        error,
        apiUrl,
        setContext,
        setOptions,
        setQuestions,
        setAnswers,
        setWebSearch,
        setUserId,
        setDecision,
        setLoading,
        setError,
        resetForm,
        addOption,
        removeOption,
        updateOption,
        generateQuestions,
        generateDecision,
      }}
    >
      {children}
    </DecisionContext.Provider>
  )
}

export function useDecision() {
  const context = useContext(DecisionContext)
  if (context === undefined) {
    throw new Error("useDecision must be used within a DecisionProvider")
  }
  return context
}
