import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const CompactTemplate = ({ data, accentColor, sectionVisibility }) => {
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		const [year, month] = dateStr.split("-");
		return new Date(year, month - 1).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short"
		});
	};

	return (
		<div className="max-w-4xl mx-auto text-gray-800 text-xs" style={{
			background: `linear-gradient(to right, ${accentColor}15 33.33%, white 33.33%)`
		}}>
			<div className="grid grid-cols-3 gap-0">
				{/* Left Sidebar - 1/3 width */}
				<div className="col-span-1 px-4 pt-4 pb-4">
					{/* Contact Info */}
					<div className="mb-3">
						<h2 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: accentColor }}>
							Contact
						</h2>
						<div className="space-y-1.5 text-xs">
							{data.personal_info?.email && (
								<div className="flex items-start gap-1.5">
									<Mail className="size-3 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
									<span className="break-all leading-tight">{data.personal_info.email}</span>
								</div>
							)}
							{data.personal_info?.phone && (
								<div className="flex items-start gap-1.5">
									<Phone className="size-3 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
									<span className="leading-tight">{data.personal_info.phone}</span>
								</div>
							)}
							{data.personal_info?.location && (
								<div className="flex items-start gap-1.5">
									<MapPin className="size-3 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
									<span className="leading-tight">{data.personal_info.location}</span>
								</div>
							)}
							{data.personal_info?.linkedin && (
								<a target="_blank" href={data.personal_info?.linkedin} className="flex items-start gap-1.5">
									<Linkedin className="size-3 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
									<span className="break-all leading-tight text-xs">
										{data.personal_info.linkedin.split("https://www.")[1] || data.personal_info.linkedin.split("https://")[1] || data.personal_info.linkedin}
									</span>
								</a>
							)}
							{data.personal_info?.website && (
								<a target="_blank" href={data.personal_info?.website} className="flex items-start gap-1.5">
									<Globe className="size-3 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
									<span className="break-all leading-tight text-xs">
										{data.personal_info.website.split("https://")[1] || data.personal_info.website}
									</span>
								</a>
							)}
						</div>
					</div>

					{/* Skills */}
					{data.skills && data.skills.length > 0 && sectionVisibility.skills && (
						<div className="mb-3">
							<h2 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: accentColor }}>
								Skills
							</h2>
							<div className="flex flex-wrap gap-1">
								{data.skills.map((skill, index) => (
									<span
										key={index}
										className="px-2 py-0.5 text-xs rounded"
										style={{ backgroundColor: accentColor, color: "white" }}
									>
										{skill}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Education */}
					{data.education && data.education.length > 0 && sectionVisibility.education && (
						<div className="mb-3">
							<h2 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: accentColor }}>
								Education
							</h2>
							<div className="space-y-2">
								{data.education.map((edu, index) => (
									<div key={index} className="education-item">
										<h3 className="text-xs font-semibold leading-tight">
											{edu.degree}
										</h3>
										{edu.field && <p className="text-xs text-gray-600 leading-tight">{edu.field}</p>}
										<p className="text-xs text-gray-600 leading-tight">{edu.institution}</p>
										<div className="flex justify-between items-center text-xs text-gray-500 mt-0.5">
											<span>{formatDate(edu.graduation_date)}</span>
											{edu.gpa && <span>GPA: {edu.gpa}</span>}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Certifications */}
					{data.certifications && data.certifications.length > 0 && sectionVisibility.certifications && (
						<div className="mb-3">
							<h2 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: accentColor }}>
								Certifications
							</h2>
							<div className="space-y-2">
								{data.certifications.map((cert, index) => (
									<div key={index}>
										<h3 className="text-xs font-semibold leading-tight">{cert.name}</h3>
										{cert.issuer && <p className="text-xs text-gray-600 leading-tight">{cert.issuer}</p>}
										{cert.date && <p className="text-xs text-gray-500 leading-tight">{formatDate(cert.date)}</p>}
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Main Content - 2/3 width */}
				<div className="col-span-2 px-4 pt-4 pb-4">
					{/* Header */}
					<header className="mb-3">
						<h1 className="text-3xl font-bold mb-1" style={{ color: accentColor }}>
							{data.personal_info?.full_name || "Your Name"}
						</h1>
					</header>

					{/* Professional Summary */}
					{data.professional_summary && sectionVisibility.summary && (
						<section className="mb-3">
							<div
								className="text-xs text-gray-700 leading-snug quill-content"
								dangerouslySetInnerHTML={{ __html: data.professional_summary }}
							/>
						</section>
					)}

					{/* Experience */}
					{data.experience && sectionVisibility.experience && data.experience.length > 0 && (
						<section className="mb-3">
							<h2 className="text-sm font-bold uppercase tracking-wide mb-2 pb-1 border-b-2" style={{ color: accentColor, borderColor: accentColor }}>
								Experience
							</h2>

							<div className="space-y-2">
								{data.experience.map((exp, index) => (
									<div key={index} className="experience-item">
										<div className="flex justify-between items-baseline mb-0.5">
											<h3 className="text-sm font-semibold text-gray-900">{exp.position}</h3>
											<div className="text-xs text-gray-500">
												{formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
											</div>
										</div>
										<p className="text-xs font-medium mb-1" style={{ color: accentColor }}>{exp.company}</p>
										{exp.description && (
											<div
												className="text-xs text-gray-700 leading-snug quill-content"
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
						<section className="mb-3">
							<h2 className="text-sm font-bold uppercase tracking-wide mb-2 pb-1 border-b-2" style={{ color: accentColor, borderColor: accentColor }}>
								Projects
							</h2>

							<div className="space-y-2">
								{data.project.map((p, index) => (
									<div key={index} className="project-item">
										<h3 className="text-sm font-semibold text-gray-900 mb-0.5">{p.name}</h3>
										{p.description && (
											<div
												className="text-xs text-gray-700 leading-snug quill-content"
												dangerouslySetInnerHTML={{ __html: p.description }}
											/>
										)}
									</div>
								))}
							</div>
						</section>
					)}

					{/* Achievements */}
					{data.achievements && data.achievements.length > 0 && sectionVisibility.achievements && (
						<section className="mb-3">
							<h2 className="text-sm font-bold uppercase tracking-wide mb-2 pb-1 border-b-2" style={{ color: accentColor, borderColor: accentColor }}>
								Achievements
							</h2>

							<ul className="space-y-1 list-disc pl-4">
								{data.achievements.map((achievement, index) => (
									<li key={index} className="text-xs text-gray-700 leading-snug">
										{achievement}
									</li>
								))}
							</ul>
						</section>
					)}

					{/* Custom Sections */}
					{data.custom_sections && data.custom_sections.length > 0 && sectionVisibility.customSections && (
						<>
							{data.custom_sections.map((section, index) =>
								section.section_name && section.content ? (
									<section key={index} className="mb-3">
										<h2 className="text-sm font-bold uppercase tracking-wide mb-2 pb-1 border-b-2" style={{ color: accentColor, borderColor: accentColor }}>
											{section.section_name}
										</h2>
										<div
											className="text-xs text-gray-700 leading-snug quill-content"
											dangerouslySetInnerHTML={{ __html: section.content }}
										/>
									</section>
								) : null
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default CompactTemplate;
