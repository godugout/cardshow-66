import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { AnimationTrack, Keyframe } from './ProfessionalTimeline';

interface TimelineTrackProps {
  track: AnimationTrack;
  currentTime: number;
  duration: number;
  zoom: number;
  selectedKeyframes: string[];
  onKeyframeSelect: (keyframeIds: string[]) => void;
  onKeyframeMove: (propertyId: string, keyframeId: string, newTime: number) => void;
  onAddKeyframe: (propertyId: string, time: number, value: any) => void;
  onDeleteKeyframe: (propertyId: string, keyframeId: string) => void;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  track,
  currentTime,
  duration,
  zoom,
  selectedKeyframes,
  onKeyframeSelect,
  onKeyframeMove,
  onAddKeyframe,
  onDeleteKeyframe
}) => {
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    keyframeId: string;
    propertyId: string;
    startX: number;
    startTime: number;
  } | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((
    e: React.MouseEvent,
    keyframeId: string,
    propertyId: string,
    keyframeTime: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedKeyframes.includes(keyframeId)) {
      if (e.ctrlKey || e.metaKey) {
        onKeyframeSelect([...selectedKeyframes, keyframeId]);
      } else {
        onKeyframeSelect([keyframeId]);
      }
    }

    setDragState({
      isDragging: true,
      keyframeId,
      propertyId,
      startX: e.clientX,
      startTime: keyframeTime
    });
  }, [selectedKeyframes, onKeyframeSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragState.startX;
    const deltaTime = (deltaX / (100 * zoom));
    const newTime = Math.max(0, Math.min(duration, dragState.startTime + deltaTime));

    onKeyframeMove(dragState.propertyId, dragState.keyframeId, newTime);
  }, [dragState, zoom, duration, onKeyframeMove]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  React.useEffect(() => {
    if (dragState?.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current || e.target !== e.currentTarget) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / (100 * zoom);

    // Find the first property to add keyframe to
    if (track.properties.length > 0) {
      const property = track.properties[0];
      const currentValue = property.value;
      onAddKeyframe(property.id, time, currentValue);
    }
  }, [track.properties, zoom, onAddKeyframe]);

  const getKeyframeColor = (easing: string) => {
    switch (easing) {
      case 'linear': return '#6b7280';
      case 'ease-in': return '#ef4444';
      case 'ease-out': return '#10b981';
      case 'ease-in-out': return '#3b82f6';
      case 'bounce': return '#f59e0b';
      case 'elastic': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (!track.visible) return null;

  const trackHeight = track.expanded ? track.properties.length * 24 + 8 : 32;
  const timelineWidth = duration * 100 * zoom;

  return (
    <div className="relative">
      {/* Track Background */}
      <div
        ref={trackRef}
        className="relative border-b border-crd-border/50 hover:bg-crd-darkest/30 cursor-pointer"
        style={{ height: `${trackHeight}px`, width: `${timelineWidth}px` }}
        onClick={handleTrackClick}
      >
        {/* Track Color Strip */}
        <div
          className="absolute left-0 top-0 w-1 h-full opacity-60"
          style={{ backgroundColor: track.color }}
        />

        {/* Properties */}
        {track.expanded ? (
          <div className="space-y-0">
            {track.properties.map((property, index) => (
              <div
                key={property.id}
                className="relative h-6 flex items-center"
                style={{ top: `${index * 24 + 4}px` }}
              >
                {/* Property Keyframes */}
                {property.keyframes.map((keyframe) => (
                  <div
                    key={keyframe.id}
                    className={`absolute w-3 h-3 rounded-sm border-2 border-white cursor-grab transform -translate-x-1/2 -translate-y-1/2 ${
                      selectedKeyframes.includes(keyframe.id)
                        ? 'scale-125 ring-2 ring-crd-accent'
                        : 'hover:scale-110'
                    } ${track.locked ? 'cursor-not-allowed opacity-50' : ''}`}
                    style={{
                      left: `${keyframe.time * 100 * zoom}px`,
                      backgroundColor: getKeyframeColor(keyframe.easing),
                      top: '50%'
                    }}
                    onMouseDown={(e) => {
                      if (!track.locked) {
                        handleMouseDown(e, keyframe.id, property.id, keyframe.time);
                      }
                    }}
                    onDoubleClick={() => {
                      if (!track.locked) {
                        onDeleteKeyframe(property.id, keyframe.id);
                      }
                    }}
                    title={`${property.name}: ${keyframe.value} (${keyframe.easing})`}
                  />
                ))}

                {/* Property Value Line */}
                {property.keyframes.length > 1 && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: `${timelineWidth}px`, height: '24px' }}
                  >
                    <polyline
                      points={property.keyframes
                        .map(kf => `${kf.time * 100 * zoom},12`)
                        .join(' ')}
                      fill="none"
                      stroke={track.color}
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Collapsed view - show all keyframes together
          <div className="relative h-full">
            {track.properties.flatMap(property =>
              property.keyframes.map(keyframe => (
                <div
                  key={keyframe.id}
                  className={`absolute w-2 h-2 rounded-full border border-white cursor-grab transform -translate-x-1/2 -translate-y-1/2 ${
                    selectedKeyframes.includes(keyframe.id)
                      ? 'scale-125 ring-1 ring-crd-accent'
                      : 'hover:scale-110'
                  } ${track.locked ? 'cursor-not-allowed opacity-50' : ''}`}
                  style={{
                    left: `${keyframe.time * 100 * zoom}px`,
                    backgroundColor: track.color,
                    top: '50%'
                  }}
                  onMouseDown={(e) => {
                    if (!track.locked) {
                      const property = track.properties.find(p => 
                        p.keyframes.some(kf => kf.id === keyframe.id)
                      );
                      if (property) {
                        handleMouseDown(e, keyframe.id, property.id, keyframe.time);
                      }
                    }
                  }}
                  title={`Time: ${keyframe.time.toFixed(2)}s`}
                />
              ))
            )}
          </div>
        )}

        {/* Grid Lines */}
        {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-px bg-crd-border/20"
            style={{ left: `${i * 100 * zoom}px` }}
          />
        ))}

        {/* Selection Overlay */}
        {selectedKeyframes.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Add visual feedback for selected keyframes */}
          </div>
        )}
      </div>

      {/* Track Controls Overlay */}
      {track.expanded && !track.locked && (
        <div className="absolute right-2 top-2 opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-black/50"
              onClick={() => {
                if (track.properties.length > 0) {
                  onAddKeyframe(track.properties[0].id, currentTime, track.properties[0].value);
                }
              }}
            >
              <Plus className="w-3 h-3" />
            </Button>
            {selectedKeyframes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-black/50 text-red-400"
                onClick={() => {
                  selectedKeyframes.forEach(keyframeId => {
                    track.properties.forEach(property => {
                      if (property.keyframes.some(kf => kf.id === keyframeId)) {
                        onDeleteKeyframe(property.id, keyframeId);
                      }
                    });
                  });
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};