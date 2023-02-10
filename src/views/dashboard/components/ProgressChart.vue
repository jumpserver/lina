<template>
  <div>
    <echarts
      ref="echarts"
      :options="options"
      :autoresize="true"
      class="disabled-when-print"
    />
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import * as echarts from 'echarts'
import { mix } from '@/utils/theme/color'

export default {
  props: {
    colors: {
      type: Array,
      default: () => {
        const documentStyle = document.documentElement.style
        const themeColor = documentStyle.getPropertyValue('--color-primary')
        const colorValue = themeColor.replace(/#/g, '')
        const subCOlor = mix(colorValue, 'ffffff', 40)
        return [
          themeColor, subCOlor, '#F3B44B', 'rgba(243, 180, 75, 0.5)',
          '#535C65', 'rgba(83, 92, 101, 0.5)', '#29448A', 'rgba(41, 68, 138, 0.5)'
        ]
      }
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
    }
  },
  computed: {
    options() {
      const seriesList = []
      const labels = this.data.map(item => item.label)
      const total = _.sumBy(this.data, function(i) { return i.total })
      for (let i = 0, len = this.data.length; i < len; i++) {
        const current = this.data[i]
        let num = (current.total / total) * 100
        num = _.floor(num, 2)
        const color = '#' + Math.floor(Math.random() * (256 * 256 * 256 - 1)).toString(16)
        seriesList.push({
          type: 'bar',
          stack: 'total',
          barWidth: 32,
          name: current.label,
          itemStyle: {
            borderRadius: 0,
            color: () => {
              return this.colors[i] || color
            }
          },
          data: [num],
          color: () => {
            return this.colors[i] || color
          }
        })
      }
      return {
        legend: {
          left: 'auto',
          icon: 'rect',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            color: '#000',
            lineHeight: 10
          },
          bottom: 30,
          data: labels

        },
        color: [
          {
            colorStops: [
              {
                offset: 0,
                color: '#0176ff'
              },
              {
                offset: 1,
                color: '#0093ff'
              }
            ],
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            type: 'linear',
            global: false
          }, {
            colorStops: [
              {
                offset: 0,
                color: '#9700ff'
              },
              {
                offset: 1,
                color: '#9700ff'
              }
            ],
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            type: 'linear',
            global: false
          }
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          },
          formatter: () => {
            let tip = ''
            for (let i = 0; i < this.data.length; i++) {
              const current = this.data[i]
              tip += current.label + '：' + current.total + '<br/>'
            }
            return tip
          }
        },
        grid: {
          top: '60%',
          containLabel: true,
          bottom: '-10',
          left: '0%',
          right: 1
        },
        series: seriesList,
        xAxis: {
          type: 'value',
          axisLabel: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'category',
          axisTick: {
            show: false
          },
          data: [''],
          axisLabel: {
            show: false
          },
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .echarts {
    width: 100%;
    height: 72px;
  }
</style>
