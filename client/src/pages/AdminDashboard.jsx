import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '../configs/api'
import { LoaderCircleIcon, UsersIcon, FileTextIcon, ChevronDownIcon, EyeIcon, XIcon, UserIcon, BriefcaseIcon, GraduationCapIcon, CodeIcon, AwardIcon, MailIcon, PhoneIcon, MapPinIcon, LinkedinIcon, GlobeIcon } from 'lucide-react'
import ResumePreview from '../components/ResumePreview'

const AdminDashboard = () => {
  const { token } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [resumesLoading, setResumesLoading] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)

  // Resume preview modal
  const [showPreview, setShowPreview] = useState(false)
  const [previewResume, setPreviewResume] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(null)
  const [previewResumeId, setPreviewResumeId] = useState(null)

  // Profile modal
  const [showProfile, setShowProfile] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileUserId, setProfileUserId] = useState(null)
  const [profileUserName, setProfileUserName] = useState('')

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/admin/users', { headers: { Authorization: token } })
      setUsers(data)
    } catch (error) {
      if (error?.response?.status === 403) {
        setUnauthorized(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchResumes = async (userId) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null)
      setResumes([])
      return
    }
    setSelectedUserId(userId)
    setResumesLoading(true)
    try {
      const { data } = await api.get(`/api/admin/users/${userId}/resumes`, { headers: { Authorization: token } })
      setResumes(data)
    } catch (error) {
      setResumes([])
    } finally {
      setResumesLoading(false)
    }
  }

  // Resume preview
  const viewResume = (e, resumeId) => {
    e.stopPropagation()
    e.preventDefault()
    setPreviewResumeId(resumeId)
  }

  useEffect(() => {
    if (!previewResumeId) return
    setShowPreview(true)
    setPreviewLoading(true)
    setPreviewResume(null)
    setPreviewError(null)

    api.get(`/api/admin/resumes/${previewResumeId}`, { headers: { Authorization: token } })
      .then(({ data }) => {
        setPreviewResume(data.resume)
      })
      .catch((error) => {
        setPreviewError(error?.response?.data?.message || error.message || 'Unknown error')
      })
      .finally(() => {
        setPreviewLoading(false)
      })
  }, [previewResumeId])

  const closePreview = () => {
    setShowPreview(false)
    setPreviewResume(null)
    setPreviewLoading(false)
    setPreviewError(null)
    setPreviewResumeId(null)
  }

  // Profile view
  const viewProfile = (e, userId, userName) => {
    e.stopPropagation()
    e.preventDefault()
    setProfileUserName(userName)
    setProfileUserId(userId)
  }

  useEffect(() => {
    if (!profileUserId) return
    setShowProfile(true)
    setProfileLoading(true)
    setProfileData(null)
    setProfileError(null)

    api.get(`/api/admin/users/${profileUserId}/profile`, { headers: { Authorization: token } })
      .then(({ data }) => {
        setProfileData(data.profile)
      })
      .catch((error) => {
        setProfileError(error?.response?.data?.message || error.message || 'Unknown error')
      })
      .finally(() => {
        setProfileLoading(false)
      })
  }, [profileUserId])

  const closeProfile = () => {
    setShowProfile(false)
    setProfileData(null)
    setProfileLoading(false)
    setProfileError(null)
    setProfileUserId(null)
    setProfileUserName('')
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <LoaderCircleIcon className='animate-spin size-8 text-yellow-600' />
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-16 text-center'>
        <h2 className='text-2xl font-bold text-slate-800 mb-2'>Not Authorized</h2>
        <p className='text-slate-500 mb-6'>You do not have permission to access the admin dashboard.</p>
        <button onClick={() => navigate('/app')} className='px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors'>
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg'>
          <UsersIcon className='size-6 text-white' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-slate-800'>Admin Dashboard</h1>
          <p className='text-sm text-slate-500'>{users.length} registered {users.length === 1 ? 'user' : 'users'}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className='bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-slate-50 border-b border-slate-200'>
                <th className='text-left px-4 py-3 font-semibold text-slate-700'>Name</th>
                <th className='text-left px-4 py-3 font-semibold text-slate-700'>Email</th>
                <th className='text-left px-4 py-3 font-semibold text-slate-700'>Joined</th>
                <th className='text-center px-4 py-3 font-semibold text-slate-700'>Resumes</th>
                <th className='text-center px-4 py-3 font-semibold text-slate-700'>Profile</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <React.Fragment key={user._id}>
                  <tr
                    onClick={() => fetchResumes(user._id)}
                    className={`border-b border-slate-100 hover:bg-yellow-50 cursor-pointer transition-colors ${selectedUserId === user._id ? 'bg-yellow-50' : ''}`}
                  >
                    <td className='px-4 py-3 font-medium text-slate-800 flex items-center gap-2'>
                      {user.name}
                      <ChevronDownIcon className={`size-4 text-slate-400 transition-transform ${selectedUserId === user._id ? 'rotate-180' : ''}`} />
                    </td>
                    <td className='px-4 py-3 text-slate-600'>{user.email}</td>
                    <td className='px-4 py-3 text-slate-600'>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className='px-4 py-3 text-center'>
                      <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium'>
                        <FileTextIcon className='size-3' />
                        {user.resumeCount}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <button
                        onClick={(e) => viewProfile(e, user._id, user.name)}
                        className='inline-flex items-center gap-1 px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded-md text-xs font-medium transition-colors'
                      >
                        <UserIcon className='size-3' />
                        View
                      </button>
                    </td>
                  </tr>

                  {/* Expanded resumes row */}
                  {selectedUserId === user._id && (
                    <tr>
                      <td colSpan={5} className='px-4 py-3 bg-slate-50'>
                        {resumesLoading ? (
                          <div className='flex items-center justify-center py-4'>
                            <LoaderCircleIcon className='animate-spin size-5 text-yellow-600' />
                          </div>
                        ) : resumes.length === 0 ? (
                          <p className='text-slate-500 text-center py-4'>No resumes found</p>
                        ) : (
                          <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                              <thead>
                                <tr className='border-b border-slate-200'>
                                  <th className='text-left px-3 py-2 font-medium text-slate-600'>Title</th>
                                  <th className='text-left px-3 py-2 font-medium text-slate-600'>Template</th>
                                  <th className='text-left px-3 py-2 font-medium text-slate-600'>Created</th>
                                  <th className='text-left px-3 py-2 font-medium text-slate-600'>Updated</th>
                                  <th className='text-center px-3 py-2 font-medium text-slate-600'>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {resumes.map((resume) => (
                                  <tr key={resume._id} className='border-b border-slate-100'>
                                    <td className='px-3 py-2 text-slate-800'>{resume.title}</td>
                                    <td className='px-3 py-2'>
                                      <span className='px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs capitalize'>{resume.template}</span>
                                    </td>
                                    <td className='px-3 py-2 text-slate-500'>{new Date(resume.createdAt).toLocaleDateString()}</td>
                                    <td className='px-3 py-2 text-slate-500'>{new Date(resume.updatedAt).toLocaleDateString()}</td>
                                    <td className='px-3 py-2 text-center'>
                                      <button
                                        onClick={(e) => viewResume(e, resume._id)}
                                        className='inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs font-medium transition-colors'
                                      >
                                        <EyeIcon className='size-3' />
                                        View
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resume Preview Modal */}
      {showPreview && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8' onMouseDown={closePreview}>
          <div className='relative w-full max-w-3xl' onMouseDown={e => e.stopPropagation()}>
            <button
              onClick={closePreview}
              className='absolute -top-2 -right-2 z-10 p-2 bg-white hover:bg-slate-100 rounded-full shadow-lg transition-colors'
            >
              <XIcon className='size-5 text-slate-700' />
            </button>

            {previewLoading ? (
              <div className='flex items-center justify-center py-20 bg-white rounded-xl'>
                <LoaderCircleIcon className='animate-spin size-8 text-yellow-600' />
              </div>
            ) : previewError ? (
              <div className='flex flex-col items-center justify-center py-16 bg-white rounded-xl'>
                <p className='text-slate-500 mb-2'>Failed to load resume</p>
                <p className='text-red-500 text-sm mb-4'>{previewError}</p>
                <button onClick={closePreview} className='px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm'>Close</button>
              </div>
            ) : previewResume ? (
              <div>
                <div className='bg-white rounded-t-xl px-4 py-3 border-b border-slate-200'>
                  <h3 className='font-semibold text-slate-800'>{previewResume.title}</h3>
                  <p className='text-xs text-slate-500'>Template: {previewResume.template} | Last updated: {new Date(previewResume.updatedAt).toLocaleDateString()}</p>
                </div>
                <ResumePreview data={previewResume} template={previewResume.template || 'classic'} accentColor={previewResume.accent_color || '#000000'} classes='py-4 bg-white' />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8' onMouseDown={closeProfile}>
          <div className='relative w-full max-w-3xl bg-white rounded-xl shadow-2xl' onMouseDown={e => e.stopPropagation()}>
            <button
              onClick={closeProfile}
              className='absolute top-3 right-3 z-10 p-2 hover:bg-slate-100 rounded-full transition-colors'
            >
              <XIcon className='size-5 text-slate-700' />
            </button>

            {profileLoading ? (
              <div className='flex items-center justify-center py-20'>
                <LoaderCircleIcon className='animate-spin size-8 text-yellow-600' />
              </div>
            ) : profileError ? (
              <div className='flex flex-col items-center justify-center py-16'>
                <p className='text-slate-500 mb-2'>Failed to load profile</p>
                <p className='text-red-500 text-sm mb-4'>{profileError}</p>
                <button onClick={closeProfile} className='px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm'>Close</button>
              </div>
            ) : profileData ? (
              <div className='p-6 space-y-6 max-h-[85vh] overflow-y-auto'>
                {/* Header */}
                <div className='flex items-center gap-4'>
                  {profileData.personal_info?.image ? (
                    <img src={profileData.personal_info.image} alt='' className='size-16 rounded-full object-cover border-2 border-slate-200' />
                  ) : (
                    <div className='size-16 rounded-full bg-slate-200 flex items-center justify-center'>
                      <UserIcon className='size-8 text-slate-400' />
                    </div>
                  )}
                  <div>
                    <h2 className='text-xl font-bold text-slate-800'>{profileData.personal_info?.full_name || profileUserName}</h2>
                    {profileData.personal_info?.profession && (
                      <p className='text-slate-500'>{profileData.personal_info.profession}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                {(profileData.personal_info?.email || profileData.personal_info?.phone || profileData.personal_info?.location || profileData.personal_info?.linkedin || profileData.personal_info?.website) && (
                  <div className='flex flex-wrap gap-3 text-sm text-slate-600'>
                    {profileData.personal_info?.email && (
                      <span className='flex items-center gap-1'><MailIcon className='size-3.5' />{profileData.personal_info.email}</span>
                    )}
                    {profileData.personal_info?.phone && (
                      <span className='flex items-center gap-1'><PhoneIcon className='size-3.5' />{profileData.personal_info.phone}</span>
                    )}
                    {profileData.personal_info?.location && (
                      <span className='flex items-center gap-1'><MapPinIcon className='size-3.5' />{profileData.personal_info.location}</span>
                    )}
                    {profileData.personal_info?.linkedin && (
                      <span className='flex items-center gap-1'><LinkedinIcon className='size-3.5' />{profileData.personal_info.linkedin}</span>
                    )}
                    {profileData.personal_info?.website && (
                      <span className='flex items-center gap-1'><GlobeIcon className='size-3.5' />{profileData.personal_info.website}</span>
                    )}
                  </div>
                )}

                {/* Professional Summary */}
                {profileData.professional_summary && (
                  <div>
                    <h3 className='text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2'>
                      <UserIcon className='size-4' /> Professional Summary
                    </h3>
                    <p className='text-sm text-slate-600 bg-slate-50 rounded-lg p-3'>{profileData.professional_summary}</p>
                  </div>
                )}

                {/* Skills */}
                {profileData.skills?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2'>
                      <CodeIcon className='size-4' /> Skills
                    </h3>
                    <div className='flex flex-wrap gap-1.5'>
                      {profileData.skills.map((skill, i) => (
                        <span key={i} className='px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs'>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {profileData.experience?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2'>
                      <BriefcaseIcon className='size-4' /> Experience ({profileData.experience.length})
                    </h3>
                    <div className='space-y-3'>
                      {profileData.experience.map((exp, i) => (
                        <div key={i} className='bg-slate-50 rounded-lg p-3'>
                          <div className='flex justify-between items-start'>
                            <div>
                              <p className='font-medium text-slate-800 text-sm'>{exp.position}</p>
                              <p className='text-slate-500 text-xs'>{exp.company}</p>
                            </div>
                            <p className='text-xs text-slate-400 whitespace-nowrap ml-2'>
                              {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                            </p>
                          </div>
                          {exp.description && <p className='text-xs text-slate-600 mt-2 whitespace-pre-line'>{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {profileData.education?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2'>
                      <GraduationCapIcon className='size-4' /> Education ({profileData.education.length})
                    </h3>
                    <div className='space-y-3'>
                      {profileData.education.map((edu, i) => (
                        <div key={i} className='bg-slate-50 rounded-lg p-3'>
                          <div className='flex justify-between items-start'>
                            <div>
                              <p className='font-medium text-slate-800 text-sm'>{edu.degree} {edu.field && `in ${edu.field}`}</p>
                              <p className='text-slate-500 text-xs'>{edu.institution}</p>
                            </div>
                            <div className='text-right ml-2'>
                              {edu.graduation_date && <p className='text-xs text-slate-400'>{edu.graduation_date}</p>}
                              {edu.gpa && <p className='text-xs text-slate-400'>GPA: {edu.gpa}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {profileData.project?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2'>
                      <CodeIcon className='size-4' /> Projects ({profileData.project.length})
                    </h3>
                    <div className='space-y-3'>
                      {profileData.project.map((proj, i) => (
                        <div key={i} className='bg-slate-50 rounded-lg p-3'>
                          <div className='flex justify-between items-start'>
                            <p className='font-medium text-slate-800 text-sm'>{proj.name}</p>
                            {proj.type && <span className='px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs ml-2'>{proj.type}</span>}
                          </div>
                          {proj.description && <p className='text-xs text-slate-600 mt-2 whitespace-pre-line'>{proj.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {profileData.certifications?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2'>
                      <AwardIcon className='size-4' /> Certifications ({profileData.certifications.length})
                    </h3>
                    <div className='space-y-2'>
                      {profileData.certifications.map((cert, i) => (
                        <div key={i} className='bg-slate-50 rounded-lg p-3'>
                          <p className='font-medium text-slate-800 text-sm'>{cert.name}</p>
                          <p className='text-xs text-slate-500'>{cert.issuer}{cert.date && ` - ${cert.date}`}</p>
                          {cert.credential_id && <p className='text-xs text-slate-400'>ID: {cert.credential_id}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {profileData.achievements?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2'>
                      <AwardIcon className='size-4' /> Achievements ({profileData.achievements.length})
                    </h3>
                    <div className='space-y-2'>
                      {profileData.achievements.map((ach, i) => (
                        <div key={i} className='bg-slate-50 rounded-lg p-3'>
                          <p className='font-medium text-slate-800 text-sm'>{ach.title}</p>
                          {ach.description && <p className='text-xs text-slate-600 mt-1'>{ach.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferences */}
                {profileData.preferences && (
                  <div>
                    <h3 className='text-sm font-semibold text-slate-700 mb-2'>AI Preferences</h3>
                    <div className='flex flex-wrap gap-2'>
                      <span className='px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs'>Style: {profileData.preferences.writing_style}</span>
                      <span className='px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs'>Tone: {profileData.preferences.tone}</span>
                      {profileData.preferences.custom_requirements && (
                        <span className='px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs'>Custom: {profileData.preferences.custom_requirements}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
