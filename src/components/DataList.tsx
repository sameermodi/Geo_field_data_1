import React from 'react';
import { format } from 'date-fns';
import { Camera, Video, Mic, FileText, Trash2 } from 'lucide-react';
import { FieldData } from '../types';

interface DataListProps {
  data: FieldData[];
  onDelete: (id: string) => void;
}

export default function DataList({ data, onDelete }: DataListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'photo': return Camera;
      case 'video': return Video;
      case 'audio': return Mic;
      case 'note': return FileText;
      default: return FileText;
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => {
        const Icon = getIcon(item.type);
        
        return (
          <div key={item.id} className="bg-green-900/20 rounded-lg p-4 relative group">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="text-green-400" size={24} />
                <div>
                  <h3 className="text-white font-medium">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </h3>
                  <p className="text-green-300 text-sm">
                    {format(new Date(item.timestamp), 'PPpp')}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => onDelete(item.id)}
                className="text-green-400 hover:text-red-500 transition-colors duration-200"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <p className="text-green-300 text-sm">
                Location: {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
              </p>

              {item.type === 'note' && (
                <p className="text-green-300 text-sm line-clamp-3">
                  {item.content}
                </p>
              )}

              {(item.type === 'photo' || item.type === 'video') && (
                <div className="mt-2 aspect-video bg-gray-900 rounded overflow-hidden">
                  {item.type === 'photo' ? (
                    <img 
                      src={item.content} 
                      alt="Captured" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={item.content}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              {item.type === 'audio' && (
                <audio controls className="w-full mt-2">
                  <source src={item.content} type="audio/webm" />
                </audio>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}