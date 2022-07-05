import color from 'css-color-function'
import formula from './formula.json'
import themeOptions from './themeOptions.js'
import defaultThemeConfig from './themeConfigs/default.js'

const [defaultThemeConfigKey, defaultThemeConfigValue] = Object.entries(defaultThemeConfig)[0]

export const defaultThemeColor = defaultThemeConfigKey
export const matchColor = {
  classic: '#1ab394',
  chinese_red: '#bd1a2d',
  tech_blue: '#174779',
  deep_black: '#0576b9'
}

export function generateColors(primary) {
  const colors = {}
  const otherColor = themeOptions[primary] || defaultThemeConfigValue || {}

  Object.keys(formula).forEach((key) => {
    let value
    const valueKey = formula[key]
    if (valueKey.includes('primary')) {
      value = valueKey.replace(/primary/g, primary)
    }
    if (valueKey.includes('success')) {
      value = valueKey.replace(/success/g, otherColor['--color-success'])
    }
    if (valueKey.includes('info')) {
      value = valueKey.replace(/info/g, otherColor['--color-info'])
    }
    if (valueKey.includes('warning')) {
      value = valueKey.replace(/warning/g, otherColor['--color-warning'])
    }
    if (valueKey.includes('danger')) {
      value = valueKey.replace(/danger/g, otherColor['--color-danger'])
    }
    if (value) {
      const c = color.convert(value)
      colors[key] = c.indexOf('rgba') > -1 ? c : colorRgbToHex(c)
    }
  })

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

  for (var i = 0; i <= 5; i += 2) {
    const v1 = h2d(color_1.substr(i, 2))
    const v2 = h2d(color_2.substr(i, 2))
    let val = d2h(Math.floor(v2 + (v1 - v2) * (weight / 100.0)))

    while (val.length < 2) { val = '0' + val }

    color += val
  }
  return color
}

export function changeSidebarColor(primary) {
  const colors = themeOptions[primary] || defaultThemeConfigValue || {}
  const elementStyle = document.documentElement.style

  for (const key in colors) {
    const currentColor = colors[key]
    const changeColor = currentColor.replace(/#/g, '')
    elementStyle.setProperty(key, currentColor)
    if (key === '--menu-text') {
      elementStyle.setProperty('--menu-hover', mix('000000', changeColor, 10))
      elementStyle.setProperty('--submenu-bg', mix('000000', changeColor, 20))
      elementStyle.setProperty('--submenu-hover', mix('000000', changeColor, 30))
    }
    elementStyle.setProperty('--color-primary', primary)
  }
}
