import { getCssVar, mix } from '@/utils/theme/color'

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

export const getReportChartTheme = () => {
  const primary = getCssVar('--color-primary')
  const warning = getCssVar('--color-warning')
  return {
    primary,
    warning,
    textPrimary: getCssVar('--color-text-primary'),
    textSecondary: getCssVar('--color-text-secondary'),
    border: getCssVar('--color-border'),
    palette: [
      primary,
      getCssVar('--color-success'),
      warning,
      getCssVar('--color-icon-primary'),
      getCssVar('--color-info'),
      getCssVar('--color-danger')
    ]
  }
}

export const getDistributionOptions = (data, totalLabel) => {
  const { palette, textPrimary, textSecondary } = getReportChartTheme()
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0)
  return {
    color: palette,
    title: {
      text: total,
      subtext: totalLabel,
      left: '34%',
      top: '38%',
      textAlign: 'center',
      textStyle: {
        color: textPrimary,
        fontSize: 24,
        fontWeight: 400
      },
      subtextStyle: {
        color: textSecondary,
        fontSize: 12
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      appendToBody: true
    },
    legend: {
      orient: 'vertical',
      left: '62%',
      top: 'middle',
      icon: 'rect',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      textStyle: {
        color: textSecondary,
        fontSize: 12
      }
    },
    series: [
      {
        type: 'pie',
        minAngle: 5,
        center: ['34%', '50%'],
        radius: ['54%', '72%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        emphasis: {
          scaleSize: 4,
          label: {
            show: false
          }
        },
        data
      }
    ]
  }
}
