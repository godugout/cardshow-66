import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { unifiedPSDService } from '@/services/psdProcessor/unifiedPsdService';
import { EnhancedProcessedPSD } from '@/services/psdProcessor/enhancedPsdProcessingService';
import { Upload, FileImage, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface PSDStudioUploadZoneProps {
  mode: 'beginner' | 'advanced' | 'bulk';
  onFilesProcessed: (files: EnhancedProcessedPSD[]) => void;
}

interface ProcessingFile {
  file: File;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: EnhancedProcessedPSD;
  error?: string;
}

export const PSDStudioUploadZone: React.FC<PSDStudioUploadZoneProps> = ({
  mode,
  onFilesProcessed
}) => {
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File, index: number) => {
    try {
      // Update status to processing
      setProcessingFiles(prev => prev.map((pf, i) => 
        i === index ? { ...pf, status: 'processing' as const, progress: 10 } : pf
      ));

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingFiles(prev => prev.map((pf, i) => 
          i === index && pf.progress < 90 
            ? { ...pf, progress: pf.progress + Math.random() * 20 }
            : pf
        ));
      }, 200);

      // Process the PSD
      const result = await unifiedPSDService.processPSDFile(file);

      clearInterval(progressInterval);

      // Update with completed result
      setProcessingFiles(prev => prev.map((pf, i) => 
        i === index 
          ? { ...pf, status: 'completed' as const, progress: 100, result }
          : pf
      ));

    } catch (error) {
      console.error('Error processing PSD:', error);
      setProcessingFiles(prev => prev.map((pf, i) => 
        i === index 
          ? { 
              ...pf, 
              status: 'error' as const, 
              progress: 0, 
              error: error instanceof Error ? error.message : 'Processing failed'
            }
          : pf
      ));
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('=== PSD Upload Debug ===');
    console.log('onDrop triggered with files:', acceptedFiles);
    console.log('Mode:', mode);
    console.log('acceptedFiles length:', acceptedFiles.length);
    
    const maxFiles = mode === 'bulk' ? 10 : mode === 'advanced' ? 5 : 1;
    const filesToProcess = acceptedFiles.slice(0, maxFiles);

    console.log('Files to process:', filesToProcess.length);

    // Initialize processing files
    const newProcessingFiles: ProcessingFile[] = filesToProcess.map(file => {
      console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
      return {
        file,
        progress: 0,
        status: 'pending'
      };
    });

    setProcessingFiles(newProcessingFiles);
    setIsProcessing(true);

    console.log('Starting file processing...');

    // Process files
    await Promise.all(
      filesToProcess.map((file, index) => processFile(file, index))
    );

    // Wait a moment for UI, then extract completed results
    setTimeout(() => {
      console.log('Processing completed, extracting results...');
      setProcessingFiles(prev => {
        const completedFiles = prev
          .filter(pf => pf.status === 'completed' && pf.result)
          .map(pf => pf.result!);
        
        console.log('Completed files:', completedFiles.length);
        
        if (completedFiles.length > 0) {
          console.log('Calling onFilesProcessed with:', completedFiles);
          onFilesProcessed(completedFiles);
        }
        
        return prev;
      });
      setIsProcessing(false);
    }, 1000);

  }, [mode, processFile, onFilesProcessed]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/vnd.adobe.photoshop': ['.psd']
    },
    maxFiles: mode === 'bulk' ? 10 : mode === 'advanced' ? 5 : 1,
    disabled: isProcessing
  });

  // Add button click handler to test file picker
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Button clicked, opening file picker...');
    open();
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'beginner':
        return 'Upload a single PSD file for guided analysis';
      case 'advanced':
        return 'Upload up to 5 PSD files for detailed analysis';
      case 'bulk':
        return 'Upload up to 10 PSD files for batch processing';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'beginner':
        return <Sparkles className="w-8 h-8 text-crd-green" />;
      case 'advanced':
        return <FileImage className="w-8 h-8 text-crd-blue" />;
      case 'bulk':
        return <Upload className="w-8 h-8 text-crd-orange" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-crd-green bg-gradient-to-br from-crd-green/10 to-crd-blue/5 scale-105'
            : isProcessing
            ? 'border-border/50 cursor-not-allowed'
            : 'hover:border-crd-green/50 hover:bg-gradient-to-br hover:from-card/80 hover:to-muted/20'
        }`}
      >
        <input {...getInputProps()} />
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-crd-green/5 to-crd-blue/5 opacity-50" />
        
        <div className="relative p-12 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-background to-muted rounded-2xl flex items-center justify-center shadow-lg">
            {getModeIcon()}
          </div>

          {/* Content */}
          <h3 className="text-2xl font-semibold mb-3">
            {isDragActive ? 'Drop your PSD files here' : 'Upload PSD Files'}
          </h3>
          
          <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            {getModeDescription()}
          </p>

          {/* Action Button */}
          <Button
            size="lg"
            className="bg-gradient-to-r from-crd-green to-crd-blue hover:from-crd-green/90 hover:to-crd-blue/90 text-white"
            disabled={isProcessing}
            onClick={handleButtonClick}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </>
            )}
          </Button>

          {/* Format info */}
          <p className="text-xs text-muted-foreground mt-4">
            Supports .psd files up to 100MB each
          </p>
        </div>
      </Card>

      {/* Processing Status */}
      {processingFiles.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-card/80 to-muted/20 backdrop-blur-sm">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-crd-blue" />
            Processing Files
          </h4>
          
          <div className="space-y-4">
            {processingFiles.map((pf, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      pf.status === 'completed' 
                        ? 'bg-crd-green/20 text-crd-green'
                        : pf.status === 'error'
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-crd-blue/20 text-crd-blue'
                    }`}>
                      {pf.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : pf.status === 'error' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <FileImage className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{pf.file.name}</span>
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    {pf.status === 'completed' && '✓ Complete'}
                    {pf.status === 'error' && '✗ Failed'}
                    {pf.status === 'processing' && `${Math.round(pf.progress)}%`}
                    {pf.status === 'pending' && 'Pending...'}
                  </span>
                </div>
                
                {pf.status === 'processing' && (
                  <Progress value={pf.progress} className="h-2" />
                )}
                
                {pf.status === 'error' && pf.error && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded p-2">
                    {pf.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};