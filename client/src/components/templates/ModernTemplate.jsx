import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const ModernTemplate = ({ data, accentColor,sectionVisibility }) => {
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		const [year, month] = dateStr.split("-");
		return new Date(year, month - 1).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short"
		});
	};

	return (
		<div className="max-w-4xl mx-auto bg-white text-gray-800 text-sm">
			{/* Header */}
			<header className="p-8 text-white" style={{ backgroundColor: accentColor }}>
				<h1 className="text-5xl font-light mb-3">
					{data.personal_info?.full_name || "Your Name"}
				</h1>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm ">
					{data.personal_info?.email && (
						<div className="flex items-center gap-2">
							<Mail className="size-4" />
							<span>{data.personal_info.email}</span>
						</div>
					)}
					{data.personal_info?.phone && (
						<div className="flex items-center gap-2">
							<Phone className="size-4" />
							<span>{data.personal_info.phone}</span>
						</div>
					)}
					{data.personal_info?.location && (
						<div className="flex items-center gap-2">
							<MapPin className="size-4" />
							<span>{data.personal_info.location}</span>
						</div>
					)}
					{data.personal_info?.linkedin && (
						<a target="_blank" href={data.personal_info?.linkedin} className="flex items-center gap-2">
							<Linkedin className="size-4" />
							<span className="break-all text-sm">{data.personal_info.linkedin.split("https://www.")[1] ? data.personal_info.linkedin.split("https://www.")[1] : data.personal_info.linkedin}</span>
						</a>
					)}
					{data.personal_info?.website && (
						<a target="_blank" href={data.personal_info?.website} className="flex items-center gap-2">
							<Globe className="size-4" />
							<span className="break-all text-sm">{data.personal_info.website.split("https://")[1] ? data.personal_info.website.split("https://")[1] : data.personal_info.website}</span>
						</a>
					)}
				</div>
			</header>

			<div className="p-8">
				{/* Professional Summary */}
				{data.professional_summary && sectionVisibility.summary  && (
					<section className="mb-8">
						<h2 className="text-base font-light mb-4 pb-2 border-b border-gray-200">
							Professional Summary
						</h2>
						<div
							className="text-sm text-gray-700 quill-content"
							dangerouslySetInnerHTML={{ __html: data.professional_summary }}
						/>
					</section>
				)}

				{/* Experience */}
				{data.experience &&   sectionVisibility.experience && data.experience.length > 0 && (
					<section className="mb-8">
						<h2 className="text-base font-light mb-6 pb-2 border-b border-gray-200">
							Experience
						</h2>

						<div className="space-y-6">
							{data.experience.map((exp, index) => (
								<div key={index} className="experience-item relative pl-6 border-l border-gray-200">

									<div className="flex justify-between items-start mb-2">
										<div>
											<h3 className="text-base font-medium text-gray-900">{exp.position}</h3>
											<p className="text-sm font-medium" style={{ color: accentColor }}>{exp.company}</p>
										</div>
										<div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
											{formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
										</div>
									</div>
									{exp.description && (
										<div
											className="text-sm text-gray-700 leading-relaxed mt-3 quill-content"
											dangerouslySetInnerHTML={{ __html: exp.description }}
										/>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				{/* Projects */}
				{data.project && data.project.length > 0 &&sectionVisibility.projects && (
					<section className="mb-8">
						<h2 className="text-base font-light mb-4 pb-2 border-b border-gray-200">
							Projects
						</h2>

						<div className="space-y-6">
							{data.project.map((p, index) => (
								<div key={index} className="project-item relative pl-6 border-l border-gray-200" style={{borderLeftColor: accentColor}}>


									<div className="flex justify-between items-start">
										<div>
											<h3 className="text-base font-medium text-gray-900">{p.name}</h3>
										</div>
									</div>
									{p.description && (
										<div
											className="text-sm text-gray-700 leading-relaxed mt-3 quill-content"
											dangerouslySetInnerHTML={{ __html: p.description }}
										/>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				<div className="grid sm:grid-cols-2 gap-8">
					{/* Education */}
					{data.education && data.education.length > 0 && sectionVisibility.education && (
						<section>
							<h2 className="text-base font-light mb-4 pb-2 border-b border-gray-200">
								Education
							</h2>

							<div className="space-y-4">
								{data.education.map((edu, index) => (
									<div key={index} className="education-item">
										<h3 className="text-base font-semibold text-gray-900">
											{edu.degree} {edu.field && `in ${edu.field}`}
										</h3>
										<p className="text-sm" style={{ color: accentColor }}>{edu.institution}</p>
										<div className="flex justify-between items-center text-sm text-gray-600">
											<span>{formatDate(edu.graduation_date)}</span>
											{edu.gpa && <span>GPA: {edu.gpa}</span>}
										</div>
									</div>
								))}
							</div>
						</section>
					)}

					{/* Skills */}
					{data.skills && data.skills.length > 0 &&sectionVisibility.skills&& (
						<section>
							<h2 className="text-base font-light mb-4 pb-2 border-b border-gray-200">
								Skills
							</h2>

							<div className="flex flex-wrap gap-2">
								{data.skills.map((skill, index) => (
									<span
										key={index}
										className="px-3 py-1 text-sm text-white rounded-full"
										style={{ backgroundColor: accentColor }}
									>
										{skill}
									</span>
								))}
							</div>
						</section>
					)}
				</div>

				{/* Certifications */}
				{data.certifications && data.certifications.length > 0 && sectionVisibility.certifications && (
					<section className="mb-8 mt-8">
						<h2 className="text-base font-light mb-6 pb-2 border-b border-gray-200">
							Certifications
						</h2>

						<div className="space-y-4">
							{data.certifications.map((cert, index) => (
								<div key={index} className="relative pl-6 border-l border-gray-200">
									<h3 className="text-base font-medium text-gray-900">{cert.name}</h3>
									{cert.issuer && <p className="text-sm font-medium" style={{ color: accentColor }}>{cert.issuer}</p>}
									{cert.date && <p className="text-sm text-gray-500">{formatDate(cert.date)}</p>}
								</div>
							))}
						</div>
					</section>
				)}

				{/* Achievements */}
				{data.achievements && data.achievements.length > 0 && sectionVisibility.achievements && (
					<section className="mb-8">
						<h2 className="text-base font-light mb-6 pb-2 border-b border-gray-200">
							Achievements
						</h2>

						<ul className="space-y-2 list-disc pl-6">
							{data.achievements.map((achievement, index) => (
								<li key={index} className="text-sm text-gray-700">
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
								<section key={index} className="mb-8">
									<h2 className="text-base font-light mb-6 pb-2 border-b border-gray-200">
										{section.section_name}
									</h2>
									<div
										className="text-sm text-gray-700 leading-relaxed quill-content"
										dangerouslySetInnerHTML={{ __html: section.content }}
									/>
								</section>
							)
						))}
					</>
				)}
			</div>
		</div>
	);
}

export default ModernTemplate;