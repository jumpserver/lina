
export function randomColorBySeed(s) {
  // 将标签名称转换为哈希值，用作随机种子
  const hash = hashCode(s)

  // 生成随机颜色
  const color = '#' + ('000000' + (hash & 0xffffff).toString(16)).slice(-6)
  // 转换为十六进制颜色
  return color
}

// 辅助函数：将字符串转换为哈希值
// 辅助函数：将字符串转换为哈希值
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (char + (hash << 6) + (hash << 16) - hash) & 0xffffffff
  }
  return hash
}

export function getRandomColor() {
  // 生成随机的红、绿、蓝颜色值
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)

  // 将颜色值转换为十六进制字符串
  const hexR = r.toString(16).padStart(2, '0')
  const hexG = g.toString(16).padStart(2, '0')
  const hexB = b.toString(16).padStart(2, '0')

  // 返回组合后的十六进制颜色代码
  return `#${hexR}${hexG}${hexB}`
}

export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

// 判断颜色是否为深色的函数
export function isDarkness(color) {
  const { r, g, b } = hexToRgb(color)
  // 计算亮度
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b
  return brightness < 128 // 128 是一个经验阈值，可以调整
}
