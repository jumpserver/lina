import color from 'css-color-function'
import formula from './formula.json'
import defaultThemeConfig from '@/styles/default-theme.scss'

export function generateColors(themeColors) {
  const colors = {}
  if (!themeColors || Object.keys(themeColors).length === 0) {
    themeColors = defaultThemeConfig
  }
  let primaryColor = themeColors
  const subColor = themeColors || defaultThemeConfig
  if (typeof themeColors === 'object') {
    primaryColor = themeColors['--color-primary']
  }

  for (const [key, value] of Object.entries(formula)) {
    let replaceColor
    if (value.includes('primary')) {
      replaceColor = value.replace(/primary/g, primaryColor)
    }
    if (value.includes('success')) {
      replaceColor = value.replace(/success/g, subColor['--color-success'])
    }
    if (value.includes('info')) {
      replaceColor = value.replace(/info/g, subColor['--color-info'])
    }
    if (value.includes('warning')) {
      replaceColor = value.replace(/warning/g, subColor['--color-warning'])
    }
    if (value.includes('danger')) {
      replaceColor = value.replace(/danger/g, subColor['--color-danger'])
    }
    if (replaceColor && !replaceColor.includes('undefined')) {
      const convertColor = color.convert(replaceColor)
      colors[key] = convertColor.indexOf('rgba') > -1 ? convertColor : colorRgbToHex(convertColor)
    }
  }

  return colors
}

/* 将rgb颜色转成hex */
export function colorRgbToHex(rgb) {
  const [r, g, b] = rgb.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
  return '#' + ((1 << 24) + (Number(r) << 16) + (Number(g) << 8) + Number(b)).toString(16).slice(1)
}

export function mix(color_1, color_2, weight) {
  function d2h(d) { return d.toString(16) }
  function h2d(h) { return parseInt(h, 16) }

  weight = (typeof weight !== 'undefined') ? weight : 50
  let color = '#'

  for (let i = 0; i <= 5; i += 2) {
    const v1 = h2d(color_1.substr(i, 2))
    const v2 = h2d(color_2.substr(i, 2))
    let val = d2h(Math.floor(v2 + (v1 - v2) * (weight / 100.0)))

    while (val.length < 2) { val = '0' + val }
    color += val
  }
  return color
}

export function changeMenuColor(themeColors) {
  const elementStyle = document.documentElement.style
  const colors = Object.keys(themeColors).length > 0 ? themeColors : defaultThemeConfig

  const colorValue = themeColors['--color-primary'].replace(/#/g, '')
  const black = 'ffffff'
  const menuHoverColor = mix(black, colorValue, 96)
  elementStyle.setProperty('--menu-hover', menuHoverColor)

  for (const key in colors) {
    const currentColor = colors[key]

    if (key.includes('--color')) {
      elementStyle.setProperty(key, currentColor)
    }
  }
}
