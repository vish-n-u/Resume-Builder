import { Briefcase, Loader2, Plus, Sparkles, Trash2, Lightbulb, X } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import QuillEditor from './QuillTextEditor'

const ExperienceForm = ({ data, onChange, jobDescription }) => {

    const { token } = useSelector(state => state.auth)
    const [generatingIndex, setGeneratingIndex] = useState(-1)
    const [suggestingIndex, setSuggestingIndex] = useState(-1)
    const [suggestions, setSuggestions] = useState({})
    const [showSuggestions, setShowSuggestions] = useState({})

const addExperience = () =>{
    const newExperience = {
        company: "",
        position: "",
        start_date: "",
        end_date: "",
        description: "",
        is_current: false
    };
    onChange([...data, newExperience])
}

const removeExperience = (index)=>{
    const updated = data.filter((_, i)=> i !== index);
    onChange(updated)
}

const updateExperience = (index, field, value)=>{
    const updated = [...data];
    updated[index] = {...updated[index], [field]: value}
    onChange(updated)
}

 const generateDescription = async (index) => {
    setGeneratingIndex(index)
    const experience = data[index]
    const prompt = `enhance this job description ${experience.description} for the position of ${experience.position} at ${experience.company}.`

    try {
        const { data } = await api.post('api/ai/enhance-job-desc', {userContent: prompt}, { headers: { Authorization: token } })
        updateExperience(index, "description", data.enhancedContent)
    } catch (error) {
        toast.error(error.message)
    }finally{
        setGeneratingIndex(-1)
    }
 }

 const generateSuggestions = async (index) => {
    if (!jobDescription || jobDescription.trim() === '') {
        toast.error('No job description found for this resume. Please create a resume using the AI-Tailored Resume feature.')
        return
    }

    setSuggestingIndex(index)
    const experience = data[index]

    try {
        const { data: responseData } = await api.post('api/ai/suggest-job-desc', {
            currentDescription: experience.description || '',
            jobDescription: jobDescription,
            position: experience.position,
            company: experience.company
        }, { headers: { Authorization: token } })

        setSuggestions(prev => ({...prev, [index]: responseData.suggestions}))
        setShowSuggestions(prev => ({...prev, [index]: true}))
        toast.success('Suggestions generated successfully!')
    } catch (error) {
        toast.error(error.response?.data?.message || error.message)
    } finally {
        setSuggestingIndex(-1)
    }
 }

 const addSuggestionToDescription = (index, suggestion) => {
    const experience = data[index]
    const currentDescription = experience.description || ''

    // Strip HTML tags to check if content is truly empty
    const stripHtml = (html) => {
        const tmp = document.createElement('div')
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ''
    }

    const isCurrentlyEmpty = stripHtml(currentDescription).trim() === ''

    // Add suggestion as a list item for better formatting
    let newDescription
    if (isCurrentlyEmpty) {
        // Start a new list if empty
        newDescription = `<ul><li>${suggestion}</li></ul>`
    } else {
        // Check if current content already has a list
        if (currentDescription.includes('<ul>') || currentDescription.includes('<ol>')) {
            // Insert before the closing list tag
            newDescription = currentDescription.replace('</ul>', `<li>${suggestion}</li></ul>`)
            if (!newDescription.includes(`<li>${suggestion}</li>`)) {
                // If no <ul>, try <ol>
                newDescription = currentDescription.replace('</ol>', `<li>${suggestion}</li></ol>`)
            }
            if (!newDescription.includes(`<li>${suggestion}</li>`)) {
                // No list found, append with line break
                newDescription = currentDescription + `<p>${suggestion}</p>`
            }
        } else {
            // No existing list, add as new paragraph
            newDescription = currentDescription + `<p>${suggestion}</p>`
        }
    }

    updateExperience(index, "description", newDescription)
    toast.success('Suggestion added to description!')
 }

 const closeSuggestions = (index) => {
    setShowSuggestions(prev => ({...prev, [index]: false}))
 }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'> Professional Experience </h3>
            <p className='text-sm text-gray-500'>Add your job experience</p>
        </div>
        <button onClick={addExperience} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
            <Plus className="size-4"/>
            Add Experience
        </button>
      </div>

      {data.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
            <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
            <p>No work experience added yet.</p>
            <p className="text-sm">Click "Add Experience" to get started.</p>
        </div>
      ): (
        <div className='space-y-4'>
            {data.map((experience, index)=>(
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className='flex justify-between items-start'>
                        <h4>Experience #{index + 1}</h4>
                        <button onClick={()=> removeExperience(index)} className='text-red-500 hover:text-red-700 transition-colors'>
                            <Trash2 className="size-4"/>
                        </button>
                    </div>

                    <div className='grid md:grid-cols-2 gap-3'>

                        <input value={experience.company || ""} onChange={(e)=>updateExperience(index, "company", e.target.value)} type="text" placeholder="Company Name" className="px-3 py-2 text-sm rounded-lg"/>

                        <input value={experience.position || ""} onChange={(e)=>updateExperience(index, "position", e.target.value)} type="text" placeholder="Job Title" className="px-3 py-2 text-sm rounded-lg"/>

                        <input value={experience.start_date || ""} onChange={(e)=>updateExperience(index, "start_date", e.target.value)} type="month" className="px-3 py-2 text-sm rounded-lg"/>

                        <input value={experience.end_date || ""} onChange={(e)=>updateExperience(index, "end_date", e.target.value)} type="month" disabled={experience.is_current} className="px-3 py-2 text-sm rounded-lg disabled:bg-gray-100"/>
                    </div>

                    <label className='flex items-center gap-2'>
                        <input type="checkbox" checked={experience.is_current || false} onChange={(e)=>{updateExperience(index, "is_current", e.target.checked ? true : false); }} className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'/>
                        <span className='text-sm text-gray-700'>Currently working here</span>
                    </label>

                    <div className="space-y-2">
                        <div className='flex items-center justify-between'>
                            <label className='text-sm font-medium text-gray-700'>Job Description</label>
                            <div className='flex items-center gap-2'>
                                {/* <button onClick={()=> generateDescription(index)} disabled={generatingIndex === index || !experience.position || !experience.company} className='flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'>
                                    {generatingIndex === index ? (
                                        <Loader2 className="w-3 h-3 animate-spin"/>
                                    ): (
                                        <Sparkles className='w-3 h-3'/>
                                    )}
                                    Enhance with AI
                                </button> */}
                                <button onClick={()=> generateSuggestions(index)} disabled={suggestingIndex === index || !jobDescription} className='flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50' title={!jobDescription ? 'No job description available for this resume' : 'Get AI suggestions based on job description'}>
                                    {suggestingIndex === index ? (
                                        <Loader2 className="w-3 h-3 animate-spin"/>
                                    ): (
                                        <Lightbulb className='w-3 h-3'/>
                                    )}
                                    Provide AI Suggestion
                                </button>
                            </div>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions[index] && suggestions[index] && (
                            <div className='relative'>
                                <div className='absolute top-0 left-0 right-0 bg-white border border-blue-300 rounded-lg shadow-lg p-4 z-10 max-h-96 overflow-y-auto'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <h4 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
                                            <Lightbulb className='w-4 h-4 text-blue-600'/>
                                            AI Suggestions
                                        </h4>
                                        <button onClick={() => closeSuggestions(index)} className='text-gray-400 hover:text-gray-600'>
                                            <X className='w-4 h-4'/>
                                        </button>
                                    </div>
                                    <div className='space-y-2'>
                                        {suggestions[index].map((suggestion, suggestionIndex) => (
                                            <div key={suggestionIndex} className='flex items-start gap-2 p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors'>
                                                <p className='flex-1 text-sm text-gray-700'>{suggestion}</p>
                                                <button
                                                    onClick={() => addSuggestionToDescription(index, suggestion)}
                                                    className='flex-shrink-0 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                                                    title='Add to description'
                                                >
                                                    <Plus className='w-4 h-4'/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <QuillEditor content={experience.description || ""} onTextChange={(value)=> updateExperience(index, "description", value)} rows={4} className="w-full text-sm px-3 py-2 rounded-lg resize-none" readOnly={true}/>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default ExperienceForm
