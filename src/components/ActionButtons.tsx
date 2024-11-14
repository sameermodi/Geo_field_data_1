import React from 'react';
import { 
  Camera, 
  Video, 
  Mic, 
  Download,
  Trash2
} from 'lucide-react';

interface ActionButtonsProps {
  onSelect: (tool: string) => void;
}

export default function ActionButtons({ onSelect }: ActionButtonsProps) {
  const actions = [
    { id: 'photo', icon: Camera, label: 'Take Photo', color: 'bg-green-600 hover:bg-green-700' },
    { id: 'video', icon: Video, label: 'Record Video', color: 'bg-green-600 hover:bg-green-700' },
    { id: 'audio', icon: Mic, label: 'Record Audio', color: 'bg-green-600 hover:bg-green-700' },
    { id: 'export', icon: Download, label: 'Export Data', color: 'bg-green-700 hover:bg-green-800' },
    { id: 'clear', icon: Trash2, label: 'Clear All', color: 'bg-red-600 hover:bg-red-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {actions.map(({ id, icon: Icon, label, color }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`${color} text-white p-4 rounded-lg flex flex-col items-center 
            justify-center space-y-2 transition-transform hover:scale-105 
            active:scale-95`}
        >
          <Icon size={24} />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}