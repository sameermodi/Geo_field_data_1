import React from 'react';
import { 
  Camera, 
  Video, 
  Mic, 
  FileText, 
  Ruler, 
  Download, 
  Trash2,
  MapPin
} from 'lucide-react';

interface SidebarProps {
  onSelect: (tool: string) => void;
  activeTab: string;
}

export default function Sidebar({ onSelect, activeTab }: SidebarProps) {
  const menuItems = [
    { id: 'photo', icon: Camera, label: 'Photo' },
    { id: 'video', icon: Video, label: 'Video' },
    { id: 'audio', icon: Mic, label: 'Audio' },
    { id: 'note', icon: FileText, label: 'Note' },
    { id: 'measurement', icon: Ruler, label: 'Measurement' },
    { id: 'location', icon: MapPin, label: 'Location' },
  ];

  return (
    <div className="h-screen w-20 bg-gray-900 fixed left-0 top-0 flex flex-col items-center py-6 space-y-8">
      {menuItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`p-3 rounded-lg transition-all duration-200 group relative
            ${activeTab === id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <Icon size={24} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            {label}
          </span>
        </button>
      ))}
      
      <div className="mt-auto space-y-4">
        <button
          onClick={() => onSelect('export')}
          className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 group relative"
        >
          <Download size={24} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Export Data
          </span>
        </button>
        <button
          onClick={() => onSelect('clear')}
          className="p-3 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200 group relative"
        >
          <Trash2 size={24} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Clear All
          </span>
        </button>
      </div>
    </div>
  );
}