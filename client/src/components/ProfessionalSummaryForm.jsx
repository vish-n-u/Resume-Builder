import { Loader2, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import QuillEditor from './QuillTextEditor'

const ProfessionalSummaryForm = ({data, onChange, setResumeData}) => {

  const { token } = useSelector(state => state.auth)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateSummary = async () => {
    try {
      setIsGenerating(true)
      const prompt = `enhance my professional summary "${data}"`;
      const response = await api.post('/api/ai/enhance-pro-sum', {userContent: prompt}, {headers: { Authorization: token }})
      setResumeData(prev => ({...prev, professional_summary: response.data.enhancedContent}))
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    finally{
      setIsGenerating(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'> Professional Summary </h3>
            <p className='text-sm text-gray-500'>Add summary for your resume here</p>
        </div>
        <button disabled={isGenerating} onClick={generateSummary} className='flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'>
          {isGenerating ? (<Loader2 className="size-4 animate-spin"/>) : ( <Sparkles className="size-4"/>)}
           {isGenerating ? "Enhancing..." : "AI Enhance"}
            
        </button>
      </div>

      <div className="mt-6">
        <QuillEditor content={data || ""} onTextChange={(value)=> onChange(value)} />
        <p className='text-xs text-gray-500 max-w-4/5 mx-auto text-center mt-2'>Tip: Keep it concise (3-4 sentences) and focus on your most relevant achievements and skills.</p>
      </div>
    </div>
  )
}

export default ProfessionalSummaryForm
