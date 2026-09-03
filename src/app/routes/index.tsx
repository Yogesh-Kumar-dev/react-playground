import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '@/app/layout/MainLayout'
import HomePage from '@/app/pages/HomePage'
import { queryClient } from '@/lib/query-client'

// Define routes
// Each data route's loader pre-fills the React Query cache (via the shared
// query options in that feature) before the component mounts, so navigation
// renders instantly instead of flashing a loading state.
const routes = [
    {
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <HomePage />,
            },
            {
                path: '/animechan',
                lazy: async () => {
                    const [{ default: Component }, { animeChanLoader }] = await Promise.all([
                        import('@/features/animechan'),
                        import('@/features/animechan/loader'),
                    ])
                    return { Component, loader: animeChanLoader(queryClient) }
                },
            },
            {
                path: '/imgflip',
                lazy: async () => {
                    const [{ default: Component }, { imgflipLoader }] = await Promise.all([
                        import('@/features/imgflip'),
                        import('@/features/imgflip/loader'),
                    ])
                    return { Component, loader: imgflipLoader(queryClient) }
                },
            },
            {
                path: '/tanstack-highlight',
                lazy: () => import('@/features/tanstack-highlight').then((m) => ({ Component: m.default })),
            },
            {
                path: '/web-components',
                lazy: async () => {
                    const [{ default: Component }, { webComponentsLoader }] = await Promise.all([
                        import('@/features/web-components'),
                        import('@/features/web-components/loader'),
                    ])
                    return { Component, loader: webComponentsLoader(queryClient) }
                },
            },
            {
                path: '/dynamic-form',
                lazy: () => import('@/features/dynamic-form').then((m) => ({ Component: m.default })),
            },
            {
                path: '/charts',
                lazy: () => import('@/features/charts').then((m) => ({ Component: m.default })),
            },
        ],
    },
]

// Create router
const router = createBrowserRouter(routes, {
    basename: '/react-playground',
})

// Export router provider component
export function Router() {
    return <RouterProvider router={router} />
}
