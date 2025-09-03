"use client";

import { useState, useEffect } from "react";
import { User, Activity, Settings, TrendingUp, Plus, Edit3, Trash2 } from "lucide-react";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserProfile, 
  WeightGoal, 
  UserMedication,
  MedicationType,
  convertLbsToKg,
  TIMEZONES,
  getCurrentTimezone,
  formatDateInTimezone
} from "@/api/userProfiles";
import { 
  useUserProfile, 
  useWeightGoal, 
  useUserProfileMutation, 
  useWeightGoalMutation 
} from "@/hooks/useUserProfile";
import { 
  useMedicationTypes, 
  useUserMedications, 
  useMedicationMutation, 
  useDeleteMedication,
  getMedicationTypeById,
  formatMedicationFrequency
} from "@/hooks/useMedications";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingMedication, setIsEditingMedication] = useState(false);

  // Get authenticated user
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Use custom hooks for data fetching - only when authenticated
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.sub || '');
  const { data: goal, isLoading: goalLoading } = useWeightGoal(user?.sub || '');
  const { data: medications, isLoading: medicationsLoading } = useUserMedications(user?.sub || '');
  const { data: medicationTypes, isLoading: medicationTypesLoading } = useMedicationTypes();

  // Use custom hooks for mutations
  const profileMutation = useUserProfileMutation();
  const goalMutation = useWeightGoalMutation();
  const medicationMutation = useMedicationMutation();
  const deleteMedicationMutation = useDeleteMedication();

  // Local state for editing
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [editingGoal, setEditingGoal] = useState<WeightGoal | null>(null);
  const [editingMedication, setEditingMedication] = useState<UserMedication | null>(null);

  // Initialize editing state when data loads
  useEffect(() => {
    if (profile) {
      setEditingProfile({ ...profile });
    }
    if (goal) {
      setEditingGoal({ ...goal });
    }
    if (medications && medications.length > 0) {
      setEditingMedication({ ...medications[0] });
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
      setEditingMedication({ ...medications[0] });
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
    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12, 0, 0);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    const newMedication: UserMedication = {
      id: `temp_${Date.now()}`, // Generate temporary ID for new medications
      user_id: user?.sub || '',
      medication_type_id: 1,
      start_date: todayString,
      end_date: undefined, // Set explicit undefined for optional field
      dosage_mg: undefined, // Set explicit undefined for optional field
      frequency: 'weekly',
      is_active: true,
      notes: undefined, // Set explicit undefined for optional field
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingMedication(newMedication);
    setIsEditingMedication(true);
  };

  const updateHeight = (ft: number, inches: number) => {
    if (editingProfile) {
      setEditingProfile({
        ...editingProfile,
        height_ft: ft,
        height_in: inches
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="h-8 w-8 text-teal-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Card className="max-w-md mx-auto">
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

  if (profileLoading || goalLoading || medicationsLoading || medicationTypesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="h-8 w-8 text-teal-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where profile or goal data failed to load
  if (!profile || !goal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Data Loading Issue</CardTitle>
              <CardDescription>
                Unable to load your profile data. This might be because:
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left space-y-2">
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>The backend API is not yet deployed</li>
                <li>You need to create your initial profile</li>
                <li>There was a temporary connection issue</li>
              </ul>
              <div className="mt-4 text-center">
                <Button onClick={() => window.location.reload()} variant="outline">
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your profile, goals, and preferences</p>
      </div>

      {/* User Profile Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-teal-600" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal information and activity level
              </CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editingProfile?.name || ''}
                    onChange={(e) => setEditingProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="birthdate">Birth Date</Label>
                  <DatePicker
                    value={editingProfile?.birthdate || ""}
                    onChange={(dateString) => {
                      if (dateString && editingProfile) {
                        console.log('DatePicker selected date string:', dateString);
                        
                        setEditingProfile({
                          ...editingProfile,
                          birthdate: dateString
                        });
                      }
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={editingProfile?.gender || 'male'}
                    onValueChange={(value) => setEditingProfile(prev => prev ? { ...prev, gender: value as 'male' | 'female' | 'other' } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Height</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Ft"
                        value={editingProfile?.height_ft || ''}
                        onChange={(e) => updateHeightFt(parseInt(e.target.value) || 0)}
                        min="0"
                        max="8"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="In"
                        value={editingProfile?.height_in || ''}
                        onChange={(e) => updateHeightIn(parseInt(e.target.value) || 0)}
                        min="0"
                        max="11"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="activity">Activity Level</Label>
                  <Select
                    value={editingProfile?.activity_level || 'moderate'}
                    onValueChange={(value) => setEditingProfile(prev => prev ? { ...prev, activity_level: value as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={editingProfile?.timezone || getCurrentTimezone()}
                    onValueChange={(value) => setEditingProfile(prev => prev ? { ...prev, timezone: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label} ({tz.offset})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleProfileSave} disabled={profileMutation.isPending}>
                  {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button onClick={handleProfileCancel} variant="outline">
                  Cancel
                </Button>
              </div>
              
              {profileMutation.isSuccess && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                  ✅ Profile updated successfully!
                </div>
              )}
              
              {profileMutation.isError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                  ❌ Error updating profile: {profileMutation.error?.message}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">Name</Label>
                <p className="text-lg font-medium">{profile.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Age</Label>
                <p className="text-lg font-medium">{profile.age} years old</p>
                <p className="text-sm text-gray-500">
                  {profile.birthdate ? `Born ${formatDateInTimezone(profile.birthdate, profile.timezone || 'America/New_York')}` : `${profile.age} years old`}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Gender</Label>
                <p className="text-lg font-medium capitalize">{profile.gender}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Height</Label>
                <p className="text-lg font-medium">{profile.height_ft}' {profile.height_in}"</p>
                <p className="text-sm text-gray-500">
                  {Math.round((profile.height_ft * 12 + profile.height_in) * 2.54)} cm
                </p>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">Activity Level</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {profile.activity_level.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Multiplier: {profile.activity_level === 'sedentary' ? '1.2' : 
                      profile.activity_level === 'light' ? '1.375' : 
                      profile.activity_level === 'moderate' ? '1.55' : 
                      profile.activity_level === 'active' ? '1.725' : 
                      profile.activity_level === 'very_active' ? '1.9' : '1.2'}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Timezone</Label>
                <p className="text-lg font-medium">{TIMEZONES.find(tz => tz.value === profile.timezone)?.label || profile.timezone}</p>
                <p className="text-sm text-gray-500">All dates are displayed in your local timezone</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weight Goals Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                Weight Loss Goals
              </CardTitle>
              <CardDescription>
                Set and track your weight loss objectives
              </CardDescription>
            </div>
            {!isEditingGoal && (
              <Button onClick={() => setIsEditingGoal(true)} variant="outline">
                Edit Goals
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingGoal ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startWeight">Starting Weight (lbs)</Label>
                  <Input
                    id="startWeight"
                    type="number"
                    step="0.1"
                    value={editingGoal?.start_weight_lbs || ''}
                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, start_weight_lbs: parseFloat(e.target.value) || 0 } : null)}
                    placeholder="200.0"
                  />
                </div>

                <div>
                  <Label htmlFor="targetWeight">Target Weight (lbs)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    value={editingGoal?.target_weight_lbs || ''}
                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, target_weight_lbs: parseFloat(e.target.value) || 0 } : null)}
                    placeholder="180.0"
                  />
                </div>

                <div>
                  <Label htmlFor="weeklyGoal">Weekly Goal (lbs)</Label>
                  <Input
                    id="weeklyGoal"
                    type="number"
                    step="0.1"
                    value={editingGoal?.weekly_goal_lbs || ''}
                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, weekly_goal_lbs: parseFloat(e.target.value) || 0 } : null)}
                    placeholder="1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="targetDate">Target Date</Label>
                  <DatePicker
                    value={editingGoal?.target_date || ""}
                    onChange={(dateString) => {
                      if (dateString && editingGoal) {
                        console.log('DatePicker selected target date string:', dateString);
                        
                        setEditingGoal({
                          ...editingGoal,
                          target_date: dateString
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleGoalSave} disabled={goalMutation.isPending}>
                  {goalMutation.isPending ? 'Saving...' : 'Save Goals'}
                </Button>
                <Button onClick={handleGoalCancel} variant="outline">
                  Cancel
                </Button>
              </div>
              
              {goalMutation.isSuccess && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                  ✅ Weight goals updated successfully!
                </div>
              )}
              
              {goalMutation.isError && (
                <div className="mt-2 p-2 bg-red-50 border border-green-200 rounded text-red-800 text-sm">
                  ❌ Error updating goals: {goalMutation.error?.message}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">Starting Weight</Label>
                <p className="text-lg font-medium">{goal.start_weight_lbs} lbs</p>
                <p className="text-sm text-gray-500">
                  {Math.round(convertLbsToKg(goal.start_weight_lbs) * 10) / 10} kg
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Target Weight</Label>
                <p className="text-lg font-medium">{goal.target_weight_lbs} lbs</p>
                <p className="text-sm text-gray-500">
                  {Math.round(convertLbsToKg(goal.target_weight_lbs) * 10) / 10} kg
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Weekly Goal</Label>
                <p className="text-lg font-medium">{goal.weekly_goal_lbs} lbs/week</p>
                <p className="text-sm text-gray-500">
                  {Math.round(convertLbsToKg(goal.weekly_goal_lbs) * 10) / 10} kg/week
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Target Date</Label>
                <p className="text-lg font-medium">
                  {goal.target_date ? formatDateInTimezone(goal.target_date, profile?.timezone || 'America/New_York') : 'Not set'}
                </p>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">Total Weight to Lose</Label>
                <p className="text-lg font-medium text-red-600">
                  {Math.round((goal.start_weight_lbs - goal.target_weight_lbs) * 10) / 10} lbs
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round(convertLbsToKg(goal.start_weight_lbs - goal.target_weight_lbs) * 10) / 10} kg
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

             {/* Medication Tracking Section */}
       <Card className="mb-8 pb-12">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-600" />
                Medication Tracking
              </CardTitle>
              <CardDescription>
                Track weight loss medications and their impact on your goals
              </CardDescription>
            </div>
            {!isEditingMedication && (
              <Button 
                onClick={handleAddMedication} 
                variant="outline"
                disabled={medicationsLoading || medicationTypesLoading}
              >
                {medicationTypesLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full"></div>
                    Loading...
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {medicationsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="border-0 shadow-sm animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isEditingMedication ? (
            <div className="space-y-4">
              {medicationTypesLoading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
                  </div>
                </div>
                             ) : (
                 <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                         <div className="space-y-3">
                       <Label htmlFor="medicationType">Medication</Label>
                       <Select
                         value={editingMedication?.medication_type_id?.toString() || '1'}
                         onValueChange={(value) => setEditingMedication(prev => prev ? { ...prev, medication_type_id: parseInt(value) } : null)}
                         disabled={medicationTypesLoading}
                       >
                         <SelectTrigger className="min-h-[40px]">
                           <SelectValue placeholder={medicationTypesLoading ? "Loading..." : "Select medication"}>
                             {(() => {
                                                               const selectedType = medicationTypes?.find((type: MedicationType) => type.id === editingMedication?.medication_type_id);
                               return selectedType ? selectedType.name : undefined;
                             })()}
                           </SelectValue>
                         </SelectTrigger>
                         <SelectContent className="z-50" position="popper" side="bottom" align="start">
                           {medicationTypesLoading ? (
                             <div className="p-2 text-center text-sm text-gray-500">
                               <div className="flex items-center justify-center gap-2">
                                 <div className="animate-spin h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full"></div>
                                 Loading medications...
                               </div>
                             </div>
                           ) : (medicationTypes && Array.isArray(medicationTypes) && medicationTypes.length === 0) ? (
                             <div className="p-2 text-center text-sm text-red-500">No medications available</div>
                           ) : (
                                                           medicationTypes?.map((type: MedicationType) => (
                               <SelectItem key={type.id} value={type.id.toString()}>
                                 <div className="flex flex-col space-y-1 py-2">
                                   <div className="flex items-center gap-2">
                                     <span className="font-medium text-sm">{type.name}</span>
                                     <Badge variant="outline" className="text-xs">
                                       {type.weekly_efficacy_multiplier}x efficacy
                                     </Badge>
                                   </div>
                                   <span className="text-xs text-gray-500">{type.generic_name}</span>
                                   <span className="text-xs text-gray-400 leading-tight line-clamp-2">{type.description}</span>
                                 </div>
                               </SelectItem>
                             ))
                           )}
                         </SelectContent>
                       </Select>
                     </div>

                                         <div className="space-y-3">
                       <Label htmlFor="medicationStartDate">Start Date</Label>
                       <DatePicker
                         value={editingMedication?.start_date || ""}
                         onChange={(dateString) => {
                           if (dateString && editingMedication) {
                             console.log('DatePicker selected medication start date string:', dateString);
                             
                             setEditingMedication({
                               ...editingMedication,
                               start_date: dateString
                             });
                           }
                         }}
                       />
                     </div>

                     <div className="space-y-3">
                       <Label htmlFor="medicationDosage">Dosage (mg)</Label>
                       <Input
                         id="medicationDosage"
                         type="number"
                         step="0.1"
                         value={editingMedication?.dosage_mg || ''}
                         onChange={(e) => setEditingMedication(prev => prev ? { ...prev, dosage_mg: parseFloat(e.target.value) || undefined } : null)}
                         placeholder="2.4"
                         className="min-h-[40px]"
                       />
                     </div>

                     <div className="space-y-3">
                       <Label htmlFor="medicationFrequency">Frequency</Label>
                       <Select
                         value={editingMedication?.frequency || 'weekly'}
                         onValueChange={(value) => setEditingMedication(prev => prev ? { ...prev, frequency: value } : null)}
                       >
                         <SelectTrigger className="min-h-[40px]">
                           <SelectValue placeholder="Select frequency">
                             {editingMedication?.frequency ? editingMedication.frequency.charAt(0).toUpperCase() + editingMedication.frequency.slice(1) : undefined}
                           </SelectValue>
                         </SelectTrigger>
                         <SelectContent className="z-50" position="popper" side="bottom" align="start">
                           <SelectItem value="daily">
                             <div className="flex items-center gap-2">
                               <span>Daily</span>
                               <Badge variant="secondary" className="text-xs">Most frequent</Badge>
                             </div>
                           </SelectItem>
                           <SelectItem value="weekly">
                             <div className="flex items-center gap-2">
                               <span>Weekly</span>
                               <Badge variant="default" className="text-xs">Standard</Badge>
                             </div>
                           </SelectItem>
                           <SelectItem value="biweekly">
                             <div className="flex items-center gap-2">
                               <span>Bi-weekly</span>
                               <Badge variant="outline" className="text-xs">Less frequent</Badge>
                             </div>
                           </SelectItem>
                         </SelectContent>
                       </Select>
                     </div>

                     <div className="md:col-span-2 space-y-2">
                       <Label htmlFor="medicationNotes">Notes</Label>
                       <Input
                         id="medicationNotes"
                         value={editingMedication?.notes || ''}
                         onChange={(e) => setEditingMedication(prev => prev ? { ...prev, notes: e.target.value } : null)}
                         placeholder="Any side effects, dosage changes, etc."
                         className="min-h-[40px]"
                       />
                     </div>
                                     </div>

                   <div className="flex gap-2 pt-8">
                     <Button 
                       onClick={handleMedicationSave} 
                      disabled={medicationMutation.isPending || deleteMedicationMutation.isPending}
                      className="flex-1"
                    >
                      {medicationMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </div>
                      ) : (
                        'Save Medication'
                      )}
                    </Button>
                    <Button 
                      onClick={handleMedicationCancel} 
                      variant="outline"
                      className="flex-1"
                      disabled={medicationMutation.isPending || deleteMedicationMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                                     {medicationMutation.isSuccess && (
                     <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                      ✅ Medication {editingMedication?.id?.startsWith('temp_') ? 'added' : 'updated'} successfully!
                    </div>
                  )}
                  
                                     {medicationMutation.isError && (
                     <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                      ❌ Error {editingMedication?.id?.startsWith('temp_') ? 'adding' : 'updating'} medication: {medicationMutation.error?.message}
                    </div>
                  )}

                                     {deleteMedicationMutation.isSuccess && (
                     <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                      ✅ Medication deleted successfully!
                    </div>
                  )}
                  
                                     {deleteMedicationMutation.isError && (
                     <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                      ❌ Error deleting medication: {deleteMedicationMutation.error?.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {medications && medications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {medications.map((medication) => {
                    const medicationType = getMedicationTypeById(medicationTypes, medication.medication_type_id);
                    return (
                      <Card key={medication.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{medicationType?.name || 'Unknown Medication'}</h4>
                              <p className="text-sm text-gray-600">{medicationType?.generic_name || 'Unknown'}</p>
                            </div>
                            <Badge variant={medication.is_active ? "default" : "secondary"}>
                              {medication.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Started:</span>
                              <span className="text-gray-900">
                                {formatDateInTimezone(medication.start_date, profile?.timezone || 'America/New_York')}
                              </span>
                            </div>
                            {medication.dosage_mg && (
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Dosage:</span>
                                <span className="text-gray-900">{medication.dosage_mg} mg</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Frequency:</span>
                              <span className="text-gray-900">{formatMedicationFrequency(medication.frequency)}</span>
                            </div>
                            {medication.notes && (
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Notes:</span>
                                <span className="text-gray-900">{medication.notes}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button 
                              onClick={() => {
                                setEditingMedication(medication);
                                setIsEditingMedication(true);
                              }} 
                              variant="outline" 
                              size="sm"
                              className="flex-1"
                              disabled={medicationMutation.isPending || deleteMedicationMutation.isPending}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              onClick={() => handleDeleteMedication(medication.id)} 
                              variant="destructive" 
                              size="sm"
                              className="flex-1"
                              disabled={deleteMedicationMutation.isPending}
                            >
                              {deleteMedicationMutation.isPending ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                  Deleting...
                                </div>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
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
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No medications added yet</p>
                  <p className="text-sm">Add a medication to see its impact on your weight loss goals</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Activity level configuration
const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Light (light exercise/sports 1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (moderate exercise/sports 3-5 days/week)' },
  { value: 'active', label: 'Active (hard exercise/sports 6-7 days a week)' },
  { value: 'very_active', label: 'Very Active (very hard exercise, physical job)' }
];
