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
} from "../components/ui/table";
import { Card } from "../components/ui/card";
import MermaidChart from "../components/MermaidChart";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { FilterIcon } from "lucide-react";
import { H1, H2 } from "@/components/ui/typography";

const PAGE_SIZE = 10;

// Helper functions for date filtering
function isWithinDays(dateStr: string, days: number) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}

function isWithinMonth(dateStr: string, year: number, month: number) {
  const date = new Date(dateStr);
  return date.getFullYear() === year && date.getMonth() === month;
}

function isWithinRange(dateStr: string, start: Date, end: Date) {
  const date = new Date(dateStr);
  return date >= start && date <= end;
}

// Helper function for last N months
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
    onError: (err: any) => setError(err.message),
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
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2 max-w-md">
      <label className="font-medium">Enter Weight ({unit}):</label>
      <input
        type="text"
        inputMode="decimal"
        pattern="^\d+(\.\d{1,2})?$"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder={unit === "lb" ? "e.g. 180.5" : "e.g. 82.50"}
        className="border rounded px-2 py-1"
        required
      />
      <div className="flex gap-2 items-center">
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
      <label className="font-medium">Date & Time:</label>
      <ShadcnDatePicker value={date} onChange={setDate} />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded mt-2"
        disabled={mutation.isPending}
      >
        Add Weight
      </button>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Weight added!</div>}
    </form>
  );
}

export default function HealthBridgePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["weights"],
    queryFn: fetchWeights,
  });

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
  }, [filteredData, customRangeActive]);

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
    const lbsLost = (last - first).toFixed(2);
    const avg = (lbsArray.reduce((a, b) => a + b, 0) / lbsArray.length).toFixed(
      2
    );
    const min = Math.min(...lbsArray).toFixed(2);
    const max = Math.max(...lbsArray).toFixed(2);
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

  // Generate Mermaid xychart-beta syntax for filteredData as a line chart, with latest dates to the right
  const mermaidChart = useMemo(() => {
    if (!filteredData.length) return "";

    // Helper to check the custom range duration in months/years
    const getRangeMonths = () => {
      if (dateRange.start && dateRange.end) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        return (
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth())
        );
      }
      return 0;
    };
    const getRangeYears = () => {
      if (dateRange.start && dateRange.end) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        return end.getFullYear() - start.getFullYear();
      }
      return 0;
    };

    // Aggregation helpers
    function aggregateByWeek(data: typeof filteredData) {
      const weekMap = new Map<string, number[]>();
      data.forEach((row) => {
        const date = new Date(row.date);
        // Get the Monday of the week for this date
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
        const weekStart = new Date(date.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        const label = format(weekStart, "yyyy-MM-dd");
        const lbs = row.kg * 2.20462;
        if (!weekMap.has(label)) weekMap.set(label, []);
        weekMap.get(label)!.push(lbs);
      });
      // Sort week labels oldest to newest
      const weekLabels = Array.from(weekMap.keys()).sort();
      const xLabels = weekLabels.map((label) => `"${label}"`).join(", ");
      const yValues = weekLabels
        .map((label) => {
          const arr = weekMap.get(label)!;
          return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
        })
        .join(", ");
      const lbsArray = Array.from(weekMap.values()).flat();
      const minWeight = Math.floor(Math.min(...lbsArray));
      const maxWeight = Math.ceil(Math.max(...lbsArray));
      return {
        xLabels,
        yValues,
        minWeight,
        maxWeight,
      };
    }

    function aggregateByMonth(data: typeof filteredData) {
      const monthMap = new Map<string, number[]>();
      data.forEach((row) => {
        const date = new Date(row.date);
        const label = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        const lbs = row.kg * 2.20462;
        if (!monthMap.has(label)) monthMap.set(label, []);
        monthMap.get(label)!.push(lbs);
      });
      // Sort month labels oldest to newest
      const monthLabels = Array.from(monthMap.keys()).sort((a, b) => {
        const aParts = a.split(" ");
        const bParts = b.split(" ");
        const aDate = new Date(`${aParts[0]} 1, ${aParts[1]}`);
        const bDate = new Date(`${bParts[0]} 1, ${bParts[1]}`);
        return aDate.getTime() - bDate.getTime();
      });
      const xLabels = monthLabels.map((label) => `"${label}"`).join(", ");
      const yValues = monthLabels
        .map((label) => {
          const arr = monthMap.get(label)!;
          return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
        })
        .join(", ");
      const lbsArray = Array.from(monthMap.values()).flat();
      const minWeight = Math.floor(Math.min(...lbsArray));
      const maxWeight = Math.ceil(Math.max(...lbsArray));
      return {
        xLabels,
        yValues,
        minWeight,
        maxWeight,
      };
    }

    function aggregateByYear(data: typeof filteredData) {
      const yearMap = new Map<string, number[]>();
      data.forEach((row) => {
        const date = new Date(row.date);
        const label = date.getFullYear().toString();
        const lbs = row.kg * 2.20462;
        if (!yearMap.has(label)) yearMap.set(label, []);
        yearMap.get(label)!.push(lbs);
      });
      const yearLabels = Array.from(yearMap.keys()).sort();
      const xLabels = yearLabels.map((label) => `"${label}"`).join(", ");
      const yValues = yearLabels
        .map((label) => {
          const arr = yearMap.get(label)!;
          return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
        })
        .join(", ");
      const lbsArray = Array.from(yearMap.values()).flat();
      const minWeight = Math.floor(Math.min(...lbsArray));
      const maxWeight = Math.ceil(Math.max(...lbsArray));
      return {
        xLabels,
        yValues,
        minWeight,
        maxWeight,
      };
    }

    // Decide aggregation
    let agg;
    if (quickRange === "3m") {
      agg = aggregateByWeek(filteredData);
    } else if (quickRange === "6m") {
      agg = aggregateByMonth(filteredData);
    } else if (quickRange === "all") {
      // If all, check the total range
      const months = getRangeMonths();
      const years = getRangeYears();
      if (years >= 1) {
        agg = aggregateByYear(filteredData);
      } else if (months > 6) {
        agg = aggregateByMonth(filteredData);
      } else {
        // Under 6 months, show daily
        agg = null;
      }
    } else if (customRangeActive && dateRange.start && dateRange.end) {
      const months = getRangeMonths();
      const years = getRangeYears();
      if (years >= 1) {
        agg = aggregateByYear(filteredData);
      } else if (months > 6) {
        agg = aggregateByMonth(filteredData);
      } else if (months >= 3) {
        agg = aggregateByMonth(filteredData);
      } else if (months >= 1) {
        agg = aggregateByWeek(filteredData);
      } else {
        agg = null;
      }
    }

    if (agg) {
      return (
        `%%{init: {"theme":"default","themeVariables":{"xyChart":{"plotColorPalette":"#14b8a6"}}}}%%\n` +
        `xychart-beta\n` +
        `\n` +
        `title "Weight Over Time"\n` +
        `x-axis [${agg.xLabels}]\n` +
        `y-axis "Weight (lbs)" ${agg.minWeight} --> ${agg.maxWeight}\n` +
        `line [${agg.yValues}]\n`
      );
    }

    // Otherwise, show daily data
    const reversed = [...filteredData].reverse();
    const xLabels = reversed
      .map((row) => `"${new Date(row.date).toLocaleDateString()}"`)
      .join(", ");
    const yValues = reversed
      .map((row) => (row.kg * 2.20462).toFixed(1))
      .join(", ");
    const lbsArray = reversed.map((row) => row.kg * 2.20462);
    const minWeight = Math.floor(Math.min(...lbsArray));
    const maxWeight = Math.ceil(Math.max(...lbsArray));

    return (
      `%%{init: {"theme":"default","themeVariables":{"xyChart":{"plotColorPalette":"#14b8a6"}}}}%%\n` +
      `xychart-beta\n` +
      `\n` +
      `title "Weight Over Time"\n` +
      `x-axis [${xLabels}]\n` +
      `y-axis "Weight (lbs)" ${minWeight} --> ${maxWeight}\n` +
      `line [${yValues}]\n`
    );
  }, [filteredData, quickRange, customRangeActive, dateRange]);

  // Sort arrow and handler
  function getArrow(col: "date" | "weight") {
    if (sortBy !== col) return "";
    return sortDir === "asc" ? "↑" : "↓";
  }
  function handleSort(col: "date" | "weight") {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
    setPage(1);
  }

  // Handlers for filters
  const handleQuickRange = (days: "all" | "7" | "14" | "30" | "3m" | "6m") => {
    setQuickRange(days);
    setSelectedYear("all");
    setSelectedMonth("all");
    setCustomRangeActive(false);
    setPage(1);
  };

  // Now check loading/error AFTER all hooks
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div className="text-red-500">Error loading data</div>;
  }

  return (
    <div>
      <H1 className="mb-4">Body Weight Analysis</H1>
      <AddWeightBox />
      <section className="mb-8">
        <H2 className="mb-4">Summary Statistics</H2>
        <div className="flex flex-wrap gap-4 mb-6">
          {metrics && (
            <>
              <Card className="p-4 min-w-[160px]">
                <div className="text-sm text-muted-foreground">
                  Lbs Lost/Gained
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
        <H2 className="mb-4">Weight Trend</H2>
        <Card className="p-4 mb-6" style={{ width: "100%", maxWidth: "none" }}>
          <div style={{ width: "100%" }}>
            <MermaidChart chart={mermaidChart} className="w-full" />
          </div>
        </Card>
      </section>
      {/* Filters Section: Quick Filters & Custom Range side by side on desktop, stacked on mobile */}
      <section className="mb-8">
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
      <H2 className="mb-2">
        {filteredData.length > 0
          ? `Weight Changes (${metrics?.startDate} to ${metrics?.endDate})`
          : "Weight Changes"}
      </H2>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.date}>
                <TableCell>
                  {new Date(row.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{(row.kg * 2.20462).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
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
