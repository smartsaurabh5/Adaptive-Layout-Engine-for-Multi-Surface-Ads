import { create } from 'zustand';
import type { LayoutSchema, ElementNode, Surface } from '@/engine/engine';
import { DEFAULT_SURFACES, createBlankSchema } from '@/engine/engine';

interface EditorState {
  // Schema state
  schema: LayoutSchema;
  // Selection
  selectedElementId: string | null;
  // Active surface for preview
  activeSurface: Surface;
  // Undo/redo history
  history: LayoutSchema[];
  future: LayoutSchema[];
  // Dirty tracking
  isDirty: boolean;
  // Actions
  setSchema: (schema: LayoutSchema) => void;
  selectElement: (id: string | null) => void;
  setSurface: (surface: Surface) => void;
  addElement: (element: ElementNode) => void;
  updateElement: (id: string, updates: Partial<ElementNode>) => void;
  removeElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  reorderElement: (id: string, newZIndex: number) => void;
  undo: () => void;
  redo: () => void;
  resetDirty: () => void;
}

function pushHistory(state: EditorState): Partial<EditorState> {
  return {
    history: [...state.history.slice(-49), state.schema],
    future: [],
    isDirty: true,
  };
}

export const useEditorStore = create<EditorState>((set) => ({
  schema: createBlankSchema(),
  selectedElementId: null,
  activeSurface: DEFAULT_SURFACES[2], // Square (1080x1080) as default
  history: [],
  future: [],
  isDirty: false,

  setSchema: (schema) => set({ schema, history: [], future: [], isDirty: false }),

  selectElement: (id) => set({ selectedElementId: id }),

  setSurface: (surface) => set({ activeSurface: surface }),

  addElement: (element) =>
    set((state) => ({
      ...pushHistory(state),
      schema: {
        ...state.schema,
        elements: [...state.schema.elements, element],
        version: state.schema.version,
      },
      selectedElementId: element.id,
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      ...pushHistory(state),
      schema: {
        ...state.schema,
        elements: state.schema.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      },
    })),

  removeElement: (id) =>
    set((state) => ({
      ...pushHistory(state),
      schema: {
        ...state.schema,
        elements: state.schema.elements.filter((el) => el.id !== id),
      },
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    })),

  moveElement: (id, x, y) =>
    set((state) => ({
      ...pushHistory(state),
      schema: {
        ...state.schema,
        elements: state.schema.elements.map((el) =>
          el.id === id ? { ...el, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : el
        ),
      },
    })),

  resizeElement: (id, width, height) =>
    set((state) => ({
      ...pushHistory(state),
      schema: {
        ...state.schema,
        elements: state.schema.elements.map((el) =>
          el.id === id ? { ...el, width: Math.max(1, Math.min(100, width)), height: Math.max(1, Math.min(100, height)) } : el
        ),
      },
    })),

  reorderElement: (id, newZIndex) =>
    set((state) => ({
      ...pushHistory(state),
      schema: {
        ...state.schema,
        elements: state.schema.elements.map((el) =>
          el.id === id ? { ...el, zIndex: newZIndex } : el
        ),
      },
    })),

  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      return {
        schema: previous,
        history: state.history.slice(0, -1),
        future: [state.schema, ...state.future],
        isDirty: true,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        schema: next,
        history: [...state.history, state.schema],
        future: state.future.slice(1),
        isDirty: true,
      };
    }),

  resetDirty: () => set({ isDirty: false }),
}));
