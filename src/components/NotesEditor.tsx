import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface NotesEditorProps {
  onSave: (note: string) => void;
}

export default function NotesEditor({ onSave }: NotesEditorProps) {
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (note.trim()) {
      onSave(note);
      setNote('');
    }
  };

  return (
    <div className="bg-green-900/20 rounded-lg p-4 mb-6">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Enter your field notes here..."
        className="w-full h-32 bg-gray-900 text-white rounded-lg p-3 mb-3 
          resize-none focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!note.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 
            text-white rounded-lg hover:bg-green-700 disabled:opacity-50 
            disabled:cursor-not-allowed"
        >
          <Save size={18} />
          <span>Save Note</span>
        </button>
      </div>
    </div>
  );
}