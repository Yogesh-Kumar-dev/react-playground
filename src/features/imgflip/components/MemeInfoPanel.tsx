import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Meme } from '@/features/imgflip/api'
import { Shuffle } from 'lucide-react'
import type { ReactNode } from 'react'

interface MemeInfoPanelProps {
    meme: Meme | null
    loading: boolean
    onShuffle?: () => void
    disabled?: boolean
}

export default function MemeInfoPanel({
    meme,
    loading,
    onShuffle,
    disabled = false,
}: Readonly<MemeInfoPanelProps>) {
    const shuffleDisabled = disabled || loading || !meme
    let content: ReactNode

    if (loading) {
        content = (
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        )
    } else if (meme) {
        content = (
            <>
                <img
                    src={meme.url}
                    alt={meme.name}
                    loading="lazy"
                    className="w-full rounded-lg border border-border object-contain"
                />
                <div className="space-y-1.5 text-sm">
                    <p className="font-medium">{meme.name}</p>
                    <dl className="space-y-1 text-muted-foreground">
                        <div className="flex justify-between gap-2">
                            <dt>ID</dt>
                            <dd className="font-mono">{meme.id}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt>Size</dt>
                            <dd>
                                {meme.width} × {meme.height}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt>Text boxes</dt>
                            <dd>{meme.box_count}</dd>
                        </div>
                    </dl>
                </div>
            </>
        )
    } else {
        content = (
            <p className="text-sm text-muted-foreground">
                Select a meme to see its details.
            </p>
        )
    }

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Meme Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {content}
            </CardContent>
            <CardFooter className="justify-center border-t pt-4">
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Shuffle to a random meme"
                                disabled={shuffleDisabled}
                                onClick={onShuffle}
                            >
                                <Shuffle className="size-4" />
                            </Button>
                        }
                    />
                    <TooltipContent>Shuffle to a random meme</TooltipContent>
                </Tooltip>
            </CardFooter>
        </Card>
    )
}