import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileImage, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { unifiedPSDService } from '@/services/psdProcessor/unifiedPsdService';
import { toast } from 'sonner';
import type { EnhancedProcessedPSD } from '@/services/psdProcessor/enhancedPsdProcessingService';

interface PSDUploadZoneProps {
  onPSDProcessed: (processedPSD: EnhancedProcessedPSD) => void;
}

export const PSDUploadZone: React.FC<PSDUploadZoneProps> = ({ onPSDProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const processPSDFile = useCallback(async (file: File) => {
    setCurrentFile(file);
    setIsProcessing(true);
    setUploadProgress(10);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const processedPSD = await unifiedPSDService.processPSDFile(file, {
        extractImages: true,
        generateThumbnails: true,
        maxLayerSize: 2048
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Brief delay to show completion
      setTimeout(() => {
        onPSDProcessed(processedPSD);
        toast.success(`Successfully processed ${file.name}`);
        setIsProcessing(false);
        setUploadProgress(0);
        setCurrentFile(null);
      }, 500);

    } catch (error) {
      console.error('PSD processing failed:', error);
      toast.error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
      setUploadProgress(0);
      setCurrentFile(null);
    }
  }, [onPSDProcessed]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processPSDFile(file);
    }
  }, [processPSDFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/psd': ['.psd'],
      'application/octet-stream': ['.psd']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  if (isProcessing) {
    return (
      <Card className="border-2 border-dashed border-crd-blue/50 bg-gradient-to-br from-crd-blue/5 to-crd-green/5">
        <CardContent className="p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-12 h-12 text-crd-blue animate-spin" />
            </div>
            
            <h3 className="text-xl font-semibold text-foreground">
              Processing PSD File
            </h3>
            
            <p className="text-muted-foreground">
              Extracting layers and analyzing design from {currentFile?.name}...
            </p>
            
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {uploadProgress}% complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-muted-foreground/30 hover:border-crd-orange/50 transition-colors">
      <CardContent className="p-8">
        <div {...getRootProps()} className="cursor-pointer">
          <input {...getInputProps()} />
          
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              {isDragActive ? (
                <div className="p-4 bg-crd-orange/20 rounded-full">
                  <Upload className="w-12 h-12 text-crd-orange" />
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-br from-crd-blue/20 to-crd-green/20 rounded-full">
                  <FileImage className="w-12 h-12 text-crd-blue" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isDragActive ? 'Drop your PSD file here' : 'Upload PSD File'}
              </h3>
              <p className="text-muted-foreground">
                Turn your existing card designs into CRD frames
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Button 
                variant="outline" 
                className="border-crd-blue hover:bg-crd-blue/10"
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose PSD File
              </Button>
              <p className="text-sm text-muted-foreground">
                Supports .psd files up to 50MB
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-crd-green" />
                Layer extraction
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-crd-green" />
                Smart frame detection
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-crd-green" />
                Element conversion
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};