import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Code, Trophy, BookOpen } from 'lucide-react';

export default function CommunityHubPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Creator Community Hub</h1>
        <p className="text-xl text-gray-400">Connect, learn, and grow with fellow creators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Creators</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,234</div>
            <p className="text-xs text-gray-400">+20% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Templates Created</CardTitle>
            <Code className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">5,678</div>
            <p className="text-xs text-gray-400">+15% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Challenges</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-gray-400">3 ending this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Learning Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">45</div>
            <p className="text-xs text-gray-400">New courses weekly</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Latest Community Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No community activity yet</p>
              <p className="text-sm">Community features coming soon!</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Featured Challenges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active challenges</p>
              <p className="text-sm">Check back for exciting challenges!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}