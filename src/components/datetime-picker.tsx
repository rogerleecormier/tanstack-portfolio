"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleTimePicker } from "./simple-time-picker";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  timezone?: string;
  renderTrigger?: (value: Date | undefined, timezone: string) => React.ReactNode;
}

export function DateTimePicker({
  value,
  onChange,
  timezone = "UTC",
  renderTrigger,
}: DateTimePickerProps) {
  const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(
    value
  );

  React.useEffect(() => {
    setSelectedDateTime(value);
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const currentTime = selectedDateTime || new Date();
      const newDateTime = new Date(date);
      newDateTime.setHours(currentTime.getHours());
      newDateTime.setMinutes(currentTime.getMinutes());
      newDateTime.setSeconds(currentTime.getSeconds());
      newDateTime.setMilliseconds(currentTime.getMilliseconds());
      
      setSelectedDateTime(newDateTime);
      onChange?.(newDateTime);
    }
  };

  const handleTimeSelect = (time: Date) => {
    if (selectedDateTime) {
      const newDateTime = new Date(selectedDateTime);
      newDateTime.setHours(time.getHours());
      newDateTime.setMinutes(time.getMinutes());
      newDateTime.setSeconds(time.getSeconds());
      newDateTime.setMilliseconds(time.getMilliseconds());
      
      setSelectedDateTime(newDateTime);
      onChange?.(newDateTime);
    }
  };

  const formatDisplayValue = (date: Date | undefined) => {
    if (!date || !isValid(date)) return "Pick a date and time";
    
    const dateStr = format(date, "PPP");
    const timeStr = format(date, "p");
    return `${dateStr} at ${timeStr}`;
  };

  if (renderTrigger) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {renderTrigger(selectedDateTime, timezone)}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Calendar
              mode="single"
              selected={selectedDateTime}
              onSelect={handleDateSelect}
              initialFocus
            />
            <div className="mt-3">
              <SimpleTimePicker
                value={selectedDateTime}
                onChange={handleTimeSelect}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDateTime && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue(selectedDateTime)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={selectedDateTime}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="mt-3">
            <SimpleTimePicker
              value={selectedDateTime}
              onChange={handleTimeSelect}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
