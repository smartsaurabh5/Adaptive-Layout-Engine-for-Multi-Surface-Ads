import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, Undo2, Redo2, ZoomIn, ZoomOut, Eye,
  Type, ImageIcon, MousePointer2, Hexagon, Sparkles,
  Pencil, EyeOff, Lock, Unlock, Trash2, CheckCircle,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { layoutApi } from '@/api';
import { DEFAULT_SURFACES } from '@/engine/engine';
import type { ElementNode, ElementType, ScalingStrategy, AnchorPoint } from '@/engine/engine';
import type { TextProps, ButtonProps, ShapeProps } from '@/engine/types';
import AdRenderer from '@/components/renderer/AdRenderer';

const ELEMENT_LIBRARY: { type: ElementType; label: string; sublabel: string; icon: React.ElementType }[] = [
  { type: 'text', label: 'Text Frame', sublabel: 'Header, Sub, Body', icon: Type },
  { type: 'image', label: 'Image / Asset', sublabel: 'High-res PNG, JPG', icon: ImageIcon },
  { type: 'button', label: 'Button / CTA', sublabel: 'Adaptive action pill', icon: MousePointer2 },
  { type: 'logo', label: 'Brand Mark', sublabel: 'Dynamic SVG logo', icon: Sparkles },
  { type: 'shape', label: 'Shape Object', sublabel: 'Badge, Pill, Card', icon: Hexagon },
];

const DEFAULT_ELEMENT_PROPS: Record<ElementType, () => ElementNode['props']> = {
  text: () => ({
    content: 'New Headline',
    fontSize: 20,
    fontWeight: 700,
    fontFamily: 'Inter',
    color: '#ffffff',
    textAlign: 'center' as const,
    lineHeight: 1.2,
    letterSpacing: 0,
  }),
  image: () => ({
    src: '',
    alt: 'Product Creative',
    objectFit: 'contain' as const,
    borderRadius: 8,
    opacity: 1,
  }),
  button: () => ({
    label: 'Take Action',
    backgroundColor: '#6366f1',
    textColor: '#ffffff',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 8,
    paddingX: 20,
    paddingY: 10,
  }),
  logo: () => ({
    src: '',
    alt: 'Brand Logo',
    objectFit: 'contain' as const,
    opacity: 1,
  }),
  shape: () => ({
    shapeType: 'pill' as const,
    backgroundColor: '#e11d48',
    borderColor: '#ffffff',
    borderWidth: 0,
    borderRadius: 9999,
    opacity: 1,
  }),
};

export default function LayoutEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    schema, setSchema, selectedElementId, selectElement,
    activeSurface, setSurface, addElement, updateElement,
    removeElement, undo, redo, history, future, isDirty,
    resetDirty,
  } = useEditorStore();

  const [zoom, setZoom] = useState(0.55);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [editingName, setEditingName] = useState(false);

  // Load layout
  useEffect(() => {
    if (id) {
      setLoading(true);
      layoutApi.get(id).then((s) => {
        setSchema(s);
        setLayoutName(s.name);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, setSchema]);

  // Save
  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    try {
      await layoutApi.update(id, { ...schema, name: layoutName });
      resetDirty();
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } finally {
      setTimeout(() => setSaving(false), 400);
    }
  }, [id, schema, layoutName, resetDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSave(); }
      if (e.key === 'Delete' && selectedElementId) { removeElement(selectedElementId); }
      if (e.key === 'Escape') { selectElement(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, handleSave, selectedElementId, removeElement, selectElement]);

  // Add element
  function handleAddElement(type: ElementType) {
    const newElement: ElementNode = {
      id: `el-${Date.now()}`,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      x: 25 + Math.random() * 15,
      y: 25 + Math.random() * 15,
      width: type === 'button' ? 50 : type === 'logo' ? 20 : 60,
      height: type === 'button' ? 10 : type === 'text' ? 12 : type === 'logo' ? 10 : 25,
      anchor: 'top-left',
      scalingStrategy: 'fit',
      priority: schema.elements.length + 1,
      props: DEFAULT_ELEMENT_PROPS[type](),
      zIndex: schema.elements.length + 1,
      visible: true,
      locked: false,
    };
    addElement(newElement);
    selectElement(newElement.id);
  }

  const selectedElement = schema.elements.find((el) => el.id === selectedElementId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-112px)]">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] -m-6 animate-fade-in relative">
      {/* Toast */}
      {saveToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-slide-up">
          <CheckCircle size={14} />
          <span>Layout published and synced across all surfaces!</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="h-12 bg-white border-b border-surface-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          {editingName ? (
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="input py-0.5 px-2 text-sm font-semibold w-64"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-surface-900 hover:text-primary-600"
            >
              {layoutName || 'Untitled Layout'}
              <Pencil size={12} className="text-surface-400" />
            </button>
          )}
          {saving ? (
            <span className="badge-success text-xs">
              <Save size={10} /> Saving...
            </span>
          ) : isDirty ? (
            <span className="badge bg-amber-100 text-amber-700 text-xs">Unsaved</span>
          ) : (
            <span className="badge-success text-xs">
              <CheckCircle size={10} /> Saved
            </span>
          )}
        </div>

        {/* Surface Switcher */}
        <div className="flex items-center gap-1 bg-surface-50 rounded-lg p-0.5">
          {DEFAULT_SURFACES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSurface(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeSurface.id === s.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-white'
              }`}
            >
              {s.type.charAt(0).toUpperCase() + s.type.slice(1)} {s.width}×{s.height}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/preview/${id || ''}`)}
            className="btn-secondary text-xs py-1.5"
          >
            <Eye size={14} /> Preview All ({DEFAULT_SURFACES.length})
          </button>
          <button onClick={handleSave} className="btn-primary text-xs py-1.5">
            Publish Layout
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — Element Library */}
        <div className="w-56 bg-white border-r border-surface-200 overflow-y-auto shrink-0 flex flex-col justify-between">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                Add Elements
              </p>
            </div>
            <div className="space-y-1">
              {ELEMENT_LIBRARY.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleAddElement(item.type)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                      <Icon size={16} className="text-surface-500 group-hover:text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{item.label}</p>
                      <p className="text-[10px] text-surface-400">{item.sublabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matrix Solver status */}
          <div className="p-3 border-t border-surface-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-surface-900">Matrix Solver</p>
              <span className="text-[10px] text-accent-600 font-medium">Active</span>
            </div>
            <p className="text-[10px] text-surface-400 mb-2">
              All {DEFAULT_SURFACES.length} surface sizes adhere to automatic margin, safe-zone, and CTA constraints.
            </p>
            <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>

        {/* Center — Canvas */}
        <div className="flex-1 bg-surface-100 overflow-auto flex items-center justify-center relative p-8">
          {/* Toolbar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-lg shadow-sm border border-surface-200 px-2 py-1 z-20">
            <button onClick={undo} disabled={history.length === 0} className="p-1 hover:bg-surface-50 rounded disabled:opacity-30" title="Undo (Ctrl+Z)">
              <Undo2 size={14} className="text-surface-600" />
            </button>
            <button onClick={redo} disabled={future.length === 0} className="p-1 hover:bg-surface-50 rounded disabled:opacity-30" title="Redo (Ctrl+Y)">
              <Redo2 size={14} className="text-surface-600" />
            </button>
            <div className="w-px h-4 bg-surface-200" />
            <span className="text-[10px] text-surface-400 font-mono">
              {activeSurface.width} × {activeSurface.height}
            </span>
            <div className="w-px h-4 bg-surface-200" />
            <button onClick={() => setZoom((z) => Math.max(0.15, +(z - 0.1).toFixed(2)))} className="p-1 hover:bg-surface-50 rounded">
              <ZoomOut size={14} className="text-surface-600" />
            </button>
            <span className="text-xs text-surface-500 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))} className="p-1 hover:bg-surface-50 rounded">
              <ZoomIn size={14} className="text-surface-600" />
            </button>
          </div>

          {/* Interactive Canvas */}
          <div className="my-auto flex flex-col items-center">
            <div
              className="bg-white shadow-xl rounded-lg overflow-hidden border border-surface-200/50"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            >
              <AdRenderer
                schema={schema}
                surface={activeSurface}
                selectedElementId={selectedElementId}
                onSelectElement={selectElement}
                onMoveElement={(id, x, y) => updateElement(id, { x, y })}
                scale={zoom}
                interactive={true}
              />
            </div>
            <div className="text-center mt-3">
              <p className="text-[10px] text-surface-400 font-mono">
                CLICK OR DRAG ELEMENTS TO REPOSITION · ADAPTIVE SOLVER ACTIVE
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel — Inspector */}
        <div className="w-72 bg-white border-l border-surface-200 overflow-y-auto shrink-0">
          {selectedElement ? (
            <div className="p-4 space-y-4">
              {/* Element header */}
              <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-600"></span>
                  <span className="text-sm font-semibold text-surface-900 truncate max-w-[150px]">{selectedElement.label}</span>
                </div>
                <span className="text-[10px] text-primary-700 font-mono bg-primary-50 px-2 py-0.5 rounded font-semibold">
                  #{selectedElement.type}
                </span>
              </div>

              {/* Element-Specific Properties */}
              {selectedElement.type === 'text' && (
                <div className="space-y-3 p-3 bg-surface-50 rounded-xl border border-surface-100">
                  <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Text Properties</p>
                  <div>
                    <label className="text-[11px] text-surface-600 block mb-1">Content</label>
                    <textarea
                      value={(selectedElement.props as TextProps).content}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          props: { ...selectedElement.props, content: e.target.value },
                        })
                      }
                      rows={2}
                      className="input py-1.5 text-xs w-full resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-surface-600 block mb-1">Font Size (px)</label>
                      <input
                        type="number"
                        value={(selectedElement.props as TextProps).fontSize}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            props: { ...selectedElement.props, fontSize: Number(e.target.value) },
                          })
                        }
                        className="input py-1 text-xs text-right"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-surface-600 block mb-1">Color</label>
                      <input
                        type="text"
                        value={(selectedElement.props as TextProps).color}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            props: { ...selectedElement.props, color: e.target.value },
                          })
                        }
                        className="input py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedElement.type === 'button' && (
                <div className="space-y-3 p-3 bg-surface-50 rounded-xl border border-surface-100">
                  <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Button Properties</p>
                  <div>
                    <label className="text-[11px] text-surface-600 block mb-1">Button Label</label>
                    <input
                      type="text"
                      value={(selectedElement.props as ButtonProps).label}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          props: { ...selectedElement.props, label: e.target.value },
                        })
                      }
                      className="input py-1.5 text-xs w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-surface-600 block mb-1">Background</label>
                      <input
                        type="text"
                        value={(selectedElement.props as ButtonProps).backgroundColor}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            props: { ...selectedElement.props, backgroundColor: e.target.value },
                          })
                        }
                        className="input py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-surface-600 block mb-1">Text Color</label>
                      <input
                        type="text"
                        value={(selectedElement.props as ButtonProps).textColor}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            props: { ...selectedElement.props, textColor: e.target.value },
                          })
                        }
                        className="input py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedElement.type === 'shape' && (
                <div className="space-y-3 p-3 bg-surface-50 rounded-xl border border-surface-100">
                  <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Shape Properties</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-surface-600 block mb-1">Shape Type</label>
                      <select
                        value={(selectedElement.props as ShapeProps).shapeType}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            props: {
                              ...selectedElement.props,
                              shapeType: e.target.value as 'rectangle' | 'circle' | 'pill' | 'line',
                            },
                          })
                        }
                        className="input py-1 text-xs"
                      >
                        <option value="rectangle">Rectangle</option>
                        <option value="circle">Circle</option>
                        <option value="pill">Pill</option>
                        <option value="line">Line</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-surface-600 block mb-1">Color</label>
                      <input
                        type="text"
                        value={(selectedElement.props as ShapeProps).backgroundColor}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            props: { ...selectedElement.props, backgroundColor: e.target.value },
                          })
                        }
                        className="input py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Position Matrix */}
              <div>
                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Position Matrix (% of surface)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-surface-500 mb-0.5 block">X (%)</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                      className="input py-1 text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-surface-500 mb-0.5 block">Y (%)</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                      className="input py-1 text-xs text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Relative Dimension */}
              <div>
                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Relative Dimension (% of surface)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-surface-500 mb-0.5 block">Width (%)</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                      className="input py-1 text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-surface-500 mb-0.5 block">Height (%)</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                      className="input py-1 text-xs text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Scaling Behavior */}
              <div>
                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">Scaling Behavior</p>
                <select
                  value={selectedElement.scalingStrategy}
                  onChange={(e) => updateElement(selectedElement.id, { scalingStrategy: e.target.value as ScalingStrategy })}
                  className="input py-1.5 text-xs"
                >
                  <option value="fit">Fit (Scale proportionally)</option>
                  <option value="fill">Fill (Cover and crop)</option>
                  <option value="reflow">Reflow (Stack on narrow surfaces)</option>
                  <option value="hide">Hide (Drop below min width)</option>
                </select>
              </div>

              {/* Anchor */}
              <div>
                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">Anchor Point</p>
                <select
                  value={selectedElement.anchor}
                  onChange={(e) => updateElement(selectedElement.id, { anchor: e.target.value as AnchorPoint })}
                  className="input py-1.5 text-xs"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="center-left">Center Left</option>
                  <option value="center">Center</option>
                  <option value="center-right">Center Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeElement(selectedElement.id)}
                className="w-full btn text-xs py-1.5 text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={12} /> Remove Element
              </button>

              {/* Layer Hierarchy */}
              <div className="pt-3 border-t border-surface-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Layer Hierarchy</p>
                  <span className="text-[10px] text-surface-400">{schema.elements.length} Layers</span>
                </div>
                <div className="space-y-1">
                  {[...schema.elements].sort((a, b) => b.zIndex - a.zIndex).map((el) => {
                    const isActive = el.id === selectedElementId;
                    return (
                      <button
                        key={el.id}
                        onClick={() => selectElement(el.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                          isActive ? 'bg-primary-600 text-white' : 'hover:bg-surface-50 text-surface-700'
                        }`}
                      >
                        {el.type === 'text' && <Type size={12} />}
                        {el.type === 'image' && <ImageIcon size={12} />}
                        {el.type === 'button' && <MousePointer2 size={12} />}
                        {el.type === 'logo' && <Sparkles size={12} />}
                        {el.type === 'shape' && <Hexagon size={12} />}
                        <span className="flex-1 truncate">{el.label}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            updateElement(el.id, { visible: !el.visible });
                          }}
                          className={`${isActive ? 'text-white/80' : 'text-surface-400 hover:text-surface-600'}`}
                        >
                          {el.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            updateElement(el.id, { locked: !el.locked });
                          }}
                          className={`${isActive ? 'text-white/80' : 'text-surface-400 hover:text-surface-600'}`}
                        >
                          {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mb-3">
                <MousePointer2 size={20} className="text-surface-400" />
              </div>
              <p className="text-sm font-semibold text-surface-800 mb-1">No element selected</p>
              <p className="text-xs text-surface-400 max-w-[180px]">
                Click or drag any element on the canvas to inspect and edit its adaptive rules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
