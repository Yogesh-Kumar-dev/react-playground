import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

export const themeCss = createThemeCss({
  themes: [
    { selector: '[data-hl-theme="paper"]', theme: githubLightTheme },
    { selector: '[data-hl-theme="carbon"]', theme: githubDarkTheme },
  ],
})

export const decorationCss = `
  .th-focus {
    background: color-mix(in oklch, var(--primary) 14%, transparent);
  }
  .th-ins {
    background: color-mix(in oklch, #16a34a 16%, transparent);
    box-shadow: inset 3px 0 0 #16a34a;
  }
  .th-del {
    background: color-mix(in oklch, #dc2626 14%, transparent);
    box-shadow: inset 3px 0 0 #dc2626;
    opacity: 0.72;
  }
  .th-error {
    background: color-mix(in oklch, #dc2626 18%, transparent);
    box-shadow: inset 3px 0 0 #dc2626;
  }
  .th-warn {
    background: color-mix(in oklch, #ca8a04 18%, transparent);
    box-shadow: inset 3px 0 0 #ca8a04;
  }
`
