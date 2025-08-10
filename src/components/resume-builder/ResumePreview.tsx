import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: 'Helvetica' },
  section: { marginBottom: 16 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 12 },
});


function ModernTemplate({ sections, formData }: { sections: string[]; formData: any }) {
  return (
    <Page size="A4" style={styles.page}>
      {sections.map(section => {
        const label = section.replace(/([A-Z])/g, ' $1').trim();
        if (section === 'Experience' || section === 'Education') {
          const entries = Array.isArray(formData[section]) ? formData[section] : [];
          return (
            <View key={section} style={{ ...styles.section, borderLeft: '4px solid #7c3aed', paddingLeft: 12 }}>
              <Text style={{ ...styles.heading, color: '#7c3aed' }}>{label}</Text>
              {entries.length === 0 && <Text style={styles.text}>No entries.</Text>}
              {entries.map((entry: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  {section === 'Experience' ? (
                    <>
                      <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{entry.jobTitle || ''} {entry.company ? `@ ${entry.company}` : ''}</Text>
                      <Text style={{ fontSize: 11, color: '#666' }}>{entry.startDate || ''}{entry.endDate ? ` - ${entry.endDate}` : ''}</Text>
                      <Text style={styles.text}>{entry.description || ''}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{entry.degree || ''} {entry.institution ? `@ ${entry.institution}` : ''}</Text>
                      <Text style={{ fontSize: 11, color: '#666' }}>{entry.startYear || ''}{entry.endYear ? ` - ${entry.endYear}` : ''}</Text>
                      <Text style={styles.text}>{entry.details || ''}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          );
        }
        return (
          <View key={section} style={{ ...styles.section, borderLeft: '4px solid #7c3aed', paddingLeft: 12 }}>
            <Text style={{ ...styles.heading, color: '#7c3aed' }}>{label}</Text>
            <Text style={styles.text}>{formData[section] || ''}</Text>
          </View>
        );
      })}
    </Page>
  );
}

function ClassicTemplate({ sections, formData }: { sections: string[]; formData: any }) {
  return (
    <Page size="A4" style={{ ...styles.page, fontFamily: 'Times-Roman' }}>
      {sections.map(section => {
        const label = section.replace(/([A-Z])/g, ' $1').trim();
        if (section === 'Experience' || section === 'Education') {
          const entries = Array.isArray(formData[section]) ? formData[section] : [];
          return (
            <View key={section} style={styles.section}>
              <Text style={{ ...styles.heading, color: '#222', borderBottom: '1px solid #bbb', paddingBottom: 2 }}>{label}</Text>
              {entries.length === 0 && <Text style={styles.text}>No entries.</Text>}
              {entries.map((entry: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  {section === 'Experience' ? (
                    <>
                      <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{entry.jobTitle || ''} {entry.company ? `@ ${entry.company}` : ''}</Text>
                      <Text style={{ fontSize: 11, color: '#666' }}>{entry.startDate || ''}{entry.endDate ? ` - ${entry.endDate}` : ''}</Text>
                      <Text style={styles.text}>{entry.description || ''}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{entry.degree || ''} {entry.institution ? `@ ${entry.institution}` : ''}</Text>
                      <Text style={{ fontSize: 11, color: '#666' }}>{entry.startYear || ''}{entry.endYear ? ` - ${entry.endYear}` : ''}</Text>
                      <Text style={styles.text}>{entry.details || ''}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          );
        }
        return (
          <View key={section} style={styles.section}>
            <Text style={{ ...styles.heading, color: '#222', borderBottom: '1px solid #bbb', paddingBottom: 2 }}>{label}</Text>
            <Text style={styles.text}>{formData[section] || ''}</Text>
          </View>
        );
      })}
    </Page>
  );
}

function MinimalistTemplate({ sections, formData }: { sections: string[]; formData: any }) {
  return (
    <Page size="A4" style={{ ...styles.page, backgroundColor: '#fafafa' }}>
      {sections.map(section => {
        const label = section.replace(/([A-Z])/g, ' $1').trim();
        if (section === 'Experience' || section === 'Education') {
          const entries = Array.isArray(formData[section]) ? formData[section] : [];
          return (
            <View key={section} style={{ ...styles.section, marginBottom: 10 }}>
              <Text style={{ ...styles.heading, fontSize: 14, color: '#444', marginBottom: 2 }}>{label}</Text>
              {entries.length === 0 && <Text style={{ ...styles.text, color: '#666' }}>No entries.</Text>}
              {entries.map((entry: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 6 }}>
                  {section === 'Experience' ? (
                    <>
                      <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{entry.jobTitle || ''} {entry.company ? `@ ${entry.company}` : ''}</Text>
                      <Text style={{ fontSize: 10, color: '#888' }}>{entry.startDate || ''}{entry.endDate ? ` - ${entry.endDate}` : ''}</Text>
                      <Text style={{ ...styles.text, color: '#666' }}>{entry.description || ''}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{entry.degree || ''} {entry.institution ? `@ ${entry.institution}` : ''}</Text>
                      <Text style={{ fontSize: 10, color: '#888' }}>{entry.startYear || ''}{entry.endYear ? ` - ${entry.endYear}` : ''}</Text>
                      <Text style={{ ...styles.text, color: '#666' }}>{entry.details || ''}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          );
        }
        return (
          <View key={section} style={{ ...styles.section, marginBottom: 10 }}>
            <Text style={{ ...styles.heading, fontSize: 14, color: '#444', marginBottom: 2 }}>{label}</Text>
            <Text style={{ ...styles.text, color: '#666' }}>{formData[section] || ''}</Text>
          </View>
        );
      })}
    </Page>
  );
}

function ResumePDF({ template, sections, formData }: { template: string; sections: string[]; formData: any }) {
  // Switch template based on 'template' prop
  return (
    <Document>
      {template === 'classic' && <ClassicTemplate sections={sections} formData={formData} />}
      {template === 'minimal' && <MinimalistTemplate sections={sections} formData={formData} />}
      {(!template || template === 'modern') && <ModernTemplate sections={sections} formData={formData} />}
    </Document>
  );
}

export default function ResumePreview({ template, sections, formData }: { template: string; sections: string[]; formData: any }) {
  // Download PDF handler
  const handleDownload = async () => {
    const blob = await pdf(<ResumePDF template={template} sections={sections} formData={formData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.pdf';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="bg-white rounded shadow p-4 min-h-[600px]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-500">Live PDF Preview</div>
        <button
          type="button"
          className="bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition text-sm font-semibold flex items-center gap-2"
          onClick={handleDownload}
        >
          <span className="material-icons text-base">download</span>
          Download PDF
        </button>
      </div>
      <div style={{ width: '100%', height: 600 }}>
        <PDFViewer width="100%" height={600} showToolbar={true}>
          <ResumePDF template={template} sections={sections} formData={formData} />
        </PDFViewer>
      </div>
    </div>
  );
}
