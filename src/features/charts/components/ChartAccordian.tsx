import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import { ChevronDownIcon } from 'lucide-react'
import { Suspense, type ReactNode, type SyntheticEvent } from 'react'
import type { PanelId } from '../index'


export function ChartAccordion({
    panel,
    title,
    expanded,
    onChange,
    children,
}: Readonly<{
    panel: PanelId
    title: string
    expanded: PanelId | false
    onChange: (panel: PanelId) => (event: SyntheticEvent, isExpanded: boolean) => void
    children: ReactNode
}>) {
    return (
        <Accordion
            expanded={expanded === panel}
            onChange={onChange(panel)}
            slotProps={{ transition: { mountOnEnter: true, unmountOnExit: false } }}
        >
            <AccordionSummary expandIcon={<ChevronDownIcon className="size-4" />}>
                <Typography component="span">{title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
                    {children}
                </Suspense>
            </AccordionDetails>
        </Accordion>
    )
}
