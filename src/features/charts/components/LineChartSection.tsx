'use client'

import { faker } from '@faker-js/faker'
import { useMemo } from 'react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { LineChart } from '@mui/x-charts/LineChart'
import { Button } from '@/components/ui/button'
import ChartSection from '@/features/charts/components/ChartSection'

// ---------------------------------------------------------------------------
// Data — daily active users over the last 90 days
// ---------------------------------------------------------------------------

export interface DailyPoint {
    date: Date
    value: number
}

const LINE_RANGES = ['7d', '30d', '90d'] as const
type LineRange = (typeof LINE_RANGES)[number]

const LINE_RANGE_DAYS: Record<LineRange, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
}

function generateDailyActiveUsers(days = 90): DailyPoint[] {
    let level = faker.number.int({ min: 8_000, max: 12_000 })
    const today = new Date()
    return Array.from({ length: days }, (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() - (days - 1 - i))
        level = Math.max(1_000, level + faker.number.int({ min: -700, max: 800 }))
        return { date, value: level }
    })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const rangeParam = parseAsStringLiteral(LINE_RANGES).withDefault('30d')

export default function LineChartSection() {
    const [range, setRange] = useQueryState('range', rangeParam)
    const series = useMemo(() => generateDailyActiveUsers(90), [])

    const points = useMemo(
        () => series.slice(-LINE_RANGE_DAYS[range]),
        [series, range]
    )

    return (
        <ChartSection
            title="Line"
            component="<LineChart />"
            usecase="Tracking trends over time — daily active users, revenue curves, or any time-series with zoomable ranges"
            action={
                <div className="flex gap-1">
                    {LINE_RANGES.map((value) => (
                        <Button
                            key={value}
                            size="xs"
                            variant={value === range ? 'default' : 'outline'}
                            onClick={() => setRange(value)}
                        >
                            {value}
                        </Button>
                    ))}
                </div>
            }
        >
            <LineChart
                height={280}
                margin={{ left: 60 }}
                grid={{ horizontal: true }}
                xAxis={[
                    {
                        scaleType: 'time',
                        data: points.map((point) => point.date),
                        valueFormatter: (date: Date) =>
                            date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            }),
                        tickLabelStyle: { fill: 'var(--muted-foreground)' },
                    },
                ]}
                yAxis={[
                    {
                        valueFormatter: (v: number) =>
                            v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`,
                        tickLabelStyle: { fill: 'var(--muted-foreground)' },
                    },
                ]}
                series={[
                    {
                        data: points.map((point) => point.value),
                        label: 'Active users',
                        area: true,
                        showMark: false,
                        curve: 'monotoneX',
                    },
                ]}
            />
            <p className="text-xs text-muted-foreground">
                <code>?range={range}</code> in the URL — {points.length} of{' '}
                {series.length} faker points rendered.
            </p>
        </ChartSection>
    )
}
