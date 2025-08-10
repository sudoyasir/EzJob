import { ResumeData, ResumeCustomization } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

interface ClassicTemplateProps {
  data: ResumeData;
  customization: ResumeCustomization;
}

export const ClassicTemplate = ({ data, customization }: ClassicTemplateProps) => {
  const { personalInfo, workExperience, education, skills, projects } = data;
  const spacing = customization.spacing === 'compact' ? 'space-y-3' : customization.spacing === 'spacious' ? 'space-y-6' : 'space-y-4';

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full h-full p-8 bg-white text-gray-900">
      <div className={`${spacing} max-w-none`}>
        {/* Header */}
        <header className="text-center pb-4 border-b border-gray-300">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            {personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {personalInfo.address}
              </div>
            )}
          </div>
          {(personalInfo.linkedin || personalInfo.portfolio) && (
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mt-2">
              {personalInfo.linkedin && (
                <div className="flex items-center gap-1">
                  <Linkedin className="w-4 h-4" />
                  {personalInfo.linkedin}
                </div>
              )}
              {personalInfo.portfolio && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {personalInfo.portfolio}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2">
              Professional Experience
            </h2>
            <div className={spacing}>
              {workExperience.map((job) => (
                <div key={job.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{job.position}</h3>
                      <p className="text-gray-700 font-medium text-lg">{job.company}</p>
                    </div>
                    <div className="text-gray-600 text-right">
                      <p className="font-medium">
                        {formatDate(job.startDate)} - {job.current ? 'Present' : formatDate(job.endDate)}
                      </p>
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-gray-700 leading-relaxed">{job.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2">
              Education
            </h2>
            <div className={spacing}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-700 font-medium text-lg">{edu.school}</p>
                      {edu.field && <p className="text-gray-600">{edu.field}</p>}
                      {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                    </div>
                    <div className="text-gray-600 text-right">
                      <p className="font-medium">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2">
              Technical Skills
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {skills.join(' • ')}
            </p>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2">
              Notable Projects
            </h2>
            <div className={spacing}>
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                    {project.link && (
                      <a href={project.link} className="text-blue-600 hover:underline font-medium">
                        View Project
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-gray-700 leading-relaxed mb-2">{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <p className="text-gray-600">
                      <span className="font-medium">Technologies:</span> {project.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};