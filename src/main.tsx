import { scan } from 'react-scan'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './index.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'

scan({ enabled: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
