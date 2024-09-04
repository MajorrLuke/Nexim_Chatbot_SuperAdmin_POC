"use client"

import * as React from "react"
import { DayPicker, DayPickerProps } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white dark:bg-black rounded-md border border-[#54428e] dark:border-[#0affed]", className)}
      classNames={{
        ...classNames,
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-sm hover:bg-gray-100/10 text-center cursor-pointer",
          "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-800",
          classNames?.day
        ),
        day_range_start: cn("bg-[#54428e] dark:bg-[#0affed] text-white rounded-l-md", classNames?.day_range_start),
        day_range_end: cn("bg-[#54428e] dark:bg-[#0affed] text-white rounded-r-md", classNames?.day_range_end),
        day_range_middle: cn("bg-[#54428e]/20 dark:bg-[#0affed]/20", classNames?.day_range_middle),
        day_selected: cn("bg-[#54428e] dark:bg-[#0affed] text-white", classNames?.day_selected),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
