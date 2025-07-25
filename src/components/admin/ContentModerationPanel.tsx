import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Flag, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  User,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserRole {
  role: 'admin' | 'moderator' | 'creator' | 'user';
}

interface FlaggedContent {
  id: string;
  card_id: string;
  card_title: string;
  card_image_url: string;
  reporter_id: string;
  reporter_name: string;
  flag_reason: string;
  flag_details: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  created_at: string;
  creator_name: string;
  creator_id: string;
}

export const ContentModerationPanel: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<FlaggedContent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState<string[]>([]);

  const itemsPerPage = 10;

  useEffect(() => {
    loadFlaggedContent();
  }, []);

  const loadFlaggedContent = async () => {
    setLoading(true);
    try {
      // Since we don't have a flags table yet, we'll create mock data
      // In a real implementation, this would query a content_flags table
      const mockFlaggedContent: FlaggedContent[] = [
        {
          id: '1',
          card_id: 'card-1',
          card_title: 'Controversial Sports Card',
          card_image_url: '/api/placeholder/300/400',
          reporter_id: 'user-1',
          reporter_name: 'John Reporter',
          flag_reason: 'inappropriate_content',
          flag_details: 'Contains offensive language in description',
          status: 'pending',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          creator_name: 'CardMaker123',
          creator_id: 'creator-1'
        },
        {
          id: '2',
          card_id: 'card-2',
          card_title: 'Fake Celebrity Card',
          card_image_url: '/api/placeholder/300/400',
          reporter_id: 'user-2',
          reporter_name: 'Jane Watchdog',
          flag_reason: 'copyright_violation',
          flag_details: 'Uses copyrighted celebrity image without permission',
          status: 'pending',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          creator_name: 'FakeCards',
          creator_id: 'creator-2'
        },
        {
          id: '3',
          card_id: 'card-3',
          card_title: 'Spam Card #47',
          card_image_url: '/api/placeholder/300/400',
          reporter_id: 'user-3',
          reporter_name: 'Community Mod',
          flag_reason: 'spam',
          flag_details: 'Part of mass spam campaign',
          status: 'escalated',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          creator_name: 'SpamBot99',
          creator_id: 'creator-3'
        }
      ];

      setFlaggedContent(mockFlaggedContent);
    } catch (error) {
      console.error('Failed to load flagged content:', error);
      toast.error('Failed to load flagged content');
    }
    setLoading(false);
  };

  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredContent.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'escalate') => {
    if (selectedItems.length === 0) return;

    setProcessing(selectedItems);
    try {
      // In a real implementation, this would update the database
      setFlaggedContent(prev => prev.map(item => 
        selectedItems.includes(item.id) 
          ? { ...item, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'escalated' }
          : item
      ));

      toast.success(`${selectedItems.length} items ${action}d successfully`);
      setSelectedItems([]);
    } catch (error) {
      toast.error(`Failed to ${action} selected items`);
    }
    setProcessing([]);
  };

  const handleSingleAction = async (itemId: string, action: 'approve' | 'reject' | 'escalate') => {
    setProcessing([itemId]);
    try {
      setFlaggedContent(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'escalated' }
          : item
      ));

      toast.success(`Content ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} content`);
    }
    setProcessing(prev => prev.filter(id => id !== itemId));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: 'Pending', color: 'text-crd-orange' },
      approved: { variant: 'default' as const, text: 'Approved', color: 'text-crd-green' },
      rejected: { variant: 'destructive' as const, text: 'Rejected', color: 'text-red-400' },
      escalated: { variant: 'outline' as const, text: 'Escalated', color: 'text-crd-blue' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge variant={config.variant} className={`${config.color} border-current`}>
        {config.text}
      </Badge>
    );
  };

  const getReasonDisplay = (reason: string) => {
    const reasons = {
      inappropriate_content: 'Inappropriate Content',
      copyright_violation: 'Copyright Violation',
      spam: 'Spam',
      fake_content: 'Fake Content',
      harassment: 'Harassment',
      other: 'Other'
    };
    return reasons[reason as keyof typeof reasons] || reason;
  };

  const filteredContent = flaggedContent.filter(item => {
    const matchesSearch = item.card_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.creator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.reporter_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesReason = reasonFilter === 'all' || item.flag_reason === reasonFilter;
    
    return matchesSearch && matchesStatus && matchesReason;
  });

  const paginatedContent = filteredContent.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-crd-white">Content Moderation</h2>
          <p className="text-crd-lightGray">Review and manage flagged content</p>
        </div>
        <Button 
          onClick={loadFlaggedContent}
          variant="outline"
          className="bg-crd-black border-crd-border text-crd-white hover:bg-crd-surface"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-crd-black border-crd-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-crd-lightGray w-4 h-4" />
                <Input
                  placeholder="Search by card title, creator, or reporter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-crd-surface border-crd-border text-crd-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-crd-surface border-crd-border text-crd-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-crd-surface border-crd-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-crd-surface border-crd-border text-crd-white">
                <SelectValue placeholder="Reason" />
              </SelectTrigger>
              <SelectContent className="bg-crd-surface border-crd-border">
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="inappropriate_content">Inappropriate</SelectItem>
                <SelectItem value="copyright_violation">Copyright</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="fake_content">Fake Content</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card className="bg-crd-black border-crd-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-crd-white">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleBulkAction('approve')}
                  className="bg-crd-green hover:bg-crd-green/80"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleBulkAction('reject')}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                {userRole.role === 'admin' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('escalate')}
                    className="border-crd-blue text-crd-blue hover:bg-crd-blue/10"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Escalate
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Table */}
      <Card className="bg-crd-black border-crd-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-crd-border">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === filteredContent.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-crd-lightGray">Card</TableHead>
                <TableHead className="text-crd-lightGray">Flag Reason</TableHead>
                <TableHead className="text-crd-lightGray">Reporter</TableHead>
                <TableHead className="text-crd-lightGray">Status</TableHead>
                <TableHead className="text-crd-lightGray">Date</TableHead>
                <TableHead className="text-crd-lightGray">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-crd-border">
                    <TableCell colSpan={7}>
                      <div className="flex items-center space-x-4 p-4">
                        <div className="w-16 h-20 bg-crd-surface rounded animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-crd-surface rounded animate-pulse" />
                          <div className="h-3 bg-crd-surface rounded animate-pulse w-2/3" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                paginatedContent.map((item) => (
                  <TableRow key={item.id} className="border-crd-border">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleItemSelection(item.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.card_image_url} 
                          alt={item.card_title}
                          className="w-12 h-16 object-cover rounded border border-crd-border"
                        />
                        <div>
                          <p className="text-crd-white font-medium">{item.card_title}</p>
                          <p className="text-crd-lightGray text-sm">by {item.creator_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-crd-white">{getReasonDisplay(item.flag_reason)}</p>
                        <p className="text-crd-lightGray text-xs truncate max-w-32" title={item.flag_details}>
                          {item.flag_details}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-crd-lightGray" />
                        <span className="text-crd-white text-sm">{item.reporter_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-crd-lightGray text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewItem(item)}
                          className="text-crd-blue hover:bg-crd-surface"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSingleAction(item.id, 'approve')}
                              disabled={processing.includes(item.id)}
                              className="bg-crd-green hover:bg-crd-green/80 text-white"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSingleAction(item.id, 'reject')}
                              disabled={processing.includes(item.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-crd-border">
              <p className="text-crd-lightGray text-sm">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredContent.length)} of {filteredContent.length} results
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-crd-black border-crd-border text-crd-white hover:bg-crd-surface"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-crd-black border-crd-border text-crd-white hover:bg-crd-surface"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="bg-crd-black border-crd-border text-crd-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Content Review</DialogTitle>
            <DialogDescription className="text-crd-lightGray">
              Review flagged content details and make moderation decision
            </DialogDescription>
          </DialogHeader>
          
          {previewItem && (
            <div className="space-y-6">
              <div className="flex gap-6">
                <img 
                  src={previewItem.card_image_url}
                  alt={previewItem.card_title}
                  className="w-48 h-64 object-cover rounded-lg border border-crd-border"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-crd-white">{previewItem.card_title}</h3>
                    <p className="text-crd-lightGray">Created by {previewItem.creator_name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-crd-white">Flag Details</h4>
                    <div className="bg-crd-surface p-3 rounded-lg">
                      <p className="text-sm text-crd-white mb-1">
                        <strong>Reason:</strong> {getReasonDisplay(previewItem.flag_reason)}
                      </p>
                      <p className="text-sm text-crd-lightGray">
                        <strong>Details:</strong> {previewItem.flag_details}
                      </p>
                      <p className="text-sm text-crd-lightGray mt-2">
                        <strong>Reported by:</strong> {previewItem.reporter_name} on {new Date(previewItem.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        handleSingleAction(previewItem.id, 'approve');
                        setPreviewItem(null);
                      }}
                      className="bg-crd-green hover:bg-crd-green/80"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleSingleAction(previewItem.id, 'reject');
                        setPreviewItem(null);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    {userRole.role === 'admin' && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleSingleAction(previewItem.id, 'escalate');
                          setPreviewItem(null);
                        }}
                        className="border-crd-blue text-crd-blue hover:bg-crd-blue/10"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Escalate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};