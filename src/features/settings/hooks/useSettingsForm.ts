/**
 * useSettingsForm Hook
 *
 * Manages form state and handlers for the Settings page.
 * Handles profile, goal, and medication editing operations.
 * Extracted from Settings.tsx for better modularity.
 */

import { UserMedication, UserProfile, WeightGoal } from '@/api/userProfiles';
import {
  useDeleteMedication,
  useMedicationMutation,
  useMedicationTypes,
  useUserMedications,
} from '@/hooks/useMedications';
import {
  useUserProfile,
  useUserProfileMutation,
  useWeightGoal,
  useWeightGoalMutation,
} from '@/hooks/useUserProfile';
import { useEffect, useState } from 'react';

export interface UseSettingsFormOptions {
  userId: string;
  userSub?: string;
}

export interface UseSettingsFormReturn {
  // Loading states
  isLoading: boolean;
  profileLoading: boolean;
  goalLoading: boolean;
  medicationsLoading: boolean;
  medicationTypesLoading: boolean;

  // Data
  profile: UserProfile | null | undefined;
  goal: WeightGoal | null | undefined;
  medications: UserMedication[] | undefined;
  medicationTypes: ReturnType<typeof useMedicationTypes>['data'];

  // Editing states
  isEditing: boolean;
  isEditingGoal: boolean;
  isEditingMedication: boolean;

  // Editing data
  editingProfile: UserProfile | null;
  editingGoal: WeightGoal | null;
  editingMedication: UserMedication | null;

  // Setters
  setIsEditing: (value: boolean) => void;
  setIsEditingGoal: (value: boolean) => void;
  setIsEditingMedication: (value: boolean) => void;
  setEditingProfile: (value: UserProfile | null) => void;
  setEditingGoal: (value: WeightGoal | null) => void;
  setEditingMedication: (value: UserMedication | null) => void;

  // Handlers
  handleProfileSave: () => Promise<void>;
  handleGoalSave: () => Promise<void>;
  handleProfileCancel: () => void;
  handleGoalCancel: () => void;
  handleMedicationSave: () => Promise<void>;
  handleMedicationCancel: () => void;
  handleDeleteMedication: (medicationId: string) => Promise<void>;
  handleAddMedication: () => void;

  // Utility functions
  updateHeightFt: (ft: number) => void;
  updateHeightIn: (inches: number) => void;

  // Mutation states
  profileMutating: boolean;
  goalMutating: boolean;
  medicationMutating: boolean;
}

export function useSettingsForm({
  userId,
  userSub,
}: UseSettingsFormOptions): UseSettingsFormReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingMedication, setIsEditingMedication] = useState(false);

  // Use custom hooks for data fetching
  const { data: profile, isLoading: profileLoading } = useUserProfile(userId);
  const { data: goal, isLoading: goalLoading } = useWeightGoal(userId);
  const { data: medications, isLoading: medicationsLoading } =
    useUserMedications(userId);
  const { data: medicationTypes, isLoading: medicationTypesLoading } =
    useMedicationTypes();

  // Use custom hooks for mutations
  const profileMutation = useUserProfileMutation();
  const goalMutation = useWeightGoalMutation();
  const medicationMutation = useMedicationMutation();
  const deleteMedicationMutation = useDeleteMedication();

  // Local state for editing
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(
    null
  );
  const [editingGoal, setEditingGoal] = useState<WeightGoal | null>(null);
  const [editingMedication, setEditingMedication] =
    useState<UserMedication | null>(null);

  // Initialize editing state when data loads
  useEffect(() => {
    if (profile) {
      setEditingProfile({ ...profile });
    }
    if (goal) {
      setEditingGoal({ ...goal });
    }
    if (medications && medications.length > 0) {
      const firstMedication = medications[0];
      if (firstMedication) {
        setEditingMedication({ ...firstMedication });
      }
    }
  }, [profile, goal, medications]);

  const handleProfileSave = async () => {
    if (editingProfile) {
      await profileMutation.mutateAsync(editingProfile);
      setIsEditing(false);
    }
  };

  const handleGoalSave = async () => {
    if (editingGoal) {
      await goalMutation.mutateAsync(editingGoal);
      setIsEditingGoal(false);
    }
  };

  const handleProfileCancel = () => {
    setEditingProfile(profile ? { ...profile } : null);
    setIsEditing(false);
  };

  const handleGoalCancel = () => {
    setEditingGoal(goal ? { ...goal } : null);
    setIsEditingGoal(false);
  };

  const handleMedicationSave = async () => {
    if (editingMedication) {
      await medicationMutation.mutateAsync(editingMedication);
      setIsEditingMedication(false);
    }
  };

  const handleMedicationCancel = () => {
    if (medications && medications.length > 0) {
      const firstMedication = medications[0];
      if (firstMedication) {
        setEditingMedication({ ...firstMedication });
      } else {
        setEditingMedication(null);
      }
    } else {
      setEditingMedication(null);
    }
    setIsEditingMedication(false);
  };

  const handleDeleteMedication = async (medicationId: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      await deleteMedicationMutation.mutateAsync(medicationId);
    }
  };

  const handleAddMedication = () => {
    // Fix timezone issue by using local date string instead of UTC
    const today = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      12,
      0,
      0
    );
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    const newMedication: UserMedication = {
      id: `temp_${Date.now()}`,
      user_id: userSub ?? '',
      medication_type_id: 1,
      start_date: todayString,
      frequency: 'weekly',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditingMedication(newMedication);
    setIsEditingMedication(true);
  };

  const updateHeight = (ft: number, inches: number) => {
    if (editingProfile) {
      setEditingProfile({
        ...editingProfile,
        height_ft: ft,
        height_in: inches,
      });
    }
  };

  const updateHeightFt = (ft: number) => {
    if (editingProfile) {
      updateHeight(ft, editingProfile.height_in);
    }
  };

  const updateHeightIn = (inches: number) => {
    if (editingProfile) {
      updateHeight(editingProfile.height_ft, inches);
    }
  };

  const isLoading =
    profileLoading || goalLoading || medicationsLoading || medicationTypesLoading;

  return {
    // Loading states
    isLoading,
    profileLoading,
    goalLoading,
    medicationsLoading,
    medicationTypesLoading,

    // Data
    profile,
    goal,
    medications,
    medicationTypes,

    // Editing states
    isEditing,
    isEditingGoal,
    isEditingMedication,

    // Editing data
    editingProfile,
    editingGoal,
    editingMedication,

    // Setters
    setIsEditing,
    setIsEditingGoal,
    setIsEditingMedication,
    setEditingProfile,
    setEditingGoal,
    setEditingMedication,

    // Handlers
    handleProfileSave,
    handleGoalSave,
    handleProfileCancel,
    handleGoalCancel,
    handleMedicationSave,
    handleMedicationCancel,
    handleDeleteMedication,
    handleAddMedication,

    // Utility functions
    updateHeightFt,
    updateHeightIn,

    // Mutation states
    profileMutating: profileMutation.isPending,
    goalMutating: goalMutation.isPending,
    medicationMutating: medicationMutation.isPending,
  };
}
