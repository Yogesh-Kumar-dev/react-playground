import { Button } from '@/components/ui/button'
import ChartSection from '@/features/charts/components/ChartSection'
import { faker } from '@faker-js/faker'
import { PieChart } from '@mui/x-charts/PieChart'
import { useLegend } from '@mui/x-charts/hooks'
import { useCallback, useState } from 'react'

// ---------------------------------------------------------------------------
// Data — traffic sources
// ---------------------------------------------------------------------------

export interface TrafficSlice {
    id: string
    label: string
    value: number
}

const TRAFFIC_SOURCES = [
    'Organic search',
    'Direct',
    'Referral',
    'Social',
    'Email',
    'Paid ads',
]

function generateTrafficSlices(): TrafficSlice[] {
    return TRAFFIC_SOURCES.map((label) => ({
        id: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        value: faker.number.int({ min: 400, max: 5_200 }),
    }))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PieLegend({ selectedId }: Readonly<{ selectedId: string | null }>) {
    const { items } = useLegend()

    return (
        <ul className="flex flex-col justify-center gap-y-2 px-2 text-xs">
            {items.map((item) => (
                <li
                    key={String(item.seriesId)}
                    className={
                        item.seriesId === selectedId
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground'
                    }
                >
                    <span
                        className="mr-1.5 inline-block size-2 rounded-full align-middle"
                        style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                </li>
            ))}
        </ul>
    )
}

export default function PieChartSection() {
    const [slices, setSlices] = useState<TrafficSlice[]>(() =>
        generateTrafficSlices()
    )
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const legendSlot = useCallback(
        () => <PieLegend selectedId={selectedId} />,
        [selectedId]
    )

    const total = slices.reduce((sum, slice) => sum + slice.value, 0)
    const selectedSlice =
        slices.find((slice) => slice.id === selectedId) ?? null

    return (
        <ChartSection
            title="Pie"
            component="<PieChart />"
            usecase="Showing composition — traffic sources, market share, or budget breakdown as proportions of a whole"
            action={
                <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setSlices(generateTrafficSlices())}
                >
                    Shuffle traffic
                </Button>
            }
        >
            <div className="flex items-center gap-6">
                <PieChart
                    height={260}
                    width={260}
                    slots={{ legend: legendSlot }}
                    slotProps={{
                        legend: {
                            position: { vertical: 'middle', horizontal: 'end' },
                        },
                    }}
                    series={[
                        {
                            data: slices,
                            innerRadius: 55,
                            outerRadius: 90,
                            paddingAngle: 2,
                            cornerRadius: 4,
                            highlightScope: {
                                highlight: 'item',
                                fade: 'global',
                            },
                        },
                    ]}
                    onItemClick={(_event, payload) => {
                        if (!payload) return
                        const id =
                            slices[payload.dataIndex]?.id ?? null
                        setSelectedId((current) =>
                            current === id ? null : id
                        )
                    }}
                />
            </div>
            <p className="text-xs text-muted-foreground">
                {selectedSlice
                    ? `Selected: ${selectedSlice.label} — ${selectedSlice.value.toLocaleString()} sessions (${Math.round((selectedSlice.value / total) * 100)}% of total). Click it again to clear.`
                    : 'Click a slice to select it — the legend (fed by useLegend) highlights it.'}
            </p>
        </ChartSection>
    )
}
