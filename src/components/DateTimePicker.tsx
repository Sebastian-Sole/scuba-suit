import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateTimePickerProps {
  value: string // ISO datetime string (YYYY-MM-DDTHH:mm)
  onChange: (datetime: string) => void
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Helper to convert YYYY-MM-DD to Date in local timezone
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  // Helper to format Date to YYYY-MM-DD in local timezone
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Parse the ISO datetime string
  const dateTime = React.useMemo(() => {
    if (!value) return { date: undefined, time: '12:00' }
    const [datePart, timePart] = value.split('T')
    const date = datePart ? parseLocalDate(datePart) : undefined
    const time = timePart ? timePart.substring(0, 5) : '12:00' // HH:mm
    return { date, time }
  }, [value])

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(dateTime.date)
  const [selectedTime, setSelectedTime] = React.useState<string>(dateTime.time)
  const [month, setMonth] = React.useState<Date | undefined>(dateTime.date)

  // Update local state when external value changes
  React.useEffect(() => {
    setSelectedDate(dateTime.date)
    setSelectedTime(dateTime.time)
    if (dateTime.date) {
      setMonth(dateTime.date)
    }
  }, [dateTime.date, dateTime.time])

  const handleDateChange = React.useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      // Format date as YYYY-MM-DD in local timezone and combine with time
      const dateStr = formatLocalDate(date)
      // Default to 12:00 if time is empty
      const finalTime = selectedTime || '12:00'
      onChange(`${dateStr}T${finalTime}:00`)
      setOpen(false)
    }
  }, [selectedTime, onChange])

  const handleTimeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    setSelectedTime(time)
    if (selectedDate) {
      const dateStr = formatLocalDate(selectedDate)
      // Default to 12:00 if time is empty
      const finalTime = time || '12:00'
      onChange(`${dateStr}T${finalTime}:00`)
    }
  }, [selectedDate, onChange])

  return (
    <div className="flex gap-2 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker"
            className="flex-1 justify-between font-normal min-h-[44px] px-4"
          >
            {selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={handleDateChange}
            fromYear={2000}
            toYear={new Date().getFullYear() + 1}
            toDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // Max 7 days in future
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        id="time-picker"
        value={selectedTime}
        onChange={handleTimeChange}
        placeholder="12:00"
        className="bg-background min-h-[44px] flex-1 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
    </div>
  )
}
