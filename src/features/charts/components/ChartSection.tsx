import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { ReactNode } from 'react'

interface ChartSectionProps {
    title: string
    /** The MUI component being demoed, e.g. `<BarChart />` */
    component: string
    /** The state-management usecase this section explores */
    usecase: string
    /** Controls rendered in the card header action slot */
    action?: ReactNode
    children: ReactNode
}

export default function ChartSection({
    title,
    component,
    usecase,
    action,
    children,
}: Readonly<ChartSectionProps>) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {title}{' '}
                    <span className="font-normal text-muted-foreground">
                        — <code className="text-xs">{component}</code>
                    </span>
                </CardTitle>
                <CardDescription>
                    <span className="font-medium">{usecase}</span>
                </CardDescription>
                {action ? <CardAction>{action}</CardAction> : null}
            </CardHeader>
            <CardContent className="space-y-3">{children}</CardContent>
        </Card>
    )
}
