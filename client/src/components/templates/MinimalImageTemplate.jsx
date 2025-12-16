import { Mail, Phone, MapPin } from "lucide-react";

const MinimalImageTemplate = ({ data, accentColor,sectionVisibility }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
    };

    return (
        <div className="max-w-5xl mx-auto bg-white text-zinc-800 text-sm">
            <div className="grid grid-cols-3">

                <div className="col-span-1  pt-6 pb-4">
                    {/* Image */}
                    {data.personal_info?.image && typeof data.personal_info.image === 'string' ? (
                        <div className="mb-3">
                            <img src={data.personal_info.image} alt="Profile" className="w-32 h-32 object-cover rounded-full mx-auto" style={{ background: accentColor+'70' }} />
                        </div>
                    ) : (
                        data.personal_info?.image && typeof data.personal_info.image === 'object' ? (
                            <div className="mb-3">
                                <img src={URL.createObjectURL(data.personal_info.image)} alt="Profile" className="w-32 h-32 object-cover rounded-full mx-auto" />
                            </div>
                        ) : null
                    )}
                </div>

                {/* Name + Title */}
                <div className="col-span-2 flex flex-col justify-center pt-6 pb-4 px-8">
                    <h1 className="text-5xl font-bold text-zinc-700 tracking-widest">
                        {data.personal_info?.full_name || "Your Name"}
                    </h1>
                    <p className="uppercase text-zinc-600 font-medium text-sm tracking-widest">
                        {data?.personal_info?.profession || "Profession"}
                    </p>
                </div>

                {/* Left Sidebar */}
                <aside className="col-span-1 border-r border-zinc-400 px-6 pb-3 pt-0">


                    {/* Contact */}
                    <section className="mb-2">
                        <h2 className="text-base font-semibold tracking-widest text-zinc-600 mb-2">
                            CONTACT
                        </h2>
                        <div className="space-y-2 text-sm">
                            {data.personal_info?.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={14} style={{ color: accentColor }} />
                                    <span>{data.personal_info.phone}</span>
                                </div>
                            )}
                            {data.personal_info?.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={14} style={{ color: accentColor }} />
                                    <span>{data.personal_info.email}</span>
                                </div>
                            )}
                            {data.personal_info?.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} style={{ color: accentColor }} />
                                    <span>{data.personal_info.location}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Education */}
                    {data.education && data.education.length > 0 && sectionVisibility.education && (
                        <section className="mb-2">
                            <h2 className="text-base font-semibold tracking-widest text-zinc-600 mb-2">
                                EDUCATION
                            </h2>
                            <div className="space-y-2 text-sm">
                                {data.education.map((edu, index) => (
                                    <div key={index} className="education-item">
                                        <p className="font-semibold uppercase">{edu.degree}</p>
                                        <p className="text-zinc-600">{edu.institution}</p>
                                        <p className="text-sm text-zinc-500">
                                            {formatDate(edu.graduation_date)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {data.skills && data.skills.length > 0 &&sectionVisibility.skills && (
                        <section>
                            <h2 className="text-base font-semibold tracking-widest text-zinc-600 mb-2">
                                SKILLS
                            </h2>
                            <ul className="space-y-1 text-sm">
                                {data.skills.map((skill, index) => (
                                    <li key={index}>{skill}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </aside>

                {/* Right Content */}
                <main className="col-span-2 px-8 pb-4 pt-0">

                    {/* Summary */}
                    {data.professional_summary && sectionVisibility.summary &&  (
                        <section className="mb-2">
                            <h2 className="text-base font-semibold tracking-widest mb-2" style={{ color: accentColor }} >
                                SUMMARY
                            </h2>
                            <div
                                className="text-sm text-zinc-700 leading-snug quill-content"
                                dangerouslySetInnerHTML={{ __html: data.professional_summary }}
                            />
                        </section>
                    )}

                    {/* Experience */}
                    {data.experience && data.experience.length > 0 && sectionVisibility.experience && (
                        <section>
                            <h2 className="text-base font-semibold tracking-widest mb-2" style={{ color: accentColor }} >
                                EXPERIENCE
                            </h2>
                            <div className="space-y-2 mb-2">
                                {data.experience.map((exp, index) => (
                                    <div key={index} className="experience-item">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-base font-semibold text-zinc-900">
                                                {exp.position}
                                            </h3>
                                            <span className="text-sm text-zinc-500">
                                                {formatDate(exp.start_date)} -{" "}
                                                {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                            </span>
                                        </div>
                                        <p className="text-sm mb-2" style={{ color: accentColor }} >
                                            {exp.company}
                                        </p>
                                        {exp.description && (
                                            <div
                                                className="text-sm text-zinc-700 leading-snug quill-content"
                                                dangerouslySetInnerHTML={{ __html: exp.description }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {data.project && data.project.length > 0 &&  sectionVisibility.projects && (
                        <section className="mb-2">
                            <h2 className="text-base uppercase tracking-widest font-semibold" style={{ color: accentColor }}>
                                PROJECTS
                            </h2>
                            <div className="space-y-2">
                                {data.project.map((project, index) => (
                                    <div key={index} className="project-item">
                                        <h3 className="text-base font-medium text-zinc-800 mt-3">{project.name}</h3>
                                        <p className="text-sm mb-1" style={{ color: accentColor }} >
                                            {project.type}
                                        </p>
                                        {project.description && (
                                            <div
                                                className="text-sm text-zinc-700 leading-snug quill-content"
                                                dangerouslySetInnerHTML={{ __html: project.description }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {data.certifications && data.certifications.length > 0 && sectionVisibility.certifications && (
                        <section className="mb-2">
                            <h2 className="text-base font-semibold tracking-widest mb-2" style={{ color: accentColor }}>
                                CERTIFICATIONS
                            </h2>
                            <div className="space-y-2">
                                {data.certifications.map((cert, index) => (
                                    <div key={index}>
                                        <h3 className="text-base font-semibold text-zinc-900">{cert.name}</h3>
                                        {cert.issuer && <p className="text-sm" style={{ color: accentColor }}>{cert.issuer}</p>}
                                        {cert.date && <p className="text-sm text-zinc-500">{formatDate(cert.date)}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Achievements */}
                    {data.achievements && data.achievements.length > 0 && sectionVisibility.achievements && (
                        <section className="mb-2">
                            <h2 className="text-base font-semibold tracking-widest mb-2" style={{ color: accentColor }}>
                                ACHIEVEMENTS
                            </h2>
                            <ul className="space-y-2 list-disc pl-6">
                                {data.achievements.map((achievement, index) => (
                                    <li key={index} className="text-sm text-zinc-700">
                                        {achievement}
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
                                        <h2 className="text-base font-semibold tracking-widest mb-2" style={{ color: accentColor }}>
                                            {section.section_name.toUpperCase()}
                                        </h2>
                                        <div
                                            className="text-sm text-zinc-700 leading-snug quill-content"
                                            dangerouslySetInnerHTML={{ __html: section.content }}
                                        />
                                    </section>
                                )
                            ))}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}


export default MinimalImageTemplate;