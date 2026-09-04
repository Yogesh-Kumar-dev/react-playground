import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import ChartSection from '@/features/charts/components/ChartSection'
import { HEATMAP_SLOTS } from '@/features/charts/shared'
import { faker } from '@faker-js/faker'
import { Heatmap } from '@mui/x-charts-premium/Heatmap'
import { useMemo, useState } from 'react'

// ---------------------------------------------------------------------------
// Data — support requests by weekday and time slot
// ---------------------------------------------------------------------------

const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type HeatmapValue = readonly [number, number, number]

function generateHeatmapData(): HeatmapValue[] {
    const data: HeatmapValue[] = []
    for (let y = 0; y < HEATMAP_DAYS.length; y += 1) {
        for (let x = 0; x < HEATMAP_SLOTS.length; x += 1) {
            const weekday = y < 5
            const businessHours = x >= 4 && x <= 8
            let base = 12
            if (weekday) {
                base = businessHours ? 70 : 25
            }
            data.push([
                x,
                y,
                faker.number.int({
                    min: Math.round(base * 0.4),
                    max: Math.round(base * 1.4),
                }),
            ])
        }
    }
    return data
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const tickStyle = { fill: 'var(--muted-foreground)' }

export default function HeatmapSection() {
    const [data, setData] = useState<HeatmapValue[]>(() => generateHeatmapData())
    const [threshold, setThreshold] = useState(0)

    const visibleData = useMemo(
        () => data.filter(([, , value]) => value >= threshold),
        [data, threshold]
    )

    return (
        <ChartSection
            title="Heatmap (Pro)"
            component="<Heatmap />"
            usecase="Intensity across two dimensions — activity by day/hour, correlation matrices, or usage heatmaps"
            action={
                <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setData(generateHeatmapData())}
                >
                    Shuffle requests
                </Button>
            }
        >
            <Heatmap
                height={260}
                borderRadius={4}
                xAxis={[{ data: HEATMAP_SLOTS, tickLabelStyle: tickStyle }]}
                yAxis={[{ data: HEATMAP_DAYS, tickLabelStyle: tickStyle }]}
                series={[{ type: 'heatmap', data: visibleData }]}
            />
            <div className="flex items-center gap-3">
                <span className="w-28 text-xs text-muted-foreground">
                    Threshold: {threshold}
                </span>
                <Slider
                    value={[threshold]}
                    min={0}
                    max={120}
                    onValueChange={(value) =>
                        setThreshold(Array.isArray(value) ? value[0] : value)
                    }
                />
            </div>
            <p className="text-xs text-muted-foreground">
                {visibleData.length}/{data.length} cells visible — paid component,
                so the "Missing license key" console notice is expected.
            </p>
        </ChartSection>
    )
}
