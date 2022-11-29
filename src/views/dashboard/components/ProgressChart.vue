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
export default {
  props: {
    colors: {
      type: Array,
      default: () => {
        const documentStyle = document.documentElement.style
        const themeColor = documentStyle.getPropertyValue('--color-primary')
        return [
          themeColor, '#B3D6CE', '#F3B44B', 'rgba(243, 180, 75, 0.5)',
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
      const num = this.data.reduce((a, b) => a + b.total, 0)
      const labels = this.data.map(item => item.label)
      for (let i = 0; i < this.data.length; i++) {
        const current = this.data[i]
        seriesList.push({
          type: 'bar',
          stack: '2',
          barWidth: 32,
          name: current.label,
          itemStyle: {
            borderRadius: 0
          },
          data: [{
            value: ((current.total / num) * 100).toFixed(2),
            itemStyle: {
              color: this.colors[i]
            }
          }],
          color: this.colors[i]
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
            lineHeight: 30
          },
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
            type: 'shadow',
            color: 'red'
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
          top: '0%',
          containLabel: true,
          bottom: '-50%',
          left: '0%',
          right: '0%'
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
