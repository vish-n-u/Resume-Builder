import React, { useState } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import api from '../configs/api'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

const CustomPromptModal = ({ isOpen, onClose, resumeData, setResumeData }) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiUnderstanding, setAiUnderstanding] = useState(null)
  const { token } = useSelector(state => state.auth)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    try {
      setIsGenerating(true)

      const response = await api.post(
        '/api/ai/custom-prompt',
        {
          userPrompt: prompt,
          currentResumeData: resumeData
        },
        {
          headers: { Authorization: token }
        }
      )

      // Check if the request is supported
      if (response.data.supported === false) {
        // Show detailed error message for unsupported requests
        const errorMessage = response.data.reason || 'This request is not supported'
        const suggestion = response.data.suggestion

        toast.error(
          <div className="space-y-2">
            <div className="font-semibold">Request Not Supported</div>
            <div className="text-sm">{errorMessage}</div>
            {suggestion && (
              <div className="text-sm mt-2 pt-2 border-t border-gray-300">
                <span className="font-medium">Tip: </span>{suggestion}
              </div>
            )}
          </div>,
          {
            duration: 6000,
            style: {
              maxWidth: '500px'
            }
          }
        )
        return
      }

      // Show AI understanding if available
      if (response.data.understanding) {
        setAiUnderstanding(response.data.understanding)
      }

      // Merge the AI-generated data with existing resume data
      const updatedData = { ...resumeData, ...response.data.generatedData }
      setResumeData(updatedData)

      toast.success('Resume updated successfully!')
      setPrompt('')
      setAiUnderstanding(null)
      onClose()
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to generate content')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">AI Custom Prompt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isGenerating}
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-2">
              Describe what you want to add or modify in your resume. The AI will generate content based on your existing data and the format required for your resume.
            </p>
            <p className="text-gray-500 text-xs">
              <strong>Examples:</strong>
              <br />• "Add a project about building a mobile app with React Native"
              <br />• "Highlight skills in my 2nd job" - Adds bold to technical skills
              <br />• "Format all project descriptions with bullet points"
              <br />• "Improve the description of my first experience"
              <br />• "Add AWS certification completed in 2024"
              <br />• "Make all experience descriptions more concise"
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Custom Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Add a project about an e-commerce website I built using React and Node.js with payment integration..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={6}
              disabled={isGenerating}
            />
          </div>

          {aiUnderstanding && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-sm font-semibold mb-2">
                ✓ AI Understanding:
              </p>
              <p className="text-green-700 text-sm italic">
                "{aiUnderstanding.enhanced_prompt}"
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>How it works:</strong> The AI first understands your request in detail, then generates the content. This ensures accurate modifications even for specific requests like "highlight skills in my 2nd job".
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomPromptModal
