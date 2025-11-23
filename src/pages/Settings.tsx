'use client';

import {
  MedicationType,
  TIMEZONES,
  UserMedication,
  UserProfile,
  WeightGoal,
  convertLbsToKg,
  formatDateInTimezone,
  getCurrentTimezone,
} from '@/api/userProfiles';
import { DatePicker } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import {
  formatMedicationFrequency,
  getMedicationTypeById,
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
import {
  Activity,
  Edit3,
  Plus,
  Settings,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingMedication, setIsEditingMedication] = useState(false);

  // Get authenticated user
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Use custom hooks for data fetching - only when authenticated
  // Use email instead of sub for more reliable mapping
  const userId = user?.email ?? user?.sub ?? '';
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
    // Create date in local timezone by setting hours to noon to avoid midnight shift
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
      id: `temp_${Date.now()}`, // Generate temporary ID for new medications
      user_id: user?.sub ?? '',
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

  // Check if we're still loading authentication or if user is not authenticated
  if (authLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-center'>
            <Settings className='mx-auto mb-4 size-8 animate-spin text-strategy-gold' />
            <p className='text-gray-600'>Loading authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>
          <Card className='mx-auto max-w-md'>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access your settings.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (
    profileLoading ||
    goalLoading ||
    medicationsLoading ||
    medicationTypesLoading
  ) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-center'>
            <Settings className='mx-auto mb-4 size-8 animate-spin text-strategy-gold' />
            <p className='text-gray-600'>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where profile or goal data failed to load
  if (!profile || !goal) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>
          <Card className='mx-auto max-w-md'>
            <CardHeader>
              <CardTitle>Data Loading Issue</CardTitle>
              <CardDescription>
                Unable to load your profile data. This might be because:
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2 text-left'>
              <ul className='list-inside list-disc space-y-1 text-sm text-gray-600'>
                <li>The backend API is not yet deployed</li>
                <li>You need to create your initial profile</li>
                <li>There was a temporary connection issue</li>
              </ul>
              <div className='mt-4 text-center'>
                <Button
                  onClick={() => window.location.reload()}
                  variant='outline'
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-surface-base'>
      {/* Header with Glassmorphism */}
      <div className='relative overflow-hidden border-b border-surface-elevated/50 bg-surface-base/40 backdrop-blur-xl'>
        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-surface-elevated/60 shadow-lg ring-1 ring-strategy-gold/20 backdrop-blur-md'>
                  <Settings className='size-7 text-strategy-gold' />
                </div>
                {/* Settings indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-surface-deep/80 backdrop-blur-sm'>
                  <div className='size-2 rounded-full bg-strategy-gold'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-text-tertiary/60 backdrop-blur-sm'>
                  <div className='size-1.5 rounded-full bg-strategy-gold'></div>
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold tracking-tight text-text-foreground sm:text-5xl lg:text-6xl'>
                  <span className='text-strategy-gold'>
                    Settings
                  </span>
                </h1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-strategy-gold/50'></div>
              </div>
            </div>

            {/* Description */}
            <p className='mx-auto max-w-3xl text-lg leading-7 text-text-secondary'>
              Manage your profile, preferences, and personal information in one
              central location
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='container mx-auto max-w-5xl px-4 py-8'>
        {/* User Profile Section */}
        <Card className='mb-8 border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-xl'>
          <CardHeader className='pb-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='rounded-xl bg-strategy-gold/20 p-3'>
                  <User className='size-6 text-strategy-gold' />
                </div>
                <div>
                  <CardTitle className='text-xl font-semibold text-text-foreground'>
                    Profile Information
                  </CardTitle>
                  <CardDescription className='text-text-secondary'>
                    Your personal information and activity level
                  </CardDescription>
                </div>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className='rounded-lg border-0 bg-strategy-gold px-6 text-precision-charcoal hover:bg-strategy-gold/90'
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <Label htmlFor='name'>Full Name</Label>
                    <Input
                      id='name'
                      value={editingProfile?.name ?? ''}
                      onChange={e =>
                        setEditingProfile(prev =>
                          prev ? { ...prev, name: e.target.value } : null
                        )
                      }
                      placeholder='Enter your full name'
                    />
                  </div>

                  <div>
                    <Label htmlFor='birthdate'>Birth Date</Label>
                    <DatePicker
                      value={editingProfile?.birthdate ?? ''}
                      onChange={dateString => {
                        if (dateString && editingProfile) {
                          console.log(
                            'DatePicker selected date string:',
                            dateString
                          );

                          setEditingProfile({
                            ...editingProfile,
                            birthdate: dateString,
                          });
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor='gender'>Gender</Label>
                    <Select
                      value={editingProfile?.gender ?? 'male'}
                      onValueChange={value =>
                        setEditingProfile(prev =>
                          prev
                            ? {
                                ...prev,
                                gender: value as 'male' | 'female' | 'other',
                              }
                            : null
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select gender' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='male'>Male</SelectItem>
                        <SelectItem value='female'>Female</SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Height</Label>
                    <div className='flex gap-2'>
                      <div className='flex-1'>
                        <Input
                          type='number'
                          placeholder='Ft'
                          value={editingProfile?.height_ft ?? ''}
                          onChange={e =>
                            updateHeightFt(parseInt(e.target.value) || 0)
                          }
                          min='0'
                          max='8'
                        />
                      </div>
                      <div className='flex-1'>
                        <Input
                          type='number'
                          placeholder='In'
                          value={editingProfile?.height_in ?? ''}
                          onChange={e =>
                            updateHeightIn(parseInt(e.target.value) || 0)
                          }
                          min='0'
                          max='11'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='md:col-span-2'>
                    <Label htmlFor='activity'>Activity Level</Label>
                    <Select
                      value={editingProfile?.activity_level ?? 'moderate'}
                      onValueChange={value =>
                        setEditingProfile(prev =>
                          prev
                            ? {
                                ...prev,
                                activity_level: value as
                                  | 'sedentary'
                                  | 'light'
                                  | 'moderate'
                                  | 'active'
                                  | 'very_active',
                              }
                            : null
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select activity level' />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='md:col-span-2'>
                    <Label htmlFor='timezone'>Timezone</Label>
                    <Select
                      value={editingProfile?.timezone ?? getCurrentTimezone()}
                      onValueChange={value =>
                        setEditingProfile(prev =>
                          prev ? { ...prev, timezone: value } : null
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select timezone' />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map(tz => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label} ({tz.offset})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='flex gap-3 pt-6'>
                  <Button
                    onClick={() => void handleProfileSave()}
                    disabled={profileMutation.isPending}
                    className='rounded-lg border-0 bg-strategy-gold px-8 text-precision-charcoal hover:bg-strategy-gold/90'
                  >
                    {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
                  </Button>
                  <Button
                    onClick={handleProfileCancel}
                    variant='outline'
                    className='rounded-lg border border-slate-600 px-8 text-text-secondary hover:bg-slate-700'
                  >
                    Cancel
                  </Button>
                </div>

                {profileMutation.isSuccess && (
                  <div className='mt-2 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-800'>
                    ✅ Profile updated successfully!
                  </div>
                )}

                {profileMutation.isError && (
                  <div className='mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800'>
                    ❌ Error updating profile: {profileMutation.error?.message}
                  </div>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Name
                  </Label>
                  <p className='text-lg font-medium text-text-foreground'>
                    {profile.name}
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Age
                  </Label>
                  <p className='text-lg font-medium text-text-foreground'>
                    {profile.age} years old
                  </p>
                  <p className='text-sm text-text-tertiary'>
                    {profile.birthdate
                      ? `Born ${formatDateInTimezone(profile.birthdate, profile.timezone || 'America/New_York')}`
                      : `${profile.age} years old`}
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Gender
                  </Label>
                  <p className='text-lg font-medium capitalize text-text-foreground'>
                    {profile.gender}
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Height
                  </Label>
                  <p className='text-lg font-medium text-text-foreground'>
                    {profile.height_ft}' {profile.height_in}"
                  </p>
                  <p className='text-sm text-text-tertiary'>
                    {Math.round(
                      (profile.height_ft * 12 + profile.height_in) * 2.54
                    )}{' '}
                    cm
                  </p>
                </div>

                <div className='md:col-span-2'>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Activity Level
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary' className='capitalize'>
                      {profile.activity_level.replace('_', ' ')}
                    </Badge>
                    <span className='text-sm text-text-tertiary'>
                      Multiplier:{' '}
                      {profile.activity_level === 'sedentary'
                        ? '1.2'
                        : profile.activity_level === 'light'
                          ? '1.375'
                          : profile.activity_level === 'moderate'
                            ? '1.55'
                            : profile.activity_level === 'active'
                              ? '1.725'
                              : profile.activity_level === 'very_active'
                                ? '1.9'
                                : '1.2'}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Timezone
                  </Label>
                  <p className='text-lg font-medium text-text-foreground'>
                    {TIMEZONES.find(tz => tz.value === profile.timezone)
                      ?.label ?? profile.timezone}
                  </p>
                  <p className='text-sm text-text-tertiary'>
                    All dates are displayed in your local timezone
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weight Goals Section */}
        <Card className='mb-8 border border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-sm'>
          <CardHeader className='pb-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='rounded-xl bg-strategy-gold/20 p-3'>
                  <TrendingUp className='size-6 text-strategy-gold' />
                </div>
                <div>
                  <CardTitle className='text-xl font-semibold text-text-foreground'>
                    Weight Loss Goals
                  </CardTitle>
                  <CardDescription className='text-text-secondary'>
                    Set and track your weight loss objectives
                  </CardDescription>
                </div>
              </div>
              {!isEditingGoal && (
                <Button
                  onClick={() => setIsEditingGoal(true)}
                  className='rounded-lg border-0 bg-strategy-gold px-6 text-precision-charcoal hover:bg-strategy-gold/90'
                >
                  Edit Goals
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingGoal ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <Label htmlFor='startWeight'>Starting Weight (lbs)</Label>
                    <Input
                      id='startWeight'
                      type='number'
                      step='0.1'
                      value={editingGoal?.start_weight_lbs ?? ''}
                      onChange={e =>
                        setEditingGoal(prev =>
                          prev
                            ? {
                                ...prev,
                                start_weight_lbs:
                                  parseFloat(e.target.value) || 0,
                              }
                            : null
                        )
                      }
                      placeholder='200.0'
                    />
                  </div>

                  <div>
                    <Label htmlFor='targetWeight'>Target Weight (lbs)</Label>
                    <Input
                      id='targetWeight'
                      type='number'
                      step='0.1'
                      value={editingGoal?.target_weight_lbs ?? ''}
                      onChange={e =>
                        setEditingGoal(prev =>
                          prev
                            ? {
                                ...prev,
                                target_weight_lbs:
                                  parseFloat(e.target.value) || 0,
                              }
                            : null
                        )
                      }
                      placeholder='180.0'
                    />
                  </div>

                  <div>
                    <Label htmlFor='weeklyGoal'>Weekly Goal (lbs)</Label>
                    <Input
                      id='weeklyGoal'
                      type='number'
                      step='0.1'
                      value={editingGoal?.weekly_goal_lbs ?? ''}
                      onChange={e =>
                        setEditingGoal(prev =>
                          prev
                            ? {
                                ...prev,
                                weekly_goal_lbs:
                                  parseFloat(e.target.value) || 0,
                              }
                            : null
                        )
                      }
                      placeholder='1.5'
                    />
                  </div>

                  <div>
                    <Label htmlFor='targetDate'>Target Date</Label>
                    <DatePicker
                      value={editingGoal?.target_date ?? ''}
                      onChange={dateString => {
                        if (dateString && editingGoal) {
                          console.log(
                            'DatePicker selected target date string:',
                            dateString
                          );

                          setEditingGoal({
                            ...editingGoal,
                            target_date: dateString,
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className='flex gap-3 pt-6'>
                  <Button
                    onClick={() => void handleGoalSave()}
                    disabled={goalMutation.isPending}
                    className='rounded-lg border-0 bg-strategy-gold px-8 text-precision-charcoal hover:bg-strategy-gold/90'
                  >
                    {goalMutation.isPending ? 'Saving...' : 'Save Goals'}
                  </Button>
                  <Button
                    onClick={handleGoalCancel}
                    variant='outline'
                    className='rounded-lg border border-slate-600 px-8 text-text-secondary hover:bg-slate-700'
                  >
                    Cancel
                  </Button>
                </div>

                {goalMutation.isSuccess && (
                  <div className='mt-2 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-800'>
                    ✅ Weight goals updated successfully!
                  </div>
                )}

                {goalMutation.isError && (
                  <div className='mt-2 rounded border border-green-200 bg-red-50 p-2 text-sm text-red-800'>
                    ❌ Error updating goals: {goalMutation.error?.message}
                  </div>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Starting Weight
                  </Label>
                  <p className='text-lg font-medium text-text-foreground'>
                    {goal.start_weight_lbs
                      ? `${goal.start_weight_lbs} lbs`
                      : 'Not set'}
                  </p>
                  <p className='text-sm text-text-tertiary'>
                    {goal.start_weight_lbs && !isNaN(goal.start_weight_lbs)
                      ? `${Math.round(convertLbsToKg(goal.start_weight_lbs) * 10) / 10} kg`
                      : 'Not set'}
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Target Weight
                  </Label>
                  <p className='text-lg font-medium text-text-foreground'>
                    {goal.target_weight_lbs
                      ? `${goal.target_weight_lbs} lbs`
                      : 'Not set'}
                  </p>
                  <p className='text-sm text-text-tertiary'>
                    {goal.target_weight_lbs && !isNaN(goal.target_weight_lbs)
                      ? `${Math.round(convertLbsToKg(goal.target_weight_lbs) * 10) / 10} kg`
                      : 'Not set'}
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Weekly Goal
                  </Label>
                  <p className='text-lg font-medium text-text-foreground'>
                    {goal.weekly_goal_lbs
                      ? `${goal.weekly_goal_lbs} lbs/week`
                      : 'Not set'}
                  </p>
                  <p className='text-sm text-text-tertiary'>
                    {goal.weekly_goal_lbs && !isNaN(goal.weekly_goal_lbs)
                      ? `${Math.round(convertLbsToKg(goal.weekly_goal_lbs) * 10) / 10} kg/week`
                      : 'Not set'}
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Target Date
                  </Label>
                  <p className='text-lg font-medium text-text-foreground'>
                    {goal.target_date
                      ? formatDateInTimezone(
                          goal.target_date,
                          profile?.timezone || 'America/New_York'
                        )
                      : 'Not set'}
                  </p>
                </div>

                <div className='md:col-span-2'>
                  <Label className='text-sm font-medium text-text-tertiary'>
                    Total Weight to Lose
                  </Label>
                  {goal.start_weight_lbs &&
                  goal.target_weight_lbs &&
                  !isNaN(goal.start_weight_lbs) &&
                  !isNaN(goal.target_weight_lbs) ? (
                    <>
                      <p className='text-lg font-medium text-red-600'>
                        {Math.round(
                          (goal.start_weight_lbs - goal.target_weight_lbs) * 10
                        ) / 10}{' '}
                        lbs
                      </p>
                      <p className='text-sm text-text-tertiary'>
                        {Math.round(
                          convertLbsToKg(
                            goal.start_weight_lbs - goal.target_weight_lbs
                          ) * 10
                        ) / 10}{' '}
                        kg
                      </p>
                    </>
                  ) : (
                    <p className='text-lg font-medium text-gray-400'>
                      Set starting and target weights to calculate
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medication Tracking Section */}
        <Card className='mb-8 border border-strategy-gold/20 bg-surface-elevated/30 shadow-lg backdrop-blur-sm'>
          <CardHeader className='pb-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='rounded-xl bg-strategy-gold/20 p-3'>
                  <Activity className='size-6 text-strategy-gold' />
                </div>
                <div>
                  <CardTitle className='text-xl font-semibold text-text-foreground'>
                    Medication Tracking
                  </CardTitle>
                  <CardDescription className='text-text-secondary'>
                    Track weight loss medications and their impact on your goals
                  </CardDescription>
                </div>
              </div>
              {!isEditingMedication && (
                <Button
                  onClick={handleAddMedication}
                  className='rounded-lg border-0 bg-strategy-gold px-6 text-precision-charcoal hover:bg-strategy-gold/90'
                  disabled={medicationsLoading || medicationTypesLoading}
                >
                  {medicationTypesLoading ? (
                    <div className='flex items-center gap-2'>
                      <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      Loading...
                    </div>
                  ) : (
                    <>
                      <Plus className='mr-2 size-4' />
                      Add Medication
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {medicationsLoading ? (
              <div className='space-y-4'>
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className='animate-pulse border-0 shadow-sm'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <div className='space-y-3'>
                          <div className='h-4 w-32 rounded bg-gray-200'></div>
                          <div className='h-3 w-24 rounded bg-gray-200'></div>
                        </div>
                        <div className='h-6 w-16 rounded bg-gray-200'></div>
                      </div>
                    </CardHeader>
                    <CardContent className='pt-0'>
                      <div className='space-y-3'>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className='flex justify-between'>
                            <div className='h-3 w-20 rounded bg-gray-200'></div>
                            <div className='h-3 w-24 rounded bg-gray-200'></div>
                          </div>
                        ))}
                      </div>
                      <div className='mt-4 flex gap-2 border-t pt-4'>
                        <div className='h-8 flex-1 rounded bg-gray-200'></div>
                        <div className='h-8 flex-1 rounded bg-gray-200'></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : isEditingMedication ? (
              <div className='space-y-4'>
                {medicationTypesLoading ? (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className='space-y-2'>
                          <div className='h-4 w-20 animate-pulse rounded bg-gray-200'></div>
                          <div className='h-10 animate-pulse rounded bg-gray-200'></div>
                        </div>
                      ))}
                    </div>
                    <div className='flex gap-2 pt-4'>
                      <div className='h-10 flex-1 animate-pulse rounded bg-gray-200'></div>
                      <div className='h-10 flex-1 animate-pulse rounded bg-gray-200'></div>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-8'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                      <div className='space-y-3'>
                        <Label htmlFor='medicationType'>Medication</Label>
                        <Select
                          value={
                            editingMedication?.medication_type_id?.toString() ??
                            '1'
                          }
                          onValueChange={value =>
                            setEditingMedication(prev =>
                              prev
                                ? {
                                    ...prev,
                                    medication_type_id: parseInt(value),
                                  }
                                : null
                            )
                          }
                          disabled={medicationTypesLoading}
                        >
                          <SelectTrigger className='min-h-[40px]'>
                            <SelectValue
                              placeholder={
                                medicationTypesLoading
                                  ? 'Loading...'
                                  : 'Select medication'
                              }
                            >
                              {(() => {
                                const selectedType = medicationTypes?.find(
                                  (type: MedicationType) =>
                                    type.id ===
                                    editingMedication?.medication_type_id
                                );
                                return selectedType
                                  ? selectedType.name
                                  : undefined;
                              })()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent
                            className='z-50'
                            position='popper'
                            side='bottom'
                            align='start'
                          >
                            {medicationTypesLoading ? (
                              <div className='p-2 text-center text-sm text-text-tertiary'>
                                <div className='flex items-center justify-center gap-2'>
                                  <div className='size-4 animate-spin rounded-full border-2 border-gold-600 border-t-transparent'></div>
                                  Loading medications...
                                </div>
                              </div>
                            ) : medicationTypes &&
                              Array.isArray(medicationTypes) &&
                              medicationTypes.length === 0 ? (
                              <div className='p-2 text-center text-sm text-red-500'>
                                No medications available
                              </div>
                            ) : (
                              medicationTypes?.map((type: MedicationType) => (
                                <SelectItem
                                  key={type.id}
                                  value={type.id.toString()}
                                >
                                  <div className='flex flex-col space-y-1 py-2'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-sm font-medium'>
                                        {type.name}
                                      </span>
                                      <Badge
                                        variant='outline'
                                        className='text-xs'
                                      >
                                        {type.weekly_efficacy_multiplier}x
                                        efficacy
                                      </Badge>
                                    </div>
                                    <span className='text-xs text-text-tertiary'>
                                      {type.generic_name}
                                    </span>
                                    <span className='line-clamp-2 text-xs leading-tight text-gray-400'>
                                      {type.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-3'>
                        <Label htmlFor='medicationStartDate'>Start Date</Label>
                        <DatePicker
                          value={editingMedication?.start_date ?? ''}
                          onChange={dateString => {
                            if (dateString && editingMedication) {
                              console.log(
                                'DatePicker selected medication start date string:',
                                dateString
                              );

                              setEditingMedication({
                                ...editingMedication,
                                start_date: dateString,
                              });
                            }
                          }}
                        />
                      </div>

                      <div className='space-y-3'>
                        <Label htmlFor='medicationDosage'>Dosage (mg)</Label>
                        <Input
                          id='medicationDosage'
                          type='number'
                          step='0.1'
                          value={editingMedication?.dosage_mg ?? ''}
                          onChange={e =>
                            setEditingMedication(prev =>
                              prev
                                ? {
                                    ...prev,
                                    ...(e.target.value && {
                                      dosage_mg: parseFloat(e.target.value),
                                    }),
                                  }
                                : null
                            )
                          }
                          placeholder='2.4'
                          className='min-h-[40px]'
                        />
                      </div>

                      <div className='space-y-3'>
                        <Label htmlFor='medicationFrequency'>Frequency</Label>
                        <Select
                          value={editingMedication?.frequency ?? 'weekly'}
                          onValueChange={value =>
                            setEditingMedication(prev =>
                              prev ? { ...prev, frequency: value } : null
                            )
                          }
                        >
                          <SelectTrigger className='min-h-[40px]'>
                            <SelectValue placeholder='Select frequency'>
                              {editingMedication?.frequency
                                ? editingMedication.frequency
                                    .charAt(0)
                                    .toUpperCase() +
                                  editingMedication.frequency.slice(1)
                                : undefined}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent
                            className='z-50'
                            position='popper'
                            side='bottom'
                            align='start'
                          >
                            <SelectItem value='daily'>
                              <div className='flex items-center gap-2'>
                                <span>Daily</span>
                                <Badge variant='secondary' className='text-xs'>
                                  Most frequent
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value='weekly'>
                              <div className='flex items-center gap-2'>
                                <span>Weekly</span>
                                <Badge variant='default' className='text-xs'>
                                  Standard
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value='biweekly'>
                              <div className='flex items-center gap-2'>
                                <span>Bi-weekly</span>
                                <Badge variant='outline' className='text-xs'>
                                  Less frequent
                                </Badge>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2 md:col-span-2'>
                        <Label htmlFor='medicationNotes'>Notes</Label>
                        <Input
                          id='medicationNotes'
                          value={editingMedication?.notes ?? ''}
                          onChange={e =>
                            setEditingMedication(prev =>
                              prev ? { ...prev, notes: e.target.value } : null
                            )
                          }
                          placeholder='Any side effects, dosage changes, etc.'
                          className='min-h-[40px]'
                        />
                      </div>
                    </div>

                    <div className='flex gap-3 pt-8'>
                      <Button
                        onClick={() => void handleMedicationSave()}
                        disabled={
                          medicationMutation.isPending ||
                          deleteMedicationMutation.isPending
                        }
                        className='flex-1 rounded-lg border-0 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90'
                      >
                        {medicationMutation.isPending ? (
                          <div className='flex items-center gap-2'>
                            <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                            Saving...
                          </div>
                        ) : (
                          'Save Medication'
                        )}
                      </Button>
                      <Button
                        onClick={handleMedicationCancel}
                        variant='outline'
                        className='flex-1 rounded-lg border border-slate-600 text-text-secondary hover:bg-slate-700'
                        disabled={
                          medicationMutation.isPending ||
                          deleteMedicationMutation.isPending
                        }
                      >
                        Cancel
                      </Button>
                    </div>

                    {medicationMutation.isSuccess && (
                      <div className='mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800'>
                        ✅ Medication{' '}
                        {editingMedication?.id?.startsWith('temp_')
                          ? 'added'
                          : 'updated'}{' '}
                        successfully!
                      </div>
                    )}

                    {medicationMutation.isError && (
                      <div className='mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                        ❌ Error{' '}
                        {editingMedication?.id?.startsWith('temp_')
                          ? 'adding'
                          : 'updating'}{' '}
                        medication: {medicationMutation.error?.message}
                      </div>
                    )}

                    {deleteMedicationMutation.isSuccess && (
                      <div className='mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800'>
                        ✅ Medication deleted successfully!
                      </div>
                    )}

                    {deleteMedicationMutation.isError && (
                      <div className='mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                        ❌ Error deleting medication:{' '}
                        {deleteMedicationMutation.error?.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className='space-y-6'>
                {medications && medications.length > 0 ? (
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {medications.map(medication => {
                      const medicationType = getMedicationTypeById(
                        medicationTypes,
                        medication.medication_type_id
                      );
                      return (
                        <Card
                          key={medication.id}
                          className='border border-strategy-gold/20 bg-surface-elevated/30 shadow-sm transition-shadow hover:border-gold-600/50 hover:shadow-md'
                        >
                          <CardHeader className='pb-3'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <h4 className='font-semibold text-text-foreground'>
                                  {medicationType?.name ?? 'Unknown Medication'}
                                </h4>
                                <p className='text-sm text-text-tertiary'>
                                  {medicationType?.generic_name ?? 'Unknown'}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  medication.is_active ? 'default' : 'secondary'
                                }
                              >
                                {medication.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className='pt-0'>
                            <div className='space-y-3 text-sm'>
                              <div className='flex justify-between'>
                                <span className='font-medium text-text-tertiary'>
                                  Started:
                                </span>
                                <span className='text-text-foreground'>
                                  {formatDateInTimezone(
                                    medication.start_date,
                                    profile?.timezone || 'America/New_York'
                                  )}
                                </span>
                              </div>
                              {medication.dosage_mg && (
                                <div className='flex justify-between'>
                                  <span className='font-medium text-text-tertiary'>
                                    Dosage:
                                  </span>
                                  <span className='text-text-foreground'>
                                    {medication.dosage_mg} mg
                                  </span>
                                </div>
                              )}
                              <div className='flex justify-between'>
                                <span className='font-medium text-text-tertiary'>
                                  Frequency:
                                </span>
                                <span className='text-text-foreground'>
                                  {formatMedicationFrequency(
                                    medication.frequency
                                  )}
                                </span>
                              </div>
                              {medication.notes && (
                                <div className='flex justify-between'>
                                  <span className='font-medium text-text-tertiary'>
                                    Notes:
                                  </span>
                                  <span className='text-text-foreground'>
                                    {medication.notes}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className='mt-4 flex gap-2 border-t border-slate-700 pt-4'>
                              <Button
                                onClick={() => {
                                  setEditingMedication(medication);
                                  setIsEditingMedication(true);
                                }}
                                size='sm'
                                className='flex-1 bg-strategy-gold text-precision-charcoal hover:bg-strategy-gold/90'
                                disabled={
                                  medicationMutation.isPending ||
                                  deleteMedicationMutation.isPending
                                }
                              >
                                <Edit3 className='mr-2 size-4' />
                                Edit
                              </Button>
                              <Button
                                onClick={() =>
                                  void handleDeleteMedication(medication.id)
                                }
                                variant='destructive'
                                size='sm'
                                className='flex-1'
                                disabled={deleteMedicationMutation.isPending}
                              >
                                {deleteMedicationMutation.isPending ? (
                                  <div className='flex items-center gap-2'>
                                    <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                                    Deleting...
                                  </div>
                                ) : (
                                  <>
                                    <Trash2 className='mr-2 size-4' />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className='py-8 text-center text-text-tertiary'>
                    <Activity className='mx-auto mb-4 size-12 text-gray-300' />
                    <p>No medications added yet</p>
                    <p className='text-sm'>
                      Add a medication to see its impact on your weight loss
                      goals
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Activity level configuration
const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Light (light exercise/sports 1-3 days/week)' },
  {
    value: 'moderate',
    label: 'Moderate (moderate exercise/sports 3-5 days/week)',
  },
  { value: 'active', label: 'Active (hard exercise/sports 6-7 days a week)' },
  {
    value: 'very_active',
    label: 'Very Active (very hard exercise, physical job)',
  },
];
