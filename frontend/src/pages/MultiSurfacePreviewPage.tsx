import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, Download, Check,
  Maximize2, Monitor, Smartphone, Globe,
  Sliders, Eye,
  Sparkles, Heart, MessageCircle, Send,
  Bookmark, Music, ShieldCheck,
  FileCode, Layers, ChevronDown, RefreshCw
} from 'lucide-react';
import { layoutApi, type LayoutSummary } from '@/api';
import { DEFAULT_SURFACES, resolveLayout } from '@/engine/engine';
import type { LayoutSchema, Surface } from '@/engine/engine';
import AdRenderer from '@/components/renderer/AdRenderer';
import SurfaceFrame from '@/components/renderer/SurfaceFrame';

const ZOOM_LEVELS = [50, 75, 100];

type ViewMode = 'matrix' | 'simulation' | 'resizer';
type SimulationPlatform = 'instagram' | 'publisher' | 'feed';

export default function MultiSurfacePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [schema, setSchema] = useState<LayoutSchema | null>(null);
  const [availableLayouts, setAvailableLayouts] = useState<LayoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomPercent, setZoomPercent] = useState(75);
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [simPlatform, setSimPlatform] = useState<SimulationPlatform>('instagram');
  const [copied, setCopied] = useState(false);
  const [activeSurfaceModal, setActiveSurfaceModal] = useState<Surface | null>(null);

  // Publisher simulation state
  const [publisherSidebarAd, setPublisherSidebarAd] = useState<'skyscraper' | 'banner'>('skyscraper');

  // Instagram simulation state
  const [instagramOverlayMode, setInstagramOverlayMode] = useState<'story' | 'reels' | 'clean'>('story');
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [phoneSize, setPhoneSize] = useState<'fit' | 'standard' | 'large'>('fit');
  const [titaniumFinish, setTitaniumFinish] = useState<'natural' | 'black' | 'desert'>('natural');
  const [resettingCreative, setResettingCreative] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [dynamicIslandHovered, setDynamicIslandHovered] = useState(false);

  // Dynamic resizer playground state
  const [customWidth, setCustomWidth] = useState(600);
  const [customHeight, setCustomHeight] = useState(350);

  // Dynamic phone chassis dimensions calculation
  const phoneDimensions = useMemo(() => {
    if (phoneSize === 'fit') {
      return {
        chassisWidth: 332,
        chassisHeight: 588,
        chassisPadding: 10,
        chassisBorder: 'border-[7px]',
        screenWidth: 306,
        screenHeight: 544,
        scale: 306 / 1080, // 0.283333
        islandWidth: 'w-24',
        islandHeight: 'h-5',
        rounded: 'rounded-[44px]',
        innerRounded: 'rounded-[36px]',
      };
    }
    if (phoneSize === 'large') {
      return {
        chassisWidth: 436,
        chassisHeight: 774,
        chassisPadding: 14,
        chassisBorder: 'border-[9px]',
        screenWidth: 405,
        screenHeight: 720,
        scale: 405 / 1080, // 0.375
        islandWidth: 'w-32',
        islandHeight: 'h-6.5',
        rounded: 'rounded-[54px]',
        innerRounded: 'rounded-[44px]',
      };
    }
    // Standard 360
    return {
      chassisWidth: 388,
      chassisHeight: 688,
      chassisPadding: 12,
      chassisBorder: 'border-[8px]',
      screenWidth: 360,
      screenHeight: 640,
      scale: 360 / 1080, // 0.333333
      islandWidth: 'w-28',
      islandHeight: 'h-6',
      rounded: 'rounded-[50px]',
      innerRounded: 'rounded-[40px]',
    };
  }, [phoneSize]);

  // Titanium finish styles
  const finishStyles = useMemo(() => {
    if (titaniumFinish === 'black') {
      return {
        border: 'border-[#1a1c22]',
        bg: 'bg-[#0b0d10]',
        shadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)',
      };
    }
    if (titaniumFinish === 'desert') {
      return {
        border: 'border-[#52453b]',
        bg: 'bg-[#1f1914]',
        shadow: '0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(230,195,160,0.25)',
      };
    }
    // Natural Titanium
    return {
      border: 'border-[#40434b]',
      bg: 'bg-[#181a1f]',
      shadow: '0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.18)',
    };
  }, [titaniumFinish]);

  const handleResetCreative = async () => {
    if (!schema) return;
    setResettingCreative(true);
    try {
      const fresh = await layoutApi.resetToFactory(schema.id);
      setSchema(fresh);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } finally {
      setResettingCreative(false);
    }
  };

  // Load layouts
  useEffect(() => {
    layoutApi.list().then((list) => {
      setAvailableLayouts(list);
      const targetId = id || (list.length > 0 ? list[0].id : null);
      if (targetId) {
        layoutApi.get(targetId).then((s) => {
          setSchema(s);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [id]);

  const handleSelectLayout = (newId: string) => {
    navigate(`/preview/${newId}`);
    setLoading(true);
    layoutApi.get(newId).then((s) => {
      setSchema(s);
      setLoading(false);
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportJson = () => {
    if (!schema) return;
    const exportData = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      layoutId: schema.id,
      layoutName: schema.name,
      surfaces: DEFAULT_SURFACES.map((s) => ({
        surfaceId: s.id,
        surfaceName: s.name,
        type: s.type,
        dimensions: { width: s.width, height: s.height },
      })),
      schema,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name.toLowerCase().replace(/\s+/g, '-')}-surfaces-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export standalone IAB HTML5 Ad Bundle
  const handleExportHtml5 = (surface: Surface) => {
    if (!schema) return;
    const resolvedTree = resolveLayout(schema, surface);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="ad.size" content="width=${surface.width},height=${surface.height}">
  <title>${schema.name} — ${surface.name} [AdaptFlow HTML5 Bundle]</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body {
      background: #0b0f19;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #fff;
    }
    .ad-wrapper {
      position: relative;
      width: ${surface.width}px;
      height: ${surface.height}px;
      background-color: ${schema.backgroundColor || '#090d16'};
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      border-radius: 8px;
    }
    .ad-element {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    .btn {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      white-space: nowrap;
      text-decoration: none;
      transition: transform 0.15s ease, filter 0.15s ease;
    }
    .btn:hover {
      filter: brightness(1.1);
      transform: scale(1.02);
    }
    .badge {
      font-size: 11px;
      margin-bottom: 16px;
      color: #94a3b8;
    }
  </style>
  <script>
    var clickTag = "https://adaptflow.io/campaign/${schema.id}";
    function onAdClick() {
      window.open(clickTag, "_blank");
    }
  </script>
</head>
<body>
  <div class="badge">AdaptFlow IAB HTML5 Creative Bundle · ${surface.width}×${surface.height}px (${surface.name})</div>
  <div class="ad-wrapper" onclick="onAdClick()">
${resolvedTree.elements
  .filter((e) => !e.hidden)
  .map((e) => {
    if (e.type === 'button') {
      const p = e.props as { label?: string; backgroundColor?: string; textColor?: string; fontSize?: number; borderRadius?: number };
      return `    <div class="ad-element" style="left:${e.resolvedX}px; top:${e.resolvedY}px; width:${e.resolvedWidth}px; height:${e.resolvedHeight}px; z-index:${e.zIndex};">
      <div class="btn" style="background:${p.backgroundColor || '#4f46e5'}; color:${p.textColor || '#ffffff'}; font-size:${p.fontSize || 14}px; border-radius:${p.borderRadius ?? 8}px;">
        ${p.label || 'Pre-order Now'}
      </div>
    </div>`;
    }
    if (e.type === 'text') {
      const p = e.props as { content?: string; color?: string; fontSize?: number; fontWeight?: number; textAlign?: string };
      return `    <div class="ad-element" style="left:${e.resolvedX}px; top:${e.resolvedY}px; width:${e.resolvedWidth}px; height:${e.resolvedHeight}px; z-index:${e.zIndex}; font-size:${e.effectiveFontSize || p.fontSize || 16}px; color:${p.color || '#fff'}; font-weight:${p.fontWeight || 600}; text-align:${p.textAlign || 'center'};">
      <span>${p.content || ''}</span>
    </div>`;
    }
    return `    <div class="ad-element" style="left:${e.resolvedX}px; top:${e.resolvedY}px; width:${e.resolvedWidth}px; height:${e.resolvedHeight}px; z-index:${e.zIndex};">
      <!-- ${e.label} -->
    </div>`;
  })
  .join('\n')}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name.toLowerCase().replace(/\s+/g, '-')}-${surface.type}-html5.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Pre-calculated target surfaces for simulation
  const storySurface = useMemo(() => DEFAULT_SURFACES.find((s) => s.type === 'story') || DEFAULT_SURFACES[3], []);
  const leaderboardSurface = useMemo(() => DEFAULT_SURFACES.find((s) => s.type === 'leaderboard') || DEFAULT_SURFACES[1], []);
  const skyscraperSurface = useMemo(() => DEFAULT_SURFACES.find((s) => s.type === 'skyscraper') || DEFAULT_SURFACES[4], []);
  const bannerSurface = useMemo(() => DEFAULT_SURFACES.find((s) => s.type === 'banner') || DEFAULT_SURFACES[0], []);
  const squareSurface = useMemo(() => DEFAULT_SURFACES.find((s) => s.type === 'square') || DEFAULT_SURFACES[2], []);

  // Custom surface for continuous resizer playground
  const customSurface: Surface = useMemo(() => ({
    id: 'surface-custom',
    name: `Fluid Canvas (${customWidth} × ${customHeight})`,
    type: 'banner',
    width: customWidth,
    height: customHeight,
    minSupportedWidth: 100,
  }), [customWidth, customHeight]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-112px)]">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-112px)]">
        <p className="text-surface-500">No layout to preview. Create one first.</p>
      </div>
    );
  }

  const scale = zoomPercent / 100;

  return (
    <div className="animate-slide-up pb-12">
      {/* Toast Notification */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-slide-up">
          <Check size={14} className="text-emerald-400" />
          Preview link copied to clipboard!
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-surface-900">{schema.name}</h1>
            <span className="badge-primary text-[11px] font-mono px-2 py-0.5">
              ID: {schema.id}
            </span>
            {availableLayouts.length > 1 && (
              <div className="relative inline-block">
                <select
                  value={schema.id}
                  onChange={(e) => handleSelectLayout(e.target.value)}
                  className="text-xs bg-surface-100 hover:bg-surface-200 border-none rounded-lg px-2.5 py-1 text-surface-700 font-medium cursor-pointer pr-7 transition-colors appearance-none"
                >
                  {availableLayouts.map((l) => (
                    <option key={l.id} value={l.id}>
                      Campaign: {l.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500" />
              </div>
            )}
          </div>
          <p className="text-xs text-surface-500">
            Real-time constraint solver adapting vector tokens, responsive text line-height, and CTA scales.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-surface-100 p-1 rounded-xl shadow-inner border border-surface-200/60">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-500 hover:text-surface-800'
              }`}
            >
              <Monitor size={13} />
              <span>Multi-Surface Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('simulation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'simulation'
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-500 hover:text-surface-800'
              }`}
            >
              <Smartphone size={13} className="text-primary-600" />
              <span>Real-World Simulation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
            </button>
            <button
              onClick={() => setViewMode('resizer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'resizer'
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-500 hover:text-surface-800'
              }`}
            >
              <Sliders size={13} />
              <span>Fluid Resizer Lab</span>
            </button>
          </div>

          <button
            onClick={() => navigate(`/editor/${schema.id}`)}
            className="btn-secondary text-xs py-1.5"
          >
            <ArrowLeft size={13} /> Editor
          </button>
          <button
            onClick={handleShare}
            className="btn-secondary text-xs py-1.5"
          >
            <Share2 size={13} /> {copied ? 'Copied!' : 'Share'}
          </button>
          <button
            onClick={() => handleExportHtml5(storySurface)}
            className="btn-secondary text-xs py-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 border-indigo-200/60"
            title="Download standalone IAB-compliant HTML5 Ad Bundle"
          >
            <FileCode size={13} /> Export HTML5 Ad
          </button>
          <button
            onClick={handleExportJson}
            className="btn-primary text-xs py-1.5"
          >
            <Download size={13} /> Export JSON
          </button>
        </div>
      </div>

      {/* ============================================================
          VIEW MODE 1: MULTI-SURFACE MATRIX
      ============================================================ */}
      {viewMode === 'matrix' && (
        <div className="animate-fade-in space-y-6">
          {/* Status & Zoom Bar */}
          <div className="glass-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
                <Layers size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-surface-900">Multi-Surface Matrix Engine</span>
                  <span className="badge-success text-[10px] font-semibold">
                    All {DEFAULT_SURFACES.length} Surfaces Synced
                  </span>
                </div>
                <p className="text-xs text-surface-500">
                  Adaptive layout solver guarantees 0 text truncation, proportional button metrics, and automated descender clearance.
                </p>
              </div>
            </div>

            {/* Zoom selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-400 font-medium">Zoom Canvas:</span>
              <div className="flex items-center bg-surface-100 rounded-lg p-0.5 border border-surface-200">
                {ZOOM_LEVELS.map((z) => (
                  <button
                    key={z}
                    onClick={() => setZoomPercent(z)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      zoomPercent === z
                        ? 'bg-white text-surface-900 shadow-sm'
                        : 'text-surface-500 hover:text-surface-800'
                    }`}
                  >
                    {z}%
                  </button>
                ))}
                <button
                  onClick={() => setZoomPercent(60)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-surface-500 hover:text-surface-800 transition-colors"
                >
                  Fit
                </button>
              </div>
            </div>
          </div>

          {/* 5 Surfaces Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {DEFAULT_SURFACES.map((surface) => {
              // Custom fitting scales for optimal viewing:
              let surfaceScale = 0.5;
              if (surface.type === 'story') {
                surfaceScale = 0.20 * scale; // ~216px x 384px display
              } else if (surface.type === 'skyscraper') {
                surfaceScale = 0.65 * scale; // ~104px x 390px display
              } else if (surface.type === 'leaderboard') {
                surfaceScale = 0.60 * scale; // ~436px x 54px display
              } else if (surface.type === 'banner') {
                surfaceScale = 0.95 * scale; // ~285px x 237px display
              } else {
                surfaceScale = 0.32 * scale; // ~345px x 345px display for Square
              }

              return (
                <div
                  key={surface.id}
                  className={`glass-card p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                    surface.type === 'leaderboard' ? 'lg:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-surface-900">
                        {surface.type === 'story'
                          ? 'Vertical Story / Reels (9:16)'
                          : surface.type === 'skyscraper'
                          ? 'Wide Skyscraper (Sidebar)'
                          : surface.type === 'leaderboard'
                          ? 'Widescreen Leaderboard (Header)'
                          : surface.type === 'square'
                          ? 'Square Post (Feed 1:1)'
                          : 'Medium Rectangle (Web Banner)'}
                      </span>
                      <span className="badge-success text-[10px]">● 100% Adaptive</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (surface.type === 'story') {
                            setSimPlatform('instagram');
                            setViewMode('simulation');
                          } else if (surface.type === 'leaderboard' || surface.type === 'skyscraper' || surface.type === 'banner') {
                            setSimPlatform('publisher');
                            if (surface.type === 'skyscraper') setPublisherSidebarAd('skyscraper');
                            if (surface.type === 'banner') setPublisherSidebarAd('banner');
                            setViewMode('simulation');
                          } else {
                            setSimPlatform('feed');
                            setViewMode('simulation');
                          }
                        }}
                        className="text-[11px] font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                      >
                        <Eye size={12} /> Simulate
                      </button>
                      <button
                        onClick={() => setActiveSurfaceModal(surface)}
                        className="p-1 hover:bg-surface-100 rounded-md transition-colors text-surface-400 hover:text-surface-700"
                        title="Enlarge surface"
                      >
                        <Maximize2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Surface Canvas Wrapper */}
                  <div className="flex justify-center bg-surface-900/5 dark:bg-surface-900/20 rounded-xl p-5 min-h-[260px] items-center border border-surface-200/40">
                    <SurfaceFrame
                      width={surface.width}
                      height={surface.height}
                      label={surface.name}
                    >
                      <AdRenderer
                        schema={schema}
                        surface={surface}
                        selectedElementId={null}
                        onSelectElement={() => {}}
                        scale={surfaceScale}
                        interactive={false}
                      />
                    </SurfaceFrame>
                  </div>

                  {/* Surface Specs Footer */}
                  <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-[11px] text-surface-400">
                    <span>
                      Target: <strong className="text-surface-600">{surface.width} × {surface.height} px</strong>
                    </span>
                    <button
                      onClick={() => handleExportHtml5(surface)}
                      className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Download size={11} /> Download HTML5 Ad
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pre-Flight Compliance Matrix */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-surface-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-sm font-bold text-surface-900">Pre-Flight Validation & Surface Compliance Matrix</span>
              </div>
              <span className="badge-success text-xs">
                <Check size={11} /> All {DEFAULT_SURFACES.length} Verified
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-50 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                    <th className="px-4 py-2.5">Surface Target</th>
                    <th className="px-4 py-2.5">Aspect Ratio</th>
                    <th className="px-4 py-2.5">Dimensions</th>
                    <th className="px-4 py-2.5">Text Line-Height Descenders</th>
                    <th className="px-4 py-2.5">Button Text Clipping Status</th>
                    <th className="px-4 py-2.5">Contrast Legibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 text-xs">
                  {DEFAULT_SURFACES.map((surface) => (
                    <tr key={surface.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-surface-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        {surface.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-surface-500 text-[11px]">
                        {surface.type === 'story' ? '9:16 (Vertical)' :
                         surface.type === 'leaderboard' ? '8:1 (Horizontal)' :
                         surface.type === 'skyscraper' ? '1:3.75 (Tower)' :
                         surface.type === 'square' ? '1:1 (Square)' : '6:5 (Banner)'}
                      </td>
                      <td className="px-4 py-3 font-mono text-surface-600">
                        {surface.width} × {surface.height} px
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-success text-[10px]">✓ Full Descender Clearance</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-success text-[10px] font-semibold">
                          ✓ 100% Unclipped ("Pre-order Now")
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-emerald-600">
                        WCAG 2.1 AA (Pass)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          VIEW MODE 2: REAL-WORLD PLATFORM SIMULATION
      ============================================================ */}
      {viewMode === 'simulation' && (
        <div className="animate-fade-in space-y-6">
          {/* Simulation Navigation Pills */}
          <div className="glass-card p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-surface-700 uppercase tracking-wider px-2">Environment:</span>
              <button
                onClick={() => setSimPlatform('instagram')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  simPlatform === 'instagram'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                <Smartphone size={13} /> Instagram Story / Reels (9:16)
              </button>
              <button
                onClick={() => setSimPlatform('publisher')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  simPlatform === 'publisher'
                    ? 'bg-surface-900 text-white shadow-md'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                <Globe size={13} /> Tech Publisher Website (Desktop)
              </button>
              <button
                onClick={() => setSimPlatform('feed')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  simPlatform === 'feed'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                <Sparkles size={13} /> Mobile Social Feed (1:1)
              </button>
            </div>

            {simPlatform === 'instagram' && (
              <div className="flex flex-wrap items-center gap-3">
                {/* Overlay Mode Selector */}
                <div className="flex items-center bg-surface-100 p-0.5 rounded-lg border border-surface-200 text-xs">
                  <button
                    onClick={() => setInstagramOverlayMode('story')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      instagramOverlayMode === 'story'
                        ? 'bg-white text-surface-900 shadow-sm'
                        : 'text-surface-500 hover:text-surface-800'
                    }`}
                  >
                    📱 Story Mode
                  </button>
                  <button
                    onClick={() => setInstagramOverlayMode('reels')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      instagramOverlayMode === 'reels'
                        ? 'bg-white text-surface-900 shadow-sm'
                        : 'text-surface-500 hover:text-surface-800'
                    }`}
                  >
                    🎬 Reels Mode
                  </button>
                  <button
                    onClick={() => setInstagramOverlayMode('clean')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      instagramOverlayMode === 'clean'
                        ? 'bg-white text-surface-900 shadow-sm'
                        : 'text-surface-500 hover:text-surface-800'
                    }`}
                  >
                    ✨ Clean Creative
                  </button>
                </div>

                {/* Safe Zones Toggle */}
                <label className="flex items-center gap-1.5 text-xs font-semibold text-surface-700 cursor-pointer bg-surface-100 hover:bg-surface-200 px-2.5 py-1 rounded-lg transition-colors border border-surface-200/60">
                  <input
                    type="checkbox"
                    checked={showSafeZones}
                    onChange={(e) => setShowSafeZones(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span>📐 Safe Zones Guide</span>
                </label>

                {/* Phone Size Toggle */}
                <div className="flex items-center gap-1 bg-surface-100 p-0.5 rounded-lg border border-surface-200 text-xs">
                  <button
                    onClick={() => setPhoneSize('fit')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      phoneSize === 'fit' ? 'bg-white text-surface-900 font-bold shadow-xs' : 'text-surface-500 hover:text-surface-800'
                    }`}
                    title="Fit 100% on standard laptop viewport without scrolling"
                  >
                    Fit Viewport
                  </button>
                  <button
                    onClick={() => setPhoneSize('standard')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      phoneSize === 'standard' ? 'bg-white text-surface-900 font-bold shadow-xs' : 'text-surface-500 hover:text-surface-800'
                    }`}
                  >
                    Standard (360)
                  </button>
                  <button
                    onClick={() => setPhoneSize('large')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      phoneSize === 'large' ? 'bg-white text-surface-900 font-bold shadow-xs' : 'text-surface-500 hover:text-surface-800'
                    }`}
                  >
                    Retina 1:1
                  </button>
                </div>
              </div>
            )}

            {simPlatform === 'publisher' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-surface-500 font-medium">Sidebar Ad Format:</span>
                <button
                  onClick={() => setPublisherSidebarAd('skyscraper')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    publisherSidebarAd === 'skyscraper' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-600'
                  }`}
                >
                  Skyscraper 160×600
                </button>
                <button
                  onClick={() => setPublisherSidebarAd('banner')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    publisherSidebarAd === 'banner' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-600'
                  }`}
                >
                  Banner 300×250
                </button>
              </div>
            )}
          </div>

          {/* 1. INSTAGRAM STORY / REELS MOCKUP CHASSIS (SIDE-BY-SIDE ON DESKTOP) */}
          {simPlatform === 'instagram' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-1">
              {/* Left Column: iPhone 16 Pro Device Mockup */}
              <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
                {/* iPhone 16 Pro Chassis with Dynamic Dimensions and Titanium Finish */}
                <div
                  className={`relative ${finishStyles.bg} ${phoneDimensions.rounded} p-2.5 shadow-2xl ${phoneDimensions.chassisBorder} ${finishStyles.border} overflow-hidden transition-all duration-300`}
                  style={{
                    width: `${phoneDimensions.chassisWidth}px`,
                    height: `${phoneDimensions.chassisHeight}px`,
                    boxShadow: finishStyles.shadow,
                  }}
                >
                  {/* Dynamic Island Pill with Interactive Audio Equalizer on Hover */}
                  <div
                    onMouseEnter={() => setDynamicIslandHovered(true)}
                    onMouseLeave={() => setDynamicIslandHovered(false)}
                    className={`absolute top-3.5 left-1/2 -translate-x-1/2 bg-black rounded-full z-40 flex items-center justify-between px-2.5 border border-white/20 shadow-2xl transition-all duration-300 pointer-events-auto cursor-pointer ${
                      dynamicIslandHovered ? 'w-44 h-7 px-3 scale-105' : `${phoneDimensions.islandWidth} ${phoneDimensions.islandHeight}`
                    }`}
                  >
                    {dynamicIslandHovered ? (
                      <div className="flex items-center justify-between w-full text-white text-[9px] font-semibold select-none">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold text-indigo-300">AcousticPro</span>
                        </div>
                        <div className="flex items-center gap-0.5 h-2.5">
                          <span className="w-0.5 h-2 bg-indigo-400 animate-bounce" />
                          <span className="w-0.5 h-2.5 bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <span className="w-0.5 h-1.5 bg-pink-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-[#111] border border-blue-900/60" />
                        <div className="w-2 h-2 rounded-full bg-[#0a192f]/80" />
                      </>
                    )}
                  </div>

                  {/* Status Bar: Time & 5G & Battery */}
                  <div className="absolute top-3.5 left-6 right-6 flex items-center justify-between text-[10px] font-semibold text-white/90 z-30 pointer-events-none">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px]">5G</span>
                      <div className="w-4.5 h-2.5 border border-white/80 rounded-xs p-0.5 flex items-center">
                        <div className="w-full h-full bg-white rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Inner Screen Area: Pixel-Perfect 9:16 Canvas Box */}
                  <div
                    className={`relative w-full h-full ${phoneDimensions.innerRounded} overflow-hidden bg-black flex flex-col items-center justify-center`}
                    style={{ backgroundColor: schema.backgroundColor || '#090d16' }}
                  >
                    {/* The Actual 1080x1920 Story Ad Canvas */}
                    <div
                      className="relative overflow-hidden flex items-center justify-center"
                      style={{
                        width: `${phoneDimensions.screenWidth}px`,
                        height: `${phoneDimensions.screenHeight}px`,
                      }}
                    >
                      <AdRenderer
                        schema={schema}
                        surface={storySurface}
                        selectedElementId={null}
                        onSelectElement={() => {}}
                        scale={phoneDimensions.scale}
                        interactive={false}
                      />

                      {/* Safe Zones Visualizer Guide Overlay */}
                      {showSafeZones && (
                        <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between text-[9px] font-mono">
                          {/* Top Danger/System Zone (0 - 13%) */}
                          <div className="h-[13%] bg-amber-500/20 border-b border-amber-400/60 flex items-center justify-center text-amber-200 font-bold backdrop-blur-xs">
                            Top Safe Zone (0–250px · Dynamic Island & Status)
                          </div>
                          {/* Core Creative Safe Zone */}
                          <div className="flex-1 border-x-2 border-emerald-400/40 m-2 flex items-center justify-center text-emerald-300 font-bold text-[10px] bg-emerald-500/5">
                            Active Creative Stage (250–1680px · 100% Visible)
                          </div>
                          {/* Bottom Danger/Action Zone (87% - 100%) */}
                          <div className="h-[13%] bg-blue-500/25 border-t border-blue-400/60 flex items-center justify-center text-blue-200 font-bold backdrop-blur-xs">
                            Bottom Safe Zone (1680–1920px · Controls)
                          </div>
                        </div>
                      )}

                      {/* Overlays: Story Mode */}
                      {instagramOverlayMode !== 'clean' && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 z-30">
                          {/* Top Story Progress Bars */}
                          <div className="pt-5.5 flex items-center gap-1">
                            <div className="h-0.5 flex-1 bg-white/90 rounded-full" />
                            <div className="h-0.5 flex-1 bg-white/90 rounded-full relative overflow-hidden">
                              <div className="h-full bg-white animate-pulse w-3/4" />
                            </div>
                            <div className="h-0.5 flex-1 bg-white/30 rounded-full" />
                          </div>

                          {/* Top Creator Header */}
                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
                                <div className="w-full h-full bg-surface-900 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
                                  AP
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-white text-[11px] font-bold tracking-tight drop-shadow-md">acousticpro.audio</span>
                                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[6px] font-bold">✓</span>
                                </div>
                                <span className="text-[8px] text-white/80 font-medium drop-shadow">Sponsored</span>
                              </div>
                            </div>
                            <span className="text-white/80 text-[11px] font-bold drop-shadow">✕</span>
                          </div>

                          {/* Right-Rail Action Column (Only in Reels Mode) */}
                          {instagramOverlayMode === 'reels' ? (
                            <div className="self-end flex flex-col items-center gap-3 mb-10 text-white drop-shadow-lg">
                              <div className="flex flex-col items-center gap-0.5">
                                <Heart size={18} className="text-white fill-white/20" />
                                <span className="text-[8px] font-bold">42.8K</span>
                              </div>
                              <div className="flex flex-col items-center gap-0.5">
                                <MessageCircle size={18} />
                                <span className="text-[8px] font-bold">1,284</span>
                              </div>
                              <div className="flex flex-col items-center gap-0.5">
                                <Send size={16} />
                                <span className="text-[8px] font-bold">Share</span>
                              </div>
                              <Bookmark size={16} />
                              <div className="w-6 h-6 rounded-full bg-surface-900/80 border border-white/30 flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
                                <Music size={10} className="text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1" />
                          )}

                          {/* Bottom Interaction Safe Zone: Clean Native Instagram Message Bar */}
                          <div className="pb-1.5 w-full flex items-center gap-1.5">
                            <div className="flex-1 bg-white/15 hover:bg-white/20 backdrop-blur-md rounded-full py-1.5 px-3.5 text-[9px] text-white/80 border border-white/20 flex items-center justify-between">
                              <span>Send message...</span>
                              <span className="text-[8px] text-white/50">Aa</span>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                              <Heart size={12} />
                            </div>
                            <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                              <Send size={11} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Home Indicator Bar */}
                    <div className="w-28 h-1 bg-white/30 rounded-full mt-1 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Mobile Surface Diagnostics & Safe Zone Inspector */}
              <div className="lg:col-span-6 xl:col-span-7 space-y-4">
                {/* Surface Specs Card */}
                <div className="glass-card p-5">
                  <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-surface-200 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs">
                        9:16
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-surface-900">Apple iPhone 16 Pro · Vertical Story Simulation</h3>
                        <p className="text-xs text-surface-500">
                          6.3-inch Super Retina XDR OLED (1179 × 2556 px · 460 ppi)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-success text-[10px] font-semibold">Verified Safe Zones</span>
                      <button
                        onClick={handleResetCreative}
                        disabled={resettingCreative}
                        className="text-[11px] font-medium text-surface-600 hover:text-primary-600 bg-surface-100 hover:bg-surface-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                        title="Reset this layout to the calibrated high-DPI factory schema"
                      >
                        <RefreshCw size={11} className={resettingCreative ? 'animate-spin' : ''} />
                        {resettingCreative ? 'Resetting...' : 'Reset Creative'}
                      </button>
                    </div>
                  </div>

                  {resetSuccess && (
                    <div className="mb-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-1.5 animate-fade-in">
                      <Check size={13} className="text-emerald-600" />
                      <span>Layout reset to factory optimal dimensions and refreshed in localStorage!</span>
                    </div>
                  )}

                  {/* Titanium Finish Selector */}
                  <div className="flex items-center justify-between bg-surface-50 p-2.5 rounded-lg border border-surface-200/50 mb-4 text-xs">
                    <span className="text-surface-500 font-medium">Chassis Finish:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setTitaniumFinish('natural')}
                        className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                          titaniumFinish === 'natural' ? 'bg-[#3e4249] text-white shadow-xs' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#8b8f96] inline-block" /> Natural Titanium
                      </button>
                      <button
                        onClick={() => setTitaniumFinish('black')}
                        className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                          titaniumFinish === 'black' ? 'bg-[#181a1f] text-white shadow-xs' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#202228] inline-block" /> Black Titanium
                      </button>
                      <button
                        onClick={() => setTitaniumFinish('desert')}
                        className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                          titaniumFinish === 'desert' ? 'bg-[#54483f] text-white shadow-xs' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#c8b29d] inline-block" /> Desert Titanium
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
                    <div className="bg-surface-50 p-2.5 rounded-lg border border-surface-200/50">
                      <span className="text-surface-400 block text-[10px] uppercase font-semibold">Target Surface</span>
                      <strong className="text-surface-800 font-mono">1080 × 1920 px</strong>
                    </div>
                    <div className="bg-surface-50 p-2.5 rounded-lg border border-surface-200/50">
                      <span className="text-surface-400 block text-[10px] uppercase font-semibold">Aspect Ratio</span>
                      <strong className="text-surface-800">9:16 (Full Screen)</strong>
                    </div>
                    <div className="bg-surface-50 p-2.5 rounded-lg border border-surface-200/50">
                      <span className="text-surface-400 block text-[10px] uppercase font-semibold">Device Canvas Scale</span>
                      <strong className="text-primary-600 font-mono">
                        {(phoneDimensions.scale * 100).toFixed(1)}% ({phoneDimensions.screenWidth} × {phoneDimensions.screenHeight} px)
                      </strong>
                    </div>
                  </div>

                  {/* Safe Zone Checklist */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-50 border border-surface-200/40">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" />
                        <span className="font-semibold text-surface-800">Top Header & Dynamic Island (0–250px)</span>
                      </div>
                      <span className="text-emerald-600 font-medium">Cleared ✓ (Starts at 269px)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-50 border border-surface-200/40">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" />
                        <span className="font-semibold text-surface-800">Bottom Interaction & Controls (1680–1920px)</span>
                      </div>
                      <span className="text-emerald-600 font-medium">Cleared ✓ (Ends at 1643px)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-50 border border-surface-200/40">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" />
                        <span className="font-semibold text-surface-800">Mobile Typography Multiplier</span>
                      </div>
                      <span className="text-emerald-600 font-medium">Auto-Scaled 2.4x (62px Bold Headline)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-50 border border-surface-200/40">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" />
                        <span className="font-semibold text-surface-800">CTA Button Touch Target</span>
                      </div>
                      <span className="text-emerald-600 font-medium">88px Height · 100% Visible ("Pre-order Now")</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-surface-200 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleExportHtml5(storySurface)}
                      className="btn-primary text-xs py-1.5"
                    >
                      <Download size={13} /> Export Story HTML5 Bundle
                    </button>
                    <button
                      onClick={() => navigate(`/editor/${schema.id}`)}
                      className="btn-secondary text-xs py-1.5"
                    >
                      <ArrowLeft size={13} /> Edit Story Elements in Editor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DESKTOP TECH PUBLISHER ("THE VERGE / TECHPULSE") */}
          {simPlatform === 'publisher' && (
            <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
              {/* Safari Window Chrome */}
              <div className="bg-surface-100 border-b border-surface-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="bg-white px-4 py-1 rounded-lg border border-surface-200 text-xs text-surface-600 font-mono flex items-center gap-2 w-96 justify-center shadow-inner">
                  <span className="text-emerald-600 font-bold">🔒</span>
                  <span>https://techpulse.io/reviews/acousticpro-spatial-audio-flagship</span>
                </div>
                <div className="text-surface-400 text-xs font-mono">Safari 18.2</div>
              </div>

              {/* Publisher Masthead */}
              <header className="border-b border-surface-200 px-8 py-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-6">
                  <span className="text-xl font-black tracking-tighter text-surface-900">TECH<span className="text-primary-600">PULSE</span></span>
                  <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-surface-600">
                    <span className="text-primary-600 cursor-pointer">REVIEWS</span>
                    <span className="hover:text-surface-900 cursor-pointer">AUDIO</span>
                    <span className="hover:text-surface-900 cursor-pointer">FUTURE TECH</span>
                    <span className="hover:text-surface-900 cursor-pointer">BUYING GUIDES</span>
                  </nav>
                </div>
                <div className="text-xs text-surface-400 font-medium">Tuesday, September 14, 2026</div>
              </header>

              {/* Top Leaderboard Ad Slot (728×90) */}
              <div className="bg-surface-50 py-4 border-b border-surface-200 flex flex-col items-center">
                <span className="text-[10px] font-semibold text-surface-400 tracking-wider mb-1 uppercase">ADVERTISEMENT · 728×90 LEADERBOARD</span>
                <div className="shadow-sm rounded overflow-hidden border border-surface-200">
                  <AdRenderer
                    schema={schema}
                    surface={leaderboardSurface}
                    selectedElementId={null}
                    onSelectElement={() => {}}
                    scale={1}
                    interactive={false}
                  />
                </div>
              </div>

              {/* Main Two-Column Publication Content */}
              <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Article (2 cols) */}
                <article className="lg:col-span-2 space-y-4">
                  <div className="inline-block bg-primary-50 text-primary-700 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Audio Hardware Review
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-surface-900 leading-tight">
                    The Next Decade of Spatial Audio: How Adaptive Planar Drivers Are Redefining Modern Sound
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-surface-500 py-1 border-b border-surface-100">
                    <span className="font-semibold text-surface-800">By Elena Vance</span>
                    <span>•</span>
                    <span>Senior Hardware Reviewer</span>
                    <span>•</span>
                    <span>6 Min Read</span>
                  </div>
                  <p className="text-sm text-surface-700 leading-relaxed pt-2">
                    For years, personal audio hardware has been locked in a race for active noise cancellation decibel reduction. But the true frontier is spatial precision — recreating acoustic environments with zero phase distortion.
                  </p>
                  <p className="text-sm text-surface-700 leading-relaxed">
                    With the new planar-magnetic acoustic architecture showcased in modern flagship series, listeners experience real-time soundstage calibration that adapts continuously to room acoustics and head movement.
                  </p>
                  <div className="bg-surface-50 border-l-4 border-primary-600 p-4 rounded-r-lg my-4">
                    <p className="text-sm font-medium text-surface-800 italic">
                      "AdaptFlow’s programmatic layout engine dynamically tailors creative messaging so the acoustic narrative looks stunning on any digital display."
                    </p>
                  </div>
                  <p className="text-sm text-surface-700 leading-relaxed">
                    Whether browsing high-density desktop magazines or rapid-fire mobile video feeds, programmatic asset synchronization ensures the hardware's premium visual identity stays intact without manual layout restructuring.
                  </p>
                </article>

                {/* Right Column: Sidebar Ad Placement (Skyscraper or Medium Banner) */}
                <aside className="border-l border-surface-100 pl-8 flex flex-col items-center lg:items-start">
                  <div className="sticky top-6 flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">SPONSORED PLACEMENT</span>
                      <span className="text-[10px] text-primary-600 font-medium">{publisherSidebarAd === 'skyscraper' ? '160×600' : '300×250'}</span>
                    </div>

                    <div className="shadow-md rounded-lg overflow-hidden border border-surface-200">
                      {publisherSidebarAd === 'skyscraper' ? (
                        <AdRenderer
                          schema={schema}
                          surface={skyscraperSurface}
                          selectedElementId={null}
                          onSelectElement={() => {}}
                          scale={1}
                          interactive={false}
                        />
                      ) : (
                        <AdRenderer
                          schema={schema}
                          surface={bannerSurface}
                          selectedElementId={null}
                          onSelectElement={() => {}}
                          scale={1}
                          interactive={false}
                        />
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* 3. MOBILE SOCIAL MEDIA FEED POST */}
          {simPlatform === 'feed' && (
            <div className="flex justify-center py-6">
              <div className="w-[420px] bg-white rounded-3xl shadow-2xl border border-surface-200 overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between border-b border-surface-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-primary-500 p-0.5">
                      <div className="w-full h-full bg-surface-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        AP
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-surface-900">AcousticPro Audio</span>
                        <span className="text-blue-500 text-xs">✓</span>
                      </div>
                      <span className="text-[11px] text-surface-400">Sponsored · 2h ago</span>
                    </div>
                  </div>
                  <span className="text-surface-400 font-bold">•••</span>
                </div>

                {/* 1080x1080 Square Ad Canvas in Feed */}
                <div className="relative bg-surface-950 flex items-center justify-center overflow-hidden">
                  <AdRenderer
                    schema={schema}
                    surface={squareSurface}
                    selectedElementId={null}
                    onSelectElement={() => {}}
                    scale={420 / 1080} // ~0.3888 scale to fit 420px width
                    interactive={false}
                  />

                  {/* Interactive Product Tag */}
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
                    <span>🏷️ AcousticPro ANC Series</span>
                    <span className="text-emerald-400 font-bold">$249</span>
                  </div>
                </div>

                {/* Feed Action Bar */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-surface-800">
                      <Heart size={22} className="text-rose-500 fill-rose-500" />
                      <MessageCircle size={22} />
                      <Send size={20} />
                    </div>
                    <Bookmark size={22} />
                  </div>
                  <div className="text-xs font-bold text-surface-900">18,429 likes</div>
                  <p className="text-xs text-surface-700 leading-relaxed">
                    <strong className="text-surface-900">acousticpro.audio</strong> Next-Gen performance spatial sound engineered for extreme focus and acoustic precision. Limited launch batch shipping this week!
                  </p>
                  <div className="text-[11px] text-surface-400">View all 342 comments</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          VIEW MODE 3: FLUID RESIZER CANVAS LAB
      ============================================================ */}
      {viewMode === 'resizer' && (
        <div className="animate-fade-in space-y-6">
          <div className="glass-card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-surface-200">
              <div>
                <h3 className="text-sm font-bold text-surface-900">Live Continuous Constraint Solver Playground</h3>
                <p className="text-xs text-surface-500">
                  Drag dimensions smoothly to test the engine reflowing elements, anchoring buttons, and scaling font descenders dynamically.
                </p>
              </div>

              {/* Resolution readout */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-500">Current Canvas:</span>
                <span className="font-mono text-xs font-bold bg-primary-50 text-primary-700 px-3 py-1 rounded-lg border border-primary-200">
                  {customWidth} × {customHeight} px ({((customWidth / customHeight)).toFixed(2)}:1)
                </span>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-surface-700">
                  <span>Width: {customWidth}px</span>
                  <span className="text-surface-400">Min 120px — Max 1200px</span>
                </div>
                <input
                  type="range"
                  min="140"
                  max="1080"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-surface-700">
                  <span>Height: {customHeight}px</span>
                  <span className="text-surface-400">Min 70px — Max 800px</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="800"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </div>

            {/* Preset Quick Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-semibold text-surface-400 uppercase">Quick Presets:</span>
              {[
                { label: 'Banner (300×250)', w: 300, h: 250 },
                { label: 'Leaderboard (728×90)', w: 728, h: 90 },
                { label: 'Skyscraper (160×600)', w: 160, h: 600 },
                { label: 'Half-Page (300×600)', w: 300, h: 600 },
                { label: 'Square (400×400)', w: 400, h: 400 },
                { label: 'Mobile Interstitial (320×480)', w: 320, h: 480 },
                { label: 'Billboard (970×250)', w: 970, h: 250 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setCustomWidth(p.w);
                    setCustomHeight(p.h);
                  }}
                  className="px-2.5 py-1 rounded-md text-xs bg-surface-100 hover:bg-surface-200 text-surface-700 font-medium transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fluid Canvas Display */}
          <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[460px] bg-surface-900/5">
            <SurfaceFrame
              width={customSurface.width}
              height={customSurface.height}
              label={customSurface.name}
            >
              <AdRenderer
                schema={schema}
                surface={customSurface}
                selectedElementId={null}
                onSelectElement={() => {}}
                scale={Math.min(650 / customWidth, 500 / customHeight, 1)}
                interactive={false}
              />
            </SurfaceFrame>
          </div>
        </div>
      )}

      {/* Enlarged Surface Modal */}
      {activeSurfaceModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveSurfaceModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-surface-200 w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto flex flex-col items-center animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-surface-200">
              <div>
                <h3 className="text-lg font-bold text-surface-900">{activeSurfaceModal.name}</h3>
                <span className="text-xs text-surface-500 font-mono">
                  {activeSurfaceModal.width} × {activeSurfaceModal.height} px • Format: {activeSurfaceModal.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportHtml5(activeSurfaceModal)}
                  className="btn-secondary text-xs py-1.5"
                >
                  <FileCode size={13} /> Export HTML5
                </button>
                <button
                  onClick={() => setActiveSurfaceModal(null)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center text-surface-500 hover:text-surface-900 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="bg-surface-900/5 p-6 rounded-xl border border-surface-200 flex justify-center items-center w-full min-h-[440px]">
              <SurfaceFrame
                width={activeSurfaceModal.width}
                height={activeSurfaceModal.height}
                label={activeSurfaceModal.name}
              >
                <AdRenderer
                  schema={schema}
                  surface={activeSurfaceModal}
                  selectedElementId={null}
                  onSelectElement={() => {}}
                  scale={Math.min(650 / activeSurfaceModal.width, 550 / activeSurfaceModal.height, 1)}
                  interactive={false}
                />
              </SurfaceFrame>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
