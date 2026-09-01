'use client'

import { faker } from '@faker-js/faker'
import { useState } from 'react'
import { FunnelChart } from '@mui/x-charts-premium/FunnelChart'
import { Button } from '@/components/ui/button'
import ChartSection from '@/features/charts/components/ChartSection'

// ---------------------------------------------------------------------------
// Data — signup conversion funnel
// ---------------------------------------------------------------------------

export interface FunnelStage {
    id: string
    label: string
    value: number
}

const FUNNEL_STAGE_LABELS = [
    'Visited',
    'Signed up',
    'Activated',
    'Subscribed',
    'Referred',
]

function generateFunnelStages(): FunnelStage[] {
    let volume = faker.number.int({ min: 4_000, max: 9_000 })
    return FUNNEL_STAGE_LABELS.map((label) => {
        const stage: FunnelStage = { id: label.toLowerCase(), label, value: volume }
        volume = Math.max(
            60,
            Math.round(volume * faker.number.float({ min: 0.3, max: 0.7 }))
        )
        return stage
    })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FunnelSection() {
    const [stages, setStages] = useState<FunnelStage[]>(() =>
        generateFunnelStages()
    )
    const [variant, setVariant] = useState<'filled' | 'outlined'>('filled')

    return (
        <ChartSection
            title="Funnel (Pro)"
            component="<FunnelChart />"
            usecase="Conversion through stages — signup flows, sales pipelines, or any sequential drop-off process"
            action={
                <div className="flex gap-1">
                    <Button
                        size="xs"
                        variant={variant === 'outlined' ? 'default' : 'outline'}
                        onClick={() =>
                            setVariant((current) =>
                                current === 'filled' ? 'outlined' : 'filled'
                            )
                        }
                    >
                        {variant}
                    </Button>
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setStages(generateFunnelStages())}
                    >
                        Shuffle stages
                    </Button>
                </div>
            }
        >
            <FunnelChart
                height={300}
                series={[
                    {
                        type: 'funnel',
                        data: stages,
                        curve: 'bump',
                        borderRadius: 8,
                        variant,
                    },
                ]}
            />
            <p className="text-xs text-muted-foreground">
                {stages[0]?.value.toLocaleString()} visitors →{' '}
                {stages.at(-1)?.value.toLocaleString()} referred — every stage
                drops by a random factor, faker-seeded.
            </p>
        </ChartSection>
    )
}
