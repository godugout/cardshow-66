
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreatorProfile } from '@/hooks/creator/useCreatorProfile';
import { toast } from 'sonner';

export interface CreatorCourse {
  id: string;
  instructor_id: string;
  title: string;
  description?: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration_minutes?: number;
  price: number;
  is_free: boolean;
  course_data: Record<string, any>;
  enrollment_count: number;
  rating_average: number;
  rating_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  progress_percentage: number;
  completed_at?: string;
  certificate_issued: boolean;
  rating?: number;
  review?: string;
  enrolled_at: string;
}

export interface CreatorWorkshop {
  id: string;
  instructor_id: string;
  title: string;
  description?: string;
  workshop_type: 'live_stream' | 'recorded' | 'interactive';
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  max_attendees?: number;
  current_attendees: number;
  price: number;
  scheduled_at: string;
  duration_minutes: number;
  stream_url?: string;
  recording_url?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const useCreatorEducation = () => {
  const { profile } = useCreatorProfile();
  const queryClient = useQueryClient();

  // Courses - simplified mock data
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['creator-courses'],
    queryFn: async () => {
      return [];
    },
  });

  const { data: myCourses, isLoading: loadingMyCourses } = useQuery({
    queryKey: ['my-courses', profile?.id],
    queryFn: async () => {
      return [];
    },
    enabled: !!profile?.id,
  });

  const { data: myEnrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['my-enrollments', profile?.id],
    queryFn: async () => {
      return [];
    },
    enabled: !!profile?.id,
  });

  const createCourse = useMutation({
    mutationFn: async (courseData: Partial<CreatorCourse>) => {
      return { id: 'mock-course-id' };
    },
    onSuccess: () => {
      toast.success('Course created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create course: ${error.message}`);
    },
  });

  const enrollInCourse = useMutation({
    mutationFn: async (courseId: string) => {
      return { id: 'mock-enrollment-id' };
    },
    onSuccess: () => {
      toast.success('Successfully enrolled in course!');
    },
    onError: (error) => {
      toast.error(`Enrollment failed: ${error.message}`);
    },
  });

  // Workshops - simplified mock data
  const { data: workshops, isLoading: loadingWorkshops } = useQuery({
    queryKey: ['creator-workshops'],
    queryFn: async () => {
      return [];
    },
  });

  const createWorkshop = useMutation({
    mutationFn: async (workshopData: Partial<CreatorWorkshop>) => {
      return { id: 'mock-workshop-id' };
    },
    onSuccess: () => {
      toast.success('Workshop created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create workshop: ${error.message}`);
    },
  });

  const registerForWorkshop = useMutation({
    mutationFn: async (workshopId: string) => {
      return { id: 'mock-registration-id' };
    },
    onSuccess: () => {
      toast.success('Successfully registered for workshop!');
    },
    onError: (error) => {
      toast.error(`Registration failed: ${error.message}`);
    },
  });

  return {
    // Courses
    courses: courses || [],
    myCourses: myCourses || [],
    myEnrollments: myEnrollments || [],
    loadingCourses,
    loadingMyCourses,
    loadingEnrollments,
    createCourse,
    enrollInCourse,

    // Workshops
    workshops: workshops || [],
    loadingWorkshops,
    createWorkshop,
    registerForWorkshop,
  };
};
