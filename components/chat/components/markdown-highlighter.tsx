import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { tsx } from '@tanstack/highlight/languages/tsx'
import { ts } from '@tanstack/highlight/languages/ts'
import { js } from '@tanstack/highlight/languages/js'
import { json } from '@tanstack/highlight/languages/json'
import { createTanStackMarkdownHighlighter } from '@tanstack/highlight/markdown'
import type { CodeHighlighter } from '@tanstack/markdown'
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

const baseHighlighter = createHighlighter({
    languages: [ts, tsx, js, css, json],
})

export const highlightMarkdownCode: CodeHighlighter = createTanStackMarkdownHighlighter(baseHighlighter)

// FIX: Correcting selectors to force variable binding
export const markdownHighlightCss = createThemeCss({
    light: githubLightTheme,
    dark: githubDarkTheme,
    lightSelector: '.md-content',
    darkSelector: '.md-content .dark',
    codeBlockSelector: '.md-content pre.tm-code',
    lineNumbersSelector: 'md-content .tm-code--line-numbers',
})
