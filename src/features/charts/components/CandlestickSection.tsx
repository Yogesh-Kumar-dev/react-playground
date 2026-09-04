import { Button } from '@/components/ui/button'
import ChartSection from '@/features/charts/components/ChartSection'
import { faker } from '@faker-js/faker'
import { CandlestickChart } from '@mui/x-charts-premium/CandlestickChart'
import type { OHLCValueType } from '@mui/x-charts-premium/models'
import { useState } from 'react'

// ---------------------------------------------------------------------------
// Data — fake stock price candles
// ---------------------------------------------------------------------------

export interface Candle {
    label: string
    values: OHLCValueType
}

function generateCandles(count = 30): Candle[] {
    let price = faker.number.int({ min: 90, max: 140 })
    const today = new Date()
    return Array.from({ length: count }, (_, i) => {
        const open = price
        const close = Math.max(20, open + faker.number.int({ min: -9, max: 10 }))
        const high = Math.max(open, close) + faker.number.int({ min: 0, max: 7 })
        const low = Math.max(15, Math.min(open, close) - faker.number.int({ min: 0, max: 7 }))
        price = close
        const date = new Date(today)
        date.setDate(today.getDate() - (count - 1 - i))
        return {
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            values: [open, high, low, close],
        }
    })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const tickStyle = { fill: 'var(--muted-foreground)' }

export default function CandlestickSection() {
    const [candles, setCandles] = useState<Candle[]>(() => generateCandles())

    const lastClose = candles.at(-1)?.values[3] ?? 0
    const previousClose = candles.at(-2)?.values[3] ?? lastClose
    const change = lastClose - previousClose

    return (
        <ChartSection
            title="Candlestick (Premium)"
            component="<CandlestickChart />"
            usecase="Financial OHLC data — stock trading, crypto prices, or any open/high/low/close time-series"
            action={
                <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setCandles(generateCandles())}
                >
                    Shuffle candles
                </Button>
            }
        >
            <CandlestickChart
                height={300}
                grid={{ horizontal: true }}
                xAxis={[
                    {
                        scaleType: 'band',
                        data: candles.map((candle) => candle.label),
                        tickLabelStyle: tickStyle,
                    },
                ]}
                series={[{ type: 'ohlc', data: candles.map((c) => c.values), label: 'ACME' }]}
            />
            <p className="text-xs text-muted-foreground">
                Last close {lastClose.toLocaleString()} —{' '}
                {change >= 0 ? '+' : ''}
                {change.toLocaleString()} vs. previous day ({candles.length}{' '}
                candles).
            </p>
        </ChartSection>
    )
}
