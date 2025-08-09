"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Brain, Target, Zap, Upload, ImageIcon } from "lucide-react"
import { useDecision } from "@/lib/decision-context"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { useRef } from "react"
import Image from "next/image"

export default function InputPage() {
  const router = useRouter()
  const {
    context,
    options,
    loading,
    isImageMode,
    setContext,
    addOption,
    removeOption,
    updateOption,
    updateImageOption,
    clearImageOption,
    switchToTextMode,
    generateQuestions,
  } = useDecision()

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const canProceedToQuestions = context.trim() !== "" && options.filter((opt) => opt.content.trim() !== "").length >= 2

  const handleGenerateQuestions = async () => {
    await generateQuestions()
    router.push("/questions")
  }

  const handleImageUpload = async (index: number, file: File) => {
    if (file && file.type.startsWith("image/")) {
      const img = new window.Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const maxDim = 640
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, { type: file.type })
                updateImageOption(index, resizedFile)
              }
            },
            file.type
          )
        }
      }
    }
  }

  const triggerFileInput = (index: number) => {
    fileInputRefs.current[index]?.click()
  }

  return (
    <LayoutWrapper>
      <Card className="shadow-2xl bg-blue-950 backdrop-blur-xl animate-slide-up">
        <CardHeader className="text-center pb-8"></CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="context" className="text-lg font-semibold text-blue-200 flex items-center gap-2">
              <Brain className="w-7 h-7 text-blue-200" />
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
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold text-blue-200 flex items-center gap-2">
                <Target className="w-7 h-7 text-blue-200" />
                Your Options
              </Label>
            </div>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex gap-3 group">
                  <div className="flex-1 relative">
                    {isImageMode ? (
                      <div className="relative">
                        <div
                          onClick={() => triggerFileInput(index)}
                          className="bg-blue-200 border-2 rounded-lg h-14 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors"
                        >
                          {option.content ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={option.content || "/placeholder.svg"}
                                alt={`Option ${index + 1}`}
                                fill
                                className="object-cover rounded-lg"
                              />
                              <div className="absolute top-2 left-2 w-6 h-6 bg-blue-950 rounded-full flex items-center justify-center text-blue-200 text-sm font-bold">
                                {index + 1}
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-blue-950" />
                              <span className="text-blue-950 text-sm">Upload Image</span>
                              <div className="absolute top-2 left-2 w-6 h-6 bg-blue-950 rounded-full flex items-center justify-center text-blue-200 text-sm font-bold">
                                {index + 1}
                              </div>
                            </>
                          )}
                        </div>
                        <input
                          ref={(el) => (fileInputRefs.current[index] = el)}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(index, file)
                          }}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <>
                        <Input
                          placeholder={
                            index === 0 ? "iPhone 15 Pro" : index === 1 ? "Samsung Galaxy S25" : `Option ${index + 1}`
                          }
                          value={option.content}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="bg-blue-200 text-blue-950 placeholder-blue-200 text-lg h-14 pl-12 transition-all duration-300"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-950 rounded-full flex items-center justify-center text-blue-200 text-sm font-bold">
                          {index + 1}
                        </div>
                        {/* Hidden file input for potential image upload */}
                        <input
                          ref={(el) => (fileInputRefs.current[index] = el)}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(index, file)
                          }}
                          className="hidden"
                        />
                        {/* Upload button overlay */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => triggerFileInput(index)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-950 hover:text-blue-950 hover:bg-white"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  {/* Single delete button logic */}
                  {isImageMode
                    ? // In image mode: show delete button only if there's an image to clear OR if more than 2 options
                      (option.content.trim() !== "" || options.length > 2) && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (option.content.trim() !== "") {
                              // If there's an image, clear it
                              clearImageOption(index)
                            } else {
                              // If no image, remove the entire option
                              removeOption(index)
                            }
                          }}
                          className="h-14 w-14 bg-blue-200 hover:bg-white"
                        >
                          <X className="w-5 h-5 text-red-500" />
                        </Button>
                      )
                    : // In text mode: show delete button only if more than 2 options
                      options.length > 2 && (
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
              {(!isImageMode || options.length < 3) && (
                <Button
                  variant="outline"
                  onClick={addOption}
                  className="w-full h-14 border-2 border-dashed border-blue-200 bg-transparent transition-all duration-300 text-blue-200 hover:bg-blue-200"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Option
                  {isImageMode && ` (${3 - options.length} remaining)`}
                </Button>
              )}
            </div>
          </div>

          {isImageMode && (
            <div className="bg-blue-200 p-4 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ImageIcon className="w-6 h-6 text-blue-950 mt-3" />
                  <div className="text-sm text-blue-950">
                    <p className="font-medium mb-1">Image Mode Active</p>
                    <p>All options must be images. Maximum 3 options allowed.</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchToTextMode}
                  className="bg-yellow-600 border-blue-950 text-blue-950 hover:bg-yellow-600 hover:scale-105 text-xs px-3 py-1 h-auto"
                >
                  Switch to Text
                </Button>
              </div>
            </div>
          )}

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
