
import React from 'react';
import { Link } from 'react-router-dom';
import { StorageDebugPanel } from '@/components/debug/StorageDebugPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileImage, Layers, Zap, Wrench } from 'lucide-react';

const Debug = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Debug & Development Tools</h1>
        <p className="text-muted-foreground">
          Access various development and debugging tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Unified PSD Studio */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>PSD Studio (Unified)</CardTitle>
            </div>
            <CardDescription>
              Complete PSD analysis and processing studio with beginner, advanced, and bulk modes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/debug/psd-studio">
              <Button className="w-full">
                Launch PSD Studio
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Legacy PSD Tools */}
        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileImage className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-muted-foreground">Simple PSD Preview</CardTitle>
            </div>
            <CardDescription>
              Legacy simple PSD analysis tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/debug/psd-preview">
              <Button variant="outline" className="w-full">
                Open Legacy Tool
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-muted-foreground">Advanced PSD Preview</CardTitle>
            </div>
            <CardDescription>
              Legacy advanced PSD analysis tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/debug/psd-preview-advanced">
              <Button variant="outline" className="w-full">
                Open Legacy Tool
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-muted-foreground">Bulk PSD Analysis</CardTitle>
            </div>
            <CardDescription>
              Legacy bulk PSD processing tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/debug/bulk-psd-analysis">
              <Button variant="outline" className="w-full">
                Open Legacy Tool
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Storage Debug Panel */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Storage Debug</h2>
        <StorageDebugPanel />
      </div>
    </div>
  );
};

export default Debug;
