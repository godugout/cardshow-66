import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Square,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Move3D,
  Camera,
  Palette,
  Lightbulb
} from 'lucide-react';

export type AnimationMode = 'beginner' | 'pro' | 'director';
export type PlaybackState = 'playing' | 'paused' | 'stopped';

export interface TimelineState {
  currentTime: number;
  duration: number;
  playbackState: PlaybackState;
  zoom: number;
  frameRate: number;
}

interface SimpleTrack {
  id: string;
  name: string;
  type: 'transform' | 'material' | 'lighting' | 'camera';
  enabled: boolean;
  locked: boolean;
  keyframes: SimpleKeyframe[];
}

interface SimpleKeyframe {
  id: string;
  time: number;
  value: any;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

interface SimpleTimelineProps {
  mode?: AnimationMode;
  onAnimationUpdate?: (state: TimelineState) => void;
  onExport?: (format: string, options: any) => void;
}

export const SimpleTimeline: React.FC<SimpleTimelineProps> = ({
  mode = 'pro',
  onAnimationUpdate,
  onExport
}) => {
  const [timelineState, setTimelineState] = useState<TimelineState>({
    currentTime: 0,
    duration: 10,
    playbackState: 'paused',
    zoom: 1,
    frameRate: 60
  });

  const [tracks] = useState<SimpleTrack[]>([
    {
      id: 'transform',
      name: 'Transform',
      type: 'transform',
      enabled: true,
      locked: false,
      keyframes: [
        { id: 'k1', time: 0, value: { x: 0, y: 0, rotation: 0 }, easing: 'ease-out' },
        { id: 'k2', time: 5, value: { x: 100, y: 50, rotation: 180 }, easing: 'ease-in-out' },
        { id: 'k3', time: 10, value: { x: 0, y: 0, rotation: 360 }, easing: 'ease-in' }
      ]
    },
    {
      id: 'material',
      name: 'Material',
      type: 'material',
      enabled: true,
      locked: false,
      keyframes: [
        { id: 'm1', time: 0, value: { metalness: 0.2, roughness: 0.8 }, easing: 'linear' },
        { id: 'm2', time: 7, value: { metalness: 0.9, roughness: 0.1 }, easing: 'ease-out' }
      ]
    },
    {
      id: 'lighting',
      name: 'Lighting',
      type: 'lighting',
      enabled: true,
      locked: false,
      keyframes: [
        { id: 'l1', time: 0, value: { intensity: 0.8, color: '#ffffff' }, easing: 'ease-in' },
        { id: 'l2', time: 8, value: { intensity: 1.2, color: '#ffd700' }, easing: 'ease-out' }
      ]
    }
  ]);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>('transform');
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set(['transform']));
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [looping, setLooping] = useState(true);

  // Playback controls
  const handlePlay = useCallback(() => {
    setTimelineState(prev => ({ ...prev, playbackState: 'playing' }));
  }, []);

  const handlePause = useCallback(() => {
    setTimelineState(prev => ({ ...prev, playbackState: 'paused' }));
  }, []);

  const handleStop = useCallback(() => {
    setTimelineState(prev => ({ 
      ...prev, 
      playbackState: 'stopped',
      currentTime: 0 
    }));
  }, []);

  const handleSeek = useCallback((time: number) => {
    setTimelineState(prev => ({ ...prev, currentTime: time }));
  }, []);

  // Animation loop
  useEffect(() => {
    let animationId: number;
    
    if (timelineState.playbackState === 'playing') {
      const animate = () => {
        setTimelineState(prev => {
          const newTime = prev.currentTime + (1 / prev.frameRate) * playbackSpeed;
          
          if (newTime >= prev.duration) {
            if (looping) {
              return { ...prev, currentTime: 0 };
            } else {
              return { ...prev, currentTime: prev.duration, playbackState: 'paused' };
            }
          }
          
          return { ...prev, currentTime: newTime };
        });
        
        animationId = requestAnimationFrame(animate);
      };
      
      animationId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [timelineState.playbackState, playbackSpeed, looping]);

  // Notify parent of timeline updates
  useEffect(() => {
    onAnimationUpdate?.(timelineState);
  }, [timelineState, onAnimationUpdate]);

  const toggleTrackExpansion = (trackId: string) => {
    setExpandedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const getTrackIcon = (type: SimpleTrack['type']) => {
    switch (type) {
      case 'transform': return Move3D;
      case 'material': return Palette;
      case 'lighting': return Lightbulb;
      case 'camera': return Camera;
      default: return Move3D;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(1);
    return `${minutes}:${seconds.padStart(4, '0')}`;
  };

  const timelineWidth = 600;

  return (
    <Card className="h-full bg-crd-dark border-crd-border flex flex-col">
      {/* Timeline Header */}
      <div className="h-12 border-b border-crd-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={timelineState.playbackState === 'playing' ? 'default' : 'outline'}
              onClick={timelineState.playbackState === 'playing' ? handlePause : handlePlay}
            >
              {timelineState.playbackState === 'playing' ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={handleStop}>
              <Square className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleSeek(0)}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleSeek(timelineState.duration)}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2 text-sm">
            <span className="text-crd-text-secondary">Time:</span>
            <Badge variant="outline">{formatTime(timelineState.currentTime)}</Badge>
            <span className="text-crd-text-secondary">/</span>
            <Badge variant="outline">{formatTime(timelineState.duration)}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-crd-text-secondary">Speed:</span>
            <select 
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-crd-darkest border border-crd-border rounded text-xs px-2 py-1"
            >
              <option value={0.25}>0.25x</option>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-crd-text-secondary">Zoom:</span>
          <Slider
            value={[timelineState.zoom]}
            onValueChange={([value]) => setTimelineState(prev => ({ ...prev, zoom: value }))}
            min={0.5}
            max={3}
            step={0.1}
            className="w-20"
          />
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex">
        {/* Track Headers */}
        <div className="w-48 border-r border-crd-border">
          <div className="h-8 border-b border-crd-border bg-crd-darkest flex items-center px-3 text-xs font-medium">
            Tracks
          </div>
          <div className="space-y-1 p-2">
            {tracks.map((track) => {
              const Icon = getTrackIcon(track.type);
              const isExpanded = expandedTracks.has(track.id);
              
              return (
                <div key={track.id} className="space-y-1">
                  <div 
                    className={`flex items-center gap-2 p-2 rounded-sm cursor-pointer ${
                      selectedTrackId === track.id 
                        ? 'bg-crd-accent/20 border border-crd-accent' 
                        : 'hover:bg-crd-darkest'
                    }`}
                    onClick={() => setSelectedTrackId(track.id)}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTrackExpansion(track.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </Button>
                    
                    <Icon className="w-4 h-4 text-crd-accent" />
                    <span className="text-xs flex-1">{track.name}</span>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0"
                    >
                      {track.enabled ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3 opacity-50" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0"
                    >
                      {track.locked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Unlock className="w-3 h-3 opacity-50" />
                      )}
                    </Button>
                  </div>
                  
                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {Object.keys(track.keyframes[0]?.value || {}).map((property) => (
                        <div key={property} className="text-xs text-crd-text-secondary py-1 px-2">
                          {property}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 relative overflow-hidden">
          {/* Time Ruler */}
          <div className="h-8 border-b border-crd-border bg-crd-darkest flex items-center relative">
            {Array.from({ length: Math.ceil(timelineState.duration) + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute flex flex-col items-center"
                style={{ left: `${(i / timelineState.duration) * timelineWidth * timelineState.zoom}px` }}
              >
                <div className="text-xs text-crd-text-secondary">{i}s</div>
                <div className="w-px h-2 bg-crd-border"></div>
              </div>
            ))}
            
            {/* Playhead */}
            <div
              className="absolute top-0 w-px h-full bg-crd-accent z-10"
              style={{ 
                left: `${(timelineState.currentTime / timelineState.duration) * timelineWidth * timelineState.zoom}px` 
              }}
            >
              <div className="w-2 h-2 bg-crd-accent rounded-full -translate-x-1/2 -translate-y-1/2 absolute top-1/2"></div>
            </div>
          </div>

          {/* Track Timeline Content */}
          <div className="space-y-1 p-2">
            {tracks.map((track) => (
              <div key={track.id} className="h-8 relative">
                {/* Track Background */}
                <div className="absolute inset-0 bg-crd-darkest/50 rounded-sm"></div>
                
                {/* Keyframes */}
                {track.keyframes.map((keyframe) => (
                  <div
                    key={keyframe.id}
                    className="absolute w-3 h-3 bg-crd-accent rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      left: `${(keyframe.time / timelineState.duration) * timelineWidth * timelineState.zoom}px`
                    }}
                    title={`${keyframe.time}s - ${keyframe.easing}`}
                  />
                ))}
                
                {/* Track Selection Highlight */}
                {selectedTrackId === track.id && (
                  <div className="absolute inset-0 border-2 border-crd-accent/50 rounded-sm pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};