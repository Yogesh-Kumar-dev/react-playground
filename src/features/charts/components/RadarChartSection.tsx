'use client'

import { faker } from '@faker-js/faker'
import { useReducer } from 'react'
import { RadarChart } from '@mui/x-charts/RadarChart'
import { Button } from '@/components/ui/button'
import ChartSection from '@/features/charts/components/ChartSection'

// ---------------------------------------------------------------------------
// Data — developer team stats
// ---------------------------------------------------------------------------

const RADAR_METRICS = [
    'Shipping',
    'Quality',
    'Collaboration',
    'Ownership',
    'Communication',
    'Craft',
] as const
type RadarMetric = (typeof RADAR_METRICS)[number]

interface PlayerStats {
    name: string
    scores: Record<RadarMetric, number>
}

function generatePlayerStats(): PlayerStats {
    return {
        name: faker.person.firstName(),
        scores: Object.fromEntries(
            RADAR_METRICS.map((metric) => [
                metric,
                faker.number.int({ min: 35, max: 98 }),
            ])
        ) as Record<RadarMetric, number>,
    }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type RadarMode = 'single' | 'compare'

interface RadarState {
    mode: RadarMode
    players: [PlayerStats, PlayerStats]
}

type RadarAction = { type: 'toggle-mode' } | { type: 'shuffle' }

function radarReducer(state: RadarState, action: RadarAction): RadarState {
    switch (action.type) {
        case 'toggle-mode':
            return {
                ...state,
                mode: state.mode === 'single' ? 'compare' : 'single',
            }
        case 'shuffle':
            return {
                ...state,
                players: [generatePlayerStats(), generatePlayerStats()] as [
                    PlayerStats,
                    PlayerStats,
                ],
            }
        default:
            return state
    }
}

export default function RadarChartSection() {
    const [state, dispatch] = useReducer(radarReducer, undefined, (): RadarState => ({
        mode: 'compare',
        players: [generatePlayerStats(), generatePlayerStats()],
    }))

    const visiblePlayers =
        state.mode === 'single' ? [state.players[0]] : state.players

    return (
        <ChartSection
            title="Radar"
            component="<RadarChart />"
            usecase="Comparing multivariate profiles — player stats, skill assessments, or competitor benchmarking across dimensions"
            action={
                <div className="flex gap-1">
                    <Button
                        size="xs"
                        variant={state.mode === 'compare' ? 'default' : 'outline'}
                        onClick={() => dispatch({ type: 'toggle-mode' })}
                    >
                        Compare: {state.mode}
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => dispatch({ type: 'shuffle' })}>
                        Shuffle players
                    </Button>
                </div>
            }
        >
            <RadarChart
                height={300}
                radar={{ metrics: [...RADAR_METRICS], max: 100 }}
                series={visiblePlayers.map((player) => ({
                    type: 'radar' as const,
                    data: RADAR_METRICS.map((metric) => player.scores[metric]),
                    label: player.name,
                }))}
            />
        </ChartSection>
    )
}
