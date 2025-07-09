import React, { memo } from 'react';
import { CRDModal } from '@/components/ui/design-system';
import { CRDButton } from '@/components/ui/design-system';
import { 
  Edit3, 
  Share2, 
  Eye, 
  Heart, 
  Calendar, 
  Tag, 
  Globe, 
  Lock,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Card {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  category?: string;
  tags?: string[];
  current_case?: string;
  views_count?: number;
  like_count?: number;
  is_public?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface CardDetailModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  isOwner?: boolean;
}

export const CardDetailModal = memo<CardDetailModalProps>(({
  card,
  isOpen,
  onClose,
  isOwner = false
}) => {
  const { toast } = useToast();

  if (!card) return null;

  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    toast({
      title: "Edit Feature",
      description: "Card editing will be available soon!",
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: card.title,
          text: card.description || `Check out this card: ${card.title}`,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Card link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        variant: "destructive",
        title: "Share failed",
        description: "Unable to share the card. Please try again.",
      });
    }
  };

  const handleDownload = () => {
    if (card.image_url) {
      const link = document.createElement('a');
      link.href = card.image_url;
      link.download = `${card.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const caseDisplayName = card.current_case?.replace('-', ' ') || 'penny sleeve';

  return (
    <CRDModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      showCloseButton={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="aspect-[3/4] relative bg-muted rounded-lg overflow-hidden">
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={card.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="w-24 h-24 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">🃏</span>
                </div>
              </div>
            )}

            {/* Case overlay */}
            <div className="absolute inset-0 border-4 rounded-lg pointer-events-none" 
                 style={{
                   borderColor: card.current_case === 'premium' ? '#FF6B4A' : 
                               card.current_case === 'graded-slab' ? '#fbbf24' :
                               card.current_case === 'magnetic' ? '#a855f7' :
                               card.current_case === 'top-loader' ? '#3b82f6' : '#9ca3af'
                 }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isOwner && (
              <CRDButton
                variant="outline"
                onClick={handleEdit}
                icon={<Edit3 className="w-4 h-4" />}
                className="flex-1"
              >
                Edit
              </CRDButton>
            )}
            <CRDButton
              variant="outline"
              onClick={handleShare}
              icon={<Share2 className="w-4 h-4" />}
              className="flex-1"
            >
              Share
            </CRDButton>
            {card.image_url && (
              <CRDButton
                variant="outline"
                onClick={handleDownload}
                icon={<Download className="w-4 h-4" />}
                className="flex-1"
              >
                Download
              </CRDButton>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{card.title}</h2>
            {card.description && (
              <p className="text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{card.views_count || 0} views</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="w-4 h-4" />
              <span>{card.like_count || 0} likes</span>
            </div>
            <div className="flex items-center gap-2">
              {card.is_public ? (
                <>
                  <Globe className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500">Private</span>
                </>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            {/* Case */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Case Type</h4>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm capitalize">
                {caseDisplayName}
              </div>
            </div>

            {/* Category */}
            {card.category && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Category</h4>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
                  <Tag className="w-3 h-3" />
                  {card.category}
                </div>
              </div>
            )}

            {/* Tags */}
            {card.tags && card.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            {card.created_at && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Created</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(card.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CRDModal>
  );
});

CardDetailModal.displayName = 'CardDetailModal';