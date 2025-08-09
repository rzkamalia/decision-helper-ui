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

interface Option {
  type: "text" | "image"
  content: string // For text: the text content, for image: base64 data URL
  file?: File // Store original file for image options
  base64?: string // Base64 encoded image data
}

interface DecisionContextType {
  // State
  context: string
  options: Option[]
  questions: Question[]
  answers: Record<number, string>
  webSearch: string
  userId: string
  decision: DecisionResponse | null
  loading: boolean
  error: string
  apiUrl: string
  isImageMode: boolean

  // Actions
  setContext: (context: string) => void
  setOptions: (options: Option[]) => void
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
  updateImageOption: (index: number, file: File) => void
  clearImageOption: (index: number) => void
  generateQuestions: () => Promise<void>
  generateDecision: () => Promise<void>
  undoAnswer: (questionIndex: number) => void
  clearAllAnswers: () => void
  goBackToQuestions: () => void
  switchToTextMode: () => void
}

const DecisionContext = createContext<DecisionContextType | undefined>(undefined)

const STORAGE_KEY = "decision-helper-state"

// Default initial state - always starts in text mode
const getInitialOptions = (): Option[] => [
  { type: "text", content: "" },
  { type: "text", content: "" },
]

export function DecisionProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState("")
  const [options, setOptions] = useState<Option[]>(getInitialOptions())
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [webSearch, setWebSearch] = useState("")
  const [userId, setUserId] = useState("")
  const [decision, setDecision] = useState<DecisionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  // const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://209.97.173.154:8000"
  const apiUrl = "http://0.0.0.0:8000"
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if we're in image mode (any option has an image)
  const isImageMode = options.some((option) => option.type === "image")

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY)
        if (savedState) {
          const parsedState = JSON.parse(savedState)
          setContext(parsedState.context || "")

          // Handle options with backward compatibility
          if (parsedState.options && Array.isArray(parsedState.options)) {
            if (typeof parsedState.options[0] === "string") {
              // Convert old string array format to new Option format
              setOptions(parsedState.options.map((opt: string) => ({ type: "text" as const, content: opt })))
            } else {
              // Use saved options, but ensure we have at least 2 options and they start as text if empty
              const savedOptions = parsedState.options || getInitialOptions()
              if (savedOptions.length < 2) {
                setOptions(getInitialOptions())
              } else {
                setOptions(savedOptions)
              }
            }
          } else {
            // No saved options, use initial text options
            setOptions(getInitialOptions())
          }

          setQuestions(parsedState.questions || [])
          setAnswers(parsedState.answers || {})
          setWebSearch(parsedState.webSearch || "")
          setUserId(parsedState.userId || "")
          setDecision(parsedState.decision || null)
        } else {
          // No saved state - ensure we start with text mode
          setOptions(getInitialOptions())
        }
      } catch (error) {
        console.error("Error loading state from localStorage:", error)
        // On error, default to text mode
        setOptions(getInitialOptions())
      }
      setIsInitialized(true)
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      const stateToSave = {
        context,
        options: options.map((opt) => ({ type: opt.type, content: opt.content })), // Don't save File objects
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
    // In image mode, max 3 options
    if (isImageMode && options.length >= 3) return

    const newOptionType = isImageMode ? "image" : "text"
    setOptions([...options, { type: newOptionType, content: "" }])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)

      // Check if we need to auto-switch to text mode after removing an option
      const hasAnyImages = newOptions.some((opt) => opt.type === "image" && opt.content.trim() !== "")
      if (!hasAnyImages && newOptions.some((opt) => opt.type === "image")) {
        // If no images left but still in image mode, switch to text mode
        setOptions(newOptions.map(() => ({ type: "text", content: "" })))
      }
    }
  }

  const updateOption = (index: number, value: string) => {
    // Only allow text updates if not in image mode
    if (isImageMode) return

    const newOptions = [...options]
    newOptions[index] = { type: "text", content: value }
    setOptions(newOptions)
  }

  const updateImageOption = (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newOptions = [...options]
      newOptions[index] = {
        type: "image",
        content: e.target?.result as string,
        file: file,
      }
      setOptions(newOptions)

      // If this is the first image, convert all other options to image type
      if (!isImageMode) {
        const updatedOptions = newOptions.map((opt, i) => (i === index ? opt : { type: "image" as const, content: "" }))
        // Limit to 3 options when switching to image mode
        setOptions(updatedOptions.slice(0, 3))
      }
    }
    reader.readAsDataURL(file)
  }

  const clearImageOption = (index: number) => {
    const newOptions = [...options]
    newOptions[index] = { type: "image", content: "" }
    setOptions(newOptions)

    // Check if all images are now empty - if so, auto-switch to text mode
    const hasAnyImages = newOptions.some((opt) => opt.type === "image" && opt.content.trim() !== "")
    if (!hasAnyImages) {
      // All images are cleared, switch to text mode
      setOptions(getInitialOptions())
    }
  }

  const switchToTextMode = () => {
    // Reset all options to text mode with empty content
    setOptions(getInitialOptions())
  }

  const undoAnswer = (questionIndex: number) => {
    const newAnswers = { ...answers }
    delete newAnswers[questionIndex]
    setAnswers(newAnswers)
  }

  const generateQuestions = async () => {
    setLoading(true)
    setError("")
    try {
      console.log("Making request to:", `${apiUrl}/generate-questions`)

      // Convert options to the format expected by the API
      const apiOptions = await Promise.all(
        options
          .filter((opt) => opt.content.trim() !== "")
          .map(async (opt) => {
            if (opt.type === "image" && opt.file) {
              // Convert image file to base64
              return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const result = e.target?.result as string;
                  const base64Data = result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                  resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(opt.file!);
              });
            } else if (opt.type === "image" && opt.base64) {
              // Use existing base64 data
              return opt.base64;
            } else {
              // Text option
              return opt.content;
            }
          })
      );

      const response = await fetch(`${apiUrl}/generate-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          context,
          options: apiOptions,
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
      setWebSearch(data.web_search_content)
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

      // Convert options to the format expected by the API
      const apiOptions = await Promise.all(
        options
          .filter((opt) => opt.content.trim() !== "")
          .map(async (opt) => {
            if (opt.type === "image" && opt.file) {
              // Convert image file to base64
              return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const result = e.target?.result as string;
                  const base64Data = result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                  resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(opt.file!);
              });
            } else if (opt.type === "image" && opt.base64) {
              // Use existing base64 data
              return opt.base64;
            } else {
              // Text option
              return opt.content;
            }
          })
      );
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
          options: apiOptions,
          question_answer_pairs: questionAnswerPairs,
          web_search_content: webSearch,
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
    setOptions(getInitialOptions())
    setQuestions([])
    setAnswers({})
    setWebSearch("")
    setUserId("")
    setDecision(null)
    setError("")
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const clearAllAnswers = () => {
    setAnswers({})
  }

  const goBackToQuestions = () => {
    setDecision(null)
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
        isImageMode,
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
        updateImageOption,
        clearImageOption,
        generateQuestions,
        generateDecision,
        undoAnswer,
        clearAllAnswers,
        goBackToQuestions,
        switchToTextMode,
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
