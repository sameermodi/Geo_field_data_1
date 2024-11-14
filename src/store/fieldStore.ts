import { create } from 'zustand';
import { FieldData } from '../types';

interface FieldStore {
  fieldData: FieldData[];
  addData: (data: FieldData) => void;
  deleteData: (id: string) => void;
  clearData: () => void;
}

export const useFieldStore = create<FieldStore>((set) => ({
  fieldData: [],
  addData: (data) => set((state) => ({ 
    fieldData: [...state.fieldData, data] 
  })),
  deleteData: (id) => set((state) => ({ 
    fieldData: state.fieldData.filter(item => item.id !== id) 
  })),
  clearData: () => set({ fieldData: [] }),
}));