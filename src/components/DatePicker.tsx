import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface DatePickerProps {
  value: string // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void
  placeholder?: string
  label?: string
}

export function DatePicker({ value, onChange, placeholder, label }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)

  // Convert ISO string to Date object
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    const date = new Date(value)
    return isValidDate(date) ? date : undefined
  }, [value])

  const [month, setMonth] = React.useState<Date | undefined>(dateValue)
  const [inputValue, setInputValue] = React.useState(formatDate(dateValue))

  // Update input value when external value changes (but not while user is typing)
  React.useEffect(() => {
    if (!isEditing) {
      setInputValue(formatDate(dateValue))
    }
  }, [dateValue, isEditing])

  const commitDateChange = React.useCallback((textValue: string) => {
    const date = new Date(textValue)
    if (isValidDate(date)) {
      // Convert to ISO date string (YYYY-MM-DD)
      onChange(date.toISOString().split('T')[0])
      setMonth(date)
      setInputValue(formatDate(date))
    } else {
      // If invalid, reset to the last valid value
      setInputValue(formatDate(dateValue))
    }
    setIsEditing(false)
  }, [onChange, dateValue])

  return (
    <div className="relative flex gap-2">
      <Input
        id={label}
        value={inputValue}
        placeholder={placeholder || 'Select a date'}
        className="bg-background pr-10 min-h-[44px]"
        onChange={(e) => {
          setInputValue(e.target.value)
          setIsEditing(true)
        }}
        onBlur={(e) => {
          commitDateChange(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commitDateChange(inputValue)
          } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          } else if (e.key === 'Escape') {
            // Reset to last valid value on Escape
            setInputValue(formatDate(dateValue))
            setIsEditing(false)
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="ghost"
            className="absolute top-1/2 right-2 size-8 -translate-y-1/2"
          >
            <CalendarIcon className="size-4" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={dateValue}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              if (date) {
                // Convert to ISO date string (YYYY-MM-DD)
                onChange(date.toISOString().split('T')[0])
                setInputValue(formatDate(date))
                setMonth(date)
              }
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
