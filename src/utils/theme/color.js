import color from 'css-color-function'
import formula from './formula.json'
import defaultThemeConfig from './default.js'
import store from '@/store/index.js'

export const defaultThemeColor = '#1ab394'
export const matchColor = {}

export function generateColors(primary) {
  const colors = {}
  const themeInfo = store?.getters?.publicSettings?.INTERFACE?.theme_info?.colors || {}
  const otherColor = Object.keys(themeInfo).length > 0 ? themeInfo : defaultThemeConfig

  for (const [key, value] of Object.entries(formula)) {
    let replaceColor
    if (value.includes('primary')) {
      replaceColor = value.replace(/primary/g, primary)
    }
    if (value.includes('success')) {
      replaceColor = value.replace(/success/g, otherColor['--color-success'])
    }
    if (value.includes('info')) {
      replaceColor = value.replace(/info/g, otherColor['--color-info'])
    }
    if (value.includes('warning')) {
      replaceColor = value.replace(/warning/g, otherColor['--color-warning'])
    }
    if (value.includes('danger')) {
      replaceColor = value.replace(/danger/g, otherColor['--color-danger'])
    }
    if (replaceColor) {
      const c = color.convert(replaceColor)
      colors[key] = c.indexOf('rgba') > -1 ? c : colorRgbToHex(c)
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
  const elementStyle = document.documentElement.style
  const themeInfo = store?.getters?.publicSettings?.INTERFACE?.theme_info?.colors || {}
  const colors = Object.keys(themeInfo).length > 0 ? themeInfo : defaultThemeConfig

  for (const key in colors) {
    const currentColor = colors[key]
    const changeColor = currentColor.replace(/#/g, '')
    elementStyle.setProperty(key, currentColor)
    if (key === '--menu-text') {
      elementStyle.setProperty('--menu-hover', mix('000000', changeColor, 10))
      elementStyle.setProperty('--submenu-bg', mix('000000', changeColor, 20))
      elementStyle.setProperty('--submenu-hover', mix('000000', changeColor, 30))
    }
  }
}
