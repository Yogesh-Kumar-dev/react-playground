import type { Customer } from '@/features/charts/components/ScatterChartSection'
import { lazy, useState, type ReactNode, type SyntheticEvent } from 'react'
import './charts.css'
import { ChartAccordion } from './components/ChartAccordian'
const BarChartSection = lazy(() => import('@/features/charts/components/BarChartSection'))
const GaugeSection = lazy(() => import('@/features/charts/components/GaugeSection'))
const LineChartSection = lazy(() => import('@/features/charts/components/LineChartSection'))
const PieChartSection = lazy(() => import('@/features/charts/components/PieChartSection'))
const RadarChartSection = lazy(() => import('@/features/charts/components/RadarChartSection'))
const ScatterChartSection = lazy(() => import('@/features/charts/components/ScatterChartSection'))
const SparklineSection = lazy(() => import('@/features/charts/components/SparklineSection'))

const CandlestickSection = lazy(() => import('@/features/charts/components/CandlestickSection'))
const FunnelSection = lazy(() => import('@/features/charts/components/FunnelSection'))
const HeatmapSection = lazy(() => import('@/features/charts/components/HeatmapSection'))
const RadialBarSection = lazy(() => import('@/features/charts/components/RadialBarSection'))
const RadialLineSection = lazy(() => import('@/features/charts/components/RadialLineSection'))
const SankeySection = lazy(() => import('@/features/charts/components/SankeySection'))

const panels = [
    'bar',
    'line',
    'pie',
    'scatter',
    'radar',
    'sparkline',
    'gauge',
    'heatmap',
    'funnel',
    'sankey',
    'candlestick',
    'radial-bar',
    'radial-line',
] as const
export type PanelId = (typeof panels)[number]

export default function Charts() {

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

    const [expanded, setExpanded] = useState<PanelId | false>(false)
    const handleChange =
        (panel: PanelId) => (_event: SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false)
        }

    const chartPanels: { panel: PanelId; title: string; render: () => ReactNode }[] = [
        {
            panel: 'bar',
            title: 'Bar',
            render: () => (
                <BarChartSection dimmedSegment={selectedCustomer?.segment ?? null} />
            ),
        },
        { panel: 'line', title: 'Line', render: () => <LineChartSection /> },
        { panel: 'pie', title: 'Pie', render: () => <PieChartSection /> },
        {
            panel: 'scatter',
            title: 'Scatter',
            render: () => (
                <ScatterChartSection
                    selectedCustomer={selectedCustomer}
                    onSelectCustomer={setSelectedCustomer}
                />
            ),
        },
        { panel: 'radar', title: 'Radar', render: () => <RadarChartSection /> },
        { panel: 'sparkline', title: 'Sparkline', render: () => <SparklineSection /> },
        { panel: 'gauge', title: 'Gauge', render: () => <GaugeSection /> },
        { panel: 'heatmap', title: 'Heatmap (Premium)', render: () => <HeatmapSection /> },
        { panel: 'funnel', title: 'Funnel (Premium)', render: () => <FunnelSection /> },
        { panel: 'sankey', title: 'Sankey (Premium)', render: () => <SankeySection /> },
        {
            panel: 'candlestick',
            title: 'Candlestick (Premium)',
            render: () => <CandlestickSection />,
        },
        {
            panel: 'radial-bar',
            title: 'Radial Bar (Premium)',
            render: () => <RadialBarSection />,
        },
        {
            panel: 'radial-line',
            title: 'Radial Line (Premium)',
            render: () => <RadialLineSection />,
        },
    ]

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Charts</h1>
                <p className="text-muted-foreground">
                    MUI X Charts (v9) fed by faker-generated data — one
                    state-management technique per chart type. Community
                    components are unlicensed; the Pro/Premium ones expect the
                    &quot;Missing license key&quot; console notice.
                </p>
            </div>

            {chartPanels.map(({ panel, title, render }) => (
                <ChartAccordion
                    key={panel}
                    panel={panel}
                    title={title}
                    expanded={expanded}
                    onChange={handleChange}
                >
                    {render()}
                </ChartAccordion>
            ))}
        </div>
    )
}

