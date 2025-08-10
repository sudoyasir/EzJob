import React, { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import { Navbar } from "@/components/ui/navbar";
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import SectionDragDrop from './SectionDragDrop';

export default function ResumeBuilderContainer() {
  // State for selected template, sections, form data, and build mode
  const [template, setTemplate] = useState('modern');
  const [sections, setSections] = useState([
    'PersonalInfo',
    'Experience',
    'Education',
    'Skills',
    'Projects',
    'Certifications',
  ]);
  const [formData, setFormData] = useState({});
  const [isBuilding, setIsBuilding] = useState(false);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-2 md:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-violet-700 mb-2 flex items-center justify-center gap-2">
          <span className="material-icons text-4xl md:text-5xl text-violet-500">description</span>
          Resume Builder
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
          Enter your details, remove any section you don't want, and build your resume. You can edit again anytime!
        </p>
      </div>
      {!isBuilding ? (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <TemplateSelector template={template} setTemplate={setTemplate} />
            <SectionDragDrop sections={sections} setSections={setSections} />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <ResumeForm sections={sections} formData={formData} setFormData={setFormData} />
          </div>
          <div className="flex justify-end">
            <button
              className="bg-violet-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-violet-700 transition text-lg"
              onClick={() => setIsBuilding(true)}
              type="button"
            >
              Build Resume
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center mb-2">
            <button
              className="bg-gray-200 text-violet-700 px-4 py-1 rounded shadow hover:bg-gray-300 font-semibold flex items-center gap-1"
              onClick={() => setIsBuilding(false)}
              type="button"
            >
              <span className="material-icons text-base">edit</span>
              Edit Details
            </button>
            <span className="text-gray-500 text-sm">Preview & Download</span>
          </div>
          <ResumePreview template={template} sections={sections} formData={formData} />
        </div>
      )}
      </div>
    </>
  );
}
