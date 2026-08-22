import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '@/app/layout/MainLayout'
import HomePage from '@/app/pages/HomePage'
import AnimeChan from '@/features/animechan'
import Imgflip from '@/features/imgflip'
import TanstackHighlight from '@/features/tanstack-highlight'
import WebComponents from '@/features/web-components'
import { animeChanLoader } from '@/features/animechan/loader'
import { imgflipLoader } from '@/features/imgflip/loader'
import { webComponentsLoader } from '@/features/web-components/loader'
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
                element: <AnimeChan />,
                loader: animeChanLoader(queryClient),
            },
            {
                path: '/imgflip',
                element: <Imgflip />,
                loader: imgflipLoader(queryClient),
            },
            {
                path: '/tanstack-highlight',
                element: <TanstackHighlight />,
            },
            {
                path: '/web-components',
                element: <WebComponents />,
                loader: webComponentsLoader(queryClient),
            },
        ],
    },
]

// Create router
const basename =
    import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

const router = createBrowserRouter(routes, { basename })

// Export router provider component
export function Router() {
    return <RouterProvider router={router} />
}

export default Router
