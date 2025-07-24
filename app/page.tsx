"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Brain, Target, Zap } from "lucide-react"
import { useDecision } from "@/lib/decision-context"
import { LayoutWrapper } from "@/components/layout-wrapper"

export default function InputPage() {
  const router = useRouter()
  const { context, options, loading, setContext, addOption, removeOption, updateOption, generateQuestions } =
    useDecision()

  const canProceedToQuestions = context.trim() !== "" && options.filter((opt) => opt.trim() !== "").length >= 2

  const handleGenerateQuestions = async () => {
    await generateQuestions()
    router.push("/questions")
  }

  return (
    <LayoutWrapper>
      <Card className="shadow-2xl bg-blue-950 backdrop-blur-xl animate-slide-up">
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
              className="bg-blue-200 text-blue-950 placeholder-blue-200 text-lg min-h-[120px]"
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
                      className="bg-blue-200 text-blue-950 placeholder-blue-200 text-lg h-14 pl-12 transition-all duration-300"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-950 rounded-full flex items-center justify-center text-blue-200 text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  {options.length > 2 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                      className="h-14 w-14 bg-blue-200 hover:bg-white"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addOption}
                className="w-full h-14 border-2 border-dashed border-blue-200 bg-transparent transition-all duration-300 text-blue-200 hover:bg-blue-200"
              >
                <Plus className="w-5 h-5" />
                Add Another Option
              </Button>
            </div>
          </div>

          <Button
            onClick={handleGenerateQuestions}
            disabled={!canProceedToQuestions || loading}
            className="w-full h-16 text-xl text-blue-950 font-semibold bg-yellow-600 hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            {loading ? (
              <>Analyzing Your Context and Options...</>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                Process
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </LayoutWrapper>
  )
}
