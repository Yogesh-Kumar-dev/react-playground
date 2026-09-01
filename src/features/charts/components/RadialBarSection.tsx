'use client'

import { faker } from '@faker-js/faker'
import { useState } from 'react'
import { RadialBarChart } from '@mui/x-charts-premium/RadialBarChart'
import { Button } from '@/components/ui/button'
import ChartSection from '@/features/charts/components/ChartSection'
import { MONTH_LABELS } from '@/features/charts/shared'

// ---------------------------------------------------------------------------
// Data — dataset rows bound via dataKey
// ---------------------------------------------------------------------------

export interface RadialBarRow {
    [key: string]: unknown
    month: string
    thisYear: number
    lastYear: number
}

function generateRadialBars(): RadialBarRow[] {
    return MONTH_LABELS.map((month) => ({
        month,
        thisYear: faker.number.int({ min: 40, max: 100 }),
        lastYear: faker.number.int({ min: 40, max: 100 }),
    }))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RadialBarSection() {
    const [rows, setRows] = useState<RadialBarRow[]>(() => generateRadialBars())
    const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical')

    return (
        <ChartSection
            title="Radial bars (Premium)"
            component="<RadialBarChart />"
            usecase="Circular bar comparison — performance by department, yearly vs. last-year, or resource usage around a radial axis"
            action={
                <div className="flex gap-1">
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                            setLayout((current) =>
                                current === 'vertical' ? 'horizontal' : 'vertical'
                            )
                        }
                    >
                        {layout}
                    </Button>
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setRows(generateRadialBars())}
                    >
                        Shuffle
                    </Button>
                </div>
            }
        >
            <RadialBarChart
                height={320}
                dataset={rows}
                series={[
                    { dataKey: 'lastYear', label: 'Last year', layout },
                    { dataKey: 'thisYear', label: 'This year', layout },
                ]}
                rotationAxis={[
                    {
                        scaleType: 'band',
                        data: rows.map((row) => row.month),
                        categoryGapRatio: 0.3,
                        barGapRatio: 0.1,
                    },
                ]}
                grid={{ radius: true }}
            />
            <p className="text-xs text-muted-foreground">
                {rows.length} periodic categories around the rotation axis —
                values grow along the radius.
            </p>
        </ChartSection>
    )
}
