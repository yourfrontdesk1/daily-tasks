import * as chrono from 'chrono-node'

export interface ParsedTask {
  text: string
  dueDate: string | null
  dateText: string | null
}

export function parseTaskInput(input: string): ParsedTask {
  const results = chrono.parse(input, new Date(), { forwardDate: true })

  if (results.length === 0) {
    return { text: input.trim(), dueDate: null, dateText: null }
  }

  const match = results[0]
  const date = match.start.date()
  const dueDate = date.toISOString().split('T')[0]
  const dateText = match.text
  const text = input.replace(dateText, '').replace(/\s+/g, ' ').trim()

  return { text: text || input.trim(), dueDate, dateText }
}
