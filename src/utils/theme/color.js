import color from 'css-color-function'
import formula from './formula.json'
import defaultThemeConfig from '@/styles/default-theme'

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
  function d2h(d) {
    return d.toString(16)
  }

  function h2d(h) {
    return parseInt(h, 16)
  }

  weight = typeof weight !== 'undefined' ? weight : 50
  let color = '#'

  for (let i = 0; i <= 5; i += 2) {
    const v1 = h2d(color_1.substr(i, 2))
    const v2 = h2d(color_2.substr(i, 2))
    let val = d2h(Math.floor(v2 + (v1 - v2) * (weight / 100.0)))

    while (val.length < 2) {
      val = '0' + val
    }
    color += val
  }
  return color
}

export function setRootColors() {
  const themeColors = defaultThemeConfig || {}
  for (const [key, value] of Object.entries(themeColors)) {
    document.documentElement.style.setProperty(key, value)
  }
}

function syncElementPlusColorVars(elementStyle, colorName, currentColor) {
  const white = 'ffffff'
  const black = '000000'
  const elColorKey = `--el-color-${colorName}`

  elementStyle.setProperty(elColorKey, currentColor)
  elementStyle.setProperty(`${elColorKey}-light-3`, mix(white, currentColor.replace(/#/g, ''), 30))
  elementStyle.setProperty(`${elColorKey}-light-5`, mix(white, currentColor.replace(/#/g, ''), 50))
  elementStyle.setProperty(`${elColorKey}-light-7`, mix(white, currentColor.replace(/#/g, ''), 70))
  elementStyle.setProperty(`${elColorKey}-light-8`, mix(white, currentColor.replace(/#/g, ''), 80))
  elementStyle.setProperty(`${elColorKey}-light-9`, mix(white, currentColor.replace(/#/g, ''), 90))
  elementStyle.setProperty(`${elColorKey}-dark-2`, mix(black, currentColor.replace(/#/g, ''), 20))
}

export function changeMenuColor(themeColors) {
  const elementStyle = document.documentElement.style
  const colors = Object.keys(themeColors).length > 0 ? themeColors : defaultThemeConfig

  const white = 'ffffff'
  const black = '000000'

  // 后端不用返回 --menu-hover
  const menuActiveTextColor = colors['--menu-text-active']
  if (menuActiveTextColor) {
    colors['--menu-hover'] = mix(white, menuActiveTextColor.replace(/#/g, ''), 90)
  }

  const lights = [15, 40, 60, 90]
  const darken = [15, 30, 40, 80]

  const colorsGenMore = ['--color-primary']
  for (const key in colors) {
    const currentColor = colors[key]
    elementStyle.setProperty(key, currentColor)

    if (/^--color-(primary|success|info|warning|danger)$/.test(key)) {
      const colorName = key.replace('--color-', '')
      syncElementPlusColorVars(elementStyle, colorName, currentColor)
    }

    if (colorsGenMore.includes(key)) {
      for (const [i, light] of lights.entries()) {
        const color = mix(white, currentColor.replace(/#/g, ''), light)
        elementStyle.setProperty(key + '-light' + '-' + i, color)
      }
      for (const [i, dark] of darken.entries()) {
        const color = mix(black, currentColor.replace(/#/g, ''), dark)
        elementStyle.setProperty(key + '-dark' + '-' + i, color)
      }
    }

    if (key.includes('--color')) {
      const lightColor = mix(white, currentColor.replace(/#/g, ''), 70)
      const darkColor = mix(black, currentColor.replace(/#/g, ''), 70)
      elementStyle.setProperty(key + '-light', lightColor)
      elementStyle.setProperty(key + '-dark', darkColor)
    }
  }
}
