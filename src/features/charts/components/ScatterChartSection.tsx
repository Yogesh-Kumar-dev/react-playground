import { Button } from '@/components/ui/button'
import ChartSection from '@/features/charts/components/ChartSection'
import {
    SEGMENTS,
    SEGMENT_COLORS,
    withAlpha,
} from '@/features/charts/shared'
import { faker } from '@faker-js/faker'
import { ScatterChart } from '@mui/x-charts/ScatterChart'
import type { ChartsActivationEvent, ScatterItemIdentifier } from '@mui/x-charts/models'
import { useMemo, useState } from 'react'

// ---------------------------------------------------------------------------
// Data — customers clustered by segment (spend vs. engagement)
// ---------------------------------------------------------------------------

export interface Customer {
    id: string
    name: string
    segment: (typeof SEGMENTS)[number]
    spendK: number
    engagement: number
}

const SEGMENT_CLUSTERS: Record<
    (typeof SEGMENTS)[number],
    { spend: number; engagement: number }
> = {
    Enterprise: { spend: 180, engagement: 70 },
    SMB: { spend: 90, engagement: 45 },
    Startup: { spend: 30, engagement: 60 },
}

function generateCustomers(perSegment = 14): Customer[] {
    return SEGMENTS.flatMap((segment) => {
        const cluster = SEGMENT_CLUSTERS[segment]
        return Array.from({ length: perSegment }, () => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            segment,
            spendK: Math.round(
                Math.max(
                    5,
                    faker.number.int({
                        min: cluster.spend - 60,
                        max: cluster.spend + 60,
                    })
                )
            ),
            engagement: Math.min(
                100,
                Math.max(
                    5,
                    faker.number.int({
                        min: cluster.engagement - 30,
                        max: cluster.engagement + 30,
                    })
                )
            ),
        }))
    })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ScatterChartSectionProps {
    selectedCustomer: Customer | null
    onSelectCustomer: (customer: Customer | null) => void
}

export default function ScatterChartSection({
    selectedCustomer,
    onSelectCustomer,
}: Readonly<ScatterChartSectionProps>) {
    const [customers, setCustomers] = useState<Customer[]>(() =>
        generateCustomers()
    )

    const bySegment = useMemo(
        () =>
            SEGMENTS.map((segment) => ({
                segment,
                customers: customers.filter(
                    (customer) => customer.segment === segment
                ),
            })),
        [customers]
    )

    const handleItemClick = (
        _event: ChartsActivationEvent<SVGElement>,
        payload: ScatterItemIdentifier | null
    ) => {
        if (!payload) return
        const segment = bySegment.find(
            (entry) => entry.segment === payload.seriesId
        )
        const customer = segment?.customers[payload.dataIndex]
        if (!customer) return
        onSelectCustomer(
            customer.id === selectedCustomer?.id ? null : customer
        )
    }

    const handleShuffle = () => {
        setCustomers(generateCustomers())
        onSelectCustomer(null)
    }

    return (
        <ChartSection
            title="Scatter"
            component="<ScatterChart />"
            usecase="Finding correlations — spend vs. engagement, price vs. demand, or any two-variable relationship across groups"
            action={
                <Button
                    size="xs"
                    variant="outline"
                    onClick={handleShuffle}
                >
                    Shuffle customers
                </Button>
            }
        >
            <ScatterChart
                height={300}
                grid={{ horizontal: true, vertical: true }}
                xAxis={[
                    {
                        label: 'Annual spend ($k)',
                        labelStyle: { fill: 'var(--muted-foreground)' },
                        tickLabelStyle: { fill: 'var(--muted-foreground)' },
                        min: 0,
                        max: 260,
                    },
                ]}
                yAxis={[
                    {
                        label: 'Engagement score',
                        labelStyle: { fill: 'var(--muted-foreground)' },
                        tickLabelStyle: { fill: 'var(--muted-foreground)' },
                        min: 0,
                        max: 100,
                    },
                ]}
                series={bySegment.map(({ segment, customers: points }) => ({
                    type: 'scatter' as const,
                    id: segment,
                    label: segment,
                    color:
                        selectedCustomer &&
                            selectedCustomer.segment !== segment
                            ? withAlpha(SEGMENT_COLORS[segment], '40')
                            : SEGMENT_COLORS[segment],
                    data: points.map((point) => ({
                        x: point.spendK,
                        y: point.engagement,
                        id: point.id,
                    })),
                }))}
                onItemClick={handleItemClick}
            />
            <p className="text-xs text-muted-foreground">
                {selectedCustomer
                    ? `Selected: ${selectedCustomer.name} — ${selectedCustomer.segment}, $${selectedCustomer.spendK}k spend, engagement ${selectedCustomer.engagement}. Click it again or shuffle to clear.`
                    : 'Click a customer point — the selection lives in the page and dims matching bar series above.'}
            </p>
        </ChartSection>
    )
}
