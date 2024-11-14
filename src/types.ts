export interface FieldData {
  id: string;
  timestamp: string;
  type: 'photo' | 'video' | 'audio' | 'note' | 'measurement';
  location: {
    latitude: number;
    longitude: number;
  };
  content: string;
  metadata?: {
    strike?: number;
    dip?: number;
    duration?: number;
    size?: number;
  };
  projectId: string;
}