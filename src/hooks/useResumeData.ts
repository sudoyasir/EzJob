import { useState, useEffect } from 'react';
import { ResumeData } from '@/types/resume';

const STORAGE_KEY = 'resumebuilder_data';

const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    address: ''
  },
  workExperience: [],
  education: [],
  skills: [],
  projects: []
};

export const useResumeData = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setResumeData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading resume data:', error);
      }
    }
  }, []);

  const updateResumeData = (newData: Partial<ResumeData>) => {
    const updatedData = { ...resumeData, ...newData };
    setResumeData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  };

  const updatePersonalInfo = (personalInfo: Partial<ResumeData['personalInfo']>) => {
    updateResumeData({
      personalInfo: { ...resumeData.personalInfo, ...personalInfo }
    });
  };

  const updateWorkExperience = (workExperience: ResumeData['workExperience']) => {
    updateResumeData({ workExperience });
  };

  const updateEducation = (education: ResumeData['education']) => {
    updateResumeData({ education });
  };

  const updateSkills = (skills: string[]) => {
    updateResumeData({ skills });
  };

  const updateProjects = (projects: ResumeData['projects']) => {
    updateResumeData({ projects });
  };

  return {
    resumeData,
    updatePersonalInfo,
    updateWorkExperience,
    updateEducation,
    updateSkills,
    updateProjects
  };
};