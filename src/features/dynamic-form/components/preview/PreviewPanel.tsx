import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PreviewContent } from './PreviewContent'

export const PreviewPanel = memo(function PreviewPanel() {
    return (
        <div className="sticky top-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">
                        Form State (Live)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <PreviewContent />
                </CardContent>
            </Card>
        </div>
    )
})
