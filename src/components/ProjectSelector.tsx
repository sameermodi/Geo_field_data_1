import React from 'react';
import { FolderPlus, Folder } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  activeProject: string;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

export default function ProjectSelector({ 
  projects, 
  activeProject, 
  onSelect, 
  onCreateNew 
}: ProjectSelectorProps) {
  return (
    <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
      {projects.map((project) => (
        <button
          key={project.id}
          onClick={() => onSelect(project.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap
            ${activeProject === project.id 
              ? 'bg-green-600 text-white' 
              : 'bg-green-900/20 text-green-300 hover:bg-green-800/30'}`}
        >
          <Folder size={18} />
          <span>{project.name}</span>
        </button>
      ))}
      
      <button
        onClick={onCreateNew}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-900/20 
          text-green-300 hover:bg-green-800/30 whitespace-nowrap"
      >
        <FolderPlus size={18} />
        <span>New Project</span>
      </button>
    </div>
  );
}