import { ResumeData, ResumeCustomization } from '@/types/resume';
import { formatLinkedIn, formatPortfolio } from '@/utils/formatLinks';

interface MinimalTemplateProps {
  data: ResumeData;
  customization: ResumeCustomization;
}

export const MinimalTemplate = ({ data, customization }: MinimalTemplateProps) => {
  const { personalInfo, workExperience, education, skills, projects } = data;
  const spacing = customization.spacing === 'compact' ? 'space-y-2' : customization.spacing === 'spacious' ? 'space-y-6' : 'space-y-4';

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full h-full p-12 bg-white text-gray-900">
      <div className={`${spacing} max-w-none`}>
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-5xl font-light mb-4" style={{ color: customization.primaryColor }}>
            {personalInfo.fullName || 'Your Name'}
          </h1>
          {personalInfo.summary && (
            <p className="mt-2 text-base text-gray-700 font-medium leading-relaxed text-left">
              {personalInfo.summary}
            </p>
          )}
          <div className="text-gray-600 space-y-1">
            {personalInfo.email && <p>{personalInfo.email}</p>}
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.address && <p>{personalInfo.address}</p>}
            {personalInfo.linkedin && (
              <p>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {formatLinkedIn(personalInfo.linkedin)}
                </a>
              </p>
            )}
            {personalInfo.portfolio && (
              <p>
                <a
                  href={personalInfo.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {formatPortfolio(personalInfo.portfolio)}
                </a>
              </p>
            )}
          </div>
        </header>

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-medium mb-4 uppercase tracking-wide" style={{ color: customization.primaryColor }}>
              Experience
            </h2>
            <div className={spacing}>
              {workExperience.map((job) => (
                <div key={job.id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-gray-900">{job.position}</h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(job.startDate)} — {job.current ? 'Present' : formatDate(job.endDate)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{job.company}</p>
                  {job.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">{job.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-medium mb-4 uppercase tracking-wide" style={{ color: customization.primaryColor }}>
              Education
            </h2>
            <div className={spacing}>
              {education.map((edu) => (
                <div key={edu.id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                    </span>
                  </div>
                  <p className="text-gray-600">{edu.school}</p>
                  {edu.field && <p className="text-gray-500 text-sm">{edu.field}</p>}
                  {edu.gpa && <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-medium mb-4 uppercase tracking-wide" style={{ color: customization.primaryColor }}>
              Projects
            </h2>
            <div className={spacing}>
              {projects.map((project) => (
                <div key={project.id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    {project.link && (
                      <a href={project.link} className="text-sm text-gray-500 hover:underline">
                        Link
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <p className="text-gray-500 text-sm">{project.technologies.join(' • ')}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-lg font-medium mb-4 uppercase tracking-wide" style={{ color: customization.primaryColor }}>
              Skills
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {skills.join(' • ')}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};