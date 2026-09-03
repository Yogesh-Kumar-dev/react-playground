import { Router } from '@/app/routes'
import { Xray } from '@stinsky/xray'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { darkTheme } from '@/lib/mui-theme'

export default function App() {
  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={darkTheme}>
        <Router />
        <Xray />
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
