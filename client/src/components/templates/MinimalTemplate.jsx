
const MinimalTemplate = ({ data, accentColor,sectionVisibility }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-[0.3in] bg-white text-gray-900 font-light text-[11pt]">
            {/* Header */}
            <header className="mb-1.5">
                <h1 className="text-[18pt] font-thin mb-2 tracking-wide">
                    {data.personal_info?.full_name || "Your Name"}
                </h1>

                <div className="flex flex-wrap gap-4 text-[10pt] text-gray-600">
                    {data.personal_info?.email && <span>{data.personal_info.email}</span>}
                    {data.personal_info?.phone && <span>{data.personal_info.phone}</span>}
                    {data.personal_info?.location && <span>{data.personal_info.location}</span>}
                    {data.personal_info?.linkedin && (
                        <span className="break-all">{data.personal_info.linkedin}</span>
                    )}
                    {data.personal_info?.website && (
                        <span className="break-all">{data.personal_info.website}</span>
                    )}
                </div>
            </header>

            {/* Professional Summary */}
            {data.professional_summary && sectionVisibility.summary && (
                <section className="mb-2">
                    <div
                        className="text-[11pt] text-gray-700 quill-content"
                        dangerouslySetInnerHTML={{ __html: data.professional_summary }}
                    />
                </section>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && sectionVisibility.experience && (
                <section className="mb-2">
                    <h2 className="text-[12pt] uppercase tracking-widest mb-1 font-medium" style={{ color: accentColor }}>
                        Experience
                    </h2>

                    <div className="space-y-1.5">
                        {data.experience.map((exp, index) => (
                            <div key={index} className="experience-item">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-[11pt] font-medium">{exp.position}</h3>
                                    <span className="text-[10pt] text-gray-500">
                                        {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                <p className="text-[11pt] text-gray-600 mb-2">{exp.company}</p>
                                {exp.description && (
                                    <div
                                        className="text-[11pt] text-gray-700 leading-snug quill-content"
                                        dangerouslySetInnerHTML={{ __html: exp.description }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {data.project && data.project.length > 0 && sectionVisibility.projects && (
                <section className="mb-2">
                    <h2 className="text-[12pt] uppercase tracking-widest mb-1 font-medium" style={{ color: accentColor }}>
                        Projects
                    </h2>

                    <div className="space-y-1">
                        {data.project.map((proj, index) => (
                            <div key={index} className="project-item">
                                <h3 className="text-[11pt] font-medium ">{proj.name}</h3>
                                <div
                                    className="text-[11pt] text-gray-600 quill-content"
                                    dangerouslySetInnerHTML={{ __html: proj.description }}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && sectionVisibility.education && (
                <section className="mb-2">
                    <h2 className="text-[12pt] uppercase tracking-widest mb-1 font-medium" style={{ color: accentColor }}>
                        Education
                    </h2>

                    <div className="space-y-1.5">
                        {data.education.map((edu, index) => (
                            <div key={index} className="education-item flex justify-between items-baseline">
                                <div>
                                    <h3 className="text-[11pt] font-medium">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h3>
                                    <p className="text-[11pt] text-gray-600">{edu.institution}</p>
                                    {edu.gpa && <p className="text-[11pt] text-gray-500">GPA: {edu.gpa}</p>}
                                </div>
                                <span className="text-[10pt] text-gray-500">
                                    {formatDate(edu.graduation_date)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && sectionVisibility.skills && (
                <section className="mb-2">
                    <h2 className="text-[12pt] uppercase tracking-widest mb-1 font-medium" style={{ color: accentColor }}>
                        Skills
                    </h2>

                    <div className="text-[11pt] text-gray-700">
                        {data.skills.join(" • ")}
                    </div>
                </section>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && sectionVisibility.certifications && (
                <section className="mb-2">
                    <h2 className="text-[12pt] uppercase tracking-widest mb-1 font-medium" style={{ color: accentColor }}>
                        Certifications
                    </h2>

                    <div className="space-y-1.5">
                        {data.certifications.map((cert, index) => (
                            <div key={index}>
                                <h3 className="text-[11pt] font-medium">{cert.name}</h3>
                                {cert.issuer && <p className="text-[11pt] text-gray-600">{cert.issuer}</p>}
                                {cert.date && <p className="text-[10pt] text-gray-500">{formatDate(cert.date)}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Achievements */}
            {data.achievements && data.achievements.length > 0 && sectionVisibility.achievements && (
                <section className="mb-2">
                    <h2 className="text-[12pt] uppercase tracking-widest mb-1 font-medium" style={{ color: accentColor }}>
                        Achievements
                    </h2>

                    <ul className="space-y-1">
                        {data.achievements.map((achievement, index) => (
                            <li key={index} className="text-[11pt] text-gray-700">
                                • {typeof achievement === 'string' ? achievement : achievement.title}
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
                                <h2 className="text-[12pt] uppercase tracking-widest mb-1 font-medium" style={{ color: accentColor }}>
                                    {section.section_name}
                                </h2>
                                <div
                                    className="text-[11pt] text-gray-700 leading-snug quill-content"
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

export default MinimalTemplate;