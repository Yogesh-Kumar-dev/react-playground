// The AnimeChan API returns 100 anime per page, while the browse UI paginates
// by 10 per view. These helpers translate between "view pages" (what the user
// sees, e.g. ?page=7) and "API pages" (what is fetched and cached). Kept in
// one place so the route loader and the component always derive the same cache
// key for the same URL.
export const VIEW_SIZE = 10
export const API_PAGE_SIZE = 100
export const VIEWS_PER_API_PAGE = API_PAGE_SIZE / VIEW_SIZE

/** Which API page (100/page) contains the given 10-per-view page. */
export function apiPageForViewPage(viewPage: number): number {
    const safePage = Math.max(1, viewPage)
    return Math.max(1, Math.ceil(safePage / VIEWS_PER_API_PAGE))
}

/** Index within that API page where the view page's slice starts. */
export function viewStartIndex(viewPage: number): number {
    const safePage = Math.max(1, viewPage)
    return ((safePage - 1) % VIEWS_PER_API_PAGE) * VIEW_SIZE
}