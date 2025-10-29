import React, { useState } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import api from '../configs/api'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

const CustomPromptModal = ({ isOpen, onClose, resumeData, setResumeData }) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
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

      // Merge the AI-generated data with existing resume data
      const updatedData = { ...resumeData, ...response.data.generatedData }
      setResumeData(updatedData)

      toast.success('Resume data generated successfully!')
      setPrompt('')
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
              <br />• "Create 3 achievements highlighting my leadership skills"
              <br />• "Add a certification for AWS Cloud Practitioner completed in 2024"
              <br />• "Generate a professional summary emphasizing my data science experience"
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

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> The AI will use your existing resume data as context and maintain the correct format for the frontend. It will not fabricate information not related to your prompt.
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
