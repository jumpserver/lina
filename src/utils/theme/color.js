import color from 'css-color-function'
import formula from './formula.json'

const sideBarObject = {
  '#1ab394': {
    '--color-success': '#1c84c6',
    '--color-info': '#23c6c8',
    '--color-warning': '#f8ac59',
    '--color-danger': '#ed5565',
    '--menu-bg': '#2f4050',
    '--menu-text': '#a7b1c2',
    '--menu-activeleft': '#1ab394'
  },
  '#ca2e1f': {
    '--color-success': '#E98737',
    '--color-info': '#f06f06',
    '--color-warning': '#f82ed3',
    '--color-danger': '#074bdc',
    '--menu-bg': '#b4312b',
    '--menu-text': '#fff1d9',
    '--menu-activeleft': 'rgb(241, 212, 174)'
  }
}

export function generateColors(primary) {
  const colors = {}
  const otherColor = sideBarObject[primary]

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
  const colors = sideBarObject[themeColor]
  const elementStyle = document.documentElement.style
  if (colors) {
    for (const key in colors) {
      const currentColor = colors[key]
      elementStyle.setProperty(key, currentColor)
      elementStyle.setProperty('--color-primary', themeColor)
      elementStyle.setProperty('--menu-hover', color.convert(`color(${currentColor} shade(10%))`))
      elementStyle.setProperty('--submenu-bg', color.convert(`color(${currentColor} shade(20%))`))
      elementStyle.setProperty('--submenu-hover', color.convert(`color(${currentColor} shade(30%))`))
    }
  } else {
    elementStyle.setProperty('--menu-bg', color.convert(`color(${themeColor} shade(30%))`))
    elementStyle.setProperty('--color-primary', themeColor)
    elementStyle.setProperty('--menu-hover', color.convert(`color(${themeColor} shade(10%))`))
    elementStyle.setProperty('--submenu-bg', color.convert(`color(${themeColor} shade(20%))`))
    elementStyle.setProperty('--submenu-hover', color.convert(`color(${themeColor} shade(30%))`))
  }
}
