import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const ClassicTemplate = ({ data, accentColor,sectionVisibility }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-8 pt-6 pb-4 bg-white text-gray-800 leading-snug text-sm">
            {/* Header */}
            <header className="text-center mb-2 pb-2 border-b-2" style={{ borderColor: accentColor }}>
                <h1 className="text-4xl font-bold mb-2" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    {data.personal_info?.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="size-4" />
                            <span>{data.personal_info.email}</span>
                        </div>
                    )}
                    {data.personal_info?.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="size-4" />
                            <span>{data.personal_info.phone}</span>
                        </div>
                    )}
                    {data.personal_info?.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="size-4" />
                            <span>{data.personal_info.location}</span>
                        </div>
                    )}
                    {data.personal_info?.linkedin && (
                        <div className="flex items-center gap-1">
                            <Linkedin className="size-4" />
                            <span className="break-all">{data.personal_info.linkedin}</span>
                        </div>
                    )}
                    {data.personal_info?.website && (
                        <div className="flex items-center gap-1">
                            <Globe className="size-4" />
                            <span className="break-all">{data.personal_info.website}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Professional Summary */}
            {data.professional_summary && sectionVisibility.summary && (
                <section className="mb-2">
                    <h2 className="text-base font-semibold mb-2" style={{ color: accentColor }}>
                        SUMMARY
                    </h2>
                    <div
                        className="text-sm text-gray-700 leading-snug quill-content"
                        dangerouslySetInnerHTML={{ __html: data.professional_summary }}
                    />
                </section>
            )}

            {/* Experience */}
            {data.experience && data.experience.length  > 0 &&   sectionVisibility.experience && (
                <section className="mb-2">
                    <h2 className="text-base font-semibold mb-2" style={{ color: accentColor }}>
                        EXPERIENCE
                    </h2>

                    <div className="space-y-2">
                        {data.experience.map((exp, index) => (
                            <div key={index} className="experience-item border-l-3 pl-4" style={{ borderColor: accentColor }}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">{exp.position}</h3>
                                        <p className="text-sm text-gray-700 font-medium">{exp.company}</p>
                                    </div>
                                    <div className="text-right text-sm text-gray-600">
                                        <p>{formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}</p>
                                    </div>
                                </div>
                                {exp.description && (
                                    <div
                                        className="text-sm text-gray-700 leading-snug quill-content"
                                        dangerouslySetInnerHTML={{ __html: exp.description }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {data.project && data.project.length > 0 &&  sectionVisibility.projects &&  (
                <section className="mb-2">
                    <h2 className="text-base font-semibold mb-2" style={{ color: accentColor }}>
                        PROJECTS
                    </h2>

                    <ul className="space-y-2 ">
                        {data.project.map((proj, index) => (
                            <div key={index} className="project-item flex justify-between items-start border-l-3 border-gray-300 pl-6">
                                <div>
                                    <li className="text-base font-semibold text-gray-800 ">{proj.name}</li>
                                    <div
                                        className="text-sm text-gray-600 quill-content"
                                        dangerouslySetInnerHTML={{ __html: proj.description }}
                                    />
                                </div>
                            </div>
                        ))}
                    </ul>
                </section>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && sectionVisibility.education && (
                <section className="mb-2">
                    <h2 className="text-base font-semibold mb-2" style={{ color: accentColor }}>
                        EDUCATION
                    </h2>

                    <div className="space-y-2">
                        {data.education.map((edu, index) => (
                            <div key={index} className="education-item flex justify-between items-start">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h3>
                                    <p className="text-sm text-gray-700">{edu.institution}</p>
                                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>{formatDate(edu.graduation_date)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && sectionVisibility.skills&&  (
                <section className="mb-2">
                    <h2 className="text-base font-semibold mb-2" style={{ color: accentColor }}>
                        CORE SKILLS
                    </h2>

                    <div className="flex gap-4 flex-wrap">
                        {data.skills.map((skill, index) => (
                            <div key={index} className="text-sm text-gray-700">
                                • {skill}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && sectionVisibility.certifications && (
                <section className="mb-2">
                    <h2 className="text-base font-semibold mb-2" style={{ color: accentColor }}>
                        CERTIFICATIONS
                    </h2>

                    <div className="space-y-2">
                        {data.certifications.map((cert, index) => (
                            <div key={index} className="border-l-3 pl-4" style={{ borderColor: accentColor }}>
                                <h3 className="text-base font-semibold text-gray-900">{cert.name}</h3>
                                {cert.issuer && <p className="text-sm text-gray-700">{cert.issuer}</p>}
                                {cert.date && <p className="text-sm text-gray-600">{formatDate(cert.date)}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Achievements */}
            {data.achievements && data.achievements.length > 0 && sectionVisibility.achievements && (
                <section className="mb-2">
                    <h2 className="text-base font-semibold mb-2" style={{ color: accentColor }}>
                        ACHIEVEMENTS
                    </h2>

                    <ul className="space-y-2">
                        {data.achievements.map((achievement, index) => (
                            <li key={index} className="text-sm text-gray-700 pl-4">
                                • {achievement}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Custom Sections */}
            {data.custom_sections && data.custom_sections.length > 0 && sectionVisibility.customSections && (
                <>
                    {data.custom_sections.map((section, index) => (
                        section.section_name && section.content && (
                            <section key={index} className="mb-2">
                                <h2 className="text-base font-semibold mb-2" style={{ color: accentColor }}>
                                    {section.section_name.toUpperCase()}
                                </h2>
                                <div
                                    className="text-sm text-gray-700 leading-snug quill-content"
                                    dangerouslySetInnerHTML={{ __html: section.content }}
                                />
                            </section>
                        )
                    ))}
                </>
            )}
        </div>
    );
}

export default ClassicTemplate;