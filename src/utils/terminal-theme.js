import xtermTheme from 'xterm-theme'

export const terminalThemeOptions = [
  { label: 'Default', value: 'Default' },
  ...Object.keys(xtermTheme).map((name) => ({ label: name, value: name }))
]
