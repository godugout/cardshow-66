import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Ban, 
  Clock, 
  Shield, 
  Trash2,
  User,
  Calendar,
  Flag
} from 'lucide-react';
import { toast } from 'sonner';

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

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  flaggedItem: FlaggedItem;
  onReviewComplete: (flagId: string) => void;
}

type ReviewAction = 
  | 'dismiss' 
  | 'remove_content' 
  | 'suspend_user_24h' 
  | 'suspend_user_7d' 
  | 'permanent_ban';

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  flaggedItem,
  onReviewComplete
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ReviewAction | null>(null);

  const actionOptions = [
    {
      id: 'dismiss' as ReviewAction,
      label: 'Dismiss Flag',
      description: 'Mark this flag as resolved without taking action',
      icon: Shield,
      severity: 'low',
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      id: 'remove_content' as ReviewAction,
      label: 'Remove Content',
      description: 'Delete the flagged content from the platform',
      icon: Trash2,
      severity: 'medium',
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    {
      id: 'suspend_user_24h' as ReviewAction,
      label: 'Suspend User (24 hours)',
      description: 'Temporarily suspend the user for 24 hours',
      icon: Clock,
      severity: 'medium',
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    {
      id: 'suspend_user_7d' as ReviewAction,
      label: 'Suspend User (7 days)',
      description: 'Suspend the user for 7 days',
      icon: Ban,
      severity: 'high',
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    {
      id: 'permanent_ban' as ReviewAction,
      label: 'Permanent Ban',
      description: 'Permanently ban the user from the platform',
      icon: AlertTriangle,
      severity: 'critical',
      color: 'text-red-600 bg-red-100 border-red-300'
    }
  ];

  const handleSubmit = async () => {
    if (!selectedAction) {
      toast.error('Please select an action');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const actionLabel = actionOptions.find(a => a.id === selectedAction)?.label;
      toast.success(`Action completed: ${actionLabel}`);
      
      onReviewComplete(flaggedItem.flagId);
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to complete action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            Review Flagged Content
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flagged Content Details */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{flaggedItem.contentType}</Badge>
                      <Badge className={getSeverityColor(flaggedItem.severity)}>
                        {flaggedItem.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Content ID: {flaggedItem.contentId}
                    </p>
                  </div>
                  
                  {flaggedItem.contentType === 'Card' && flaggedItem.contentPreview && (
                    <img 
                      src={flaggedItem.contentPreview} 
                      alt="Content preview"
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Flagged by:</span>
                    <span className="font-medium">{flaggedItem.flaggedByUser}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{formatDate(flaggedItem.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reason for flag:</p>
                  <p className="font-medium">{flaggedItem.reason}</p>
                </div>

                {flaggedItem.contentType !== 'Card' && flaggedItem.contentPreview && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Content preview:</p>
                    <div className="bg-muted p-3 rounded text-sm">
                      {flaggedItem.contentPreview}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Action</h3>
            <div className="space-y-3">
              {actionOptions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card 
                    key={action.id}
                    className={`cursor-pointer transition-all ${
                      selectedAction === action.id 
                        ? 'ring-2 ring-orange-500 border-orange-300' 
                        : 'hover:border-border'
                    }`}
                    onClick={() => setSelectedAction(action.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{action.label}</h4>
                            {selectedAction === action.id && (
                              <Badge variant="default" className="bg-orange-500">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedAction || isSubmitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Action'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};