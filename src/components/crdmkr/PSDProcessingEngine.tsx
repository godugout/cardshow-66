// Professional PSD Processing Engine for CRDMKR
import React, { useState, useCallback } from 'react';
import { unifiedPSDService } from '@/services/psdProcessor/unifiedPsdService';
import { EnhancedProcessedPSD } from '@/services/psdProcessor/enhancedPsdProcessingService';
import { Upload, FileCheck, AlertCircle, Clock } from 'lucide-react';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PSDProcessingEngineProps {
  onPSDProcessed: (file: File, fileName: string) => Promise<void>;
  maxFileSize?: number; // in MB
  className?: string;
}

interface ProcessingState {
  status: 'idle' | 'processing' | 'success' | 'error';
  fileName: string;
  progress: number;
  message: string;
  timeElapsed: number;
}

export const PSDProcessingEngine: React.FC<PSDProcessingEngineProps> = ({
  onPSDProcessed,
  maxFileSize = 50,
  className
}) => {
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    fileName: '',
    progress: 0,
    message: '',
    timeElapsed: 0
  });

  const [dragActive, setDragActive] = useState(false);

  const validatePSDFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.psd') && !file.type.includes('photoshop')) {
      return { valid: false, error: 'Please upload a valid PSD file' };
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return { valid: false, error: `File size exceeds ${maxFileSize}MB limit` };
    }

    return { valid: true };
  };

  const processPSDFile = useCallback(async (file: File) => {
    const validation = validatePSDFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const startTime = Date.now();
    setProcessing({
      status: 'processing',
      fileName: file.name,
      progress: 0,
      message: 'Initializing PSD parser...',
      timeElapsed: 0
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessing(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
          timeElapsed: Date.now() - startTime,
          message: getProgressMessage(prev.progress)
        }));
      }, 500);

      // Process the PSD file - call the callback with the file
      await onPSDProcessed(file, file.name);

      clearInterval(progressInterval);

      setProcessing({
        status: 'success',
        fileName: file.name,
        progress: 100,
        message: 'Processing complete!',
        timeElapsed: Date.now() - startTime
      });
      
      toast.success(`PSD processed successfully in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    } catch (error) {
      setProcessing(prev => ({
        ...prev,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to process PSD file',
        timeElapsed: Date.now() - startTime
      }));
      
      toast.error('Failed to process PSD file');
      console.error('PSD processing error:', error);
    }
  }, [onPSDProcessed, maxFileSize]);

  const getProgressMessage = (progress: number): string => {
    if (progress < 20) return 'Reading PSD file structure...';
    if (progress < 40) return 'Extracting layer hierarchy...';
    if (progress < 60) return 'Processing layer images...';
    if (progress < 80) return 'Generating thumbnails...';
    if (progress < 95) return 'Analyzing layer content...';
    return 'Finalizing processing...';
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processPSDFile(files[0]);
    }
  }, [processPSDFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processPSDFile(files[0]);
    }
  }, [processPSDFile]);

  const formatTime = (ms: number): string => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <CRDCard className={cn("p-8", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          dragActive ? "border-crd-orange bg-crd-orange/5" : "border-crd-border",
          processing.status === 'processing' && "border-crd-blue bg-crd-blue/5",
          processing.status === 'success' && "border-crd-green bg-crd-green/5",
          processing.status === 'error' && "border-red-500 bg-red-500/5"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
      >
        {processing.status === 'idle' && (
          <>
            <Upload className="w-16 h-16 text-crd-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-crd-text mb-2">
              Drop your PSD file here
            </h3>
            <p className="text-crd-text-dim mb-6">
              Supports complex PSDs with layers, groups, and text elements
            </p>
            <p className="text-sm text-crd-text-muted mb-6">
              Max file size: {maxFileSize}MB • Supports PSD format
            </p>
            
            <input
              type="file"
              accept=".psd,application/photoshop"
              onChange={handleFileInput}
              className="hidden"
              id="psd-file-input"
            />
            
            <CRDButton
              variant="orange"
              size="lg"
              onClick={() => document.getElementById('psd-file-input')?.click()}
            >
              Choose PSD File
            </CRDButton>
          </>
        )}

        {processing.status === 'processing' && (
          <>
            <Clock className="w-16 h-16 text-crd-blue mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-crd-text mb-2">
              Processing {processing.fileName}
            </h3>
            
            <div className="w-full bg-crd-surface rounded-full h-2 mb-4">
              <div 
                className="bg-crd-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${processing.progress}%` }}
              />
            </div>
            
            <p className="text-crd-text-dim mb-2">{processing.message}</p>
            <p className="text-sm text-crd-text-muted">
              {processing.progress}% • {formatTime(processing.timeElapsed)} elapsed
            </p>
          </>
        )}

        {processing.status === 'success' && (
          <>
            <FileCheck className="w-16 h-16 text-crd-green mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-crd-text mb-2">
              Processing Complete!
            </h3>
            <p className="text-crd-text-dim mb-2">
              {processing.fileName} processed successfully
            </p>
            <p className="text-sm text-crd-text-muted">
              Total time: {formatTime(processing.timeElapsed)}
            </p>
          </>
        )}

        {processing.status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-crd-text mb-2">
              Processing Failed
            </h3>
            <p className="text-red-400 mb-4">{processing.message}</p>
            <CRDButton
              variant="orange"
              onClick={() => setProcessing({ status: 'idle', fileName: '', progress: 0, message: '', timeElapsed: 0 })}
            >
              Try Again
            </CRDButton>
          </>
        )}
      </div>

      {/* Technical Capabilities */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="text-center">
          <div className="w-10 h-10 bg-crd-surface rounded-lg mx-auto mb-3 flex items-center justify-center">
            <span className="text-xs font-bold text-crd-orange">50+</span>
          </div>
          <h4 className="font-medium text-crd-text mb-1">Layer Support</h4>
          <p className="text-xs text-crd-text-dim">Complex PSDs with nested groups</p>
        </div>
        
        <div className="text-center">
          <div className="w-10 h-10 bg-crd-surface rounded-lg mx-auto mb-3 flex items-center justify-center">
            <span className="text-xs font-bold text-crd-orange">&lt;5s</span>
          </div>
          <h4 className="font-medium text-crd-text mb-1">Fast Processing</h4>
          <p className="text-xs text-crd-text-dim">High-performance parsing engine</p>
        </div>
        
        <div className="text-center">
          <div className="w-10 h-10 bg-crd-surface rounded-lg mx-auto mb-3 flex items-center justify-center">
            <span className="text-xs font-bold text-crd-orange">AI</span>
          </div>
          <h4 className="font-medium text-crd-text mb-1">Smart Analysis</h4>
          <p className="text-xs text-crd-text-dim">Automatic layer categorization</p>
        </div>
      </div>
    </CRDCard>
  );
};