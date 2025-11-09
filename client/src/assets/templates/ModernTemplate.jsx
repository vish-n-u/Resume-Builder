import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const ModernTemplate = ({ data, accentColor, sectionVisibility }) => {
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		const [year, month] = dateStr.split("-");
		return new Date(year, month - 1).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short"
		});
	};

	return (
		<div className="max-w-4xl mx-auto bg-white text-gray-800">
			{/* Header */}
			<header className="p-4 sm:p-6 lg:p-8 text-white print:p-8" style={{ backgroundColor: accentColor }}>
				<h1 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-3">
					{data.personal_info?.full_name || "Your Name"}
				</h1>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
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
							<span className="break-all text-xs">{data.personal_info.linkedin.split("https://www.")[1] ? data.personal_info.linkedin.split("https://www.")[1] : data.personal_info.linkedin}</span>
						</a>
					)}
					{data.personal_info?.website && (
						<a target="_blank" href={data.personal_info?.website} className="flex items-center gap-2">
							<Globe className="size-4" />
							<span className="break-all text-xs">{data.personal_info.website.split("https://")[1] ? data.personal_info.website.split("https://")[1] : data.personal_info.website}</span>
						</a>
					)}
				</div>
			</header>

			<div className="p-4 sm:p-6 lg:p-8 print:p-8">
				{/* Professional Summary */}
				{sectionVisibility?.summary && data.professional_summary && (
					<section className="mb-6 sm:mb-8">
						<h2 className="text-xl sm:text-2xl font-light mb-3 sm:mb-4 pb-2 border-b border-gray-200">
							Professional Summary
						</h2>
						<p className="text-sm sm:text-base text-gray-700">{data.professional_summary}</p>
					</section>
				)}

				{/* Experience */}
				{sectionVisibility?.experience && data.experience && data.experience.length > 0 && (
					<section className="mb-6 sm:mb-8">
						<h2 className="text-xl sm:text-2xl font-light mb-4 sm:mb-6 pb-2 border-b border-gray-200">
							Experience
						</h2>

						<div className="space-y-4 sm:space-y-6">
							{data.experience.map((exp, index) => (
								<div key={index} className="relative pl-4 sm:pl-6 border-l border-gray-200">

									<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-0">
										<div className="flex-1">
											<h3 className="text-lg sm:text-xl font-medium text-gray-900">{exp.position}</h3>
											<p className="font-medium text-sm sm:text-base" style={{ color: accentColor }}>{exp.company}</p>
										</div>
										<div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded w-fit">
											{formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
										</div>
									</div>
									{exp.description && (
										<div className="text-xs sm:text-sm text-gray-700 leading-relaxed mt-3 whitespace-pre-line">
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
					<section className="mb-6 sm:mb-8">
						<h2 className="text-xl sm:text-2xl font-light mb-3 sm:mb-4 pb-2 border-b border-gray-200">
							Projects
						</h2>

						<div className="space-y-4 sm:space-y-6">
							{data.project.map((p, index) => (
								<div key={index} className="relative pl-4 sm:pl-6 border-l border-gray-200" style={{borderLeftColor: accentColor}}>


									<div className="flex justify-between items-start">
										<div>
											<h3 className="text-lg font-medium text-gray-900">{p.name}</h3>
										</div>
									</div>
									{p.description && (
										<div className="text-gray-700 leading-relaxed text-sm mt-3">
											{p.description}
										</div>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				<div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
					{/* Education */}
					{sectionVisibility?.education && data.education && data.education.length > 0 && (
						<section>
							<h2 className="text-xl sm:text-2xl font-light mb-3 sm:mb-4 pb-2 border-b border-gray-200">
								Education
							</h2>

							<div className="space-y-4">
								{data.education.map((edu, index) => (
									<div key={index}>
										<h3 className="font-semibold text-gray-900">
											{edu.degree} {edu.field && `in ${edu.field}`}
										</h3>
										<p style={{ color: accentColor }}>{edu.institution}</p>
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
					{sectionVisibility?.skills && data.skills && data.skills.length > 0 && (
						<section>
							<h2 className="text-xl sm:text-2xl font-light mb-3 sm:mb-4 pb-2 border-b border-gray-200">
								Skills
							</h2>

							<div className="flex flex-wrap gap-2">
								{data.skills.map((skill, index) => (
									<span
										key={index}
										className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-white rounded-full"
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
				{sectionVisibility?.certifications && data.certifications && data.certifications.length > 0 && (
					<section className="mt-8">
						<h2 className="text-xl sm:text-2xl font-light mb-3 sm:mb-4 pb-2 border-b border-gray-200">
							Certifications
						</h2>

						<div className="space-y-4">
							{data.certifications.map((cert, index) => (
								<div key={index} className="relative pl-4 sm:pl-6 border-l border-gray-200">
									<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
										<div className="flex-1">
											<h3 className="font-semibold text-gray-900 text-sm sm:text-base">{cert.name}</h3>
											<p style={{ color: accentColor }} className="text-sm sm:text-base">{cert.issuer}</p>
											{cert.credential_id && <p className="text-xs sm:text-sm text-gray-600">ID: {cert.credential_id}</p>}
										</div>
										<div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded w-fit flex-shrink-0">
											{formatDate(cert.date)}
										</div>
									</div>
								</div>
							))}
						</div>
					</section>
				)}

				{/* Achievements */}
				{sectionVisibility?.achievements && data.achievements && data.achievements.length > 0 && (
					<section className="mt-8">
						<h2 className="text-xl sm:text-2xl font-light mb-3 sm:mb-4 pb-2 border-b border-gray-200">
							Achievements
						</h2>

						<div className="space-y-4">
							{data.achievements.map((achievement, index) => (
								<div key={index} className="relative pl-4 sm:pl-6 border-l border-gray-200" style={{borderLeftColor: accentColor}}>
									<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1 sm:gap-0">
										<h3 className="font-semibold text-gray-900 text-sm sm:text-base flex-1">{achievement.title}</h3>
										<div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded w-fit flex-shrink-0">
											{formatDate(achievement.date)}
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
		</div>
	);
}

export default ModernTemplate;