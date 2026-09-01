import { faker } from '@faker-js/faker'

faker.seed(20260901)

export const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    return date.toLocaleString('en-US', { month: 'short' })
})

export const SEGMENTS = ['Enterprise', 'SMB', 'Startup'] as const
export type Segment = (typeof SEGMENTS)[number]

export const SEGMENT_COLORS: Record<Segment, string> = {
    Enterprise: '#38bdf8',
    SMB: '#34d399',
    Startup: '#fbbf24',
}

// Append a hex alpha channel to a 6-digit hex color.
// e.g. withAlpha('#2563eb', '40') → '#2563eb40' (25% opacity)
export function withAlpha(hex: string, alpha: string): string {
    return `${hex}${alpha}`
}

export const HEATMAP_SLOTS = [
    '00–02', '02–04', '04–06', '06–08', '08–10', '10–12',
    '12–14', '14–16', '16–18', '18–20', '20–22', '22–24',
]
