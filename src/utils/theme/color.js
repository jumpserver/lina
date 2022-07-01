import color from 'css-color-function'
import formula from './formula.json'

export function generateColors(primary) {
  const colors = {}

  Object.keys(formula).forEach((key) => {
    const value = formula[key].replace(/primary/g, primary)
    const c = color.convert(value)
    colors[key] = c.indexOf('rgba') > -1 ? c : colorRgbToHex(c)
  })

  return colors
}

/* 将rgb颜色转成hex */
export function colorRgbToHex(rgb) {
  const [r, g, b] = rgb.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')

  return '#' + ((1 << 24) + (Number(r) << 16) + (Number(g) << 8) + Number(b)).toString(16).slice(1)
}

const sideBarObject = {
  '#30BDF4': {
    '--menu-bg': '#2f4033'
  },
  '#6772E5': {
    '--menu-bg': '#2f4022'
  },
  '#E75A4A': {
    '--menu-bg': '#cc3829'
  }
}

export function changeSidebarColor(themeColor) {
  const colors = sideBarObject[themeColor]
  const elementStyle = document.documentElement.style
  if (colors) {
    for (const key in colors) {
      const currentColor = colors[key]
      elementStyle.setProperty(key, currentColor)
      elementStyle.setProperty('--theme-color', themeColor)
      elementStyle.setProperty('--menu-hover', color.convert(`color(${currentColor} shade(10%))`))
      elementStyle.setProperty('--submenu-bg', color.convert(`color(${currentColor} shade(20%))`))
      elementStyle.setProperty('--submenu-hover', color.convert(`color(${currentColor} shade(30%))`))
    }
  } else {
    elementStyle.setProperty('--menu-bg', color.convert(`color(${themeColor} shade(30%))`))
    elementStyle.setProperty('--theme-color', themeColor)
    elementStyle.setProperty('--menu-hover', color.convert(`color(${themeColor} shade(10%))`))
    elementStyle.setProperty('--submenu-bg', color.convert(`color(${themeColor} shade(20%))`))
    elementStyle.setProperty('--submenu-hover', color.convert(`color(${themeColor} shade(30%))`))
  }
}
