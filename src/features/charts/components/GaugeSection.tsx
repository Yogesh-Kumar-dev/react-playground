import { Slider } from '@/components/ui/slider'
import ChartSection from '@/features/charts/components/ChartSection'
import { faker } from '@faker-js/faker'
import { Gauge, useGaugeState } from '@mui/x-charts/Gauge'
import { useState } from 'react'

// ---------------------------------------------------------------------------
// Data — server load (slider-controlled; faker only seeds the initial value)
// ---------------------------------------------------------------------------

function generateInitialServerLoad(): number {
    return faker.number.int({ min: 15, max: 95 })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function GaugeNeedle() {
    const { valueAngle, maxRadius, cx, cy } = useGaugeState()
    if (valueAngle === null) return null

    const tipX = cx + Math.sin(valueAngle) * (maxRadius + 4)
    const tipY = cy - Math.cos(valueAngle) * (maxRadius + 4)
    const tailX = cx + Math.sin(valueAngle) * 14
    const tailY = cy - Math.cos(valueAngle) * 14

    return (
        <line
            x1={tailX}
            y1={tailY}
            x2={tipX}
            y2={tipY}
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
        />
    )
}

export default function GaugeSection() {
    const [load, setLoad] = useState<number>(() => generateInitialServerLoad())

    return (
        <ChartSection
            title="Gauge"
            component="<Gauge />"
            usecase="Single-metric dial — server load, completion rate, NPS score, or any value between a min and max range"
        >
            <div className="flex flex-col items-center gap-4 py-2 text-foreground">
                <Gauge
                    width={240}
                    height={140}
                    value={load}
                    valueMin={0}
                    valueMax={100}
                    startAngle={-90}
                    endAngle={90}
                    innerRadius="72%"
                    outerRadius="100%"
                    cornerRadius="50%"
                    text={`${load}%`}
                >
                    <GaugeNeedle />
                </Gauge>
                <div className="w-64">
                    <Slider
                        value={[load]}
                        min={0}
                        max={100}
                        onValueChange={(value) =>
                            setLoad(Array.isArray(value) ? value[0] : value)
                        }
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Slider state → <code>value</code> prop; the needle reads internal
                    gauge state (radian angle, center, maxRadius) via{' '}
                    <code>useGaugeState()</code>.
                </p>
            </div>
        </ChartSection>
    )
}
