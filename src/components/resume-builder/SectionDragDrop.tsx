
import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';


const sectionLabels: Record<string, string> = {
  PersonalInfo: 'Personal Info',
  Experience: 'Experience',
  Education: 'Education',
  Skills: 'Skills',
  Projects: 'Projects',
  Certifications: 'Certifications',
};

const sectionIcons: Record<string, string> = {
  PersonalInfo: 'person',
  Experience: 'work',
  Education: 'school',
  Skills: 'star',
  Projects: 'build',
  Certifications: 'verified',
};

const allSections = [
  'PersonalInfo',
  'Experience',
  'Education',
  'Skills',
  'Projects',
  'Certifications',
];

export default function SectionDragDrop({ sections, setSections }: { sections: string[]; setSections: (s: string[]) => void }) {
  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const newSections = Array.from(sections);
    const [removed] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, removed);
    setSections(newSections);
  }

  function removeSection(idx: number) {
    const newSections = sections.filter((_, i) => i !== idx);
    setSections(newSections);
  }

  function addSection() {
    // Show only sections not already in the list
    const available = allSections.filter(s => !sections.includes(s));
    if (available.length === 0) return;
    setSections([...sections, available[0]]);
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block font-semibold text-lg">Sections</label>
        <button
          type="button"
          className="bg-violet-600 text-white px-3 py-1 rounded hover:bg-violet-700 text-sm font-medium shadow"
          onClick={addSection}
          disabled={sections.length >= allSections.length}
          title={sections.length >= allSections.length ? 'All sections added' : 'Add section'}
        >
          + Add Section
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections-droppable">
          {(provided) => (
            <ul
              className="bg-gray-100 rounded p-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {sections.map((sec, idx) => (
                <Draggable key={sec} draggableId={sec} index={idx}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-2 mb-2 bg-white rounded shadow-sm flex items-center gap-3 transition-all duration-150 ${snapshot.isDragging ? 'ring-2 ring-violet-400 scale-105' : ''}`}
                    >
                      <span className="material-icons text-gray-400 cursor-move select-none">drag_indicator</span>
                      <span className="material-icons text-violet-500">{sectionIcons[sec] || 'description'}</span>
                      <span className="flex-1 font-medium">{sectionLabels[sec] || sec}</span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                        onClick={() => removeSection(idx)}
                        title="Remove section"
                        aria-label="Remove section"
                        disabled={sections.length <= 1}
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <div className="text-xs text-gray-500 mt-1">Drag to reorder. Add or remove sections as needed.</div>
    </div>
  );
}
