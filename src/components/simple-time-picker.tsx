"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SimpleTimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
}

export function SimpleTimePicker({ value, onChange }: SimpleTimePickerProps) {
  const [time, setTime] = useState<string>(
    value ? format(value, "HH:mm") : "00:00"
  );

  useEffect(() => {
    if (value) {
      setTime(format(value, "HH:mm"));
    }
  }, [value]);

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    
    if (onChange && value) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      onChange(newDate);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="time" className="text-sm font-medium">
        Time
      </Label>
      <Input
        id="time"
        type="time"
        value={time}
        onChange={(e) => handleTimeChange(e.target.value)}
        className="w-32"
      />
    </div>
  );
}
