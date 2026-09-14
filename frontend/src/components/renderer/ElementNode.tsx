import { useState } from 'react';
import type { ResolvedElement } from '@/engine/engine';
import type { TextProps, ImageProps, ButtonProps, LogoProps, ShapeProps } from '@/engine/types';

interface ElementNodeProps {
  element: ResolvedElement;
  surfaceWidth: number;
  surfaceHeight: number;
  isSelected: boolean;
  onClick: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
  scale: number;
  interactive?: boolean;
}

function renderText(props: TextProps, effectiveFontSize?: number) {
  const fontSize = effectiveFontSize ?? props.fontSize ?? 16;
  const lineMultiplier = props.lineHeight && props.lineHeight > 0 ? props.lineHeight : 1.25;

  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        fontWeight: props.fontWeight || 500,
        fontFamily: props.fontFamily || 'Inter, -apple-system, sans-serif',
        color: props.color || '#1e293b',
        textAlign: props.textAlign || 'center',
        lineHeight: lineMultiplier,
        letterSpacing: `${props.letterSpacing || 0}px`,
        textTransform: props.textTransform || 'none',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: props.textAlign === 'center' ? 'center' : props.textAlign === 'right' ? 'flex-end' : 'flex-start',
        overflow: 'visible',
        wordBreak: 'break-word',
        padding: '2px 0',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {props.content}
    </div>
  );
}

function renderImage(props: ImageProps) {
  const [hasError, setHasError] = useState(false);
  const src = !hasError && props.src ? props.src : '/assets/headphones.jpg';

  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden relative group"
      style={{ borderRadius: `${props.borderRadius || 12}px`, opacity: props.opacity ?? 1 }}
    >
      <img
        src={src}
        alt={props.alt || 'AcousticPro Studio Wireless Headphones'}
        className="w-full h-full object-contain filter drop-shadow-[0_15px_35px_rgba(99,102,241,0.4)] transition-transform duration-300 group-hover:scale-105"
        style={{ objectFit: props.objectFit || 'contain' }}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function renderButton(props: ButtonProps, resolvedWidth: number, resolvedHeight?: number) {
  const btnWidth = resolvedWidth || 120;
  const btnHeight = resolvedHeight || 40;
  const label = props.label || 'Learn More';
  
  // Check if button is on a high-resolution canvas (e.g. 1080p canvas where width is >= 380px)
  const isHighRes = btnWidth >= 380;
  
  // Responsive horizontal padding based on available width
  const padX = btnWidth <= 160
    ? Math.max(6, Math.min(10, Math.floor(btnWidth * 0.06)))
    : isHighRes
    ? Math.max(24, Math.min(48, Math.floor(btnWidth * 0.07)))
    : Math.min(props.paddingX || 20, Math.floor(btnWidth * 0.12));
    
  const padY = isHighRes ? Math.floor(btnHeight * 0.22) : (props.paddingY || 10);
  const usableWidth = Math.max(24, btnWidth - (padX * 2));

  // Determine target font size: scale up proportionally if high-res canvas
  let targetFontSize = props.fontSize || 14;
  if (isHighRes && targetFontSize < 24) {
    targetFontSize = Math.round(targetFontSize * 2.2); // ~31px for 14px base
  }

  // Auto-fit font size so the entire label + icon fits with zero clipping
  const charCount = label.length + (props.icon ? 2.5 : 0);
  const estimatedCharWidthRatio = 0.52;
  const estimatedTextWidth = charCount * (targetFontSize * estimatedCharWidthRatio);
  
  let fontSize = targetFontSize;
  if (estimatedTextWidth > usableWidth && usableWidth > 20) {
    fontSize = Math.max(9, Math.floor(usableWidth / (charCount * estimatedCharWidthRatio)));
  }

  return (
    <div
      className="flex items-center justify-center gap-2 w-full h-full cursor-pointer select-none font-bold text-center shadow-lg transition-transform duration-150 hover:brightness-110 active:scale-95"
      style={{
        backgroundColor: props.backgroundColor || '#4f46e5',
        color: props.textColor || '#ffffff',
        fontSize: `${fontSize}px`,
        fontWeight: props.fontWeight || 700,
        borderRadius: `${props.borderRadius ?? 9999}px`,
        padding: `${Math.max(4, padY * 0.4)}px ${padX}px`,
        boxSizing: 'border-box',
        lineHeight: 1.15,
        overflow: 'visible',
        whiteSpace: 'nowrap',
      }}
    >
      <span className="whitespace-nowrap tracking-tight inline-block leading-none">{label}</span>
      {props.icon && <span className="text-[1.1em] flex-shrink-0 leading-none">{props.icon}</span>}
    </div>
  );
}

function renderLogo(props: LogoProps) {
  const [hasError, setHasError] = useState(false);

  if (props.src && !hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ opacity: props.opacity ?? 1 }}>
        <img
          src={props.src}
          alt={props.alt || 'Brand Logo'}
          className="w-full h-full object-contain filter drop-shadow-sm"
          style={{ objectFit: props.objectFit || 'contain' }}
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center gap-2" style={{ opacity: props.opacity ?? 1 }}>
      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30 border border-white/20">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L14 6V14H2V6L8 2Z" fill="white" opacity="0.95"/>
        </svg>
      </div>
      <span className="text-xs font-black tracking-widest uppercase text-slate-100 drop-shadow">AcousticPro</span>
    </div>
  );
}

function renderShape(props: ShapeProps) {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: props.backgroundColor,
    borderColor: props.borderColor,
    borderWidth: `${props.borderWidth}px`,
    borderStyle: props.borderWidth > 0 ? 'solid' : 'none',
    opacity: props.opacity,
  };

  switch (props.shapeType) {
    case 'circle':
      return <div style={{ ...baseStyle, borderRadius: '50%' }} />;
    case 'pill':
      return <div style={{ ...baseStyle, borderRadius: '9999px' }} />;
    case 'line':
      return <div style={{ ...baseStyle, height: `${props.borderWidth || 2}px`, backgroundColor: props.borderColor }} />;
    default:
      return <div style={{ ...baseStyle, borderRadius: `${props.borderRadius}px` }} />;
  }
}

export default function ElementNodeComponent({
  element,
  surfaceWidth,
  surfaceHeight,
  isSelected,
  onClick,
  onMove,
  scale,
  interactive = true,
}: ElementNodeProps) {
  if (element.hidden) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    onClick(element.id);

    if (element.locked || !onMove) return;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const initialX = element.x;
    const initialY = element.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaPxX = moveEvent.clientX - startClientX;
      const deltaPxY = moveEvent.clientY - startClientY;

      const deltaPercentX = (deltaPxX / (surfaceWidth * scale)) * 100;
      const deltaPercentY = (deltaPxY / (surfaceHeight * scale)) * 100;

      const newX = Math.max(0, Math.min(100 - element.width, initialX + deltaPercentX));
      const newY = Math.max(0, Math.min(100 - element.height, initialY + deltaPercentY));

      onMove(element.id, Math.round(newX), Math.round(newY));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`absolute transition-shadow duration-100 select-none ${
        isSelected && interactive ? 'ring-2 ring-primary-500 ring-offset-1 z-30' : interactive ? 'hover:ring-1 hover:ring-primary-300' : ''
      }`}
      style={{
        left: `${element.resolvedX}px`,
        top: `${element.resolvedY}px`,
        width: `${element.resolvedWidth}px`,
        height: `${element.resolvedHeight}px`,
        zIndex: element.zIndex,
        cursor: !interactive || element.locked ? 'default' : 'grab',
      }}
      title={element.label}
    >
      {element.type === 'text' && renderText(element.props as TextProps, element.effectiveFontSize)}
      {element.type === 'image' && renderImage(element.props as ImageProps)}
      {element.type === 'button' && renderButton(element.props as ButtonProps, element.resolvedWidth, element.resolvedHeight)}
      {element.type === 'logo' && renderLogo(element.props as LogoProps)}
      {element.type === 'shape' && renderShape(element.props as ShapeProps)}

      {/* Selection handles */}
      {isSelected && interactive && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary-600 border border-white rounded-sm pointer-events-none" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-600 border border-white rounded-sm pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary-600 border border-white rounded-sm pointer-events-none" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary-600 border border-white rounded-sm pointer-events-none" />

          {/* Coordinate tooltip */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-primary-700 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap pointer-events-none shadow-md">
            X: {element.x.toFixed(0)}% · Y: {element.y.toFixed(0)}%
          </div>
        </>
      )}
    </div>
  );
}
