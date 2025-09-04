import { startOfMonth, endOfMonth, parseISO, isAfter, isBefore, format } from 'date-fns'

export const thisMonthRange = (today = new Date()) => {
  const start = startOfMonth(today)
  const end = endOfMonth(today)
  return { start, end }
}

export const within = (isoDate: string, start: Date, end: Date) => {
  const d = parseISO(isoDate)
  return (isAfter(d, start) || +d === +start) && (isBefore(d, end) || +d === +end)
}

export const ym = (isoDate: string) => format(parseISO(isoDate), 'yyyy-MM')
