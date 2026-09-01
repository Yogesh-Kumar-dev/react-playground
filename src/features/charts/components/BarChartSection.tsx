'use client'

import { faker } from '@faker-js/faker'
import { useState } from 'react'
import { BarChart } from '@mui/x-charts/BarChart'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import ChartSection from '@/features/charts/components/ChartSection'
import {
    MONTH_LABELS,
    SEGMENTS,
    SEGMENT_COLORS,
    withAlpha,
    type Segment,
} from '@/features/charts/shared'

// ---------------------------------------------------------------------------
// Data — monthly revenue per customer segment
// ---------------------------------------------------------------------------

function generateSegmentRevenues(): Record<Segment, number[]> {
    const next = () => faker.number.int({ min: 8, max: 95 }) * 1000
    return {
        Enterprise: MONTH_LABELS.map(next),
        SMB: MONTH_LABELS.map(next),
        Startup: MONTH_LABELS.map(next),
    }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BarChartSectionProps {
    dimmedSegment?: Segment | null
}

type Visibility = Record<Segment, boolean>

export default function BarChartSection({
    dimmedSegment = null,
}: BarChartSectionProps) {
    const [revenues, setRevenues] = useState(() => generateSegmentRevenues())
    const [visible, setVisible] = useState<Visibility>({
        Enterprise: true,
        SMB: true,
        Startup: true,
    })
    const [stacked, setStacked] = useState(false)

    const series = SEGMENTS.filter((segment) => visible[segment]).map(
        (segment) => ({
            type: 'bar' as const,
            id: segment,
            label: segment,
            data: revenues[segment],
            stack: stacked ? 'total' : undefined,
            color:
                dimmedSegment && segment !== dimmedSegment
                    ? withAlpha(SEGMENT_COLORS[segment], '40')
                    : SEGMENT_COLORS[segment],
        })
    )

    return (
        <ChartSection
            title="Bar"
            component="<BarChart />"
            usecase="Comparing quantities across categories — revenue by segment, sales by region, or side-by-side group comparisons"
            action={
                <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setRevenues(generateSegmentRevenues())}
                >
                    Shuffle data
                </Button>
            }
        >
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {SEGMENTS.map((segment) => (
                    <label
                        key={segment}
                        htmlFor={`bar-visible-${segment}`}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                        <Checkbox
                            id={`bar-visible-${segment}`}
                            checked={visible[segment]}
                            onCheckedChange={(checked) =>
                                setVisible((current) => ({
                                    ...current,
                                    [segment]: Boolean(checked),
                                }))
                            }
                        />
                        <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: SEGMENT_COLORS[segment] }}
                        />
                        {segment}
                    </label>
                ))}
                <label
                    htmlFor="bar-stacked"
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                    <Switch
                        id="bar-stacked"
                        size="sm"
                        checked={stacked}
                        onCheckedChange={(checked) => setStacked(Boolean(checked))}
                    />
                    Stacked
                </label>
            </div>
            <BarChart
                height={280}
                margin={{ left: 60 }}
                grid={{ horizontal: true }}
                xAxis={[
                    {
                        scaleType: 'band',
                        data: MONTH_LABELS,
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
                series={series}
            />
            <p className="text-xs text-muted-foreground">
                {dimmedSegment
                    ? `Scatter selection: "${dimmedSegment}" — other series dimmed via per-series color alpha.`
                    : 'Toggle a segment here, or click a point in the scatter section below to see cross-chart state.'}
            </p>
        </ChartSection>
    )
}
