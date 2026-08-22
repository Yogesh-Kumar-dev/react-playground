// Single source of truth for the AnimeChan tab values. Lives outside the page
// component so the route loader can evaluate the ?tab= param without guessing.
export const TAB_VALUES: string[] = [
    'browse',
    'random-anime',
    'random-character',
    'random',
]