import { Button } from '@/components/ui/button'
import ChartSection from '@/features/charts/components/ChartSection'
import { HEATMAP_SLOTS } from '@/features/charts/shared'
import { faker } from '@faker-js/faker'
import { RadialLineChart } from '@mui/x-charts-premium/RadialLineChart'
import { useState } from 'react'

// ---------------------------------------------------------------------------
// Data — dataset rows bound via dataKey
// ---------------------------------------------------------------------------

export interface RadialLineRow {
    [key: string]: unknown
    slot: string
    today: number
    yesterday: number
}

function generateRadialLines(): RadialLineRow[] {
    return HEATMAP_SLOTS.map((slot) => ({
        slot,
        today: faker.number.int({ min: 20, max: 100 }),
        yesterday: faker.number.int({ min: 20, max: 100 }),
    }))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RadialLineSection() {
    const [rows, setRows] = useState<RadialLineRow[]>(() => generateRadialLines())
    const [closePath, setClosePath] = useState(true)

    return (
        <ChartSection
            title="Radial lines (Premium)"
            component="<RadialLineChart />"
            usecase="Cyclical patterns — hourly traffic, seasonal trends, or periodic data plotted around a radial axis"
            action={
                <div className="flex gap-1">
                    <Button
                        size="xs"
                        variant={closePath ? 'default' : 'outline'}
                        onClick={() => setClosePath((value) => !value)}
                    >
                        Close path
                    </Button>
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setRows(generateRadialLines())}
                    >
                        Shuffle
                    </Button>
                </div>
            }
        >
            <RadialLineChart
                height={320}
                dataset={rows}
                series={[
                    {
                        dataKey: 'yesterday',
                        label: 'Yesterday',
                        curve: 'catmullRom',
                        closePath,
                    },
                    {
                        dataKey: 'today',
                        label: 'Today',
                        curve: 'catmullRom',
                        closePath,
                    },
                ]}
                rotationAxis={[
                    {
                        scaleType: 'band',
                        data: rows.map((row) => row.slot),
                    },
                ]}
                grid={{ radius: true }}
            />
            <p className="text-xs text-muted-foreground">
                Requests per 2-hour slot, today vs. yesterday —{' '}
                {rows.length} spokes around the rotation axis.
            </p>
        </ChartSection>
    )
}
