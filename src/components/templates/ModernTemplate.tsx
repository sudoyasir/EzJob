import { ResumeData, ResumeCustomization } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin, Globe, Calendar } from 'lucide-react';

interface ModernTemplateProps {
  data: ResumeData;
  customization: ResumeCustomization;
}

export const ModernTemplate = ({ data, customization }: ModernTemplateProps) => {
  const { personalInfo, workExperience, education, skills, projects } = data;
  const spacing = customization.spacing === 'compact' ? 'space-y-3' : customization.spacing === 'spacious' ? 'space-y-6' : 'space-y-4';

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (customization.layout === 'single-column') {
    return (
      <div className="w-full h-full p-8 bg-white text-gray-900">
        <div className={`${spacing} max-w-none`}>
          {/* Header */}
          <header className="text-center pb-6 border-b-2" style={{ borderColor: customization.primaryColor }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: customization.primaryColor }}>
              {personalInfo.fullName || 'Your Name'}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
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
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mt-2">
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
          </header>

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3" style={{ color: customization.primaryColor }}>
                WORK EXPERIENCE
              </h2>
              <div className={spacing}>
                {workExperience.map((job) => (
                  <div key={job.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{job.position}</h3>
                        <p className="text-gray-700 font-medium">{job.company}</p>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(job.startDate)} - {job.current ? 'Present' : formatDate(job.endDate)}
                      </div>
                    </div>
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
            <section>
              <h2 className="text-xl font-bold mb-3" style={{ color: customization.primaryColor }}>
                EDUCATION
              </h2>
              <div className={spacing}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-gray-700">{edu.school}</p>
                        {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </div>
                    </div>
                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3" style={{ color: customization.primaryColor }}>
                SKILLS
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: customization.primaryColor + '20',
                      color: customization.primaryColor 
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3" style={{ color: customization.primaryColor }}>
                PROJECTS
              </h2>
              <div className={spacing}>
                {projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      {project.link && (
                        <a href={project.link} className="text-sm text-blue-600 hover:underline">
                          View Project
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">{project.description}</p>
                    )}
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: customization.primaryColor + '15',
                              color: customization.primaryColor 
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
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

  // Two-column layout
  return (
    <div className="w-full h-full flex bg-white text-gray-900">
      {/* Left Column */}
      <div className="w-1/3 p-6" style={{ backgroundColor: customization.primaryColor + '10' }}>
        <div className={spacing}>
          {/* Contact Info */}
          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: customization.primaryColor }}>
              CONTACT
            </h2>
            <div className="space-y-2 text-sm">
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: customization.primaryColor }} />
                  <span className="break-all">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" style={{ color: customization.primaryColor }} />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: customization.primaryColor }} />
                  <span>{personalInfo.address}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" style={{ color: customization.primaryColor }} />
                  <span className="break-all">{personalInfo.linkedin}</span>
                </div>
              )}
              {personalInfo.portfolio && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" style={{ color: customization.primaryColor }} />
                  <span className="break-all">{personalInfo.portfolio}</span>
                </div>
              )}
            </div>
          </section>

          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3" style={{ color: customization.primaryColor }}>
                SKILLS
              </h2>
              <div className="space-y-1">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="px-2 py-1 rounded text-sm font-medium"
                    style={{ 
                      backgroundColor: customization.primaryColor + '20',
                      color: customization.primaryColor 
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3" style={{ color: customization.primaryColor }}>
                EDUCATION
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-sm">
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.school}</p>
                    {edu.field && <p className="text-gray-600">{edu.field}</p>}
                    <p className="text-gray-600">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                    {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="w-2/3 p-6">
        <div className={spacing}>
          {/* Header */}
          <header>
            <h1 className="text-3xl font-bold mb-2" style={{ color: customization.primaryColor }}>
              {personalInfo.fullName || 'Your Name'}
            </h1>
          </header>

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3" style={{ color: customization.primaryColor }}>
                WORK EXPERIENCE
              </h2>
              <div className={spacing}>
                {workExperience.map((job) => (
                  <div key={job.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{job.position}</h3>
                        <p className="text-gray-700 font-medium">{job.company}</p>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(job.startDate)} - {job.current ? 'Present' : formatDate(job.endDate)}
                      </div>
                    </div>
                    {job.description && (
                      <p className="text-gray-700 text-sm leading-relaxed">{job.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3" style={{ color: customization.primaryColor }}>
                PROJECTS
              </h2>
              <div className={spacing}>
                {projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      {project.link && (
                        <a href={project.link} className="text-sm text-blue-600 hover:underline">
                          View Project
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">{project.description}</p>
                    )}
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: customization.primaryColor + '15',
                              color: customization.primaryColor 
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};