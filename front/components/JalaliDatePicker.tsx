"use client";

import { useEffect, useMemo, useState } from "react";
import jMoment from "jalali-moment";
import { Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type JalaliDatePickerProps = {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

const monthNames = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function toEnglishDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function normalizeDate(value: string) {
  return toEnglishDigits(value).replaceAll("-", "/");
}

function formatJalaliDate(year: number, month: number, day: number) {
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(
    2,
    "0"
  )}`;
}

function getValidMoment(value?: string) {
  if (!value) return jMoment();

  const normalized = normalizeDate(value);
  const parsed = jMoment(normalized, "jYYYY/jMM/jDD");

  if (parsed.isValid()) {
    return parsed;
  }

  return jMoment();
}

export function JalaliDatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "انتخاب تاریخ",
}: JalaliDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [viewDate, setViewDate] = useState(() => getValidMoment(value));

  useEffect(() => {
    if (value) {
      setViewDate(getValidMoment(value));
    }
  }, [value]);

  const currentMonth = viewDate.jMonth(); // 0 تا 11
  const currentYear = viewDate.jYear();

  const selectedDate = useMemo(() => {
    if (!value) return null;

    const parsed = jMoment(normalizeDate(value), "jYYYY/jMM/jDD");
    return parsed.isValid() ? parsed : null;
  }, [value]);

  const days = useMemo(() => {
    const daysInMonth = jMoment.jDaysInMonth(currentYear, currentMonth);

    const firstDay = jMoment(
      `${currentYear}/${currentMonth + 1}/1`,
      "jYYYY/jM/jD"
    );

    /*
      خروجی day در moment:
      0 = Sunday
      1 = Monday
      ...
      6 = Saturday

      ما می‌خواهیم:
      0 = شنبه
      1 = یکشنبه
      ...
      6 = جمعه
    */
    const momentDay = firstDay.day();
    const emptyDays = momentDay === 6 ? 0 : momentDay + 1;

    const result: Array<number | null> = [];

    for (let i = 0; i < emptyDays; i++) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push(day);
    }

    return result;
  }, [currentYear, currentMonth]);

  const nextMonth = () => {
    setViewDate((prev) => prev.clone().add(1, "jMonth"));
  };

  const prevMonth = () => {
    setViewDate((prev) => prev.clone().subtract(1, "jMonth"));
  };

  const handleDateSelect = (day: number) => {
    const formatted = formatJalaliDate(currentYear, currentMonth + 1, day);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = jMoment();
    const formatted = formatJalaliDate(
      today.jYear(),
      today.jMonth() + 1,
      today.jDate()
    );

    setViewDate(today);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;

    return (
      selectedDate.jYear() === currentYear &&
      selectedDate.jMonth() === currentMonth &&
      selectedDate.jDate() === day
    );
  };

  const isToday = (day: number) => {
    const today = jMoment();

    return (
      today.jYear() === currentYear &&
      today.jMonth() === currentMonth &&
      today.jDate() === day
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-between text-right gap-2"
        >
          <span className={value ? "text-slate-900 dark:text-white" : "text-slate-500"}>
            {value || placeholder}
          </span>
          <Calendar className="w-4 h-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div
          className="p-4 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              →
            </button>

            <div className="font-bold text-slate-900 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              ←
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="w-10 h-10 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="w-10 h-10" />;
              }

              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={[
                    "w-10 h-10 flex items-center justify-center rounded text-sm transition-colors",
                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                    selected
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "text-slate-900 dark:text-white",
                    today && !selected
                      ? "border border-emerald-500 text-emerald-600"
                      : "",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToday}
            >
              امروز
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              پاک کردن
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
