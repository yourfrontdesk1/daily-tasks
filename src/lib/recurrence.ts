export type RecurrenceRule = 'daily' | 'weekdays' | 'weekly' | 'monthly' | null

export function getRecurrenceLabel(rule: RecurrenceRule): string {
  switch (rule) {
    case 'daily': return 'Every day'
    case 'weekdays': return 'Weekdays'
    case 'weekly': return 'Every week'
    case 'monthly': return 'Every month'
    default: return ''
  }
}

export function getNextOccurrence(rule: RecurrenceRule, fromDate: string): string | null {
  if (!rule) return null

  const d = new Date(fromDate + 'T12:00:00')

  switch (rule) {
    case 'daily':
      d.setDate(d.getDate() + 1)
      break
    case 'weekdays':
      d.setDate(d.getDate() + 1)
      while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1)
      }
      break
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly':
      d.setMonth(d.getMonth() + 1)
      break
  }

  return d.toISOString().split('T')[0]
}
