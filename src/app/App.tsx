import { lazy, Suspense } from 'react'
import { Router } from '@/app/routes'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '@/lib/mui-theme'

const Xray = import.meta.env.DEV
  ? lazy(() => import('@stinsky/xray').then((m) => ({ default: m.Xray })))
  : null

export default function App() {
  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={darkTheme}>
        <Router />
        {Xray && (
          <Suspense fallback={null}>
            <Xray />
          </Suspense>
        )}
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
