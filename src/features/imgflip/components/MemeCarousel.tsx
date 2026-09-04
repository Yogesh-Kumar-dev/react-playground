import { Button } from '@/components/ui/button'
import type { Meme } from '@/features/imgflip/api'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import 'swiper/css'
import 'swiper/css/keyboard'
import 'swiper/css/virtual'
import { Keyboard, Virtual } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'

// How many memes to show per view. Currently one at a time; bumping this to
// 4 or 6 (optionally via breakpoints) is a one-line change.
const SLIDES_PER_VIEW = 1
const BREAKPOINTS = {}

interface MemeCarouselProps {
    memes: Meme[]
    /** Active slide index (URL-tracked by the page). */
    index: number
    onIndexChange: (index: number) => void
}

export default function MemeCarousel({
    memes,
    index,
    onIndexChange,
}: Readonly<MemeCarouselProps>) {
    const [swiper, setSwiper] = useState<SwiperClass | null>(null)

    // Reflect external index changes (browser back/forward, direct URL).
    useEffect(() => {
        if (swiper && swiper.activeIndex !== index) {
            swiper.slideTo(index, 0)
        }
    }, [swiper, index])

    return (
        <div className="flex min-w-0 flex-col gap-4">
            <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-lg border border-border bg-muted/40 p-6">
                <Swiper
                    modules={[Virtual, Keyboard]}
                    slidesPerView={SLIDES_PER_VIEW}
                    breakpoints={BREAKPOINTS}
                    centeredSlides
                    spaceBetween={24}
                    keyboard={{ enabled: true }}
                    virtual={{ enabled: true }}
                    initialSlide={index}
                    onSwiper={setSwiper}
                    onSlideChange={(s) => onIndexChange(s.activeIndex)}
                    className="h-full w-full"
                >
                    {memes.map((meme) => (
                        <SwiperSlide
                            key={meme.id}
                            className="flex! items-center justify-center"
                        >
                            <img
                                src={meme.url}
                                alt={meme.name}
                                loading="lazy"
                                className="max-h-[60vh] max-w-full rounded-lg border border-border object-contain shadow-lg"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={!swiper || swiper.isBeginning}
                    onClick={() => swiper?.slidePrev()}
                >
                    <ChevronLeft className="size-4" />
                </Button>

                <span className="text-sm text-muted-foreground">
                    {index + 1} / {memes.length}
                </span>

                <Button
                    variant="outline"
                    size="icon"
                    disabled={!swiper || swiper.isEnd}
                    onClick={() => swiper?.slideNext()}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    )
}