export function getAssistantFacePrimaryWeight(primaryColor) {
  const hex = String(primaryColor || '')
    .trim()
    .replace(/^#/, '')
  if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) return 65

  const fullHex = hex.length === 3 ? [...hex].map((digit) => digit + digit).join('') : hex
  const channels = [0, 2, 4].map((offset) => {
    const channel = parseInt(fullHex.slice(offset, offset + 2), 16) / 255
    // Linearize sRGB before measuring brightness, including the different contributions of RGB.
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722

  // Keep classic green near 65%; dark colors get more white to separate the face from the eyes.
  return Math.round(Math.min(85, 40 + luminance * 75))
}
