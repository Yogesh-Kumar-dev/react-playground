'use client'

import { faker } from '@faker-js/faker'
import { useState } from 'react'
import { SankeyChart } from '@mui/x-charts-premium/SankeyChart'
import { Button } from '@/components/ui/button'
import ChartSection from '@/features/charts/components/ChartSection'

// ---------------------------------------------------------------------------
// Data — traffic flow from sources through pages to goals
// ---------------------------------------------------------------------------

export interface SankeyFlow {
    nodes: { id: string; label: string }[]
    links: { source: string; target: string; value: number }[]
}

const SANKEY_SOURCES = ['Organic', 'Direct', 'Social', 'Email']
const SANKEY_PAGES = ['Docs', 'Pricing', 'Blog']
const SANKEY_GOALS = ['Signup', 'Purchase']

function generateSankeyFlow(): SankeyFlow {
    const pick = (min: number, max: number) => faker.number.int({ min, max })
    const links: SankeyFlow['links'] = [
        ...SANKEY_SOURCES.flatMap((source) =>
            SANKEY_PAGES.map((page) => ({ source, target: page, value: pick(150, 900) }))
        ),
        ...SANKEY_PAGES.flatMap((page) =>
            SANKEY_GOALS.map((goal) => ({ source: page, target: goal, value: pick(60, 400) }))
        ),
    ]
    return {
        nodes: [...SANKEY_SOURCES, ...SANKEY_PAGES, ...SANKEY_GOALS].map(
            (label) => ({ id: label, label })
        ),
        links,
    }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SankeySection() {
    const [flow, setFlow] = useState<SankeyFlow>(() => generateSankeyFlow())

    const totalOut = flow.links
        .filter((link) => link.target === 'Purchase')
        .reduce((sum, link) => sum + link.value, 0)

    return (
        <ChartSection
            title="Sankey (Pro)"
            component="<SankeyChart />"
            usecase="Flow between nodes — traffic sources to pages to goals, budget allocation, or energy transfer diagrams"
            action={
                <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setFlow(generateSankeyFlow())}
                >
                    Shuffle flows
                </Button>
            }
        >
            <SankeyChart height={320} series={{ type: 'sankey', data: flow }} />
            <p className="text-xs text-muted-foreground">
                {flow.nodes.length} nodes, {flow.links.length} links —{' '}
                {totalOut.toLocaleString()} conversions reaching Purchase.
            </p>
        </ChartSection>
    )
}
