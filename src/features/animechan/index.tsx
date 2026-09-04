
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BrowseTab from '@/features/animechan/components/BrowseTab'
import RandomQuoteTab from '@/features/animechan/components/RandomQuoteTab'
import { TAB_VALUES } from '@/features/animechan/tab-values'
import { parseAsInteger, parseAsStringEnum, useQueryState } from 'nuqs'

export default function AnimeChan() {
    const [tab, setTab] = useQueryState(
        'tab',
        parseAsStringEnum(TAB_VALUES).withDefault('browse')
    )
    // Setters for URL state owned by each tab so it can be cleared when
    // navigating to another tab.
    const [, setSearch] = useQueryState('search', { defaultValue: '' })
    const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
    const [anime, setAnime] = useQueryState('anime', { defaultValue: '' })
    const [character, setCharacter] = useQueryState('character', {
        defaultValue: '',
    })

    const handleTabChange = (nextTab: string) => {
        if (tab === nextTab) return
        // Each tab owns its own state; leaving a tab clears it so the next
        // visit starts fresh.
        if (tab === 'browse') {
            void setSearch(null)
            void setPage(null)
        } else if (tab === 'random-anime') {
            void setAnime(null)
        } else if (tab === 'random-character') {
            void setCharacter(null)
        }
        void setTab(nextTab)
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">AnimeChan</h1>
            <p className="mb-6 text-muted-foreground">
                Browse the anime catalogue or fetch random quotes by anime and
                character.
            </p>

            <Tabs value={tab} onValueChange={handleTabChange}>
                <TabsList>
                    <TabsTrigger value="browse">Browse Animes</TabsTrigger>
                    <TabsTrigger value="random-anime">
                        Random by Anime
                    </TabsTrigger>
                    <TabsTrigger value="random-character">
                        Random by Character
                    </TabsTrigger>
                    <TabsTrigger value="random">Random Quote</TabsTrigger>
                </TabsList>
                <TabsContent value="browse">
                    <BrowseTab />
                </TabsContent>
                <TabsContent value="random-anime">
                    <RandomQuoteTab
                        mode="anime"
                        value={anime}
                        onValueChange={setAnime}
                    />
                </TabsContent>
                <TabsContent value="random-character">
                    <RandomQuoteTab
                        mode="character"
                        value={character}
                        onValueChange={setCharacter}
                    />
                </TabsContent>
                <TabsContent value="random">
                    <RandomQuoteTab mode="random" />
                </TabsContent>
            </Tabs>
        </div>
    )
}