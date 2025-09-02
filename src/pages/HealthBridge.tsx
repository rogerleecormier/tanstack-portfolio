/**
 * @fileoverview HealthBridge Weight Analysis Dashboard
 * @description Interactive health data analysis tool for tracking weight changes over time
 * @author Roger Lee Cormier
 * @version 1.0.0
 * @lastUpdated 2024
 * 
 * @features
 * - Real-time weight data visualization with Recharts
 * - Advanced filtering by date ranges, months, and years
 * - Interactive charts with responsive design
 * - Data aggregation and trend analysis
 * - Public project with private weight entry (requires authentication)
 * - Pagination for large datasets
 * - Sortable data tables
 * 
 * @technologies
 * - React 19 with TypeScript
 * - TanStack React Query for data fetching
 * - Recharts for data visualization
 * - shadcn/ui components
 * - Tailwind CSS for styling
 * - Cloudflare Access authentication
 * 
 * @searchKeywords
 * - health analysis
 * - weight tracking
 * - data visualization
 * - health metrics
 * - fitness dashboard
 * - health data
 * - weight changes
 * - health trends
 * - data filtering
 * - health monitoring
 * 
 * @searchTags
 * ["health", "fitness", "analytics", "data", "visualization", "tracking", "metrics", "dashboard", "public", "authentication"]
 * 
 * @searchSection
 * "Health Analysis"
 * 
 * @searchDescription
 * "Public health data analysis dashboard for tracking weight changes over time with advanced filtering, real-time charts, and comprehensive data visualization. Weight entry requires authentication."
 */

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWeights } from "../api/healthBridge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableFooter,
} from "../components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
// Remove MermaidChart import
// import MermaidChart from "../components/MermaidChart";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { FilterIcon, TrendingUp, Activity } from "lucide-react";
import { H1, H2 } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
// Add shadcn chart imports
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent, // <-- Add this import
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { useAuth } from "../hooks/useAuth";
import { 
  UserProfilesAPI, 
  calculateAge, 
  calculateBMR, 
  calculateTDEE,
  calculateMedicationProjection,
  formatDateInTimezone
} from "@/api/userProfiles";
import { useMedicationTypes } from "@/hooks/useMedications";

const PAGE_SIZE = 10;

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)', multiplier: 1.2 },
  { value: 'light', label: 'Light (light exercise/sports 1-3 days/week)', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderate (moderate exercise/sports 3-5 days/week)', multiplier: 1.55 },
  { value: 'active', label: 'Active (hard exercise/sports 6-7 days a week)', multiplier: 1.725 },
  { value: 'very_active', label: 'Very Active (very hard exercise/sports & physical job)', multiplier: 1.9 }
];

/**
 * Helper functions for date filtering and data processing
 * These functions provide date range filtering capabilities for the HealthBridge dashboard
 */

/**
 * Checks if a date is within a specified number of days from now
 * @param dateStr - Date string to check
 * @param days - Number of days to check within
 * @returns {boolean} True if date is within specified days
 * @example
 * ```tsx
 * const isRecent = isWithinDays("2024-01-01", 7); // Check if within last 7 days
 * ```
 */
function isWithinDays(dateStr: string, days: number) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}

/**
 * Checks if a date falls within a specific year and month
 * @param dateStr - Date string to check
 * @param year - Target year
 * @param month - Target month (0-11, where 0 is January)
 * @returns {boolean} True if date matches the specified year and month
 * @example
 * ```tsx
 * const isInJanuary2024 = isWithinMonth("2024-01-15", 2024, 0); // January 2024
 * ```
 */
function isWithinMonth(dateStr: string, year: number, month: number) {
  const date = new Date(dateStr);
  return date.getFullYear() === year && date.getMonth() === month;
}

/**
 * Checks if a date falls within a specified date range
 * @param dateStr - Date string to check
 * @param start - Start date of the range
 * @param end - End date of the range
 * @returns {boolean} True if date is within the specified range (inclusive)
 * @example
 * ```tsx
 * const startDate = new Date("2024-01-01");
 * const endDate = new Date("2024-01-31");
 * const isInRange = isWithinRange("2024-01-15", startDate, endDate); // True
 * ```
 */
function isWithinRange(dateStr: string, start: Date, end: Date) {
  const date = new Date(dateStr);
  return date >= start && date <= end;
}

/**
 * Checks if a date falls within the last N months from now
 * @param dateStr - Date string to check
 * @param months - Number of months to look back
 * @returns {boolean} True if date is within the last N months
 * @example
 * ```tsx
 * const isLast3Months = isWithinMonths("2024-01-15", 3); // Check if within last 3 months
 * ```
 */
function isWithinMonths(dateStr: string, months: number) {
  const date = new Date(dateStr);
  const now = new Date();
  const past = new Date(
    now.getFullYear(),
    now.getMonth() - months,
    now.getDate()
  );
  return date >= past && date <= now;
}

/**
 * Custom Date Picker Component using shadcn/ui Calendar
 * 
 * @component ShadcnDatePicker
 * @description A reusable date picker component that integrates with the HealthBridge dashboard
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected date value
 * @param {function} props.onChange - Callback function when date changes
 * @param {boolean} [props.disabled=false] - Whether the date picker is disabled
 * 
 * @example
 * ```tsx
 * <ShadcnDatePicker
 *   value={dateRange.start}
 *   onChange={(val) => setDateRange(prev => ({ ...prev, start: val }))}
 *   disabled={false}
 * />
 * ```
 * 
 * @features
 * - Integrates with shadcn/ui Calendar component
 * - Supports disabled state
 * - Triggers onChange callback on date selection
 * - Responsive design with proper styling
 * 
 * @returns {JSX.Element} Rendered date picker component
 */
function ShadcnDatePicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const dateObj = value ? new Date(value) : undefined;
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-[240px] pl-3 text-left font-normal border rounded ${
            !dateObj ? "text-muted-foreground" : ""
          }`}
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {dateObj ? format(dateObj, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={(d) => {
            if (d) {
              onChange(d.toISOString().slice(0, 16)); // yyyy-mm-ddTHH:mm
              setOpen(false); // Auto-close after selection
            }
          }}
          disabled={(date) =>
            disabled || date > new Date() || date < new Date("1900-01-01")
          }
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * Add Weight Form Component
 * 
 * @component AddWeightBox
 * @description Form component for adding new weight entries to the HealthBridge system
 * @features
 * - Weight input with unit selection (lbs/kg)
 * - Date and time picker for entry timestamp
 * - Form validation and error handling
 * - Integration with TanStack React Query mutations
 * - Real-time data updates after submission
 * 
 * @state
 * - weight: Current weight input value
 * - unit: Selected weight unit (lb or kg)
 * - date: Selected date and time for entry
 * - error: Current error message
 * - success: Success state indicator
 * 
 * @example
 * ```tsx
 * <AddWeightBox />
 * ```
 * 
 * @returns {JSX.Element} Rendered weight input form
 */
function AddWeightBox() {
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"lb" | "kg">("lb"); // default to lbs
  const [date, setDate] = useState(() => {
    const now = new Date();
    // Format as yyyy-MM-ddTHH:mm in local time
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = now.getFullYear();
    const MM = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const HH = pad(now.getHours());
    const mm = pad(now.getMinutes());
    return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      weight,
      unit,
      timestamp,
    }: {
      weight: number;
      unit: "lb" | "kg";
      timestamp: string;
    }) => {
      const res = await fetch(
        "https://health-bridge-api.rcormier.workers.dev/api/health/weight",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer Twins2015!",
          },
          body: JSON.stringify({ weight, unit, timestamp }),
        }
      );
      if (!res.ok) throw new Error("Failed to add weight");
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setWeight("");
      queryClient.invalidateQueries({ queryKey: ["weights"] });
      setTimeout(() => setSuccess(false), 2000);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const val = Number(weight);
    if (isNaN(val) || val <= 0) {
      setError(`Enter a valid weight in ${unit} (e.g. 180.5)`);
      return;
    }
    if (!date) {
      setError("Please select a date/time");
      return;
    }
    mutation.mutate({ weight: val, unit, timestamp: new Date(date).toISOString() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 max-w-xl w-full flex flex-col gap-2"
    >
      {/* Responsive row: weight + radios + date & time + button */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Weight input with label and radio buttons */}
        <div className="flex flex-row items-center flex-1 sm:max-w-[340px] sm:min-w-[420px]">
          <label className="font-medium mr-2 whitespace-nowrap">
            Enter Weight ({unit}):
          </label>
          <input
            type="text"
            inputMode="decimal"
            pattern="^\d+(\.\d{1,2})?$"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === "lb" ? "e.g. 180.5" : "e.g. 82.50"}
            className="border rounded px-2 py-1 w-[100px] sm:w-[160px] sm:flex-grow"
            required
          />
          {/* lbs/kg radio buttons to the right of weight input */}
          <div className="flex gap-2 items-center ml-2">
            <label>
              <input
                type="radio"
                name="unit"
                value="lb"
                checked={unit === "lb"}
                onChange={() => setUnit("lb")}
              />{" "}
              lbs
            </label>
            <label>
              <input
                type="radio"
                name="unit"
                value="kg"
                checked={unit === "kg"}
                onChange={() => setUnit("kg")}
              />{" "}
              kg
            </label>
          </div>
        </div>
        {/* Date picker with label and button to the right in desktop, stacked in mobile */}
        <div className="flex flex-col w-full sm:flex-row sm:items-center flex-1 mt-2 sm:mt-0 sm:pl-4">
          <div className="flex flex-row items-center w-full">
            <label className="font-medium mr-2 whitespace-nowrap">
              Date & Time:
            </label>
            <div className="flex-1 min-w-0 flex flex-row items-center">
              <ShadcnDatePicker value={date} onChange={setDate} />
            </div>
          </div>
          {/* Button: below date picker in mobile, right of date picker in desktop */}
          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 text-white rounded w-full mt-2 sm:ml-4 sm:mt-0 sm:w-auto h-[40px] self-center whitespace-nowrap"
            disabled={mutation.isPending}
          >
            Add Weight
          </button>
        </div>
      </div>
      {/* Error and success messages */}
      <div className="w-full">
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">Weight added!</div>}
      </div>
    </form>
  );
}

/**
 * HealthBridge Weight Analysis Dashboard Component
 * 
 * @component HealthBridgePage
 * @description Main component for the HealthBridge weight analysis dashboard
 * @example
 * ```tsx
 * <HealthBridgePage />
 * ```
 * 
 * @features
 * - Fetches weight data using TanStack React Query
 * - Provides advanced filtering and sorting capabilities
 * - Renders interactive charts and data tables
 * - Handles pagination for large datasets
 * - Supports custom date range selection
 * 
 * @state
 * - sortBy: Current sorting column (date or weight)
 * - sortDir: Sorting direction (asc or desc)
 * - selectedYear: Filtered year selection
 * - selectedMonth: Filtered month selection
 * - quickRange: Quick date range filter
 * - dateRange: Custom date range selection
 * - page: Current page for pagination
 * 
 * @returns {JSX.Element} Rendered HealthBridge dashboard
 */
export default function HealthBridgePage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Generate TOC entries for the sidebar
  useEffect(() => {
    const tocEntries = [
      { title: "📊 Summary Statistics", slug: "summary-statistics" },
      { title: "📈 Weight Trend", slug: "weight-trend" },
      { title: "💊 Medication Impact Analysis", slug: "medication-impact" },
      { title: "⚡ Metabolic Information", slug: "metabolic-info" },
      { title: "🔍 Data Filters", slug: "data-filters" },
      { title: "📋 Weight Data Table", slug: "weight-data-table" }
    ];

    // Dispatch custom event to update sidebar TOC
    window.dispatchEvent(new CustomEvent('toc-updated', { 
      detail: { toc: tocEntries, file: 'healthbridge' } 
    }));

    // Clean up event when component unmounts
    return () => {
      window.dispatchEvent(new CustomEvent('toc-updated', { 
        detail: { toc: [], file: null } 
      }));
    };
  }, []);

  // Get authentication status
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["weights"],
    queryFn: fetchWeights,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch user profile, weight goal, and medications for analysis
  const { data: profile } = useQuery({
    queryKey: ['userProfile', '1'],
    queryFn: () => UserProfilesAPI.getUserProfile('1'),
  });

  const { data: goal } = useQuery({
    queryKey: ['weightGoal', '1'],
    queryFn: () => UserProfilesAPI.getWeightGoal('1'),
  });

  const { data: medications } = useQuery({
    queryKey: ['userMedications', '1'],
    queryFn: () => UserProfilesAPI.getUserMedications('1'),
  });

  // Get medication types
  const { data: medicationTypes } = useMedicationTypes();

  // Sort state
  const [sortBy, setSortBy] = useState<"date" | "weight">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Filter states
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [quickRange, setQuickRange] = useState<
    "all" | "7" | "14" | "30" | "3m" | "6m"
  >("30");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [customRangeActive, setCustomRangeActive] = useState(false);
  const [page, setPage] = useState(1);

  // Sort data by selected column and direction
  const sortedData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => {
      if (sortBy === "date") {
        return sortDir === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortDir === "asc" ? a.kg - b.kg : b.kg - a.kg;
      }
    });
    return sorted;
  }, [data, sortBy, sortDir]);

  // Filter logic
  const filteredData = useMemo(() => {
    let result = sortedData;
    if (customRangeActive && dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      result = result.filter((row) => isWithinRange(row.date, start, end));
      return result;
    }
    // Quick range filter
    if (quickRange === "7" || quickRange === "14" || quickRange === "30") {
      result = result.filter((row) =>
        isWithinDays(row.date, Number(quickRange))
      );
      return result;
    }
    if (quickRange === "3m") {
      result = result.filter((row) => isWithinMonths(row.date, 3));
      return result;
    }
    if (quickRange === "6m") {
      result = result.filter((row) => isWithinMonths(row.date, 6));
      return result;
    }
    // Year/month filter
    if (selectedYear !== "all") {
      result = result.filter(
        (row) => new Date(row.date).getFullYear() === selectedYear
      );
    }
    if (selectedMonth !== "all") {
      result = result.filter((row) =>
        isWithinMonth(row.date, selectedYear as number, selectedMonth as number)
      );
    }
    return result;
  }, [
    sortedData,
    selectedYear,
    selectedMonth,
    quickRange,
    customRangeActive,
    dateRange,
  ]);

  // Automatically update dateRange to match filtered data set each time a filter changes, unless custom range is active
  useEffect(() => {
    if (!customRangeActive && filteredData.length > 0) {
      const startDate = filteredData[filteredData.length - 1].date;
      // Use local datetime for end date
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const yyyy = now.getFullYear();
      const MM = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const HH = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const localEndDate = `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
      if (dateRange.start !== startDate || dateRange.end !== localEndDate) {
        setDateRange({ start: startDate, end: localEndDate });
      }
    }
  }, [filteredData, customRangeActive, dateRange.start, dateRange.end]);

  // Paginated data and total pages
  const paginatedData = useMemo(() => {
    const startIdx = (page - 1) * PAGE_SIZE;
    return filteredData.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredData, page]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  // Extract years and months for filter dropdowns
  // Removed unused 'years' variable

  // Removed unused 'months' variable

  // Metrics calculation for filteredData
  const metrics = useMemo(() => {
    if (!filteredData.length) return null;
    const lbsArray = filteredData.map((row) => row.kg * 2.20462);
    const first = lbsArray[lbsArray.length - 1];
    const last = lbsArray[0];
    const lbsLost = (last - first).toFixed(1);
    const avg = (lbsArray.reduce((a, b) => a + b, 0) / lbsArray.length).toFixed(1);
    const min = Math.min(...lbsArray).toFixed(1);
    const max = Math.max(...lbsArray).toFixed(1);
    const startDate = new Date(
      filteredData[filteredData.length - 1].date
    ).toLocaleDateString();
    const endDate = new Date(filteredData[0].date).toLocaleDateString();
    return {
      lbsLost,
      avg,
      min,
      max,
      count: filteredData.length,
      startDate,
      endDate,
    };
  }, [filteredData]);

  // Calculate medication projections if medication and goal exist
  const medicationProjection = useMemo(() => {
    if (!profile || !goal || !medications?.length || !medicationTypes) return null;
    
    const activeMedication = medications.find(m => m.is_active);
    if (!activeMedication) return null;
    
    // Get current weight from the most recent weight entry
    const currentWeight = filteredData.length > 0 ? filteredData[0].kg * 2.20462 : 0;
    if (currentWeight === 0) return null;
    
    // Get medication type for multiplier
    const medicationType = medicationTypes.find(mt => mt.id === activeMedication.medication_type_id);
    if (!medicationType) return null;
    
    // Calculate natural weekly loss (assume 1-2 lbs per week naturally)
    const naturalWeeklyLoss = 1.5; // Default natural weight loss
    
    return calculateMedicationProjection(
      currentWeight,
      goal.target_weight_lbs,
      naturalWeeklyLoss,
      medicationType.weekly_efficacy_multiplier
    );
  }, [profile, goal, medications, medicationTypes, filteredData]);

  // Calculate current age, BMR, and TDEE
  const currentAge = useMemo(() => {
    if (!profile?.birthdate) return null;
    return calculateAge(profile.birthdate);
  }, [profile?.birthdate]);

  const currentBMR = useMemo(() => {
    if (!profile) return null;
    return calculateBMR(profile);
  }, [profile]);

  const currentTDEE = useMemo(() => {
    if (!profile || !currentBMR) return null;
    return calculateTDEE(profile);
  }, [profile, currentBMR]);

  // Prepare chart data for shadcn chart
  const chartData = useMemo(() => {
    return filteredData
      .slice()
      .reverse()
      .map((row) => ({
        date: new Date(row.date).toLocaleDateString(),
        weight: Number((row.kg * 2.20462).toFixed(1)),
      }));
  }, [filteredData]);




















































































































  // Y-axis domain state
  const [yDomain, setYDomain] = useState<[number, number] | undefined>(undefined);
































  useEffect(() => {
    if (chartData.length > 0) {
      const weights = chartData.map((d) => d.weight);
      const min = Math.min(...weights);
      const max = Math.max(...weights);
      const padding = Math.max(2, Math.round((max - min) * 0.05)); // 5% or at least 2 lbs
      setYDomain([min - padding, max + padding]);
    } else {
      setYDomain(undefined);

    }
  }, [chartData]);























  /**
   * Utility functions for sorting and filtering
   */

  /**
   * Gets the appropriate arrow symbol for sort direction indication
   * @param col - Column name to check (date or weight)
   * @returns {string} Arrow symbol indicating sort direction or empty string if not sorted
   * @example
   * ```tsx
   * const arrow = getArrow("date"); // Returns "↑", "↓", or ""
   * ```
   */
  function getArrow(col: "date" | "weight") {
    if (sortBy !== col) return "";
    return sortDir === "asc" ? "↑" : "↓";
  }

  /**
   * Handles column sorting with toggle functionality
   * @param col - Column to sort by (date or weight)
   * @description
   * - If clicking the same column, toggles between ascending and descending
   * - If clicking a different column, sets it as the new sort column with descending order
   * - Resets pagination to page 1 when sorting changes
   * @example
   * ```tsx
   * <TableHead onClick={() => handleSort("date")}>Date {getArrow("date")}</TableHead>
   * ```
   */
  function handleSort(col: "date" | "weight") {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
    setPage(1);
  }

  /**
   * Filter handler functions
   */

  /**
   * Handles quick range filter selection
   * @param days - Quick range selection (all, 7, 14, 30, 3m, 6m)
   * @description
   * - Sets the quick range filter
   * - Resets year and month filters to "all"
   * - Deactivates custom date range
   * - Resets pagination to page 1
   * @example
   * ```tsx
   * <button onClick={() => handleQuickRange("7")}>Last 7 Days</button>
   * ```
   */
  const handleQuickRange = (days: "all" | "7" | "14" | "30" | "3m" | "6m") => {
    setQuickRange(days);
    setSelectedYear("all");
    setSelectedMonth("all");
    setCustomRangeActive(false);
    setPage(1);
  };

  // Now check loading/error AFTER all hooks
     if (isLoading) {
     return (
       <div className="flex items-center justify-center min-h-screen p-4">
         <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
           <p className="text-teal-600">Loading health data...</p>
         </div>
       </div>
     );
   }
  
     if (error) {
     console.error('HealthBridge error:', error);
     return (
       <div className="flex items-center justify-center min-h-screen p-4">
         <div className="text-center max-w-md">
           <div className="text-red-500 text-6xl mb-4">⚠️</div>
           <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
           <p className="text-gray-600 mb-4">
             {error instanceof Error ? error.message : 'Unable to load health data'}
           </p>
           <div className="space-y-2 text-sm text-gray-500 mb-6">
             <p>• Check your internet connection</p>
             <p>• Try refreshing the page</p>
             <p>• Mobile networks may be slower</p>
           </div>
           <div className="space-x-4">
             <button 
               onClick={() => window.location.reload()} 
               className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
             >
               Refresh Page
             </button>
           </div>
         </div>
       </div>
     );
   }

     return (
     <div>
        <H1 className="mb-4">Body Weight Analysis</H1>
                 <p className="text-xl text-muted-foreground mb-6">
           Track, analyze, and visualize your body weight trends over time. Explore summary statistics and view progress with interactive charts and filters.
         </p>
         
         {/* Weight Entry Section - Only visible when authenticated */}
         {isAuthenticated && (
           <>
             <AddWeightBox />
             <hr className="my-6 border-t border-gray-300" />
           </>
         )}
         
         {/* Public Notice for Non-Authenticated Users */}
         {!isAuthenticated && !authLoading && (
           <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
             <p className="text-blue-800 text-sm">
               💡 <strong>Want to track your own weight?</strong> Sign in to add new measurements and track your progress over time.
             </p>
           </div>
         )}
                 <section className="mb-8">
           <H2 id="summary-statistics" className="mb-4">📊 Summary Statistics</H2>
          <div className="flex flex-wrap gap-4 mb-6">
            {metrics && (
              <>
                <Card className="p-4 min-w-[160px]">
                  <div className="text-sm text-muted-foreground">
                    Weight Change
                  </div>
                  <div className="text-xl font-bold">{metrics.lbsLost} lbs</div>
                </Card>
                <Card className="p-4 min-w-[160px]">
                  <div className="text-sm text-muted-foreground">
                    Average Weight
                  </div>
                  <div className="text-xl font-bold">{metrics.avg} lbs</div>
                </Card>
                <Card className="p-4 min-w-[160px]">
                  <div className="text-sm text-muted-foreground">
                    Lowest Weight
                  </div>
                  <div className="text-xl font-bold">{metrics.min} lbs</div>
                </Card>
                <Card className="p-4 min-w-[160px]">
                  <div className="text-sm text-muted-foreground">
                    Highest Weight
                  </div>
                  <div className="text-xl font-bold">{metrics.max} lbs</div>
                </Card>
                <Card className="p-4 min-w-[160px]">
                  <div className="text-sm text-muted-foreground">Entries</div>
                  <div className="text-xl font-bold">{metrics.count}</div>
                </Card>
                <Card className="p-4 min-w-[160px]">
                  <div className="text-sm text-muted-foreground">Date Range</div>
                  <div className="text-xl font-bold">
                    {metrics.startDate} - {metrics.endDate}
                  </div>
                </Card>
              </>
            )}
          </div>
        </section>
                 <section className="mb-8">
           <H2 id="weight-trend" className="mb-4">📈 Weight Trend</H2>
          <Card className="p-4 mb-6" style={{ width: "100%", maxWidth: "none" }}>
            <ChartContainer
              config={{
                weight: {
                  label: "Weight",
                  color: "#14b8a6",
                },
              }}
              className="aspect-auto h-[280px] sm:h-[320px] w-full"
            >
              <LineChart
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis domain={yDomain} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="weight"
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }
                    />
                  }
                />
                <Line
                  dataKey="weight"
                  type="monotone"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </Card>
        </section>

        {/* Medication Impact Analysis Section */}
        {medicationProjection && (
          <section className="mb-8">
            <H2 id="medication-impact" className="mb-4">💊 Medication Impact Analysis</H2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  How your medication affects your weight loss timeline
                </CardTitle>
                <CardDescription>
                  Analysis based on your current medication and weight goal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Natural Weight Loss (No Medication)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Weekly Loss:</span>
                        <span className="font-medium">{medicationProjection.natural_weekly_loss} lbs/week</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Timeline:</span>
                        <span className="font-medium">{medicationProjection.natural_timeline_weeks} weeks</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completion:</span>
                        <span className="font-medium">
                          {goal?.target_date ? formatDateInTimezone(goal.target_date, profile?.timezone || 'America/New_York') : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">With Medication</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Weekly Loss:</span>
                        <span className="font-medium text-green-600">{medicationProjection.medication_weekly_loss} lbs/week</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Timeline:</span>
                        <span className="font-medium text-green-600">{medicationProjection.medication_timeline_weeks} weeks</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completion:</span>
                        <span className="font-medium text-green-600">
                          {new Date(medicationProjection.projected_completion_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {medicationProjection.medication_impact_percentage}% Faster
                  </div>
                  <div className="text-sm text-gray-500">
                    Your medication accelerates weight loss by {medicationProjection.medication_impact_percentage}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Metabolic Information Section */}
        {currentBMR && currentTDEE && (
          <section className="mb-8">
            <H2 id="metabolic-info" className="mb-4">⚡ Metabolic Information</H2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-600" />
                  Calculated based on your profile and activity level
                </CardTitle>
                <CardDescription>
                  Your body's energy requirements and metabolism
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{currentAge}</div>
                    <div className="text-sm text-gray-500">Age (years)</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{currentBMR}</div>
                    <div className="text-sm text-gray-500">BMR (calories/day)</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{currentTDEE}</div>
                    <div className="text-sm text-gray-500">TDEE (calories/day)</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Activity Level Impact Analysis</h4>
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map((level) => {
                      const projectedTDEE = Math.round((currentBMR || 0) * level.multiplier);
                      const isCurrent = level.value === profile?.activity_level;
                      
                      return (
                        <div key={level.value} className={`flex items-center justify-between p-3 rounded-lg border ${
                          isCurrent ? 'border-teal-200 bg-teal-50' : 'border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium capitalize ${
                              isCurrent ? 'text-teal-700' : 'text-gray-700'
                            }`}>
                              {level.value.replace('_', ' ')}
                            </span>
                            {isCurrent && <Badge variant="secondary">Current</Badge>}
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${
                              isCurrent ? 'text-teal-700' : 'text-gray-700'
                            }`}>
                              {projectedTDEE} cal/day
                            </div>
                            <div className="text-xs text-gray-500">
                              {level.multiplier}x multiplier
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Filters Section: Quick Filters & Custom Range side by side on desktop, stacked on mobile */}
         <section className="mb-8">
           <H2 id="data-filters" className="mb-4">🔍 Data Filters</H2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FilterIcon className="w-4 h-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-4 w-full max-w-[500px] sm:max-w-[900px] min-w-[0] box-border"
              side="bottom"
              align="start"
            >
              <div className="flex flex-col sm:flex-row flex-wrap gap-8 w-full items-start justify-start">
                {/* Quick Filters */}
                <div className="flex-1 min-w-[220px]">
                  <div className="mb-2 font-semibold">Quick Filters</div>
                  <div className="mb-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 justify-start items-start w-full">
                    <button
                      className={`px-2 py-1 border rounded ${quickRange === "7" ? "bg-blue-100" : ""}`}
                      onClick={() => handleQuickRange("7")}
                    >
                      Last 7 days
                    </button>
                    <button
                      className={`px-2 py-1 border rounded ${quickRange === "14" ? "bg-blue-100" : ""}`}
                      onClick={() => handleQuickRange("14")}
                    >
                      Last 14 days
                    </button>
                    <button
                      className={`px-2 py-1 border rounded ${quickRange === "30" ? "bg-blue-100" : ""}`}
                      onClick={() => handleQuickRange("30")}
                    >
                      Last 30 days
                    </button>
                    <button
                      className={`px-2 py-1 border rounded ${quickRange === "3m" ? "bg-blue-100" : ""}`}
                      onClick={() => handleQuickRange("3m")}
                    >
                      Last 3 months
                    </button>
                    <button
                      className={`px-2 py-1 border rounded ${quickRange === "6m" ? "bg-blue-100" : ""}`}
                      onClick={() => handleQuickRange("6m")}
                    >
                      Last 6 months
                    </button>
                    <button
                      className={`px-2 py-1 border rounded ${quickRange === "all" ? "bg-blue-100" : ""}`}
                      onClick={() => handleQuickRange("all")}
                    >
                      All
                    </button>
                  </div>
                </div>
                {/* Custom Range */}
                <div className="flex-1 min-w-[220px] sm:ml-auto w-full">
                  <div className="font-semibold mb-2">Custom Range</div>
                  <div className="grid grid-cols-1 gap-4 w-full">
                    {/* Start Label and Field */}
                    <div className="flex items-center w-full">
                      <label className="font-medium mr-2 text-left min-w-[60px]">
                        Start:
                      </label>
                      <div className="flex-1 min-w-0">
                        <ShadcnDatePicker
                          value={dateRange.start}
                          onChange={(val) => {
                            setCustomRangeActive(true);
                            setDateRange((prev) => ({ ...prev, start: val }));
                            setQuickRange("all");
                            setPage(1);
                          }}
                        />
                      </div>
                    </div>
                    {/* End Label and Field */}
                    <div className="flex items-center w-full">
                      <label className="font-medium mr-2 text-left min-w-[60px]">
                        End:
                      </label>
                      <div className="flex-1 min-w-0">
                        <ShadcnDatePicker
                          value={dateRange.end}
                          onChange={(val) => {
                            setCustomRangeActive(true);
                            setDateRange((prev) => ({ ...prev, end: val }));
                            setQuickRange("all");
                            setPage(1);
                          }}
                          disabled={!dateRange.start}
                        />
                      </div>
                    </div>
                    {/* Clear button and record count */}
                    {customRangeActive && (
                      <div className="flex items-center mt-2">
                        <button
                          className="px-2 py-1 border rounded bg-gray-100"
                          onClick={() => {
                            setCustomRangeActive(false);
                            setDateRange({ start: "", end: "" });
                          }}
                        >
                          Clear
                        </button>
                        <span className="ml-2 text-xs text-gray-400">
                          ({filteredData.length} records)
                        </span>
                      </div>
                    )}
                  </div>
                  {customRangeActive && filteredData.length === 500 && (
                    <div className="w-full flex">
                      <span className="text-sm text-orange-600 mb-1" style={{ minWidth: "240px" }}>
                        Maximum of 500 records returned for the selected range.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </section>
                 {/* Dynamic Table Header */}
         <H2 id="weight-data-table" className="mb-4">📋 Weight Data Table</H2>
        <p className="text-sm text-gray-600 mb-4">
          {filteredData.length > 0
            ? `Showing weight changes from ${metrics?.startDate} to ${metrics?.endDate}`
            : "No weight data available"}
        </p>
        {paginatedData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("date")}
                >
                  Date {getArrow("date")}
                </TableHead>
                <TableHead
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("weight")}
                >
                  Weight (lbs) {getArrow("weight")}
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Change from Previous
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Change from Start
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  BMI
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  Trend
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => {
                const currentWeight = row.kg * 2.20462;
                const previousWeight = index < paginatedData.length - 1 
                  ? paginatedData[index + 1].kg * 2.20462 
                  : null;
                const startWeight = filteredData[filteredData.length - 1].kg * 2.20462;
                
                const changeFromPrevious = previousWeight !== null 
                  ? currentWeight - previousWeight 
                  : null;
                const changeFromStart = currentWeight - startWeight;
                
                // Calculate BMI (assuming average height of 5'9" / 175cm if not available)
                const heightInMeters = 1.75; // Default height, could be made configurable
                const bmi = (currentWeight / 2.20462) / (heightInMeters * heightInMeters);
                
                // Determine trend based on recent changes
                const getTrendIcon = () => {
                  if (changeFromPrevious === null) return "➖";
                  if (changeFromPrevious > 0.5) return "📈";
                  if (changeFromPrevious < -0.5) return "📉";
                  return "➖";
                };
                
                const getBMICategory = (bmi: number) => {
                  if (bmi < 18.5) return "Underweight";
                  if (bmi < 25) return "Normal";
                  if (bmi < 30) return "Overweight";
                  return "Obese";
                };
                
                return (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">
                      {new Date(row.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {currentWeight.toFixed(1)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {changeFromPrevious !== null ? (
                        <span className={`font-medium ${
                          changeFromPrevious > 0 ? 'text-red-600' : 
                          changeFromPrevious < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {changeFromPrevious > 0 ? '+' : ''}{changeFromPrevious.toFixed(1)} lbs
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className={`font-medium ${
                        changeFromStart > 0 ? 'text-red-600' : 
                        changeFromStart < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {changeFromStart > 0 ? '+' : ''}{changeFromStart.toFixed(1)} lbs
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex flex-col">
                        <span className="font-medium">{bmi.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">
                          {getBMICategory(bmi)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-lg">{getTrendIcon()}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold">Summary</TableCell>
                <TableCell className="font-semibold">
                  {metrics ? `${metrics.avg} lbs avg` : ''}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-center">
                  {metrics ? `${metrics.lbsLost} lbs total` : ''}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-center">
                  {metrics ? `${metrics.count} entries` : ''}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-center">
                  {metrics ? `${metrics.min}-${metrics.max} lbs` : ''}
                </TableCell>
                <TableCell className="hidden xl:table-cell"></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        ) : (
          <div>No data for selected filter.</div>
        )}
        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
               </div>
     );
   }

// function formatLocalDate(dateStr: string) {
//   const d = new Date(dateStr);
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }