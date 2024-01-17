<template>
  <div>
    <echarts
      ref="echarts"
      :options="options"
      :autoresize="true"
    />
  </div>
</template>

<script>
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'

export default {
  components: {

  },
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
    }
  },
  computed: {
    options() {
      const { total, active = 0, title, color } = this.config
      const percentage = active === 0 ? 0 : ((active / total) * 100).toFixed(0)
      return {
        title: [
          {
            text: this.config.chartTitle,
            textStyle: {
              color: '#646A73',
              fontSize: 12
            },
            textAlign: 'center',
            left: '48%',
            top: '32%'
          },
          {
            left: '48%',
            top: '42%',
            textAlign: 'center',
            text: active,
            textStyle: {
              fontSize: 24,
              color: '#646A73'
            },
            subtext: this.$t('dashboard.Proportion') + ' ' + percentage + '%',
            subtextStyle: {
              fontSize: 12,
              color: '#646A73'
            }
          }
        ],
        legend: {
          show: false
        },
        color: [color, 'rgba(43, 147, 124, 0.05)'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {d}%'
        },
        series: [
          {
            name: title,
            type: 'pie',
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

<style lang="scss" scoped>
</style>
