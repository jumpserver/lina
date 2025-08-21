import { mix } from '@/utils/theme/color'

export const mixColors = () => {
  const documentStyle = document.documentElement.style
  const primary = documentStyle.getPropertyValue('--color-primary')
  const colorValue = primary.replace(/#/g, '')
  const TwoLevelColor = mix(colorValue, 'ffffff', 38)
  const ThreeLevelColor = mix(colorValue, 'ffffff', 20)
  const shadowColor = mix(colorValue, 'ffffff', 1)
  return {
    primary,
    TwoLevelColor,
    ThreeLevelColor,
    shadowColor
  }
}
