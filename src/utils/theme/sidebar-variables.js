import color from 'css-color-function'

const sideBarObject = {
  '#30BDF4': {
    '--menu-bg': '#2f4033'
  },
  '#6772E5': {
    '--menu-bg': '#2f4022'
  },
  '#E75A4A': {
    '--menu-bg': '#30bdf4'
  }
}

// str: 十六进制颜色值，n：透明度
export function colorRgba(str, n) {
  // 十六进制颜色值的正则表达式
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  const sColor = str.toLowerCase()
  n = n || 1
  // 十六进制颜色转换为RGB格式
  if (sColor && reg.test(sColor)) {
    const sColorChange = getRgbNum(sColor)
    return 'rgba(' + sColorChange.join(',') + ',' + n + ')'
  } else {
    return sColor
  }
}

// 获取 rgb 颜色值
function getRgbNum(sColor) {
  if (sColor.length === 4) {
    let sColorNew = '#'
    for (let i = 1; i < 4; i += 1) {
      // 补全颜色值 例如：#eee,#fff等
      sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
    }
    sColor = sColorNew
  }
  // 处理六位颜色值
  const sColorChange = []
  for (let i = 1; i < 7; i += 2) {
    // 核心代码，通过parseInt将十六进制转为十进制，parseInt只有一个参数时是默认转为十进制的，第二个参数则是指定转为对应进制
    sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
  }
  return sColorChange
}

export function changeSidebarColor(themeColor) {
  const colors = sideBarObject[themeColor]
  if (colors) {
    for (const key in colors) {
      const currentColor = colors[key]
      // document.documentElement.style.setProperty('--menu-hover', colorRgba(currentColor, 0.1))
      // document.documentElement.style.setProperty('--submenu-bg', colorRgba(currentColor, 0.2))
      // document.documentElement.style.setProperty('--submenu-hover', colorRgba(currentColor, 0.3))
      document.documentElement.style.setProperty('--menu-hover', color(currentColor, 0.1))
      document.documentElement.style.setProperty('--submenu-bg', color(currentColor, 0.2))
      document.documentElement.style.setProperty('--submenu-hover', color(currentColor, 0.3))
      document.documentElement.style.setProperty(key, currentColor)
    }
  }
}
