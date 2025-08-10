import React from 'react';

export default function ResumeForm({ sections, formData, setFormData }: { sections: string[]; formData: any; setFormData: (d: any) => void }) {
  // Helper to update multi-entry fields
  const handleMultiChange = (section: string, idx: number, field: string, value: string) => {
    const arr = Array.isArray(formData[section]) ? [...formData[section]] : [];
    arr[idx] = { ...arr[idx], [field]: value };
    setFormData({ ...formData, [section]: arr });
  };
  const addEntry = (section: string) => {
    const arr = Array.isArray(formData[section]) ? [...formData[section]] : [];
    arr.push({});
    setFormData({ ...formData, [section]: arr });
  };
  const removeEntry = (section: string, idx: number) => {
    const arr = Array.isArray(formData[section]) ? [...formData[section]] : [];
    arr.splice(idx, 1);
    setFormData({ ...formData, [section]: arr });
  };

  return (
    <form className="space-y-6">
      {sections.map(section => {
        // Multi-entry, multi-field for Experience and Education
        if (section === 'Experience' || section === 'Education') {
          const fields = section === 'Experience'
            ? [
                { name: 'Job Title', key: 'jobTitle' },
                { name: 'Company', key: 'company' },
                { name: 'Start Date', key: 'startDate' },
                { name: 'End Date', key: 'endDate' },
                { name: 'Description', key: 'description' },
              ]
            : [
                { name: 'Degree', key: 'degree' },
                { name: 'Institution', key: 'institution' },
                { name: 'Start Year', key: 'startYear' },
                { name: 'End Year', key: 'endYear' },
                { name: 'Details', key: 'details' },
              ];
          const entries = Array.isArray(formData[section]) ? formData[section] : [];
          return (
            <div
              key={section}
              className="rounded-2xl shadow-md bg-gradient-to-br from-violet-50 to-white border border-violet-100 p-5 transition hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="material-icons text-violet-400">edit_note</span>
                <label className="font-bold text-xl text-violet-700">
                  {section.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <button
                  type="button"
                  className="ml-auto bg-violet-600 text-white px-3 py-1 rounded text-xs hover:bg-violet-700"
                  onClick={() => addEntry(section)}
                >
                  + Add {section === 'Experience' ? 'Job' : 'Education'}
                </button>
              </div>
              {entries.length === 0 && (
                <div className="text-gray-400 text-sm mb-2">No entries yet.</div>
              )}
              {entries.map((entry: any, idx: number) => (
                <div key={idx} className="mb-4 p-3 rounded bg-white border border-violet-100 relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                    onClick={() => removeEntry(section, idx)}
                    title="Remove entry"
                  >
                    <span className="material-icons text-base">delete</span>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fields.map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold mb-1">{f.name}</label>
                        {f.key === 'description' || f.key === 'details' ? (
                          <textarea
                            className="w-full border border-violet-200 px-2 py-1 rounded min-h-[40px]"
                            value={entry[f.key] || ''}
                            onChange={e => handleMultiChange(section, idx, f.key, e.target.value)}
                          />
                        ) : (
                          <input
                            className="w-full border border-violet-200 px-2 py-1 rounded"
                            value={entry[f.key] || ''}
                            onChange={e => handleMultiChange(section, idx, f.key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        // Default: single textarea
        return (
          <div
            key={section}
            className="rounded-2xl shadow-md bg-gradient-to-br from-violet-50 to-white border border-violet-100 p-5 transition hover:shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icons text-violet-400">edit_note</span>
              <label className="font-bold text-xl text-violet-700">
                {section.replace(/([A-Z])/g, ' $1').trim()}
              </label>
            </div>
            <textarea
              className="w-full border border-violet-200 focus:border-violet-400 px-3 py-2 rounded-lg min-h-[60px] bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 transition"
              placeholder={`Enter ${section.replace(/([A-Z])/g, ' $1').trim()} details...`}
              value={formData[section] || ''}
              onChange={e => setFormData({ ...formData, [section]: e.target.value })}
            />
          </div>
        );
      })}
    </form>
  );
}
