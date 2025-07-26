import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Flag, 
  Eye, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewModal } from './ReviewModal';

interface FlaggedItem {
  flagId: string;
  contentId: string;
  contentType: 'Card' | 'Comment' | 'Profile';
  reason: string;
  flaggedByUser: string;
  contentPreview?: string;
  createdAt: string;
  severity: 'low' | 'medium' | 'high';
}

interface UserRole {
  role: 'admin' | 'moderator' | 'creator' | 'user';
}

interface ContentModerationPanelProps {
  userRole: UserRole;
}

export const ContentModerationPanel: React.FC<ContentModerationPanelProps> = ({ userRole }) => {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FlaggedItem | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchFlaggedItems();
  }, []);

  const fetchFlaggedItems = async () => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      // Mock data
      const mockFlags: FlaggedItem[] = [
        {
          flagId: '1',
          contentId: 'card_001',
          contentType: 'Card',
          reason: 'Inappropriate content',
          flaggedByUser: 'user_123',
          contentPreview: '/placeholder.svg',
          createdAt: new Date().toISOString(),
          severity: 'high'
        },
        {
          flagId: '2',
          contentId: 'comment_002',
          contentType: 'Comment',
          reason: 'Spam',
          flaggedByUser: 'user_456',
          contentPreview: 'This is a spam comment...',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          severity: 'medium'
        },
        {
          flagId: '3',
          contentId: 'profile_003',
          contentType: 'Profile',
          reason: 'Fake profile',
          flaggedByUser: 'user_789',
          contentPreview: 'Suspicious profile activity',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          severity: 'low'
        }
      ];
      
      setFlaggedItems(mockFlags);
    } catch (error) {
      console.error('Failed to fetch flagged items:', error);
      toast.error('Failed to load flagged content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async (flagId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFlaggedItems(prev => prev.filter(item => item.flagId !== flagId));
      toast.success('Flag dismissed successfully');
    } catch (error) {
      console.error('Failed to dismiss flag:', error);
      toast.error('Failed to dismiss flag');
    }
  };

  const handleTakeAction = (item: FlaggedItem) => {
    setSelectedItem(item);
    setShowReviewModal(true);
  };

  const handleReviewComplete = (flagId: string) => {
    setFlaggedItems(prev => prev.filter(item => item.flagId !== flagId));
    setShowReviewModal(false);
    setSelectedItem(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Flag className="w-4 h-4" />;
      case 'low': return <Clock className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Content Moderation</h2>
          <p className="text-muted-foreground">Review and act on flagged content</p>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Content Moderation</h2>
          <p className="text-muted-foreground">
            Review and take action on user-flagged content
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            {flaggedItems.length} pending
          </Badge>
          <Button 
            onClick={fetchFlaggedItems}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-xl font-bold">{flaggedItems.filter(i => i.severity === 'high').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Medium Priority</p>
                <p className="text-xl font-bold">{flaggedItems.filter(i => i.severity === 'medium').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Low Priority</p>
                <p className="text-xl font-bold">{flaggedItems.filter(i => i.severity === 'low').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Flags</p>
                <p className="text-xl font-bold">{flaggedItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Content Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Flagged Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          {flaggedItems.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
              <p className="text-muted-foreground">No flagged content to review at this time.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content Preview</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Flagged By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedItems.map((item) => (
                  <TableRow key={item.flagId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.contentType === 'Card' ? (
                          <img 
                            src={item.contentPreview || '/placeholder.svg'} 
                            alt="Content preview"
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Eye className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="max-w-[200px]">
                          <p className="text-sm font-medium truncate">
                            {item.contentType === 'Card' ? 'Card Content' : item.contentPreview}
                          </p>
                          <p className="text-xs text-muted-foreground">ID: {item.contentId}</p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">{item.contentType}</Badge>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">{item.reason}</span>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getSeverityColor(item.severity)}>
                        {getSeverityIcon(item.severity)}
                        <span className="ml-1 capitalize">{item.severity}</span>
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{item.flaggedByUser}</span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismiss(item.flagId)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTakeAction(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Take Action
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedItem && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          flaggedItem={selectedItem}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </div>
  );
};