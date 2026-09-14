import { useMemo } from 'react';
import type { LayoutSchema, Surface } from '@/engine/engine';
import { resolveLayout } from '@/engine/engine';
import ElementNodeComponent from './ElementNode';

interface AdRendererProps {
  schema: LayoutSchema;
  surface: Surface;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onMoveElement?: (id: string, x: number, y: number) => void;
  scale?: number;
  interactive?: boolean;
}

export default function AdRenderer({
  schema,
  surface,
  selectedElementId,
  onSelectElement,
  onMoveElement,
  scale = 1,
  interactive = true,
}: AdRendererProps) {
  const renderTree = useMemo(() => {
    return resolveLayout(schema, surface);
  }, [schema, surface]);

  const displayWidth = Math.round(surface.width * scale);
  const displayHeight = Math.round(surface.height * scale);

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        backgroundColor: schema.backgroundColor || '#090d16',
      }}
      onClick={() => interactive && onSelectElement(null)}
    >
      <div
        style={{
          width: `${surface.width}px`,
          height: `${surface.height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {renderTree.elements.map((element) => (
          <ElementNodeComponent
            key={element.id}
            element={element}
            surfaceWidth={surface.width}
            surfaceHeight={surface.height}
            isSelected={selectedElementId === element.id && interactive}
            onClick={(id) => interactive && onSelectElement(id)}
            onMove={onMoveElement}
            scale={scale}
            interactive={interactive}
          />
        ))}
      </div>
    </div>
  );
}
