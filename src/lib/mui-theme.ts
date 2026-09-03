import { createTheme } from '@mui/material/styles'

export const darkTheme = createTheme({
    palette: { mode: 'dark' },
    components: {
        MuiAccordion: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundImage: 'none',
                    '&:before': { display: 'none' },
                    '&:not(:last-of-type)': { marginBottom: 12 },
                    '&.Mui-expanded': { margin: '0 0 12px' },
                },
            },
        },
    },
})
