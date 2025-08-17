import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

export default function HealthBridgePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["weights"],
    queryFn: fetchWeights,
  });

  // Sort state
  const [sortBy, setSortBy] = useState<"date" | "weight">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Set default filter to last 30 days and end date to today
  const todayStr = useMemo(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // yyyy-mm-dd
  }, []);

  // Date range state
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: todayStr,
  });

  // Other filter states
  const [quickRange, setQuickRange] = useState<
    "all" | "7" | "14" | "30" | "3m" | "6m"
  >("30");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
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

  // Extract years and months for filter dropdowns
  const years = useMemo(() => {
    if (!sortedData) return [];
    const yearSet = new Set(
      sortedData.map((row) => new Date(row.date).getFullYear())
    );
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [sortedData]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Filter logic
  const filteredData = useMemo(() => {
    let result = sortedData;

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

    // Date range filter
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      result = result.filter((row) => isWithinRange(row.date, start, end));
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
  }, [sortedData, selectedYear, selectedMonth, dateRange, quickRange]);

  // Automatically update dateRange to match filtered data set each time a filter changes
  useEffect(() => {
    if (filteredData.length > 0) {
      const startDate = formatLocalDate(filteredData[filteredData.length - 1].date);
      const endDate = formatLocalDate(filteredData[0].date);

      if (dateRange.start !== startDate || dateRange.end !== endDate) {
        setDateRange({ start: startDate, end: endDate });
      }
    } else {
      if (dateRange.start !== "" || dateRange.end !== todayStr) {
        setDateRange({ start: "", end: todayStr });
      }
    }
  }, [filteredData, todayStr]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Reset to page 1 when filter changes
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value));
    setSelectedMonth("all");
    setQuickRange("all");
    setDateRange({ start: "", end: "" });
    setPage(1);
  };
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value));
    setQuickRange("all");
    setDateRange({ start: "", end: "" });
    setPage(1);
  };
  const handleQuickRange = (days: "all" | "7" | "14" | "30" | "3m" | "6m") => {
    setQuickRange(days);
    setSelectedYear("all");
    setSelectedMonth("all");
    setDateRange({ start: "", end: "" });
    setPage(1);
  };
  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setQuickRange("all");
    setSelectedYear("all");
    setSelectedMonth("all");
    setPage(1);
  };

  // Sort arrow helper
  const getArrow = (col: "date" | "weight") => {
    if (sortBy !== col) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  // Handle sort click
  const handleSort = (col: "date" | "weight") => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
    setPage(1);
  };

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

    // Helper to check if a date range exceeds 6 months
    const isDateRangeOver6Months = (() => {
      if (dateRange.start && dateRange.end) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        const months =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        return months >= 6;
      }
      return false;
    })();

    // Aggregate by month if quickRange is "6m" or "3m" OR date range exceeds 6 months
    if (
      quickRange === "6m" ||
      quickRange === "3m" ||
      (dateRange.start && dateRange.end && isDateRangeOver6Months)
    ) {
      const monthMap = new Map<string, number[]>();
      filteredData.forEach((row) => {
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
        const aDate = new Date(a);
        const bDate = new Date(b);
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

      return (
        `%%{init: {"theme":"default","themeVariables":{"xyChart":{"plotColorPalette":"#14b8a6"}}}}%%\n` +
        `xychart-beta\n` +
        `\n` +
        `title "Weight Over Time"\n` +
        `x-axis [${xLabels}]\n` +
        `y-axis "Weight (lbs)" ${minWeight} --> ${maxWeight}\n` +
        `line [${yValues}]\n`
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
  }, [filteredData, quickRange, dateRange]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Body Weight Analysis</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Summary Statistics</h2>
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
        <h2 className="text-xl font-semibold mb-2">Weight Trend</h2>
        <Card className="p-4 mb-6" style={{ width: "100%", maxWidth: "none" }}>
          <div style={{ width: "100%" }}>
            <MermaidChart chart={mermaidChart} className="w-full" />
          </div>
        </Card>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Filters & Table</h2>
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {/* Quick Range Buttons */}
          <div className="flex gap-2">
            <button
              className={`px-2 py-1 border rounded ${
                quickRange === "7" ? "bg-blue-100" : ""
              }`}
              onClick={() => handleQuickRange("7")}
            >
              Last 7 days
            </button>
            <button
              className={`px-2 py-1 border rounded ${
                quickRange === "14" ? "bg-blue-100" : ""
              }`}
              onClick={() => handleQuickRange("14")}
            >
              Last 14 days
            </button>
            <button
              className={`px-2 py-1 border rounded ${
                quickRange === "30" ? "bg-blue-100" : ""
              }`}
              onClick={() => handleQuickRange("30")}
            >
              Last 30 days
            </button>
            <button
              className={`px-2 py-1 border rounded ${
                quickRange === "3m" ? "bg-blue-100" : ""
              }`}
              onClick={() => handleQuickRange("3m")}
            >
              Last 3 months
            </button>
            <button
              className={`px-2 py-1 border rounded ${
                quickRange === "6m" ? "bg-blue-100" : ""
              }`}
              onClick={() => handleQuickRange("6m")}
            >
              Last 6 months
            </button>
            <button
              className={`px-2 py-1 border rounded ${
                quickRange === "all" ? "bg-blue-100" : ""
              }`}
              onClick={() => handleQuickRange("all")}
            >
              All
            </button>
          </div>
          {/* Year Filter */}
          <label htmlFor="year" className="font-medium">
            Year:
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={handleYearChange}
            className="border rounded px-2 py-1"
          >
            <option value="all">All</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {/* Month Filter */}
          <label htmlFor="month" className="font-medium">
            Month:
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="border rounded px-2 py-1"
            disabled={selectedYear === "all"}
          >
            <option value="all">All</option>
            {months.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>
          {/* Date Range Filter */}
          <label className="font-medium">Date range:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateRangeChange("start", e.target.value)}
            className="border rounded px-2 py-1"
          />
          <span>-</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateRangeChange("end", e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-500">Error loading data</div>}
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
      </section>
    </div>
  );
}

function formatLocalDate(dateStr: string) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
