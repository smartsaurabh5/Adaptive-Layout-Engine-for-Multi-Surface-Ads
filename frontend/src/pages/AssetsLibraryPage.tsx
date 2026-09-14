import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Trash2, Cloud, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { assetApi, type Asset } from '@/api';

const FILTER_TABS = ['All', 'Logos', 'Products', 'Backgrounds'];

const TAG_COLORS: Record<string, string> = {
  'Primary Brand': 'bg-primary-100 text-primary-700',
  'Vector Ready': 'bg-accent-100 text-accent-700',
  'Cutout': 'bg-blue-100 text-blue-700',
  'Transparent': 'bg-purple-100 text-purple-700',
  'Campaigns': 'bg-pink-100 text-pink-700',
  'Full Bleed': 'bg-amber-100 text-amber-700',
  'E-Commerce': 'bg-orange-100 text-orange-700',
  '3D Render': 'bg-cyan-100 text-cyan-700',
  'Texture': 'bg-rose-100 text-rose-700',
  'Hero Fill': 'bg-indigo-100 text-indigo-700',
  'Corporate': 'bg-slate-100 text-slate-700',
  'High Priority': 'bg-red-100 text-red-700',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// Built-in vector graphics for demo assets and fallbacks so cards are never blank
function FallbackGraphic({ asset }: { asset: Asset }) {
  const fileNameLower = (asset.fileName || '').toLowerCase();

  // 1. AdaptFlow Vector Logo (asset-1 or SVG or name match)
  if (asset.id === 'asset-1' || fileNameLower.includes('adaptflow') || fileNameLower.includes('mark') || asset.fileType === 'SVG') {
    return (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 select-none">
        <div className="absolute inset-0 bg-radial from-indigo-500/20 via-transparent to-transparent opacity-70" />
        <svg width="68" height="68" viewBox="0 0 48 48" fill="none" className="drop-shadow-lg">
          <rect width="48" height="48" rx="12" fill="#4f46e5" />
          <path d="M24 10L36 20V36H12V20L24 10Z" fill="white" fillOpacity="0.95" />
          <path d="M18 24H30M24 18V30" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="mt-2 text-[10px] font-bold text-indigo-300 tracking-wider uppercase">AdaptFlow Vector</span>
      </div>
    );
  }

  // 2. Acoustic-Pro Headphones Cutout (asset-2 or audio/headphone match)
  if (asset.id === 'asset-2' || fileNameLower.includes('headphone') || fileNameLower.includes('acoustic') || fileNameLower.includes('audio')) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 select-none">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-600/25 blur-xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-blue-600/20 blur-xl" />
        <svg width="76" height="76" viewBox="0 0 64 64" fill="none" className="drop-shadow-xl relative z-10">
          <path d="M12 34V28C12 16.9543 20.9543 8 32 8C43.0457 8 52 16.9543 52 28V34" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
          <rect x="8" y="32" width="12" height="20" rx="6" fill="#818cf8" />
          <rect x="44" y="32" width="12" height="20" rx="6" fill="#818cf8" />
          <circle cx="32" cy="28" r="4" fill="#a5b4fc" />
          <path d="M22 46C22 49 26 52 32 52C38 52 42 49 42 46" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="mt-2 text-[10px] font-bold text-indigo-300 tracking-wider uppercase relative z-10">Hi-Fi Audio Cutout</span>
      </div>
    );
  }

  // 3. Summer Warm Glow Backdrop (asset-3 or glow/backdrop/warm match)
  if (asset.id === 'asset-3' || fileNameLower.includes('glow') || fileNameLower.includes('warm') || fileNameLower.includes('backdrop')) {
    return (
      <div className="w-full h-full bg-gradient-to-tr from-amber-600 via-rose-500 to-indigo-600 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300 select-none">
        <div className="w-28 h-28 rounded-full bg-yellow-300/40 blur-xl animate-pulse" />
        <div className="relative z-10 text-center">
          <span className="text-xs font-bold text-white tracking-wide bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-md">
            Warm Glow HD · 4K
          </span>
        </div>
      </div>
    );
  }

  // 4. Watch Ultra Titanium (asset-4 or watch/titanium match)
  if (asset.id === 'asset-4' || fileNameLower.includes('watch') || fileNameLower.includes('titanium')) {
    return (
      <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 select-none">
        <div className="absolute inset-0 bg-radial from-orange-500/15 via-transparent to-transparent opacity-60" />
        <svg width="72" height="72" viewBox="0 0 64 64" fill="none" className="drop-shadow-md">
          <rect x="22" y="4" width="20" height="10" rx="2" fill="#71717a" />
          <rect x="22" y="50" width="20" height="10" rx="2" fill="#71717a" />
          <rect x="14" y="14" width="36" height="36" rx="10" fill="#27272a" stroke="#fb923c" strokeWidth="2.5" />
          <circle cx="32" cy="32" r="12" fill="#09090b" />
          <path d="M32 24V32L37 35" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="mt-2 text-[10px] font-bold text-orange-400 tracking-wider uppercase">Titanium Edition</span>
      </div>
    );
  }

  // 5. Brand Accent Gradient (asset-5 or gradient/mesh/accent match)
  if (asset.id === 'asset-5' || fileNameLower.includes('gradient') || fileNameLower.includes('accent') || fileNameLower.includes('mesh')) {
    return (
      <div className="w-full h-full bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-500 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300 select-none">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-3xs" />
        <span className="relative z-10 text-xs font-bold text-white tracking-wide bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-md">
          Dynamic Mesh · 120Hz
        </span>
      </div>
    );
  }

  // Generic fallback for uploaded images with failed preview
  return (
    <div className="w-full h-full bg-surface-100 flex flex-col items-center justify-center p-4 select-none">
      <ImageIcon size={36} className="text-surface-400 mb-1" />
      <span className="text-[10px] text-surface-500 font-medium">{asset.fileType} Asset</span>
    </div>
  );
}

function AssetPreviewGraphic({ asset }: { asset: Asset }) {
  const [imgFailed, setImgFailed] = useState(false);

  // If blob URL or valid uploaded file URL, attempt image render
  if (asset.url && asset.url.length > 5 && !imgFailed) {
    return (
      <img
        src={asset.url}
        alt={asset.fileName}
        className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
        onError={() => setImgFailed(true)}
      />
    );
  }

  // Fallback to high-fidelity SVG/vector artwork
  return <FallbackGraphic asset={asset} />;
}

export default function AssetsLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    setLoading(true);
    try {
      const data = await assetApi.list();
      setAssets(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileProcess(file: File) {
    try {
      const newAsset = await assetApi.upload(file);
      setAssets((prev) => [newAsset, ...prev]);
      setUploadSuccess(`Uploaded ${file.name} successfully!`);
      setTimeout(() => setUploadSuccess(''), 3500);
    } catch (err) {
      console.error('Failed to upload file', err);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
      e.target.value = '';
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  }

  function handleDeleteAsset(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  const filteredAssets = assets.filter((a) => {
    // Search match
    const matchesSearch = !searchQuery || a.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter match
    if (!matchesSearch) return false;
    if (filter === 'All') return true;

    if (filter === 'Logos') {
      return a.fileType === 'SVG' || a.tags.some((t) => /brand|logo|vector/i.test(t)) || /logo|mark/i.test(a.fileName);
    }
    if (filter === 'Products') {
      return a.tags.some((t) => /cutout|product|render|e-commerce|transparent/i.test(t)) || /headphone|watch|product/i.test(a.fileName);
    }
    if (filter === 'Backgrounds') {
      return a.tags.some((t) => /backdrop|gradient|texture|full bleed/i.test(t)) || /backdrop|gradient|glow/i.test(a.fileName);
    }

    return true;
  });

  const typeBadgeColor: Record<string, string> = {
    SVG: 'bg-emerald-100 text-emerald-700',
    PNG: 'bg-blue-100 text-blue-700',
    JPG: 'bg-amber-100 text-amber-700',
    WEBP: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="animate-slide-up">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-surface-900">Assets Library</h1>
            <span className="badge-success text-xs">
              <Cloud size={12} /> Cloud Synced
            </span>
          </div>
          <p className="text-sm text-surface-500 max-w-md">
            Upload, categorize, and organize brand logos, product cutouts, and backgrounds for all adaptive surfaces.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 py-1.5 text-xs w-48 lg:w-60"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary text-xs py-1.5"
          >
            <Upload size={16} /> Upload Asset
          </button>
        </div>
      </div>

      {uploadSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle size={16} />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
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
        <span className="text-xs text-surface-400 ml-2">
          {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Drop Zone */}
      <div
        className={`mb-6 border-2 border-dashed rounded-xl py-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-surface-300 bg-surface-50 hover:border-surface-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center">
            <Upload size={18} className="text-surface-500" />
          </div>
          <p className="text-sm text-surface-600">
            Drag & drop images here, or{' '}
            <span className="text-primary-600 underline font-medium">click to browse</span>
          </p>
          <p className="text-xs text-surface-400">
            PNG, JPG, SVG, WebP up to 25MB · High-resolution adaptive scaling
          </p>
        </div>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card h-56 animate-pulse">
              <div className="h-36 bg-surface-100 rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-100 rounded w-3/4" />
                <div className="h-2 bg-surface-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="glass-card group hover:shadow-md hover:border-primary-300 transition-all duration-200 flex flex-col"
            >
              {/* Preview header */}
              <div className="h-36 rounded-t-xl bg-surface-100 relative flex items-center justify-center overflow-hidden border-b border-surface-200">
                {/* File type badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs ${
                      typeBadgeColor[asset.fileType] || 'bg-surface-200 text-surface-600'
                    }`}
                  >
                    {asset.fileType}
                  </span>
                </div>

                {/* Real Graphic Preview */}
                <AssetPreviewGraphic asset={asset} />
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-semibold text-surface-900 truncate" title={asset.fileName}>
                        {asset.fileName}
                      </p>
                      <p className="text-xs text-surface-400">
                        {formatSize(asset.sizeBytes)} · Used in {asset.usedInLayouts} layout{asset.usedInLayouts !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      title="Delete asset"
                      className="p-1 hover:bg-red-50 text-surface-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          TAG_COLORS[tag] || 'bg-surface-100 text-surface-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <ImageIcon size={32} className="text-surface-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-surface-900 mb-1">No assets found</h3>
          <p className="text-xs text-surface-500 mb-4">
            Try adjusting your search query or upload a new asset above.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary text-xs"
          >
            Upload Now
          </button>
        </div>
      )}
    </div>
  );
}
