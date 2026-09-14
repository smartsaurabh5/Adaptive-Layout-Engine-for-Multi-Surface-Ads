import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { surfaceApi } from '@/api';
import type { Surface } from '@/engine/engine';

export default function SurfacesPage() {
  const [surfaces, setSurfaces] = useState<Surface[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'banner' as Surface['type'],
    width: 300,
    height: 250,
    minSupportedWidth: 200,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSurfaces();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal) {
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  async function loadSurfaces() {
    setLoading(true);
    try {
      const data = await surfaceApi.list();
      setSurfaces(data);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateSurface = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Surface name is required.';
    }
    if (!formData.width || formData.width <= 0) {
      newErrors.width = 'Width must be greater than 0.';
    }
    if (!formData.height || formData.height <= 0) {
      newErrors.height = 'Height must be greater than 0.';
    }
    if (!formData.minSupportedWidth || formData.minSupportedWidth <= 0) {
      newErrors.minSupportedWidth = 'Minimum supported width must be greater than 0.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newSurface: Surface = {
      id: `surface-${Date.now()}`,
      name: formData.name.trim(),
      type: formData.type,
      width: Number(formData.width),
      height: Number(formData.height),
      minSupportedWidth: Number(formData.minSupportedWidth),
    };

    setSurfaces((prev) => [newSurface, ...prev]);
    setShowAddModal(false);
    setFormData({
      name: '',
      type: 'banner',
      width: 300,
      height: 250,
      minSupportedWidth: 200,
    });
    setErrors({});
    showToast(`Surface "${newSurface.name}" added successfully.`);
  };

  const handleDeleteSurface = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete surface "${name}"?`)) {
      setSurfaces((prev) => prev.filter((s) => s.id !== id));
      showToast(`Surface "${name}" removed.`);
    }
  };

  const surfaceTypeColors: Record<string, string> = {
    banner: 'bg-blue-100 text-blue-700',
    leaderboard: 'bg-purple-100 text-purple-700',
    square: 'bg-emerald-100 text-emerald-700',
    story: 'bg-pink-100 text-pink-700',
    skyscraper: 'bg-amber-100 text-amber-700',
    custom: 'bg-surface-100 text-surface-600',
  };

  return (
    <div className="animate-slide-up">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-slide-up">
          <Check size={14} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Surfaces</h1>
          <p className="text-sm text-surface-500">
            Manage target surface dimensions for adaptive layout rendering.
          </p>
        </div>
        <button
          onClick={() => {
            setErrors({});
            setShowAddModal(true);
          }}
          className="btn-primary"
        >
          <Plus size={16} /> Add Surface
        </button>
      </div>

      {/* Surface Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">
                Name
              </th>
              <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">
                Type
              </th>
              <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">
                Dimensions
              </th>
              <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">
                Aspect Ratio
              </th>
              <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">
                Min Width
              </th>
              <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-surface-100">
                  <td className="px-5 py-4"><div className="h-4 bg-surface-100 rounded w-40 animate-pulse" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-surface-100 rounded w-20 animate-pulse" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-surface-100 rounded w-24 animate-pulse" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-surface-100 rounded w-16 animate-pulse" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-surface-100 rounded w-16 animate-pulse" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-surface-100 rounded w-16 animate-pulse ml-auto" /></td>
                </tr>
              ))
            ) : (
              surfaces.map((surface) => {
                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
                const d = gcd(surface.width, surface.height);
                const ratio = `${surface.width / d}:${surface.height / d}`;

                return (
                  <tr key={surface.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center">
                          <div
                            className="bg-primary-200 rounded-sm"
                            style={{
                              width: `${Math.min(surface.width / surface.height, 1) * 24}px`,
                              height: `${Math.min(surface.height / surface.width, 1) * 24}px`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-surface-900">{surface.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${surfaceTypeColors[surface.type] || surfaceTypeColors.custom}`}>
                        {surface.type.charAt(0).toUpperCase() + surface.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-surface-700 font-mono">
                        {surface.width} × {surface.height} px
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-surface-500">{ratio}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-surface-500">{surface.minSupportedWidth}px</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDeleteSurface(surface.id, surface.name)}
                        className="p-1.5 hover:bg-red-50 text-surface-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete Surface"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Surface Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-surface-200 w-full max-w-md p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-100">
              <h3 className="text-lg font-bold text-surface-900">Add New Surface</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-surface-100 flex items-center justify-center text-surface-400 hover:text-surface-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSurface} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Surface Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. YouTube Companion Banner"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-400 focus:ring-red-200' : 'border-surface-200 focus:ring-primary-200'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Surface Category / Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Surface['type'] })}
                  className="w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
                >
                  <option value="banner">Banner</option>
                  <option value="leaderboard">Leaderboard</option>
                  <option value="square">Square</option>
                  <option value="story">Story</option>
                  <option value="skyscraper">Skyscraper</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">
                    Width (px) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                      errors.width ? 'border-red-400 focus:ring-red-200' : 'border-surface-200 focus:ring-primary-200'
                    }`}
                  />
                  {errors.width && (
                    <p className="text-xs text-red-500 mt-1">{errors.width}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">
                    Height (px) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                      errors.height ? 'border-red-400 focus:ring-red-200' : 'border-surface-200 focus:ring-primary-200'
                    }`}
                  />
                  {errors.height && (
                    <p className="text-xs text-red-500 mt-1">{errors.height}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Min Supported Width (px)
                </label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={formData.minSupportedWidth}
                  onChange={(e) => setFormData({ ...formData, minSupportedWidth: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Create Surface
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
