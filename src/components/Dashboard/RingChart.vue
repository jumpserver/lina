<template>
  <div>
    <echarts
      ref="echarts"
      :autoresize="true"
      :options="options"
    />
  </div>
</template>

<script>
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'

import Decimal from 'decimal.js'

export default {
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    options() {
      const { total = 0, active = 0, title, color, colors } = this.config
      const activeDecimal = new Decimal(active)
      const totalDecimal = new Decimal(total)

      let percentage = activeDecimal.dividedBy(totalDecimal).times(100)
      percentage = isNaN(percentage) ? 0 : percentage
      percentage = percentage.toFixed(2)

      const formatTitle = (text) => {
        if (!text) return ''
        const maxLength = 25
        const lines = []
        for (let i = 0; i < text.length; i += maxLength) {
          lines.push(text.slice(i, i + maxLength))
        }
        return lines.join('\n')
      }

      return {
        title: [
          {
            text: formatTitle(this.config.chartTitle),
            textStyle: {
              color: '#646A73',
              fontSize: 12,
              lineHeight: 16,
              rich: {
                width: 100,
                overflow: 'break'
              }
            },
            textAlign: 'center',
            left: '48%',
            top: '32%',
            width: 100,
            overflow: 'break'
          },
          {
            left: '48%',
            top: '42%',
            textAlign: 'center',
            text: active,
            textStyle: {
              fontSize: 24,
              color: '#1F2329'
            },
            subtext: this.$t('Proportion') + ' ' + percentage + '%',
            subtextStyle: {
              fontSize: 12,
              color: '#646A73'
            }
          }
        ],
        legend: {
          show: false
        },
        color: colors || [color, 'rgba(43, 147, 124, 0.05)'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {d}%'
        },
        series: [
          {
            name: title,
            type: 'pie',
            minAngle: 5,
            radius: ['72%', '90%'],
            avoidLabelOverlap: false,
            itemStyle: {
              normal: {
                label: {
                  show: false
                },
                labelLine: {
                  show: false
                }

              }
            },
            emphasis: {
              label: {
                show: false
              }
            },
            labelLine: {
              show: false
            },
            startAngle: 180,
            data: this.config.data
          }
        ]
      }
    }
  }
}
</script>
