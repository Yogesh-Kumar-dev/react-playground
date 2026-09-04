import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import MemeCarousel from '@/features/imgflip/components/MemeCarousel'
import MemeInfoPanel from '@/features/imgflip/components/MemeInfoPanel'
import { imgflipMemesQuery } from '@/features/imgflip/query-options'
import { useQuery } from '@tanstack/react-query'
import { parseAsInteger, useQueryState } from 'nuqs'

export default function Imgflip() {
    const [idx, setIdx] = useQueryState('idx', parseAsInteger.withDefault(0))

    const memesQuery = useQuery(imgflipMemesQuery())

    const memes = memesQuery.data ?? []
    const activeMeme = memes[idx] ?? null

    const handleShuffle = () => {
        if (memes.length <= 1) return
        let next = Math.floor(Math.random() * memes.length)
        if (next === idx && memes.length > 1) next = (idx + 1) % memes.length
        setIdx(next)
    }
    let content: React.ReactNode
    if (memesQuery.isPending) {
        content = (
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <Skeleton className="h-[70vh] w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    } else if (memesQuery.isError) {
        content = (
            <Card>
                <CardContent className="py-8 text-sm text-destructive">
                    {(memesQuery.error as Error).message}
                </CardContent>
            </Card>
        )
    } else {
        content = (
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <MemeCarousel
                    memes={memes}
                    index={idx}
                    onIndexChange={setIdx}
                />
                <MemeInfoPanel
                    meme={activeMeme}
                    loading={memesQuery.isPending}
                    onShuffle={handleShuffle}
                    disabled={memes.length <= 1}
                />
            </div>
        )
    }
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Imgflip</h1>
            <p className="mb-6 text-muted-foreground">
                Browse the current top meme templates, one at a time.
            </p>

            {content}
        </div>
    )
}