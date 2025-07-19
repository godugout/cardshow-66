import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, RotateCcw } from 'lucide-react';
import type { AnimationTrack, Keyframe } from './ProfessionalTimeline';

interface KeyframeEditorProps {
  selectedKeyframes: string[];
  tracks: AnimationTrack[];
  onKeyframeUpdate: (keyframeId: string, updates: Partial<Keyframe>) => void;
  onClose: () => void;
}

export const KeyframeEditor: React.FC<KeyframeEditorProps> = ({
  selectedKeyframes,
  tracks,
  onKeyframeUpdate,
  onClose
}) => {
  const [selectedCurve, setSelectedCurve] = useState<string>('ease-in-out');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPoint, setDragPoint] = useState<'in' | 'out' | null>(null);

  // Get the first selected keyframe for editing
  const selectedKeyframe = React.useMemo(() => {
    if (selectedKeyframes.length === 0) return null;
    
    for (const track of tracks) {
      for (const property of track.properties) {
        for (const keyframe of property.keyframes) {
          if (selectedKeyframes.includes(keyframe.id)) {
            return keyframe;
          }
        }
      }
    }
    return null;
  }, [selectedKeyframes, tracks]);

  const easingPresets = [
    { value: 'linear', name: 'Linear' },
    { value: 'ease-in', name: 'Ease In' },
    { value: 'ease-out', name: 'Ease Out' },
    { value: 'ease-in-out', name: 'Ease In-Out' },
    { value: 'bounce', name: 'Bounce' },
    { value: 'elastic', name: 'Elastic' }
  ];

  const interpolationModes = [
    { value: 'linear', name: 'Linear' },
    { value: 'cubic', name: 'Cubic' },
    { value: 'step', name: 'Step' }
  ];

  // Draw the Bezier curve visualization
  const drawCurve = useCallback(() => {
    if (!canvasRef.current || !selectedKeyframe) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;
    const curveWidth = width - padding * 2;
    const curveHeight = height - padding * 2;

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i * curveWidth) / 4;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * curveHeight) / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw easing curve
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const easedT = applyEasing(t, selectedKeyframe.easing);
      
      const x = padding + t * curveWidth;
      const y = height - padding - easedT * curveHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw control points for cubic interpolation
    if (selectedKeyframe.interpolation === 'cubic' && selectedKeyframe.tangentIn && selectedKeyframe.tangentOut) {
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#f59e0b';
      
      // In tangent
      const inX = padding + selectedKeyframe.tangentIn.x * curveWidth;
      const inY = height - padding - selectedKeyframe.tangentIn.y * curveHeight;
      ctx.beginPath();
      ctx.arc(inX, inY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Out tangent
      const outX = padding + selectedKeyframe.tangentOut.x * curveWidth;
      const outY = height - padding - selectedKeyframe.tangentOut.y * curveHeight;
      ctx.beginPath();
      ctx.arc(outX, outY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw lines to control points
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(inX, inY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(width - padding, padding);
      ctx.lineTo(outX, outY);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }

    // Draw start and end points
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(padding, height - padding, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width - padding, padding, 6, 0, Math.PI * 2);
    ctx.fill();
  }, [selectedKeyframe]);

  const applyEasing = (t: number, easing: string): number => {
    switch (easing) {
      case 'linear': return t;
      case 'ease-in': return t * t;
      case 'ease-out': return 1 - (1 - t) * (1 - t);
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'bounce': return 1 - Math.pow(1 - t, 3) * Math.abs(Math.cos(t * Math.PI * 3.5));
      case 'elastic': return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
      default: return t;
    }
  };

  // Update selected keyframes
  const updateKeyframes = useCallback((updates: Partial<Keyframe>) => {
    selectedKeyframes.forEach(keyframeId => {
      onKeyframeUpdate(keyframeId, updates);
    });
  }, [selectedKeyframes, onKeyframeUpdate]);

  // Canvas interaction handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedKeyframe || selectedKeyframe.interpolation !== 'cubic') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking near control points
    const padding = 20;
    const curveWidth = canvas.width - padding * 2;
    const curveHeight = canvas.height - padding * 2;
    
    if (selectedKeyframe.tangentIn) {
      const inX = padding + selectedKeyframe.tangentIn.x * curveWidth;
      const inY = canvas.height - padding - selectedKeyframe.tangentIn.y * curveHeight;
      
      if (Math.abs(x - inX) < 10 && Math.abs(y - inY) < 10) {
        setIsDragging(true);
        setDragPoint('in');
        return;
      }
    }
    
    if (selectedKeyframe.tangentOut) {
      const outX = padding + selectedKeyframe.tangentOut.x * curveWidth;
      const outY = canvas.height - padding - selectedKeyframe.tangentOut.y * curveHeight;
      
      if (Math.abs(x - outX) < 10 && Math.abs(y - outY) < 10) {
        setIsDragging(true);
        setDragPoint('out');
        return;
      }
    }
  }, [selectedKeyframe]);

  React.useEffect(() => {
    drawCurve();
  }, [drawCurve]);

  if (selectedKeyframes.length === 0) {
    return (
      <Card className="h-64 bg-crd-dark border-crd-border border-t-0 flex items-center justify-center">
        <div className="text-center text-crd-text-secondary">
          <p>Select keyframes to edit their curves</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-64 bg-crd-dark border-crd-border border-t-0">
      <div className="flex h-full">
        {/* Controls Panel */}
        <div className="w-64 border-r border-crd-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Keyframe Editor</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-crd-text-secondary mb-1 block">Easing</label>
              <Select
                value={selectedKeyframe?.easing || 'ease-in-out'}
                onValueChange={(value) => updateKeyframes({ easing: value as any })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {easingPresets.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-crd-text-secondary mb-1 block">Interpolation</label>
              <Select
                value={selectedKeyframe?.interpolation || 'cubic'}
                onValueChange={(value) => updateKeyframes({ interpolation: value as any })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {interpolationModes.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-crd-text-secondary mb-1 block">
                Time: {selectedKeyframe?.time.toFixed(2)}s
              </label>
              <Slider
                value={[selectedKeyframe?.time || 0]}
                onValueChange={([value]) => updateKeyframes({ time: value })}
                min={0}
                max={10}
                step={0.01}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs text-crd-text-secondary mb-1 block">
                Value: {typeof selectedKeyframe?.value === 'number' ? selectedKeyframe.value.toFixed(2) : selectedKeyframe?.value}
              </label>
              {typeof selectedKeyframe?.value === 'number' && (
                <Slider
                  value={[selectedKeyframe.value]}
                  onValueChange={([value]) => updateKeyframes({ value })}
                  min={-100}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 flex-1"
                onClick={() => {
                  // Reset to default easing
                  updateKeyframes({
                    easing: 'ease-in-out',
                    interpolation: 'cubic',
                    tangentIn: { x: 0.25, y: 0.25 },
                    tangentOut: { x: 0.75, y: 0.75 }
                  });
                }}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Curve Visualization */}
        <div className="flex-1 p-4">
          <div className="text-xs text-crd-text-secondary mb-2">
            Curve Preview {selectedKeyframes.length > 1 && `(${selectedKeyframes.length} keyframes)`}
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="border border-crd-border rounded bg-crd-darkest cursor-crosshair"
            onMouseDown={handleCanvasMouseDown}
          />
          <div className="text-xs text-crd-text-secondary mt-2">
            {selectedKeyframe?.interpolation === 'cubic' 
              ? 'Drag the yellow control points to adjust the curve'
              : 'Switch to Cubic interpolation to edit curve handles'
            }
          </div>
        </div>
      </div>
    </Card>
  );
};