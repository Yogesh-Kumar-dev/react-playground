import { QueryClient } from '@tanstack/react-query'

// Single app-wide QueryClient. Created outside React so the
// QueryClientProvider and the route loaders share the same instance:
// loaders call queryClient.ensureQueryData() to pre-fill the cache before a
// component mounts, and the component's useQuery reads that data instantly.
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})