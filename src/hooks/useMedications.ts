import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfilesAPI, UserMedication, MedicationType } from '@/api/userProfiles';

// Query keys for medications
export const medicationKeys = {
  all: ['medications'] as const,
  lists: () => [...medicationKeys.all, 'list'] as const,
  list: (userId: string) => [...medicationKeys.lists(), userId] as const,
  types: () => [...medicationKeys.all, 'types'] as const,
  details: () => [...medicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...medicationKeys.details(), id] as const,
};

// Custom hook for fetching medication types
export const useMedicationTypes = () => {
  return useQuery({
    queryKey: medicationKeys.types(),
    queryFn: async () => {
      // Fetch medication types from the API
      const response = await fetch('https://healthbridge-enhanced.rcormier.workers.dev/api/v2/medication-types');
      if (!response.ok) {
        throw new Error(`Failed to fetch medication types: ${response.status}`);
      }
      const data = await response.json();
      return data.medication_types || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - medication types don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Custom hook for fetching user medications
export const useUserMedications = (userId: string) => {
  return useQuery({
    queryKey: medicationKeys.list(userId),
    queryFn: () => UserProfilesAPI.getUserMedications(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes - user medications can change
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId,
  });
};

// Custom hook for medication mutations
export const useMedicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserProfilesAPI.updateUserMedication,
    onSuccess: (updatedMedication) => {
      // Update the medications list cache
      queryClient.setQueryData(
        medicationKeys.list(updatedMedication.user_id),
        (old: UserMedication[] = []) => {
          const existing = old.find(m => m.id === updatedMedication.id);
          if (existing) {
            return old.map(m => m.id === updatedMedication.id ? updatedMedication : m);
          } else {
            return [...old, updatedMedication];
          }
        }
      );

      // Update individual medication cache if it exists
      queryClient.setQueryData(
        medicationKeys.detail(updatedMedication.id),
        updatedMedication
      );

      // Invalidate related queries to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: medicationKeys.lists(),
      });
    },
    onError: (error) => {
      console.error('Medication mutation failed:', error);
      // You could add toast notifications here
    },
  });
};

// Custom hook for deleting medications
export const useDeleteMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserProfilesAPI.deleteUserMedication,
    onSuccess: (_, medicationId) => {
      // Remove from all medication lists
      queryClient.setQueryData(
        medicationKeys.lists(),
        (old: UserMedication[][] = []) => 
          old.map(list => list.filter(m => m.id !== medicationId))
      );

      // Remove individual medication cache
      queryClient.removeQueries({
        queryKey: medicationKeys.detail(medicationId),
      });

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: medicationKeys.lists(),
      });
    },
    onError: (error) => {
      console.error('Error deleting medication:', error);
    },
  });
};

// Utility function to get medication type by ID
export const getMedicationTypeById = (
  medicationTypes: MedicationType[] | undefined,
  medicationTypeId: number
): MedicationType | undefined => {
  return medicationTypes?.find(type => type.id === medicationTypeId);
};

// Utility function to format medication frequency for display
export const formatMedicationFrequency = (frequency: string): string => {
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Bi-weekly';
    default:
      return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  }
};
