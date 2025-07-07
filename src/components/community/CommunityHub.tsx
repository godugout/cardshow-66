import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Users, Trophy, BookOpen, MessageCircle, Activity, Search, 
  Star, Heart, Eye, Calendar, Award, TrendingUp, Zap
} from 'lucide-react';

export const CommunityHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('discover');

  // Fetch creators for discovery tab - simplified to avoid type issues
  const { data: creators = [], isLoading: loadingCreators } = useQuery({
    queryKey: ['community-creators'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, followers_count')
          .order('followers_count', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Supabase error:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('Error fetching creators:', error);
        return [];
      }
    },
  });

  const tabItems = [
    { id: 'discover', label: 'Discover', icon: Users, description: 'Find amazing creators' },
    { id: 'forums', label: 'Forums', icon: MessageCircle, description: 'Join discussions' },
    { id: 'challenges', label: 'Challenges', icon: Trophy, description: 'Compete and win' },
    { id: 'education', label: 'Learn', icon: BookOpen, description: 'Courses & tutorials' },
    { id: 'activity', label: 'Activity', icon: Activity, description: 'Latest updates' },
  ];

  return (
    <div className="min-h-screen bg-crd-darkest">
      {/* Header */}
      <div className="bg-crd-dark border-b border-crd-mediumGray p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-crd-white mb-2">Community Hub</h1>
              <p className="text-xl text-crd-lightGray">
                Connect with creators, learn new skills, and join the community
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-crd-green hover:bg-green-600 text-black">
                <Zap className="w-4 h-4 mr-2" />
                Join Challenge
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crd-lightGray" />
            <Input
              placeholder="Search creators, topics, challenges..."
              className="pl-10 bg-crd-mediumGray border-crd-lightGray text-crd-white placeholder:text-crd-lightGray"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          {/* Navigation */}
          <div className="mb-8">
            <TabsList className="grid grid-cols-5 w-full bg-crd-mediumGray">
              {tabItems.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="flex items-center gap-2 data-[state=active]:bg-crd-green data-[state=active]:text-black"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Discover Tab - Creator Discovery */}
          <TabsContent value="discover" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Featured Creators */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-crd-white">Featured Creators</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-crd-mediumGray text-crd-lightGray">
                      All Categories
                    </Button>
                    <Button variant="outline" size="sm" className="border-crd-mediumGray text-crd-lightGray">
                      Top Rated
                    </Button>
                  </div>
                </div>

                {loadingCreators ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="bg-crd-dark border-crd-mediumGray animate-pulse">
                        <CardContent className="p-6">
                          <div className="w-16 h-16 bg-crd-mediumGray rounded-full mx-auto mb-4"></div>
                          <div className="h-4 bg-crd-mediumGray rounded mb-2"></div>
                          <div className="h-3 bg-crd-mediumGray rounded w-2/3 mx-auto"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creators.length > 0 ? (
                      creators.map((creator) => (
                        <Link key={creator.id} to={`/creators/${creator.id}`}>
                          <Card className="bg-crd-dark border-crd-mediumGray hover:border-crd-green transition-colors group">
                            <CardContent className="p-6 text-center">
                              <Avatar className="w-16 h-16 mx-auto mb-4 border-2 border-crd-mediumGray group-hover:border-crd-green transition-colors">
                                <AvatarImage src={creator.avatar_url} alt={creator.username} />
                                <AvatarFallback className="bg-crd-mediumGray text-crd-white">
                                  {creator.username?.[0]?.toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="space-y-2">
                                <h3 className="font-semibold text-crd-white group-hover:text-crd-green transition-colors">
                                  {creator.username || 'Anonymous Creator'}
                                </h3>
                                
                                <div className="flex items-center justify-center gap-4 text-sm text-crd-lightGray">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{creator.followers_count || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    <span>5.0</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1 justify-center">
                                  <Badge variant="secondary" className="text-xs bg-crd-mediumGray text-crd-lightGray">
                                    Creator
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <Users className="w-16 h-16 text-crd-mediumGray mx-auto mb-4" />
                        <p className="text-crd-lightGray">No creators found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                <Card className="bg-crd-dark border-crd-mediumGray">
                  <CardHeader>
                    <CardTitle className="text-crd-white">Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-crd-lightGray">Active Creators</span>
                      <span className="text-crd-white font-semibold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-crd-lightGray">Cards Created</span>
                      <span className="text-crd-white font-semibold">45,678</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-crd-lightGray">Active Challenges</span>
                      <span className="text-crd-green font-semibold">12</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Forums Tab */}
          <TabsContent value="forums" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-crd-dark border-crd-mediumGray">
                  <CardHeader>
                    <CardTitle className="text-crd-white">Popular Discussions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-crd-mediumGray rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-crd-darkest text-crd-white">U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="text-crd-white font-medium">How to create premium effects?</h4>
                          <p className="text-crd-lightGray text-sm">Discussion about advanced card effects...</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-crd-lightGray">
                            <span>23 replies</span>
                            <span>2 hours ago</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-crd-dark border-crd-mediumGray">
                  <CardHeader>
                    <CardTitle className="text-crd-white">Forum Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {['General Discussion', 'Card Design', 'Technical Help', 'Marketplace'].map((category) => (
                      <Button key={category} variant="ghost" className="justify-start w-full text-crd-lightGray hover:text-crd-white">
                        {category}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="mt-0">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-crd-white">Weekly Theme: Fantasy</h3>
                      <Badge className="bg-yellow-500/20 text-yellow-400">Active</Badge>
                    </div>
                    <p className="text-crd-lightGray mb-4">Create magical and mystical cards. Best submissions win prizes!</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-crd-lightGray">23 submissions • 4 days left</span>
                      <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">Join Challenge</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-crd-white">Beginner's Contest</h3>
                      <Badge className="bg-blue-500/20 text-blue-400">New</Badge>
                    </div>
                    <p className="text-crd-lightGray mb-4">Perfect for newcomers to showcase their first creations!</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-crd-lightGray">8 submissions • 6 days left</span>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-black">Join Challenge</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Card Design Fundamentals', level: 'Beginner', duration: '2 hours' },
                { title: 'Advanced Effects Mastery', level: 'Advanced', duration: '4 hours' },
                { title: 'Marketplace Success', level: 'Intermediate', duration: '1.5 hours' }
              ].map((course, i) => (
                <Card key={i} className="bg-crd-dark border-crd-mediumGray">
                  <CardContent className="p-6">
                    <h3 className="text-crd-white font-semibold mb-2">{course.title}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="bg-crd-mediumGray text-crd-lightGray">{course.level}</Badge>
                      <span className="text-sm text-crd-lightGray">{course.duration}</span>
                    </div>
                    <Button className="w-full bg-crd-green hover:bg-green-600 text-black">Start Course</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-0">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="bg-crd-dark border-crd-mediumGray">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-crd-mediumGray text-crd-white">U{i}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-crd-white">
                          <span className="font-semibold">Creator{i}</span> created a new card template
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-crd-lightGray">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{12 + i}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{45 + i}</span>
                          </div>
                          <span>2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};