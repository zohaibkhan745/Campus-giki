"use client";
import React from "react";
import { DatePicker } from "@ark-ui/react/date-picker";
import { parseDate } from "@internationalized/date";
import { Portal } from "@ark-ui/react/portal";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";

export interface CustomDatePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ 
  value, 
  onChange,
  placeholder = "Pick a date",
  className = "",
  min,
  max
}) => {
const safeParse = (val: string | undefined | null) => {
  try {
    if (!val) return [];
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        // Assume MM/DD/YYYY or DD/MM/YYYY. Usually US format in these errors: MM/DD/YYYY
        // parts[0] = MM, parts[1] = DD, parts[2] = YYYY
        // ISO expects YYYY-MM-DD
        const y = parts[2].padStart(4, '0');
        const m = parts[0].padStart(2, '0');
        const d = parts[1].padStart(2, '0');
        return [parseDate(`${y}-${m}-${d}`)];
      }
    }
    return val.length >= 10 ? [parseDate(val.substring(0, 10))] : [];
  } catch (e) {
    return [];
  }
};

  return (
    <DatePicker.Root
      value={safeParse(value)}
      onValueChange={(details) => {
        if (onChange && details.valueAsString && details.valueAsString.length > 0) {
          onChange(details.valueAsString[0]);
        } else if (onChange) {
          onChange("");
        }
      }}
      className={`w-full ${className}`}
      positioning={{ placement: 'bottom-start' }}
    >
      <DatePicker.Control className="flex items-center justify-between w-full h-[46px] bg-[rgba(255,255,255,0.08)] backdrop-blur-[20px] text-gray-200 text-sm rounded-[12px] border border-white/20 px-4 outline-none transition-all cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-[rgba(255,255,255,0.15)] hover:border-white/35">
        <DatePicker.Input
          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder:text-gray-400 cursor-pointer"
          placeholder={placeholder}
          readOnly
        />
        <div className="flex items-center gap-1 shrink-0">
          <DatePicker.ClearTrigger className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </DatePicker.ClearTrigger>
          <DatePicker.Trigger className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <Calendar size={18} />
          </DatePicker.Trigger>
        </div>
      </DatePicker.Control>

      <Portal>
        <DatePicker.Positioner style={{ zIndex: 9999 }}>
          <DatePicker.Content className="mt-2 w-full max-w-sm rounded-[14px] border border-white/18 bg-[rgba(20,20,24,0.65)] backdrop-blur-[25px] shadow-[0_16px_40px_rgba(0,0,0,0.5)] p-4 text-white z-[9999]">
            
            <div className="flex gap-2 mb-4">
              <DatePicker.YearSelect className="flex-1 rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white outline-none cursor-pointer hover:bg-white/10 focus:border-white/40 transition-colors appearance-none" />
              <DatePicker.MonthSelect className="flex-1 rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white outline-none cursor-pointer hover:bg-white/10 focus:border-white/40 transition-colors appearance-none" />
            </div>

            <DatePicker.View view="day">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl className="flex justify-between items-center mb-3 text-sm font-semibold text-white/90">
                      <DatePicker.PrevTrigger className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer">
                        <ChevronLeft size={18} />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="cursor-pointer px-3 py-1 rounded-lg hover:bg-white/15 transition-colors">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer">
                        <ChevronRight size={18} />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>

                    <DatePicker.Table className="w-full text-center text-sm border-separate border-spacing-1">
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          {datePicker.weekDays.map((weekDay, id) => (
                            <DatePicker.TableHeader
                              key={id}
                              className="py-1 text-white/50 font-medium text-xs uppercase"
                            >
                              {weekDay.short}
                            </DatePicker.TableHeader>
                          ))}
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        {datePicker.weeks.map((week, id) => (
                          <DatePicker.TableRow key={id}>
                            {week.map((day, id) => (
                              <DatePicker.TableCell key={id} value={day}>
                                <DatePicker.TableCellTrigger
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors cursor-pointer data-[selected]:bg-blue-500 data-[selected]:text-white data-[today]:border data-[today]:border-white/40 text-white/90"
                                >
                                  {day.day}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>

            <DatePicker.View view="month">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl className="flex justify-between items-center mb-3 text-sm font-semibold text-white/90">
                      <DatePicker.PrevTrigger className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer">
                        <ChevronLeft size={18} />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="cursor-pointer px-3 py-1 rounded-lg hover:bg-white/15 transition-colors">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer">
                        <ChevronRight size={18} />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table className="w-full text-sm border-separate border-spacing-1">
                      <DatePicker.TableBody>
                        {datePicker.getMonthsGrid({ columns: 4, format: "short" }).map((months, id) => (
                          <DatePicker.TableRow key={id}>
                            {months.map((month, id) => (
                              <DatePicker.TableCell key={id} value={month.value}>
                                <DatePicker.TableCellTrigger className="px-2 py-2 rounded-lg hover:bg-white/20 transition-colors text-center cursor-pointer data-[selected]:bg-blue-500 text-white/90">
                                  {month.label}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>

            <DatePicker.View view="year">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl className="flex justify-between items-center mb-3 text-sm font-semibold text-white/90">
                      <DatePicker.PrevTrigger className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer">
                        <ChevronLeft size={18} />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="cursor-pointer px-3 py-1 rounded-lg hover:bg-white/15 transition-colors">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer">
                        <ChevronRight size={18} />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table className="w-full text-sm border-separate border-spacing-1">
                      <DatePicker.TableBody>
                        {datePicker.getYearsGrid({ columns: 4 }).map((years, id) => (
                          <DatePicker.TableRow key={id}>
                            {years.map((year, id) => (
                              <DatePicker.TableCell key={id} value={year.value}>
                                <DatePicker.TableCellTrigger className="px-2 py-2 rounded-lg hover:bg-white/20 transition-colors text-center cursor-pointer data-[selected]:bg-blue-500 text-white/90">
                                  {year.label}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  );
};
