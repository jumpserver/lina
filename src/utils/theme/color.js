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
