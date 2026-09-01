'use client'

import './charts.css'
import { useState } from 'react'
import BarChartSection from '@/features/charts/components/BarChartSection'
import CandlestickSection from '@/features/charts/components/CandlestickSection'
import FunnelSection from '@/features/charts/components/FunnelSection'
import GaugeSection from '@/features/charts/components/GaugeSection'
import HeatmapSection from '@/features/charts/components/HeatmapSection'
import LineChartSection from '@/features/charts/components/LineChartSection'
import PieChartSection from '@/features/charts/components/PieChartSection'
import RadarChartSection from '@/features/charts/components/RadarChartSection'
import RadialBarSection from '@/features/charts/components/RadialBarSection'
import RadialLineSection from '@/features/charts/components/RadialLineSection'
import SankeySection from '@/features/charts/components/SankeySection'
import ScatterChartSection from '@/features/charts/components/ScatterChartSection'
import SparklineSection from '@/features/charts/components/SparklineSection'
import type { Customer } from '@/features/charts/components/ScatterChartSection'

export default function Charts() {
    // Shared cross-chart state: the scatter section writes it (point click),
    // the bar section reads it (dimming). One page-level useState.
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null
    )

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

            <BarChartSection dimmedSegment={selectedCustomer?.segment ?? null} />
            <LineChartSection />
            <PieChartSection />
            <ScatterChartSection
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
            />
            <RadarChartSection />
            <SparklineSection />
            <GaugeSection />
            <HeatmapSection />
            <FunnelSection />
            <SankeySection />
            <CandlestickSection />
            <RadialBarSection />
            <RadialLineSection />
        </div>
    )
}
