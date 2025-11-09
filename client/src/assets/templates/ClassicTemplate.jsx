import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const ClassicTemplate = ({ data, accentColor, sectionVisibility }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white text-gray-800 leading-relaxed print:p-8">
            {/* Header */}
            <header className="text-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2" style={{ borderColor: accentColor }}>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>

                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    {data.personal_info?.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="size-3 sm:size-4 flex-shrink-0" />
                            <span className="break-all">{data.personal_info.email}</span>
                        </div>
                    )}
                    {data.personal_info?.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="size-3 sm:size-4 flex-shrink-0" />
                            <span>{data.personal_info.phone}</span>
                        </div>
                    )}
                    {data.personal_info?.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="size-3 sm:size-4 flex-shrink-0" />
                            <span>{data.personal_info.location}</span>
                        </div>
                    )}
                    {data.personal_info?.linkedin && (
                        <div className="flex items-center gap-1">
                            <Linkedin className="size-3 sm:size-4 flex-shrink-0" />
                            <span className="break-all text-xs sm:text-sm">{data.personal_info.linkedin}</span>
                        </div>
                    )}
                    {data.personal_info?.website && (
                        <div className="flex items-center gap-1">
                            <Globe className="size-3 sm:size-4 flex-shrink-0" />
                            <span className="break-all text-xs sm:text-sm">{data.personal_info.website}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Professional Summary */}
            {sectionVisibility?.summary && data.professional_summary && (
                <section className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3" style={{ color: accentColor }}>
                        PROFESSIONAL SUMMARY
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{data.professional_summary}</p>
                </section>
            )}

            {/* Experience */}
            {sectionVisibility?.experience && data.experience && data.experience.length > 0 && (
                <section className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: accentColor }}>
                        PROFESSIONAL EXPERIENCE
                    </h2>

                    <div className="space-y-3 sm:space-y-4">
                        {data.experience.map((exp, index) => (
                            <div key={index} className="border-l-2 sm:border-l-3 pl-3 sm:pl-4" style={{ borderColor: accentColor }}>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-0">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{exp.position}</h3>
                                        <p className="text-gray-700 font-medium text-sm sm:text-base">{exp.company}</p>
                                    </div>
                                    <div className="text-left sm:text-right text-xs sm:text-sm text-gray-600 flex-shrink-0">
                                        <p>{formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}</p>
                                    </div>
                                </div>
                                {exp.description && (
                                    <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                        {exp.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {sectionVisibility?.projects && data.project && data.project.length > 0 && (
                <section className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: accentColor }}>
                        PROJECTS
                    </h2>

                    <ul className="space-y-2 sm:space-y-3">
                        {data.project.map((proj, index) => (
                            <div key={index} className="flex justify-between items-start border-l-2 sm:border-l-3 border-gray-300 pl-3 sm:pl-6">
                                <div>
                                    <li className="font-semibold text-gray-800 text-sm sm:text-base">{proj.name}</li>
                                    <p className="text-xs sm:text-sm text-gray-600">{proj.description}</p>
                                </div>
                            </div>
                        ))}
                    </ul>
                </section>
            )}

            {/* Education */}
            {sectionVisibility?.education && data.education && data.education.length > 0 && (
                <section className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: accentColor }}>
                        EDUCATION
                    </h2>

                    <div className="space-y-2 sm:space-y-3">
                        {data.education.map((edu, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h3>
                                    <p className="text-gray-700 text-sm sm:text-base">{edu.institution}</p>
                                    {edu.gpa && <p className="text-xs sm:text-sm text-gray-600">GPA: {edu.gpa}</p>}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 flex-shrink-0">
                                    <p>{formatDate(edu.graduation_date)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {sectionVisibility?.skills && data.skills && data.skills.length > 0 && (
                <section className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: accentColor }}>
                        CORE SKILLS
                    </h2>

                    <div className="flex gap-2 sm:gap-4 flex-wrap">
                        {data.skills.map((skill, index) => (
                            <div key={index} className="text-xs sm:text-sm text-gray-700">
                                • {skill}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Certifications */}
            {sectionVisibility?.certifications && data.certifications && data.certifications.length > 0 && (
                <section className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: accentColor }}>
                        CERTIFICATIONS
                    </h2>

                    <div className="space-y-2 sm:space-y-3">
                        {data.certifications.map((cert, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{cert.name}</h3>
                                    <p className="text-gray-700 text-sm sm:text-base">{cert.issuer}</p>
                                    {cert.credential_id && <p className="text-xs sm:text-sm text-gray-600">ID: {cert.credential_id}</p>}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 flex-shrink-0">
                                    <p>{formatDate(cert.date)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Achievements */}
            {sectionVisibility?.achievements && data.achievements && data.achievements.length > 0 && (
                <section className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: accentColor }}>
                        ACHIEVEMENTS
                    </h2>

                    <div className="space-y-2 sm:space-y-3">
                        {data.achievements.map((achievement, index) => (
                            <div key={index} className="border-l-2 sm:border-l-3 pl-3 sm:pl-4" style={{ borderColor: accentColor }}>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1 sm:gap-0">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex-1">{achievement.title}</h3>
                                    <div className="text-xs sm:text-sm text-gray-600 flex-shrink-0">
                                        <p>{formatDate(achievement.date)}</p>
                                    </div>
                                </div>
                                {achievement.description && (
                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{achievement.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default ClassicTemplate;