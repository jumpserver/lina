import color from 'css-color-function'
import formula from './formula.json'
import { themeOptions } from './themeOptions.js'

export function generateColors(primary) {
  const colors = {}
  const otherColor = themeOptions[primary]

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

export function changeSidebarColor(themeColor) {
  const colors = themeOptions[themeColor]
  const elementStyle = document.documentElement.style
  if (colors) {
    for (const key in colors) {
      const currentColor = colors[key]
      elementStyle.setProperty(key, currentColor)
      elementStyle.setProperty('--color-primary', themeColor)
    }
  } else {
    elementStyle.setProperty('--menu-bg', color.convert(`color(${themeColor} tint(30%))`))
    elementStyle.setProperty('--color-primary', themeColor)
  }
}
