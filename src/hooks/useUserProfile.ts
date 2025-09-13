import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfilesAPI } from '@/api/userProfiles';

// Query keys for user profiles
export const userProfileKeys = {
  all: ['userProfile'] as const,
  lists: () => [...userProfileKeys.all, 'list'] as const,
  list: (userId: string) => [...userProfileKeys.lists(), userId] as const,
  details: () => [...userProfileKeys.all, 'detail'] as const,
  detail: (userId: string) => [...userProfileKeys.details(), userId] as const,
};

// Query keys for weight goals
export const weightGoalKeys = {
  all: ['weightGoal'] as const,
  lists: () => [...weightGoalKeys.all, 'list'] as const,
  list: (userId: string) => [...weightGoalKeys.lists(), userId] as const,
  details: () => [...weightGoalKeys.all, 'detail'] as const,
  detail: (userId: string) => [...weightGoalKeys.details(), userId] as const,
};

// Custom hook for fetching user profile
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: userProfileKeys.detail(userId),
    queryFn: () => UserProfilesAPI.getUserProfile(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId,
  });
};

// Custom hook for fetching weight goal
export const useWeightGoal = (userId: string) => {
  return useQuery({
    queryKey: weightGoalKeys.detail(userId),
    queryFn: () => UserProfilesAPI.getWeightGoal(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId,
  });
};

// Custom hook for user profile mutations
export const useUserProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserProfilesAPI.updateUserProfile,
    onSuccess: updatedProfile => {
      // Update the user profile cache
      queryClient.setQueryData(
        userProfileKeys.detail(updatedProfile.id),
        updatedProfile
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: userProfileKeys.lists(),
      });
    },
    onError: error => {
      console.error('User profile mutation failed:', error);
    },
  });
};

// Custom hook for weight goal mutations
export const useWeightGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserProfilesAPI.updateWeightGoal,
    onSuccess: updatedGoal => {
      // Update the weight goal cache
      queryClient.setQueryData(
        weightGoalKeys.detail(updatedGoal.user_id),
        updatedGoal
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: weightGoalKeys.lists(),
      });
    },
    onError: error => {
      console.error('Weight goal mutation failed:', error);
    },
  });
};
