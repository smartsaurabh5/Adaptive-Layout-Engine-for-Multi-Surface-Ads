import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Layers,
  Clock,
  Square,
  TrendingUp,
  LayoutGrid,
  List,
  ExternalLink,
  Trash2,
  Sparkles,
  X,
} from 'lucide-react';
import { layoutApi, type LayoutSummary } from '@/api';
import { DEFAULT_SURFACES, type LayoutSchema } from '@/engine/engine';
import AdRenderer from '@/components/renderer/AdRenderer';

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

const SURFACE_COLORS: Record<string, string> = {
  banner: 'surface-tag-banner',
  leaderboard: 'surface-tag-leaderboard',
  square: 'surface-tag-square',
  story: 'surface-tag-story',
  skyscraper: 'surface-tag-skyscraper',
};

const FILTER_TABS = ['All', 'Banner', 'Square', 'Story'];

function LayoutThumbnail({ layoutId, fallbackName }: { layoutId: string; fallbackName: string }) {
  const [schema, setSchema] = useState<LayoutSchema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    layoutApi.get(layoutId).then((data) => {
      if (active) {
        setSchema(data);
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [layoutId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-100">
        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!schema || schema.elements.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 text-center">
        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-2">
          <LayoutGrid size={18} className="text-white/80" />
        </div>
        <p className="text-xs font-semibold text-white/90 truncate max-w-[200px]">{fallbackName}</p>
        <span className="text-[10px] text-white/50 mt-0.5">Empty Canvas</span>
      </div>
    );
  }

  const previewSurface = DEFAULT_SURFACES[0]; // 300x250 banner
  const scale = 0.62;

  return (
    <div className="w-full h-full flex items-center justify-center bg-surface-950 overflow-hidden relative select-none pointer-events-none">
      <div
        className="rounded shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-105"
        style={{
          width: `${previewSurface.width * scale}px`,
          height: `${previewSurface.height * scale}px`,
        }}
      >
        <AdRenderer
          schema={schema}
          surface={previewSurface}
          selectedElementId={null}
          onSelectElement={() => {}}
          scale={scale}
          interactive={false}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [layouts, setLayouts] = useState<LayoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'created'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewLayoutModal, setShowNewLayoutModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [nameError, setNameError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadLayouts();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNewLayoutModal(false);
        setShowTemplatesModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function loadLayouts() {
    setLoading(true);
    try {
      const data = await layoutApi.list();
      setLayouts(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLayout() {
    const trimmed = newLayoutName.trim();
    if (!trimmed) {
      setNameError('Layout name cannot be empty');
      return;
    }
    setNameError('');
    const layout = await layoutApi.create(trimmed);
    setShowNewLayoutModal(false);
    setNewLayoutName('');
    navigate(`/editor/${layout.id}`);
  }

  async function handleDeleteLayout(id: string) {
    await layoutApi.delete(id);
    setLayouts((prev) => prev.filter((l) => l.id !== id));
  }

  const filteredLayouts = layouts
    .filter((l) => {
      const matchesFilter =
        filter === 'All' || l.surfaceTypes.includes(filter.toLowerCase());
      const matchesSearch =
        !searchQuery ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const totalLayouts = layouts.length;
  const mostUsedSurface = 'Square';
  const lastEdited = layouts[0];

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Campaign Workspace
            </span>
            <span className="w-1 h-1 rounded-full bg-surface-300"></span>
            <span className="badge-success text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500 inline-block"></span>
              Production Ready
            </span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Filter layouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 py-1.5 text-xs w-48 lg:w-60"
            />
          </div>
          <button
            onClick={() => {
              setNewLayoutName('');
              setNameError('');
              setShowNewLayoutModal(true);
            }}
            className="btn-primary text-xs py-1.5"
          >
            <Plus size={16} /> New Layout
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Total Layouts */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-surface-500">Total Layouts</span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <Layers size={16} className="text-primary-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-surface-900">{totalLayouts}</span>
            <span className="text-xs text-surface-400 font-medium">matrices</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-accent-600 font-medium">
            <TrendingUp size={12} />
            <span>+12% this month</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-surface-400 mt-4 pt-3 border-t border-surface-100">
            <span>Across 12 multi-surfaces</span>
            <span className="font-medium text-surface-600">99.4% sync rate</span>
          </div>
        </div>

        {/* Most Used Surface */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-surface-500">Most Used Surface</span>
            <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
              <Square size={16} className="text-surface-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-surface-900">{mostUsedSurface}</span>
            <span className="badge-success text-[10px]">64% of campaigns</span>
          </div>
          <p className="text-xs text-surface-400">1080×1080</p>
          <div className="text-[11px] text-surface-400 mt-4 pt-3 border-t border-surface-100 flex items-center justify-between">
            <span>Aspect Ratio 1:1</span>
            <div className="w-24 h-1.5 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full" style={{ width: '64%' }}></div>
            </div>
            <span className="font-medium text-surface-600">31 active</span>
          </div>
        </div>

        {/* Last Edited */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-surface-500">Last Edited</span>
            <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
              <Clock size={16} className="text-surface-600" />
            </div>
          </div>
          {lastEdited ? (
            <>
              <h3 className="text-base font-semibold text-surface-900 mb-1 truncate">
                {lastEdited.name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-[10px] text-white font-medium">
                  E
                </div>
                <span className="text-xs text-surface-500">
                  {formatTimeAgo(lastEdited.updatedAt)} by Elena
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-3 border-t border-surface-100">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 inline-block"></span>
                <span className="text-xs text-surface-500">Auto-synced</span>
                <button
                  onClick={() => navigate(`/editor/${lastEdited.id}`)}
                  className="text-xs text-primary-600 ml-auto cursor-pointer hover:text-primary-700 font-medium"
                >
                  Resume →
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-surface-400">No layouts yet</p>
          )}
        </div>
      </div>

      {/* Layout Grid Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-surface-900">Your Layouts</h2>
          <span className="badge-success text-xs">{filteredLayouts.length} Active</span>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center bg-surface-100 rounded-lg p-0.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === tab
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updated' | 'name' | 'created')}
            className="input py-1 px-2 w-36 text-xs"
          >
            <option value="updated">Sort by: Last Edited</option>
            <option value="name">Sort by: Name</option>
            <option value="created">Sort by: Created</option>
          </select>

          <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-surface-100 text-primary-600' : 'hover:bg-surface-50 text-surface-600'}`}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-surface-100 text-primary-600' : 'hover:bg-surface-50 text-surface-600'}`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Layout Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-72 animate-pulse">
              <div className="h-48 bg-surface-100 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-surface-100 rounded w-3/4" />
                <div className="h-3 bg-surface-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredLayouts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLayouts.map((layout) => (
              <div
                key={layout.id}
                className="glass-card group cursor-pointer hover:shadow-md hover:border-primary-300 transition-all duration-200 flex flex-col"
                onClick={() => navigate(`/editor/${layout.id}`)}
              >
                {/* Real Live Layout Thumbnail */}
                <div className="h-48 rounded-t-xl relative overflow-hidden bg-surface-900 border-b border-surface-200">
                  <LayoutThumbnail layoutId={layout.id} fallbackName={layout.name} />

                  {/* Variation badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="badge bg-accent-600 text-white text-[10px] shadow-sm font-semibold">
                      {layout.variationCount} Variations
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-surface-900 group-hover:text-primary-600 transition-colors truncate">
                      {layout.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayout(layout.id);
                        }}
                        title="Delete layout"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 hover:text-red-600 rounded text-surface-400"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/editor/${layout.id}`);
                        }}
                        title="Open in editor"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-100 rounded text-surface-400"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-surface-500 mb-3 line-clamp-2 flex-1">
                    {layout.description || 'Adaptive multi-channel layout creative.'}
                  </p>

                  {/* Surface tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {layout.surfaceTypes.map((type) => (
                      <span
                        key={type}
                        className={SURFACE_COLORS[type] || 'surface-tag bg-surface-100 text-surface-600'}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-surface-400 pt-2 border-t border-surface-100">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 inline-block"></span>
                      Edited {formatTimeAgo(layout.updatedAt)}
                    </span>
                    <span className="font-mono">v{layout.version}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Layout</th>
                  <th className="px-4 py-3">Surfaces</th>
                  <th className="px-4 py-3">Variations</th>
                  <th className="px-4 py-3">Last Edited</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 text-sm">
                {filteredLayouts.map((layout) => (
                  <tr
                    key={layout.id}
                    onClick={() => navigate(`/editor/${layout.id}`)}
                    className="hover:bg-surface-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-surface-900">{layout.name}</div>
                      <div className="text-xs text-surface-400 truncate max-w-xs">{layout.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {layout.surfaceTypes.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 text-surface-600">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-600">
                      {layout.variationCount} targets
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-500">
                      {formatTimeAgo(layout.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-surface-500">
                      v{layout.version}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDeleteLayout(layout.id)}
                          className="p-1 hover:bg-red-50 text-surface-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/editor/${layout.id}`)}
                          className="p-1 hover:bg-surface-100 text-surface-400 hover:text-primary-600 rounded"
                          title="Open Editor"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="glass-card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <LayoutGrid size={24} className="text-surface-400" />
          </div>
          <h3 className="text-base font-semibold text-surface-900 mb-2">No layouts found</h3>
          <p className="text-sm text-surface-500 max-w-sm mx-auto mb-6">
            Create your first adaptive layout to automatically render multi-channel creative dimensions in seconds.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setNewLayoutName('');
                setNameError('');
                setShowNewLayoutModal(true);
              }}
              className="btn-primary"
            >
              <Plus size={16} /> New Layout
            </button>
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="btn-secondary"
            >
              <Sparkles size={16} /> Browse Templates
            </button>
          </div>
        </div>
      )}

      {/* New Layout Modal */}
      {showNewLayoutModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewLayoutModal(false)}
        >
          <div
            className="glass-card p-6 w-full max-w-md animate-slide-up relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900">Create New Layout</h2>
              <button
                onClick={() => setShowNewLayoutModal(false)}
                className="p-1 text-surface-400 hover:text-surface-600 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <label className="block text-xs font-medium text-surface-700 mb-1.5">
              Layout Title
            </label>
            <input
              type="text"
              value={newLayoutName}
              onChange={(e) => {
                setNewLayoutName(e.target.value);
                if (nameError) setNameError('');
              }}
              className={`input mb-2 ${nameError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
              placeholder="e.g. Black Friday Super Sale"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateLayout()}
            />
            {nameError && (
              <p className="text-xs text-red-600 mb-4">{nameError}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowNewLayoutModal(false)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button onClick={handleCreateLayout} className="btn-primary text-sm">
                Create Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setShowTemplatesModal(false)}
        >
          <div
            className="glass-card p-6 w-full max-w-lg animate-slide-up relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900">Browse Adaptive Templates</h2>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="p-1 text-surface-400 hover:text-surface-600 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-surface-500 mb-4">
              Select a pre-configured multi-surface layout template to start editing immediately.
            </p>
            <div className="space-y-3">
              {[
                { name: 'E-Commerce Flash Sale', desc: 'Bold CTA pill, price callout, and product hero' },
                { name: 'App Install & Lead Gen', desc: 'Store badges, rating stars, and headline reflow' },
                { name: 'Brand Story & Awareness', desc: 'Minimalist brand mark, typography grid, and full-bleed image' },
              ].map((template) => (
                <div
                  key={template.name}
                  onClick={async () => {
                    const l = await layoutApi.create(template.name);
                    setShowTemplatesModal(false);
                    navigate(`/editor/${l.id}`);
                  }}
                  className="p-3.5 border border-surface-200 rounded-xl hover:border-primary-400 hover:bg-primary-50/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-surface-900 group-hover:text-primary-600">
                      {template.name}
                    </h4>
                    <p className="text-xs text-surface-500">{template.desc}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary-600">Use Template →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
