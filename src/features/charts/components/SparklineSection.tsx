import { Button } from '@/components/ui/button'
import ChartSection from '@/features/charts/components/ChartSection'
import { faker } from '@faker-js/faker'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Data — live request feed (random walk)
// ---------------------------------------------------------------------------

function generateLiveFeed(length = 40, base = 120): number[] {
    let level = base
    return Array.from({ length }, () => {
        level = Math.max(20, level + faker.number.int({ min: -12, max: 14 }))
        return level
    })
}

function nextLiveValue(current: number): number {
    return Math.max(20, current + faker.number.int({ min: -12, max: 14 }))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const MAX_POINTS = 40

export default function SparklineSection() {
    const [data, setData] = useState<number[]>(() => generateLiveFeed(MAX_POINTS))
    const [running, setRunning] = useState(true)
    const [plotType, setPlotType] = useState<'line' | 'bar'>('line')

    useEffect(() => {
        if (!running) return
        const id = setInterval(() => {
            setData((current) => [
                ...current.slice(-(MAX_POINTS - 1)),
                nextLiveValue(current.at(-1) ?? 0),
            ])
        }, 500)
        return () => clearInterval(id)
    }, [running])

    return (
        <ChartSection
            title="Sparkline"
            component="<SparkLineChart />"
            usecase="Compact trend indicators — KPI cards, real-time metrics, or inline sparklines in dashboards and tables"
            action={
                <div className="flex gap-1">
                    <Button
                        size="xs"
                        variant={running ? 'default' : 'outline'}
                        onClick={() => setRunning((value) => !value)}
                    >
                        {running ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                            setPlotType((type) => (type === 'line' ? 'bar' : 'line'))
                        }
                    >
                        {plotType === 'line' ? 'Bar' : 'Line'}
                    </Button>
                </div>
            }
        >
            <div className="rounded-lg border bg-muted/30 px-3 py-4">
                <SparkLineChart
                    data={data}
                    height={60}
                    plotType={plotType}
                    area={plotType === 'line'}
                    curve={plotType === 'line' ? 'monotoneX' : undefined}
                    showHighlight
                    showTooltip
                />
            </div>
            <p className="text-xs text-muted-foreground">
                {data.length} points buffered — latest {data.at(-1) ?? 0} req/s
            </p>
        </ChartSection>
    )
}
