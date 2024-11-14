import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { useFieldStore } from './store/fieldStore';
import MediaCapture from './components/MediaCapture';
import DataList from './components/DataList';
import NotesEditor from './components/NotesEditor';
import ProjectSelector from './components/ProjectSelector';
import ActionButtons from './components/ActionButtons';
import { FieldData } from './types';

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('');
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const { fieldData, addData, deleteData, clearData } = useFieldStore();
  const [projects, setProjects] = useState<Project[]>([
    { id: 'default', name: 'Default Project', createdAt: new Date().toISOString() }
  ]);
  const [activeProject, setActiveProject] = useState('default');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => setLocation(position),
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleToolSelect = async (tool: string) => {
    if (tool === 'export') {
      const zip = new JSZip();
      
      // Create folders for different types
      const folders = {
        photos: zip.folder('photos'),
        videos: zip.folder('videos'),
        audio: zip.folder('audio'),
        notes: zip.folder('notes')
      };
      
      // Add metadata file
      const metadata = fieldData.map(item => ({
        id: item.id,
        type: item.type,
        timestamp: item.timestamp,
        location: item.location,
        filename: `${item.type}_${item.timestamp.replace(/[:.]/g, '-')}`
      }));
      
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));
      
      // Add files to respective folders
      fieldData.forEach((item) => {
        const timestamp = item.timestamp.replace(/[:.]/g, '-');
        
        if (item.type === 'note') {
          folders.notes?.file(`note_${timestamp}.txt`, item.content);
        } else {
          const base64Data = item.content.split(',')[1];
          const extension = item.type === 'photo' ? 'jpg' : 'webm';
          const folder = folders[`${item.type}s`];
          
          if (folder) {
            folder.file(`${item.type}_${timestamp}.${extension}`, base64Data, { base64: true });
          }
        }
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `field_data_${activeProject}_${new Date().toISOString()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (tool === 'clear') {
      if (window.confirm('Are you sure you want to clear all data?')) {
        clearData();
      }
    } else {
      setActiveTab(tool);
      if (['photo', 'video', 'audio'].includes(tool)) {
        setShowMediaCapture(true);
      }
    }
  };

  const handleMediaCapture = (content: string) => {
    if (!location) {
      alert('Location data is not available. Please enable location services.');
      return;
    }

    const newData: FieldData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: activeTab as 'photo' | 'video' | 'audio',
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      content,
      projectId: activeProject
    };

    addData(newData);
    setShowMediaCapture(false);
  };

  const handleCreateProject = () => {
    const name = prompt('Enter project name:');
    if (name) {
      const newProject = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString()
      };
      setProjects([...projects, newProject]);
      setActiveProject(newProject.id);
    }
  };

  const handleSaveNote = (note: string) => {
    if (!location) {
      alert('Location data is not available. Please enable location services.');
      return;
    }

    const newData: FieldData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'note',
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      content: note,
      projectId: activeProject
    };

    addData(newData);
  };

  const filteredData = fieldData.filter(item => item.projectId === activeProject);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-green-400">Field Data Collection</h1>
        
        <ProjectSelector
          projects={projects}
          activeProject={activeProject}
          onSelect={setActiveProject}
          onCreateNew={handleCreateProject}
        />
        
        {location && (
          <div className="mb-6 p-4 bg-green-900/20 rounded-lg inline-block">
            <p className="text-green-300">
              Current Location: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
            </p>
          </div>
        )}

        <ActionButtons onSelect={handleToolSelect} />
        
        <NotesEditor onSave={handleSaveNote} />

        <DataList data={filteredData} onDelete={deleteData} />
      </div>

      {showMediaCapture && (
        <MediaCapture
          type={activeTab as 'photo' | 'video' | 'audio'}
          onCapture={handleMediaCapture}
          onCancel={() => setShowMediaCapture(false)}
        />
      )}
    </div>
  );
}

export default App;