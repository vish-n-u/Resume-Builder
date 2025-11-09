import React, { useState, useEffect } from 'react'
import { X, MapPin, Mail, Send, Award, FileText, Briefcase, CheckCircle, Sparkles, Loader2, AlertCircle, Clock, GraduationCap } from 'lucide-react'
import api from '../configs/api'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

const JobRequirementsModal = ({ isOpen, onClose, jobDescription }) => {
  const { token } = useSelector(state => state.auth)
  const [isExtracting, setIsExtracting] = useState(false)
  const [requirements, setRequirements] = useState(null)
  const [checkedItems, setCheckedItems] = useState({})

  // Auto-extract when modal opens
  useEffect(() => {
    if (isOpen && jobDescription && !requirements) {
      handleExtractFromJD()
    }
  }, [isOpen, jobDescription])

  const handleExtractFromJD = async () => {
    if (!jobDescription || jobDescription.trim() === '') {
      return
    }

    try {
      setIsExtracting(true)

      const response = await api.post(
        '/api/ai/extract-job-requirements',
        { jobDescription },
        { headers: { Authorization: token } }
      )

      if (response.data.success) {
        setRequirements(response.data.requirements)
      }
    } catch (error) {
      console.error('Error extracting job requirements:', error)
      toast.error('Failed to extract job requirements')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleCheckItem = (key) => {
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleReExtract = () => {
    setRequirements(null)
    setCheckedItems({})
    handleExtractFromJD()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-7" />
            <div>
              <h2 className="text-xl font-bold">Job Requirements Checklist</h2>
              <p className="text-blue-100 text-sm">Don't miss these key details when tailoring your resume</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!jobDescription || jobDescription.trim() === '' ? (
            <div className="text-center py-12">
              <FileText className="size-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No Job Description Found</p>
              <p className="text-gray-400 text-sm">Add a job description to your resume to see the requirements</p>
            </div>
          ) : isExtracting ? (
            <div className="text-center py-12">
              <Loader2 className="size-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-700 text-lg mb-2">Analyzing Job Description...</p>
              <p className="text-gray-500 text-sm">AI is extracting key requirements from the JD</p>
            </div>
          ) : requirements ? (
            <div className="space-y-6">
              {/* Re-extract button */}
              <div className="flex justify-end">
                <button
                  onClick={handleReExtract}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Sparkles className="size-4" />
                  Re-analyze JD
                </button>
              </div>

              {/* Location */}
              {requirements.workplaceLocation && (
                <RequirementItem
                  icon={MapPin}
                  title="Location & Work Type"
                  content={requirements.workplaceLocation}
                  itemKey="location"
                  checked={checkedItems.location}
                  onCheck={handleCheckItem}
                  color="green"
                />
              )}

              {/* How to Apply */}
              {(requirements.applicationEmail || requirements.portalUrl) && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Send className="size-6 text-yellow-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="size-4" />
                        How to Apply - Important!
                      </h3>
                      {requirements.applicationEmail && (
                        <div className="mb-2">
                          <span className="text-yellow-800 font-medium">Email: </span>
                          <a href={`mailto:${requirements.applicationEmail}`} className="text-blue-600 hover:underline">
                            {requirements.applicationEmail}
                          </a>
                        </div>
                      )}
                      {requirements.portalUrl && (
                        <div>
                          <span className="text-yellow-800 font-medium">Portal: </span>
                          <a href={requirements.portalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {requirements.portalUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Required Skills */}
              {requirements.requiredSkills && (
                <RequirementItem
                  icon={CheckCircle}
                  title="Required Skills"
                  content={requirements.requiredSkills}
                  itemKey="skills"
                  checked={checkedItems.skills}
                  onCheck={handleCheckItem}
                  color="blue"
                  isList
                />
              )}

              {/* Required Certifications */}
              {requirements.requiredCertifications && (
                <RequirementItem
                  icon={Award}
                  title="Required Certifications"
                  content={requirements.requiredCertifications}
                  itemKey="certifications"
                  checked={checkedItems.certifications}
                  onCheck={handleCheckItem}
                  color="purple"
                  isList
                />
              )}

              {/* Experience Required */}
              {requirements.experience && (
                <RequirementItem
                  icon={Clock}
                  title="Experience Required"
                  content={requirements.experience}
                  itemKey="experience"
                  checked={checkedItems.experience}
                  onCheck={handleCheckItem}
                  color="orange"
                />
              )}

              {/* Education Required */}
              {requirements.education && (
                <RequirementItem
                  icon={GraduationCap}
                  title="Education Required"
                  content={requirements.education}
                  itemKey="education"
                  checked={checkedItems.education}
                  onCheck={handleCheckItem}
                  color="indigo"
                />
              )}

              {/* Additional Requirements */}
              {requirements.additionalRequirements && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-6 text-red-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">
                        Other Important Requirements
                      </h3>
                      <div className="text-red-800 whitespace-pre-wrap">
                        {requirements.additionalRequirements}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer tip */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-2">
                  <Sparkles className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>Tip:</strong> Check off items as you address them in your resume. Make sure all key requirements are covered before applying!
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="size-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Failed to extract requirements</p>
              <button
                onClick={handleExtractFromJD}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const RequirementItem = ({ icon: Icon, title, content, itemKey, checked, onCheck, color, isList }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  }

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    indigo: 'text-indigo-600',
  }

  return (
    <div className={`border-l-4 rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-start gap-3">
        <Icon className={`size-6 ${iconColorClasses[color]} mt-1 flex-shrink-0`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{title}</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onCheck(itemKey)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600">Covered</span>
            </label>
          </div>
          <div className={`${checked ? 'opacity-50 line-through' : ''} whitespace-pre-wrap`}>
            {isList ? (
              <ul className="list-disc list-inside space-y-1">
                {content.split('\n').filter(line => line.trim()).map((line, idx) => (
                  <li key={idx}>{line.trim()}</li>
                ))}
              </ul>
            ) : (
              <p>{content}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobRequirementsModal
