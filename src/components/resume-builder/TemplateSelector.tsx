import React from 'react';

const templates = [
  { id: 'modern', name: 'Modern', desc: 'Bold, clean, and professional' },
  { id: 'classic', name: 'Classic', desc: 'Traditional and elegant' },
  { id: 'minimal', name: 'Minimalist', desc: 'Simple and focused' },
];

export default function TemplateSelector({ template, setTemplate }: { template: string; setTemplate: (id: string) => void }) {
  // Enhanced visual preview for each template
  const previewBox = (id: string) => {
    if (id === 'classic') return (
      <div className="w-16 h-20 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center shadow-sm">
        <div className="w-10 h-3 bg-gray-300 rounded mb-1" />
        <div className="w-8 h-2 bg-gray-200 rounded mb-1" />
        <div className="w-12 h-2 bg-gray-100 rounded" />
      </div>
    );
    if (id === 'minimal') return (
      <div className="w-16 h-20 rounded-lg border-2 border-gray-200 bg-white flex flex-col items-center justify-center shadow-sm">
        <div className="w-10 h-2 bg-gray-100 rounded mb-2" />
        <div className="w-8 h-2 bg-gray-100 rounded mb-2" />
        <div className="w-6 h-2 bg-gray-100 rounded" />
      </div>
    );
    return (
      <div className="w-16 h-20 rounded-lg border-2 border-violet-300 bg-gradient-to-br from-violet-100 to-white flex flex-col items-center justify-center shadow-md">
        <div className="w-10 h-3 bg-violet-400 rounded mb-1" />
        <div className="w-8 h-2 bg-violet-200 rounded mb-1" />
        <div className="w-12 h-2 bg-violet-100 rounded" />
      </div>
    );
  };
  return (
    <div className="mb-6">
      <label className="block font-semibold mb-3 text-violet-700 text-lg">Choose a Resume Template</label>
      <div className="flex gap-6 flex-wrap justify-center">
        {templates.map(t => (
          <button
            key={t.id}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border-2 shadow-sm transition-all duration-200 w-36 focus:outline-none focus:ring-2 focus:ring-violet-300
              ${template === t.id ? 'bg-violet-50 border-violet-500 ring-2 ring-violet-200 scale-105' : 'bg-white border-gray-200 hover:border-violet-400'}`}
            onClick={() => setTemplate(t.id)}
            type="button"
            title={t.name}
          >
            {previewBox(t.id)}
            <span className={`font-semibold text-base ${template === t.id ? 'text-violet-700' : 'text-gray-700'}`}>{t.name}</span>
            <span className="text-xs text-gray-500 text-center">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
