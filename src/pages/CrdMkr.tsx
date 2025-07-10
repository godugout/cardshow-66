import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CardCreationInterface } from '@/components/cardmaker/CardCreationInterface';
import { CardGrid } from '@/components/cardmaker/CardGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Grid3X3, FolderOpen, Settings } from 'lucide-react';

export default function CrdMkr() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Card Maker Studio
            </h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your digital trading cards with professional-grade tools.
            </p>
          </div>

          {/* Main Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Collections
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-6">
              <CardCreationInterface />
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <CardGrid />
            </TabsContent>

            <TabsContent value="collections" className="mt-6">
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Collections</h3>
                <p className="text-muted-foreground">Organize your cards into collections</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="text-center py-12">
                <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Settings</h3>
                <p className="text-muted-foreground">Configure your card maker preferences</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}